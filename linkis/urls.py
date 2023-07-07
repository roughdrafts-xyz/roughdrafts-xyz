from django.urls import include, path

from . import views

app_name = "linkis"
urlpatterns = [
    path("new", views.LinkiCreateView.as_view(), name="linki_create"),
    path('<slug:pk>',
         views.ArticleDetailView.as_view(), name="article_detail"),
    path("<str:username>/<str:linki_name>/", include([
        path('', views.LinkiDetailView.as_view(), name="linki_detail"),
        path('new', views.ArticleCreateView.as_view(), name="article_create"),
    ]))
]
