from django.core.exceptions import ObjectDoesNotExist
from ninja_extra import NinjaExtraAPI
from ninja_jwt.authentication import JWTAuth
from ninja_jwt.controller import NinjaJWTDefaultController
from datetime import datetime, timedelta

from .models import Tournament, Participant, Entry, Event, Match
from .schema import TournamentSchema, ParticipantSchema, EventSchema, EntrySchema

import random, math

from .utils import map_next_match

api = NinjaExtraAPI()
api.register_controllers(NinjaJWTDefaultController)


ROUND_CHOICES = {
    "2": "Final",
    "4": "Semi Final",
    "8": "Quarter Final",
    "16": "Round 16",
    "32": "Round 32",
    "64": "Round 64",
    "128": "Round 128",
    "256": "Round 256",
    "512": "Round 512",
}


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
            scheduled_matches += i.match_set.filter(score__isnull=True).count()
        completed_matches = 0
        for i in tournament.event_set.all():
            completed_matches += i.match_set.filter(score__isnull=False).count()
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
                                           event__tournament__owner=request.user).values("event__name",
                                                                                         "partner__first_name")):
            entries.append({
                "event": i["event__name"],
                "partner": i["partner__first_name"]
            })
        for i in list(Entry.objects.filter(partner_id=participant_id, event__tournament_id=tournament_id,
                                           event__tournament__owner=request.user).values("event__name",
                                                                                         "participant__first_name")):
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
        events = list(
            tournament.event_set.all().values("id", "name", "type", "gender", "fee", "max_entry", "draw_status"))
        for i in events:
            i["max_entry"] = i["max_entry"] if i["max_entry"] > 0 else "No Limit"
            i["draw_status"] = "Finalized" if i["draw_status"] == "F" else "Tentative" if i[
                                                                                              "draw_status"] == "T" else "Pending"
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


@api.get("/tournament/{tournament_id}/events/{event_id}", auth=JWTAuth())
def event_detail(request, tournament_id: str, event_id: str):
    try:
        tournament = Tournament.objects.get(id=tournament_id, owner=request.user)
        try:
            event = tournament.event_set.get(id=event_id)
            return {
                "name": event.name,
                "type": event.type,
                "gender": event.gender,
                "fee": event.fee,
                "max_entry": event.max_entry,
                "scoring_format": event.scoring_format,
                "arrangement": event.arrangement,
                "playoff": event.playoff,
                "consolation": event.consolation,
                "full_feed_last_round": event.full_feed_last_round,
                "players": list(tournament.participants.all().values("id", "first_name", "last_name")),
                "entries": list(event.entry_set.all().values("id", "participant", "partner", "seed")),
            }
        except ObjectDoesNotExist:
            return {"error": "Event not found."}
    except ObjectDoesNotExist:
        return {"error": "Tournament not found."}


@api.put("/tournament/{tournament_id}/events/{event_id}", auth=JWTAuth())
def update_event(request, tournament_id: str, event_id: str, event_schema: EventSchema):
    try:
        tournament = Tournament.objects.get(id=tournament_id, owner=request.user)
        try:
            event = tournament.event_set.get(id=event_id)
            if tournament.event_set.filter(name=event_schema.name).exists() and event.name != event_schema.name:
                return {"error": "Event already exists."}
            elif event_schema.type not in ["S", "D", "M"]:
                return {"error": "Invalid event type."}
            elif event_schema.scoring_format not in ["S", "O"]:
                return {"error": "Invalid scoring format."}
            elif event_schema.arrangement not in ["E", "R", "EC", "RP"]:
                return {"error": "Invalid arrangement."}
            elif event_schema.consolation not in ["N", "FR", "FM", "FF"]:
                return {"error": "Invalid consolation."}
            event.name = event_schema.name
            event.type = event_schema.type
            event.gender = event_schema.gender
            event.fee = event_schema.fee
            event.max_entry = event_schema.max_entry
            event.scoring_format = event_schema.scoring_format
            event.arrangement = event_schema.arrangement
            event.playoff = event_schema.playoff
            event.consolation = event_schema.consolation
            event.full_feed_last_round = event_schema.full_feed_last_round
            event.save()
            return {"message": "Event updated successfully!"}
        except ObjectDoesNotExist:
            return {"error": "Event not found."}
    except ObjectDoesNotExist:
        return {"error": "Tournament not found."}


