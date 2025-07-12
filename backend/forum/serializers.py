from rest_framework import serializers
from .models import Question, Answer
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username']

from rest_framework import serializers
from .models import Question, Tag

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name']

class QuestionSerializer(serializers.ModelSerializer):
    author = serializers.StringRelatedField(read_only=True)
    tags = TagSerializer(many=True, required=False)
    answer_count = serializers.SerializerMethodField()

    class Meta:
        model = Question
        fields = '__all__'

    def get_answer_count(self, obj):
        return obj.answer_set.count()

    def create(self, validated_data):
        tags_data = validated_data.pop('tags', [])
        author = self.context['request'].user  # ✅ get author from context
        question = Question.objects.create(author=author, **validated_data)
        for tag_data in tags_data:
            tag, _ = Tag.objects.get_or_create(name=tag_data['name'])
            question.tags.add(tag)
        return question

    
class AnswerSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    question = serializers.PrimaryKeyRelatedField(queryset=Question.objects.all())

    class Meta:
        model = Answer
        fields = '__all__'
