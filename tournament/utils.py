from datetime import timedelta

from .models import Tournament, Entry, Event, Match, Participant


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
    "A": "Additional",
}


def map_next_match(current_match: int, current_round: int, event):
    matches = [i[0] for i in Match.objects.filter(round=current_round, event=event).values_list('match')]
    matches = list(zip(matches[::2], matches[1::2]))
    matches_next_round = Match.objects.filter(round=current_round // 2, event=event).values('match')
    for i in range(len(matches)):
        if current_match in matches[i]:
            return matches_next_round[i]['match']


def team_win(winner, event, match):
    next_match = Match.objects.get(event=event, match=map_next_match(match.match, int(match.round), event))
    winning_team = match.team1 if winner == 1 else match.team2

    if not next_match.team1 and not next_match.team2:
        next_match.team1 = winning_team
    elif next_match.team1 in [match.team1, match.team2]:
        next_match.team1 = winning_team
    elif next_match.team2 in [match.team1, match.team2]:
        next_match.team2 = winning_team
    else:
        return {"error": "Invalid match. Next match already has teams."}

    next_match.save()


def get_team_time(match):
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
        duration_str = "In Progress " + match.actual_start_time.strftime("%H:%M:%S")
    else:
        duration_str = ""

    if match.no_match:
        team1 = str(match.team1) if match.team1 else "Bye"
        team2 = str(match.team2) if match.team2 else "Bye"
    else:
        team1 = str(match.team1) if match.team1 else ""
        team2 = str(match.team2) if match.team2 else ""

    return duration_str, team1, team2


def get_object_or_error(model, **kwargs):
    try:
        return model.objects.get(**kwargs), None
    except model.DoesNotExist:
        return None, {"error": f"{model.__name__} not found."}
    except Exception as e:
        return None, {"error": str(e)}


def retrieve_tournament(tournament_id, user):
    return get_object_or_error(Tournament, id=tournament_id, owner=user)


def retrieve_event(tournament, event_id):
    return get_object_or_error(Event, tournament=tournament, id=event_id)


def retrieve_entry(event, entry_id):
    return get_object_or_error(Entry, event=event, id=entry_id)


def retrieve_participant(tournament, participant_id):
    return get_object_or_error(Participant, tournament=tournament, id=participant_id)


def retrieve_match(event, match_id):
    return get_object_or_error(Match, event=event, match=match_id)


def format_match_return(match):
    duration_str, team1, team2 = get_team_time(match)

    return {
        "round": ROUND_CHOICES.get(str(match.round), match.round),
        "time": match.scheduled_start_time.strftime("%Y-%m-%d %H:%M") if match.scheduled_start_time else "",
        "match": match.match if match.match else "",
        "team1": team1,
        "team2": team2,
        "score": match.score if match.score else "",
        "duration": duration_str,
        "court": match.court.number if match.court else "",
    }


def fill_teams_elimination(teams, seeds, non_seeds):
    index, reversed_index = 0, len(teams) - 1
    top = True
    for seed in seeds:
        if top:
            teams[index] = seed
            teams[index + 1:index + 2] = non_seeds[:1]
            non_seeds = non_seeds[1:]
            index += 2
        else:
            teams[reversed_index] = seed
            teams[reversed_index - 1:reversed_index] = non_seeds[:1]
            non_seeds = non_seeds[1:]
            reversed_index -= 2
        top = not top

    for i in range(len(teams)):
        if not teams[i]:
            teams[i] = non_seeds.pop(0) if non_seeds else None


def create_matches_elimination(teams, event, draw):
    match_number = Match.objects.filter(event__tournament=event.tournament).count() + 1
    draw_size = len(teams)
    while draw_size > 1:
        for i in range(0, draw_size, 2):
            match = Match(event=event, round=draw_size, match=match_number,
                          team1=teams[i], team2=teams[i + 1])
            match.save()
            draw.append({"match": match_number, "team1": str(teams[i]), "team2": str(teams[i + 1])})
            match_number += 1
        draw_size //= 2
