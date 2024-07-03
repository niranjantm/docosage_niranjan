from django.contrib.auth.models import Group, User
from .models import LoginUsers,UserAccountTypes
from rest_framework import permissions, viewsets
from rest_framework import status
from rest_framework.response import Response

from DocOsge_Backend.DocOsge.serializers import GroupSerializer, UserSerializer, LoginUserSerializer,UsersSerializer,AccountTypesSerializer

class UserViewSet(viewsets.ModelViewSet):
    
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]


class GroupViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited.
    """
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAuthenticated]

class LoginUserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows Login users to be viewed or edited.
    """
    queryset = LoginUsers.objects.all()
    serializer_class = LoginUserSerializer
    permission_classes = [permissions.IsAuthenticated]

# ---------------------------------------------USER REGISTERATION VIEW-----------------------------------------------------
class RegisterUser(viewsets.ModelViewSet):
   
   def create(self, request):
      
        userData = request.data

        if(userData.get("account_type") != 'doctor' and userData.get("account_type") != 'customer' ):
            return Response("Invalid account_type",status=status.HTTP_400_BAD_REQUEST)
        
        userSerializer = UsersSerializer(data=userData, context={'request': request})
        if(userSerializer.is_valid()):
            user = userSerializer.save()
        else:
            return Response(userSerializer.errors,status=status.HTTP_400_BAD_REQUEST)
        
        accoutTypeSerializer = AccountTypesSerializer(data=userData,context={'request': request})
        if(accoutTypeSerializer.is_valid()):
            account_type = accoutTypeSerializer.save()
        else:
            return Response(accoutTypeSerializer.errors,status=status.HTTP_400_BAD_REQUEST)
        
        
        user_account_type = UserAccountTypes(user_id=user.user_id, account_type_id=account_type.account_type_id)
        user_account_type.save()
        
        respose_data = userSerializer.data
        
        respose_data.update(accoutTypeSerializer.data)
    
        return Response(respose_data,status=status.HTTP_200_OK)