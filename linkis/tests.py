from abc import ABC
from django import setup  # nopep8
setup()  # nopep8
from django.utils.safestring import SafeText
from .models import Article as DjangoArticle, Linki, Title as DjangoTitle
from linki.article import Article as LinkiArticle, ArticleCollection
from linki.title import Title as LinkiTitle, TitleCollection
from linki.id import SimpleLabel
from .linki import DjangoConnection
from django.test import TestCase, Client
from django.contrib.auth.models import User


class UsesLinki(TestCase, ABC):
    def setUp(self) -> None:
        self.client: Client = Client(SERVER_NAME='localhost')

        self.user = User.objects.create_user(
            'test', 'test@example.com', 'password')
        self.client.force_login(self.user)

        self.linki = Linki.objects.create(name="test-linki", user=self.user)
        self.l_url = f"/{self.user.username}/test-linki"

        self.label = SimpleLabel('test-article')
        self.label_id = self.label.labelId


class DjangoConnectionTest(TestCase):
    def setUp(self) -> None:
        self.user = User.objects.create_user(
            'test', 'test@example.com', 'password')
        self.linki = Linki.objects.create(name="test-linki", user=self.user)
        self.label = SimpleLabel('key')
        self.label_id = self.label.labelId

    def test_basic_function(self):
        linkiArticle = LinkiArticle(self.label, '', None)
        article_id = linkiArticle.articleId
        connection = DjangoConnection(
            DjangoArticle.structs, self.user, self.linki)

        def get_article():
            return connection[article_id]

        def del_article():
            del connection[article_id]

        def has_article():
            return article_id in connection

        self.assertRaises(KeyError, get_article)
        self.assertRaises(KeyError, del_article)
        self.assertFalse(has_article())
        self.assertEqual(len(connection), 0)

        # set and get a key
        connection[article_id] = linkiArticle
        self.assertEqual(get_article(), linkiArticle)
        self.assertTrue(has_article())
        self.assertEqual(len(connection), 1)

        del_article()
        self.assertRaises(KeyError, get_article)
        self.assertRaises(KeyError, del_article)
        self.assertFalse(has_article())
        self.assertEqual(len(connection), 0)

    def test_article(self):
        linkiArticle = LinkiArticle(self.label, '', None)
        article_id = linkiArticle.articleId
        connection = DjangoConnection(
            DjangoArticle.structs, self.user, self.linki)
        collection = ArticleCollection(connection)  # type: ignore
        collection.merge_article(linkiArticle)

        res = connection[article_id]
        self.assertEqual(res, linkiArticle)

    def test_title(self):
        linkiArticle = LinkiTitle(self.label, 'old text', None)
        title_id = linkiArticle.label.labelId
        article_id = linkiArticle.articleId

        connection = DjangoConnection(
            DjangoTitle.structs, self.user, self.linki)
        collection = TitleCollection(connection)  # type: ignore
        collection.set_title(linkiArticle)

        res = connection[title_id]
        self.assertEqual(res, linkiArticle)

        def get_article():
            return connection[article_id]

        self.assertRaises(KeyError, get_article)


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


class ArticlePathTest(UsesLinki, TestCase):
    def setUp(self) -> None:
        super().setUp()
        self.linkiArticle = LinkiArticle(self.label, 'Test Content.', None)

    def test_make_new(self):
        # it should make it and redirect you to it.
        l_url = self.l_url
        res = self.client.post(
            f"{l_url}/new",
            {'name': self.linkiArticle.label.name,
                'content': self.linkiArticle.content}
        )
        self.assertRedirects(res, f"/{self.linkiArticle.articleId}")


class TitlePathTest(UsesLinki, TestCase):
    def setUp(self) -> None:
        super().setUp()
        self.linkiArticle = LinkiArticle(self.label, 'Test Content.', None)
        self.client.post(
            f"{self.l_url}/new",
            {'name': self.linkiArticle.label.name,
                'content': self.linkiArticle.content}
        )

    def test_make_new(self):
        res = self.client.get(f"{self.l_url}/{self.linkiArticle.label.name}")
        b_content: bytes = res.content
        content = SafeText(b_content.decode())

        self.assertIn(self.linkiArticle.label.name, content)
        self.assertIn(self.linkiArticle.content, content)
        self.assertIn(self.linkiArticle.label.labelId, content)

    def test_update_title(self):
        linkiArticle = LinkiArticle(
            self.label, 'New Test Content.', self.linkiArticle)

        res = self.client.post(
            f'/{self.user.username}/test-linki/{self.linkiArticle.label.name}/edit',
            {'name': linkiArticle.label.name,
                'content': linkiArticle.content}
        )

        res = self.client.get(
            f'/{self.user.username}/test-linki/{linkiArticle.label.name}')
        b_content: bytes = res.content
        content = SafeText(b_content.decode())

        self.assertIn(linkiArticle.label.name, content)
        self.assertIn(linkiArticle.label.labelId, content)
        self.assertIn(linkiArticle.content, content)
        self.assertIn(linkiArticle.articleId, content)

    def test_update_makes_article(self):
        linkiArticle = LinkiArticle(
            self.label, 'New Test Content.', self.linkiArticle)

        res = self.client.post(
            f'/{self.user.username}/test-linki/{self.linkiArticle.label.name}',
            {'name': linkiArticle.label.name,
                'content': linkiArticle.content}
        )

        res = self.client.get(f"/{self.linkiArticle.articleId}")
        b_content: bytes = res.content
        content = SafeText(b_content.decode())

        self.assertIn(self.linkiArticle.label.name, content)
        self.assertIn(self.linkiArticle.label.labelId, content)
        self.assertIn(self.linkiArticle.content, content)
        self.assertIn(self.linkiArticle.articleId, content)


class TitleHistoryTest(UsesLinki):
    def setUp(self) -> None:
        super().setUp()
        linkiUpdates = ['initial content', 'second content', 'third content']
        self.linkiArticles = []
        prev = None
        for update in linkiUpdates:
            prev = LinkiArticle(self.label, update, prev)
            self.linkiArticles.append(prev)

        self.client.post(
            f"{self.l_url}/new",
            {'name': self.linkiArticles[0].label.name,
                'content': self.linkiArticles[0].content}
        )

        def post_update(article):
            self.client.post(
                f'/{self.user.username}/test-linki/{article.label.name}',
                {'name': article.label.name,
                    'content': article.content}
            )

        post_update(self.linkiArticles[1])
        post_update(self.linkiArticles[2])

    def test_title_has_history(self):
        article = self.linkiArticles[0]
        res = self.client.get(
            f'/{self.user.username}/test-linki/{article.label.name}/history')
        b_content: bytes = res.content
        content = SafeText(b_content.decode())
        for s_article in self.linkiArticles:
            self.assertIn(s_article.articleId, content)
