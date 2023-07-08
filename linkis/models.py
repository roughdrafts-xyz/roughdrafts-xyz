from collections.abc import Callable
from json import JSONDecoder, JSONEncoder
from typing import Any, Iterable, MutableMapping, Optional, Self, Tuple, Type
from django.db import models
from django.contrib.auth.models import User
from django.db.models.query import QuerySet
from django.utils.text import slugify
from django.urls import reverse
from linki.article import BaseArticle as LinkiArticle
from linki.id import ID

from msgspec import Struct, to_builtins
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


class StructManager(models.Manager):
    model: 'LinkiModel'

    def get_as_struct(self, *args: Any, **kwargs: Any) -> Struct:
        item: LinkiModel = super().get(*args, **kwargs)
        return item.as_linki_type()

    def upsert_from_struct(self, linki: Linki, user: User, id: ID, struct: Struct) -> Struct:
        try:
            return self.update_from_struct(
                linki=linki, user=user, id=id, struct=struct)
        except self.model.DoesNotExist:
            return self.create_from_struct(
                linki=linki, user=user, struct=struct)

    def update_from_struct(self, linki: Linki, user: User, id: ID, struct: Struct) -> Struct:
        item: 'LinkiModel' = super().get(linki=linki, user=user, id=id)
        item.linki = linki
        item.user = user
        item.data = to_builtins(struct)
        item.save()
        return item.as_linki_type()

    def create_from_struct(self, linki: Linki, user: User, struct: Struct) -> Struct:
        item = self.model.from_linki_type(linki, user, struct)
        item.save()
        return item.as_linki_type()


class LinkiModel(HasUser, models.Model):
    linki = models.ForeignKey(Linki, on_delete=models.CASCADE)
    structs = StructManager()
    id = models.CharField(
        max_length=56, default='00000000000000000000000000000000000000000000000000000000',
        primary_key=True,
        editable=False
    )

    data = models.JSONField(default=dict)

    editable_fields = ['data']
    linki_type: Type[Struct]

    def as_linki_type(self):
        return convert(self.data, type=self.linki_type)

    @classmethod
    def from_linki_type(self, linki: Linki, user: User, struct: Struct) -> Self:
        raise NotImplementedError

    def __str__(self) -> str:
        return str(self.as_linki_type())

    class Meta:
        abstract = True


class ArticleBase(LinkiModel, HasPrivacy):
    rendered_content = models.TextField()
    linki_type = LinkiArticle

    def save(self, *args, **kwargs):
        self.rendered_content = self.preview_render(self.data["content"])
        super().save(*args, **kwargs)  # Call the "real" save() method.

    def get_absolute_url(self):
        return reverse("linkis:article_detail", kwargs={
            "pk": self.id
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

    class Meta:
        abstract = True


class Article(ArticleBase):
    pass


class Title(ArticleBase):
    name = models.CharField(max_length=250)

    def save(self, *args, **kwargs):
        self.name = self.data['label']['path'][-1]
        super().save(*args, **kwargs)  # Call the "real" save() method.
