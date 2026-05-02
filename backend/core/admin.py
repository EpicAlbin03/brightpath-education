from django.contrib import admin
from .models import Course, Student


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
	list_display = ('code', 'name', 'description')
	search_fields = ('code', 'name')


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
	list_display = ('name', 'email', 'grade', 'is_active')
	list_filter = ('is_active',)
	search_fields = ('name', 'email')
	filter_horizontal = ('courses',)

