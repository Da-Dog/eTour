import axios from 'axios';
import Cookies from "js-cookie";

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
