from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from .models import OwnershipRecord, Document
from .serializers import OwnershipRecordSerializer, DocumentSerializer
from accounts.permissions import IsAdminOrOfficer

class OwnershipRecordViewSet(viewsets.ModelViewSet):
    serializer_class = OwnershipRecordSerializer
    permission_classes = [IsAdminOrOfficer]
    
    def get_queryset(self):
        queryset = OwnershipRecord.objects.all()
        
        # Filter by owner_id
        owner_id = self.request.query_params.get('owner_id')
        if owner_id:
            queryset = queryset.filter(owner_id=owner_id)
        
        # Filter by parcel_id
        parcel_id = self.request.query_params.get('parcel_id')
        if parcel_id:
            queryset = queryset.filter(parcel_id=parcel_id)
        
        # Filter by current owners only
        current_only = self.request.query_params.get('current_only')
        if current_only and current_only.lower() == 'true':
            queryset = queryset.filter(is_current_owner=True)
        
        # Filter by verification status
        verification_status = self.request.query_params.get('verification_status')
        if verification_status:
            queryset = queryset.filter(verification_status=verification_status)
        
        return queryset.select_related('owner', 'parcel', 'transfer_to')
    
    @action(detail=False, methods=['get'])
    def current_owners(self, request):
        """Get all current owners"""
        records = self.get_queryset().filter(is_current_owner=True)
        serializer = self.get_serializer(records, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def owner_history(self, request):
        """Get ownership history for a specific owner"""
        owner_id = request.query_params.get('owner_id')
        if not owner_id:
            return Response(
                {'error': 'owner_id parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        records = OwnershipRecord.objects.filter(owner_id=owner_id)
        serializer = self.get_serializer(records, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def parcel_history(self, request):
        """Get ownership history for a specific parcel"""
        parcel_id = request.query_params.get('parcel_id')
        if not parcel_id:
            return Response(
                {'error': 'parcel_id parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        records = OwnershipRecord.objects.filter(parcel_id=parcel_id)
        serializer = self.get_serializer(records, many=True)
        return Response(serializer.data)


class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    permission_classes = [IsAdminOrOfficer]
    
    def get_queryset(self):
        queryset = Document.objects.all()
        
        # Filter by ownership_record
        record_id = self.request.query_params.get('ownership_record')
        if record_id:
            queryset = queryset.filter(ownership_record_id=record_id)
        
        # Filter by parcel
        parcel_id = self.request.query_params.get('parcel_id')
        if parcel_id:
            queryset = queryset.filter(related_parcel_id=parcel_id)
        
        # Filter by document type
        doc_type = self.request.query_params.get('doc_type')
        if doc_type:
            queryset = queryset.filter(doc_type=doc_type)
        
        return queryset.select_related('ownership_record', 'related_parcel', 'uploaded_by')