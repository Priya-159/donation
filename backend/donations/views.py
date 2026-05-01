import io
from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django_filters.rest_framework import DjangoFilterBackend
from django.http import FileResponse
from .models import Donation, PickupDetails, DonationCategory
from .serializers import DonationSerializer, PickupDetailsSerializer, DonationCategorySerializer

class DonationCategoryViewSet(viewsets.ModelViewSet):
    queryset = DonationCategory.objects.all()
    serializer_class = DonationCategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        # Admin can see all, others only see active ones
        if self.request.user.is_authenticated and (self.request.user.is_staff or getattr(self.request.user, 'role', '') == 'ADMIN'):
            return DonationCategory.objects.all()
        return DonationCategory.objects.filter(is_active=True)

class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated and request.user.is_admin()

class DonationViewSet(viewsets.ModelViewSet):
    serializer_class = DonationSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'category', 'timestamp']
    search_fields = ['quantity_description']
    ordering_fields = ['timestamp', 'status']

    def get_permissions(self):
        """public_stats is open to everyone; all other actions require a valid JWT."""
        if self.action == 'public_stats':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Donation.objects.none()
        if user.is_staff or user.is_admin():
            return Donation.objects.all()
        return Donation.objects.filter(donor=user)

    @action(detail=False, methods=['get'])
    def public_stats(self, request):
        User = get_user_model()
        from inventory.models import InventoryItem
        
        return Response({
            'total_donations': Donation.objects.count(),
            'total_donors': User.objects.count(),
            'food_meals': Donation.objects.filter(category='Food').count() * 10, # Mock 10 meals per donation
            'trees_planted': Donation.objects.filter(category='Environment').count() * 5,
            
            # Where it goes percentages (dynamic based on DB inventory distribution)
            'distribution': {
                'food': InventoryItem.objects.filter(category='Food').count() * 20,
                'education': InventoryItem.objects.filter(category='Books').count() * 20,
                'green': InventoryItem.objects.filter(category='Environment').count() * 20,
            }
        })

    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        User = get_user_model()
        from inventory.models import InventoryItem
        from django.db.models import Sum
        
        monetary_sum = Donation.objects.filter(category='Monetary').aggregate(total=Sum('quantity'))['total'] or 0
        total_donations = Donation.objects.count()
        from users.models import VolunteerApplication
        active_volunteers = VolunteerApplication.objects.filter(status='Approved').count()
        
        food_item = InventoryItem.objects.filter(category='Food').first()
        food_stats = {
            'received': food_item.quantity if food_item else 0,
            'distributed': food_item.distributed if food_item else 0,
            'remaining': (food_item.quantity - food_item.distributed) if food_item else 0,
            'active': Donation.objects.filter(category='Food', status__in=['Pending', 'Scheduled']).count()
        }
        
        # Calculate distribution rate
        total_received = InventoryItem.objects.aggregate(total=Sum('quantity'))['total'] or 1
        total_distributed = InventoryItem.objects.aggregate(total=Sum('distributed'))['total'] or 0
        distribution_rate = (total_distributed / total_received) * 100
        
        return Response({
            'monetary_total': monetary_sum,
            'total_donations': total_donations,
            'active_volunteers': active_volunteers,
            'food_stats': food_stats,
            'distribution_rate': distribution_rate,
            'recent_monetary': Donation.objects.filter(category='Monetary').order_by('-timestamp')[:5].values('id', 'donor__username', 'quantity', 'timestamp')
        })

    def perform_create(self, serializer):
        serializer.save(donor=self.request.user)

    @action(detail=True, methods=['get'])
    def receipt(self, request, pk=None):
        donation = self.get_object()
        
        buffer = io.BytesIO()
        p = canvas.Canvas(buffer, pagesize=letter)
        p.drawString(100, 750, "EcoLink Donation Receipt")
        p.drawString(100, 730, f"Donation ID: {donation.id}")
        p.drawString(100, 710, f"Donor: {donation.donor.username}")
        p.drawString(100, 690, f"Category: {donation.category}")
        p.drawString(100, 670, f"Status: {donation.status}")
        p.drawString(100, 650, f"Date: {donation.timestamp.strftime('%Y-%m-%d %H:%M:%S')}")
        p.drawString(100, 630, f"Description: {donation.quantity_description}")
        p.showPage()
        p.save()
        buffer.seek(0)
        
        return FileResponse(buffer, as_attachment=True, filename=f'donation_receipt_{donation.id}.pdf')

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def assign_volunteer(self, request, pk=None):
        donation = self.get_object()
        volunteer_id = request.data.get('volunteer_id')
        try:
            pickup = donation.pickup_details
            pickup.volunteer_id = volunteer_id
            pickup.save()
            
            # Change status to scheduled if it was pending
            if donation.status == 'Pending':
                donation.status = 'Scheduled'
                donation.save()
                
            return Response({'status': 'Volunteer assigned'})
        except PickupDetails.DoesNotExist:
            return Response({'error': 'No pickup details found for this donation'}, status=status.HTTP_400_BAD_REQUEST)
