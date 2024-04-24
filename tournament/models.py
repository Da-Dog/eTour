from django.db import models
import uuid


# Create your models here.
class Tournament(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    description = models.TextField()
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()

    address_1 = models.CharField(max_length=100)
    address_2 = models.CharField(max_length=100, null=True, blank=True)
    city = models.CharField(max_length=32)
    state = models.CharField(max_length=16)
    zip_code = models.CharField(max_length=10)

    contact_name = models.CharField(max_length=100)
    contact_email = models.EmailField()
    contact_phone = models.CharField(max_length=20)
    owner = models.ForeignKey('auth.User', related_name='tournaments', on_delete=models.CASCADE)

    create_time = models.DateTimeField(auto_now_add=True)
    last_update_time = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class Participant(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    first_name = models.CharField(max_length=100)
    middle_name = models.CharField(max_length=100, null=True, blank=True)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(null=True, blank=True)
    phone = models.CharField(max_length=20, null=True, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=1)  # M - male, F - female
    notes = models.TextField(blank=True, null=True)
    tournament = models.ManyToManyField(Tournament, related_name='participants')
    create_time = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.first_name + ' ' + self.last_name


class Event(models.Model):
    id = models.AutoField(primary_key=True)
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=1)  # S - Single, D - Double
    gender = models.CharField(max_length=1)
    fee = models.DecimalField(max_digits=6, decimal_places=2)
    max_entry = models.IntegerField()  # max double participants = max_entry * 2, 0 = no limit
    scoring_format = models.CharField(max_length=1)  # S - Standard, O - One Set
    arrangement = models.CharField(max_length=2)  # E - Elimination, R - Round Robin, EC - Elimination Consolation, RP - Round Robin Playoff (pools)
    playoff = models.BooleanField(default=True)  # True - playoff 3/4, False - no 3/4 playoff
    consolation = models.CharField(max_length=2)  # N - None, FR - First Round, FM - First Match, FF - Full Feed
    full_feed_last_round = models.CharField(max_length=2, null=True, blank=True)  # F - Final, S - Semi, Q - Quarter, 16 - 16th, 32 - 32nd...
    draw_status = models.CharField(max_length=1, default="P")  # F - Finalized, T - Tentative, P - Pending

    def __str__(self):
        return self.name


class Entry(models.Model):
    id = models.AutoField(primary_key=True)
    event = models.ForeignKey(Event, on_delete=models.CASCADE)
    participant = models.ForeignKey(Participant, on_delete=models.CASCADE, related_name='participant')
    partner = models.ForeignKey(Participant, on_delete=models.CASCADE, related_name='partner', null=True, blank=True)
    seed = models.IntegerField(null=True, blank=True)

    def __str__(self):
        return self.participant.first_name + ' ' + self.participant.last_name + ((' / ' + self.partner.first_name + ' ' + self.partner.last_name) if self.partner else '')


class Court(models.Model):
    id = models.AutoField(primary_key=True)
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE)
    number = models.IntegerField()
    note = models.TextField(blank=True, null=True)

    def __str__(self):
        return 'Court ' + str(self.number)


class Match(models.Model):
    id = models.AutoField(primary_key=True)
    event = models.ForeignKey(Event, on_delete=models.CASCADE)
    court = models.ForeignKey(Court, on_delete=models.CASCADE, null=True, blank=True)
    round = models.CharField(max_length=3)  # R - Round Robin, RG1 - Round Robin Group 1, A - Additional, F - Final,
    # SF - Semi Final, QF - Quarter Final, 16 - Round 16, 32 - Round 32...
    match = models.IntegerField()
    team1 = models.ForeignKey(Entry, on_delete=models.CASCADE, related_name='team1', null=True, blank=True)
    team2 = models.ForeignKey(Entry, on_delete=models.CASCADE, related_name='team2', null=True, blank=True)
    score = models.CharField(max_length=20, null=True, blank=True) # score = 1-0/0-1 Team 1 / Team 2 Walkover,
    # format: 0-0,0-0,0-0
    scheduled_start_time = models.DateTimeField(null=True, blank=True)
    actual_start_time = models.DateTimeField(null=True, blank=True)
    actual_end_time = models.DateTimeField(null=True, blank=True)
    last_update_time = models.DateTimeField(auto_now=True, null=True, blank=True)
    note = models.TextField(null=True, blank=True)
    no_match = models.BooleanField(default=False)

    def __str__(self):
        return 'Match #' + str(self.match)


class Message(models.Model):
    id = models.AutoField(primary_key=True)
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE)
    subject = models.CharField(max_length=100)
    content = models.TextField()
    receiver = models.ManyToManyField(Participant)
    send_time = models.DateTimeField()
    create_time = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return 'Message: ' + self.subject
