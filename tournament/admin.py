from django.contrib import admin
from .models import Tournament, Participant, Event, Entry, Court, Match, Message

# Register your models here.
admin.site.register(Tournament)
admin.site.register(Participant)
admin.site.register(Event)
admin.site.register(Entry)
admin.site.register(Court)
admin.site.register(Match)
admin.site.register(Message)
