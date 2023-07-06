from django_json_widget.widgets import JSONEditorWidget
from django.db import models
from django.contrib import admin
from .models import Article, Profile, Linki

admin.site.register([Profile, Linki])


class LinkiModelAdmin(admin.ModelAdmin):
    formfield_overrides = {
        models.JSONField: {'widget': JSONEditorWidget},
    }


@admin.register(Article)
class ArticleModelAdmin(LinkiModelAdmin):
    pass
