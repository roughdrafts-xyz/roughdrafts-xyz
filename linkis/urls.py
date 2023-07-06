from django.urls import include, path

from . import views

app_name = "linkis"
urlpatterns = [
    path("new", views.LinkiCreateView.as_view(), name="linki_new"),
    path("<str:username>/<str:linki_name>",
         views.LinkiDetailView.as_view(), name="linki_detail"),
]
