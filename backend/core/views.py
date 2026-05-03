import re

from django.conf import settings
from django.contrib.auth.models import Group, User
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token as google_id_token
from rest_framework import status
from rest_framework.permissions import BasePermission, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Course, Student
from .serializers import (
    CourseSerializer,
    StudentSerializer,
    UserAdminSerializer,
    UserAdminUpdateSerializer,
    UserProfileUpdateSerializer,
    UserPublicSerializer,
    UserRegisterSerializer,
    UserRoleUpdateSerializer,
)


class IsSuperUser(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_superuser)


def _generate_username(base):
    """Derive a unique username from a base string (e.g. display name or email prefix)."""
    base = re.sub(r"[^\w]", "_", base).lower()[:30]
    username = base
    counter = 1
    while User.objects.filter(username=username).exists():
        username = f"{base}_{counter}"
        counter += 1
    return username


class GoogleLoginView(APIView):
    """
    POST /api/auth/google/
    Accepts a Google ID token from the frontend (Google Identity Services).
    Verifies it server-side, then finds or creates the user and returns JWT tokens.
    New users are automatically assigned the viewer role.
    """
    permission_classes = []

    def post(self, request):
        id_token = request.data.get("id_token")
        if not id_token:
            return Response(
                {"detail": "id_token is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        client_id = settings.GOOGLE_CLIENT_ID
        if not client_id:
            return Response(
                {"detail": "Google SSO is not configured on this server."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        try:
            payload = google_id_token.verify_oauth2_token(
                id_token, google_requests.Request(), client_id
            )
        except ValueError:
            return Response(
                {"detail": "Invalid or expired Google token."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        email = payload.get("email", "").lower()
        if not email:
            return Response(
                {"detail": "Google account has no email address."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            username = _generate_username(
                payload.get("name", email.split("@")[0])
            )
            user = User(
                username=username,
                email=email,
                first_name=payload.get("given_name", ""),
                last_name=payload.get("family_name", ""),
            )
            user.set_unusable_password()
            user.save()
            viewer_group, _ = Group.objects.get_or_create(name="viewer")
            user.groups.add(viewer_group)

        if not user.is_active:
            return Response(
                {"detail": "This account has been deactivated."},
                status=status.HTTP_403_FORBIDDEN,
            )

        refresh = RefreshToken.for_user(user)
        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": UserPublicSerializer(user).data,
        })


class RegisterView(APIView):
    """Public endpoint — register a new user as viewer."""
    permission_classes = []

    def post(self, request):
        serializer = UserRegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(UserPublicSerializer(user).data, status=status.HTTP_201_CREATED)


class MeView(APIView):
    """Get or update the authenticated user's own profile."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserPublicSerializer(request.user).data)

    def patch(self, request):
        serializer = UserProfileUpdateSerializer(
            request.user, data=request.data, partial=True
        )
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(UserPublicSerializer(user).data)


class UserRoleUpdateView(APIView):
    """
    PATCH /api/users/{pk}/role/
    Superuser-only: change a user's role to viewer or admin.
    Assigning admin also sets is_staff=True on the target user.
    """
    permission_classes = [IsSuperUser]

    def patch(self, request, pk):
        try:
            target_user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        if target_user.is_superuser:
            return Response(
                {"detail": "Cannot change the role of a superuser."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = UserRoleUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        new_role = serializer.validated_data["role"]

        viewer_group, _ = Group.objects.get_or_create(name="viewer")
        admin_group, _ = Group.objects.get_or_create(name="admin")

        if new_role == "admin":
            target_user.groups.set([admin_group])
            target_user.is_staff = True
        else:  # viewer
            target_user.groups.set([viewer_group])
            target_user.is_staff = False

        target_user.save()
        return Response(UserPublicSerializer(target_user).data)


class IsAdminOrSuperUser(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True
        return request.user.groups.filter(name="admin").exists()


class StudentListView(APIView):
    """
    GET  /api/students/        — all authenticated users
    POST /api/students/        — admin and superuser only
    """
    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAuthenticated(), IsAdminOrSuperUser()]
        return [IsAuthenticated()]

    def get(self, request):
        students = Student.objects.all()
        serializer = StudentSerializer(students, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = StudentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class StudentDetailView(APIView):
    """
    GET    /api/students/{id}/  — all authenticated users
    PATCH  /api/students/{id}/  — admin and superuser only
    DELETE /api/students/{id}/  — admin and superuser only
    """
    def get_permissions(self):
        if self.request.method in ("PATCH", "DELETE"):
            return [IsAuthenticated(), IsAdminOrSuperUser()]
        return [IsAuthenticated()]

    def _get_student(self, pk):
        try:
            return Student.objects.get(pk=pk)
        except Student.DoesNotExist:
            return None

    def get(self, request, pk):
        student = self._get_student(pk)
        if not student:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(StudentSerializer(student).data)

    def patch(self, request, pk):
        student = self._get_student(pk)
        if not student:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = StudentSerializer(student, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, pk):
        student = self._get_student(pk)
        if not student:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        student.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class CourseListView(APIView):
    """
    GET  /api/courses/  — all authenticated users
    POST /api/courses/  — admin and superuser only
    """
    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAuthenticated(), IsAdminOrSuperUser()]
        return [IsAuthenticated()]

    def get(self, request):
        courses = Course.objects.all()
        serializer = CourseSerializer(courses, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = CourseSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class CourseDetailView(APIView):
    """
    GET    /api/courses/{id}/  — all authenticated users
    PATCH  /api/courses/{id}/  — admin and superuser only
    DELETE /api/courses/{id}/  — admin and superuser only
    """
    def get_permissions(self):
        if self.request.method in ("PATCH", "DELETE"):
            return [IsAuthenticated(), IsAdminOrSuperUser()]
        return [IsAuthenticated()]

    def _get_course(self, pk):
        try:
            return Course.objects.get(pk=pk)
        except Course.DoesNotExist:
            return None

    def get(self, request, pk):
        course = self._get_course(pk)
        if not course:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(CourseSerializer(course).data)

    def patch(self, request, pk):
        course = self._get_course(pk)
        if not course:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = CourseSerializer(course, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, pk):
        course = self._get_course(pk)
        if not course:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        course.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ──── User Management (superuser only) ────

class UserListView(APIView):
    """GET /api/users/ — list all users (superuser only)."""
    permission_classes = [IsSuperUser]

    def get(self, request):
        users = User.objects.all().order_by("id")
        return Response(UserAdminSerializer(users, many=True).data)


class UserDetailView(APIView):
    """GET / PATCH / DELETE /api/users/{pk}/ — superuser only."""
    permission_classes = [IsSuperUser]

    def _get_user(self, pk):
        try:
            return User.objects.get(pk=pk)
        except User.DoesNotExist:
            return None

    def get(self, request, pk):
        target = self._get_user(pk)
        if not target:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(UserAdminSerializer(target).data)

    def patch(self, request, pk):
        target = self._get_user(pk)
        if not target:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)
        if target.pk == request.user.pk:
            return Response(
                {"detail": "You cannot modify your own account here."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        serializer = UserAdminUpdateSerializer(target, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(UserAdminSerializer(user).data)

    def delete(self, request, pk):
        target = self._get_user(pk)
        if not target:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)
        if target.pk == request.user.pk:
            return Response(
                {"detail": "You cannot delete your own account."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if target.is_superuser:
            return Response(
                {"detail": "Cannot delete a superuser account."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        target.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class UserDeactivateView(APIView):
    """POST /api/users/{pk}/deactivate/ — superuser only."""
    permission_classes = [IsSuperUser]

    def post(self, request, pk):
        try:
            target = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)
        if target.pk == request.user.pk:
            return Response(
                {"detail": "You cannot deactivate your own account."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if target.is_superuser:
            return Response(
                {"detail": "Cannot deactivate a superuser account."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        target.is_active = False
        target.set_unusable_password()
        target.save()
        return Response(UserAdminSerializer(target).data)


class UserActivateView(APIView):
    """POST /api/users/{pk}/activate/ — superuser only."""
    permission_classes = [IsSuperUser]

    def post(self, request, pk):
        try:
            target = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)
        target.is_active = True
        target.set_password("newpassword123")
        target.save()
        return Response(UserAdminSerializer(target).data)

