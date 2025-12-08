export function showModal(content) {
    const modalContainer = document.getElementById('modal-container');
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = content;

    modalContainer.innerHTML = '';
    modalContainer.appendChild(modal);
    modalContainer.classList.add('active');

    modalContainer.addEventListener('click', (e) => {
        if (e.target === modalContainer) {
            hideModal();
        }
    });
}

export function hideModal() {
    const modalContainer = document.getElementById('modal-container');
    modalContainer.classList.remove('active');
    modalContainer.innerHTML = '';
}

export function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'toastSlideIn 0.3s ease-out reverse';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

export function showConfirm(message, onConfirm) {
    const content = `
        <h2>Confirm Action</h2>
        <p style="margin: 24px 0; color: var(--color-text-secondary);">${message}</p>
        <div class="form-actions">
            <button class="btn btn-ghost" id="confirmCancel">Cancel</button>
            <button class="btn btn-danger" id="confirmOk">Confirm</button>
        </div>
    `;

    showModal(content);

    document.getElementById('confirmCancel').addEventListener('click', hideModal);
    document.getElementById('confirmOk').addEventListener('click', () => {
        hideModal();
        onConfirm();
    });
}

export function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function createTaskCard(task, teamId, onUpdate) {
    const card = document.createElement('div');
    card.className = 'task-card';
    card.setAttribute('draggable', 'true');
    card.dataset.taskId = task.id;
    card.dataset.status = task.status;

    let priorityClass = '';
    if (task.priority === 'High') priorityClass = 'priority-high';
    else if (task.priority === 'Medium') priorityClass = 'priority-medium';
    else priorityClass = 'priority-low';

    card.innerHTML = `
        <div class="task-card-header">
            <div class="task-card-title">${task.title || 'Untitled Task'}</div>
            <button class="task-card-menu">⋯</button>
        </div>
        ${task.description ? `<div class="task-card-desc">${task.description}</div>` : ''}
        <div class="task-card-footer">
            ${task.priority ? `<span class="task-badge ${priorityClass}">${task.priority}</span>` : ''}
            ${task.dueDate ? `<span class="task-badge due-date">📅 ${formatDate(task.dueDate)}</span>` : ''}
            ${task.assignedTo ? `<span class="task-assignee">👤 ${task.assignedTo}</span>` : ''}
        </div>
    `;

    card.addEventListener('dragstart', (e) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', task.id);
        card.classList.add('dragging');
    });

    card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
    });

    card.querySelector('.task-card-menu').addEventListener('click', (e) => {
        e.stopPropagation();
        showTaskMenu(task, teamId, onUpdate);
    });

    return card;
}

export function showTaskMenu(task, teamId, onUpdate) {
    const content = `
        <h2>${task.title || 'Task'}</h2>
        <div class="modal-section">
            <p style="color: var(--color-text-secondary); margin-bottom: 16px;">${task.description || 'No description'}</p>
            <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px;">
                ${task.priority ? `<span class="task-badge priority-${task.priority.toLowerCase()}">${task.priority}</span>` : ''}
                ${task.status ? `<span class="task-badge">${task.status}</span>` : ''}
                ${task.dueDate ? `<span class="task-badge due-date">Due: ${formatDate(task.dueDate)}</span>` : ''}
            </div>
        </div>
        <div class="modal-section">
            <label for="taskStatus">Change Status</label>
            <select id="taskStatus" class="input">
                <option value="Pending" ${task.status === 'Pending' ? 'selected' : ''}>Pending</option>
                <option value="In Progress" ${task.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                <option value="Completed" ${task.status === 'Completed' ? 'selected' : ''}>Completed</option>
            </select>
        </div>
        <div class="form-actions">
            <button class="btn btn-danger" id="deleteTaskBtn">Delete</button>
            <button class="btn btn-ghost" id="cancelTaskBtn">Cancel</button>
            <button class="btn btn-primary" id="saveTaskBtn">Save Changes</button>
        </div>
    `;

    showModal(content);

    document.getElementById('cancelTaskBtn').addEventListener('click', hideModal);

    document.getElementById('saveTaskBtn').addEventListener('click', async () => {
        const newStatus = document.getElementById('taskStatus').value;
        if (newStatus !== task.status) {
            await onUpdate(task.id, { status: newStatus });
        }
        hideModal();
    });

    document.getElementById('deleteTaskBtn').addEventListener('click', () => {
        hideModal();
        showConfirm('Are you sure you want to delete this task?', () => {
            onUpdate(task.id, { _delete: true });
        });
    });
}

export function createKanbanBoard(tasks, teamId, onUpdate) {
    const board = document.createElement('div');
    board.className = 'kanban-board';

    const statuses = ['Pending', 'In Progress', 'Completed'];

    statuses.forEach(status => {
        const column = document.createElement('div');
        column.className = 'kanban-column';
        column.dataset.status = status;

        const tasksByStatus = tasks.filter(t => t.status === status);

        column.innerHTML = `
            <div class="kanban-column-header">
                <span class="kanban-column-title">${status}</span>
                <span class="kanban-column-count">${tasksByStatus.length}</span>
            </div>
            <div class="kanban-column-body"></div>
        `;

        const columnBody = column.querySelector('.kanban-column-body');

        tasksByStatus.forEach(task => {
            const card = createTaskCard(task, teamId, onUpdate);
            columnBody.appendChild(card);
        });

        columnBody.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        });

        columnBody.addEventListener('drop', async (e) => {
            e.preventDefault();
            const taskId = e.dataTransfer.getData('text/plain');
            const draggingCard = document.querySelector(`[data-task-id="${taskId}"]`);

            if (draggingCard && draggingCard.dataset.status !== status) {
                await onUpdate(taskId, { status });
            }
        });

        board.appendChild(column);
    });

    return board;
}