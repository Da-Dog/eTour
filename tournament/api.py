from django.core.exceptions import ObjectDoesNotExist
from ninja_extra import NinjaExtraAPI
from ninja_jwt.authentication import JWTAuth
from ninja_jwt.controller import NinjaJWTDefaultController
from datetime import datetime

from .models import Tournament, Participant, Entry, Event
from .schema import TournamentSchema, ParticipantSchema, EventSchema

api = NinjaExtraAPI()
api.register_controllers(NinjaJWTDefaultController)


@api.get("/")
def home(request):
    return {"message": "Hi there! :)"}


@api.get("/tournament", auth=JWTAuth())
def tournament_list(request):
    current_time = datetime.fromtimestamp(int(request.META.get('HTTP_CURRENT_TIME')) / 1000.0)
    upcoming_tournaments = list(
        Tournament.objects.filter(end_date__gte=current_time, owner=request.user).values("id", "name",
                                                                                         "start_date",
                                                                                         "end_date", "last_update_time",
                                                                                         "create_time"))
    past_tournaments = list(
        Tournament.objects.filter(end_date__lt=current_time, owner=request.user).values("id", "name", "start_date",
                                                                                        "end_date", "last_update_time",
                                                                                        "create_time"))
    for i in upcoming_tournaments:
        i["start_date"] = i["start_date"].strftime("%Y-%m-%d %H:%M")
        i["end_date"] = i["end_date"].strftime("%Y-%m-%d %H:%M")
        i["create_time"] = i["create_time"].strftime("%Y-%m-%d %H:%M")
        i["last_update_time"] = i["last_update_time"].strftime("%Y-%m-%d %H:%M")
    for i in past_tournaments:
        i["start_date"] = i["start_date"].strftime("%Y-%m-%d %H:%M")
        i["end_date"] = i["end_date"].strftime("%Y-%m-%d %H:%M")
        i["create_time"] = i["create_time"].strftime("%Y-%m-%d %H:%M")
        i["last_update_time"] = i["last_update_time"].strftime("%Y-%m-%d %H:%M")
    return {"user": request.user.first_name if request.user.first_name else "Admin",
            "upcoming": upcoming_tournaments, "past": past_tournaments}


@api.get("/tournament/{tournament_id}", auth=JWTAuth())
def tournament_detail(request, tournament_id: str):
    try:
        tournament = Tournament.objects.get(id=tournament_id, owner=request.user)
        return {"tournament": {
            "id": tournament.id,
            "name": tournament.name,
            "description": tournament.description,
            "start_date": tournament.start_date.strftime("%Y-%m-%dT%H:%M"),
            "end_date": tournament.end_date.strftime("%Y-%m-%dT%H:%M"),
            "address_1": tournament.address_1,
            "address_2": tournament.address_2,
            "city": tournament.city,
            "state": tournament.state,
            "zip_code": tournament.zip_code,
            "contact_name": tournament.contact_name,
            "contact_email": tournament.contact_email,
            "contact_phone": tournament.contact_phone,
            "create_time": tournament.create_time,
            "last_update_time": tournament.last_update_time
        }}
    except ObjectDoesNotExist:
        return {"error": "Tournament not found."}


@api.post("/tournament", auth=JWTAuth())
def tournament_create(request, tournament_schema: TournamentSchema):
    tournament = Tournament(**tournament_schema.dict(), owner=request.user)
    tournament.save()
    return {"message": "Tournament created successfully!", "id": tournament.id}


@api.put("/tournament/{tournament_id}", auth=JWTAuth())
def tournament_update(request, tournament_id: str, tournament_schema: TournamentSchema):
    tournament = Tournament.objects.get(id=tournament_id, owner=request.user)
    tournament.name = tournament_schema.name
    tournament.description = tournament_schema.description
    tournament.start_date = tournament_schema.start_date
    tournament.end_date = tournament_schema.end_date
    tournament.address_1 = tournament_schema.address_1
    tournament.address_2 = tournament_schema.address_2
    tournament.city = tournament_schema.city
    tournament.state = tournament_schema.state
    tournament.zip_code = tournament_schema.zip_code
    tournament.contact_name = tournament_schema.contact_name
    tournament.contact_email = tournament_schema.contact_email
    tournament.contact_phone = tournament_schema.contact_phone
    tournament.save()
    return {"message": "Tournament updated successfully!"}


