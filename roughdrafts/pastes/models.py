from collections.abc import Iterable
from enum import Enum
from django.db import models
from django.urls import reverse
from django.contrib.auth.models import User
from pypandoc import convert_text
from nh3 import clean


class Paste(models.Model):
    class Privacy(models.IntegerChoices):
        PRIVATE = 0
        UNLISTED = 1
        PUBLIC = 2

    editable_fields = ["title", "summary",
                       "url_endpoint", "privacy", "content"]
    summary = models.CharField(max_length=140, blank=True)
    url_endpoint = models.SlugField(blank=True)
    privacy = models.IntegerField(
        choices=Privacy.choices, default=Privacy.UNLISTED)

    title = models.CharField(max_length=140)
    content = models.TextField()
    rendered_content = models.TextField()

    editor = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True)

    def save(self, *args, **kwargs):
        self.rendered_content = self.preview_render(self.content)
        super().save(*args, **kwargs)  # Call the "real" save() method.

    def get_absolute_url(self):
        return reverse("pastes:detail", kwargs={"pk": self.pk})

    @staticmethod
    def preview_render(content):
        return clean(convert_text(content, 'html', format='gfm'))

    def __str__(self) -> str:
        return self.summary or self.content[:140]


class Profile(models.Model):
    user: User = models.OneToOneField(
        User, on_delete=models.SET_NULL, null=True, blank=True)  # type: ignore

    url_endpoint = models.SlugField(blank=True)
    display_name = models.CharField(max_length=140, blank=True)
    summary = models.CharField(max_length=140, blank=True)

    @property
    def profile_name(self):
        if (self.display_name):
            return self.display_name
        return self.user.username

    def get_absolute_url(self):
        return reverse("pastes:profile", kwargs={"user_id": self.user.pk})

    def __str__(self) -> str:
        return self.user.username
