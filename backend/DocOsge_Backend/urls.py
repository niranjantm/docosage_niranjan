"""
URL configuration for DocOsge_Backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.urls import include, path
from rest_framework import routers

from DocOsge_Backend.DocOsge import views
from rest_framework_simplejwt.views import (
    TokenRefreshView,
)


router = routers.DefaultRouter()
router.register(r'users', views.UserViewSet,basename='user')
router.register(r'groups', views.GroupViewSet, basename='groups')
router.register(r'login', views.LoginUserViewSet, basename='loginusers')
router.register(r'register',views.RegisterUserViewSet, basename='register')
router.register(r'passwordreset',views.PasswordResetRequestViewSet, basename='passwordreset')  
router.register(r'updateuserinfo',views.UserInfoUpdateViewSet, basename='updateuserinfo')
router.register(r'logout',views.LogoutUserView,basename='logoutuser')
# router.register(r'passwordconfirm',views.PasswordResetConfirmViewSet, basename='passwordconfirm')  
# Wire up our API using automatic URL routing.
# Additionally, we include login URLs for the browsable API.
urlpatterns = [
    path('', include(router.urls)),
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    path('passwordconfirm/',views.PasswordResetConfirmViewSet.as_view({'patch':'password_reset'}),name='passwordconfirm'),
    # path('updateuserinfo/',views.UserInfoUpdateViewSet.as_view({'post':'create'}), name='updateuserinfo'),
    path('refresh/', views.CustomTokenRefreshView.as_view(), name='token_refresh'),
   
]

urlpatterns += router.urls
