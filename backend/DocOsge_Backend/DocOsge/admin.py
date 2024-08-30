from django.contrib import admin
from . import models

# Register your models here.

admin.site.register(models.Users)
admin.site.register(models.AccountTypes)
admin.site.register(models.PatientHealthRecordFiles)
admin.site.register(models.PatientHealthRecords)
# admin.site.register(models.DoctorAvailability)