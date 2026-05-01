from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DonationViewSet, DonationCategoryViewSet

router = DefaultRouter()
router.register(r'categories', DonationCategoryViewSet, basename='donation-category')
router.register(r'', DonationViewSet, basename='donation')

urlpatterns = [
    path('', include(router.urls)),
]
