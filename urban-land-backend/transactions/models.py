from django.db import models
from land.models import LandParcel
from owners.models import OwnerProfile

class LandTransaction(models.Model):
    TRANSACTION_TYPES = [
        ("sale", "Sale"),
        ("lease", "Lease"),
        ("inheritance", "Inheritance"),
        ("transfer", "Transfer"),
    ]

    parcel = models.ForeignKey(LandParcel, on_delete=models.CASCADE,related_name="transactions_land_transactions")
    buyer = models.ForeignKey(OwnerProfile, on_delete=models.SET_NULL, null=True, related_name="buyer")
    seller = models.ForeignKey(OwnerProfile, on_delete=models.SET_NULL, null=True, related_name="seller")
    transaction_type = models.CharField(max_length=50, choices=TRANSACTION_TYPES)
    transaction_date = models.DateField()
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=50, default="pending")

    def __str__(self):
        return f"{self.parcel.parcel_id} - {self.transaction_type}"


class Payment(models.Model):
    PAYMENT_TYPES = [
        ("tax", "Tax"),
        ("fee", "Fee"),
        ("penalty", "Penalty"),
    ]

    payer = models.ForeignKey(OwnerProfile, on_delete=models.SET_NULL, null=True)
    parcel = models.ForeignKey(LandParcel, on_delete=models.SET_NULL,related_name="transactions_payments", null=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_type = models.CharField(max_length=50, choices=PAYMENT_TYPES)
    payment_date = models.DateField()
    status = models.CharField(max_length=50, default="paid")

    def __str__(self):
        return f"{self.payer} - {self.amount}"
