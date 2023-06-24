from django.urls import include, path

from . import views

app_name = "pastes"
urlpatterns = [
    path("", views.PasteListView.as_view(), name="list"),
    path("profile/edit",
         views.ProfileUpdateView.as_view(), name="profile.edit"),
    path("profile/<int:user_id>", views.ProfileListView.as_view(), name="profile"),
    path("<int:pk>/", views.PasteDetailView.as_view(), name="detail"),
    path("<int:pk>/edit",
         views.PasteUpdateView.as_view(), name="update"),
    path("<int:pk>/delete",
         views.PasteDeleteView.as_view(), name="delete"),
    path("create", views.PasteCreateView.as_view(), name="create"),
    path("preview", views.PastePreview.as_view(), name="preview"),
]
