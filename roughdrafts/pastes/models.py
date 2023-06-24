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

    class Meta:
        constraints = [
            models.UniqueConstraint(
                "editor", "url_endpoint", name="editor_paste_url_endpoint")
        ]

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
        if self.editor is None:
            profile_name = "unclaimed"
        else:
            profile_name = self.editor.profile.url_endpoint  # type: ignore
        return reverse("pastes:detail", kwargs={
            "profile_name": profile_name,
            "paste_name": self.url_endpoint
        })

    @staticmethod
    def preview_render(content):
        return clean(convert_text(content, 'html', format='gfm'))

    def __str__(self) -> str:
        return self.summary or self.content[:140]


class Profile(models.Model):
    editable_fields = ["display_name", "url_endpoint", "summary"]
    user: User = models.OneToOneField(
        User, on_delete=models.SET_NULL, null=True, blank=True)  # type: ignore

    url_endpoint = models.SlugField(blank=True, unique=True)
    display_name = models.CharField(max_length=140, blank=True)
    summary = models.CharField(max_length=140, blank=True)

    @property
    def profile_name(self):
        if (self.display_name):
            return self.display_name
        return self.user.username

    def get_absolute_url(self):
        return reverse("pastes:profile", kwargs={"profile_name": self.url_endpoint})

    def __str__(self) -> str:
        return self.user.username
