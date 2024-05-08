import axios from 'axios';
import Cookies from "js-cookie";

const BASE_URL = 'http://127.0.0.1:8000';

const getHeaders = () => {
    let token = Cookies.get('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
    };
}

export const login = async (email, password) => {
    const response = await axios.post(`${BASE_URL}/token/pair`, {
        'username': email,
        'password': password
    });

    const data = response.data;
    if (data.access) {
        Cookies.set('token', data.access);
        Cookies.set('refresh', data.refresh);
        Cookies.set('last_refresh', Date.now());
    } else {
        alert(data.detail);
    }
}

export const refresh = async () => {
    const refreshToken = Cookies.get('refresh');

    if (!refreshToken) {
        return false;
    }
    let success = false;
    try {
        const response = await axios.post(`${BASE_URL}/token/refresh`, {
            'refresh': refreshToken
        });

        const data = response.data;
        if (data.access) {
            Cookies.set('token', data.access);
            Cookies.set('last_refresh', Date.now());
            success = true;
        }
    } catch (error) {
        alert(error);
    }
    return success;
}

export const getTournamentList = async () => {
    let token = Cookies.get('token');
    try {
        let response = await axios.get(`${BASE_URL}/tournament`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Current-Time': Date.now(),
            },
        });

        if (response.status === 200) {
            return response.data;
        } else {
            alert("Failed to fetch tournament list");
        }
    } catch (error) {
        alert(error);
    }
}

export const createTournament = async (name, description, startDate, endDate, address1, address2, city, state, zipCode, contactName, contactEmail, contactPhone) => {
    try {
        let response = await axios.post(`${BASE_URL}/tournament`, {
            'name': name,
            'description': description,
            'start_date': startDate,
            'end_date': endDate,
            'address_1': address1,
            'address_2': address2 ? address2 : null,
            'city': city,
            'state': state,
            'zip_code': zipCode,
            'contact_name': contactName,
            'contact_email': contactEmail,
            'contact_phone': contactPhone,
        }, {
            headers: getHeaders(),
        });

        if (response.status !== 200) {
            alert("Failed to create tournament");
            return false;
        } else {
            return response.data;
        }
    } catch (error) {
        alert(error);
    }
}

export const deleteTournament = async (id) => {
    try {
        let response = await axios.delete(`${BASE_URL}/tournament/${id}`, {
            headers: getHeaders(),
        });

        if (response.status !== 200) {
            alert("Failed to delete tournament");
        } else {
            alert("Tournament deleted successfully");
        }
    } catch (error) {
        alert(error);
    }
}

export const getTournament = async (id) => {
    try {
        let response = await axios.get(`${BASE_URL}/tournament/${id}`, {
            headers: getHeaders(),
        });

        if (response.status !== 200) {
            alert("Failed to fetch tournament");
        } else {
            return response.data;
        }
    } catch (error) {
        alert(error);
    }
}

export const editTournament = async (id, name, description, startDate, endDate, address1, address2, city, state, zipCode, contactName, contactEmail, contactPhone) => {
    try {
        let response = await axios.put(`${BASE_URL}/tournament/${id}`, {
            'name': name,
            'description': description,
            'start_date': startDate,
            'end_date': endDate,
            'address_1': address1,
            'address_2': address2 ? address2 : null,
            'city': city,
            'state': state,
            'zip_code': zipCode,
            'contact_name': contactName,
            'contact_email': contactEmail,
            'contact_phone': contactPhone,
        }, {
            headers: getHeaders(),
        });

        if (response.status !== 200) {
            alert("Failed to update tournament");
            return false;
        } else {
            return response.data;
        }
    } catch (error) {
        alert(error);
    }
}

export const getTournamentDashboard = async (id) => {
    try {
        let response = await axios.get(`${BASE_URL}/tournament/${id}/dashboard`, {
            headers: getHeaders(),
        });

        if (response.status !== 200) {
            alert("Failed to fetch tournament dashboard");
        } else {
            return response.data;
        }
    } catch (error) {
        alert(error);
    }
}

export const getTournamentPlayers = async (id) => {
    try {
        let response = await axios.get(`${BASE_URL}/tournament/${id}/participants`, {
            headers: getHeaders(),
        });

        if (response.status !== 200) {
            alert("Failed to fetch players");
        } else {
            return response.data;
        }
    } catch (error) {
        alert(error);
    }
}

export const addPlayer = async (id, player) => {
    try {
        let response = await axios.post(`${BASE_URL}/tournament/${id}/participants`, {
            "first_name": player.first_name,
            "middle_name": player.middle_name ? player.middle_name : null,
            "last_name": player.last_name,
            "email": player.email ? player.email : null,
            "phone": player.phone ? player.phone : null,
            "date_of_birth": player.date_of_birth ? player.date_of_birth : null,
            "gender": player.gender,
            "notes": player.notes ? player.notes : null,
        }, {
            headers: getHeaders(),
        });

        if (response.status !== 200) {
            alert("Failed to add player");
        } else {
            return response.data;
        }
    } catch (error) {
        alert(error);
    }
}

