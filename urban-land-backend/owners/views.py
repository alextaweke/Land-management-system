# owners/views.py
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser

from .models import OwnerProfile
from .serializers import OwnerProfileSerializer


class OwnerProfileViewSet(viewsets.ModelViewSet):
    serializer_class = OwnerProfileSerializer
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        username = self.request.query_params.get("username")

        # ADMIN searching by username
        if username and (user.role == "admin" or user.role == "officer"):
            return OwnerProfile.objects.filter(user__username=username)

        # OWNER sees only their own profile
        if user.role == "owner":
            return OwnerProfile.objects.filter(user=user)

        # ADMIN/OFFICER sees all (but only if they're searching)
        if user.role in ["admin", "officer"] and not username:
            return OwnerProfile.objects.all()

        # Default return empty for other cases
        return OwnerProfile.objects.none()

    def get_permissions(self):
        """
        OWNER can access only their own profile.
        ADMIN/OFFICER can access all.
        """
        if self.action in ["create", "destroy"]:
            return [IsAdminUser()]  # Only admin can create/delete profiles
        return [IsAuthenticated()]

    def create(self, request, *args, **kwargs):
        # Let the serializer handle everything
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()  # Serializer handles user lookup and creation
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # Check permissions: owner can only update their own profile
        if request.user.role == "owner" and instance.user != request.user:
            return Response(
                {"error": "You can only update your own profile"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    # Extra endpoint for admin search
    @action(detail=False, methods=["get"], permission_classes=[IsAdminUser])
    def search(self, request):
        username = request.query_params.get("username")
        if not username:
            return Response({"error": "username required"}, status=400)

        queryset = OwnerProfile.objects.filter(user__username=username)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)