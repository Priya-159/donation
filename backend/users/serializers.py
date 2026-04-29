from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import VolunteerApplication

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'phone_number', 'city', 'profile_picture', 'is_staff', 'is_superuser']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name', 'role', 'phone_number', 'city']
        
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            role=validated_data.get('role', 'DONOR'),
            phone_number=validated_data.get('phone_number', ''),
            city=validated_data.get('city', '')
        )
        return user

class VolunteerApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = VolunteerApplication
        fields = ['id', 'name', 'email', 'phone', 'city', 'volunteering_role', 'message', 'status', 'created_at']
        read_only_fields = ['status', 'created_at']

class AdminVolunteerApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = VolunteerApplication
        fields = '__all__'
        read_only_fields = ['created_at']
