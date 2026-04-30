from rest_framework import generics, status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Student, Course
from .serializers import StudentSerializer, CourseSerializer, StudentCourseEnrollmentSerializer
from rest_framework.permissions import IsAuthenticated


# ──── Student CRUD endpoints (Updated for ManyToMany) ────

class StudentListCreateAPIView(generics.ListCreateAPIView):
    """
    GET /students/ - List all students with their courses
    POST /students/ - Create a new student and enroll in courses
    """
    queryset = Student.objects.prefetch_related('courses').all()
    serializer_class = StudentSerializer
    #permission_classes = [IsAuthenticated]


class StudentRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET /students/{id}/ - Get student detail with courses
    PUT /students/{id}/ - Update student and their courses
    PATCH /students/{id}/ - Partial update
    DELETE /students/{id}/ - Delete student
    """
    queryset = Student.objects.prefetch_related('courses').all()
    serializer_class = StudentSerializer
    #permission_classes = [IsAuthenticated]


# ──── Student Courses endpoints (NEW - Enrollment Management) ────

class StudentCoursesListAPIView(generics.ListAPIView):
    """
    GET /students/{student_id}/courses/ - List all courses a student is enrolled in
    """
    serializer_class = CourseSerializer
    #permission_classes = [IsAuthenticated]

    def get_queryset(self):
        student = get_object_or_404(Student, pk=self.kwargs["student_id"])
        return student.courses.all()


class StudentCoursesEnrollAPIView(generics.GenericAPIView):
    """
    POST /students/{student_id}/courses/ - Enroll student in courses
    
    Request body:
    {
        "course_ids": [1, 2, 3]  <- IDs of courses to enroll in
    }
    
    SET MODE: Replaces all existing enrollments with the provided courses.
    Example: If student is in courses [1, 2], and we send [5, 7],
             they will now be ONLY in courses [5, 7].
    """
    serializer_class = StudentCourseEnrollmentSerializer
    #permission_classes = [IsAuthenticated]

    def get_object(self):
        return get_object_or_404(Student, pk=self.kwargs["student_id"])

    def post(self, request, *args, **kwargs):
        student = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Enroll student in courses (SET mode - replaces all)
        courses = serializer.validated_data.get('course_ids', [])
        student.courses.set(courses)
        
        # Return updated student with full details
        student_serializer = StudentSerializer(
            student,
            context={'request': request}
        )
        return Response(student_serializer.data, status=status.HTTP_200_OK)


class StudentCourseUnenrollAPIView(generics.GenericAPIView):
    """
    DELETE /students/{student_id}/courses/{course_id}/ - Remove student from a course
    
    Removes the student from a specific course (idempotent - returns 204 even if not enrolled).
    """
    #permission_classes = [IsAuthenticated]

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
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    #permission_classes = [IsAuthenticated]


class CourseRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET /courses/{id}/ - Get course detail
    PUT /courses/{id}/ - Update course
    PATCH /courses/{id}/ - Partial update
    DELETE /courses/{id}/ - Delete course
    """
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    #permission_classes = [IsAuthenticated]


# ──── Course Students endpoints (Updated for ManyToMany) ────

class CourseStudentsListAPIView(generics.ListAPIView):
    """
    GET /courses/{pk}/students/ - List all students enrolled in a course
    """
    serializer_class = StudentSerializer
    #permission_classes = [IsAuthenticated]

    def get_queryset(self):
        course = get_object_or_404(Course, pk=self.kwargs["pk"])
        # Use prefetch_related instead of select_related for ManyToMany
        return course.students.prefetch_related('courses').all()