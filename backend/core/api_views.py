from rest_framework import generics
from django.shortcuts import get_object_or_404
from .models import Student, Course
from .serializers import StudentSerializer, CourseSerializer
from rest_framework.permissions import IsAuthenticated


# ──── Student endpoints ────

class StudentListCreateAPIView(generics.ListCreateAPIView):
    queryset = Student.objects.select_related('course').all()
    serializer_class = StudentSerializer
    permission_classes = [IsAuthenticated]
    


class StudentRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    
    queryset = Student.objects.select_related('course').all()
    serializer_class = StudentSerializer
    permission_classes = [IsAuthenticated]

# ──── Course endpoints ────


class CourseListCreateAPIView(generics.ListCreateAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]

class CourseRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]

# Nested endpoint

class CourseStudentsListAPIView(generics.ListAPIView):
    serializer_class = StudentSerializer
    permission_classes = [IsAuthenticated]
    

    def get_queryset(self):
        course = get_object_or_404(Course, pk=self.kwargs["pk"])
        # return course.students.select_related("course").all()
        if self.request.user.is_staff:
            return course.students.select_related("course").all()
        return course.students.select_related("course").filter(created_by=self.request.user)