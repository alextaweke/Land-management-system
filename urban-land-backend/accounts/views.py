from rest_framework import viewsets, permissions, status
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from .models import User
from .serializers import (
    RegisterSerializer,
    UserSerializer,
    MyTokenObtainPairSerializer,
)

# Import the correct serializer from land app
from land.serializers import LandParcelSerializer
from land.models import LandParcel
from owners.models import OwnerProfile
from records.models import OwnershipRecord
# For dashboard stats
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Count, Sum, Q

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    try:
        user = request.user
        
        # Get counts based on user role
        if user.role in ['admin', 'officer']:
            # Admin/Officer sees all statistics
            
            # User statistics
            total_users = User.objects.count()
            user_distribution = {
                'owners': User.objects.filter(role='owner').count(),
                'officers': User.objects.filter(role='officer').count(),
                'admins': User.objects.filter(role='admin').count(),
            }
            
            # Owner statistics
            total_owners = OwnerProfile.objects.count()
            users_with_owner_role = User.objects.filter(role='owner').count()
            
            # Land statistics
            total_lands = LandParcel.objects.count()
            active_lands = LandParcel.objects.filter(is_active=True).count()
            inactive_lands = LandParcel.objects.filter(is_active=False).count()
            
            # If you have a status field in LandParcel model, use this instead:
            # active_lands = LandParcel.objects.filter(status='Active').count()
            # inactive_lands = LandParcel.objects.filter(status='Inactive').count()
            # pending_lands = LandParcel.objects.filter(status='Pending').count()
            
            # For demo, let's set pending_lands to 0 or calculate based on your logic
            pending_lands = 0
            
            # Total land value
            total_land_value = LandParcel.objects.aggregate(
                total_value=Sum('current_market_value')
            )['total_value'] or 0
            
            # Recent activities (last 5 registered owners)
            recent_owners = OwnerProfile.objects.order_by('-date_created')[:5]
            recent_activities = [
                {
                    'id': owner.id,
                    'type': 'owner_registration',
                    'description': f'New owner registered: {owner.first_name} {owner.last_name}',
                    'time': 'Recently'
                }
                for owner in recent_owners
            ]
            
        else:
            # Regular users see limited statistics
            total_users = 0
            user_distribution = {'owners': 0, 'officers': 0, 'admins': 0}
            total_owners = 0
            users_with_owner_role = 0
            total_lands = 0
            active_lands = 0
            inactive_lands = 0
            pending_lands = 0
            total_land_value = 0
            recent_activities = []
        
        return Response({
            'totalUsers': total_users,
            'totalOwners': total_owners,
            'totalLands': total_lands,
            'activeLands': active_lands,
            'inactiveLands': inactive_lands,
            'pendingLands': pending_lands,
            'landValue': total_land_value,
            'userDistribution': user_distribution,
            'ownersWithProfiles': total_owners,
            'totalRegisteredOwners': users_with_owner_role,
            'recentActivities': recent_activities[:5],  # Limit to 5
        })
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

class RegisterViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        queryset = super().get_queryset()
        username = self.request.query_params.get("username")
        if username:
            queryset = queryset.filter(username=username)
        return queryset


class MyParcelsViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for owners to see their parcels"""
    serializer_class = LandParcelSerializer  # Use the correct serializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        
        # Check if user is an owner
        if user.role != 'owner':
            return LandParcel.objects.none()
        
        try:
            # Get the owner profile for this user
            owner_profile = OwnerProfile.objects.get(user=user)
            
            # Get parcels where this owner has current ownership
            parcel_ids = OwnershipRecord.objects.filter(
                owner=owner_profile,
                is_current_owner=True
            ).values_list('parcel_id', flat=True)
            
            return LandParcel.objects.filter(parcel_id__in=parcel_ids)
            
        except OwnerProfile.DoesNotExist:
            # User doesn't have an owner profile
            return LandParcel.objects.none()


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


