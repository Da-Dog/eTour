import axios from 'axios';
import Cookies from "js-cookie";
import dashboard from "./tournament-manager/dashboard.jsx";

export const login = async (email, password) => {
    const response = await axios.post('http://127.0.0.1:8000/token/pair', {
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
        const response = await axios.post('http://127.0.0.1:8000/token/refresh', {
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
        let response = await axios.get('http://127.0.0.1:8000/tournament', {
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
    let token = Cookies.get('token');
    try {
        let response = await axios.post('http://127.0.0.1:8000/tournament', {
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
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
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
    let token = Cookies.get('token');
    try {
        let response = await axios.delete(`http://127.0.0.1:8000/tournament/${id}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
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
    let token = Cookies.get('token');
    try {
        let response = await axios.get(`http://127.0.0.1:8000/tournament/${id}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
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
    let token = Cookies.get('token');
    try {
        let response = await axios.put(`http://127.0.0.1:8000/tournament/${id}`, {
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
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
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
    let token = Cookies.get('token');
    try {
        let response = await axios.get(`http://127.0.0.1:8000/tournament/${id}/dashboard`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
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
    let token = Cookies.get('token');
    try {
        let response = await axios.get(`http://127.0.0.1:8000/tournament/${id}/participants`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
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
    let token = Cookies.get('token');
    try {
        let response = await axios.post(`http://127.0.0.1:8000/tournament/${id}/participants`, {
            "first_name": player.first_name,
            "middle_name": player.middle_name ? player.middle_name : null,
            "last_name": player.last_name,
            "email": player.email ? player.email : null,
            "phone": player.phone ? player.phone : null,
            "date_of_birth": player.date_of_birth ? player.date_of_birth : null,
            "gender": player.gender,
            "notes": player.notes ? player.notes : null,
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
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
    let token = Cookies.get('token');
    try {
        let response = await axios.get(`http://127.0.0.1:8000/tournament/${tournamentId}/participants/${playerId}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
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
    let token = Cookies.get('token');
    try {
        let response = await axios.put(`http://127.0.0.1:8000/tournament/${tournamentId}/participants/${playerId}`, {
            "first_name": player.first_name,
            "middle_name": player.middle_name ? player.middle_name : null,
            "last_name": player.last_name,
            "email": player.email ? player.email : null,
            "phone": player.phone ? player.phone : null,
            "date_of_birth": player.date_of_birth ? player.date_of_birth : null,
            "gender": player.gender,
            "notes": player.notes ? player.notes : null,
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (response.status !== 200) {
            alert("Failed to update player");
        }
    } catch (error) {
        alert(error);
    }
}

export const deletePlayer = async (tournamentId, playerId) => {
    let token = Cookies.get('token');
    try {
        let response = await axios.delete(`http://127.0.0.1:8000/tournament/${tournamentId}/participants/${playerId}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (response.status !== 200) {
            alert("Failed to delete player");
        }
    } catch (error) {
        alert(error);
    }
}

export const getPlayerEntries = async (tournamentId, participantId) => {
    let token = Cookies.get('token');
    try {
        let response = await axios.get(`http://127.0.0.1:8000/tournament/${tournamentId}/participants/${participantId}/entries`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
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
    let token = Cookies.get('token');
    try {
        let response = await axios.get(`http://127.0.0.1:8000/tournament/${tournamentId}/events`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
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
    let token = Cookies.get('token');
    try {
        let response = await axios.post(`http://127.0.0.1:8000/tournament/${tournamentId}/events`, {
            name: event.name,
            type: event.type,
            gender: event.gender,
            fee:  parseFloat(event.fee),
            max_entry: parseInt(event.max_entry),
            scoring_format: event.scoring_format,
            arrangement: event.arrangement,
            playoff: event.playoff,
            consolation: event.consolation,
            full_feed_last_round: event.full_feed_last_round ? event.full_feed_last_round : null
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            }
        });

        if (response.status !== 200) {
            alert("Failed to add event");
        } else {
            return response.data.id;
        }
    } catch (error) {
        alert(error);
    }
}