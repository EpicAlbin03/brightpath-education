from django.contrib import admin

from .models import Course, Student, UserSettings


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ("code", "name", "description")
    search_fields = ("code", "name")


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "grade", "is_active")
    list_filter = ("is_active",)
    search_fields = ("name", "email")
    filter_horizontal = ("courses",)


@admin.register(UserSettings)
class UserSettingsAdmin(admin.ModelAdmin):
    list_display = ("user", "cookie_consent")
    list_filter = ("cookie_consent",)
    search_fields = ("user__username", "user__email")
