import { login as apiLogin, register as apiRegister, setToken, getToken } from './api.js';

export async function login(email, password) {
    const data = await apiLogin(email, password);
    return data;
}

export async function register(username, email, password) {
    const data = await apiRegister(username, email, password);
    return data;
}

export function logout() {
    setToken(null);
    localStorage.clear();
}

export function checkAuth() {
    const token = getToken();
    return !!token;
}

export function requireAuth() {
    if (!checkAuth()) {
        window.location.href = 'index.html';
        return false;
    }
    return true;
}