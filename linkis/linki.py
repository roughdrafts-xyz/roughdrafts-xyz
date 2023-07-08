from typing import Iterator
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from linki.connection import Connection
from linki.editor import Editor
from linki.repository import Repository, MemoryRepoConnection
from . import models
from msgspec import Struct, to_builtins
from linki.id import ID


class DjangoRepository(Repository):
    def __init__(self) -> None:
        self.connection = DjangoRepositoryConnection()
        # might want a LinkiRepoId or something here


class DjangoEditor(Editor):
    """
    Might need to customize Editor 
    """

    def __init__(self, repo: DjangoRepository) -> None:
        super().__init__(repo)
    pass


class DjangoConnection(Connection[Struct]):
    def __init__(self, manager: models.StructManager, user: User, linki: models.Linki) -> None:
        self.store = manager
        self.user = user
        self.linki = linki

    def __setitem__(self, __key: ID, __value: Struct) -> None:
        self.store.upsert_from_struct(self.linki, self.user, __key, __value)

    def __delitem__(self, __key: ID) -> None:
        try:
            val: models.LinkiModel = self.store.get(
                linki=self.linki, user=self.user, id=__key)

            val.delete()
        except self.store.model.DoesNotExist:
            raise KeyError

    def __getitem__(self, __key: ID) -> Struct:
        try:
            return self.store.get_as_struct(
                linki=self.linki, user=self.user, id=__key)
        except self.store.model.DoesNotExist:
            raise KeyError

    def __iter__(self) -> Iterator[ID]:
        for x in self.store.values_list('pk', flat=True).iterator():
            yield ID(x)

    def __len__(self) -> int:
        return self.store.count()


class DjangoRepositoryConnection(MemoryRepoConnection):
    styles = {  # 'titles': models.Title.objects,
        # 'subs': models.Sub,
        # 'contribs': models.Contrib,
        # 'drafts': models.Draft,
        'articles': models.Article.structs,
        # 'users': models.ContribUser,
        # 'changes': models.Change,
        # 'config': models.Config
    }

    def get_style(self, style: str, user: User, linki: models.Linki) -> DjangoConnection:
        model: models.StructManager = self.styles[style]
        model = model.filter(user=user, linki=linki)
        return DjangoConnection(model, user, linki)

    """
    TODO

    def get_style(self, style: str, user: User, linki: models.Linki) -> DjangoConnection:
        return self.get_connection(style, user, linki)

    @staticmethod
    def get_connection(style: str, user: User, linki: models.Linki) -> DjangoConnection:
        model: DjangoManager = self.styles[style]  # type: ignore
        model = model.filter(user=user, linki=linki)
        return DjangoConnection(model, user)
    """
