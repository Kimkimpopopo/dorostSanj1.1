from django.urls import path
from .views import sanjesh

app_name = 'sajesh'

urlpatterns = [
    path('', sanjesh, name='sanjesh'),
]