var auttoking = null;

export async function checkbh() {
    try {
        var response = await fetch('https://amandla-backend.onrender.com/health');
        var data = await response.json();
        console.log('Sharrp the health check for the backend was sucessful', data);
        return data;
    } catch (err) {
        console.error('The was an error while checking the backend health bro:', err);
        throw err;
    }
}

export function setToken(token) {
    auttoking = token;
    if (token) {
        localStorage.setItem('amandla_token', token);
    } else {
        localStorage.removeItem('amandla_token');
    }
}

export function getToken() {
    if (!auttoking) {
        auttoking = localStorage.getItem('amandla_token');
    }
    return auttoking;
}

export async function apiFetch(url, options) {
    if (!options) {
        options = {};
    }

    var token = getToken();
    var headers = {
        'Content-Type': 'application/json'
    };

    if (options.headers) {
        headers = Object.assign({}, headers, options.headers);
    }

    if (token) {
        headers['Authorization'] = 'Bearer ' + token;
    }

    var config = Object.assign({}, options);
    config.headers = headers;

    var response = await fetch('https://amandla-backend.onrender.com' + url, config);

    if (!response.ok) {
        var error = await response.json().catch(function () { return { message: 'Request failed' }; });
        throw new Error(error.message || 'HTTP error! status: ' + response.status);
    }

    return response.json();
}

export async function register(username, email, password) {
    return apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username: username, email: email, password: password })
    });
}

export async function login(email, password) {
    var data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: email, password: password })
    });
    if (data.token) {
        setToken(data.token);
    }
    return data;
}

export async function createTeam(teamname, memberemail) {
    if (!memberemail) memberemail = [];
    return apiFetch('/auth/team/create', {
        method: 'POST',
        body: JSON.stringify({ teamname: teamname, memberemail: memberemail })
    });
}

export async function joinTeam(teamId) {
    return apiFetch('/auth/team/' + teamId + '/join', {
        method: 'POST'
    });
}

export async function leaveTeam(teamId) {
    return apiFetch('/auth/team/' + teamId + '/leave', {
        method: 'POST'
    });
}

export async function getMyTeams() {
    return apiFetch('/auth/team/myTeams');
}

export async function getPublicTeams() {
    return apiFetch('/auth/teams');
}

export async function getTeam(teamId) {
    return apiFetch('/auth/team/' + teamId);
}

export async function createTask(teamId, taskData) {
    return apiFetch('/auth/team/' + teamId + '/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData)
    });
}

export async function getTasks(teamId, filters) {
    if (!filters) filters = {};
    var query = new URLSearchParams(filters).toString();
    var url = '/auth/team/' + teamId + '/tasks';
    if (query) {
        url = url + '?' + query;
    }
    return apiFetch(url);
}

export async function getTask(teamId, taskId) {
    return apiFetch('/auth/team/' + teamId + '/tasks/' + taskId);
}

export async function updateTask(teamId, taskId, updates) {
    return apiFetch('/auth/team/' + teamId + '/tasks/' + taskId, {
        method: 'PUT',
        body: JSON.stringify(updates)
    });
}

export async function deleteTask(teamId, taskId) {
    return apiFetch('/auth/team/' + teamId + '/tasks/' + taskId, {
        method: 'DELETE'
    });
}

export async function assignTask(teamId, taskId, assignedTo) {
    return apiFetch('/auth/team/' + teamId + '/tasks/' + taskId + '/assign', {
        method: 'POST',
        body: JSON.stringify({ assignedTo: assignedTo })
    });
}

export async function getMyTasks() {
    return apiFetch('/auth/my-tasks');
}