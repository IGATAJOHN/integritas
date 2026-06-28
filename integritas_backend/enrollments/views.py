from rest_framework import status, views, permissions
from rest_framework.response import Response
import uuid
from .models import Enrollment, Transaction
from .serializers import EnrollmentSerializer, TransactionSerializer
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

class AdminEnrollmentsView(views.APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get(self, request):
        enrollments = Enrollment.objects.all()
        return Response(EnrollmentSerializer(enrollments, many=True).data)

