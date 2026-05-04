from django.conf import settings
from django.db import models

# Create your models here.


class Student(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    date_of_birth = models.DateField(null=True, blank=True)
    grade = models.CharField(max_length=3, default="N/A")
    is_active = models.BooleanField(default=True)
    courses = models.ManyToManyField("Course", related_name="students", blank=True)
    # created_by = models.ForeignKey(
    #     User,
    #     on_delete=models.CASCADE,
    #     related_name='created_students',
    #     null=True,
    #     blank=True,
    # )
    # created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Course(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=10, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return f"{self.code} — {self.name}"


class UserSettings(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="settings",
    )
    cookie_consent = models.BooleanField(null=True, blank=True, default=None)

    def __str__(self):
        return f"Settings for {self.user.username}"
