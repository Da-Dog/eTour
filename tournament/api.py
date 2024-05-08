from django.core.exceptions import ObjectDoesNotExist
from ninja_extra import NinjaExtraAPI
from ninja_jwt.authentication import JWTAuth
from ninja_jwt.controller import NinjaJWTDefaultController
from datetime import datetime

from .models import Participant, Tournament, Entry, Event, Match
from .schema import TournamentSchema, ParticipantSchema, EventSchema, EntrySchema, MatchSchema
from .utils import map_next_match, get_team_time, retrieve_event, retrieve_entry, retrieve_tournament, \
    retrieve_participant, retrieve_match, format_match_return, create_matches_elimination, fill_teams_elimination

import random

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
    def format_dates(tournaments):
        for i in tournaments:
            i["start_date"] = i["start_date"].strftime("%Y-%m-%d %H:%M")
            i["end_date"] = i["end_date"].strftime("%Y-%m-%d %H:%M")
            i["create_time"] = i["create_time"].strftime("%Y-%m-%d %H:%M")
            i["last_update_time"] = i["last_update_time"].strftime("%Y-%m-%d %H:%M")
        return tournaments

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
    return {"user": request.user.first_name if request.user.first_name else "Admin",
            "upcoming": format_dates(upcoming_tournaments), "past": format_dates(past_tournaments)}


@api.get("/tournament/{tournament_id}", auth=JWTAuth())
def tournament_detail(request, tournament_id: str):
    tournament, error = retrieve_tournament(tournament_id, request.user)
    if error:
        return error

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


@api.post("/tournament", auth=JWTAuth())
def tournament_create(request, tournament_schema: TournamentSchema):
    tournament = Tournament(**tournament_schema.dict(), owner=request.user)
    tournament.save()
    return {"message": "Tournament created successfully!", "id": tournament.id}


@api.put("/tournament/{tournament_id}", auth=JWTAuth())
def tournament_update(request, tournament_id: str, tournament_schema: TournamentSchema):
    tournament, error = retrieve_tournament(tournament_id, request.user)
    if error:
        return error

    update_fields = [
        'name', 'description', 'start_date', 'end_date', 'address_1', 'address_2',
        'city', 'state', 'zip_code', 'contact_name', 'contact_email', 'contact_phone'
    ]
    for field in update_fields:
        setattr(tournament, field, getattr(tournament_schema, field, getattr(tournament, field)))
    tournament.save()
    return {"message": "Tournament updated successfully!"}


@api.delete("/tournament/{tournament_id}", auth=JWTAuth())
def tournament_delete(request, tournament_id: str):
    tournament, error = retrieve_tournament(tournament_id, request.user)
    if error:
        return error
    tournament.delete()
    return {"message": "Tournament deleted successfully!"}


@api.get("/tournament/{tournament_id}/dashboard", auth=JWTAuth())
def tournament_dashboard(request, tournament_id: str):
    tournament, error = retrieve_tournament(tournament_id, request.user)
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


@api.get("/tournament/{tournament_id}/participants", auth=JWTAuth())
def tournament_participants(request, tournament_id: str):
    tournament, error = retrieve_tournament(tournament_id, request.user)
    if error:
        return error
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


@api.get("/tournament/{tournament_id}/participants/{participant_id}", auth=JWTAuth())
def participant_detail(request, tournament_id: str, participant_id: str):
    tournament, error = retrieve_tournament(tournament_id, request.user)
    if error:
        return error
    participant, error = retrieve_participant(tournament, participant_id)
    if error:
        return error
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


@api.post("/tournament/{tournament_id}/participants", auth=JWTAuth())
def add_participant(request, tournament_id: str, participant_schema: ParticipantSchema):
    tournament, error = retrieve_tournament(tournament_id, request.user)
    if error:
        return error
    participant = Participant(**participant_schema.dict())
    participant.save()
    tournament.participants.add(participant)
    return {"id": participant.id}


