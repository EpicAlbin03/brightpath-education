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

from .api_views import (
    CourseListCreateAPIView,
    CourseRetrieveUpdateDestroyAPIView,
    CourseStudentsListAPIView,
    StudentCoursesEnrollAPIView,
    StudentCourseUnenrollAPIView,
    StudentListCreateAPIView,
    StudentRetrieveUpdateDestroyAPIView,
)
from .serializers import (
    ActiveUserTokenRefreshSerializer,
    EmailTokenObtainPairSerializer,
)
from .views import (
    GoogleLoginView,
    MeSettingsView,
    MeView,
    RegisterView,
    UserActivateView,
    UserDeactivateView,
    UserDetailView,
    UserListView,
)


class EmailTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer


class ActiveUserTokenRefreshView(TokenRefreshView):
    serializer_class = ActiveUserTokenRefreshSerializer


urlpatterns = [
    # API auth endpoints (mirrors core.urls auth routes)
    path("auth/register/", RegisterView.as_view(), name="api-auth-register"),
    path("auth/login/", EmailTokenObtainPairView.as_view(), name="api-auth-login"),
    path(
        "auth/refresh/", ActiveUserTokenRefreshView.as_view(), name="api-auth-refresh"
    ),
    path("auth/me/", MeView.as_view(), name="api-auth-me"),
    path("auth/me/settings/", MeSettingsView.as_view(), name="api-auth-me-settings"),
    path("auth/google/", GoogleLoginView.as_view(), name="api-auth-google"),
    # JWT Authentication endpoints
    path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    # API endpoints for Student model (CRUD)
    path("students/", StudentListCreateAPIView.as_view(), name="student-list-create"),
    path(
        "students/<int:pk>/",
        StudentRetrieveUpdateDestroyAPIView.as_view(),
        name="student-retrieve-update-destroy",
    ),
    # NEW: Student Course Enrollment endpoints
    path(
        "students/<int:student_id>/courses/",
        StudentCoursesEnrollAPIView.as_view(),
        name="student-courses",
    ),
    path(
        "students/<int:student_id>/courses/<int:course_id>/",
        StudentCourseUnenrollAPIView.as_view(),
        name="student-course-unenroll",
    ),
    # API endpoints for Course model (CRUD)
    path("courses/", CourseListCreateAPIView.as_view(), name="course-list-create"),
    path(
        "courses/<int:pk>/",
        CourseRetrieveUpdateDestroyAPIView.as_view(),
        name="course-retrieve-update-destroy",
    ),
    # Course Students endpoint - list students in a specific course
    path(
        "courses/<int:pk>/students/",
        CourseStudentsListAPIView.as_view(),
        name="course-students-list",
    ),
    # User Management endpoints (superuser only)
    path("users/", UserListView.as_view(), name="user-list"),
    path("users/<int:pk>/", UserDetailView.as_view(), name="user-detail"),
    path(
        "users/<int:pk>/deactivate/",
        UserDeactivateView.as_view(),
        name="user-deactivate",
    ),
    path("users/<int:pk>/activate/", UserActivateView.as_view(), name="user-activate"),
]
