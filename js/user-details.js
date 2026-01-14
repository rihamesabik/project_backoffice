// user-details.js - Gestion de la page des détails d'un participant

document.addEventListener('DOMContentLoaded', async function() {
    await loadUserDetails();
    initializePage();
});

function initializePage() {
    // Initialiser la sidebar
    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            const sidebar = document.getElementById('sidebar');
            sidebar.classList.toggle('collapsed');
        });
    }
    
    // Gérer les clics sur le menu
    document.querySelectorAll('.menu li').forEach(item => {
        item.addEventListener('click', function() {
            const page = this.getAttribute('data-page');
            window.location.href = `${page}.html`;
        });
    });
}

async function loadUserDetails() {
    const contentDiv = document.getElementById('userDetailsContent');
    if (!contentDiv) return;
    
    // Afficher le chargement
    contentDiv.innerHTML = `
        <div class="loading-state">
            <div class="spinner"></div>
            <p>Chargement des détails du participant...</p>
        </div>
    `;
    
    // Récupérer l'ID depuis l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const userId = parseInt(urlParams.get('id'));
    
    if (!userId) {
        showError('ID du participant non spécifié');
        return;
    }
    
    try {
        const response = await fetch('data/users.json');
        if (!response.ok) {
            throw new Error('Erreur de chargement des données');
        }
        const data = await response.json();
        const user = data.users.find(u => u.id === userId);
        
        if (!user) {
            showError('Participant non trouvé');
            return;
        }
        
        displayUserDetails(user);
    } catch (error) {
        console.error('Erreur:', error);
        showError('Impossible de charger les détails du participant');
    }
}