@api.put("/tournament/{tournament_id}/participants/{participant_id}", auth=JWTAuth())
def update_participant(request, tournament_id: str, participant_id: str, participant_schema: ParticipantSchema):
    tournament, error = retrieve_tournament(tournament_id, request.user)
    if error:
        return error
    participant, error = retrieve_participant(tournament, participant_id)
    if error:
        return error

    fields_to_update = [
        'first_name', 'middle_name', 'last_name', 'email', 'phone', 'date_of_birth',
        'gender', 'notes'
    ]
    for field in fields_to_update:
        setattr(participant, field, getattr(participant_schema, field, getattr(participant, field)))
    participant.save()
    return {"message": "Participant updated successfully!"}


@api.delete("/tournament/{tournament_id}/participants/{participant_id}", auth=JWTAuth())
def delete_participant(request, tournament_id: str, participant_id: str):
    tournament, error = retrieve_tournament(tournament_id, request.user)
    if error:
        return error
    participant = retrieve_participant(tournament, participant_id)
    if participant.tournament.count() == 1:
        participant.delete()
        return {"message": "Participant deleted successfully!"}
    else:
        tournament.participants.remove(participant)
        return {"message": "Participant removed from tournament!"}


@api.get("/tournament/{tournament_id}/participants/{participant_id}/entries", auth=JWTAuth())
def participant_entries(request, tournament_id: str, participant_id: str):
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


@api.get("/tournament/{tournament_id}/events", auth=JWTAuth())
def tournament_events(request, tournament_id: str):
    tournament, error = retrieve_tournament(tournament_id, request.user)
    if error:
        return error
    events = list(
        tournament.event_set.all().values("id", "name", "type", "gender", "fee", "max_entry", "draw_status"))
    for i in events:
        i["max_entry"] = i["max_entry"] if i["max_entry"] > 0 else "No Limit"
        i["draw_status"] = "Finalized" if i["draw_status"] == "F" else "Tentative" if i["draw_status"] == "T" \
            else "Pending"
    return {"events": events}


@api.post("/tournament/{tournament_id}/events", auth=JWTAuth())
def add_event(request, tournament_id: str, event_schema: EventSchema):
    tournament, error = retrieve_tournament(tournament_id, request.user)
    if error:
        return error
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


@api.get("/tournament/{tournament_id}/events/{event_id}", auth=JWTAuth())
def event_detail(request, tournament_id: str, event_id: str):
    tournament, error = retrieve_tournament(tournament_id, request.user)
    if error:
        return error
    event, error = retrieve_event(tournament, event_id)
    if error:
        return error
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


@api.put("/tournament/{tournament_id}/events/{event_id}", auth=JWTAuth())
def update_event(request, tournament_id: str, event_id: str, event_schema: EventSchema):
    tournament, error = retrieve_tournament(tournament_id, request.user)
    if error:
        return error
    event, error = retrieve_event(tournament, event_id)
    if error:
        return error
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


@api.delete("/tournament/{tournament_id}/events/{event_id}", auth=JWTAuth())
def delete_event(request, tournament_id: str, event_id: str):
    tournament, error = retrieve_tournament(tournament_id, request.user)
    if error:
        return error
    event, error = retrieve_event(tournament, event_id)
    if error:
        return error
    event.delete()
    return {"message": "Event deleted successfully!"}


@api.get("/tournament/{tournament_id}/events/{event_id}/entries", auth=JWTAuth())
def event_entries(request, tournament_id: str, event_id: str):
    tournament, error = retrieve_tournament(tournament_id, request.user)
    if error:
        return error
    event, error = retrieve_event(tournament, event_id)
    if error:
        return error
    return {
        "entries": list(event.entry_set.all().values("id", "participant", "partner", "seed")),
    }


@api.post("/tournament/{tournament_id}/events/{event_id}/entries", auth=JWTAuth())
def add_entry(request, tournament_id: str, event_id: str, entry_schema: EntrySchema):
    tournament, error = retrieve_tournament(tournament_id, request.user)
    if error:
        return error
    event, error = retrieve_event(tournament, event_id)
    if error:
        return error
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


