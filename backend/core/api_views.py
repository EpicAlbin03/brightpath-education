from rest_framework import generics
from django.shortcuts import get_object_or_404
from .models import Student, Course
from .serializers import StudentSerializer, CourseSerializer


# ──── Student endpoints ────

class StudentListCreateAPIView(generics.ListCreateAPIView):
    queryset = Student.objects.select_related('course').all()
    serializer_class = StudentSerializer
    


class StudentRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    
    queryset = Student.objects.select_related('course').all()
    serializer_class = StudentSerializer

# ──── Course endpoints ────


class CourseListCreateAPIView(generics.ListCreateAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    

class CourseRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    

# Nested endpoint

class CourseStudentsListAPIView(generics.ListAPIView):
    serializer_class = StudentSerializer
    

    def get_queryset(self):
        course = get_object_or_404(Course, pk=self.kwargs["pk"])
        # return course.students.select_related("course").all()
        if self.request.user.is_staff:
            return course.students.select_related("course").all()
        return course.students.select_related("course").filter(created_by=self.request.user)