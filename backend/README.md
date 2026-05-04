# Backend

## Stack

- Django 6
- Django REST Framework
- Simple JWT
- PostgreSQL
- Docker Compose

## Setup

1. Copy `.env.example` to `.env`.
2. Fill in `DJANGO_SECRET_KEY`.
3. Optional: add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` if you want Google login.

Important environment variables:

- `DJANGO_SECRET_KEY`
- `DJANGO_DEBUG`
- `DJANGO_ALLOWED_HOSTS`
- `CORS_ALLOWED_ORIGINS`
- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_HOST`
- `POSTGRES_PORT`

## Run With Docker

```bash
docker compose up --build -d
docker compose down
docker compose down -v
```

The API will be available at `http://localhost:8000/api/`.

## Run Locally

Install dependencies:

```bash
pip install -r requirements.txt
```

Apply migrations and start the server:

```bash
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

## Seeded Data

Migrations create these auth groups automatically:

- `viewer`
- `admin`

Migrations also seed these sample courses:

- `CS101` Computer Science
- `MATH101` Mathematics
- `ENG101` English Literature

## Auth And Access

- Default API access requires authentication.
- Register: `POST /api/auth/register/`
- Login: `POST /api/auth/login/`
- Refresh token: `POST /api/auth/refresh/`
- Current user: `GET /api/auth/me/`
- Google login: `POST /api/auth/google/`

Role expectations:

- Authenticated users can read students and courses.
- Admins and superusers can create, update, and delete students and courses.
- Superusers manage users.

## Main Endpoints

- `/api/students/`
- `/api/students/{id}/`
- `/api/students/{student_id}/courses/`
- `/api/students/{student_id}/courses/{course_id}/`
- `/api/courses/`
- `/api/courses/{id}/`
- `/api/courses/{id}/students/`
- `/api/users/`
- `/api/users/{id}/`
- `/api/users/{id}/activate/`
- `/api/users/{id}/deactivate/`
