from rest_framework import status, views, permissions
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
import uuid
import requests
from django.conf import settings
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
            
        paystack_key = getattr(settings, 'PAYSTACK_SECRET_KEY', None)
        if not paystack_key:
            return Response(
                {'message': 'Paystack payment gateway is not configured on the server. Please set PAYSTACK_SECRET_KEY.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            
        callback_url = request.data.get('callback_url')
        if not callback_url:
            callback_url = f"{request.scheme}://{request.get_host()}/enrolment/return"
            
        paystack_url = "https://api.paystack.co/transaction/initialize"
        headers = {
            "Authorization": f"Bearer {paystack_key}",
            "Content-Type": "application/json"
        }
        # Paystack amount is in kobo (price * 100)
        payload = {
            "email": request.user.email,
            "amount": int(course.price * 100),
            "reference": reference,
            "callback_url": callback_url
        }
        
        try:
            res = requests.post(paystack_url, json=payload, headers=headers, timeout=15)
            res_data = res.json()
            if res.status_code == 200 and res_data.get('status') is True:
                authorization_url = res_data['data']['authorization_url']
                
                # Save transaction locally in pending status
                Transaction.objects.create(
                    user=request.user,
                    course=course,
                    reference=reference,
                    payment_method='card',
                    amount=course.price,
                    status='pending'
                )
                return Response({
                    'authorization_url': authorization_url,
                    'reference': reference
                }, status=status.HTTP_200_OK)
            else:
                error_msg = res_data.get('message', 'Unknown Paystack error')
                return Response(
                    {'message': f'Failed to initialize Paystack transaction: {error_msg}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except Exception as e:
            return Response(
                {'message': f'Connection to Paystack failed: {str(e)}'},
                status=status.HTTP_502_BAD_GATEWAY
            )

class VerifyEnrollmentView(views.APIView):
    def post(self, request):
        reference = request.data.get('reference')
        try:
            transaction = Transaction.objects.get(reference=reference)
        except Transaction.DoesNotExist:
            return Response({'message': 'Transaction not found'}, status=status.HTTP_404_NOT_FOUND)
            
        if transaction.status == 'success':
            enrollment, _ = Enrollment.objects.update_or_create(
                user=transaction.user,
                course=transaction.course,
                defaults={'status': 'active'}
            )
            return Response({
                'status': 'success',
                'enrolment': EnrollmentSerializer(enrollment).data
            }, status=status.HTTP_200_OK)
            
        paystack_key = getattr(settings, 'PAYSTACK_SECRET_KEY', None)
        if not paystack_key:
            return Response(
                {'message': 'Paystack payment gateway is not configured on the server. Please set PAYSTACK_SECRET_KEY.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            
        paystack_url = f"https://api.paystack.co/transaction/verify/{reference}"
        headers = {
            "Authorization": f"Bearer {paystack_key}"
        }
        
        try:
            res = requests.get(paystack_url, headers=headers, timeout=15)
            res_data = res.json()
            if res.status_code == 200 and res_data.get('status') is True:
                paystack_status = res_data['data']['status']
                if paystack_status == 'success':
                    transaction.status = 'success'
                    transaction.save()
                    
                    enrollment, _ = Enrollment.objects.update_or_create(
                        user=transaction.user,
                        course=transaction.course,
                        defaults={'status': 'active'}
                    )
                    return Response({
                        'status': 'success',
                        'enrolment': EnrollmentSerializer(enrollment).data
                    }, status=status.HTTP_200_OK)
                elif paystack_status in ['failed', 'abandoned']:
                    transaction.status = 'failed'
                    transaction.save()
                    return Response({
                        'status': 'failed',
                        'message': f'Payment was not completed. Status: {paystack_status}'
                    }, status=status.HTTP_400_BAD_REQUEST)
                else:
                    return Response({
                        'status': 'pending',
                        'message': 'Payment is still pending verification.'
                    }, status=status.HTTP_200_OK)
            else:
                error_msg = res_data.get('message', 'Verification failed')
                return Response(
                    {'message': f'Paystack verification error: {error_msg}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except Exception as e:
            return Response(
                {'message': f'Connection to Paystack failed: {str(e)}'},
                status=status.HTTP_502_BAD_GATEWAY
            )

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