@api.delete("/tournament/{tournament_id}/events/{event_id}", auth=JWTAuth())
def delete_event(request, tournament_id: str, event_id: str):
    try:
        tournament = Tournament.objects.get(id=tournament_id, owner=request.user)
        try:
            event = tournament.event_set.get(id=event_id)
            event.delete()
            return {"message": "Event deleted successfully!"}
        except ObjectDoesNotExist:
            return {"error": "Event not found."}
    except ObjectDoesNotExist:
        return {"error": "Tournament not found."}


@api.get("/tournament/{tournament_id}/events/{event_id}/entries", auth=JWTAuth())
def event_entries(request, tournament_id: str, event_id: str):
    try:
        tournament = Tournament.objects.get(id=tournament_id, owner=request.user)
        try:
            event = tournament.event_set.get(id=event_id)
            return {
                "entries": list(event.entry_set.all().values("id", "participant", "partner", "seed")),
            }
        except ObjectDoesNotExist:
            return {"error": "Event not found."}
    except ObjectDoesNotExist:
        return {"error": "Tournament not found."}


@api.post("/tournament/{tournament_id}/events/{event_id}/entries", auth=JWTAuth())
def add_entry(request, tournament_id: str, event_id: str, entry_schema: EntrySchema):
    try:
        tournament = Tournament.objects.get(id=tournament_id, owner=request.user)
        try:
            event = tournament.event_set.get(id=event_id)
            if event.entry_set.filter(participant=entry_schema.participant, partner=entry_schema.partner).exists():
                return {"error": "Entry already exists."}
            elif event.entry_set.filter(partner=entry_schema.participant, participant=entry_schema.partner).exists():
                return {"error": "Entry already exists."}
            elif event.entry_set.filter(participant=entry_schema.participant).exists() and not entry_schema.partner:
                return {"error": "Entry already exists."}
            elif event.type == "S" and entry_schema.partner:
                return {"error": "Singles event cannot have a partner."}
            elif event.type == "D" and not entry_schema.partner:
                return {"error": "Doubles event must have a partner."}
            elif event.type == "D" and entry_schema.participant == entry_schema.partner:
                return {"error": "Doubles partners must be different."}
            if event.type == "S":
                entry = Entry(participant=tournament.participants.get(id=entry_schema.participant), event=event)
            else:
                entry = Entry(participant=tournament.participants.get(id=entry_schema.participant),
                              partner=tournament.participants.get(id=entry_schema.partner), event=event)
            entry.save()
            return {"id": entry.id}
        except ObjectDoesNotExist:
            return {"error": "Event not found."}
    except ObjectDoesNotExist:
        return {"error": "Tournament not found."}


@api.get("/tournament/{tournament_id}/events/{event_id}/entries/{entry_id}", auth=JWTAuth())
def entry_detail(request, tournament_id: str, event_id: str, entry_id: str):
    try:
        tournament = Tournament.objects.get(id=tournament_id, owner=request.user)
        try:
            event = tournament.event_set.get(id=event_id)
            try:
                entry = event.entry_set.get(id=entry_id)
                return {
                    "participant": entry.participant,
                    "partner": entry.partner,
                    "seed": entry.seed,
                }
            except ObjectDoesNotExist:
                return {"error": "Entry not found."}
        except ObjectDoesNotExist:
            return {"error": "Event not found."}
    except ObjectDoesNotExist:
        return {"error": "Tournament not found."}


