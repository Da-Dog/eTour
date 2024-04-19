import Cookies from "js-cookie";

export const login = async (email, password) => {
    fetch('http://127.0.0.1:8000/token/pair', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({'username': email, 'password': password}),
    })
        .then(response => response.json())
        .then(data => {
            if (data.access) {
                Cookies.set('token', data.access);
                Cookies.set('refresh', data.refresh);
                Cookies.set('last_refresh', Date.now());
            } else {
                throw new Error(data.detail);
            }
        })
        .catch(error => {
            alert(error);
        });
}

export const refresh = async () => {
    const refreshToken = Cookies.get('refresh');

    if (!refreshToken) {
        return false;
    }
    let success = false;
    await fetch('http://127.0.0.1:8000/token/refresh', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({'refresh': refreshToken}),
    })
        .then(response => response.json())
        .then(data => {
            if (data.access) {
                Cookies.set('token', data.access);
                Cookies.set('last_refresh', Date.now());
                success = true;
            }
        })
    return success;
}

export const getTournamentList = async () => {
    let token = Cookies.get('token');
    let response = await fetch('http://127.0.0.1:8000/tournament', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Current-Time': Date.now(),
        },
    });

    if (!response.ok) {
        alert("Failed to fetch tournament list");
    } else {
        return await response.json();
    }
}

export const createTournament = async (name, description, startDate, endDate, address1, address2, city, state, zipCode, contactName, contactEmail, contactPhone) => {
    let token = Cookies.get('token');
    let response = await fetch('http://127.0.0.1:8000/tournament', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
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
        }),
    });

    if (!response.ok) {
        alert("Failed to create tournament");
        return false;
    } else {
        return await response.json();
    }
}

export const deleteTournament = async (id) => {
    let token = Cookies.get('token');
    let response = await fetch(`http://127.0.0.1:8000/tournament/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        alert("Failed to delete tournament");
    } else {
        alert("Tournament deleted successfully");
    }
}

export const getTournament = async (id) => {
    let token = Cookies.get('token');
    let response = await fetch(`http://127.0.0.1:8000/tournament/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        alert("Failed to fetch tournament");
    } else {
        return await response.json();
    }
}

export const editTournament = async (id, name, description, startDate, endDate, address1, address2, city, state, zipCode, contactName, contactEmail, contactPhone) => {
    let token = Cookies.get('token');
    let response = await fetch(`http://127.0.0.1:8000/tournament/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
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
        }),
    });

    if (!response.ok) {
        alert("Failed to update tournament");
        return false;
    } else {
        return await response.json();
    }
}
