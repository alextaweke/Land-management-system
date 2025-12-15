# land/views.py
from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from .models import LandParcel
from .serializers import LandParcelSerializer
from records.models import OwnershipRecord
from owners.models import OwnerProfile


class LandParcelViewSet(viewsets.ModelViewSet):
    """ViewSet for LandParcel with filtering and ordering"""
    queryset = LandParcel.objects.all()
    serializer_class = LandParcelSerializer
    permission_classes = [IsAuthenticated]
    
    # Add filter backends for search, ordering, and filtering
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    
    # Fields that can be used for filtering
    filterset_fields = {
        'status': ['exact'],
        'land_use_zone': ['exact'],
        'land_use_zone': ['exact'],
        'development_status': ['exact'],
        'is_active': ['exact'],
        'registration_date': ['gte', 'lte', 'exact'],
        'current_market_value': ['gte', 'lte'],
        'area': ['gte', 'lte'],
    }
    
    # Fields that can be searched
    search_fields = [
        'cadastral_number',
        'registration_number',
        'title_deed_number',
        'survey_number',
        'block_number',
        'sector_number',
        'mouza_name',
        'location',
    ]
    
    # Fields that can be used for ordering
    ordering_fields = [
        'parcel_id',
        'cadastral_number',
        'registration_date',
        'current_market_value',
        'area',
        'date_created',
        'last_updated',
    ]
    
    # Default ordering
    ordering = ['-date_created']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Custom filtering by owner
        owner_id = self.request.query_params.get('owner')
        if owner_id:
            parcel_ids = OwnershipRecord.objects.filter(
                owner_id=owner_id,
                is_current_owner=True
            ).values_list('parcel_id', flat=True)
            queryset = queryset.filter(parcel_id__in=parcel_ids)
        
        # Filter by owner name (through OwnershipRecord)
        owner_name = self.request.query_params.get('owner_name')
        if owner_name:
            owner_ids = OwnerProfile.objects.filter(
                Q(first_name__icontains=owner_name) |
                Q(last_name__icontains=owner_name) |
                Q(middle_name__icontains=owner_name)
            ).values_list('id', flat=True)
            
            parcel_ids = OwnershipRecord.objects.filter(
                owner_id__in=owner_ids,
                is_current_owner=True
            ).values_list('parcel_id', flat=True)
            queryset = queryset.filter(parcel_id__in=parcel_ids)
        
        # Filter by land type (use land_use_zone instead of land_use_zone)
        land_use_zone = self.request.query_params.get('land_use_zone')
        if land_use_zone:
            queryset = queryset.filter(land_use_zone=land_use_zone)
        
        # Filter by land zone
        land_zone = self.request.query_params.get('land_zone')
        if land_zone:
            queryset = queryset.filter(land_use_zone=land_zone)
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get statistics for land parcels"""
        total = LandParcel.objects.count()
        active = LandParcel.objects.filter(status='active').count()
        inactive = LandParcel.objects.filter(status='inactive').count()
        pending = LandParcel.objects.filter(status='pending').count()
        
        total_value = LandParcel.objects.aggregate(
            total_value=models.Sum('current_market_value')
        )['total_value'] or 0
        
        total_area = LandParcel.objects.aggregate(
            total_area=models.Sum('area')
        )['total_area'] or 0
        
        return Response({
            'total': total,
            'active': active,
            'inactive': inactive,
            'pending': pending,
            'total_value': float(total_value),
            'total_area': float(total_area),
        })
    
    @action(detail=False, methods=['get'])
    def types(self, request):
        """Get unique land use types"""
        types = LandParcel.objects.values_list('land_use_zone', flat=True).distinct()
        zones = LandParcel.objects.values_list('land_use_zone', flat=True).distinct()
        
        return Response({
            'land_use_zones': list(types),
            'land_use_zones': list(zones),
        })
    
    @action(detail=True, methods=['get'])
    def owners(self, request, pk=None):
        """Get current owners for this parcel"""
        parcel = self.get_object()
        records = OwnershipRecord.objects.filter(
            parcel=parcel,
            is_current_owner=True
        ).select_related('owner')
        
        from owners.serializers import OwnerProfileSerializer
        owners_data = []
        for record in records:
            owner_data = OwnerProfileSerializer(record.owner).data
            owner_data['ownership_percentage'] = record.ownership_percentage
            owner_data['acquisition_date'] = record.acquisition_date
            owners_data.append(owner_data)
        
        return Response(owners_data)