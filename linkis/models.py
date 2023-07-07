from collections.abc import Callable
from json import JSONDecoder, JSONEncoder
from typing import Any, Iterable, Optional, Type
from django.db import models
from django.contrib.auth.models import User
from django.db.models.query import QuerySet
from django.utils.text import slugify
from django.urls import reverse
from linki.article import BaseArticle as LinkiArticle

from msgspec import Struct
from pypandoc import convert_text
from nh3 import clean
from msgspec import convert


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

    def __str__(self) -> str:
        return self.user.username


class HasUser(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    class Meta:
        abstract = True


class HasPrivacy(models.Model):
    class Privacy(models.IntegerChoices):
        PRIVATE = 0
        UNLISTED = 1
        PUBLIC = 2

    privacy = models.IntegerField(
        choices=Privacy.choices, default=Privacy.UNLISTED)

    class Meta:
        abstract = True


class Linki(HasPrivacy, HasUser, models.Model):
    name = models.CharField(max_length=250)
    editable_fields = ['name']

    def get_absolute_url(self):
        return reverse("linkis:linki_detail", kwargs={
            "username": self.user.username,
            "linki_name": self.name
        })

    """
    TODO
    def get_django_connection(self, style: str):
        return DjangoRepositoryConnection.get_connection(style, self.user, self)
    """


class LinkiModel(HasUser, models.Model):
    linki = models.ForeignKey(Linki, on_delete=models.CASCADE)
    label_id = models.CharField(
        max_length=56, default='00000000000000000000000000000000000000000000000000000000',
        primary_key=True,
        editable=False
    )

    data = models.JSONField(default=dict)

    editable_fields = ['data']
    linki_type: Type[Struct]

    def as_linki_type(self):
        return convert(self.data, type=self.linki_type)

    def __str__(self) -> str:
        return self.label_id

    class Meta:
        abstract = True


class Article(LinkiModel, HasPrivacy):
    rendered_content = models.TextField()
    linki_type = LinkiArticle

    def save(self, *args, **kwargs):
        self.rendered_content = self.preview_render(self.data["content"])
        super().save(*args, **kwargs)  # Call the "real" save() method.

    def get_absolute_url(self):
        return reverse("linkis:article_detail", kwargs={
            "pk": self.label_id
        })

    @staticmethod
    def preview_render(content):
        # this is dumb but its to prevent trying to render yaml
        # TODO could be fixed by using a different markdown renderer
        # pypandoc is currently being used because its what linki uses
        # and at the time of writing I want compatibility between this and that.
        from_f = 'markdown_github-pandoc_title_block'
        html = convert_text(content, 'html', format=from_f,
                            extra_args=['--quiet'])
        return clean(html)


class Title(Article):
    pass
