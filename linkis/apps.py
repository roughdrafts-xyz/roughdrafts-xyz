from django.apps import AppConfig


class LinkisConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'linkis'

    def ready(self):
        from . import receivers
        return super().ready()
