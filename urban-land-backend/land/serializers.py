# land/serializers.py
from rest_framework import serializers
from .models import LandParcel

class LandParcelSerializer(serializers.ModelSerializer):
    """Main serializer for land parcels"""
    owner_name = serializers.SerializerMethodField()
    
    class Meta:
        model = LandParcel
        fields = [
            
            "parcel_id",
            "cadastral_number",
            "survey_number",
            "block_number",
            "sector_number",
            "mouza_name",
            "location",
            "area",
            "land_use_zone",
            "status",
            "in_north",
            "in_east",
            "in_west",
            "in_south",
            "parcel_file",
            "land_use_zone",
            "registration_date",
            "registration_number",
            "title_deed_number",
            "current_market_value",
            "annual_tax_value",
            "development_status",
            "has_structures",
            "date_created",
            "last_updated",
            "is_active",
            "owner_name",
        ]
    
    def get_owner_name(self, obj):
        """Get primary owner name from ownership records"""
        try:
            from records.models import OwnershipRecord
            record = OwnershipRecord.objects.filter(
                parcel=obj,
                is_current_owner=True
            ).first()
            if record and record.owner:
                return f"{record.owner.first_name} {record.owner.last_name}"
        except:
            pass
        return "No Owner"


# Keep this for backward compatibility if needed
class ParcelSerializer(LandParcelSerializer):
    """Alias for backward compatibility"""
    pass