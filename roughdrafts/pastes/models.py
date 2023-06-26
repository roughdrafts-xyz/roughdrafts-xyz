from collections.abc import Collection, Iterable
from django.db import models
from django.urls import reverse
from django.contrib.auth.models import User
from django.utils.text import slugify
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

    editor = models.ForeignKey(User, on_delete=models.CASCADE)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def clean_fields(self, exclude) -> None:
        if not self.url_endpoint:
            self.url_endpoint = slugify(self.title)
        return super().clean_fields(exclude)

    def save(self, *args, **kwargs):
        self.rendered_content = self.preview_render(self.content)
        super().save(*args, **kwargs)  # Call the "real" save() method.

    def get_absolute_url(self):
        profile_endpoint = self.editor.profile.profile_endpoint  # type: ignore
        return reverse("pastes:detail", kwargs={
            "profile_endpoint": profile_endpoint,
            "paste_name": self.url_endpoint
        })

    @staticmethod
    def preview_render(content):
        return clean(convert_text(content, 'html', format='gfm'))

    def __str__(self) -> str:
        return self.summary or self.content[:140]


class Profile(models.Model):
    editable_fields = ["display_name", "profile_endpoint", "summary"]
    user: User = models.OneToOneField(
        User, on_delete=models.CASCADE)  # type: ignore

    url_endpoint = models.SlugField(null=True, unique=True)
    profile_endpoint = models.SlugField(null=True, blank=True, unique=True)
    display_name = models.CharField(max_length=140, null=True, blank=True)
    summary = models.CharField(max_length=140, null=True, blank=True)

    def save(self, *args, **kwargs):
        self.profile_endpoint = self.get_url_endpoint()
        self.url_endpoint = self.profile_endpoint
        super().save(*args, **kwargs)  # Call the "real" save() method.

    @classmethod
    def get_get_safe_url(cls, user):
        def get_safe_url(url):
            if (url):
                p_endpoint = slugify(url)
                if not cls.objects.exclude(user=user).filter(url_endpoint=p_endpoint).exists():
                    return p_endpoint
        return get_safe_url

    def get_url_endpoint(self):
        get_safe_url = self.get_get_safe_url(self.user)
        safe_url = get_safe_url(self.profile_endpoint)
        if (safe_url):
            return safe_url
        safe_url = get_safe_url(self.display_name)
        if (safe_url):
            return safe_url
        safe_url = get_safe_url(self.user.username)
        if (safe_url):
            return safe_url

    @property
    def profile_name(self):
        if (self.display_name):
            return self.display_name
        return self.user.username

    def get_absolute_url(self):
        return reverse("pastes:profile", kwargs={"profile_endpoint": self.url_endpoint})

    def __str__(self) -> str:
        return self.user.username
