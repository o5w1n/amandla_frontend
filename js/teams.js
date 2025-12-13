
import { getMyTeams, leaveTeam } from './api.js';
import { logout, checkAuth } from './auth.js';
import { showConfirm, showToast } from './ui.js';

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


async function loadTeams() {
    var container = document.getElementById('teamsContainer');

    try {
        var data = await getMyTeams();
        var teams = [];
        if (data.teams) {
            teams = data.teams;
        }

        if (teams.length === 0) {
            container.innerHTML = '<div class="empty-state">You haven\'t joined any teams yet. Create or join a team to get started!</div>';
            return;
        }

        container.innerHTML = '';

        for (var i = 0; i < teams.length; i++) {
            (function (index) {
                var team = teams[index];
                var teamCard = document.createElement('div');
                teamCard.className = 'team-card';

                var memberCount = 0;
                if (team.members) {
                    memberCount = team.members.length;
                }
                var taskCount = 0;
                if (team.tasks) {
                    taskCount = team.tasks.length;
                }

                var teamName = team.name;
                if (!teamName) teamName = team.teamname;

                var html = '<div class="team-card-header">' +
                    '<h3>' + teamName + '</h3>' +
                    '</div>' +
                    '<div class="team-card-meta">' +
                    '<div class="team-card-stat">' +
                    '<div class="team-card-stat-label">Members</div>' +
                    '<div class="team-card-stat-value">' + memberCount + '</div>' +
                    '</div>' +
                    '<div class="team-card-stat">' +
                    '<div class="team-card-stat-label">Tasks</div>' +
                    '<div class="team-card-stat-value">' + taskCount + '</div>' +
                    '</div>' +
                    '</div>' +
                    '<div class="team-card-actions">' +
                    '<button class="btn btn-primary btn-sm open-team-btn">Open</button>' +
                    '<button class="btn btn-ghost btn-sm leave-team-btn">Leave</button>' +
                    '</div>';

                teamCard.innerHTML = html;

                teamCard.querySelector('.open-team-btn').addEventListener('click', function () {
                    window.location.href = 'team-detail.html?id=' + team.id;
                });

                teamCard.querySelector('.leave-team-btn').addEventListener('click', function () {
                    var n = team.name;
                    if (!n) n = team.teamname;
                    showConfirm('Are you sure you want to leave "' + n + '"?', async function () {
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
            })(i);
        }

    } catch (error) {
        console.error('Error loading teams:', error);
        container.innerHTML = '<div class="empty-state">Failed to load teams. Please try again.</div>';
        showToast(error.message || 'Failed to load teams', 'error');
    }
}

loadTeams();