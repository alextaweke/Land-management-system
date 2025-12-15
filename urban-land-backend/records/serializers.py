from rest_framework import serializers
from .models import OwnershipRecord, Document
from owners.serializers import OwnerProfileSerializer
from land.serializers import LandParcelSerializer

class OwnershipRecordSerializer(serializers.ModelSerializer):
    # Computed fields
    owner = OwnerProfileSerializer(read_only=True)
    first_name = serializers.CharField(source="owner.first_name", read_only=True)
    last_name = serializers.CharField(source="owner.last_name", read_only=True)
    username = serializers.CharField(source="owner.username", read_only=True)
    national_id = serializers.CharField(source="owner.national_id", read_only=True)
    parcel = LandParcelSerializer(read_only=True)
    duration_days = serializers.SerializerMethodField()
    is_active = serializers.SerializerMethodField()
    
    class Meta:
        model = OwnershipRecord
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'created_by']
    
    def get_duration_days(self, obj):
        if obj.transfer_date:
            return (obj.transfer_date - obj.acquisition_date).days
        return None
    
    def get_is_active(self, obj):
        return obj.is_current_owner and obj.verification_status == 'Verified'
    
    def validate(self, data):
        # Validate ownership percentage
        ownership_percentage = data.get('ownership_percentage')
        if ownership_percentage and (ownership_percentage < 0 or ownership_percentage > 100):
            raise serializers.ValidationError({
                'ownership_percentage': 'Must be between 0 and 100.'
            })
        
        return data
    
    def create(self, validated_data):
        # Auto-set created_by from request user
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['created_by'] = request.user
        
        return super().create(validated_data)


class DocumentSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.CharField(
        source='uploaded_by.get_full_name', 
        read_only=True
    )
    file_url = serializers.SerializerMethodField()
    file_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Document
        fields = '__all__'
        read_only_fields = [
            'uploaded_by', 
            'uploaded_at', 
            'file_size', 
            'file_type',
            'file_url'
        ]
    
    def get_file_url(self, obj):
        if obj.file:
            return obj.file.url
        return obj.file_url
    
    def get_file_name(self, obj):
        if obj.file:
            return obj.file.name.split('/')[-1]
        return None
    
    def create(self, validated_data):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['uploaded_by'] = request.user
        
        return super().create(validated_data)