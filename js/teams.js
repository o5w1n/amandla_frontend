
import { getMyTeams, leaveTeam } from './api.js';
import { logout, checkAuth } from './auth.js';
import { showConfirm, showToast } from './ui.js';

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


async function loadTeams() {
    const container = document.getElementById('teamsContainer');

    try {
        const teams = await getMyTeams();

        if (teams.length === 0) {
            container.innerHTML = '<div class="empty-state">You haven\'t joined any teams yet. Create or join a team to get started!</div>';
            return;
        }

        container.innerHTML = '';

        teams.forEach(team => {
            const teamCard = document.createElement('div');
            teamCard.className = 'team-card';

            const memberCount = team.members?.length || 0;
            const taskCount = team.tasks?.length || 0;

            teamCard.innerHTML = `
                <div class="team-card-header">
                    <h3>${team.name || team.teamname}</h3>
                </div>
                <div class="team-card-meta">
                    <div class="team-card-stat">
                        <div class="team-card-stat-label">Members</div>
                        <div class="team-card-stat-value">${memberCount}</div>
                    </div>
                    <div class="team-card-stat">
                        <div class="team-card-stat-label">Tasks</div>
                        <div class="team-card-stat-value">${taskCount}</div>
                    </div>
                </div>
                <div class="team-card-actions">
                    <button class="btn btn-primary btn-sm open-team-btn">Open</button>
                    <button class="btn btn-ghost btn-sm leave-team-btn">Leave</button>
                </div>
            `;

            teamCard.querySelector('.open-team-btn').addEventListener('click', () => {
                window.location.href = `team-detail.html?id=${team.id}`;
            });

            teamCard.querySelector('.leave-team-btn').addEventListener('click', () => {
                showConfirm(`Are you sure you want to leave "${team.name || team.teamname}"?`, async () => {
                    try {
                        await leaveTeam(team.id);
                        showToast('Successfully left team', 'success');
                        loadTeams();
                    } catch (error) {
                        showToast(error.message || 'Failed to leave team', 'error');
                    }
                });
            });

            container.appendChild(teamCard);
        });

    } catch (error) {
        console.error('Error loading teams:', error);
        container.innerHTML = '<div class="empty-state">Failed to load teams. Please try again.</div>';
        showToast(error.message || 'Failed to load teams', 'error');
    }
}

loadTeams();