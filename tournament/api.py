from django.core.exceptions import ObjectDoesNotExist
from ninja_extra import NinjaExtraAPI
from ninja_jwt.authentication import JWTAuth
from ninja_jwt.controller import NinjaJWTDefaultController
from ninja import Schema
from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime

from .models import Tournament


class TournamentSchema(Schema):
    name: str = Field(..., min_length=1, max_length=100)
    description: str = Field(..., min_length=1, max_length=500)
    start_date: datetime
    end_date: datetime
    address_1: str = Field(..., min_length=1, max_length=200)
    address_2: Optional[str] = Field(None, min_length=1, max_length=200)
    city: str = Field(..., min_length=1, max_length=100)
    state: str = Field(..., min_length=1, max_length=100)
    zip_code: str = Field(..., min_length=1, max_length=20)
    contact_name: str = Field(..., min_length=1, max_length=100)
    contact_email: EmailStr
    contact_phone: str = Field(..., min_length=1, max_length=20)


api = NinjaExtraAPI()
api.register_controllers(NinjaJWTDefaultController)


@api.get("/")
def home(request):
    return {"message": "Hi there! :)"}


@api.get("/tournament", auth=JWTAuth())
def tournament_list(request):
    current_time = datetime.fromtimestamp(int(request.META.get('HTTP_CURRENT_TIME'))/1000.0)
    upcoming_tournaments = list(Tournament.objects.filter(end_date__gte=current_time, owner=request.user).values("id", "name",
                                                                                                 "start_date",
                                                                                                 "end_date", "last_update_time", "create_time"))
    past_tournaments = list(Tournament.objects.filter(end_date__lt=current_time, owner=request.user).values("id", "name", "start_date",
                                                                                            "end_date", "last_update_time", "create_time"))
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