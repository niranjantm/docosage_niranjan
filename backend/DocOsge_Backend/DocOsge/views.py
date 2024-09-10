from django.contrib.auth.models import Group, User
from .models import LoginUsers, UserAccountTypes, Users, UserInformation, AccountTypes, DoctorInformation, DoctorAvailability, Appointments, PatientHealthRecords, PatientHealthRecordFiles
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
from collections import defaultdict
from django.core.exceptions import ValidationError
from django.shortcuts import get_object_or_404
from DocOsge_Backend.DocOsge.serializers import GroupSerializer, UserSerializer, LoginUserSerializer, UsersSerializer, AccountTypesSerializer, LoginUserSerializer, PasswordResetSerializer, UserInformationSerializer, CookieTokenRefreshSerializer, DoctorInformationSerializer, DoctorAvailabilitySerializer, DoctorSerializer, DoctorAppointmentSerializer, AppointmentSerializer, DoctorAvailabilityGetSerializer, UserMedicationSerializer


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
            errors = []

            for entry in request.data.get("availability"):
                date = entry["date"]
                time_slots = entry["timeSlots"]

                existing_startTime = []
                index = 0

                for slots in time_slots:
                    booked = slots["booked"]
                    start_time_str = slots["startTime"]
                    index += 1

                    start_time = datetime.strptime(
                        start_time_str, "%Y-%m-%d %H:%M:%S")

                    if existing_startTime and start_time <= max(existing_startTime):
                        return Response({"message": f"Overlapping of start time found on {date} and at slot {index}"}, status=status.HTTP_406_NOT_ACCEPTABLE)
                    else:

                        existing_startTime.append(start_time)
                        availability_data = {
                            "date": date,
                            "start_time": start_time_str,
                            "booked": booked,
                            "doctorInformation": doctorSchedule.get("doctorInformation"),
                            "user": doctorSchedule.get("user")
                        }

                        serializer = DoctorAvailabilitySerializer(
                            data=availability_data)

                        if serializer.is_valid():
                            availability_records.append(
                                DoctorAvailability(**serializer.validated_data))

                        else:
                            errors.append(serializer.errors)

            if errors:
                raise ValueError(f"Validation errors occurred: {errors}")

            DoctorAvailability.objects.bulk_create(availability_records)

            queryset = DoctorAvailability.objects.filter(
                user_id=doctorSchedule.get('user'))

            serializer = DoctorAvailabilityGetSerializer(queryset, many=True)

            data = serializer.data

            availability_by_date = {}

            for record in data:
                date_str = record['date']
                start_time_str = record['start_time']
                if date_str not in availability_by_date:
                    availability_by_date[date_str] = []
                availability_by_date[date_str].append({
                    'startTime': start_time_str,
                    'booked': record['booked'],
                    'slot_id': record['id']
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

            return Response(response_data, status=status.HTTP_201_CREATED)

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

            queryset = DoctorAvailability.objects.filter(
                user_id=doctor.get('user'))

            if not queryset.exists():
                return Response({"message": "No availability records found for this doctor"}, status=status.HTTP_404_NOT_FOUND)

            serializer = DoctorAvailabilityGetSerializer(queryset, many=True)

            data = serializer.data

            availability_by_date = {}

            for record in data:
                date_str = record['date']
                start_time_str = record['start_time']
                if date_str not in availability_by_date:
                    availability_by_date[date_str] = []
                availability_by_date[date_str].append({
                    'startTime': start_time_str,
                    'booked': record['booked'],
                    "slot_id": record["id"]
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
            doctor_availability = DoctorAvailability.objects.all()

            updated_array = request.data.get("availability")

            availability_records = []
            errors = []

            for entry in updated_array:
                date = entry["date"]
                time_slots = entry["timeSlots"]

                existing_startTime = []
                index = 0

                for slot in time_slots:
                    booked = slot["booked"]
                    start_time_str = slot["startTime"]
                    index += 1

                    start_time = datetime.strptime(
                        start_time_str, "%Y-%m-%d %H:%M:%S")

                    if existing_startTime and start_time <= max(existing_startTime):
                        print(f"date->{date} and time->{start_time_str}")
                        formatted_date = datetime.strptime(
                            date, "%Y-%m-%d").strftime("%a %b %d %Y")
                        return Response({"message": f"Overlapping of time found on date: {formatted_date} at slot {index}"}, status=status.HTTP_406_NOT_ACCEPTABLE)
                    else:

                        existing_startTime.append(start_time)
                        if slot.get("slot_id") is not None:
                            existing_slot = doctor_availability.get(
                                pk=slot.get("slot_id"))
                            existing_slot.start_time = start_time_str
                            existing_slot.save()

                        else:
                            availability_data = {
                                "date": date,
                                "start_time": start_time_str,
                                "booked": booked,
                                "doctorInformation": doctorSchedule.get("doctorInformation"),
                                "user": doctorSchedule.get("user")
                            }
                            serializer = DoctorAvailabilitySerializer(
                                data=availability_data)

                            if serializer.is_valid():
                                availability_records.append(
                                    DoctorAvailability(**serializer.validated_data))

                            else:
                                errors.append(serializer.errors)
            if errors:
                raise ValueError(f"Validation errors occurred: {errors}")

            if availability_records:
                DoctorAvailability.objects.bulk_create(availability_records)

            queryset = DoctorAvailability.objects.filter(
                user_id=doctorSchedule.get('user'))

            serializer = DoctorAvailabilityGetSerializer(queryset, many=True)

            data = serializer.data

            availability_by_date = {}

            for record in data:
                date_str = record['date']
                start_time_str = record['start_time']
                if date_str not in availability_by_date:
                    availability_by_date[date_str] = []
                availability_by_date[date_str].append({
                    'startTime': start_time_str,
                    'booked': record['booked'],
                    'slot_id': record['id']
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

        except ValidationError as ve:
            return Response({"message": ve.message_dict}, status=status.HTTP_400_BAD_REQUEST)

        except Exception as error:

            return Response({"message": str(error)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def destroy(self, request, pk):
        pk = None

        if isinstance(request.user, AnonymousUser):
            return Response({"message": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)

        doctorSchedule = request.data
        doctorSchedule['user'] = request.user.get("user_id")
        
        delete_type = request.query_params.get("delete_type")
        slot_id = request.query_params.get("slot_id")
        record_date = request.query_params.get("date")
        

        try:
            validDoctor = UserAccountTypes.objects.select_related(
                "account_type").get(user_id=doctorSchedule.get("user"))
            if (str(validDoctor.account_type) != 'doctor'):
                return Response({"message": "User is not a doctor"}, status=status.HTTP_400_BAD_REQUEST)

            if delete_type=="slot" and slot_id is not None:
                availability_slot = DoctorAvailability.objects.get(pk=slot_id)
                availability_slot.delete()
            elif delete_type=="date" and record_date is not None:
                availability_record_exist= DoctorAvailability.objects.filter(Q(user_id=doctorSchedule.get('user')) & Q(date=record_date)).exists()
                if availability_record_exist:
                    availability_records = DoctorAvailability.objects.filter(Q(user_id=doctorSchedule.get('user')) & Q(date=record_date))
                    availability_records.delete()

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


# -----------------------------------DATE AND TIME APPOINTMENT BOOKING VIEW------------------------------------------------------------

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

            dates = []
            unique_dates = {}
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

    def retrieve(self, request, pk):

        if isinstance(request.user, AnonymousUser):
            return Response({"message": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)

        customerId = request.user.get("user_id")

        try:
            date = request.GET.get("date")
            validCustomer = UserAccountTypes.objects.select_related(
                "account_type").get(user_id=customerId)
            if (str(validCustomer.account_type) != 'customer'):
                return Response({"message": "User is not a customer"}, status=status.HTTP_400_BAD_REQUEST)

            availability = DoctorAvailability.objects.filter(
                Q(user_id=pk) & Q(date=date) & Q(booked=False)).values()

            timeSlots = []
            for record in availability:

                timeSlots.append({"startTime": record.get(
                    "start_time"), "availability_id": record.get("id")})

            return Response(timeSlots, status=status.HTTP_200_OK)

        except Exception as error:
            return Response({"message": str(error)}, status=status.HTTP_400_BAD_REQUEST)

# -------------------------------------------------APPOINTMENT VIEW----------------------------------------------------------------


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

                if data.get("reschedule") and data.get("oldAppointmentId"):
                    old_appointment = Appointments.objects.get(
                        pk=data.get("oldAppointmentId"))

                    if (old_appointment.patient.pk != data.get("patient")):
                        return Response({"message": "Reschedule your own appointment"}, status=status.HTTP_400_BAD_REQUEST)

                    if old_appointment.doctor_availability:
                        old_schedule = DoctorAvailability.objects.get(
                            pk=old_appointment.doctor_availability.pk)
                        old_schedule.booked = False
                        old_schedule.save()
                    old_appointment.delete()

                    doctor_availability_id = serializer.validated_data.get(
                        "doctor_availability").id
                    doctor_schedule = DoctorAvailability.objects.get(
                        pk=doctor_availability_id)

                    doctor_schedule.booked = True
                    doctor_schedule.save()
                    serializer.save()
                else:
                    doctor_availability_id = serializer.validated_data.get(
                        "doctor_availability").id
                    doctor_schedule = DoctorAvailability.objects.get(
                        pk=doctor_availability_id)

                    doctor_schedule.booked = True
                    doctor_schedule.save()
                    serializer.save()

                return Response({"message": "Appointment created"}, status=status.HTTP_201_CREATED)

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
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

    def destroy(self, request, pk):
        if isinstance(request.user, AnonymousUser):
            return Response({"message": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)

        customerId = request.user.get("user_id")

        try:
            validCustomer = UserAccountTypes.objects.select_related(
                "account_type").get(user_id=customerId)
            if (str(validCustomer.account_type) != 'customer'):
                return Response({"message": "User is not a customer"}, status=status.HTTP_400_BAD_REQUEST)

            appointment = Appointments.objects.get(pk=pk)

            # print(appointment.doctor_availability==None)
            if appointment.doctor_availability:

                doctor_schedule = DoctorAvailability.objects.get(
                    pk=appointment.doctor_availability.pk)
                doctor_schedule.booked = False
                doctor_schedule.save()

            appointment.delete()

            return Response({"message": "appointment deleted"}, status=status.HTTP_200_OK)
        except Exception as error:
            return Response(str(error), status=status.HTTP_400_BAD_REQUEST)


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

        return Response(serializer.data, status=status.HTTP_200_OK)


class PatientHealthRecordView(viewsets.ViewSet):
    authentication_classes = [CustomJWTAuthentication]

    def create(self, request):

        if isinstance(request.user, AnonymousUser) or request.user is None:
            return Response({"message": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)

        customerId = request.user.get("user_id")
        print(request.data)

        try:
            validCustomer = UserAccountTypes.objects.select_related(
                "account_type").get(user_id=customerId)
            if (str(validCustomer.account_type) != 'customer'):
                return Response({"message": "User is not a customer"}, status=status.HTTP_400_BAD_REQUEST)

            files = request.FILES.getlist('files')
            title = request.data.get('title')
            report_type = request.data.get("report_type")
            description = request.data.get('description')

            user_instance = Users.objects.get(pk=customerId)
            health_record = PatientHealthRecords.objects.create(
                patient=user_instance,
                title=title,
                description=description,
                report_type=report_type
            )

            patient_files = []
            for file in files:
                single_file = {
                    "health_record": health_record,
                    "file_url": file
                }
                patient_files.append(PatientHealthRecordFiles(**single_file))

            PatientHealthRecordFiles.objects.bulk_create(patient_files)

            files = PatientHealthRecordFiles.objects.filter(
                health_record=health_record.pk)
            file_urls = []
            for file in files:
                file_urls.append(file.file_url.url)

            data = {
                "file_urls": file_urls,
                "title": health_record.title,
                "description": health_record.description,
                "report_type": health_record.report_type,
                "uploaded_at": health_record.created_at,
                "record_id": health_record.pk
            }

            return Response(data, status=status.HTTP_201_CREATED)
        except Exception as error:
            return Response({"message": str(error)}, status=status.HTTP_400_BAD_REQUEST)

    def list(self, request):

        if isinstance(request.user, AnonymousUser) or request.user is None:
            return Response({"message": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)

        customerId = request.user.get("user_id")

        try:
            validCustomer = UserAccountTypes.objects.select_related(
                "account_type").get(user_id=customerId)
            if (str(validCustomer.account_type) != 'customer'):
                return Response({"message": "User is not a customer"}, status=status.HTTP_400_BAD_REQUEST)

            records = PatientHealthRecords.objects.filter(
                patient_id=customerId)

            patient_records = []
            for record in records:
                data = {
                    "title": record.title,
                    "description": record.description,
                    "report_type": record.report_type,
                    "uploaded_at": record.created_at,
                    "record_id": record.pk

                }
                file_urls = []
                files = PatientHealthRecordFiles.objects.filter(
                    health_record_id=record.pk)
                for file in files:
                    file_urls.append(file.file_url.url)
                data["file_urls"] = file_urls
                patient_records.append(data)

            return Response(patient_records, status=status.HTTP_200_OK)

        except Exception as error:
            return Response({"message": str(error)}, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, pk):
        if isinstance(request.user, AnonymousUser) or request.user is None:
            return Response({"message": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)

        customerId = request.user.get("user_id")

        try:
            validCustomer = UserAccountTypes.objects.select_related(
                "account_type").get(user_id=customerId)
            if (str(validCustomer.account_type) != 'customer'):
                return Response({"message": "User is not a customer"}, status=status.HTTP_400_BAD_REQUEST)

            patient_record = PatientHealthRecords.objects.get(pk=pk)
            patient_record.delete()

            return Response({"message": "Record deleted"}, status=status.HTTP_200_OK)
        except Exception as error:
            return Response({"message": str(error)}, status=status.HTTP_400_BAD_REQUEST)
        
class UserMedicationView(viewsets.ViewSet):
    

    def create(self,request):
       
        
        try:
            serializer = UserMedicationSerializer(data = request.data)
            if(serializer.is_valid()):
               
                data = serializer.data
                data.pop("created_at")
                data.pop("updated_at")
                return Response(data,status=status.HTTP_200_OK)
            return Response(serializer.errors,status=status.HTTP_200_OK)

        except Exception as error:
            return Response({"message": str(error)}, status=status.HTTP_400_BAD_REQUEST)
            
            
        