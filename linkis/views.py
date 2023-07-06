from typing import Any, Optional
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.models import User
from django.db import models
from django.shortcuts import get_object_or_404
from django.views.generic import DetailView, CreateView

from linkis.models import Linki


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
