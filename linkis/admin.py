from django.contrib import admin
from .models import Article, Profile

admin.site.register([Article, Profile])
