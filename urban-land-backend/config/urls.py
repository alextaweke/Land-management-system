from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from accounts.views import MyParcelsViewSet, RegisterViewSet, UserViewSet, MyTokenObtainPairView, dashboard_stats
from land.views import LandParcelViewSet
from records.views import OwnershipRecordViewSet, DocumentViewSet
from applications.views import ApplicationViewSet, ApprovalViewSet, PaymentViewSet
from audit.views import AuditLogViewSet
from owners.views import OwnerProfileViewSet
from rest_framework_simplejwt.views import TokenRefreshView
from django.conf import settings

router = DefaultRouter()
router.register(r"users", UserViewSet, basename="user")
router.register(r"register", RegisterViewSet, basename="register")
router.register(r"owners", OwnerProfileViewSet, basename="owner")
router.register(r"parcels", LandParcelViewSet, basename="parcel")
router.register(r"ownership-records", OwnershipRecordViewSet, basename="ownershiprecord")
router.register(r"documents", DocumentViewSet, basename="document")
router.register(r"applications", ApplicationViewSet, basename="application")
router.register(r"approvals", ApprovalViewSet, basename="approval")
router.register(r"payments", PaymentViewSet, basename="payment")
router.register(r"audit-logs", AuditLogViewSet, basename="auditlog")
router.register(r"my-parcels", MyParcelsViewSet, basename="my-parcels")

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/token/", MyTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/owners/me/", OwnerProfileViewSet.as_view({"get": "retrieve"})),
    
    # Add dashboard stats under api/accounts/
    path("api/accounts/dashboard-stats/", dashboard_stats, name='dashboard_stats'),
    
    path("api/", include(router.urls)),
]

if settings.DEBUG:
    from django.conf.urls.static import static
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)