from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView

urlpatterns = [
    path('', RedirectView.as_view(url='/admin/', permanent=False)),
    path('admin/', admin.site.urls),
    path('api/users/', include('users.urls')),
    path('api/donations/', include('donations.urls')),
    path('api/inventory/', include('inventory.urls')),
    path('api/chat/', include('chat.urls')),
    
    # Swagger docs
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]
