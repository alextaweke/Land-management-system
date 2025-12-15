from rest_framework import serializers
from .models import LandTransaction, Payment

class LandTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = LandTransaction
        fields = "__all__"


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = "__all__"
