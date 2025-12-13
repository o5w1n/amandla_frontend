
import { getMyTasks, updateTask, deleteTask } from './api.js';
import { logout, checkAuth } from './auth.js';
import { createKanbanBoard, showToast } from './ui.js';

if (!checkAuth()) {
    window.location.href = 'index.html';
}

document.getElementById('sidebarToggle').addEventListener('click', function () {
    document.getElementById('sidebar').classList.toggle('collapsed');
});

document.getElementById('logoutBtn').addEventListener('click', function () {
    logout();
    window.location.href = 'index.html';
});

var currentTasks = [];

async function loadMyTasks() {
    var container = document.getElementById('myTasksContainer');
    container.innerHTML = '<div class="skeleton-card"></div>';

    try {
        var data = await getMyTasks();
        var tasks = [];
        if (data.tasks) {
            tasks = data.tasks;
        }
        currentTasks = tasks;

        var totalTasks = tasks.length;
        var pendingTasks = 0;
        var inProgressTasks = 0;
        var completedTasks = 0;

        for (var i = 0; i < tasks.length; i++) {
            if (tasks[i].status === 'Pending') pendingTasks++;
            else if (tasks[i].status === 'In Progress') inProgressTasks++;
            else if (tasks[i].status === 'Completed') completedTasks++;
        }

        document.getElementById('totalTasksCount').textContent = totalTasks;
        document.getElementById('pendingTasksCount').textContent = pendingTasks;
        document.getElementById('inProgressTasksCount').textContent = inProgressTasks;
        document.getElementById('completedTasksCount').textContent = completedTasks;

        if (tasks.length === 0) {
            container.innerHTML = '<div class="empty-state">You don\'t have any assigned tasks yet.</div>';
            return;
        }

        container.innerHTML = '';
        var tasksByTeam = {};
        for (var j = 0; j < tasks.length; j++) {
            var t = tasks[j];
            var teamId = t.teamId;
            if (!teamId) teamId = t.team_id;
            if (!teamId) teamId = 'unknown';

            if (!tasksByTeam[teamId]) {
                tasksByTeam[teamId] = [];
            }
            tasksByTeam[teamId].push(t);
        }

        var kanban = createKanbanBoard(tasks, null, handleTaskUpdate);
        container.appendChild(kanban);

    } catch (error) {
        console.error('Error loading tasks:', error);
        container.innerHTML = '<div class="empty-state">Failed to load tasks. Please try again.</div>';
        showToast(error.message || 'Failed to load tasks', 'error');
    }
}

async function handleTaskUpdate(taskId, updates) {
    var task = null;
    for (var i = 0; i < currentTasks.length; i++) {
        if (currentTasks[i].id === taskId) {
            task = currentTasks[i];
            break;
        }
    }

    if (!task) {
        showToast('Task not found', 'error');
        return;
    }

    var teamId = task.teamId;
    if (!teamId) teamId = task.team_id;

    if (updates._delete) {
        try {
            await deleteTask(teamId, taskId);
            showToast('Task deleted successfully', 'success');
            await loadMyTasks();
        } catch (error) {
            showToast(error.message || 'Failed to delete task', 'error');
        }
    } else {
        try {
            await updateTask(teamId, taskId, updates);
            showToast('Task updated successfully', 'success');
            await loadMyTasks();
        } catch (error) {
            showToast(error.message || 'Failed to update task', 'error');
        }
    }
}

loadMyTasks();
