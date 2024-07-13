from django.contrib.auth.models import Group, User
from .models import LoginUsers,Users,AccountTypes,UserAccountTypes,SocialAccounts
from rest_framework import serializers


class UserSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = User
        # fields = ['url', 'username', 'email', 'groups','password']
        fields = ['url', 'username', 'email', 'groups']


class GroupSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Group
        fields = ['url', 'name']

# class LoginUserSerializer(serializers.HyperlinkedModelSerializer):
#     class Meta:
#         model = LoginUsers
#         fields = ['url', 'loginId', 'loginName']
        
class UsersSerializer(serializers.ModelSerializer):
    class Meta:
        model = Users
        # fields = ['user_id',"name","email",'phone_number']
        fields = "__all__"

class AccountTypesSerializer(serializers.ModelSerializer):
    class Meta:
        model = AccountTypes
        fields = ['account_type_id','account_type']
        

class LoginUserSerializer(serializers.Serializer):
    
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    
class PasswordResetSerializer(serializers.Serializer):
    
    email = serializers.EmailField()
    
        

        