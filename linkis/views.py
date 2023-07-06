from typing import Any, Optional
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.models import User
from django.db import models
from django.shortcuts import get_object_or_404
from django.views.generic import DetailView, CreateView

from linkis.models import Article, Linki


class LinkiDetailView(DetailView):
    model = Linki

    def get_object(self, queryset=None):
        user = get_object_or_404(User, username=self.kwargs["username"])
        linki = get_object_or_404(
            Linki, user=user, name=self.kwargs["linki_name"])
        return linki

    """
    def get_object(self, queryset=None):
        if (paste.privacy in [Paste.Privacy.PUBLIC, Paste.Privacy.UNLISTED]):
            return paste
        if (paste.editor == self.request.user):
            return paste
        raise PermissionDenied()
    """


class LinkiCreateView(LoginRequiredMixin, CreateView):
    model = Linki
    fields = Linki.editable_fields

    def form_valid(self, form):
        form.instance.user = self.request.user
        return super().form_valid(form)


class ArticleDetailView(DetailView):
    model = Article

    def get_object(self, queryset=None):
        user = get_object_or_404(User, username=self.kwargs["username"])
        linki = get_object_or_404(
            Linki, user=user, name=self.kwargs["linki_name"])
        article = get_object_or_404(
            Article, user=user, linki=linki, name=self.kwargs["article_name"]
        )
        return article

    """
    def get_object(self, queryset=None):
        if (paste.privacy in [Paste.Privacy.PUBLIC, Paste.Privacy.UNLISTED]):
            return paste
        if (paste.editor == self.request.user):
            return paste
        raise PermissionDenied()
    """


class ArticleCreateView(LoginRequiredMixin, CreateView):
    model = Article
    fields = Article.editable_fields

    def form_valid(self, form):
        user = self.request.user
        linki = self.kwargs["linki_name"]
        linki = get_object_or_404(Linki, user=user, name=linki)

        name = form.cleaned_data["name"]
        content = form.cleaned_data["content"]

        form.instance.user = user
        form.instance.linki = linki
        form.instance.data["label"] = [name]
        form.instance.data["content"] = content
        return super().form_valid(form)
