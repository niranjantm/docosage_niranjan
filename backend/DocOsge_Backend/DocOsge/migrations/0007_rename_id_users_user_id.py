# Generated by Django 5.0.6 on 2024-07-10 04:22

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('DocOsge', '0006_rename_user_id_users_id'),
    ]

    operations = [
        migrations.RenameField(
            model_name='users',
            old_name='id',
            new_name='user_id',
        ),
    ]
