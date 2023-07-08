from django.urls import include, path

from . import views

app_name = "linkis"
urlpatterns = [
    path("new", views.LinkiCreateView.as_view(), name="linki_create"),
    path('<slug:pk>',
         views.ArticleDetailView.as_view(), name="article_detail"),
    path("<str:username>/<str:linki_name>/", include([
        path('', views.LinkiDetailView.as_view(), name="linki_detail"),
        path('new', views.TitleCreateView.as_view(), name="article_create"),
        path('<slug:pk>/edit', views.TitleUpdateView.as_view(), name="title_update"),
        path('<slug:pk>', views.TitleDetailView.as_view(), name="title_detail"),
    ]))
]