@api.delete("/tournament/{tournament_id}", auth=JWTAuth())
def tournament_delete(request, tournament_id: str):
    try:
        tournament = Tournament.objects.get(id=tournament_id, owner=request.user)
        tournament.delete()
        return {"message": "Tournament deleted successfully!"}
    except ObjectDoesNotExist:
        return {"error": "Tournament not found."}


@api.get("/tournament/{tournament_id}/dashboard", auth=JWTAuth())
def tournament_dashboard(request, tournament_id: str):
    try:
        tournament = Tournament.objects.get(id=tournament_id, owner=request.user)
        entries = 0
        for i in tournament.event_set.all():
            entries += i.entry_set.count()
        matches = 0
        for i in tournament.event_set.all():
            matches += i.match_set.count()
        scheduled_matches = 0
        for i in tournament.event_set.all():
            scheduled_matches += i.match_set.filter(score1__isnull=True).count()
        completed_matches = 0
        for i in tournament.event_set.all():
            completed_matches += i.match_set.filter(score1__isnull=False).count()
        courts = []
        for i in tournament.court_set.all():
            courts.append({
                "number": i.number,
                "status": "free" if i.match_set.count() == 0 else "occupied",
                "startTime": i.match_set.first().actual_start_time if i.match_set.count() > 0 else None,
                "matchNumber": i.match_set.first().match if i.match_set.count() > 0 else None
            })
        return {
            "name": tournament.name,
            "entries": entries,
            "matches": matches,
            "events": tournament.event_set.count(),
            "days": (tournament.end_date - tournament.start_date).days,
            "scheduledMatches": "{0:}%".format(int(scheduled_matches / matches) * 100 if matches > 0 else 0),
            "completedMatches": "{0:}%".format(int(completed_matches / matches) * 100 if matches > 0 else 0),
            "courtStatus": courts,
        }
    except ObjectDoesNotExist:
        return {"error": "Tournament not found."}


@api.get("/tournament/{tournament_id}/participants", auth=JWTAuth())
def tournament_participants(request, tournament_id: str):
    try:
        tournament = Tournament.objects.get(id=tournament_id, owner=request.user)
        participants = list(tournament.participants.all().values("id", "first_name", "middle_name", "last_name",
                                                                 "email", "phone", "gender", "date_of_birth",
                                                                 "create_time"))
        for i in participants:
            i['name'] = i['first_name'] + " " + (i['middle_name'] + " " if i['middle_name'] else '') + i['last_name']
            i.pop("first_name")
            i.pop("middle_name")
            i.pop("last_name")
            i["create_time"] = i["create_time"].strftime("%Y-%m-%d")
        return {"participants": participants}
    except ObjectDoesNotExist:
        return {"error": "Tournament not found."}


@api.get("/tournament/{tournament_id}/participants/{participant_id}", auth=JWTAuth())
def participant_detail(request, tournament_id: str, participant_id: str):
    try:
        tournament = Tournament.objects.get(id=tournament_id, owner=request.user)
        try:
            participant = tournament.participants.get(id=participant_id)
            # format return with schema
            return {
                "first_name": participant.first_name,
                "middle_name": participant.middle_name,
                "last_name": participant.last_name,
                "email": participant.email,
                "phone": participant.phone,
                "date_of_birth": participant.date_of_birth.strftime("%Y-%m-%d") if participant.date_of_birth else None,
                "gender": participant.gender,
                "notes": participant.notes
            }
        except ObjectDoesNotExist:
            return {"error": "Participant not found."}
    except ObjectDoesNotExist:
        return {"error": "Tournament not found."}


@api.post("/tournament/{tournament_id}/participants", auth=JWTAuth())
def add_participant(request, tournament_id: str, participant_schema: ParticipantSchema):
    try:
        tournament = Tournament.objects.get(id=tournament_id, owner=request.user)
        participant = Participant(**participant_schema.dict())
        participant.save()
        tournament.participants.add(participant)
        return {"id": participant.id}
    except ObjectDoesNotExist:
        return {"error": "Tournament not found."}