export const getPlayer = async (tournamentId, playerId) => {
    try {
        let response = await axios.get(`${BASE_URL}/tournament/${tournamentId}/participants/${playerId}`, {
            headers: getHeaders(),
        });

        if (response.status !== 200) {
            alert("Failed to fetch player");
        } else {
            return response.data;
        }
    } catch (error) {
        alert(error);
    }
}

export const updatePlayer = async (tournamentId, playerId, player) => {
    try {
        let response = await axios.put(`${BASE_URL}/tournament/${tournamentId}/participants/${playerId}`, {
            "first_name": player.first_name,
            "middle_name": player.middle_name ? player.middle_name : null,
            "last_name": player.last_name,
            "email": player.email ? player.email : null,
            "phone": player.phone ? player.phone : null,
            "date_of_birth": player.date_of_birth ? player.date_of_birth : null,
            "gender": player.gender,
            "notes": player.notes ? player.notes : null,
        }, {
            headers: getHeaders(),
        });

        if (response.status !== 200) {
            alert("Failed to update player");
        }
    } catch (error) {
        alert(error);
    }
}

export const deletePlayer = async (tournamentId, playerId) => {
    try {
        let response = await axios.delete(`${BASE_URL}/tournament/${tournamentId}/participants/${playerId}`, {
            headers: getHeaders(),
        });

        if (response.status !== 200) {
            alert("Failed to delete player");
        }
    } catch (error) {
        alert(error);
    }
}

export const getPlayerEntries = async (tournamentId, participantId) => {
    try {
        let response = await axios.get(`${BASE_URL}/tournament/${tournamentId}/participants/${participantId}/entries`, {
            headers: getHeaders(),
        });

        if (response.status !== 200) {
            alert("Failed to fetch player entries");
        } else {
            return response.data.entries;
        }
    } catch (error) {
        alert(error);
    }
}

export const getEvents = async (tournamentId) => {
    try {
        let response = await axios.get(`${BASE_URL}/tournament/${tournamentId}/events`, {
            headers: getHeaders(),
        });

        if (response.status !== 200) {
            alert("Failed to fetch events");
        } else {
            return response.data.events;
        }
    } catch (error) {
        alert(error);
    }
}

export const addEvent = async (tournamentId, event) => {
    try {
        let response = await axios.post(`${BASE_URL}/tournament/${tournamentId}/events`, {
            name: event.name,
            type: event.type,
            gender: event.gender,
            fee:  parseFloat(event.fee),
            max_entry: event.max_entry,
            scoring_format: event.scoring_format,
            arrangement: event.arrangement,
            playoff: event.playoff,
            consolation: event.consolation,
            full_feed_last_round: event.full_feed_last_round ? event.full_feed_last_round : null
        }, {
            headers: getHeaders()
        });

        if (response.status !== 200) {
            alert("Failed to add event");
        } else {
            return response.data;
        }
    } catch (error) {
        alert(error);
    }
}

export const getEvent = async (tournamentId, eventId) => {
    try {
        let response = await axios.get(`${BASE_URL}/tournament/${tournamentId}/events/${eventId}`, {
            headers: getHeaders()
        });

        if (response.status !== 200) {
            alert("Failed to fetch event");
        } else {
            return response.data;
        }
    } catch (error) {
        alert(error);
    }
}

export const updateEvent = async (tournamentId, eventId, event) => {
    try {
        let response = await axios.put(`${BASE_URL}/tournament/${tournamentId}/events/${eventId}`, {
            name: event.name,
            type: event.type,
            gender: event.gender,
            fee:  parseFloat(event.fee),
            max_entry: event.max_entry,
            scoring_format: event.scoring_format,
            arrangement: event.arrangement,
            playoff: event.playoff,
            consolation: event.consolation,
            full_feed_last_round: event.full_feed_last_round ? event.full_feed_last_round : null
        }, {
            headers: getHeaders()
        });

        if (response.status !== 200) {
            alert("Failed to update event");
        } else {
            return response.data;
        }
    } catch (error) {
        alert(error);
    }
}

export const deleteEvent = async (tournamentId, eventId) => {
    try {
        let response = await axios.delete(`${BASE_URL}/tournament/${tournamentId}/events/${eventId}`, {
            headers: getHeaders(),
        });

        if (response.status !== 200) {
            alert("Failed to delete event");
        } else {
            alert("Event deleted successfully");
        }
    } catch (error) {
        alert(error);
    }
}

export const addEntry = async (tournamentId, eventId, entry) => {
    try {
        let response = await axios.post(`${BASE_URL}/tournament/${tournamentId}/events/${eventId}/entries`, {
            participant: entry.player,
            partner: entry.partner ? entry.partner : null,
            seed: entry.seeding ? entry.seeding : null,
        }, {
            headers: getHeaders()
        });

        if (response.status !== 200) {
            alert("Failed to add entry");
        } else {
            return response.data;
        }
    } catch (error) {
        alert(error);
    }
}

