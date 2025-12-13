export function showmodel(content) {
    var containerm = document.getElementById('model-container');
    var model = document.createElement('div');
    model.className = 'model';
    model.innerHTML = content;

    containerm.innerHTML = '';
    containerm.appendChild(model);
    containerm.classList.add('active');

    containerm.addEventListener('click', function (e) {
        if (e.target === containerm) {
            hidemodel();
        }
    });
}

export function hidemodel() {
    var containerm = document.getElementById('model-container');
    containerm.classList.remove('active');
    containerm.innerHTML = '';
}

export function showToast(message, type) {
    if (!type) type = 'info';
    var toastcontainer = document.getElementById('toast-container');
    var toast = document.createElement('div');
    toast.className = 'toast ' + type;
    toast.textContent = message;

    toastcontainer.appendChild(toast);

    setTimeout(function () {
        toast.style.animation = 'toastSlideIn 0.3s ease-out reverse';
        setTimeout(function () {
            toast.remove();
        }, 300);
    }, 3000);
}

export function showConfirm(message, onConfirm) {
    var content =
        '<h2>Confirm Action</h2>' +
        '<p style="margin: 24px 0; color: var(--color-text-secondary);">' + message + '</p>' +
        '<div class="form-actions">' +
        '<button class="btn btn-ghost" id="confirmCancel">Cancel</button>' +
        '<button class="btn btn-danger" id="confirmOk">Confirm</button>' +
        '</div>';

    showmodel(content);

    document.getElementById('confirmCancel').addEventListener('click', hidemodel);
    document.getElementById('confirmOk').addEventListener('click', function () {
        hidemodel();
        onConfirm();
    });
}

export function formatthedate(dateString) {
    if (!dateString) return '';
    var date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function taskcrad(task, teamId, onUpdate) {
    var crad = document.createElement('div');
    crad.className = 'task-crad';
    crad.setAttribute('draggable', 'true');
    crad.dataset.taskId = task.id;
    crad.dataset.status = task.status;

    var priorityClass = '';
    if (task.priority === 'High') priorityClass = 'priority-high';
    else if (task.priority === 'Medium') priorityClass = 'priority-medium';
    else priorityClass = 'priority-low';

    var html = '<div class="task-crad-header">' +
        '<div class="task-crad-title">' + (task.title || 'Untitled Task') + '</div>' +
        '<button class="task-crad-menu">⋯</button>' +
        '</div>';

    if (task.description) {
        html += '<div class="task-crad-desc">' + task.description + '</div>';
    }

    html += '<div class="task-crad-footer">';

    if (task.priority) {
        html += '<span class="task-badge ' + priorityClass + '">' + task.priority + '</span>';
    }
    if (task.dueDate) {
        html += '<span class="task-badge due-date">📅 ' + formatthedate(task.dueDate) + '</span>';
    }
    if (task.assignedTo) {
        html += '<span class="task-assignee">👤 ' + task.assignedTo + '</span>';
    }

    html += '</div>';
    crad.innerHTML = html;

    crad.addEventListener('dragstart', function (e) {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', task.id);
        crad.classList.add('dragging');
    });

    crad.addEventListener('dragend', function () {
        crad.classList.remove('dragging');
    });

    crad.querySelector('.task-crad-menu').addEventListener('click', function (e) {
        e.stopPropagation();
        taskmenuuu(task, teamId, onUpdate);
    });

    return crad;
}

export function taskmenuuu(task, teamId, onUpdate) {
    var priorityHtml = '';
    if (task.priority) {
        priorityHtml = '<span class="task-badge priority-' + task.priority.toLowerCase() + '">' + task.priority + '</span>';
    }
    var statusHtml = '';
    if (task.status) {
        statusHtml = '<span class="task-badge">' + task.status + '</span>';
    }
    var dueHtml = '';
    if (task.dueDate) {
        dueHtml = '<span class="task-badge due-date">Due: ' + formatthedate(task.dueDate) + '</span>';
    }

    var content =
        '<h2>' + (task.title || 'Task') + '</h2>' +
        '<div class="model-section">' +
        '<p style="color: var(--color-text-secondary); margin-bottom: 16px;">' + (task.description || 'No description') + '</p>' +
        '<div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px;">' +
        priorityHtml +
        statusHtml +
        dueHtml +
        '</div>' +
        '</div>' +
        '<div class="model-section">' +
        '<label for="taskStatus">Change Status</label>' +
        '<select id="taskStatus" class="input">' +
        '<option value="Pending" ' + (task.status === 'Pending' ? 'selected' : '') + '>Pending</option>' +
        '<option value="In Progress" ' + (task.status === 'In Progress' ? 'selected' : '') + '>In Progress</option>' +
        '<option value="Completed" ' + (task.status === 'Completed' ? 'selected' : '') + '>Completed</option>' +
        '</select>' +
        '</div>' +
        '<div class="form-actions">' +
        '<button class="btn btn-danger" id="deleteTaskBtn">Delete</button>' +
        '<button class="btn btn-ghost" id="cancelTaskBtn">Cancel</button>' +
        '<button class="btn btn-primary" id="saveTaskBtn">Save Changes</button>' +
        '</div>';

    showmodel(content);

    document.getElementById('cancelTaskBtn').addEventListener('click', hidemodel);

    document.getElementById('saveTaskBtn').addEventListener('click', async function () {
        var newStatus = document.getElementById('taskStatus').value;
        if (newStatus !== task.status) {
            await onUpdate(task.id, { status: newStatus });
        }
        hidemodel();
    });

    document.getElementById('deleteTaskBtn').addEventListener('click', function () {
        hidemodel();
        showConfirm('Are you sure you want to delete this task?', function () {
            onUpdate(task.id, { _delete: true });
        });
    });
}

export function createKanbanBoard(tasks, teamId, onUpdate) {
    var board = document.createElement('div');
    board.className = 'kanban-board';

    var statuses = ['Pending', 'In Progress', 'Completed'];

    for (var i = 0; i < statuses.length; i++) {
        var status = statuses[i];
        var column = document.createElement('div');
        column.className = 'kanban-column';
        column.dataset.status = status;

        var tasksByStatus = [];
        for (var j = 0; j < tasks.length; j++) {
            if (tasks[j].status === status) {
                tasksByStatus.push(tasks[j]);
            }
        }

        column.innerHTML =
            '<div class="kanban-column-header">' +
            '<span class="kanban-column-title">' + status + '</span>' +
            '<span class="kanban-column-count">' + tasksByStatus.length + '</span>' +
            '</div>' +
            '<div class="kanban-column-body"></div>';

        var columnBody = column.querySelector('.kanban-column-body');

        for (var k = 0; k < tasksByStatus.length; k++) {
            var crad = taskcrad(tasksByStatus[k], teamId, onUpdate);
            columnBody.appendChild(crad);
        }

        columnBody.addEventListener('dragover', function (e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        });

        (function (currentStatus) {
            columnBody.addEventListener('drop', async function (e) {
                e.preventDefault();
                var taskId = e.dataTransfer.getData('text/plain');
                var draggingcrad = document.querySelector('[data-task-id="' + taskId + '"]');

                if (draggingcrad && draggingcrad.dataset.status !== currentStatus) {
                    await onUpdate(taskId, { status: currentStatus });
                }
            });
        })(status);

        board.appendChild(column);
    }

    return board;
}