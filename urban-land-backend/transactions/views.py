from rest_framework import viewsets
from .models import LandTransaction, Payment
from .serializers import LandTransactionSerializer, PaymentSerializer
from accounts.permissions import IsAdminOrOfficer

class LandTransactionViewSet(viewsets.ModelViewSet):
    queryset = LandTransaction.objects.all()
    serializer_class = LandTransactionSerializer
    permission_classes = [IsAdminOrOfficer]


class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [IsAdminOrOfficer]
