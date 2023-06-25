from django.urls import include, path

from . import views

app_name = "pastes"
urlpatterns = [
    path("", views.ProfileDetailView.as_view(), name="list"),
    path("create", views.PasteCreateView.as_view(), name="create"),
    path("preview", views.PastePreview.as_view(), name="preview"),
    path("edit",
         views.ProfileUpdateView.as_view(), name="profile.edit"),
    path("delete",
         views.ProfileDeleteView.as_view(), name="profile.delete"),
    path('<slug:profile_endpoint>/', include([
        path("", views.ProfileDetailView.as_view(), name="profile"),
        path('<slug:paste_name>/', include([
            path("", views.PasteDetailView.as_view(), name="detail"),
            path("edit",
             views.PasteUpdateView.as_view(), name="update"),
            path("delete",
             views.PasteDeleteView.as_view(), name="delete"),
        ])),
    ])),
]
