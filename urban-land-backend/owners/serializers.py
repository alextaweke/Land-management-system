# owners/serializers.py
from rest_framework import serializers
from .models import OwnerProfile
from accounts.models import User

class OwnerProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(write_only=True, required=True)
    user_username = serializers.CharField(source="user.username", read_only=True)
    full_name = serializers.SerializerMethodField()
    owned_lands = serializers.SerializerMethodField()
    
    # Image URL fields
    profile_picture_url = serializers.SerializerMethodField()
    id_card_front_url = serializers.SerializerMethodField()
    id_card_back_url = serializers.SerializerMethodField()
    signature_url = serializers.SerializerMethodField()
    
    class Meta:
        model = OwnerProfile
        fields = [
            "id",
            "username",
            "user_username",
            "first_name",
            "middle_name",
            "last_name",
            "full_name",
            "national_id",
            "date_of_birth",
            "gender",
            # Image fields
            "profile_picture",
            "id_card_front",
            "id_card_back",
            "signature",
            # Image URL fields
            "profile_picture_url",
            "id_card_front_url",
            "id_card_back_url",
            "signature_url",
            # Contact info
            "contact_phone",
            "contact_email",
            "permanent_address",
            "current_address",
            "owner_type",
            "registration_number",
            "tax_id",
            "contact_person",
            "notes",
            "status",
            "date_created",
            "last_updated",
            "owned_lands",
        ]
        read_only_fields = ['date_created', 'last_updated']
    
    def get_full_name(self, obj):
        parts = [obj.first_name, obj.middle_name, obj.last_name]
        return " ".join([p for p in parts if p])
    
    def get_profile_picture_url(self, obj):
        if obj.profile_picture:
            return obj.profile_picture.url
        return None
    
    def get_id_card_front_url(self, obj):
        if obj.id_card_front:
            return obj.id_card_front.url
        return None
    
    def get_id_card_back_url(self, obj):
        if obj.id_card_back:
            return obj.id_card_back.url
        return None
    
    def get_signature_url(self, obj):
        if obj.signature:
            return obj.signature.url
        return None
    
    def get_owned_lands(self, obj):
        """Get all lands owned by this owner"""
        try:
            from records.models import OwnershipRecord
            records = OwnershipRecord.objects.filter(
                owner=obj,
                is_current_owner=True
            ).select_related('parcel')
            
            lands_data = []
            for record in records:
                parcel = record.parcel
                lands_data.append({
                    'parcel': {
                        'parcel_id': parcel.parcel_id,
                        'cadastral_number': parcel.cadastral_number,
                        'location': parcel.location,
                        'area': parcel.area,
                        'registration_date': parcel.registration_date,
                        'current_market_value': parcel.current_market_value,
                        'annual_tax_value': parcel.annual_tax_value,
                        'status': parcel.status,
                    },
                    'ownership_type': record.ownership_type,
                    'ownership_percentage': float(record.ownership_percentage),
                    'acquisition_date': record.acquisition_date,
                    'acquisition_type': record.acquisition_type,
                })
            return lands_data
        except Exception:
            return []
    
    def create(self, validated_data):
        # Extract username from validated_data
        username = validated_data.pop("username", None)
        
        if not username:
            raise serializers.ValidationError({"username": "Username is required"})
        
        # Get the user object
        try:
            user = User.objects.get(username=username, role="owner")
        except User.DoesNotExist:
            raise serializers.ValidationError({"username": "User not found or user is not an owner"})
        
        # Check if profile already exists
        if OwnerProfile.objects.filter(user=user).exists():
            raise serializers.ValidationError({"username": "Owner profile already exists for this user"})
        
        # Create the profile
        return OwnerProfile.objects.create(user=user, **validated_data)
    
    def update(self, instance, validated_data):
        # Remove username from update data (cannot change user)
        validated_data.pop("username", None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance