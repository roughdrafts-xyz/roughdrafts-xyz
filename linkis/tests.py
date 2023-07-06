from django import setup  # nopep8
setup()  # nopep8

from django.http.response import Http404
from .models import Article as DjangoArticle, Linki
from linki.article import Article as LinkiArticle
from linki.id import SimpleLabel
from .linki import DjangoConnection
from django.test import TestCase, Client
from django.contrib.auth.models import User


class DjangoConnectionTest(TestCase):
    def setUp(self) -> None:
        self.user = User.objects.create_user(
            'test', 'test@example.com', 'password')
        self.linki = Linki.objects.create(name="test-linki", user=self.user)
        self.connection = DjangoConnection(  # its a manager, Lance.
            DjangoArticle.objects, self.user, self.linki)  # type: ignore
        self.label = SimpleLabel('key')
        self.label_id = self.label.labelId
        self.linkiArticle = LinkiArticle(self.label, '', None)

    def test_basic_functions(self):

        def get_article():
            return self.connection[self.label_id]

        def del_article():
            del self.connection[self.label_id]

        def has_article():
            return self.label_id in self.connection

        self.assertRaises(Http404, get_article)

        # set and get a key
        self.connection[self.label_id] = self.linkiArticle
        self.assertEqual(get_article(), self.linkiArticle)
        self.assertEqual(True, has_article())
        self.assertEqual(len(self.connection), 1)

        del_article()
        self.assertRaises(Http404, get_article)
        self.assertRaises(Http404, del_article)
        self.assertRaises(Http404, has_article)
        self.assertEqual(len(self.connection), 0)


class LinkiPathTest(TestCase):
    def setUp(self) -> None:
        self.user = User.objects.create_user(
            'test', 'test@example.com', 'password')
        self.client: Client = Client(SERVER_NAME='localhost')
        self.client.force_login(self.user)

    def test_make_new(self):
        # it should make it and redirect you to it.
        res = self.client.post('/new', {'name': 'test-linki'})
        self.assertRedirects(res, f"/{self.user.username}/test-linki/")


class ArticlePathTest(TestCase):
    def setUp(self) -> None:
        self.user = User.objects.create_user(
            'test', 'test@example.com', 'password')
        self.client: Client = Client(SERVER_NAME='localhost')
        self.client.force_login(self.user)
        self.client.post('/new', {'name': 'test-linki'})
        self.l_url = f"/{self.user.username}/test-linki"

    def test_make_new(self):
        # it should make it and redirect you to it.
        l_url = self.l_url
        res = self.client.post(
            f"{l_url}/new",
            {'name': 'test-article', 'content': 'Test Content.'}
        )
        self.assertRedirects(res, f"{l_url}/test-article")
