from django.contrib.auth.models import Group, User
from .models import LoginUsers,UserAccountTypes,Users,UserInformation,AccountTypes,DoctorInformation
from rest_framework import permissions, viewsets
from rest_framework import status
from rest_framework.response import Response
from django.contrib.auth.hashers import check_password,make_password
from rest_framework_simplejwt.tokens import RefreshToken,AccessToken
from django.conf import settings
from datetime import timedelta
from rest_framework_simplejwt.exceptions import InvalidToken
# from rest_framework_simplejwt.authentication import JWTAuthentication
from .middlewares import CustomJWTAuthentication
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.views import TokenRefreshView
from DocOsge_Backend.DocOsge.serializers import GroupSerializer, UserSerializer,LoginUserSerializer,UsersSerializer,AccountTypesSerializer,LoginUserSerializer,PasswordResetSerializer,UserInformationSerializer,CookieTokenRefreshSerializer,DoctorInformationSerializer




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

# class LoginUserViewSet(viewsets.ModelViewSet):
#     """
#     API endpoint that allows Login users to be viewed or edited.
#     """
#     queryset = LoginUsers.objects.all()
#     serializer_class = LoginUserSerializer
#     permission_classes = [permissions.IsAuthenticated]

# ---------------------------------------------USER REGISTERATION VIEW-----------------------------------------------------
class RegisterUserViewSet(viewsets.ViewSet):
   
   def create(self, request):
      
        userData = request.data
        
        
        try:
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
            
            response_data = userSerializer.data
            response_data.update(accoutTypeSerializer.data)
            
            refresh = RefreshToken.for_user(user)
            response_data['access'] = str(refresh.access_token)
            response_data['refresh'] = str(refresh)
            
            response = Response(response_data,status=status.HTTP_201_CREATED)
            response.set_cookie(
                key='refresh',
                value=str(refresh),
                httponly=True,
                secure=False,
                samesite="Lax",
                domain='127.0.0.1',
                path='/',
                expires=settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME']
            )
            return response
        except Exception as error:
            return Response({"error":str(error)},status=status.HTTP_500_INTERNAL_SERVER_ERROR)
       
    
        # return Response(response_data,status=status.HTTP_201_CREATED)
    
# ------------------------------------------- USER LOGIN VIEW----------------------------------------------------------------------
    
class LoginUserViewSet(viewsets.ViewSet):
    
    def create(self, request, *args, **kwargs):
       
       
        userSerializer = LoginUserSerializer(data=request.data)
        
        try:
        
            if(userSerializer.is_valid()):
                email = userSerializer.validated_data.get('email')
                password = userSerializer.validated_data.get('password')
            
                try:
                    user = Users.objects.get(email=email)
                    user_dict = Users.objects.filter(email=email).values().first()
                    
                    accountType = AccountTypes.objects.filter(account_type_id =user_dict['user_id']).values().first()
                    
                    if(accountType.get('account_type') is None):
                        return Response({"message":"User not found"},status=status.HTTP_404_NOT_FOUND)
                    user_dict['account_type'] = accountType.get('account_type')
                    
                    
                    if(check_password(password,user_dict.get("password_hash"))):
                        
                        user_dict.pop("password_hash")
                        
                        refresh = RefreshToken.for_user(user)
                        user_dict['access'] = str(refresh.access_token)
                        
                        response = Response(user_dict,status=status.HTTP_200_OK)
                       
                        response.set_cookie(
                            key='refresh',
                            value=str(refresh),
                            httponly=True,
                            secure=False,
                            samesite="Lax",
                            # domain='127.0.0.1',
                            # path='/',
                            expires=settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME']
                        )
                        return response
                    else:
                        return Response("invalid credentials",status=status.HTTP_406_NOT_ACCEPTABLE)
                
                except Exception as error:
                    return Response({"message":str(error)},status=status.HTTP_400_BAD_REQUEST)
                    

            return Response (userSerializer.errors,status=status.HTTP_400_BAD_REQUEST)
        except Exception as error:
            return Response({"message":str(error)},status=status.HTTP_400_BAD_REQUEST)
        
        
    #---------------------------------EMAIL VERIFICATION AND TOKEN GENERATION API FOR PASSWORD RESET-----------------------------------    


