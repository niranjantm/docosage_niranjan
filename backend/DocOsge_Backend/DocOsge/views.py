from django.contrib.auth.models import Group, User
from .models import LoginUsers, UserAccountTypes, Users, UserInformation, AccountTypes, DoctorInformation, DoctorAvailability, Appointments
from rest_framework import permissions, viewsets
from rest_framework import status
from rest_framework.response import Response
from django.contrib.auth.hashers import check_password, make_password
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from django.conf import settings
from datetime import timedelta, datetime
from rest_framework_simplejwt.exceptions import InvalidToken
# from rest_framework_simplejwt.authentication import JWTAuthentication
from .middlewares import CustomJWTAuthentication
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.views import TokenRefreshView
from django.db.models import Q
from django.core.exceptions import ValidationError
from django.shortcuts import get_object_or_404
from DocOsge_Backend.DocOsge.serializers import GroupSerializer, UserSerializer, LoginUserSerializer, UsersSerializer, AccountTypesSerializer, LoginUserSerializer, PasswordResetSerializer, UserInformationSerializer, CookieTokenRefreshSerializer, DoctorInformationSerializer, DoctorAvailabilitySerializer, DoctorSerializer, DoctorAppointmentSerializer, AppointmentSerializer,DoctorAvailabilityGetSerializer


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
            if (userData.get("account_type") != 'doctor' and userData.get("account_type") != 'customer'):
                return Response("Invalid account_type", status=status.HTTP_400_BAD_REQUEST)

            userSerializer = UsersSerializer(
                data=userData, context={'request': request})
            if (userSerializer.is_valid()):
                user = userSerializer.save()

            else:
                return Response(userSerializer.errors, status=status.HTTP_400_BAD_REQUEST)

            accoutTypeSerializer = AccountTypesSerializer(
                data=userData, context={'request': request})
            if (accoutTypeSerializer.is_valid()):
                account_type = accoutTypeSerializer.save()
            else:
                return Response(accoutTypeSerializer.errors, status=status.HTTP_400_BAD_REQUEST)

            user_account_type = UserAccountTypes(
                user_id=user.user_id, account_type_id=account_type.account_type_id)
            user_account_type.save()

            response_data = userSerializer.data
            response_data.update(accoutTypeSerializer.data)

            refresh = RefreshToken.for_user(user)
            response_data['access'] = str(refresh.access_token)
            response_data['refresh'] = str(refresh)

            response = Response(response_data, status=status.HTTP_201_CREATED)
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
            return Response({"error": str(error)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # return Response(response_data,status=status.HTTP_201_CREATED)

# ------------------------------------------- USER LOGIN VIEW----------------------------------------------------------------------


class LoginUserViewSet(viewsets.ViewSet):

    def create(self, request, *args, **kwargs):

        userSerializer = LoginUserSerializer(data=request.data)

        try:

            if (userSerializer.is_valid()):
                email = userSerializer.validated_data.get('email')
                password = userSerializer.validated_data.get('password')

                try:
                    user = Users.objects.filter(email=email).exists()
                    if (not user):
                        return Response({"message": "invalid credentials"}, status=status.HTTP_406_NOT_ACCEPTABLE)

                    user = Users.objects.get(email=email)

                    user_dict = Users.objects.filter(
                        email=email).values().first()

                    accountType = UserAccountTypes.objects.select_related(
                        "account_type").get(user_id=user_dict['user_id'])

                    if (accountType.account_type is None):
                        return Response({"message": "User not found"}, status=status.HTTP_404_NOT_FOUND)
                    user_dict['account_type'] = str(accountType.account_type)
                    print(user_dict)

                    if (check_password(password, user_dict.get("password_hash"))):

                        user_dict.pop("password_hash")

                        refresh = RefreshToken.for_user(user)
                        user_dict['access'] = str(refresh.access_token)

                        response = Response(
                            user_dict, status=status.HTTP_200_OK)

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
                        return Response("invalid credentials", status=status.HTTP_406_NOT_ACCEPTABLE)

                except Exception as error:
                    return Response({"message": str(error)}, status=status.HTTP_400_BAD_REQUEST)

            return Response(userSerializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as error:
            return Response({"message": str(error)}, status=status.HTTP_400_BAD_REQUEST)

    # ---------------------------------EMAIL VERIFICATION AND TOKEN GENERATION API FOR PASSWORD RESET-----------------------------------


class PasswordResetRequestViewSet(viewsets.ViewSet):

    def create(self, request, *args, **kwargs):

        try:
            passwordResetSerializer = PasswordResetSerializer(
                data=request.data)

            if (passwordResetSerializer.is_valid()):
                try:
                    user = Users.objects.get(
                        email=passwordResetSerializer.validated_data.get('email'))

                    refresh = RefreshToken.for_user(user)
                    token = refresh.access_token
                    token.set_exp(lifetime=timedelta(minutes=5))
                    token["email"] = user.email

                    #  WE HAVE TO ADD EMAIL DISPATCH SYSTEM
                    # -------------------------------------------------------------
                    # -------------------------------------------------------------
                    # -------------------------------------------------------------

                    return Response({"url": f'{settings.FRONTEND_URL}/passwordreset/?email={user.email}&user={token}'}, status=status.HTTP_200_OK)

                except Users.DoesNotExist:
                    return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

            else:
                return Response(passwordResetSerializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as error:
            return Response({"error": str(error)}, status=status.HTTP_400_BAD_REQUEST)


# ------------------------------------------PASSWORD RESET API-------------------------------------------------#

class PasswordResetConfirmViewSet(viewsets.ViewSet):

    def password_reset(self, request):

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
            return Response(str(error), status=status.HTTP_400_BAD_REQUEST)


# ----------------------------------------USER INFO UPDATE------------------------------------------------------------

class UserInfoUpdateViewSet(viewsets.ViewSet):
    authentication_classes = [CustomJWTAuthentication]
    # permission_classes = [IsAuthenticated]

    def create(self, request):

        if isinstance(request.user, AnonymousUser):
            return Response({"message": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)

        verifiedUser = request.user
        request.data["user"] = verifiedUser["user_id"]

        userInfoSerializer = UserInformationSerializer(data=request.data)

        try:
            user = UserInformation.objects.get(user_id=verifiedUser["user_id"])
            if (user):
                request.data.pop('user')

                for key, value in request.data.items():
                    setattr(user, key, value)
                user.save()
                return Response({"message": "user info updated"}, status=status.HTTP_200_OK)

        except UserInformation.DoesNotExist:
            if (userInfoSerializer.is_valid()):
                userInfoSerializer.save()
                return Response("user info created", status=status.HTTP_200_OK)
            else:
                return Response(userInfoSerializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# -----------------------------------Token-refresh-view----------------------------------------------------------

class CustomTokenRefreshView(TokenRefreshView):

    serializer_class = CookieTokenRefreshSerializer

    def post(self, request, *args, **kwargs):

        serializer = self.get_serializer(
            data=request.data, context={'request': request})

        try:
            serializer.is_valid(raise_exception=True)
        except InvalidToken as e:
            return Response({"detail": str(e)}, status=status.HTTP_401_UNAUTHORIZED)

        return Response(serializer.validated_data, status=status.HTTP_200_OK)


class LogoutUserView(viewsets.ViewSet):

    def create(self, request):

        response = Response(
            {"message": "User logout successfull"}, status=status.HTTP_200_OK)
        response.delete_cookie(
            key="refresh",
        )
        return response

# -------------------------------------------DOCTOR INFO VIEW----------------------------------------------------------------------


class DoctorInfoView(viewsets.ViewSet):
    authentication_classes = [CustomJWTAuthentication]

    def create(self, request):

        if isinstance(request.user, AnonymousUser):
            return Response({"message": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)

        doctorInfo = request.data
        doctorInfo['user'] = request.user.get("user_id")

        try:
            validDoctor = UserAccountTypes.objects.select_related(
                "account_type").get(user_id=doctorInfo.get("user"))

            if (str(validDoctor.account_type) != 'doctor'):
                return Response({"message": "User is not a doctor"}, status=status.HTTP_400_BAD_REQUEST)

            doctorInfoSerializer = DoctorInformationSerializer(data=doctorInfo)

            if (doctorInfoSerializer.is_valid()):
                doctorInfoSerializer.save()
                return Response({'message': "doctor info created"}, status=status.HTTP_201_CREATED)
            else:
                raise Exception(doctorInfoSerializer.errors)
        except Exception as error:
            return Response({"message": str(error)}, status=status.HTTP_400_BAD_REQUEST)

    def retrieve(self, request, pk):
        pk = None

        if isinstance(request.user, AnonymousUser):
            return Response({"message": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            validDoctor = UserAccountTypes.objects.select_related(
                "account_type").get(user_id=request.user.get("user_id"))

            if (str(validDoctor.account_type) != 'doctor'):
                return Response({"message": "User is not a doctor"}, status=status.HTTP_400_BAD_REQUEST)

            doctorData = DoctorInformation.objects.get(
                user_id=request.user.get("user_id"))
            serializer = DoctorInformationSerializer(doctorData)

            data = serializer.data
            data.pop("id")
            data.pop("user")

            return Response(data, status=status.HTTP_200_OK)
        except DoctorInformation.DoesNotExist:
            return Response({"message": "user not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as error:
            return Response(str(error), status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def update(self, request, pk):
        pk = None

        if isinstance(request.user, AnonymousUser):
            return Response({"message": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)

        doctor = request.data
        doctor['user'] = request.user.get("user_id")

        try:
            validDoctor = UserAccountTypes.objects.select_related(
                "account_type").get(user_id=doctor.get("user"))
            if (str(validDoctor.account_type) != 'doctor'):
                return Response({"message": "User is not a doctor"}, status=status.HTTP_400_BAD_REQUEST)

            doctorData = DoctorInformation.objects.get(
                user_id=request.user.get("user_id"))
            serializer = DoctorInformationSerializer(doctorData, data=doctor)

            if (serializer.is_valid()):
                serializer.save()

                data = serializer.data
                data.pop("id")
                data.pop("user")
                return Response(data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except DoctorInformation.DoesNotExist:
            return Response({"error": "Doctor not found"}, status=status.HTTP_404_NOT_FOUND)

# ------------------------------------------DOCTOR AVAILABILITY VIEW-----------------------------------------------------------------------


class DoctorAvailabilityView(viewsets.ViewSet):

    authentication_classes = [CustomJWTAuthentication]

    def create(self, request):

        if isinstance(request.user, AnonymousUser):
            return Response({"message": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            doctorSchedule = request.data

            doctorSchedule['user'] = request.user.get("user_id")
            print(doctorSchedule.get("user"))

            validDoctor = UserAccountTypes.objects.select_related(
                "account_type").get(user_id=doctorSchedule.get("user"))
            
            if (str(validDoctor.account_type) != 'doctor'):
                return Response({"message": "User is not a doctor"}, status=status.HTTP_400_BAD_REQUEST)

            doctorSchedule["availability"] = request.data.get("availability")
            doctorInfo = DoctorInformation.objects.get(
                user=doctorSchedule.get('user'))

            doctorSchedule["doctorInformation"] = doctorInfo.pk
            

            availability_records = []
            errors=[]

            for entry in request.data.get("availability"):
                date = entry["date"]
                time_slots = entry["timeSlots"]

                for slots in time_slots:
                    booked = slots["booked"]
                    start_time = slots["startTime"]

                    availability_data = {
                        "date": date,
                        "start_time": start_time,
                        "booked": booked,
                        "doctorInformation": doctorSchedule.get("doctorInformation"),
                        "user": doctorSchedule.get("user")
                    }

                    serializer = DoctorAvailabilitySerializer(
                        data=availability_data)

                    if serializer.is_valid():
                        availability_records.append(DoctorAvailability(**serializer.validated_data))
                        
                    else:
                        errors.append(serializer.errors)

                        
            if errors:
                raise ValueError(f"Validation errors occurred: {errors}")
            
            DoctorAvailability.objects.bulk_create(availability_records)
            
            return Response({"message":"availability record created"}, status=status.HTTP_201_CREATED)
        
        except ValidationError as ve:
             return Response({"message": ve.message_dict}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as error:
            return Response({"message": str(error)}, status=status.HTTP_400_BAD_REQUEST)

    def retrieve(self, request, pk):
        pk = None
        if isinstance(request.user, AnonymousUser):
            return Response({"message": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)

        doctor = request.data
        doctor['user'] = request.user.get("user_id")

        try:

            validDoctor = UserAccountTypes.objects.select_related(
                "account_type").get(user_id=doctor.get("user"))
            if (str(validDoctor.account_type) != 'doctor'):
                return Response({"message": "User is not a doctor"}, status=status.HTTP_400_BAD_REQUEST)

            queryset = DoctorAvailability.objects.filter(user_id=doctor.get('user'))
            
            if not queryset.exists():
                return Response({"message": "No availability records found for this doctor"}, status=status.HTTP_404_NOT_FOUND)
           
            serializer = DoctorAvailabilityGetSerializer(queryset,many=True)

            data = serializer.data

            availability_by_date = {}
            
            for record in data:
                date_str = record['date']
                start_time_str = record['start_time']
                if date_str not in availability_by_date:
                    availability_by_date[date_str] = []
                availability_by_date[date_str].append({
                    'startTime': start_time_str,
                    'booked': record['booked']
                })

        
            response_data = {
                'availability': [
                    {
                        'date': date,
                        'timeSlots': slots
                    }
                    for date, slots in availability_by_date.items()
                ]
            }

            return Response(response_data, status=status.HTTP_200_OK) 

        except Exception as error:
            return Response({"message": str(error)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def update(self, request, pk):

        if isinstance(request.user, AnonymousUser):
            return Response({"message": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)

        doctorSchedule = request.data
        doctorSchedule['user'] = request.user.get("user_id")

        try:
            validDoctor = UserAccountTypes.objects.select_related(
                "account_type").get(user_id=doctorSchedule.get("user"))
            if (str(validDoctor.account_type) != 'doctor'):
                return Response({"message": "User is not a doctor"}, status=status.HTTP_400_BAD_REQUEST)

            doctorInfo = DoctorInformation.objects.get(
                user=doctorSchedule.get('user'))
            doctorSchedule['doctorInformation'] = doctorInfo.pk

            doctorAvailability = DoctorAvailability.objects.filter(user_id=doctorSchedule.get("user"))
            
            doctorAvailability.delete()
            
            availability_records = []
            errors=[]

            for entry in request.data.get("availability"):
                date = entry["date"]
                time_slots = entry["timeSlots"]

                for slots in time_slots:
                    booked = slots["booked"]
                    start_time =slots["startTime"]
                    print(start_time)

                    availability_data = {
                        "date": date,
                        "start_time": start_time,
                        "booked": booked,
                        "doctorInformation": doctorSchedule.get("doctorInformation"),
                        "user": doctorSchedule.get("user")
                    }

                    serializer = DoctorAvailabilitySerializer(
                        data=availability_data)

                    if serializer.is_valid():
                        availability_records.append(DoctorAvailability(**serializer.validated_data))
                        
                    else:
                        errors.append(serializer.errors)

                        
            if errors:
                raise ValueError(f"Validation errors occurred: {errors}")
            
            DoctorAvailability.objects.bulk_create(availability_records)
            
            return Response({"message":"availability record updated"}, status=status.HTTP_200_OK)
        
        except ValidationError as ve:
             return Response({"message": ve.message_dict}, status=status.HTTP_400_BAD_REQUEST)
            
            
            # serializer = DoctorAvailabilitySerializer(
            #     doctorAvailability, data=doctorSchedule)
            # if (serializer.is_valid()):
            #     serializer.save()

            #     return Response(serializer.data, status=status.HTTP_200_OK)

            # return Response({"message": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        except Exception as error:

            return Response({"message": str(error)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def destroy(self, request, pk):
        pk = None

        if isinstance(request.user, AnonymousUser):
            return Response({"message": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)

        doctorSchedule = request.data
        doctorSchedule['user'] = request.user.get("user_id")

        try:
            validDoctor = UserAccountTypes.objects.select_related(
                "account_type").get(user_id=doctorSchedule.get("user"))
            if (str(validDoctor.account_type) != 'doctor'):
                return Response({"message": "User is not a doctor"}, status=status.HTTP_400_BAD_REQUEST)

            doctorAvailability = DoctorAvailability.objects.get(
                user_id=doctorSchedule.get("user"))

            doctorAvailability.delete()

            return Response({"message": "schedule deleted successful"}, status=status.HTTP_200_OK)

        except DoctorAvailability.DoesNotExist:
            return Response({"message": "user not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as error:
            return Response({"message": str(error)}, status=status.HTTP_400_BAD_REQUEST)


# ---------------------------------------GET ALL DOCTORS---------------------------------------------------------------------

class Doctors(viewsets.ViewSet):

    def list(self, request):

        try:
            querySet = DoctorInformation.objects.select_related("user").all()
            serializer = DoctorSerializer(querySet, many=True)

            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as error:
            return Response({"message": str(error)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# -----------------------------------CUSTOMER APPOINTMENT BOOKING VIEW------------------------------------------------------------

class GetAppointmentDatesView(viewsets.ViewSet):

    authentication_classes = [CustomJWTAuthentication]

    # def create(self, request):

    #     return Response("ok", status=status.HTTP_200_OK)

    def retrieve(self, request, pk):

        if isinstance(request.user, AnonymousUser):
            return Response({"message": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)

        customerId = request.user.get("user_id")

        try:
            validCustomer = UserAccountTypes.objects.select_related(
                "account_type").get(user_id=customerId)
            if (str(validCustomer.account_type) != 'customer'):
                return Response({"message": "User is not a customer"}, status=status.HTTP_400_BAD_REQUEST)

            doctorInfo = DoctorInformation.objects.get(user_id=pk)
            
            response_data = DoctorAppointmentSerializer(doctorInfo).data
            
            dates =[]
            unique_dates ={}
            for record in response_data["availability"]:
                if record.get("date") not in unique_dates:
                    unique_dates[f"{record.get("date")}"] = record.get("date")
                    dates.append(record.get("date"))
            
            response_data["availability"] = dates
               

            return Response(response_data, status=status.HTTP_200_OK)
        
        except DoctorInformation.DoesNotExist:
            return Response({"message": "Doctor information not found"}, status=status.HTTP_404_NOT_FOUND)

        except DoctorAvailability.DoesNotExist:
            return Response({"message": "Doctor information not found"}, status=status.HTTP_404_NOT_FOUND)

        except Exception as error:
            return Response({"message": str(error)}, status=status.HTTP_400_BAD_REQUEST)
        

class GetAppointmentTimeView(viewsets.ViewSet):
    
    authentication_classes = [CustomJWTAuthentication]

    
    def retrieve(self, request,pk):

        if isinstance(request.user, AnonymousUser):
            return Response({"message": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)

        customerId = request.user.get("user_id")

        try:
            date = request.GET.get("date")
            validCustomer = UserAccountTypes.objects.select_related(
                "account_type").get(user_id=customerId)
            if (str(validCustomer.account_type) != 'customer'):
                return Response({"message": "User is not a customer"}, status=status.HTTP_400_BAD_REQUEST)
            
            availability = DoctorAvailability.objects.filter(Q(user_id=pk) & Q(date=date)).values()
            
            timeSlots = []
            for record in availability:
                
                timeSlots.append(record.get("start_time"))
            
            
            
            return Response(timeSlots,status=status.HTTP_200_OK)
            
        except Exception as error:
            return Response({"message":str(error)},status=status.HTTP_400_BAD_REQUEST)


class AppointmentView (viewsets.ViewSet):

    authentication_classes = [CustomJWTAuthentication]

    def create(self, request):

        if isinstance(request.user, AnonymousUser):
            return Response({"message": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)

        customerId = request.user.get("user_id")

        data = request.data
        data['patient'] = customerId

        try:
            validCustomer = UserAccountTypes.objects.select_related(
                "account_type").get(user_id=customerId)
            if (str(validCustomer.account_type) != 'customer'):
                return Response({"message": "User is not a customer"}, status=status.HTTP_400_BAD_REQUEST)

            serializer = AppointmentSerializer(data=data)
            if (serializer.is_valid()):

                doctor_id = request.data.get("doctor")
                target_date = request.data.get("date")
                target_start_time = request.data.get("startTime")

                doctor_schedule = get_object_or_404(
                    DoctorAvailability, user=doctor_id)

                availability = doctor_schedule.availability

                for date_entry in availability:
                    if date_entry['date'] == target_date:
                        for time_slot in date_entry['timeSlots']:
                            if time_slot['startTime'] == target_start_time:
                                time_slot['booked'] = True
                                break

                doctor_schedule.availability = availability
                doctor_schedule.save()
                serializer.save()
                return Response({"message": "Appointment created"}, status=status.HTTP_201_CREATED)

            return Response(serializer.errors, status=status.HTTP_200_OK)
        except Exception as error:
            return Response({"message": str(error)}, status=status.HTTP_400_BAD_REQUEST)

    def retrieve(self, request, pk):
        pk = None

        if isinstance(request.user, AnonymousUser):
            return Response({"message": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)

        customerId = request.user.get("user_id")

        try:
            validCustomer = UserAccountTypes.objects.select_related(
                "account_type").get(user_id=customerId)
            if (str(validCustomer.account_type) != 'customer'):
                return Response({"message": "User is not a customer"}, status=status.HTTP_400_BAD_REQUEST)

            customerAppointments = Appointments.objects.filter(
                patient_id=customerId)

            serializer = AppointmentSerializer(customerAppointments, many=True)

            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as error:
            return Response({"message": str(error)}, status=status.HTTP_400_BAD_REQUEST)


class DoctorSearchView(viewsets.ViewSet):
    def list(self, request):
        query = request.query_params.get('q', '')

        if query:
            doctors = DoctorInformation.objects.filter(
                Q(practiceType__icontains=query) |
                Q(user__name__icontains=query) |
                Q(clinicAddress__icontains=query)
            )
        else:
            doctors = DoctorInformation.objects.all()

        serializer = DoctorSerializer(doctors, many=True)

        print()
        return Response(serializer.data, status=status.HTTP_200_OK)
