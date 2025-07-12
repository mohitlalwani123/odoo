from django.urls import path
from . import views
from .views import QuestionListCreateView

urlpatterns = [
    path('register/', views.register),
    path('login/', views.CustomAuthToken.as_view()),
    path('questions/', QuestionListCreateView.as_view(), name='questions'),
    path('questions/<int:question_id>/answers/', views.answers),
    path('questions/<int:id>/', views.QuestionDetailView.as_view()),
    path('questions/<int:question_id>/vote/', views.vote_question),
    path('questions/<int:question_id>/increment_view/', views.increment_view),



]