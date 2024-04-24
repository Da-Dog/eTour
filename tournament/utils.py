from .models import Match


def map_next_match(current_match: int, current_round: int, event):
    matches = [i[0] for i in Match.objects.filter(round=current_round, event=event).values_list('match')]
    matches = list(zip(matches[::2], matches[1::2]))
    matches_next_round = Match.objects.filter(round=current_round // 2, event=event).values('match')
    for i in range(len(matches)):
        if current_match in matches[i]:
            return matches_next_round[i]['match']
