from rest_framework import viewsets
from .models import Application, Approval, Payment
from .serializers import ApplicationSerializer, ApprovalSerializer, PaymentSerializer

class ApplicationViewSet(viewsets.ModelViewSet):
    queryset = Application.objects.all()
    serializer_class = ApplicationSerializer

class ApprovalViewSet(viewsets.ModelViewSet):
    queryset = Approval.objects.all()
    serializer_class = ApprovalSerializer

class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