function displayUserDetails(user) {
    const contentDiv = document.getElementById('userDetailsContent');
    if (!contentDiv) return;
    
    // Styles CSS pour cette page
    const styles = `
        <style>
            .user-profile-header {
                background: white;
                border-radius: 10px;
                padding: 30px;
                margin-bottom: 25px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            }
            
            .profile-main {
                display: flex;
                align-items: center;
                gap: 30px;
                flex-wrap: wrap;
            }
            
            .avatar-large {
                width: 100px;
                height: 100px;
                background: linear-gradient(135deg, #4dabf7, #339af0);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 36px;
                font-weight: bold;
                color: white;
                flex-shrink: 0;
            }
            
            .profile-info {
                flex: 1;
                min-width: 300px;
            }
            
            .profile-info h1 {
                margin: 0 0 10px 0;
                color: #2c3e50;
                font-size: 28px;
            }
            
            .profile-email {
                color: #6c757d;
                margin-bottom: 15px;
                font-size: 16px;
            }
            
            .profile-badges {
                display: flex;
                gap: 10px;
                flex-wrap: wrap;
                margin-top: 10px;
            }
            
            .profile-actions {
                display: flex;
                gap: 15px;
                margin-top: 20px;
            }
            
            .user-stats {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
                gap: 20px;
                margin-bottom: 25px;
            }
            
            .user-tabs {
                background: white;
                border-radius: 10px;
                overflow: hidden;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            }
            
            .tabs {
                display: flex;
                background: #f8f9fa;
                border-bottom: 1px solid #dee2e6;
            }
            
            .tab-btn {
                padding: 15px 30px;
                background: none;
                border: none;
                cursor: pointer;
                font-weight: 500;
                color: #6c757d;
                border-bottom: 3px solid transparent;
                transition: all 0.3s ease;
                font-size: 15px;
            }
            
            .tab-btn:hover {
                background: #e9ecef;
                color: #495057;
            }
            
            .tab-btn.active {
                color: #4dabf7;
                border-bottom-color: #4dabf7;
                background: white;
            }
            
            .tab-content {
                padding: 25px;
                display: none;
            }
            
            .tab-content.active {
                display: block;
            }
            
            .achievements-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                gap: 20px;
            }
            
            .achievement-item {
                background: #f8f9fa;
                border-radius: 10px;
                padding: 20px;
                display: flex;
                align-items: center;
                gap: 15px;
                transition: all 0.3s ease;
                border: 1px solid transparent;
            }
            
            .achievement-item:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                border-color: #dee2e6;
            }
            
            .achievement-icon {
                width: 50px;
                height: 50px;
                background: linear-gradient(135deg, #4dabf7, #339af0);
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 24px;
                flex-shrink: 0;
            }
            
            .achievement-info h4 {
                margin: 0 0 5px 0;
                color: #2c3e50;
                font-size: 16px;
            }
            
            .achievement-info p {
                margin: 0;
                color: #6c757d;
                font-size: 14px;
            }
            
            .loading-state {
                text-align: center;
                padding: 60px;
                color: #6c757d;
            }
            
            .loading-state .spinner {
                width: 50px;
                height: 50px;
                border: 4px solid #f3f3f3;
                border-top: 4px solid #3498db;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 20px;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            .submission-status {
                display: inline-block;
                padding: 4px 10px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 600;
                text-transform: uppercase;
            }
            
            .status-accepted {
                background: #d3f9d8;
                color: #2b8a3e;
            }
            
            .status-rejected {
                background: #ffe3e3;
                color: #c92a2a;
            }
            
            .challenge-stats {
                display: flex;
                gap: 20px;
                margin-bottom: 25px;
                flex-wrap: wrap;
            }
            
            .stat-item {
                background: white;
                padding: 15px 20px;
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                flex: 1;
                min-width: 150px;
            }
            
            .stat-label {
                font-size: 13px;
                color: #6c757d;
                margin-bottom: 5px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .stat-value {
                font-size: 20px;
                font-weight: 700;
                color: #2c3e50;
            }
            
            .progress-bar {
                height: 8px;
                background: #e9ecef;
                border-radius: 4px;
                overflow: hidden;
                margin-top: 5px;
            }
            
            .progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #4dabf7, #339af0);
                border-radius: 4px;
            }
            
            .edit-section {
                margin-top: 25px;
                padding: 20px;
                background: #f8f9fa;
                border-radius: 8px;
                border-left: 4px solid #4dabf7;
            }
            
            .edit-section h4 {
                margin: 0 0 15px 0;
                color: #2c3e50;
            }
            
            .edit-actions {
                display: flex;
                gap: 10px;
                flex-wrap: wrap;
            }
            
            @media (max-width: 768px) {
                .profile-main {
                    flex-direction: column;
                    text-align: center;
                    gap: 20px;
                }
                
                .profile-info {
                    min-width: 100%;
                }
                
                .profile-actions {
                    flex-direction: column;
                    width: 100%;
                }
                
                .profile-actions .btn {
                    width: 100%;
                    justify-content: center;
                }
                
                .tabs {
                    flex-direction: column;
                }
                
                .tab-btn {
                    text-align: left;
                    border-bottom: none;
                    border-right: 3px solid transparent;
                }
                
                .tab-btn.active {
                    border-bottom: none;
                    border-right-color: #4dabf7;
                }
                
                .achievements-grid {
                    grid-template-columns: 1fr;
                }
                
                .challenge-stats {
                    flex-direction: column;
                }
                
                .edit-actions {
                    flex-direction: column;
                }
                
                .edit-actions .btn {
                    width: 100%;
                }
            }
            
            .empty-state {
                text-align: center;
                padding: 40px 20px;
                color: #6c757d;
            }
            
            .empty-state i {
                font-size: 48px;
                margin-bottom: 15px;
                opacity: 0.5;
            }
            
            .error-state {
                text-align: center;
                padding: 60px 20px;
            }
            
            .error-state i {
                font-size: 48px;
                color: #fa5252;
                margin-bottom: 20px;
            }
            
            .error-state h2 {
                color: #fa5252;
                margin-bottom: 15px;
            }
            
            .error-state p {
                color: #6c757d;
                margin-bottom: 25px;
                max-width: 500px;
                margin-left: auto;
                margin-right: auto;
            }
        </style>
    `;
    
    // Déterminer la classe CSS pour le badge de niveau
    let levelBadgeClass = '';
    switch(user.level) {
        case 'débutant': levelBadgeClass = 'badge badge-primary'; break;
        case 'intermédiaire': levelBadgeClass = 'badge badge-success'; break;
        case 'avancé': levelBadgeClass = 'badge badge-warning'; break;
        case 'expert': levelBadgeClass = 'badge badge-danger'; break;
        default: levelBadgeClass = 'badge badge-primary';
    }
    
    const statusBadgeClass = user.status === 'actif' ? 'badge badge-success' : 'badge badge-danger';
    const initials = getInitials(user.name);
    const joinDate = formatDate(user.joinDate);
    const lastActive = formatDate(user.lastActive);
    const successRate = user.successRate || 0;
    
    // Calculer les statistiques
    const completionRate = user.totalChallenges > 0 
        ? Math.round((user.completedChallenges / user.totalChallenges) * 100) 
        : 0;
    
    const averageScore = user.submissions && user.submissions.length > 0
        ? Math.round(user.submissions.reduce((sum, sub) => sum + sub.score, 0) / user.submissions.length)
        : 0;
    
    const html = styles + `
        <div class="user-profile-header">
            <div class="profile-main">
                <div class="profile-avatar">
                    <div class="avatar-large">${initials}</div>
                </div>
                <div class="profile-info">
                    <h1>${user.name}</h1>
                    <p class="profile-email">${user.email}</p>
                    <div class="profile-badges">
                        <span class="${levelBadgeClass}">${user.level}</span>
                        <span class="${statusBadgeClass}">${user.status === 'actif' ? 'Actif' : 'Inactif'}</span>
                        <span class="badge ${user.role === 'admin' ? 'badge-danger' : 'badge-primary'}">
                            ${user.role === 'admin' ? 'Administrateur' : 'Participant'}
                        </span>
                    </div>
                    
                    <div class="profile-actions">
                        <a href="users.html" class="btn btn-secondary">
                            <i class="fas fa-arrow-left"></i> Retour à la liste
                        </a>
                        <button class="btn btn-primary" onclick="editUser(${user.id})">
                            <i class="fas fa-edit"></i> Modifier le profil
                        </button>
                        <button class="btn btn-outline" onclick="sendMessage(${user.id})">
                            <i class="fas fa-envelope"></i> Envoyer un message
                        </button>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="challenge-stats">
            <div class="stat-item">
                <div class="stat-label">Points totaux</div>
                <div class="stat-value">${user.points}</div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${Math.min(user.points / 3000 * 100, 100)}%"></div>
                </div>
            </div>
            
            <div class="stat-item">
                <div class="stat-label">Taux de réussite</div>
                <div class="stat-value">${successRate}%</div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${successRate}%"></div>
                </div>
            </div>
            
            <div class="stat-item">
                <div class="stat-label">Challenges complétés</div>
                <div class="stat-value">${user.completedChallenges}/${user.totalChallenges}</div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${completionRate}%"></div>
                </div>
            </div>
            
            <div class="stat-item">
                <div class="stat-label">Score moyen</div>
                <div class="stat-value">${averageScore}</div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${averageScore}%"></div>
                </div>
            </div>
        </div>
        
        <div class="user-stats">
            <div class="stat-card">
                <div class="stat-icon">
                    <i class="fas fa-calendar-plus"></i>
                </div>
                <div class="stat-content">
                    <h3>${joinDate}</h3>
                    <p>Date d'inscription</p>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon">
                    <i class="fas fa-calendar-check"></i>
                </div>
                <div class="stat-content">
                    <h3>${lastActive}</h3>
                    <p>Dernière activité</p>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon">
                    <i class="fas fa-chart-line"></i>
                </div>
                <div class="stat-content">
                    <h3>${user.submissions ? user.submissions.length : 0}</h3>
                    <p>Soumissions totales</p>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon">
                    <i class="fas fa-medal"></i>
                </div>
                <div class="stat-content">
                    <h3>${user.achievements ? user.achievements.length : 0}</h3>
                    <p>Réussites débloquées</p>
                </div>
            </div>
        </div>
        
        <div class="user-tabs">
            <div class="tabs">
                <button class="tab-btn active" data-tab="bio">
                    <i class="fas fa-user"></i> Biographie
                </button>
                <button class="tab-btn" data-tab="submissions">
                    <i class="fas fa-list-check"></i> Soumissions
                </button>
                <button class="tab-btn" data-tab="achievements">
                    <i class="fas fa-trophy"></i> Réussites
                </button>
                <button class="tab-btn" data-tab="activity">
                    <i class="fas fa-chart-bar"></i> Activité
                </button>
            </div>
            
            <div class="tab-content active" id="tab-bio">
                <div class="card">
                    <h3>À propos</h3>
                    <p>${user.bio || 'Aucune biographie fournie.'}</p>
                    
                    <div class="edit-section">
                        <h4>Informations supplémentaires</h4>
                        <div class="edit-actions">
                            <button class="btn btn-sm btn-outline" onclick="editBio(${user.id})">
                                <i class="fas fa-edit"></i> Modifier la biographie
                            </button>
                            <button class="btn btn-sm btn-outline" onclick="updateLevel(${user.id})">
                                <i class="fas fa-signal"></i> Modifier le niveau
                            </button>
                            <button class="btn btn-sm btn-outline" onclick="adjustPoints(${user.id})">
                                <i class="fas fa-star"></i> Ajuster les points
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="tab-content" id="tab-submissions">
                <div class="card">
                    <div class="card-header">
                        <h3>Historique des soumissions</h3>
                        <div class="card-actions">
                            <span class="text-muted">${user.submissions ? user.submissions.length : 0} soumissions</span>
                            <button class="btn btn-sm btn-outline" onclick="viewAllSubmissions(${user.id})">
                                <i class="fas fa-external-link-alt"></i> Voir tout
                            </button>
                        </div>
                    </div>
                    
                    <div class="card-body">
                        ${user.submissions && user.submissions.length > 0 ? `
                            <div class="table-responsive">
                                <table class="table">
                                    <thead>
                                        <tr>
                                            <th>Challenge</th>
                                            <th>Score</th>
                                            <th>Date</th>
                                            <th>Statut</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${user.submissions.map((sub, index) => `
                                            <tr>
                                                <td>
                                                    <div class="user-cell">
                                                        <div class="user-avatar-small">C${index + 1}</div>
                                                        <div>${sub.challenge}</div>
                                                    </div>
                                                </td>
                                                <td><strong>${sub.score}</strong></td>
                                                <td>${formatDate(sub.date)}</td>
                                                <td>
                                                    <span class="submission-status ${sub.status === 'accepté' ? 'status-accepted' : 'status-rejected'}">
                                                        ${sub.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button class="btn-action btn-view" onclick="viewSubmission(${user.id}, ${index})" title="Voir détails">
                                                        <i class="fas fa-eye"></i>
                                                    </button>
                                                    <button class="btn-action btn-edit" onclick="reevaluateSubmission(${user.id}, ${index})" title="Réévaluer">
                                                        <i class="fas fa-redo"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        ` : `
                            <div class="empty-state">
                                <i class="fas fa-inbox"></i>
                                <h3>Aucune soumission</h3>
                                <p>Ce participant n'a encore soumis aucun challenge.</p>
                            </div>
                        `}
                    </div>
                </div>
            </div>
            
            <div class="tab-content" id="tab-achievements">
                <div class="card">
                    <div class="card-header">
                        <h3>Réussites débloquées</h3>
                        <div class="card-actions">
                            <span class="text-muted">${user.achievements ? user.achievements.length : 0} réussites</span>
                        </div>
                    </div>
                    
                    <div class="card-body">
                        ${user.achievements && user.achievements.length > 0 ? `
                            <div class="achievements-grid">
                                ${user.achievements.map(achievement => `
                                    <div class="achievement-item">
                                        <div class="achievement-icon">
                                            <i class="${achievement.icon}"></i>
                                        </div>
                                        <div class="achievement-info">
                                            <h4>${achievement.name}</h4>
                                            <p>${formatDate(achievement.date)}</p>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        ` : `
                            <div class="empty-state">
                                <i class="fas fa-trophy"></i>
                                <h3>Aucune réussite</h3>
                                <p>Ce participant n'a pas encore débloqué de réussite.</p>
                            </div>
                        `}
                        
                        <div class="edit-section" style="margin-top: 30px;">
                            <h4>Gestion des réussites</h4>
                            <div class="edit-actions">
                                <button class="btn btn-sm btn-primary" onclick="addAchievement(${user.id})">
                                    <i class="fas fa-plus"></i> Ajouter une réussite
                                </button>
                                <button class="btn btn-sm btn-outline" onclick="viewAllAchievements(${user.id})">
                                    <i class="fas fa-list"></i> Voir toutes les réussites
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="tab-content" id="tab-activity">
                <div class="card">
                    <h3>Activité récente</h3>
                    <div class="activity-timeline">
                        ${generateActivityTimeline(user)}
                    </div>
                    
                    <div class="edit-section" style="margin-top: 20px;">
                        <h4>Statistiques détaillées</h4>
                        <div class="stats-grid" style="grid-template-columns: repeat(2, 1fr);">
                            <div class="stat-item">
                                <div class="stat-label">Temps moyen par challenge</div>
                                <div class="stat-value">${calculateAverageTime(user)} min</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-label">Meilleur score</div>
                                <div class="stat-value">${getBestScore(user)}</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-label">Challenges préférés</div>
                                <div class="stat-value">${getFavoriteCategory(user)}</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-label">Consécutives réussites</div>
                                <div class="stat-value">${getStreak(user)}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    contentDiv.innerHTML = html;
    
    // Initialiser les onglets
    initializeTabs();
    
    // Initialiser les événements des boutons
    initializeButtons();
}

function generateActivityTimeline(user) {
    const activities = [];
    
    // Ajouter les soumissions comme activités
    if (user.submissions && user.submissions.length > 0) {
        user.submissions.slice(0, 5).forEach(sub => {
            activities.push({
                type: 'submission',
                date: sub.date,
                title: `A soumis "${sub.challenge}"`,
                description: `Score: ${sub.score}, Statut: ${sub.status}`,
                icon: 'fas fa-paper-plane',
                color: sub.status === 'accepté' ? '#40c057' : '#fa5252'
            });
        });
    }
    
    // Ajouter les réussites comme activités
    if (user.achievements && user.achievements.length > 0) {
        user.achievements.slice(0, 3).forEach(achievement => {
            activities.push({
                type: 'achievement',
                date: achievement.date,
                title: `A débloqué "${achievement.name}"`,
                description: 'Nouvelle réussite obtenue',
                icon: 'fas fa-trophy',
                color: '#ffd43b'
            });
        });
    }
    
    // Ajouter l'inscription comme activité
    activities.push({
        type: 'join',
        date: user.joinDate,
        title: 'A rejoint la plateforme',
        description: 'Nouveau participant',
        icon: 'fas fa-user-plus',
        color: '#4dabf7'
    });
    
    // Ajouter la dernière activité
    if (user.lastActive) {
        activities.push({
            type: 'activity',
            date: user.lastActive,
            title: 'Dernière connexion',
            description: 'Connecté à la plateforme',
            icon: 'fas fa-sign-in-alt',
            color: '#20c997'
        });
    }
    
    // Trier par date (plus récent d'abord)
    activities.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (activities.length === 0) {
        return '<div class="empty-state"><p>Aucune activité récente</p></div>';
    }
    
    // Générer le HTML de la timeline
    return `
        <style>
            .timeline {
                position: relative;
                padding-left: 30px;
                margin-top: 20px;
            }
            
            .timeline::before {
                content: '';
                position: absolute;
                left: 10px;
                top: 0;
                bottom: 0;
                width: 2px;
                background: #e9ecef;
            }
            
            .timeline-item {
                position: relative;
                margin-bottom: 25px;
            }
            
            .timeline-item:last-child {
                margin-bottom: 0;
            }
            
            .timeline-item::before {
                content: '';
                position: absolute;
                left: -30px;
                top: 0;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background: white;
                border: 3px solid #4dabf7;
                z-index: 1;
            }
            
            .timeline-content {
                background: white;
                padding: 15px;
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                border-left: 4px solid #4dabf7;
            }
            
            .timeline-header {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 8px;
            }
            
            .timeline-icon {
                width: 32px;
                height: 32px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 16px;
            }
            
            .timeline-title {
                font-weight: 600;
                color: #2c3e50;
                flex: 1;
            }
            
            .timeline-date {
                font-size: 12px;
                color: #6c757d;
                white-space: nowrap;
            }
            
            .timeline-description {
                color: #6c757d;
                font-size: 14px;
                margin-top: 5px;
            }
        </style>
        
        <div class="timeline">
            ${activities.map((activity, index) => `
                <div class="timeline-item">
                    <div class="timeline-content">
                        <div class="timeline-header">
                            <div class="timeline-icon" style="background: ${activity.color};">
                                <i class="${activity.icon}"></i>
                            </div>
                            <div class="timeline-title">${activity.title}</div>
                            <div class="timeline-date">${formatDate(activity.date)}</div>
                        </div>
                        <div class="timeline-description">${activity.description}</div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function calculateAverageTime(user) {
    // Simuler un temps moyen (dans la réalité, cela viendrait des données)
    return Math.floor(Math.random() * 60) + 30; // Entre 30 et 90 minutes
}

function getBestScore(user) {
    if (!user.submissions || user.submissions.length === 0) return 'N/A';
    return Math.max(...user.submissions.map(s => s.score));
}

function getFavoriteCategory(user) {
    // Simuler une catégorie favorite
    const categories = ['Algorithmes', 'Structures de données', 'Mathématiques', 'IA'];
    return categories[Math.floor(Math.random() * categories.length)];
}

function getStreak(user) {
    // Simuler une série de réussites
    return Math.floor(Math.random() * 10) + 1;
}

function initializeTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Désactiver tous les onglets
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            // Activer l'onglet sélectionné
            this.classList.add('active');
            const tabContent = document.getElementById(`tab-${tabId}`);
            if (tabContent) {
                tabContent.classList.add('active');
            }
        });
    });
}

function initializeButtons() {
    // Ajouter des écouteurs d'événements pour les boutons spécifiques
    document.querySelectorAll('[onclick^="editUser"]').forEach(btn => {
        btn.onclick = function() {
            const userId = this.getAttribute('onclick').match(/\d+/)[0];
            window.location.href = `users.html?edit=${userId}`;
        };
    });
}

function editUser(userId) {
    window.location.href = `users.html?edit=${userId}`;
}

function editBio(userId) {
    const newBio = prompt('Modifier la biographie:', '');
    if (newBio !== null) {
        showNotification('Biographie mise à jour', 'success');
        // Dans un cas réel, on enverrait la mise à jour au serveur
        setTimeout(() => location.reload(), 1000);
    }
}

function updateLevel(userId) {
    const levels = ['débutant', 'intermédiaire', 'avancé', 'expert'];
    const newLevel = prompt('Nouveau niveau (débutant, intermédiaire, avancé, expert):', '');
    if (newLevel && levels.includes(newLevel.toLowerCase())) {
        showNotification(`Niveau mis à jour: ${newLevel}`, 'success');
        // Dans un cas réel, on enverrait la mise à jour au serveur
        setTimeout(() => location.reload(), 1000);
    } else if (newLevel) {
        alert('Niveau invalide. Veuillez choisir parmi: débutant, intermédiaire, avancé, expert');
    }
}

function adjustPoints(userId) {
    const points = prompt('Ajuster les points (utiliser + ou - devant le nombre):', '+100');
    if (points) {
        showNotification(`Points ajustés: ${points}`, 'success');
        // Dans un cas réel, on enverrait la mise à jour au serveur
        setTimeout(() => location.reload(), 1000);
    }
}

function sendMessage(userId) {
    const message = prompt('Votre message à envoyer:', '');
    if (message) {
        showNotification('Message envoyé', 'success');
    }
}

function viewSubmission(userId, submissionIndex) {
    alert(`Voir les détails de la soumission ${submissionIndex + 1}`);
    // Dans un cas réel, on redirigerait vers la page de détail de la soumission
}

function reevaluateSubmission(userId, submissionIndex) {
    if (confirm('Réévaluer cette soumission ?')) {
        showNotification('Soumission en cours de réévaluation...', 'info');
        // Dans un cas réel, on enverrait la requête au serveur
    }
}

function addAchievement(userId) {
    const achievementName = prompt('Nom de la nouvelle réussite:', '');
    if (achievementName) {
        showNotification(`Réussite "${achievementName}" ajoutée`, 'success');
        // Dans un cas réel, on enverrait la requête au serveur
    }
}

function viewAllSubmissions(userId) {
    alert('Voir toutes les soumissions');
    // Dans un cas réel, on redirigerait vers la page des soumissions filtrées par utilisateur
}

function viewAllAchievements(userId) {
    alert('Voir toutes les réussites');
    // Dans un cas réel, on redirigerait vers la page des réussites
}

function showError(message) {
    const contentDiv = document.getElementById('userDetailsContent');
    if (!contentDiv) return;
    
    contentDiv.innerHTML = `
        <div class="error-state">
            <i class="fas fa-exclamation-triangle"></i>
            <h2>Erreur</h2>
            <p>${message}</p>
            <a href="users.html" class="btn btn-primary">
                <i class="fas fa-arrow-left"></i> Retour à la liste
            </a>
        </div>
    `;
}

// Fonctions utilitaires
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 3);
}

function logout() {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
        window.location.href = 'index.html';
    }
}

// Exposer les fonctions globales
window.editUser = editUser;
window.editBio = editBio;
window.updateLevel = updateLevel;
window.adjustPoints = adjustPoints;
window.sendMessage = sendMessage;
window.viewSubmission = viewSubmission;
window.reevaluateSubmission = reevaluateSubmission;
window.addAchievement = addAchievement;
window.viewAllSubmissions = viewAllSubmissions;
window.viewAllAchievements = viewAllAchievements;
window.logout = logout;