class PasswordResetRequestViewSet(viewsets.ViewSet):
    
    def create(self,request, *args, **kwargs):
        
        try:
            passwordResetSerializer = PasswordResetSerializer(data=request.data)
            
            if(passwordResetSerializer.is_valid()):
                try:
                    user = Users.objects.get(email = passwordResetSerializer.validated_data.get('email'))
                    
                    refresh = RefreshToken.for_user(user)
                    token = refresh.access_token
                    token.set_exp(lifetime=timedelta(minutes=5))
                    token["email"] = user.email
                    
                    
                    return Response({"url":f'{settings.FRONTEND_URL}/passwordreset/?email={user.email}&user={token}'},status=status.HTTP_200_OK)
                    
                except Users.DoesNotExist:
                    return Response({"error":"User not found"}, status=status.HTTP_404_NOT_FOUND)
                
            else:
                return Response(passwordResetSerializer.errors,status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as error:
            return Response({"error":str(error)},status=status.HTTP_400_BAD_REQUEST)
        
        
        
# ------------------------------------------PASSWORD RESET API-------------------------------------------------# 

class PasswordResetConfirmViewSet(viewsets.ViewSet):
    
    def password_reset(self,request):
        
        newPassword = request.data.get("newPassword")
        
        try:
            token = request.data.get('user')
    
            access_token = AccessToken(token)
            user_email = access_token["email"]
            
            try:
                user = Users.objects.get(email=user_email)
                user.password_hash = make_password(newPassword)
                user.save()

                return Response("Password updated successfully", status=status.HTTP_200_OK)
            except Users.DoesNotExist:
                return Response("No user found with this email", status=status.HTTP_404_NOT_FOUND)
            
        except Exception as error:
            return Response(str(error),status=status.HTTP_400_BAD_REQUEST)
        
        
#----------------------------------------USER INFO UPDATE------------------------------------------------------------

class UserInfoUpdateViewSet(viewsets.ViewSet):
    authentication_classes = [CustomJWTAuthentication]
    # permission_classes = [IsAuthenticated]
    
    def create(self,request):
        
        if isinstance(request.user,AnonymousUser):
            return Response({"message":"Unauthorized"},status=status.HTTP_401_UNAUTHORIZED)
        
        verifiedUser = request.user
        request.data["user"] = verifiedUser["user_id"]
        
        
        userInfoSerializer = UserInformationSerializer(data=request.data)
        
        try:
            user = UserInformation.objects.get(user_id=verifiedUser["user_id"])
            if(user):
                request.data.pop('user')
                
                for key, value in request.data.items():
                    setattr(user,key,value)
                user.save()
                return Response({"message":"user info updated"},status=status.HTTP_200_OK)
            
        except UserInformation.DoesNotExist:
            if(userInfoSerializer.is_valid()):
                userInfoSerializer.save()
                return Response("user info created",status=status.HTTP_200_OK)
            else:
                return Response(userInfoSerializer.errors,status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

# -----------------------------------Token-refresh-view---------------------------------------------------------- 

class CustomTokenRefreshView(TokenRefreshView):
    
    serializer_class = CookieTokenRefreshSerializer
        
    def post(self,request,*args, **kwargs):
        
        serializer = self.get_serializer(data=request.data,context={'request':request})
        
        try:
            serializer.is_valid(raise_exception=True)
        except InvalidToken as e:
            return Response({"detail":str(e)},status=status.HTTP_401_UNAUTHORIZED)
        
        return Response(serializer.validated_data, status=status.HTTP_200_OK)
       
    
class LogoutUserView(viewsets.ViewSet):
    
    def create(self,request):
        
        response = Response({"message":"User logout successfull"}, status=status.HTTP_200_OK)
        response.delete_cookie(
            key="refresh",
        )
        return response
        
    
class DoctorInfoView(viewsets.ViewSet):
    authentication_classes=[CustomJWTAuthentication]
    
    def create(self,request):
        
        print(request.user)
        

        if isinstance(request.user,AnonymousUser):
            return Response({"message":"Unauthorized"},status=status.HTTP_401_UNAUTHORIZED)
        
        
        
       
        doctorInfo = request.data
        doctorInfo['user'] = request.user.get("user_id")
        
        
        try:
            validDoctor = AccountTypes.objects.filter(account_type_id=doctorInfo.get('user')).values().first()
            
            if(validDoctor["account_type"] !='doctor'):
                return Response({"message":"User is not a doctor"},status=status.HTTP_400_BAD_REQUEST)
            
            doctorInfoSerializer = DoctorInformationSerializer(data=doctorInfo)
            
            
           
            if(doctorInfoSerializer.is_valid()):
                doctorInfoSerializer.save()
                return Response({'message':"doctor info created"},status=status.HTTP_201_CREATED)
            else:
                raise Exception (doctorInfoSerializer.errors)
        except Exception as error:
            return Response({"message":str(error)},status=status.HTTP_400_BAD_REQUEST)
            
    def list(self,request):
        
        if isinstance(request.user,AnonymousUser):
            return Response({"message":"Unauthorized"},status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            validDoctor = AccountTypes.objects.filter(account_type_id=request.user.get("user_id")).values().first()
            if(validDoctor["account_type"] !='doctor'):
                return Response({"message":"User is not a doctor"},status=status.HTTP_400_BAD_REQUEST)
            
            doctorData = DoctorInformation.objects.get(user_id=request.user.get("user_id"))
            serializer = DoctorInformationSerializer(doctorData)
          
            data = serializer.data
            data.pop("id")
            data.pop("user")
            
            return Response(data,status=status.HTTP_200_OK)
        except DoctorInformation.DoesNotExist:
            return Response({"message":"user not found"},status=status.HTTP_404_NOT_FOUND)
        except Exception as error:
            return Response(str(error),status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    def update(self,request,pk):
        pk = None
        
        if isinstance(request.user,AnonymousUser):
            return Response({"message":"Unauthorized"},status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            validDoctor = AccountTypes.objects.filter(account_type_id=request.user.get("user_id")).values().first()
            if(validDoctor["account_type"] !='doctor'):
                return Response({"message":"User is not a doctor"},status=status.HTTP_400_BAD_REQUEST)
            
            doctorData = DoctorInformation.objects.get(user_id = request.user.get("user_id"))
            serializer = DoctorInformationSerializer(doctorData,data=request.data,partial=True)
            
            if(serializer.is_valid()):
                serializer.save()
                
                data = serializer.data
                data.pop("id")
                data.pop("user")
                return Response(data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except DoctorInformation.DoesNotExist:
            return Response({"error": "Doctor not found"}, status=status.HTTP_404_NOT_FOUND)
            
            
        
        