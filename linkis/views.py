from typing import Any, Dict
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from django.views.generic import DetailView, CreateView, TemplateView
from django.views.generic.edit import FormView
from linki.article import Article as LinkiArticle, ArticleCollection
from linki.title import TitleCollection
from linki.id import SimpleLabel
from linkis.forms import ArticleForm
from linkis.linki import DjangoConnection

from linkis.models import Article, Linki, Title


class LinkiDetailView(DetailView):
    model = Linki

    def get_object(self, queryset=None):
        user = get_object_or_404(User, username=self.kwargs["username"])
        linki = get_object_or_404(
            Linki, user=user, name=self.kwargs["linki_name"])
        titles = Title.structs.filter(linki=linki).all()
        linki.titles = titles  # type: ignore
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
    model = Title

    def get_object(self, queryset=None):
        user = self.request.user
        linki = self.kwargs["linki_name"]
        linki = get_object_or_404(Linki, user=user, name=linki)
        name = self.kwargs["pk"]
        return Title.structs.get(user=user, linki=linki, name=name)


class TitleHistoryView(TemplateView):
    template_name = "linkis/title_history.html"


class TitleCreateView(LoginRequiredMixin, FormView):
    template_name = "linkis/article_form.html"
    form_class = ArticleForm

    def form_valid(self, form):
        user = self.request.user
        linki = self.kwargs["linki_name"]
        linki = get_object_or_404(Linki, user=user, name=linki)
        article_collection = ArticleCollection(DjangoConnection(
            Article.structs,
            self.request.user,  # type: ignore
            linki
        ))

        title_collection = TitleCollection(DjangoConnection(
            Title.structs,
            self.request.user,  # type: ignore
            linki
        ))

        name = form.cleaned_data["name"]
        content = form.cleaned_data["content"]
        label = SimpleLabel(name)

        article = LinkiArticle(label=label, content=content, editOf=None)
        article_collection.merge_article(article)
        title_collection.set_title(article)

        article = Article.structs.get(id=article.articleId)
        self.success_url = article.get_absolute_url()
        return super().form_valid(form)


class TitleUpdateView(LoginRequiredMixin, FormView):
    template_name = "linkis/article_form.html"
    form_class = ArticleForm

    def get_initial(self) -> Dict[str, Any]:
        user = self.request.user
        linki = self.kwargs["linki_name"]
        pk = self.kwargs["pk"]
        linki = get_object_or_404(Linki, user=user, name=linki)
        title = get_object_or_404(
            Title, linki=linki, user=user, name=pk)
        return {'name': title.name, 'content': title.data["content"]}

    def form_valid(self, form):
        user = self.request.user
        linki = self.kwargs["linki_name"]
        linki = get_object_or_404(Linki, user=user, name=linki)
        article_collection = ArticleCollection(DjangoConnection(
            Article.structs,
            self.request.user,  # type: ignore
            linki
        ))

        title_collection = TitleCollection(DjangoConnection(
            Title.structs,
            self.request.user,  # type: ignore
            linki
        ))

        name = form.cleaned_data["name"]
        content = form.cleaned_data["content"]
        label = SimpleLabel(name)

        title = title_collection.get_title(label)
        edit_of = None
        if (title):
            edit_of = article_collection.get_article(title.articleId)

        article = LinkiArticle(label=label, content=content, editOf=edit_of)
        title_collection.set_title(article)
        article_collection.merge_article(article)

        article = Article.structs.get(id=article.articleId)
        self.success_url = article.get_absolute_url()
        return super().form_valid(form)
