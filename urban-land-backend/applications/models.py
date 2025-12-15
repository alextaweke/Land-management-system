from django.db import models
from accounts.models import User
from land.models import LandParcel

class Application(models.Model):
    APPLICATION_TYPE_CHOICES = [
        ("change_use", "Land Use Change"),
        ("subdivision", "Subdivision"),
        ("consolidation", "Consolidation"),
        ("lease", "Lease"),
    ]
    applicant = models.ForeignKey(User, on_delete=models.CASCADE)
    parcel = models.ForeignKey(LandParcel, on_delete=models.CASCADE)
    application_type = models.CharField(max_length=50, choices=APPLICATION_TYPE_CHOICES)
    submitted_date = models.DateField(auto_now_add=True)
    status = models.CharField(max_length=50, default="submitted")

class Approval(models.Model):
    application = models.ForeignKey(Application, on_delete=models.CASCADE)
    reviewer = models.ForeignKey(User, on_delete=models.CASCADE)
    status = models.CharField(max_length=50, default="pending")
    comments = models.TextField(blank=True, null=True)
    date = models.DateField(auto_now_add=True)

class Payment(models.Model):
    parcel = models.ForeignKey(
        "land.LandParcel",
        on_delete=models.CASCADE,
        related_name="applications_payments"  # unique reverse accessor
    )
    payer = models.ForeignKey(User, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_date = models.DateField(auto_now_add=True)
    payment_type = models.CharField(max_length=50)
    status = models.CharField(max_length=50, default="pending")
