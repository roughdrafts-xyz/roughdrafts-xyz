from datetime import datetime
from io import BytesIO
from typing import Any
from django.conf import settings
from django.contrib.auth import get_user_model, logout
from django.contrib.auth.models import User
from django.core.exceptions import PermissionDenied
from django.db import models
from django.http.response import HttpResponse, HttpResponseRedirect
from django.shortcuts import get_object_or_404
from django.template.loader import render_to_string
from django.urls import reverse_lazy
from django.utils.text import slugify
from django.views.generic import DetailView, ListView, UpdateView, DeleteView, CreateView, View
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.views.generic.detail import SingleObjectMixin
from django.http import HttpRequest, HttpResponse
from django import forms
import zipfile

from .models import Linki, Profile


class UserOwnsLinkiView(UserPassesTestMixin, SingleObjectMixin, View):
    def test_func(self) -> bool | None:
        obj: Linki = self.get_object()  # type: ignore
        if not obj.editor:
            return False

        return self.request.user.pk == obj.editor.pk

    def handle_no_permission(self) -> HttpResponseRedirect:
        obj: Linki = self.get_object()  # type: ignore
        return HttpResponseRedirect(obj.get_absolute_url())


class LinkiDetailView(DetailView):
    model = Linki

    def get_object(self, queryset=None):
        linki = get_linki(self, queryset)
        if (linki.privacy in [Linki.Privacy.PUBLIC, Linki.Privacy.UNLISTED]):
            return linki
        if (linki.editor == self.request.user):
            return linki
        raise PermissionDenied()


class LinkiMarkdownView(View):
    model = Linki

    def get(self, *args, **kwargs):
        linki = get_linki(self, None)
        res = HttpResponse(
            linki.content, content_type='text/plain;charset=UTF-8')
        if (linki.privacy in [Linki.Privacy.PUBLIC, Linki.Privacy.UNLISTED]):
            return res
        if (linki.editor == self.request.user):
            return res
        raise PermissionDenied()


class LinkiCreateView(LoginRequiredMixin, CreateView):
    model = Linki
    fields = Linki.editable_fields

    def form_valid(self, form):
        form.instance.editor = self.request.user
        return super().form_valid(form)


def get_linki(self, queryset=None):
    profile = get_object_or_404(
        Profile, profile_endpoint=slugify(self.kwargs["profile_endpoint"]))
    linki = get_object_or_404(
        Linki, url_endpoint=slugify(self.kwargs["linki_name"]), editor=profile.user)
    return linki


class LinkiUpdateView(UserOwnsLinkiView, UpdateView):
    model = Linki
    fields = Linki.editable_fields
    get_object = get_linki


class DeleteForm(forms.Form):
    url_endpoint = forms.SlugField()
    expected_endpoint = forms.SlugField(widget=forms.HiddenInput)

    def clean(self):
        form_data = self.cleaned_data
        url_endpoint = form_data.get("url_endpoint")
        expected_endpoint = form_data.get("expected_endpoint")
        if (url_endpoint != expected_endpoint):
            self.add_error("url_endpoint", "url needs to match")
        return form_data


class LinkiDeleteView(UserOwnsLinkiView, DeleteView):
    model = Linki
    success_url = reverse_lazy("linkis:list")
    form_class = DeleteForm
    get_object = get_linki

    def get_initial(self) -> dict[str, Any]:
        return {
            "url_endpoint": None,
            "expected_endpoint": self.object.url_endpoint  # type:ignore
        }


class ProfileDetailView(DetailView):
    model = Profile

    def render_to_response(self, context: dict[str, Any], **response_kwargs: Any) -> HttpResponse:
        profile = context.get("profile", None)
        if (profile is None):
            return HttpResponseRedirect(settings.LOGOUT_REDIRECT_URL)
        return super().render_to_response(context, **response_kwargs)

    def get_object(self, queryset=None):
        profile_endpoint = self.kwargs.get("profile_endpoint", None)
        if (profile_endpoint):
            profile = get_object_or_404(
                Profile, profile_endpoint=profile_endpoint)
        else:
            if (not self.request.user.is_authenticated):
                return None
            profile = get_object_or_404(
                Profile, user=self.request.user)
        if profile.user == self.request.user:
            linkis = Linki.objects.filter(editor=profile.user)
        else:
            linkis = Linki.objects.filter(editor=profile.user, privacy=2)
        profile.linkis = linkis  # type:ignore
        return profile


class ProfileUpdateView(LoginRequiredMixin, UpdateView):
    model = Profile
    fields = Profile.editable_fields

    def get_object(self, queryset=None):
        return Profile.objects.get(user=self.request.user)


class ProfileDeleteView(LoginRequiredMixin, DeleteView):
    model = Profile
    success_url = settings.LOGOUT_REDIRECT_URL
    form_class = DeleteForm

    def form_valid(self, form: Any) -> HttpResponse:
        user_pk = self.request.user.pk
        print(user_pk)
        logout(self.request)
        User = get_user_model()
        q = User.objects.filter(pk=user_pk)
        print(q)
        q.delete()
        print(q)
        return super().form_valid(form)  # type: ignore

    def get_object(self, queryset=None):
        return Profile.objects.get(user=self.request.user)

    def get_initial(self) -> dict[str, Any]:
        return {
            "url_endpoint": None,
            "expected_endpoint": self.object.url_endpoint  # type:ignore
        }


class LinkiPreview(View):
    def post(self, *args, **kwargs):
        content = self.request.body
        render = Linki.preview_render(content)
        return HttpResponse(render)


class DownloadDump(LoginRequiredMixin, View):
    def get(self, *args, **kwargs):
        output = BytesIO()
        linkis = Linki.objects.filter(editor=self.request.user)
        with zipfile.ZipFile(output, 'w') as zfile:
            time = datetime.now().timetuple()
            zfile.mkdir('markdown')
            zfile.mkdir('html')
            for linki in linkis:
                markdown = render_to_string(
                    "linkis/zip_markdown.txt", {"linki": linki})
                zfile.writestr(f'markdown/{linki.url_endpoint}.md', markdown)
                html = render_to_string(
                    "linkis/zip_html.html", {"linki": linki})
                zfile.writestr(f'html/{linki.url_endpoint}.html', html)
            zfile.close()

        response = HttpResponse(
            output.getvalue(), content_type='application/zip')
        f_name = self.request.user.profile.profile_endpoint  # type: ignore
        response['Content-Disposition'] = f"attachment; filename={f_name}-{time.tm_year}-{time.tm_mon}-{time.tm_mday}.zip"
        return response
