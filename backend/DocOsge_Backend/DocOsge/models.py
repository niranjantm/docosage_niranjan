from django.db import models
from django.contrib.auth.hashers import make_password
from django.utils import timezone



# Create your models here.

class LoginUsers(models.Model):
    loginId = models.AutoField(primary_key=True)
    loginName = models.CharField(max_length=50)

    class Meta:
        db_table = 'login_users'
        app_label = 'DocOsge_Backend.DocOsge'

class Users(models.Model):
    user_id = models.AutoField(primary_key=True)
    
    name = models.CharField(max_length=255,null=False,blank=False)
    
    email = models.EmailField(max_length=255,unique=True,null=False,blank=False)
    
    phone_number = models.CharField(max_length=20,unique=True)
    
    password_hash = models.CharField(max_length=255,null=False,blank=False)
    
    created_at = models.DateTimeField(null=True,auto_now_add=True)
    
    updated_at = models.DateTimeField(null=True,auto_now=True)
    
  
    
    def __str__(self):
        print(f"User __str__ method called with user_id: {self.user_id}")
        return str(self.user_id)
    
    class Meta:
        db_table = 'registered_users'
        app_label = 'DocOsge'
    
    def save(self,*args,**kwargs):
        if not self.pk: 
            self.password_hash = make_password(self.password_hash)
        super().save(*args,**kwargs)
    
class AccountTypes(models.Model):
    account_type_id = models.AutoField(primary_key=True)
    
    account_type = models.CharField(max_length=50,null=False,blank=False)
    
    def __str__(self):
        return self.account_type
    
    # class Meta:
    #     db_table = 'account_types'
    #     app_label = 'DocOsge_Backend.DocOsge'
    
class UserAccountTypes(models.Model):
    user= models.ForeignKey(Users,on_delete=models.CASCADE) 
    
    account_type = models.ForeignKey(AccountTypes,on_delete=models.CASCADE)
    
    class Meta:
        unique_together = (('user','account_type'))
        # db_table = 'user_account_types'
        # app_label = 'DocOsge_Backend.DocOsge'
    
class SocialAccounts(models.Model):
    
    social_id = models.AutoField(primary_key=True)
    
    user_id = models.ForeignKey(Users,on_delete=models.CASCADE)
    
    provider = models.CharField(max_length=50,null=False, blank=False)
    
    provider_id = models.CharField(max_length=255,null=False,blank=False)
    
    
    # class Meta:
    #     db_table = 'social_accounts'
    #     app_label = 'DocOsge_Backend.DocOsge'
class UserInformation(models.Model):
    user = models.ForeignKey(Users("user_id"),on_delete=models.CASCADE)
    height = models.IntegerField(null=True,blank=True)
    weight = models.IntegerField(null=True,blank=True)
    age = models.IntegerField(null=True,blank=True)
    getInBed = models.TimeField(null=True,blank=True)
    wakeUp = models.TimeField(null=True,blank=True)
    calories = models.IntegerField(null=True,blank=True)
    steps =models.IntegerField(null=True,blank=True)
    gender = models.CharField(max_length=10,null=True,blank=True)
    
    
class DoctorInformation(models.Model):
    user = models.OneToOneField(Users,on_delete=models.CASCADE)
    age = models.DateField(null=False)
    gender = models.CharField(max_length=10,null=False)
    qualification = models.CharField(max_length=255,null=False)
    yearsOfExperience=models.IntegerField(null=False)
    registrationYear=models.DateField(null=False)
    registrationNumber = models.CharField(max_length=255,null=False)
    registeredCouncil = models.CharField(max_length=255,null=False)
    practiceType=models.CharField(max_length=255,null=False)
    clinicAddress=models.CharField(max_length=255,null=False)
    clinicZipCode=models.IntegerField(null=False,blank=False)
    
    
    def __str__(self):
        return str(self.pk)
    
class DoctorAvailability(models.Model):
    doctorInformation =  models.ForeignKey(DoctorInformation,on_delete=models.CASCADE,related_name="availability_records")
    user = models.ForeignKey(Users,on_delete=models.CASCADE)
    date = models.DateField(null=True)
    start_time = models.CharField(max_length=100,null=True)
    booked = models.BooleanField(default=False)
    created_at = models.DateTimeField(null=True,auto_now_add=True)
    updated_at = models.DateTimeField(null=True,auto_now=True)
    
    # def __str__(self):
    #     return json.dumps(self.availability)


class Appointments(models.Model):
    doctor = models.ForeignKey(Users,on_delete=models.CASCADE,related_name='doctor_appointments')
    patient = models.ForeignKey(Users,on_delete=models.CASCADE,related_name='patient_appointments')
    doctor_availability = models.OneToOneField(DoctorAvailability,related_name='doctor_avalability',null=True,on_delete=models.SET_NULL)
    date = models.DateField(null=False)
    startTime = models.CharField(null=False,max_length=255)
    title = models.CharField(null=False,max_length=255)
    description = models.CharField(null=False,max_length=255)
    
class PatientHealthRecords(models.Model):
    patient = models.ForeignKey(Users,on_delete=models.CASCADE,related_name="patient")
    title = models.CharField(max_length=255)
    description = models.TextField(null=True)
    report_type = models.CharField(max_length=255,null=True)
    created_at = models.DateTimeField(null=True,auto_now_add=True)
    updated_at = models.DateTimeField(null=True,auto_now=True)
    
class PatientHealthRecordFiles(models.Model):
    health_record = models.ForeignKey(PatientHealthRecords,on_delete=models.CASCADE,related_name="health_record")
    file_url = models.FileField(upload_to="health_records")
    created_at = models.DateTimeField(null=True,auto_now_add=True)
    updated_at = models.DateTimeField(null=True,auto_now=True)
    
    
    