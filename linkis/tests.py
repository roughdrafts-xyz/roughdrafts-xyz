from django import setup  # nopep8
setup()  # nopep8

from django.http.response import Http404
from .models import Article as DjangoArticle
from linki.article import Article as LinkiArticle
from linki.id import SimpleLabel
from .linki import DjangoConnection
from django.test import TestCase, Client
from django.contrib.auth.models import User


class DjangoConnectionTest(TestCase):
    def setUp(self) -> None:
        self.user = User.objects.create_user(
            'test', 'test@example.com', 'password')
        self.connection = DjangoConnection(  # its a manager, Lance.
            DjangoArticle.objects, self.user)  # type:ignore
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
        self.assertRedirects(res, f"/{self.user.username}/test-linki")


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
        """
        b'<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <meta name="description" content="Linkis" />\n    <meta name="keywords" content="linkis hosting" />\n    <meta http-equiv="X-UA-Compatible" content="IE=edge" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>\n      Roughdrafts XYZ\n    </title>\n    \n  </head>\n  <body>\n    <header>\n      <nav>\n        \n        \n        \n          <ul>\n            <li>logout</li>\n          </ul>\n        \n      </nav>\n    </header>\n    \n  <form method="post">\n    <input type="hidden" name="csrfmiddlewaretoken" value="gsUJ2KMRjGj0HI7cNi6xIzplxefEPP8EEUGKyIBm602J6s4w49du0QA9W5dFpqGl">\n    <div>\n    \n      <label for="id_name">Name:</label>\n    \n    \n    \n    <input type="text" name="name" value="test-article" maxlength="250" required id="id_name">\n    \n    \n</div>\n\n  <div>\n    \n      <label for="id_content">Content:</label>\n    \n    \n    <ul class="errorlist"><li>This field is required.</li></ul>\n    <textarea name="content" cols="40" rows="10" required id="id_content">\n</textarea>\n    \n    \n      \n    \n</div>\n  </form>\n\n    <footer>\n      \n      \n    </footer>\n  </body>\n</html>\n'
        """
