from django.db import models
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver

class Message(models.Model):
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='sent_messages', on_delete=models.CASCADE)
    receiver = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='received_messages', on_delete=models.CASCADE)
    message_body = models.TextField()
    attachment_url = models.URLField(blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    read = models.BooleanField(default=False)

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f"From {self.sender.username} to {self.receiver.username}"

class Notification(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=200)
    message = models.TextField()
    read = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"Notification for {self.user.username}: {self.title}"

class NotificationPreference(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notification_preferences')
    new_donation = models.BooleanField(default=True)
    new_message = models.BooleanField(default=True)
    pickup_updates = models.BooleanField(default=True)
    low_stock = models.BooleanField(default=True)
    weekly_report = models.BooleanField(default=False)
    email_digest = models.BooleanField(default=True)

    def __str__(self):
        return f"Preferences for {self.user.username}"

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_user_preferences(sender, instance, created, **kwargs):
    if created:
        NotificationPreference.objects.get_or_create(user=instance)

@receiver(post_save, sender=Message)
def create_message_notification(sender, instance, created, **kwargs):
    if created:
        # If sender is not an admin, notify all admins
        if getattr(instance.sender, 'role', '') != 'ADMIN':
            from users.models import User
            from django.db.models import Q
            admins = User.objects.filter(Q(role='ADMIN') | Q(is_superuser=True))
            for admin in admins:
                # Check preference
                pref, _ = NotificationPreference.objects.get_or_create(user=admin)
                if pref.new_message:
                    Notification.objects.create(
                        user=admin,
                        title="New Message from User",
                        message=f"Message from {instance.sender.username}: {instance.message_body[:100]}..."
                    )
        # If sender is admin, notify the receiver
        else:
            pref, _ = NotificationPreference.objects.get_or_create(user=instance.receiver)
            if pref.new_message:
                Notification.objects.create(
                    user=instance.receiver,
                    title="New message from Admin",
                    message=instance.message_body[:100] + ("..." if len(instance.message_body) > 100 else "")
                )
