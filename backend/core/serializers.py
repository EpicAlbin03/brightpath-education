from django.contrib.auth.models import Group, User
from django.db.models import Count
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Course, Student


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
        fields = (
            "username",
            "email",
            "first_name",
            "last_name",
            "current_password",
            "password",
        )

    def validate_email(self, value):
        user = self.instance
        if User.objects.filter(email__iexact=value).exclude(pk=user.pk).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value.lower()

    def validate_username(self, value):
        user = self.instance
        if User.objects.filter(username=value).exclude(pk=user.pk).exists():
            raise serializers.ValidationError(
                "A user with this username already exists."
            )
        return value

    def validate(self, attrs):
        if "password" in attrs:
            current = attrs.pop("current_password", None)
            if not current:
                raise serializers.ValidationError(
                    {
                        "current_password": "Current password is required to set a new password."
                    }
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


class UserAdminSerializer(serializers.ModelSerializer):
    """Full user record for superuser management views."""
    role = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ("id", "username", "email", "role", "is_active", "date_joined")

    def get_role(self, obj):
        return get_user_role(obj)


ADMIN_VALID_ROLES = ["viewer", "admin", "superuser"]


class UserAdminUpdateSerializer(serializers.ModelSerializer):
    """Allow superuser to update username and role only."""
    role = serializers.ChoiceField(choices=ADMIN_VALID_ROLES)

    class Meta:
        model = User
        fields = ("username", "role")

    def validate_username(self, value):
        user = self.instance
        if User.objects.filter(username=value).exclude(pk=user.pk).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value

    def update(self, instance, validated_data):
        new_role = validated_data.pop("role", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if new_role is not None:
            viewer_group, _ = Group.objects.get_or_create(name="viewer")
            admin_group, _ = Group.objects.get_or_create(name="admin")
            if new_role == "superuser":
                instance.groups.clear()
                instance.is_staff = True
                instance.is_superuser = True
            elif new_role == "admin":
                instance.groups.set([admin_group])
                instance.is_staff = True
                instance.is_superuser = False
            else:
                instance.groups.set([viewer_group])
                instance.is_staff = False
                instance.is_superuser = False

        instance.save()
        return instance


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Accept email instead of username for login."""

    username_field = "email"

    def validate(self, attrs):
        email = attrs.get("email", "").lower()
        password = attrs.get("password", "")

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            raise serializers.ValidationError(
                {"detail": "No account found with this email."}
            )

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
    students = serializers.SerializerMethodField(read_only=True)
    student_ids = serializers.PrimaryKeyRelatedField(
        queryset=Student.objects.all(),
        many=True,
        write_only=True,
        source="students",
        required=False,
    )

    def get_fields(self):
        fields = super().get_fields()
        request = self.context.get("request")
        include_values = set()
        if request is not None:
            include_values = {
                value.strip().lower()
                for value in request.query_params.get("include", "").split(",")
                if value.strip()
            }
        if "students" not in include_values:
            fields.pop("students", None)
        return fields

    def get_students(self, obj):
        students = obj.students.annotate(course_count=Count("courses")).all()
        return StudentSerializer(students, many=True, context=self.context).data

    class Meta:
        model = Course
        fields = [
            "id",
            "name",
            "code",
            "description",
            "student_count",
            "students",
            "student_ids",
        ]

    def create(self, validated_data):
        students = validated_data.pop("students", [])
        course = Course.objects.create(**validated_data)
        if students:
            course.students.set(students)
        return course

    def update(self, instance, validated_data):
        students = validated_data.pop("students", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if students is not None:
            instance.students.set(students)

        return instance


class StudentSerializer(serializers.ModelSerializer):
    course_count = serializers.IntegerField(read_only=True)
    courses = serializers.SerializerMethodField(read_only=True)
    course_ids = serializers.PrimaryKeyRelatedField(
        queryset=Course.objects.all(),
        many=True,
        write_only=True,
        source="courses",
        required=False,
    )

    def get_fields(self):
        fields = super().get_fields()
        request = self.context.get("request")
        include_values = set()
        if request is not None:
            include_values = {
                value.strip().lower()
                for value in request.query_params.get("include", "").split(",")
                if value.strip()
            }
        if "courses" not in include_values:
            fields.pop("courses", None)
        return fields

    def get_courses(self, obj):
        courses = obj.courses.annotate(student_count=Count("students")).all()
        return CourseSerializer(courses, many=True, context=self.context).data

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
        fields = [
            "id",
            "name",
            "email",
            "date_of_birth",
            "grade",
            "is_active",
            "course_count",
            "courses",
            "course_ids",
        ]

    def create(self, validated_data):
        courses = validated_data.pop("courses", [])
        student = Student.objects.create(**validated_data)
        if courses:
            student.courses.set(courses)
        return student

    def update(self, instance, validated_data):
        """Handle ManyToMany update for courses"""
        courses = validated_data.pop("courses", None)

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
        help_text="List of course IDs to enroll the student in",
    )

    def create(self, validated_data):
        """Not used - we handle enrollment in the view"""
        pass

    def update(self, instance, validated_data):
        """Update student's course enrollment (SET mode - replaces all)"""
        courses = validated_data.get("course_ids", [])
        instance.courses.set(courses)
        return instance
