
import os
import secrets

from django.contrib.auth import get_user_model
from django.db import transaction
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status


@api_view(["POST"])
@permission_classes([AllowAny])
@throttle_classes([])
def bootstrap_admin(request):
    expected = os.getenv("ADMIN_BOOTSTRAP_TOKEN", "")
    supplied = request.headers.get("X-Bootstrap-Token", "")

    if not expected or not secrets.compare_digest(expected, supplied):
        return Response(
            {"detail": "Not available."},
            status=status.HTTP_404_NOT_FOUND,
        )

    username = str(request.data.get("username", "")).strip()
    password = str(request.data.get("password", ""))
    email = str(request.data.get("email", "")).strip()

    if not username or len(password) < 12:
        return Response(
            {"detail": "Username and password of at least 12 characters required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    User = get_user_model()

    with transaction.atomic():
        # Prevent creating additional superusers.
        if User.objects.select_for_update().filter(is_superuser=True).exists():
            return Response(
                {"detail": "An administrator already exists."},
                status=status.HTTP_409_CONFLICT,
            )

        user = User.objects.create_superuser(
            username=username,
            email=email,
            password=password,
        )

    return Response(
        {"detail": "Administrator created.", "username": user.username},
        status=status.HTTP_201_CREATED,
    )
