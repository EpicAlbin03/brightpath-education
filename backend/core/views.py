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

from .serializers import UserProfileUpdateSerializer, UserPublicSerializer, UserRegisterSerializer, UserRoleUpdateSerializer


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
