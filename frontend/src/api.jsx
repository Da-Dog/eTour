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
