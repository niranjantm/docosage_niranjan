# Generated by Django 5.0.6 on 2024-08-27 06:29

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('DocOsge', '0006_alter_doctoravailability_start_time'),
    ]

    operations = [
        migrations.AlterField(
            model_name='doctoravailability',
            name='start_time',
            field=models.CharField(max_length=100, null=True),
        ),
    ]
