from typing import Any, Optional
from django import forms
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.models import User
from django.db import models
from django.shortcuts import get_object_or_404
from django.views.generic import DetailView, CreateView
from django.views import View
from django.views.generic.edit import FormView
from linki.article import Article as LinkiArticle, ArticleCollection
from linki.id import SimpleLabel
from linkis.linki import DjangoConnection
from django.http.response import HttpResponse

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


class TitleDetailView(DetailView):
    model = Article

    def get_object(self, queryset=None):
        article = Article.objects.get(
            label_id='d0c395f98cd103e0473897d55fa38a9eb5b798bad391d09269f73c3f')
        article.label_id = '07fe069682de9fbea1e204a97aa08fcc92fbfa0b72d6c2b342c049b7'
        return article

    """
    def get_object(self, queryset=None):
        if (paste.privacy in [Paste.Privacy.PUBLIC, Paste.Privacy.UNLISTED]):
            return paste
        if (paste.editor == self.request.user):
            return paste
        raise PermissionDenied()
    """


class ArticleForm(forms.Form):
    name = forms.CharField(max_length=250)
    content = forms.CharField(widget=forms.Textarea)
    pass


class ArticleCreateView(LoginRequiredMixin, FormView):
    model = LinkiArticle
    collection = ArticleCollection
    template_name = "article_form.html"
    form_class = ArticleForm

    def form_valid(self, form):
        user = self.request.user
        linki = self.kwargs["linki_name"]
        linki = get_object_or_404(Linki, user=user, name=linki)

        collection = self.collection(DjangoConnection(
            Article.objects,  # type: ignore
            self.request.user,  # type: ignore
            linki
        ))

        name = form.cleaned_data["name"]
        content = form.cleaned_data["content"]
        label = SimpleLabel(name)

        article = LinkiArticle(label=label, content=content, editOf=None)
        collection.merge_article(article)
        article = Article.objects.get(label_id=article.articleId)
        self.success_url = Article.get_absolute_url(article)
        return super().form_valid(form)
