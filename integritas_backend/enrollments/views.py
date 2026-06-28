from rest_framework import status, views, permissions
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
import uuid
from .models import Enrollment, Transaction, RefundRequest
from .serializers import EnrollmentSerializer, TransactionSerializer, RefundRequestSerializer
from courses.models import Course

class InitiateEnrollmentView(views.APIView):
    def post(self, request):
        course_slug = request.data.get('course_slug')
        try:
            course = Course.objects.get(slug=course_slug)
        except Course.DoesNotExist:
            return Response({'message': 'Course not found'}, status=status.HTTP_404_NOT_FOUND)
        
        existing = Enrollment.objects.filter(user=request.user, course=course).first()
        if existing and existing.status == 'active':
            return Response(EnrollmentSerializer(existing).data)
            
        reference = f"INT-{uuid.uuid4().hex[:12].upper()}"
        
        if course.price <= 0:
            enrollment, _ = Enrollment.objects.update_or_create(
                user=request.user,
                course=course,
                defaults={'status': 'active'}
            )
            return Response(EnrollmentSerializer(enrollment).data, status=status.HTTP_201_CREATED)
            
        transaction = Transaction.objects.create(
            user=request.user,
            course=course,
            reference=reference,
            payment_method='card',
            amount=course.price,
            status='pending'
        )
        
        authorization_url = f"https://checkout.paystack.com/{reference}"
        
        return Response({
            'authorization_url': authorization_url,
            'reference': reference
        }, status=status.HTTP_200_OK)

class VerifyEnrollmentView(views.APIView):
    def post(self, request):
        reference = request.data.get('reference')
        try:
            transaction = Transaction.objects.get(reference=reference)
        except Transaction.DoesNotExist:
            return Response({'message': 'Transaction not found'}, status=status.HTTP_404_NOT_FOUND)
            
        transaction.status = 'success'
        transaction.save()
        
        enrollment, _ = Enrollment.objects.update_or_create(
            user=transaction.user,
            course=transaction.course,
            defaults={'status': 'active'}
        )
        if enrollment.status != 'active':
            enrollment.status = 'active'
            enrollment.save()
            
        return Response({
            'status': 'success',
            'enrolment': EnrollmentSerializer(enrollment).data
        })

class MyEnrollmentsView(views.APIView):
    def get(self, request):
        enrollments = Enrollment.objects.filter(user=request.user)
        return Response(EnrollmentSerializer(enrollments, many=True).data)

class MyTransactionsView(views.APIView):
    def get(self, request):
        transactions = Transaction.objects.filter(user=request.user)
        return Response(TransactionSerializer(transactions, many=True).data)

class ExpertCourseEnrolView(views.APIView):
    """
    POST /learner/expert-courses/{slug}/enrol
    Immediately enrols an authenticated learner in a free expert / experta course.
    Returns the resulting enrolment object.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, course_slug):
        try:
            course = Course.objects.get(slug=course_slug, track='experta')
        except Course.DoesNotExist:
            return Response({'message': 'Course not found'}, status=status.HTTP_404_NOT_FOUND)

        if course.price > 0:
            return Response(
                {'message': 'This course requires payment. Use the standard enrolment flow.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        enrollment, created = Enrollment.objects.update_or_create(
            user=request.user,
            course=course,
            defaults={'status': 'active'}
        )

        return Response(EnrollmentSerializer(enrollment).data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class AdminEnrollmentsView(views.APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get(self, request):
        enrollments = Enrollment.objects.all()
        return Response(EnrollmentSerializer(enrollments, many=True).data)

class AdminTransactionsView(views.APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        status_filter = request.query_params.get('status')
        queryset = Transaction.objects.all().order_by('-created_at')
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
            
        per_page = int(request.query_params.get('per_page', 20))
        page = int(request.query_params.get('page', 1))
        
        total = queryset.count()
        start = (page - 1) * per_page
        end = start + per_page
        sliced = queryset[start:end]
        
        serializer = TransactionSerializer(sliced, many=True)
        data = serializer.data
        for item in data:
            item['type'] = 'Payment'
            
        return Response({
            'data': data,
            'meta': {
                'total': total,
                'page': page,
                'per_page': per_page
            }
        })

class AdminTransactionDetailView(views.APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request, transaction_id):
        tx = get_object_or_404(Transaction, id=transaction_id)
        data = TransactionSerializer(tx).data
        data['type'] = 'Payment'
        return Response(data)

class AdminTransactionManualRefundView(views.APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, transaction_id):
        tx = get_object_or_404(Transaction, id=transaction_id)
        
        # Update transaction status to failed
        tx.status = 'failed'
        tx.save()
        
        Enrollment.objects.filter(user=tx.user, course=tx.course).update(status='cancelled')
        
        data = TransactionSerializer(tx).data
        data['type'] = 'Payment'
        return Response(data)

class SupportTransactionFlagRefundView(views.APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, transaction_id):
        tx = get_object_or_404(Transaction, id=transaction_id)
        reason = request.data.get('reason', 'Flagged for refund')
        
        tx.status = 'refund_requested'
        tx.save()
        
        req = RefundRequest.objects.create(
            transaction=tx,
            reason=reason,
            status='pending'
        )
        
        return Response(RefundRequestSerializer(req).data, status=status.HTTP_201_CREATED)

class AdminRefundRequestsListView(views.APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        status_filter = request.query_params.get('status')
        queryset = RefundRequest.objects.all().order_by('-created_at')
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
            
        per_page = int(request.query_params.get('per_page', 20))
        page = int(request.query_params.get('page', 1))
        
        total = queryset.count()
        start = (page - 1) * per_page
        end = start + per_page
        sliced = queryset[start:end]
        
        serializer = RefundRequestSerializer(sliced, many=True)
        return Response({
            'data': serializer.data,
            'meta': {
                'total': total,
                'page': page,
                'per_page': per_page
            }
        })

class AdminRefundRequestApproveView(views.APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, request_id):
        req = get_object_or_404(RefundRequest, id=request_id)
        notes = request.data.get('notes', '')
        
        req.status = 'approved'
        req.notes = notes
        req.save()
        
        tx = req.transaction
        tx.status = 'failed'
        tx.save()
        
        Enrollment.objects.filter(user=tx.user, course=tx.course).update(status='cancelled')
        
        return Response(RefundRequestSerializer(req).data)

class AdminRefundRequestRejectView(views.APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, request_id):
        req = get_object_or_404(RefundRequest, id=request_id)
        notes = request.data.get('notes', '')
        
        req.status = 'rejected'
        req.notes = notes
        req.save()
        
        tx = req.transaction
        tx.status = 'success'
        tx.save()
        
        return Response(RefundRequestSerializer(req).data)



