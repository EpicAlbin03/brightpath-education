from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.views import TokenObtainPairView

from .serializers import EmailTokenObtainPairSerializer
from .views import GoogleLoginView, MeView, RegisterView, UserRoleUpdateView


class EmailTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer


urlpatterns = [
    # Auth
    path("auth/register/", RegisterView.as_view(), name="auth-register"),
    path("auth/login/", EmailTokenObtainPairView.as_view(), name="auth-login"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="auth-refresh"),
    path("auth/me/", MeView.as_view(), name="auth-me"),  # GET + PATCH
    path("auth/google/", GoogleLoginView.as_view(), name="auth-google"),

    # User management (superuser only)
    path("users/<int:pk>/role/", UserRoleUpdateView.as_view(), name="user-role-update"),
]
