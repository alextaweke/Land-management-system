from rest_framework import serializers
from .models import Application, Approval, Payment

class ApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = "__all__"

class ApprovalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Approval
        fields = "__all__"

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = "__all__"