export const updateEntry = async (tournamentId, eventId, entry) => {
    try {
        let response = await axios.put(`${BASE_URL}/tournament/${tournamentId}/events/${eventId}/entries/${entry.entry_id}`, {
            participant: entry.player,
            partner: entry.partner ? entry.partner : null,
            seed: entry.seed ? entry.seed : null,
        }, {
            headers: getHeaders()
        });

        if (response.status !== 200) {
            alert("Failed to update entry");
        } else {
            return response.data;
        }
    } catch (error) {
        alert(error);
    }
}

export const deleteEntry = async (tournamentId, eventId, entryId) => {
    try {
        let response = await axios.delete(`${BASE_URL}/tournament/${tournamentId}/events/${eventId}/entries/${entryId}`, {
            headers: getHeaders(),
        });

        if (response.status !== 200) {
            alert("Failed to delete entry");
            return false;
        } else {
            return true;
        }
    } catch (error) {
        alert(error);
    }
}

export const autoDraw = async (tournamentId, eventId, drawSize) => {
    try {
        let response = await axios.get(`${BASE_URL}/tournament/${tournamentId}/events/${eventId}/auto_draw`, {
            headers: getHeaders(),
            params: {draw_size: drawSize}
        });

        if (response.status !== 200) {
            alert("Failed to auto draw");
        } else {
            return response.data;
        }
    } catch (error) {
        alert(error);
    }
}

export const getMatches = async (tournamentId, eventId) => {
    try {
        let response = await axios.get(`${BASE_URL}/tournament/${tournamentId}/events/${eventId}/matches`, {
            headers: getHeaders()
        });

        if (response.status !== 200) {
            alert("Failed to fetch matches");
        } else {
            return response.data;
        }
    } catch (error) {
        alert(error);
    }
}

export const getEventBracket = async (tournamentId, eventId) => {
    try {
        let response = await axios.get(`${BASE_URL}/tournament/${tournamentId}/events/${eventId}/bracket`, {
            headers: getHeaders()
        });

        if (response.status !== 200) {
            alert("Failed to fetch bracket");
        } else {
            return response.data;
        }
    } catch (error) {
        alert(error);
    }
}

export const getMatch = async (tournamentId, eventId, match) => {
    try {
        let response = await axios.get(`${BASE_URL}/tournament/${tournamentId}/events/${eventId}/match/${match}`, {
            headers: getHeaders()
        });

        if (response.status !== 200) {
            alert("Failed to fetch match");
        } else {
            return response.data;
        }
    } catch (error) {
        alert(error);
    }
}

export const manualDraw = async (tournamentId, eventId, drawSize) => {
    try {
        let response = await axios.get(`${BASE_URL}/tournament/${tournamentId}/events/${eventId}/manual_draw`, {
            headers: getHeaders(),
            params: {draw_size: drawSize}
        });

        if (response.status !== 200) {
            alert("Failed to create empty draw");
        } else {
            return response.data;
        }
    } catch (error) {
        alert(error);
    }
}

export const updateMatch = async (tournamentId, eventId, match) => {
    try {
        let response = await axios.put(`${BASE_URL}/tournament/${tournamentId}/events/${eventId}/match/${match.match ? match.match : "new"}`, {
            court: match.court ? match.court : null,
            team1: match.team1 ? match.team1 : null,
            team2: match.team2 ? match.team2 : null,
            score1: match.score1 ? match.score1 : null,
            score2: match.score2 ? match.score2 : null,
            score3: match.score3 ? match.score3 : null,
            score4: match.score4 ? match.score4 : null,
            score5: match.score5 ? match.score5 : null,
            score6: match.score6 ? match.score6 : null,
            scheduled_start_time: match.scheduled_time ? match.scheduled_time : null,
            note: match.note ? match.note : null,
            no_match: match.no_match ? match.no_match : null,
        }, {
            headers: getHeaders()
        });

        if (response.status !== 200) {
            alert("Failed to update match");
        } else {
            return response.data;
        }
    } catch (error) {
        alert(error);
    }
}

export const removeAllDraws = async (tournamentId, eventId) => {
    try {
        let response = await axios.delete(`${BASE_URL}/tournament/${tournamentId}/events/${eventId}/remove_draws`, {
            headers: getHeaders()
        });

        if (response.status !== 200) {
            alert("Failed to remove draws");
        } else {
            return response.data;
        }
    } catch (error) {
        alert(error);
    }
}

export const deleteMatch = async (tournamentId, eventId, matchId) => {
    try {
        let response = await axios.delete(`${BASE_URL}/tournament/${tournamentId}/events/${eventId}/match/${matchId}`, {
            headers: getHeaders()
        });

        if (response.status !== 200) {
            alert("Failed to delete match");
        } else {
            return response.data;
        }
    } catch (error) {
        alert(error);
    }
}