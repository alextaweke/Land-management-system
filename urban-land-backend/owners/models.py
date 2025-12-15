# owners/models.py
from django.db import models
from accounts.models import User

class OwnerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="owner_profile")
    national_id = models.CharField(max_length=50, unique=True)
    first_name = models.CharField(max_length=255)
    middle_name = models.CharField(max_length=255, blank=True, null=True)
    last_name = models.CharField(max_length=255)
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=10, choices=[("Male","Male"), ("Female","Female"), ("Other","Other")])
    
    # Image fields
    profile_picture = models.ImageField(
        upload_to='owner_profiles/%Y/%m/%d/', 
        blank=True, 
        null=True,
        help_text="Profile picture of the owner"
    )
    id_card_front = models.ImageField(
        upload_to='owner_ids/%Y/%m/%d/', 
        blank=True, 
        null=True,
        help_text="Front side of national ID card"
    )
    id_card_back = models.ImageField(
        upload_to='owner_ids/%Y/%m/%d/', 
        blank=True, 
        null=True,
        help_text="Back side of national ID card"
    )
    signature = models.ImageField(
        upload_to='owner_signatures/%Y/%m/%d/', 
        blank=True, 
        null=True,
        help_text="Owner's signature"
    )
    
    contact_phone = models.CharField(max_length=20, null=True, blank=True)
    contact_email = models.CharField(max_length=100, null=True, blank=True)
    permanent_address = models.TextField()
    current_address = models.TextField(blank=True, null=True)
    owner_type = models.CharField(max_length=20, choices=[("Individual","Individual"),("Company","Company"),("Government","Government"),("Trust","Trust")], default="Individual")
    registration_number = models.CharField(max_length=100, blank=True, null=True)
    tax_id = models.CharField(max_length=100, blank=True, null=True)
    contact_person = models.CharField(max_length=255, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    date_created = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)
    status = models.CharField(max_length=20, choices=[("Active","Active"),("Inactive","Inactive"),("Deceased","Deceased")], default="Active")

    def __str__(self):
        return f"{self.first_name} {self.last_name}"
    
    @property
    def profile_picture_url(self):
        if self.profile_picture and hasattr(self.profile_picture, 'url'):
            return self.profile_picture.url
        return None
    
    @property
    def id_card_front_url(self):
        if self.id_card_front and hasattr(self.id_card_front, 'url'):
            return self.id_card_front.url
        return None
    
    @property
    def id_card_back_url(self):
        if self.id_card_back and hasattr(self.id_card_back, 'url'):
            return self.id_card_back.url
        return None
    
    @property
    def signature_url(self):
        if self.signature and hasattr(self.signature, 'url'):
            return self.signature.url
        return None