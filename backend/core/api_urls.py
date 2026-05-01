# /auth/login - /auth/token
# /auth/register
# /auth/logout
# /auth/refresh - /auth/token/refresh

# /students/
# /students/<id>/
# /students/<id>/courses/          (NEW)
# /students/<id>/courses/<cid>/    (NEW)

# /courses/
# /courses/<id>/
# /courses/<id>/students/
from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .serializers import EmailTokenObtainPairSerializer
from .api_views import (
    StudentListCreateAPIView,
    StudentRetrieveUpdateDestroyAPIView,
    StudentCoursesEnrollAPIView,
    StudentCourseUnenrollAPIView,
    CourseListCreateAPIView,
    CourseRetrieveUpdateDestroyAPIView,
    CourseStudentsListAPIView
)
from .views import GoogleLoginView, MeView, RegisterView


class EmailTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer

urlpatterns = [

    # API auth endpoints (mirrors core.urls auth routes)
    path('auth/register/', RegisterView.as_view(), name='api-auth-register'),
    path('auth/login/', EmailTokenObtainPairView.as_view(), name='api-auth-login'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='api-auth-refresh'),
    path('auth/me/', MeView.as_view(), name='api-auth-me'),
    path('auth/google/', GoogleLoginView.as_view(), name='api-auth-google'),

    # JWT Authentication endpoints
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    
    

    # API endpoints for Student model (CRUD)
    path('students/', StudentListCreateAPIView.as_view(), name='student-list-create'),
    path('students/<int:pk>/', StudentRetrieveUpdateDestroyAPIView.as_view(), name='student-retrieve-update-destroy'),

    # NEW: Student Course Enrollment endpoints
    path('students/<int:student_id>/courses/', StudentCoursesEnrollAPIView.as_view(), name='student-courses'),
    path('students/<int:student_id>/courses/<int:course_id>/', StudentCourseUnenrollAPIView.as_view(), name='student-course-unenroll'),

    # API endpoints for Course model (CRUD)
    path('courses/', CourseListCreateAPIView.as_view(), name='course-list-create'),
    path('courses/<int:pk>/', CourseRetrieveUpdateDestroyAPIView.as_view(), name='course-retrieve-update-destroy'),

    # Course Students endpoint - list students in a specific course
    path('courses/<int:pk>/students/', CourseStudentsListAPIView.as_view(), name='course-students-list'),
]