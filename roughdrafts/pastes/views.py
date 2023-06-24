from django.contrib.auth.models import User
from django.core.exceptions import PermissionDenied
from django.db import models
from django.http.response import HttpResponseRedirect
from django.shortcuts import get_object_or_404
from django.urls import reverse_lazy
from django.views.generic import DetailView, ListView, UpdateView, DeleteView, CreateView, View
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.views.generic.detail import SingleObjectMixin
from django.http import HttpResponse

from .models import Paste, Profile


class UserOwnsPasteView(UserPassesTestMixin, SingleObjectMixin, View):
    def test_func(self) -> bool | None:
        obj: Paste = self.get_object()  # type: ignore
        if not obj.editor:
            return False

        return self.request.user.pk == obj.editor.pk

    def handle_no_permission(self) -> HttpResponseRedirect:
        obj: Paste = self.get_object()  # type: ignore
        return HttpResponseRedirect(obj.get_absolute_url())


class PasteListView(LoginRequiredMixin, ListView):
    def get_queryset(self):
        return Paste.objects.filter(editor=self.request.user)


class ProfileListView(ListView):
    template_name = "pastes/paste_list.html"

    def get_queryset(self):
        profile = get_object_or_404(
            Profile, url_endpoint=self.kwargs["profile_name"])
        user = profile.user
        return Paste.objects.filter(editor=user)


class PasteDetailView(DetailView):
    model = Paste

    def get_object(self, queryset=None):
        profile = get_object_or_404(
            Profile, url_endpoint=self.kwargs["profile_name"])
        paste = get_object_or_404(
            Paste, url_endpoint=self.kwargs["paste_name"], editor=profile.user)
        if (paste.privacy in [Paste.Privacy.PUBLIC, Paste.Privacy.UNLISTED]):
            return paste
        if (paste.editor == self.request.user):
            return paste
        raise PermissionDenied()


class PasteCreateView(LoginRequiredMixin, CreateView):
    model = Paste
    fields = Paste.editable_fields

    def form_valid(self, form):
        form.instance.editor = self.request.user
        return super().form_valid(form)


def get_paste(self, queryset=None):
    profile = get_object_or_404(
        Profile, url_endpoint=self.kwargs["profile_name"])
    paste = get_object_or_404(
        Paste, url_endpoint=self.kwargs["paste_name"], editor=profile.user)
    return paste


class PasteUpdateView(UserOwnsPasteView, UpdateView):
    model = Paste
    fields = Paste.editable_fields
    get_object = get_paste


class PasteDeleteView(UserOwnsPasteView, DeleteView):
    model = Paste
    success_url = reverse_lazy("pastes:list")
    get_object = get_paste


class ProfileUpdateView(LoginRequiredMixin, UpdateView):
    model = Profile
    fields = Profile.editable_fields

    def get_object(self, queryset=None):
        return Profile.objects.get(user=self.request.user)


class PastePreview(View):
    def post(self, *args, **kwargs):
        content = self.request.body
        render = Paste.preview_render(content)
        return HttpResponse(render)
