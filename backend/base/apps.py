from django.apps import AppConfig


class BaseConfig(AppConfig):
    def ready(self):
        # Import signals
        import base.signals
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'base'
