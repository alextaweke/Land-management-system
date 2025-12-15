# records/models.py
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from land.models import LandParcel
from owners.models import OwnerProfile
from accounts.models import User

class OwnershipRecord(models.Model):
    OWNERSHIP_TYPES = [
        ('Sole', 'Sole Ownership'),
        ('Joint', 'Joint Ownership'),
        ('Co-owner', 'Co-owner'),
        ('Leasehold', 'Leasehold'),
        ('Mortgage', 'Mortgage Holder'),
        ('Easement', 'Easement Holder'),
        ('Power_of_Attorney', 'Power of Attorney'),
    ]
    
    ACQUISITION_TYPES = [
        ('Purchase', 'Purchase'),
        ('Inheritance', 'Inheritance'),
        ('Gift', 'Gift'),
        ('Government_Allocation', 'Government Allocation'),
        ('Auction', 'Auction'),
        ('Exchange', 'Exchange'),
        ('Court_Order', 'Court Order'),
        ('Partition', 'Partition'),
    ]
    
    VERIFICATION_STATUS = [
        ('Pending', 'Pending Verification'),
        ('Verified', 'Verified'),
        ('Rejected', 'Rejected'),
        ('Under_Review', 'Under Review'),
        ('Disputed', 'Disputed'),
    ]
    
    # Foreign Keys
    parcel = models.ForeignKey(
        LandParcel,
        on_delete=models.CASCADE,
        related_name="ownership_records"
    )
    owner = models.ForeignKey(
        OwnerProfile, 
        on_delete=models.CASCADE,
        related_name="ownership_records"
    )
    
    # Ownership Details
    ownership_type = models.CharField(
        max_length=20, 
        choices=OWNERSHIP_TYPES,
        default='Sole'
    )
    ownership_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        default=100.00
    )
    
    # Acquisition Details
    acquisition_type = models.CharField(
        max_length=25,
        choices=ACQUISITION_TYPES,
        default='Purchase'
    )
    acquisition_date = models.DateField()
    acquisition_value = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        null=True,
        blank=True
    )
    
    # Legal Details
    deed_number = models.CharField(max_length=100, blank=True, null=True)
    deed_date = models.DateField(blank=True, null=True)
    registration_number = models.CharField(max_length=100, blank=True, null=True)
    registration_date = models.DateField(blank=True, null=True)
    registrar_office = models.CharField(max_length=200, blank=True, null=True)
    stamp_duty_paid = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True
    )
    
    # Timeline
    start_date = models.DateField(blank=True, null=True)
    end_date = models.DateField(blank=True, null=True)
    lease_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True
    )
    mortgage_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        null=True,
        blank=True
    )
    mortgagee_name = models.CharField(max_length=255, blank=True, null=True)
    
    # Transfer Details
    transfer_date = models.DateField(null=True, blank=True)
    transfer_type = models.CharField(
        max_length=20,
        choices=[
            ('Sale', 'Sale'),
            ('Gift', 'Gift'),
            ('Inheritance', 'Inheritance'),
            ('Foreclosure', 'Foreclosure'),
            ('Surrender', 'Surrender'),
        ],
        blank=True,
        null=True
    )
    transfer_to = models.ForeignKey(
        OwnerProfile,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='transferred_to_records'
    )
    
    # Verification & Status
    verification_status = models.CharField(
        max_length=20,
        choices=VERIFICATION_STATUS,
        default='Pending'
    )
    verified_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='verified_records'
    )
    verification_date = models.DateField(null=True, blank=True)
    verification_notes = models.TextField(blank=True, null=True)
    
    # Current Status
    is_current_owner = models.BooleanField(default=True)
    
    # Audit Fields
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_records'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    history_notes = models.TextField(blank=True, null=True)
    
    class Meta:
        ordering = ['-acquisition_date']
        indexes = [
            models.Index(fields=['parcel', 'is_current_owner']),
            models.Index(fields=['owner', 'is_current_owner']),
            models.Index(fields=['acquisition_date']),
        ]
    
    def __str__(self):
        return f"{self.parcel.parcel_id} - {self.owner.full_name} ({self.ownership_percentage}%)"


class Document(models.Model):
    DOCUMENT_TYPES = [
        ('Title_Deed', 'Title Deed'),
        ('Survey_Map', 'Survey Map'),
        ('Tax_Receipt', 'Tax Receipt'),
        ('Identity_Proof', 'Identity Proof'),
        ('Address_Proof', 'Address Proof'),
        ('Sale_Deed', 'Sale Deed'),
        ('Gift_Deed', 'Gift Deed'),
        ('Mortgage_Deed', 'Mortgage Deed'),
        ('Partition_Deed', 'Partition Deed'),
        ('Court_Order', 'Court Order'),
        ('Death_Certificate', 'Death Certificate'),
        ('Succession_Certificate', 'Succession Certificate'),
        ('Building_Permit', 'Building Permit'),
        ('Encumbrance_Certificate', 'Encumbrance Certificate'),
    ]
    
    # Link to ownership record
    ownership_record = models.ForeignKey(
        OwnershipRecord,
        on_delete=models.CASCADE,
        related_name="documents",
        null=True,
        blank=True
    )
    
    # Also keep link to parcel for general documents
    related_parcel = models.ForeignKey(
        LandParcel,
        on_delete=models.CASCADE,
        related_name="documents",
        null=True,
        blank=True
    )
    
    doc_type = models.CharField(
        max_length=50,
        choices=DOCUMENT_TYPES
    )
    document_number = models.CharField(max_length=100, blank=True, null=True)
    document_date = models.DateField(blank=True, null=True)
    issuing_authority = models.CharField(max_length=200, blank=True, null=True)
    
    # File storage
    file = models.FileField(upload_to='land_documents/%Y/%m/%d/', blank=True, null=True)
    file_url = models.URLField(max_length=500, blank=True, null=True)
    file_size = models.BigIntegerField(null=True, blank=True)
    file_type = models.CharField(max_length=50, blank=True, null=True)
    
    # Metadata
    description = models.TextField(blank=True, null=True)
    uploaded_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True,
        related_name='uploaded_documents'
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)
    is_verified = models.BooleanField(default=False)
    verified_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='verified_documents'
    )
    verification_date = models.DateField(null=True, blank=True)
    
    class Meta:
        ordering = ['-uploaded_at']
    
    def __str__(self):
        return f"{self.get_doc_type_display()} - {self.ownership_record or self.related_parcel}"