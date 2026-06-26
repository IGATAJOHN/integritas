from rest_framework import serializers
from .models import Quiz, Question, Option, Attempt

class OptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Option
        fields = ['id', 'text', 'is_correct']

class QuestionSerializer(serializers.ModelSerializer):
    options = OptionSerializer(many=True, required=False)

    class Meta:
        model = Question
        fields = ['id', 'text', 'points', 'options']

    def create(self, validated_data):
        options_data = validated_data.pop('options', [])
        question = Question.objects.create(**validated_data)
        for option_data in options_data:
            Option.objects.create(question=question, **option_data)
        return question

class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Quiz
        fields = ['id', 'lesson', 'passing_score', 'questions']

class AttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attempt
        fields = ['id', 'user', 'quiz', 'score', 'passed', 'created_at']
        read_only_fields = ['user', 'score', 'passed', 'created_at']
