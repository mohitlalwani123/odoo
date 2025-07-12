from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken
from .models import Question, Answer
from .serializers import QuestionSerializer, AnswerSerializer
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework.generics import RetrieveAPIView

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    email = request.data.get('email')
    password = request.data.get('password')

    if not email or not password:
        return Response({'error': 'Email and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(email=email).exists():
        return Response({'error': 'Email already exists.'}, status=status.HTTP_400_BAD_REQUEST)

    username = email.split('@')[0]  # generate a simple username from email (or random uuid if you prefer)

    user = User.objects.create_user(username=username, email=email, password=password)
    token = Token.objects.create(user=user)

    return Response({'token': token.key}, status=status.HTTP_201_CREATED)

class CustomAuthToken(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response({'error': 'Email and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'error': 'Invalid credentials.'}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(username=user.username, password=password)

        if user is None:
            return Response({'error': 'Invalid credentials.'}, status=status.HTTP_400_BAD_REQUEST)

        token, created = Token.objects.get_or_create(user=user)
        return Response({'token': token.key})

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def questions(request):
    if request.method == 'GET':
        questions = Question.objects.all().order_by('-created_at')
        serializer = QuestionSerializer(questions, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = QuestionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(author=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class QuestionListCreateView(generics.ListCreateAPIView):
    queryset = Question.objects.all().order_by('-created_at')
    serializer_class = QuestionSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated()]
        return [AllowAny()]
    
class QuestionDetailView(RetrieveAPIView):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    lookup_field = 'id'
    
@api_view(['POST'])
def increment_view(request, question_id):
    try:
        question = Question.objects.get(id=question_id)
        question.views += 1
        question.save()
        return Response({'views': question.views}, status=200)
    except Question.DoesNotExist:
        return Response({'error': 'Question not found'}, status=404)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def answers(request, question_id):
    if request.method == 'GET':
        answers = Answer.objects.filter(question_id=question_id)
        serializer = AnswerSerializer(answers, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        data = request.data.copy()
        data['question'] = question_id  # inject question id into request data
        serializer = AnswerSerializer(data=data)
        if serializer.is_valid():
            serializer.save(author=request.user)
            return Response(serializer.data, status=201)
        print(serializer.errors)
        return Response(serializer.errors, status=400)
        
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def vote_question(request, question_id):
    try:
        question = Question.objects.get(id=question_id)
    except Question.DoesNotExist:
        return Response({'error': 'Question not found'}, status=404)

    vote_type = request.data.get('type')
    if vote_type == 'up':
        question.votes += 1
    elif vote_type == 'down':
        question.votes -= 1
    else:
        return Response({'error': 'Invalid vote type'}, status=400)

    question.save()
    return Response({'votes': question.votes}, status=200)