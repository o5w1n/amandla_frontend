import { getTeam, getTasks, createTask, updateTask, deleteTask } from './api.js';
import { logout, checkAuth } from './auth.js';
import { showModal, hideModal, showToast, createKanbanBoard } from './ui.js';

if (!checkAuth()) {
    window.location.href = 'index.html';
}

const urlParams = new URLSearchParams(window.location.search);
const teamId = urlParams.get('id');

if (!teamId) {
    showToast('No team ID provided', 'error');
    setTimeout(() => window.location.href = 'teams.html', 2000);
}

document.getElementById('sidebarToggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('collapsed');
});

document.getElementById('logoutBtn').addEventListener('click', () => {
    logout();
    window.location.href = 'index.html';
});

async function loadTeamDetails() {
    try {
        const data = await getTeam(teamId);
        const team = data.team || {};
        const members = data.members || [];

        document.getElementById('teamName').textContent = team.name || team.teamname || 'Team';
        document.getElementById('teamId').textContent = team.id;

        const memberCount = members.length || 0;
        document.getElementById('memberCount').textContent = memberCount;

        await loadTasks();

    } catch (error) {
        console.error('Error loading team:', error);
        showToast(error.message || 'Failed to load team details', 'error');
    }
}

let currentTasks = [];

async function loadTasks() {
    const container = document.getElementById('tasksContainer');
    container.innerHTML = '<div class="skeleton-card"></div>';

    try {
        const data = await getTasks(teamId);
        const tasks = data.task || [];
        currentTasks = tasks;

        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(t => t.status === 'Completed').length;

        document.getElementById('taskCount').textContent = totalTasks;
        document.getElementById('completedCount').textContent = completedTasks;

        if (tasks.length === 0) {
            container.innerHTML = '<div class="empty-state">No tasks yet. Create your first task to get started!</div>';
            return;
        }

        container.innerHTML = '';
        const kanban = createKanbanBoard(tasks, teamId, handleTaskUpdate);
        container.appendChild(kanban);

    } catch (error) {
        console.error('Error loading tasks:', error);
        container.innerHTML = '<div class="empty-state">Failed to load tasks. Please try again.</div>';
        showToast(error.message || 'Failed to load tasks', 'error');
    }
}

async function handleTaskUpdate(taskId, updates) {
    if (updates._delete) {
        try {
            await deleteTask(teamId, taskId);
            showToast('Task deleted successfully', 'success');
            await loadTasks();
        } catch (error) {
            showToast(error.message || 'Failed to delete task', 'error');
        }
    } else {
        try {
            await updateTask(teamId, taskId, updates);
            showToast('Task updated successfully', 'success');
            await loadTasks();
        } catch (error) {
            showToast(error.message || 'Failed to update task', 'error');
        }
    }
}

document.getElementById('createTaskBtn').addEventListener('click', () => {
    const modalContent = `
        <h2>Create New Task</h2>
        <form id="createTaskForm">
            <div class="form-group">
                <label for="taskTitle">Title</label>
                <input type="text" id="taskTitle" class="input" placeholder="Enter task title" required>
            </div>
            <div class="form-group">
                <label for="taskDesc">Description</label>
                <textarea id="taskDesc" class="input" placeholder="Enter task description"></textarea>
            </div>
            <div class="form-group">
                <label for="taskPriority">Priority</label>
                <select id="taskPriority" class="input">
                    <option value="Low">Low</option>
                    <option value="Medium" selected>Medium</option>
                    <option value="High">High</option>
                </select>
            </div>
            <div class="form-group">
                <label for="taskDueDate">Due Date</label>
                <input type="date" id="taskDueDate" class="input">
            </div>
            <div class="form-group">
                <label for="taskAssignee">Assigned To (User ID - Optional)</label>
                <input type="text" id="taskAssignee" class="input" placeholder="Enter user ID">
            </div>
            <div class="form-error" id="createTaskError"></div>
            <div class="form-actions">
                <button type="button" class="btn btn-ghost" id="cancelCreateTask">Cancel</button>
                <button type="submit" class="btn btn-primary">Create Task</button>
            </div>
        </form>
    `;

    showModal(modalContent);

    document.getElementById('cancelCreateTask').addEventListener('click', hideModal);

    document.getElementById('createTaskForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const errorDiv = document.getElementById('createTaskError');
        errorDiv.textContent = '';

        const taskData = {
            title: document.getElementById('taskTitle').value,
            description: document.getElementById('taskDesc').value,
            priority: document.getElementById('taskPriority').value,
            dueDate: document.getElementById('taskDueDate').value || undefined,
            assignedTo: document.getElementById('taskAssignee').value || undefined,
        };

        try {
            await createTask(teamId, taskData);
            showToast('Task created successfully!', 'success');
            hideModal();
            await loadTasks();
        } catch (error) {
            errorDiv.textContent = error.message || 'Failed to create task';
            showToast(error.message || 'Failed to create task', 'error');
        }
    });
});

loadTeamDetails();