@api.put("/tournament/{tournament_id}/events/{event_id}/entries/{entry_id}", auth=JWTAuth())
def update_entry(request, tournament_id: str, event_id: str, entry_id: str, entry_schema: EntrySchema):
    try:
        tournament = Tournament.objects.get(id=tournament_id, owner=request.user)
        try:
            event = tournament.event_set.get(id=event_id)
            try:
                entry = event.entry_set.get(id=entry_id)
                if event.type == "S":
                    if event.entry_set.exclude(id=entry_id).filter(participant=entry_schema.participant).exists():
                        return {"error": "Entry already exists."}
                else:
                    if event.entry_set.exclude(id=entry_id).filter(participant=entry_schema.participant,
                                              partner=entry_schema.partner).exists():
                        return {"error": "Entry already exists."}
                    if event.entry_set.exclude(id=entry_id).filter(partner=entry_schema.participant,
                                                                   participant=entry_schema.partner).exists():
                        return {"error": "Entry already exists."}
                if event.type == "S" and entry_schema.partner:
                    return {"error": "Singles event cannot have a partner."}
                elif event.type == "D" and not entry_schema.partner:
                    return {"error": "Doubles event must have a partner."}
                elif event.type == "D" and entry_schema.participant == entry_schema.partner:
                    return {"error": "Doubles partners must be different."}
                entry.participant = tournament.participants.get(id=entry_schema.participant)
                entry.partner = tournament.participants.get(id=entry_schema.partner) if entry_schema.partner else None
                entry.seed = entry_schema.seed
                entry.save()
                return {"message": "Entry updated successfully!"}
            except ObjectDoesNotExist:
                return {"error": "Entry not found."}
        except ObjectDoesNotExist:
            return {"error": "Event not found."}
    except ObjectDoesNotExist:
        return {"error": "Tournament not found."}


@api.delete("/tournament/{tournament_id}/events/{event_id}/entries/{entry_id}", auth=JWTAuth())
def delete_entry(request, tournament_id: str, event_id: str, entry_id: str):
    try:
        tournament = Tournament.objects.get(id=tournament_id, owner=request.user)
        try:
            event = tournament.event_set.get(id=event_id)
            try:
                entry = event.entry_set.get(id=entry_id)
                entry.delete()
                return {"message": "Entry deleted successfully!"}
            except ObjectDoesNotExist:
                return {"error": "Entry not found."}
        except ObjectDoesNotExist:
            return {"error": "Event not found."}
    except ObjectDoesNotExist:
        return {"error": "Tournament not found."}


