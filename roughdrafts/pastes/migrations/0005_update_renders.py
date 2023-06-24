# Generated by Django 4.2.2 on 2023-06-23 08:34

from django.db import migrations


def rerender_pastes(apps, schema_editor):
    Paste = apps.get_model("pastes", "Paste")
    for paste in Paste.objects.all():
        paste.rendered_content = paste.content
        paste.save()


def no_op(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('pastes', '0004_paste_rendered_content'),
    ]

    operations = [
        migrations.RunPython(rerender_pastes, no_op)
    ]