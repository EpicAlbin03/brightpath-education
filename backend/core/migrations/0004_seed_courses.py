from django.db import migrations


def seed_courses(apps, schema_editor):
    Course = apps.get_model("core", "Course")

    courses = [
        {
            "name": "Computer Science",
            "code": "CS101",
            "description": "Introduction to computer science fundamentals.",
        },
        {
            "name": "Mathematics",
            "code": "MATH101",
            "description": "Core mathematics covering algebra and problem solving.",
        },
        {
            "name": "English Literature",
            "code": "ENG101",
            "description": "Reading and analysis of classic and modern texts.",
        },
    ]

    for course_data in courses:
        Course.objects.get_or_create(
            code=course_data["code"],
            defaults={
                "name": course_data["name"],
                "description": course_data["description"],
            },
        )


def unseed_courses(apps, schema_editor):
    Course = apps.get_model("core", "Course")
    Course.objects.filter(code__in=["CS101", "MATH101", "ENG101"]).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0003_remove_student_course_remove_student_created_at_and_more"),
    ]

    operations = [
        migrations.RunPython(seed_courses, reverse_code=unseed_courses),
    ]