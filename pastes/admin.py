from django.contrib import admin
from .models import Paste, Profile

admin.site.register([Paste, Profile])
