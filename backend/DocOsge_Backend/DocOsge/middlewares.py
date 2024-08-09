from rest_framework_simplejwt.authentication import JWTAuthentication
from .models import Users
from rest_framework.exceptions import AuthenticationFailed


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
            
        