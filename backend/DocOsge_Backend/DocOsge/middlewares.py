from rest_framework_simplejwt.authentication import JWTAuthentication
from .models import Users
from rest_framework.exceptions import AuthenticationFailed
from .models import UserAccountTypes
from rest_framework import status
from rest_framework.response import Response
from django.contrib.auth.models import AnonymousUser


class CustomJWTAuthentication(JWTAuthentication):
    def get_user(self, validated_token):
       
        
        
        try:
            user_id = validated_token.get('user_id')
            if(user_id is None):
                raise Exception("User id not found in token")
            user = Users.objects.get(user_id=user_id)
            return {"user_id":user.user_id,"email":user.email}
        except Users.DoesNotExist:
            raise AuthenticationFailed("User does not exist")
        except Exception as error:
            raise AuthenticationFailed(str(error))
        
def verify(user,account_type):
    
    customerId = user.get("user_id")
    
    if isinstance(user, AnonymousUser) or user is None:
        raise AuthenticationFailed("Unauthorized")
    try:
        validCustomer = UserAccountTypes.objects.select_related("account_type").get(user_id=customerId)
        if (str(validCustomer.account_type) != account_type):
            raise AuthenticationFailed(f"User is not a {str(validCustomer.account_type)}")
        
        return user
    except UserAccountTypes.DoesNotExist:
        raise AuthenticationFailed("User not found")
    except Exception as error:
        raise AuthenticationFailed(str(error))
            
        