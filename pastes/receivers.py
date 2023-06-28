from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Profile


@receiver(post_save, sender=User)
def receive(sender, **kwargs):
    created = kwargs["created"]
    user = kwargs["instance"]
    if (created):
        print("new user", sender)
        profile = Profile(user=user)
        profile.save()
