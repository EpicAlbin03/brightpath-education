from django.db.models import Count
from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Course, Student
from .views import IsAdminOrSuperUser
from .serializers import (
    CourseSerializer,
    StudentCourseEnrollmentSerializer,
    StudentSerializer,
)

# ──── Student CRUD endpoints (Updated for ManyToMany) ────


class StudentListCreateAPIView(generics.ListCreateAPIView):
    """
    GET /students/ - List all students with their courses
    POST /students/ - Create a new student and enroll in courses
    """

    # queryset = Student.objects.prefetch_related('courses').all()
    queryset = Student.objects.annotate(course_count=Count("courses"))
    serializer_class = StudentSerializer
    permission_classes = [IsAuthenticated]


class StudentRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET /students/{id}/ - Get student detail with courses
    PUT /students/{id}/ - Update student and their courses
    PATCH /students/{id}/ - Partial update
    DELETE /students/{id}/ - Delete student
    """

    serializer_class = StudentSerializer

    def get_permissions(self):
        if self.request.method in ('PUT', 'PATCH', 'DELETE'):
            return [IsAuthenticated(), IsAdminOrSuperUser()]
        return [IsAuthenticated()]

    def get_queryset(self):
        return Student.objects.annotate(course_count=Count("courses")).prefetch_related(
            "courses"
        )


# ──── Student Courses endpoints (NEW - Enrollment Management) ────


class StudentCoursesListAPIView(generics.ListAPIView):
    """
    GET /students/{student_id}/courses/ - List all courses a student is enrolled in
    """

    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        student = get_object_or_404(Student, pk=self.kwargs["student_id"])
        return student.courses.all()


class StudentCoursesEnrollAPIView(generics.GenericAPIView):
    """
    GET /students/{student_id}/courses/ - List all courses a student is enrolled in
    POST /students/{student_id}/courses/ - Enroll student in courses

    Request body:
    {
        "course_ids": [1, 2, 3]  <- IDs of courses to enroll in
    }

    ADD MODE: Adds the provided courses to the student's existing enrollments.
    Example: If student is in courses [1, 2], and we send [5, 7],
             they will now be in [1, 2, 5, 7].
    """

    serializer_class = StudentCourseEnrollmentSerializer
    queryset = Student.objects.prefetch_related("courses").all()
    # permission_classes = [IsAuthenticated]

    def get_object(self):
        return get_object_or_404(Student, pk=self.kwargs["student_id"])

    def get(self, request, *args, **kwargs):
        student = self.get_object()
        serializer = CourseSerializer(student.courses.all(), many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        student = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Enroll student in courses (ADD mode - preserves existing)
        courses = serializer.validated_data.get("course_ids", [])
        student.courses.add(*courses)

        # Return updated student with full details
        student_serializer = StudentSerializer(student, context={"request": request})
        return Response(student_serializer.data, status=status.HTTP_200_OK)


class StudentCourseUnenrollAPIView(generics.GenericAPIView):
    """
    DELETE /students/{student_id}/courses/{course_id}/ - Remove student from a course

    Removes the student from a specific course (idempotent - returns 204 even if not enrolled).
    """

    permission_classes = [IsAuthenticated]

    def delete(self, request, *args, **kwargs):
        student_id = self.kwargs.get("student_id")
        course_id = self.kwargs.get("course_id")

        student = get_object_or_404(Student, pk=student_id)
        course = get_object_or_404(Course, pk=course_id)

        # Remove student from course (idempotent)
        student.courses.remove(course)

        return Response(status=status.HTTP_204_NO_CONTENT)


# ──── Course CRUD endpoints ────


class CourseListCreateAPIView(generics.ListCreateAPIView):
    """
    GET /courses/ - List all courses
    POST /courses/ - Create a new course
    """

    queryset = Course.objects.annotate(student_count=Count("students"))
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]


class CourseRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET /courses/{id}/ - Get course detail
    PUT /courses/{id}/ - Update course
    PATCH /courses/{id}/ - Partial update
    DELETE /courses/{id}/ - Delete course
    """

    serializer_class = CourseSerializer

    def get_permissions(self):
        if self.request.method in ('PUT', 'PATCH', 'DELETE'):
            return [IsAuthenticated(), IsAdminOrSuperUser()]
        return [IsAuthenticated()]

    def get_queryset(self):
        return Course.objects.annotate(
            student_count=Count("students")
        ).prefetch_related("students")


# ──── Course Students endpoints (Updated for ManyToMany) ────


class CourseStudentsListAPIView(generics.ListAPIView):
    """
    GET /courses/{pk}/students/ - List all students enrolled in a course
    """

    serializer_class = StudentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        course = get_object_or_404(Course, pk=self.kwargs["pk"])
        # Use prefetch_related instead of select_related for ManyToMany
        return course.students.prefetch_related("courses").all()
