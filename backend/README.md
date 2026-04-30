# Backend

python manage.py runserver
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
pip freeze > requirements.txt

docker compose up -d
docker compose up --build -d
docker compose down
docker compose down -v


For Auth Views
Use permission_classes = [isSuperUser] for Superuser only
Use permission_classes = [isAdminUser] for Admin + Superuser access
Use permission_classes = [isAuthenticated] for access to all logged in users