@api.get("/tournament/{tournament_id}/events/{event_id}/matches", auth=JWTAuth())
def event_matches(request, tournament_id: str, event_id: str):
    try:
        tournament = Tournament.objects.get(id=tournament_id, owner=request.user)
        try:
            event = tournament.event_set.get(id=event_id)
            matches = event.match_set.all().order_by('match')
            if not matches:
                return {"draw": False}
            draw = []
            for match in matches:
                if match.actual_end_time:
                    duration = match.actual_end_time - match.actual_start_time
                    total_seconds = int(duration.total_seconds())
                    duration_timedelta = timedelta(seconds=total_seconds)
                    if total_seconds < 3600:
                        duration_str = '{:02}:{:02}'.format(duration_timedelta.seconds // 60,
                                                            duration_timedelta.seconds % 60)
                    else:
                        duration_str = '{:02}:{:02}:{:02}'.format(duration_timedelta.seconds // 3600,
                                                                  (duration_timedelta.seconds // 60) % 60,
                                                                  duration_timedelta.seconds % 60)
                elif match.actual_start_time:
                    duration_str = "In Progress" + match.actual_start_time.strftime("%H:%M:%S")
                else:
                    duration_str = ""

                if match.team1 and not match.team2 and match.score == "1-0":
                    team1 = str(match.team1)
                    team2 = "Bye"
                    match.score = ""
                elif not match.team1 and match.team2 and match.score == "0-1":
                    team1 = "Bye"
                    team2 = str(match.team2)
                    match.score = ""
                else:
                    team1 = str(match.team1) if match.team1 else ""
                    team2 = str(match.team2) if match.team2 else ""

                draw.append({
                    "round": ROUND_CHOICES.get(match.round, match.round),
                    "time": match.scheduled_start_time.strftime("%Y-%m-%d %H:%M") if match.scheduled_start_time else "",
                    "match": match.match if match.match else "",
                    "team1": team1,
                    "team2": team2,
                    "score": match.score if match.score else "",
                    "duration": duration_str,
                    "court": match.court.number if match.court else "",
                })
            return {"matches": draw}
        except ObjectDoesNotExist:
            return {"error": "Event not found."}
    except ObjectDoesNotExist:
        return {"error": "Tournament not found."}


@api.get("/tournament/{tournament_id}/events/{event_id}/auto_draw", auth=JWTAuth())
def auto_draw(request, tournament_id: str, event_id: str, draw_size: int = 0):
    try:
        tournament = Tournament.objects.get(id=tournament_id, owner=request.user)
        try:
            event = tournament.event_set.get(id=event_id)
            if event.match_set.exclude(round="A").exists():
                return {"error": "Draw already exists."}
            entries = event.entry_set.all()
            draw = []
            if event.arrangement == 'E':
                if draw_size == 0:
                    return {"error": "Draw size is required for elimination events."}
                if draw_size < 2:
                    return {"error": "Draw size must be at least 2."}
                if draw_size & (draw_size - 1) != 0:
                    return {"error": "Draw size must be a power of 2."}
                teams = [None] * draw_size
                seeds = [entry for entry in entries if entry.seed]
                seeds.sort(key=lambda x: x.seed)
                entries = [entry for entry in entries if not entry.seed]
                random.shuffle(entries)

                index = 0
                reversed_index = len(teams) - 1
                top = True
                for seed in seeds:
                    if top:
                        teams[index] = seed
                        if entries:
                            teams[index + 1] = entries.pop(0)
                        index += 2
                        top = False
                    else:
                        teams[reversed_index] = seed
                        if entries:
                            teams[reversed_index - 1] = entries.pop(0)
                        reversed_index -= 2
                        top = True
                reversed_index = len(teams) - 1
                for i in range(len(teams)):
                    if not teams[i]:
                        if entries:
                            teams[i] = entries.pop(0)
                    if not teams[reversed_index]:
                        if entries:
                            teams[reversed_index] = entries.pop(0)
                    reversed_index -= 1

                match_number = Match.objects.filter(event__tournament=tournament).count() + 1

                for i in range(0, len(teams), 2):
                    if teams[i] and not teams[i + 1]:
                        score = "1-0"
                    elif not teams[i] and teams[i + 1]:
                        score = "0-1"
                    else:
                        score = ""
                    match = Match(event=event, round=draw_size, match=match_number, team1=teams[i],
                                  team2=teams[i + 1], score=score)
                    match.save()
                    match_number += 1

                    match_info = {
                        "round": ROUND_CHOICES.get(str(match.round), str(match.round)),
                        "time": "",
                        "match": match.match,
                        "team1": str(match.team1) if match.team1 else "Bye",
                        "team2": str(match.team2) if match.team2 else "Bye",
                        "score": "",
                        "duration": "",
                        "court": "",
                    }
                    draw.append(match_info)
                draw_size = draw_size // 2

                while draw_size > 1:
                    for i in range(0, draw_size, 2):
                        match = Match(event=event, round=draw_size, match=match_number)
                        match.save()
                        match_number += 1

                        match_info = {
                            "round": ROUND_CHOICES.get(str(match.round), str(match.round)),
                            "time": "",
                            "match": match.match,
                            "team1": "",
                            "team2": "",
                            "score": "",
                            "duration": "",
                            "court": "",
                        }
                        draw.append(match_info)
                    draw_size = draw_size // 2

                for i in draw:
                    if i['team1'] == "Bye" or i['team2'] == "Bye":
                        bye_match = Match.objects.get(event=event, match=i['match'])
                        next_match = Match.objects.get(event=event,
                                                       match=map_next_match(bye_match.match, int(bye_match.round), event))
                        next_match.team1 = bye_match.team1 if bye_match.team1 else bye_match.team2
                        next_match.save()
                        for j in draw:
                            if j['match'] == next_match.match:
                                j['team1'] = str(next_match.team1)
                                break
            # TODO: Pools, Round Robin, Elimination Cons
            return {"draw": draw}
        except ObjectDoesNotExist:
            return {"error": "Event not found."}
    except ObjectDoesNotExist:
        return {"error": "Tournament not found."}


@api.get("/tournament/{tournament_id}/events/{event_id}/manual_draw", auth=JWTAuth())
def manual_draw(request, tournament_id: str, event_id: str, draw_size: int = 0):
    try:
        tournament = Tournament.objects.get(id=tournament_id, owner=request.user)
        try:
            event = tournament.event_set.get(id=event_id)
            if event.match_set.exclude(round="A").exists():
                return {"error": "Draw already exists."}
            draw = []
            if event.arrangement == 'E':
                if draw_size == 0:
                    return {"error": "Draw size is required for elimination events."}
                if draw_size < 2:
                    return {"error": "Draw size must be at least 2."}
                if draw_size & (draw_size - 1) != 0:
                    return {"error": "Draw size must be a power of 2."}

                match_number = Match.objects.filter(event__tournament=tournament).count() + 1
                while draw_size > 1:
                    for i in range(0, draw_size, 2):
                        match = Match(event=event, round=draw_size, match=match_number)
                        match.save()
                        match_number += 1

                        match_info = {
                            "round": ROUND_CHOICES.get(str(match.round), str(match.round)),
                            "time": "",
                            "match": match.match,
                            "team1": "",
                            "team2": "",
                            "score": "",
                            "duration": "",
                            "court": "",
                        }
                        draw.append(match_info)
                    draw_size = draw_size // 2
            return {"draw": draw}
        except ObjectDoesNotExist:
            return {"error": "Event not found."}
    except ObjectDoesNotExist:
        return {"error": "Tournament not found."}


@api.get("/tournament/{tournament_id}/events/{event_id}/bracket", auth=JWTAuth())
def getEventBracket(request, tournament_id: str, event_id: str):
    try:
        tournament = Tournament.objects.get(id=tournament_id, owner=request.user)
        try:
            event = tournament.event_set.get(id=event_id)
            matches = event.match_set.exclude(round="A").order_by('match')

            draw = []
            current_round = ''
            for match in matches:
                if match.round != current_round:
                    current_round = match.round
                    draw.append({
                        "round": ROUND_CHOICES.get(match.round, match.round),
                        "matches": []
                    })
                if match.team1 and not match.team2 and match.score == "1-0":
                    team1 = str(match.team1)
                    team2 = "Bye"
                    match.score = ""
                elif not match.team1 and match.team2 and match.score == "0-1":
                    team1 = "Bye"
                    team2 = str(match.team2)
                    match.score = ""
                else:
                    team1 = str(match.team1) if match.team1 else ""
                    team2 = str(match.team2) if match.team2 else ""
                draw[-1]['matches'].append({
                    "id": match.match,
                    "team1": team1,
                    "team2": team2,
                    "score": match.score if match.score else "",
                })
            return {"draw": draw}
        except ObjectDoesNotExist:
            return {"error": "Event not found."}
    except ObjectDoesNotExist:
        return {"error": "Tournament not found."}


@api.get("/tournament/{tournament_id}/events/{event_id}/match/{match_id}", auth=JWTAuth())
def match_detail(request, tournament_id: str, event_id: str, match_id: str):
    try:
        tournament = Tournament.objects.get(id=tournament_id, owner=request.user)
        try:
            event = tournament.event_set.get(id=event_id)
            try:
                match = event.match_set.get(match=match_id)
                return {
                    "match": match.match,
                    "round": match.round,
                    "scheduled_start_time": match.scheduled_start_time.strftime("%Y-%m-%d %H:%M") if match.scheduled_start_time else "",
                    "team1": match.team1.id if match.team1 else "",
                    "team2": match.team2.id if match.team2 else "",
                    "score": match.score,
                    "court": match.court.number if match.court else "",
                    "note": match.note,
                    "no_match": match.no_match,
                }
            except ObjectDoesNotExist:
                return {"error": "Match not found."}
        except ObjectDoesNotExist:
            return {"error": "Event not found."}
    except ObjectDoesNotExist:
        return {"error": "Tournament not found."}