@api.put("/tournament/{tournament_id}/participants/{participant_id}", auth=JWTAuth())
def update_participant(request, tournament_id: str, participant_id: str, participant_schema: ParticipantSchema):
    try:
        tournament = Tournament.objects.get(id=tournament_id, owner=request.user)
        try:
            participant = tournament.participants.get(id=participant_id)
            participant.first_name = participant_schema.first_name
            participant.middle_name = participant_schema.middle_name
            participant.last_name = participant_schema.last_name
            participant.email = participant_schema.email
            participant.phone = participant_schema.phone
            participant.date_of_birth = participant_schema.date_of_birth
            participant.gender = participant_schema.gender
            participant.notes = participant_schema.notes
            participant.save()
            return {"message": "Participant updated successfully!"}
        except ObjectDoesNotExist:
            return {"error": "Participant not found."}
    except ObjectDoesNotExist:
        return {"error": "Tournament or Participant not found."}


@api.delete("/tournament/{tournament_id}/participants/{participant_id}", auth=JWTAuth())
def delete_participant(request, tournament_id: str, participant_id: str):
    try:
        tournament = Tournament.objects.get(id=tournament_id, owner=request.user)
        try:
            participant = tournament.participants.get(id=participant_id)
            if participant.tournament.count() == 1:
                participant.delete()
                return {"message": "Participant deleted successfully!"}
            else:
                tournament.participants.remove(participant)
                return {"message": "Participant removed from tournament!"}
        except ObjectDoesNotExist:
            return {"error": "Participant not found."}
    except ObjectDoesNotExist:
        return {"error": "Tournament or Participant not found."}


@api.get("/tournament/{tournament_id}/participants/{participant_id}/entries", auth=JWTAuth())
def participant_entries(request, tournament_id: str, participant_id: str):
    try:
        entries = []
        for i in list(Entry.objects.filter(participant_id=participant_id, event__tournament_id=tournament_id,
                             event__tournament__owner=request.user).values("event__name", "partner__first_name")):
            entries.append({
                "event": i["event__name"],
                "partner": i["partner__first_name"]
            })
        for i in list(Entry.objects.filter(partner_id=participant_id, event__tournament_id=tournament_id,
                             event__tournament__owner=request.user).values("event__name", "participant__first_name")):
            entries.append({
                "event": i["event__name"],
                "partner": i["participant__first_name"]
            })
        return {"entries": entries}
    except ObjectDoesNotExist:
        return {"error": "Participant not found."}


@api.get("/tournament/{tournament_id}/events", auth=JWTAuth())
def tournament_events(request, tournament_id: str):
    try:
        tournament = Tournament.objects.get(id=tournament_id, owner=request.user)
        events = list(tournament.event_set.all().values("id", "name", "type", "gender", "fee", "max_entry", "draw_status"))
        for i in events:
            i["max_entry"] = i["max_entry"] if i["max_entry"] > 0 else "No Limit"
            i["draw_status"] = "Finalized" if i["draw_status"] == "F" else "Tentative" if i["draw_status"] == "T" else "Pending"
        return {"events": events}
    except ObjectDoesNotExist:
        return {"error": "Tournament not found."}


@api.post("/tournament/{tournament_id}/events", auth=JWTAuth())
def add_event(request, tournament_id: str, event_schema: EventSchema):
    try:
        tournament = Tournament.objects.get(id=tournament_id, owner=request.user)
        if tournament.event_set.filter(name=event_schema.name).exists():
            return {"error": "Event already exists."}
        elif event_schema.type not in ["S", "D", "M"]:
            return {"error": "Invalid event type."}
        elif event_schema.scoring_format not in ["S", "O"]:
            return {"error": "Invalid scoring format."}
        elif event_schema.arrangement not in ["E", "R", "EC", "RP"]:
            return {"error": "Invalid arrangement."}
        elif event_schema.consolation not in ["N", "FR", "FM", "FF"]:
            return {"error": "Invalid consolation."}
        event = Event(**event_schema.dict(), tournament=tournament)
        event.save()
        return {"id": event.id}
    except ObjectDoesNotExist:
        return {"error": "Tournament not found."}
