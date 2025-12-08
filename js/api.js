const api_url = 'http://localhost:3004';

let authToken = null;

export function setToken(token) {
    authToken = token;
    if (token) {
        localStorage.setItem('amandla_token', token);
    } else {
        localStorage.removeItem('amandla_token');
    }
}

export function getToken() {
    if (!authToken) {
        authToken = localStorage.getItem('amandla_token');
    }
    return authToken;
}

export async function apiFetch(url, options = {}) {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers,
    };

    const response = await fetch(`${api_url}${url}`, config);

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
}

export async function register(username, email, password) {
    return apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, email, password }),
    });
}

export async function login(email, password) {
    const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
    if (data.token) {
        setToken(data.token);
    }
    return data;
}

export async function createTeam(teamname, memberemail = []) {
    return apiFetch('/auth/team/create', {
        method: 'POST',
        body: JSON.stringify({ teamname, memberemail }),
    });
}

export async function joinTeam(teamId) {
    return apiFetch(`/auth/team/${teamId}/join`, {
        method: 'POST',
    });
}

export async function leaveTeam(teamId) {
    return apiFetch(`/auth/team/${teamId}/leave`, {
        method: 'POST',
    });
}

export async function getMyTeams() {
    return apiFetch('/auth/team/myTeams');
}

export async function getPublicTeams() {
    return apiFetch('/auth/teams');
}

export async function getTeam(teamId) {
    return apiFetch(`/auth/team/${teamId}`);
}

export async function createTask(teamId, taskData) {
    return apiFetch(`/auth/team/${teamId}/tasks`, {
        method: 'POST',
        body: JSON.stringify(taskData),
    });
}

export async function getTasks(teamId, filters = {}) {
    const query = new URLSearchParams(filters).toString();
    const url = `/auth/team/${teamId}/tasks${query ? `?${query}` : ''}`;
    return apiFetch(url);
}

export async function getTask(teamId, taskId) {
    return apiFetch(`/auth/team/${teamId}/tasks/${taskId}`);
}

export async function updateTask(teamId, taskId, updates) {
    return apiFetch(`/auth/team/${teamId}/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
    });
}

export async function deleteTask(teamId, taskId) {
    return apiFetch(`/auth/team/${teamId}/tasks/${taskId}`, {
        method: 'DELETE',
    });
}

export async function assignTask(teamId, taskId, assignedTo) {
    return apiFetch(`/auth/team/${teamId}/tasks/${taskId}/assign`, {
        method: 'POST',
        body: JSON.stringify({ assignedTo }),
    });
}

export async function getMyTasks() {
    return apiFetch('/auth/my-tasks');
}