from django.urls import include, path

from . import views

app_name = "linkis"
urlpatterns = [
    path("", views.ProfileDetailView.as_view(), name="list"),
    path("create", views.LinkiCreateView.as_view(), name="create"),
    path("preview", views.LinkiPreview.as_view(), name="preview"),
    path("edit",
         views.ProfileUpdateView.as_view(), name="profile.edit"),
    path("delete",
         views.ProfileDeleteView.as_view(), name="profile.delete"),
    path("download",
         views.DownloadDump.as_view(), name="profile.download"),
    path('<slug:profile_endpoint>/', include([
        path("", views.ProfileDetailView.as_view(), name="profile"),
        path("<slug:linki_name>.md",
             views.LinkiMarkdownView.as_view(), name="markdown"),
        path('<slug:linki_name>/', include([
            path("", views.LinkiDetailView.as_view(), name="detail"),
            path("edit",
             views.LinkiUpdateView.as_view(), name="update"),
            path("delete",
             views.LinkiDeleteView.as_view(), name="delete"),
        ])),
    ])),
]
