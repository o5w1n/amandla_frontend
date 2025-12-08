
import { getMyTasks, updateTask, deleteTask } from './api.js';
import { logout, checkAuth } from './auth.js';
import { createKanbanBoard, showToast } from './ui.js';

if (!checkAuth()) {
    window.location.href = 'index.html';
}


document.getElementById('sidebarToggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('collapsed');
});


document.getElementById('logoutBtn').addEventListener('click', () => {
    logout();
    window.location.href = 'index.html';
});

let currentTasks = [];

async function loadMyTasks() {
    const container = document.getElementById('myTasksContainer');
    container.innerHTML = '<div class="skeleton-card"></div>';

    try {
        const tasks = await getMyTasks();
        currentTasks = tasks;


        const totalTasks = tasks.length;
        const pendingTasks = tasks.filter(t => t.status === 'Pending').length;
        const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
        const completedTasks = tasks.filter(t => t.status === 'Completed').length;

        document.getElementById('totalTasksCount').textContent = totalTasks;
        document.getElementById('pendingTasksCount').textContent = pendingTasks;
        document.getElementById('inProgressTasksCount').textContent = inProgressTasks;
        document.getElementById('completedTasksCount').textContent = completedTasks;

        if (tasks.length === 0) {
            container.innerHTML = '<div class="empty-state">You don\'t have any assigned tasks yet.</div>';
            return;
        }

        container.innerHTML = '';


        const tasksByTeam = {};
        tasks.forEach(task => {
            const teamId = task.teamId || task.team_id || 'unknown';
            if (!tasksByTeam[teamId]) {
                tasksByTeam[teamId] = [];
            }
            tasksByTeam[teamId].push(task);
        });


        const kanban = createKanbanBoard(tasks, null, handleTaskUpdate);
        container.appendChild(kanban);

    } catch (error) {
        console.error('Error loading tasks:', error);
        container.innerHTML = '<div class="empty-state">Failed to load tasks. Please try again.</div>';
        showToast(error.message || 'Failed to load tasks', 'error');
    }
}

async function handleTaskUpdate(taskId, updates) {

    const task = currentTasks.find(t => t.id === taskId);
    if (!task) {
        showToast('Task not found', 'error');
        return;
    }

    const teamId = task.teamId || task.team_id;

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