@api.get("/tournament/{tournament_id}/events/{event_id}/entries/{entry_id}", auth=JWTAuth())
def entry_detail(request, tournament_id: str, event_id: str, entry_id: str):
    tournament, error = retrieve_tournament(tournament_id, request.user)
    if error:
        return error
    entry, error = retrieve_entry(tournament, event_id, entry_id)
    if error:
        return error
    return {
        "participant": entry.participant,
        "partner": entry.partner,
        "seed": entry.seed,
    }


@api.put("/tournament/{tournament_id}/events/{event_id}/entries/{entry_id}", auth=JWTAuth())
def update_entry(request, tournament_id: str, event_id: str, entry_id: str, entry_schema: EntrySchema):
    tournament, error = retrieve_tournament(tournament_id, request.user)
    if error:
        return error
    event, error = retrieve_event(tournament, event_id)
    if error:
        return error
    entry, error = retrieve_entry(tournament, event, entry_id)
    if error:
        return error
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


@api.delete("/tournament/{tournament_id}/events/{event_id}/entries/{entry_id}", auth=JWTAuth())
def delete_entry(request, tournament_id: str, event_id: str, entry_id: str):
    tournament, error = retrieve_tournament(tournament_id, request.user)
    if error:
        return error
    entry, error = retrieve_entry(tournament, event_id, entry_id)
    if error:
        return error
    entry.delete()
    return {"message": "Entry deleted successfully!"}


@api.get("/tournament/{tournament_id}/events/{event_id}/matches", auth=JWTAuth())
def event_matches(request, tournament_id: str, event_id: str):
    tournament, error = retrieve_tournament(tournament_id, request.user)
    if error:
        return error
    event, error = retrieve_event(tournament, event_id)
    if error:
        return error
    matches = event.match_set.all().order_by('match')
    if not matches:
        return {"draw": False}
    draw = []
    for match in matches:
        draw.append(format_match_return(match))
    return {"matches": draw}


@api.get("/tournament/{tournament_id}/events/{event_id}/auto_draw", auth=JWTAuth())
def auto_draw(request, tournament_id: str, event_id: str, draw_size: int = 0):
    tournament, error = retrieve_tournament(tournament_id, request.user)
    if error:
        return error
    event, error = retrieve_event(tournament, event_id)
    if error:
        return error
    if event.match_set.exclude(round="A").exists():
        return {"error": "Draw already exists."}

    entries = list(event.entry_set.all())
    draw = []
    # TODO: Pools, Round Robin, Elimination Cons
    if event.arrangement == 'E':
        if draw_size == 0:
            return {"error": "Draw size is required for elimination events."}
        if draw_size < 2:
            return {"error": "Draw size must be at least 2."}
        if draw_size & (draw_size - 1) != 0:
            return {"error": "Draw size must be a power of 2."}

        teams = [None] * draw_size
        seeds = sorted((e for e in entries if e.seed), key=lambda x: x.seed)
        non_seeds = [e for e in entries if not e.seed]
        random.shuffle(non_seeds)

        fill_teams_elimination(teams, seeds, non_seeds)
        create_matches_elimination(teams, event, draw)

        if event.playoff:
            match_number = Match.objects.filter(event__tournament=tournament).count() + 1
            match = Match(event=event, round="3/4", match=match_number)
            match.save()
            draw.append(format_match_return(match))

    return {"draw": draw}


@api.get("/tournament/{tournament_id}/events/{event_id}/manual_draw", auth=JWTAuth())
def manual_draw(request, tournament_id: str, event_id: str, draw_size: int = 0):
    tournament, error = retrieve_tournament(tournament_id, request.user)
    if error:
        return error
    event, error = retrieve_event(tournament, event_id)
    if error:
        return error
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

                draw.append(format_match_return(match))
            draw_size = draw_size // 2
        if event.playoff:
            match = Match(event=event, round="3/4", match=match_number)
            match.save()
            draw.append(format_match_return(match))
    return {"draw": draw}


@api.get("/tournament/{tournament_id}/events/{event_id}/bracket", auth=JWTAuth())
def get_event_bracket(request, tournament_id: str, event_id: str):
    tournament, error = retrieve_tournament(tournament_id, request.user)
    if error:
        return error
    event, error = retrieve_event(tournament, event_id)
    if error:
        return error
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

        duration_str, team1, team2 = get_team_time(match)

        draw[-1]['matches'].append({
            "id": match.match,
            "team1": team1,
            "team2": team2,
            "score": match.score if match.score else "",
            "no_match": match.no_match,
        })
    return {"draw": draw}


