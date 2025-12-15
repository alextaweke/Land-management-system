from rest_framework import serializers
from .models import User
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "role"]


class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["username", "password", "role"]
        extra_kwargs = {
            "password": {"write_only": True}
        }

    def create(self, validated_data):
        username = validated_data.get("username")
        password = validated_data.get("password")
        role = validated_data.get("role", "owner")

        user = User.objects.create_user(username=username, password=password, role=role)
        return user




# accounts/serializers.py

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user

        # Only include owner_id if user has a profile
        owner_id = getattr(user, "owner_profile", None)
        data["user"] = {
            "id": user.id,
            "username": user.username,
            "role": user.role,
            "owner_id": owner_id.id if owner_id else None
        }
        return data
