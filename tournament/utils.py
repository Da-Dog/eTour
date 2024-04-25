from .models import Match


def map_next_match(current_match: int, current_round: int, event):
    matches = [i[0] for i in Match.objects.filter(round=current_round, event=event).values_list('match')]
    matches = list(zip(matches[::2], matches[1::2]))
    matches_next_round = Match.objects.filter(round=current_round // 2, event=event).values('match')
    for i in range(len(matches)):
        if current_match in matches[i]:
            return matches_next_round[i]['match']


def team_win(winner, event, match):
    next_match = Match.objects.get(event=event,
                                   match=map_next_match(match.match, int(match.round),
                                                        event))
    if winner == 1:
        # team1 wins
        if not next_match.team1 and not next_match.team2:
            next_match.team1 = match.team1
        else:
            if next_match.team1 == match.team2:
                next_match.team1 = match.team1
            elif next_match.team2 == match.team2:
                next_match.team2 = match.team1
            else:
                return {"error": "Invalid match. Next match already has teams."}
    else:
        # team2 wins
        if not next_match.team1 and not next_match.team2:
            next_match.team1 = match.team2
        else:
            if next_match.team1 == match.team1:
                next_match.team1 = match.team2
            elif next_match.team2 == match.team1:
                next_match.team2 = match.team2
            else:
                return {"error": "Invalid match. Next match already has teams."}
    next_match.save()
