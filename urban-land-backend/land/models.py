from django.db import models
from owners.models import OwnerProfile
from django.utils import timezone

class LandParcel(models.Model):
    # REMOVE this line: owner = models.ForeignKey(OwnerProfile, on_delete=models.CASCADE)
    # Land should NOT have direct owner foreign key
    
    parcel_id = models.AutoField(primary_key=True)
    location = models.CharField(max_length=255)
    area = models.FloatField()
    land_use_type = models.CharField(max_length=100)
    status = models.CharField(max_length=50, default="active")
    in_north = models.CharField(max_length=255, null=True, blank=True)
    in_east = models.CharField(max_length=255, null=True, blank=True)
    in_west = models.CharField(max_length=255, null=True, blank=True)
    in_south = models.CharField(max_length=255, null=True, blank=True)
    parcel_file = models.FileField(upload_to="parcel_docs/", null=True, blank=True)

    # New cadastral and registration fields
    cadastral_number = models.CharField(max_length=100, unique=True)
    survey_number = models.CharField(max_length=50, null=True, blank=True)
    block_number = models.CharField(max_length=50, null=True, blank=True)
    sector_number = models.CharField(max_length=50, null=True, blank=True)
    mouza_name = models.CharField(max_length=100, null=True, blank=True)
    
    LAND_USE_ZONE_CHOICES = [
        ("Residential", "Residential"),
        ("Commercial", "Commercial"),
        ("Industrial", "Industrial"),
        ("Agricultural", "Agricultural"),
        ("Public", "Public"),
        ("Mixed", "Mixed"),
    ]
    land_use_zone = models.CharField(max_length=50, choices=LAND_USE_ZONE_CHOICES, null=True, blank=True)

    # Registration info
    registration_date = models.DateField(default=timezone.now)
    registration_number = models.CharField(max_length=100, unique=True, null=True, blank=True)
    title_deed_number = models.CharField(max_length=100, null=True, blank=True)

    # Current details
    current_market_value = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    annual_tax_value = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)

    DEVELOPMENT_STATUS_CHOICES = [
        ("Undeveloped", "Undeveloped"),
        ("Under_Construction", "Under Construction"),
        ("Developed", "Developed"),
        ("Government_Hold", "Government Hold"),
    ]
    development_status = models.CharField(max_length=50, choices=DEVELOPMENT_STATUS_CHOICES, null=True, blank=True)
    has_structures = models.BooleanField(default=False)

    # Audit fields
    date_created = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"Parcel {self.parcel_id} - {self.cadastral_number}"
    
    # Property to get current owner(s)
    @property
    def current_owners(self):
        from records.models import OwnershipRecord
        return OwnershipRecord.objects.filter(
            parcel=self,
            is_current_owner=True
        ).select_related('owner')
    
    # Property to get primary current owner (for backward compatibility)
    @property
    def owner(self):
        records = self.current_owners
        if records.exists():
            return records.first().owner
        return None
    
    # Property to get ownership percentage
    @property
    def ownership_percentage(self):
        records = self.current_owners
        if records.exists():
            return records.first().ownership_percentage
        return 0


# REMOVE these classes from land/models.py:
# class OwnershipRecord(models.Model):  # DELETE THIS
# class LandTransaction(models.Model):  # DELETE THIS
# Keep only LandParcel model in land app