@api.get("/tournament/{tournament_id}/events/{event_id}/match/{match_id}", auth=JWTAuth())
def match_detail(request, tournament_id: str, event_id: str, match_id: str):
    tournament, error = retrieve_tournament(tournament_id, request.user)
    if error:
        return error
    event, error = retrieve_event(tournament, event_id)
    if error:
        return error
    match, error = retrieve_match(event, match_id)
    if error:
        return error
    return {
        "match": match.match,
        "round": match.round,
        "scheduled_start_time": match.scheduled_start_time.strftime(
            "%Y-%m-%dT%H:%M") if match.scheduled_start_time else "",
        "team1": match.team1.id if match.team1 else "",
        "team2": match.team2.id if match.team2 else "",
        "score": match.score,
        "court": match.court.number if match.court else "",
        "note": match.note,
        "no_match": match.no_match,
    }


# Update only, no automatic workflow
@api.put("/tournament/{tournament_id}/events/{event_id}/match/{match_id}", auth=JWTAuth())
def update_match(request, tournament_id: str, event_id: str, match_id: str, match_schema: MatchSchema):
    tournament, error = retrieve_tournament(tournament_id, request.user)
    if error:
        return error
    event, error = retrieve_event(tournament, event_id)
    if error:
        return error
    if match_id != "new":
        match, error = retrieve_match(event, match_id)
        if error:
            return error
    else:
        match = Match(event=event)
        match.match = Match.objects.filter(event=event).count() + 1
    match.scheduled_start_time = datetime.strptime(match_schema.scheduled_start_time,
                                                   "%Y-%m-%dT%H:%M") if match_schema.scheduled_start_time else None
    try:
        match.team1 = event.entry_set.get(
            id=match_schema.team1) if match_schema.team1 else None
        match.team2 = event.entry_set.get(
            id=match_schema.team2) if match_schema.team2 else None
    except ObjectDoesNotExist:
        return {"error": "Participant not found."}
    if match_schema.court:
        try:
            court = tournament.court_set.get(number=match_schema.court)
            match.court = court
        except ObjectDoesNotExist:
            return {"error": "Court not found."}
    else:
        match.court = None
    if match_schema.score1:
        if not match_schema.score2:
            return {"error": "Score 2 is required."}
        if match_schema.score1 == match_schema.score2:
            return {"error": "Score 1 and Score 2 must be different."}
        match.score = str(match_schema.score1) + "-" + str(match_schema.score2)
        if match_schema.score3:
            if not match_schema.score4:
                return {"error": "Score 4 is required."}
            if match_schema.score5 and not match_schema.score6:
                return {"error": "Score 6 is required."}
            if match_schema.score3 == match_schema.score4:
                return {"error": "Score 3 and Score 4 must be different."}
            if match_schema.score5 and match_schema.score5 == match_schema.score6:
                return {"error": "Score 5 and Score 6 must be different."}
            if match_schema.score1 == match_schema.score3 == match_schema.score5 or \
                    match_schema.score2 == match_schema.score4 == match_schema.score6:
                return {"error": "Score format error"}
            match.score += "," + str(match_schema.score3) + "-" + str(match_schema.score4)
            if match_schema.score5:
                match.score += "," + str(match_schema.score5) + "-" + str(match_schema.score6)
    else:
        match.score = ""
    match.no_match = match_schema.no_match if match_schema.no_match else False
    match.note = match_schema.note
    match.save()

    return format_match_return(match)


@api.delete("/tournament/{tournament_id}/events/{event_id}/remove_draws", auth=JWTAuth())
def remove_draws(request, tournament_id: str, event_id: str):
    tournament, error = retrieve_tournament(tournament_id, request.user)
    if error:
        return error
    event, error = retrieve_event(tournament, event_id)
    if error:
        return error
    matches = event.match_set.all()
    for match in matches:
        match.delete()
    return {"success": True}
