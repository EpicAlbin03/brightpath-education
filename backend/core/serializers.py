from django.contrib.auth import authenticate
from django.contrib.auth.models import Group, User
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Student, Course


def get_user_role(user):
    """Return the effective role string for a user."""
    if user.is_superuser:
        return "superuser"
    if user.groups.filter(name="admin").exists():
        return "admin"
    return "viewer"


class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    email = serializers.EmailField(required=True)

    class Meta:
        model = User
        fields = ("id", "username", "email", "password")

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value.lower()

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
        )
        viewer_group, _ = Group.objects.get_or_create(name="viewer")
        user.groups.add(viewer_group)
        return user


class UserPublicSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ("id", "username", "email", "role", "date_joined")

    def get_role(self, obj):
        return get_user_role(obj)


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    """Partial self-update: username, email, first_name, last_name, and/or password."""
    current_password = serializers.CharField(write_only=True, required=False)
    password = serializers.CharField(write_only=True, min_length=8, required=False)

    class Meta:
        model = User
        fields = ("username", "email", "first_name", "last_name", "current_password", "password")

    def validate_email(self, value):
        user = self.instance
        if User.objects.filter(email__iexact=value).exclude(pk=user.pk).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value.lower()

    def validate_username(self, value):
        user = self.instance
        if User.objects.filter(username=value).exclude(pk=user.pk).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value

    def validate(self, attrs):
        if "password" in attrs:
            current = attrs.pop("current_password", None)
            if not current:
                raise serializers.ValidationError(
                    {"current_password": "Current password is required to set a new password."}
                )
            if not self.instance.check_password(current):
                raise serializers.ValidationError(
                    {"current_password": "Current password is incorrect."}
                )
        elif "current_password" in attrs:
            attrs.pop("current_password")
        return attrs

    def update(self, instance, validated_data):
        new_password = validated_data.pop("password", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if new_password:
            instance.set_password(new_password)
        instance.save()
        return instance


VALID_ROLES = ["viewer", "admin"]


class UserRoleUpdateSerializer(serializers.Serializer):
    role = serializers.ChoiceField(choices=VALID_ROLES)


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Accept email instead of username for login."""
    username_field = "email"

    def validate(self, attrs):
        email = attrs.get("email", "").lower()
        password = attrs.get("password", "")

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            raise serializers.ValidationError({"detail": "No account found with this email."})

        if not user.check_password(password):
            raise serializers.ValidationError({"detail": "Invalid email or password."})

        if not user.is_active:
            raise serializers.ValidationError({"detail": "This account is inactive."})

        refresh = RefreshToken.for_user(user)
        return {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }
    



class CourseSerializer(serializers.ModelSerializer):
    student_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Course
        fields = ['id', 'name', 'code', 'description', 'student_count']


class StudentSerializer(serializers.ModelSerializer):
    # For reading: show full course details in nested format
    # courses = CourseSerializer(many=True, read_only=True)
    course_count = serializers.IntegerField(read_only=True)
    
    # For writing: accept course IDs and map them to courses field
    # course_ids = serializers.PrimaryKeyRelatedField(
    #     queryset=Course.objects.all(),
    #     many=True,
    #     write_only=True,
    #     source='courses',
    #     required=False
    # )

    class Meta:
        model = Student
        fields = ['id', 'name', 'email', 'date_of_birth', 'grade', 'is_active', 'course_count']

    def update(self, instance, validated_data):
        """Handle ManyToMany update for courses"""
        courses = validated_data.pop('courses', None)
        
        # Update regular fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Handle many-to-many courses
        if courses is not None:
            instance.courses.set(courses)
        
        return instance


class StudentCourseEnrollmentSerializer(serializers.Serializer):
    """
    Serializer for enrolling/updating student course enrollment.
    Used for POST /students/{id}/courses/ endpoint.
    Accepts course IDs and sets them (replaces all existing enrollments).
    """
    course_ids = serializers.PrimaryKeyRelatedField(
        queryset=Course.objects.all(),
        many=True,
        required=True,
        help_text="List of course IDs to enroll the student in"
    )

    def create(self, validated_data):
        """Not used - we handle enrollment in the view"""
        pass

    def update(self, instance, validated_data):
        """Update student's course enrollment (SET mode - replaces all)"""
        courses = validated_data.get('course_ids', [])
        instance.courses.set(courses)
        return instance
