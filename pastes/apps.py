from django.apps import AppConfig


class PastesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'pastes'

    def ready(self):
        from . import receivers
        return super().ready()
