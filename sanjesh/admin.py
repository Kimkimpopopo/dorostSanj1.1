from django.contrib import admin
from sanjesh.models import session

class admin_session(admin.ModelAdmin):
    list_display = ('sess', 'dorost', 'best_of_dorost')
    # list_filter = ('sess', 'dorost',)
    search_fields = ['sess']

admin.site.register(session, admin_session)