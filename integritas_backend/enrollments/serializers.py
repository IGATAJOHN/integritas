from rest_framework import serializers
from .models import Enrollment, Transaction, RefundRequest
from courses.serializers import CourseSerializer
from authentication.serializers import UserSerializer

class EnrollmentSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True)
    user = UserSerializer(read_only=True)

    class Meta:
        model = Enrollment
        fields = ['id', 'user', 'course', 'status', 'enrolled_at']

class TransactionSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True)
    user = UserSerializer(read_only=True)

    class Meta:
        model = Transaction
        fields = ['id', 'user', 'course', 'reference', 'payment_method', 'status', 'amount', 'created_at']

class RefundRequestSerializer(serializers.ModelSerializer):
    transaction = TransactionSerializer(read_only=True)

    class Meta:
        model = RefundRequest
        fields = ['id', 'transaction', 'reason', 'status', 'notes', 'created_at', 'updated_at']


