// rankings.js - Gestion du classement
let participants = [];
let filteredParticipants = [];
let currentView = 'table'; // 'table' ou 'chart'

// Initialisation
document.addEventListener('DOMContentLoaded', async function() {
    await loadData();
    setupEventListeners();
    initializePage();
    updateRankings();
    initializeCharts();
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

function setupEventListeners() {
    // Initialiser les sélecteurs de mois
    initializeMonthSelector();
}

async function loadData() {
    try {
        // Charger les participants depuis users.json
        const usersResponse = await fetch('data/users.json');
        if (!usersResponse.ok) throw new Error('Erreur de chargement des participants');
        const usersData = await usersResponse.json();
        
        // Charger les soumissions pour les statistiques
        const submissionsResponse = await fetch('data/submissions.json');
        if (!submissionsResponse.ok) throw new Error('Erreur de chargement des soumissions');
        const submissionsData = await submissionsResponse.json();
        
        // Préparer les données des participants avec statistiques
        participants = usersData.users.map(user => {
            // Filtrer les soumissions de ce participant
            const userSubmissions = submissionsData.submissions?.filter(
                sub => sub.userId === user.id
            ) || [];
            
            // Calculer les statistiques
            const successfulSubmissions = userSubmissions.filter(
                sub => sub.status === 'accepté'
            ).length;
            
            const totalSubmissions = userSubmissions.length;
            const successRate = totalSubmissions > 0 
                ? Math.round((successfulSubmissions / totalSubmissions) * 100) 
                : 0;
            
            // Points des derniers mois (pour l'évolution)
            const monthlyPoints = calculateMonthlyPoints(userSubmissions);
            const currentMonthPoints = getCurrentMonthPoints(monthlyPoints);
            const lastMonthPoints = getLastMonthPoints(monthlyPoints);
            const progression = lastMonthPoints > 0 
                ? Math.round(((currentMonthPoints - lastMonthPoints) / lastMonthPoints) * 100) 
                : currentMonthPoints > 0 ? 100 : 0;
            
            // Catégories préférées
            const favoriteCategory = getFavoriteCategory(userSubmissions);
            
            return {
                id: user.id,
                name: user.name,
                email: user.email,
                level: user.level,
                points: user.points || 0,
                totalPoints: user.points || 0,
                monthlyPoints: currentMonthPoints,
                progression: progression,
                totalChallenges: user.totalChallenges || 0,
                completedChallenges: user.completedChallenges || 0,
                successRate: successRate,
                submissions: userSubmissions,
                joinDate: user.joinDate,
                lastActive: user.lastActive,
                status: user.status,
                bio: user.bio,
                achievements: user.achievements || [],
                monthlyPointsHistory: monthlyPoints,
                favoriteCategory: favoriteCategory
            };
        });
        
        // Trier par points totaux (classement global initial)
        participants.sort((a, b) => b.points - a.points);
        filteredParticipants = [...participants];
        
    } catch (error) {
        console.error('Erreur:', error);
        showError('Impossible de charger les données');
        participants = getFallbackParticipants();
        filteredParticipants = [...participants];
    }
}

function getFallbackParticipants() {
    return [
        {
            id: 1,
            name: "Sophie Martin",
            level: "expert",
            points: 2458,
            monthlyPoints: 320,
            progression: 15,
            totalChallenges: 42,
            completedChallenges: 38,
            successRate: 92,
            submissions: [],
            favoriteCategory: "Algorithmes"
        },
        {
            id: 2,
            name: "Lucas Dubois",
            level: "avancé",
            points: 2318,
            monthlyPoints: 280,
            progression: 8,
            totalChallenges: 38,
            completedChallenges: 35,
            successRate: 89,
            submissions: [],
            favoriteCategory: "Structures de données"
        },
        {
            id: 3,
            name: "Emma Bernard",
            level: "avancé",
            points: 2185,
            monthlyPoints: 250,
            progression: 12,
            totalChallenges: 35,
            completedChallenges: 32,
            successRate: 91,
            submissions: [],
            favoriteCategory: "Algorithmes"
        },
        {
            id: 4,
            name: "Thomas Petit",
            level: "intermédiaire",
            points: 1958,
            monthlyPoints: 210,
            progression: 5,
            totalChallenges: 30,
            completedChallenges: 27,
            successRate: 85,
            submissions: [],
            favoriteCategory: "Mathématiques"
        },
        {
            id: 5,
            name: "Julie Roux",
            level: "intermédiaire",
            points: 1898,
            monthlyPoints: 190,
            progression: 3,
            totalChallenges: 28,
            completedChallenges: 25,
            successRate: 83,
            submissions: [],
            favoriteCategory: "Algorithmes"
        },
        {
            id: 6,
            name: "Alexandre Laurent",
            level: "débutant",
            points: 1250,
            monthlyPoints: 150,
            progression: 25,
            totalChallenges: 20,
            completedChallenges: 17,
            successRate: 75,
            submissions: [],
            favoriteCategory: "Structures de données"
        },
        {
            id: 7,
            name: "Marie Chen",
            level: "expert",
            points: 2750,
            monthlyPoints: 380,
            progression: 18,
            totalChallenges: 50,
            completedChallenges: 48,
            successRate: 96,
            submissions: [],
            favoriteCategory: "Algorithmes"
        },
        {
            id: 8,
            name: "Pierre Dubois",
            level: "avancé",
            points: 2100,
            monthlyPoints: 0,
            progression: -100,
            totalChallenges: 32,
            completedChallenges: 29,
            successRate: 87,
            submissions: [],
            favoriteCategory: "Intelligence Artificielle"
        },
        {
            id: 9,
            name: "Camille Leroy",
            level: "intermédiaire",
            points: 1650,
            monthlyPoints: 180,
            progression: 10,
            totalChallenges: 25,
            completedChallenges: 22,
            successRate: 80,
            submissions: [],
            favoriteCategory: "Algorithmes"
        },
        {
            id: 10,
            name: "Hugo Moreau",
            level: "débutant",
            points: 950,
            monthlyPoints: 120,
            progression: 30,
            totalChallenges: 15,
            completedChallenges: 12,
            successRate: 70,
            submissions: [],
            favoriteCategory: "Mathématiques"
        }
    ];
}

function calculateMonthlyPoints(submissions) {
    const monthlyPoints = {};
    
    submissions.forEach(submission => {
        if (submission.status === 'accepté') {
            const date = new Date(submission.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            
            if (!monthlyPoints[monthKey]) {
                monthlyPoints[monthKey] = 0;
            }
            
            // Ajouter les points du challenge (score ou points prédéfinis)
            const points = submission.score ? Math.round(submission.score / 10) : 10;
            monthlyPoints[monthKey] += points;
        }
    });
    
    return monthlyPoints;
}

function getCurrentMonthPoints(monthlyPoints) {
    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return monthlyPoints[currentMonthKey] || 0;
}

function getLastMonthPoints(monthlyPoints) {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthKey = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;
    return monthlyPoints[lastMonthKey] || 0;
}

function getFavoriteCategory(submissions) {
    if (!submissions || submissions.length === 0) return 'Non défini';
    
    const categoryCount = {};
    submissions.forEach(sub => {
        const category = sub.challengeCategory || 'Autre';
        categoryCount[category] = (categoryCount[category] || 0) + 1;
    });
    
    return Object.keys(categoryCount).reduce((a, b) => 
        categoryCount[a] > categoryCount[b] ? a : b
    );
}

function updateRankings() {
    const periodFilter = document.getElementById('periodFilter').value;
    const categoryFilter = document.getElementById('categoryFilter').value;
    const levelFilter = document.getElementById('levelFilter').value;
    
    // Filtrer les participants
    filteredParticipants = participants.filter(participant => {
        // Filtre par période
        if (periodFilter !== 'all') {
            const points = getPointsByPeriod(participant, periodFilter);
            if (points === 0) return false;
        }
        
        // Filtre par catégorie
        if (categoryFilter !== 'all' && participant.favoriteCategory) {
            const categoryMap = {
                'algorithmes': 'Algorithmes',
                'structures': 'Structures de données',
                'mathematiques': 'Mathématiques',
                'ia': 'Intelligence Artificielle'
            };
            if (participant.favoriteCategory !== categoryMap[categoryFilter]) {
                return false;
            }
        }
        
        // Filtre par niveau
        if (levelFilter !== 'all') {
            const levelMap = {
                'debutant': 'débutant',
                'intermediaire': 'intermédiaire',
                'avance': 'avancé',
                'expert': 'expert'
            };
            if (participant.level !== levelMap[levelFilter]) {
                return false;
            }
        }
        
        return true;
    });
    
    // Trier selon la période sélectionnée
    if (periodFilter === 'all') {
        filteredParticipants.sort((a, b) => b.points - a.points);
    } else {
        filteredParticipants.sort((a, b) => 
            getPointsByPeriod(b, periodFilter) - getPointsByPeriod(a, periodFilter)
        );
    }
    
    updateStats();
    updatePodium();
    updateRankingTable();
    updateMonthlyRanking();
    updateCharts();
}

function getPointsByPeriod(participant, period) {
    const now = new Date();
    
    switch(period) {
        case 'today':
            // Simuler des points pour aujourd'hui
            return Math.round(participant.monthlyPoints / 30);
        
        case 'week':
            // Simuler des points pour cette semaine
            return Math.round(participant.monthlyPoints / 4);
        
        case 'month':
            return participant.monthlyPoints;
        
        case 'all':
        default:
            return participant.points;
    }
}

function updateStats() {
    // Top participant
    const topParticipant = document.getElementById('topParticipant');
    if (topParticipant && filteredParticipants.length > 0) {
        topParticipant.textContent = filteredParticipants[0].name.split(' ')[0];
    }
    
    // Points moyens
    const avgPoints = document.getElementById('avgPoints');
    if (avgPoints) {
        const avg = filteredParticipants.length > 0 
            ? Math.round(filteredParticipants.reduce((sum, p) => sum + p.points, 0) / filteredParticipants.length)
            : 0;
        avgPoints.textContent = avg;
    }
    
    // Participants actifs
    const activeParticipants = document.getElementById('activeParticipants');
    if (activeParticipants) {
        const activeCount = filteredParticipants.filter(p => p.status === 'actif').length;
        activeParticipants.textContent = activeCount;
    }
    
    // Points totaux
    const totalPoints = document.getElementById('totalPoints');
    if (totalPoints) {
        const total = filteredParticipants.reduce((sum, p) => sum + p.points, 0);
        totalPoints.textContent = total;
    }
    
    // Compteur de participants
    const rankingCount = document.getElementById('rankingCount');
    if (rankingCount) {
        rankingCount.textContent = `${filteredParticipants.length} participants`;
    }
}

function updatePodium() {
    const podium = document.getElementById('podium');
    if (!podium) return;
    
    const top3 = filteredParticipants.slice(0, 3);
    
    // Si moins de 3 participants, compléter avec des placeholders
    while (top3.length < 3) {
        top3.push({
            name: 'Aucun participant',
            points: 0,
            level: 'N/A'
        });
    }
    
    const podiumHTML = `
        <style>
            .podium-container {
                display: flex;
                justify-content: center;
                align-items: flex-end;
                gap: 20px;
                padding: 30px 0;
                max-width: 800px;
                margin: 0 auto;
            }
            
            .podium-place {
                display: flex;
                flex-direction: column;
                align-items: center;
                width: 180px;
            }
            
            .podium-stand {
                width: 100%;
                border-radius: 10px 10px 0 0;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 20px 10px;
                color: white;
                font-weight: bold;
                font-size: 24px;
                position: relative;
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            }
            
            .podium-stand.gold {
                height: 180px;
                background: linear-gradient(135deg, #FFD700, #FFA500);
            }
            
            .podium-stand.silver {
                height: 150px;
                background: linear-gradient(135deg, #C0C0C0, #A0A0A0);
            }
            
            .podium-stand.bronze {
                height: 120px;
                background: linear-gradient(135deg, #CD7F32, #A0522D);
            }
            
            .medal {
                position: absolute;
                top: -25px;
                width: 50px;
                height: 50px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                box-shadow: 0 3px 10px rgba(0,0,0,0.2);
            }
            
            .podium-info {
                margin-top: 15px;
                text-align: center;
                padding: 15px;
                background: white;
                border-radius: 10px;
                width: 100%;
                box-shadow: 0 3px 10px rgba(0,0,0,0.1);
            }
            
            .podium-name {
                font-weight: 600;
                font-size: 16px;
                color: #2c3e50;
                margin-bottom: 5px;
            }
            
            .podium-points {
                font-size: 20px;
                font-weight: 700;
                color: #4dabf7;
                margin-bottom: 5px;
            }
            
            .podium-level {
                font-size: 12px;
                color: #6c757d;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
        </style>
        
        <div class="podium-container">
            <!-- 2ème place -->
            <div class="podium-place">
                <div class="podium-stand silver">
                    <div class="medal" style="background: #C0C0C0;">
                        <i class="fas fa-medal"></i>
                    </div>
                    <div style="margin-top: 40px;">2</div>
                </div>
                <div class="podium-info">
                    <div class="podium-name">${top3[1].name}</div>
                    <div class="podium-points">${top3[1].points}</div>
                    <div class="podium-level">${top3[1].level}</div>
                </div>
            </div>
            
            <!-- 1ère place -->
            <div class="podium-place">
                <div class="podium-stand gold">
                    <div class="medal" style="background: #FFD700;">
                        <i class="fas fa-crown"></i>
                    </div>
                    <div style="margin-top: 40px;">1</div>
                </div>
                <div class="podium-info">
                    <div class="podium-name">${top3[0].name}</div>
                    <div class="podium-points">${top3[0].points}</div>
                    <div class="podium-level">${top3[0].level}</div>
                </div>
            </div>
            
            <!-- 3ème place -->
            <div class="podium-place">
                <div class="podium-stand bronze">
                    <div class="medal" style="background: #CD7F32;">
                        <i class="fas fa-medal"></i>
                    </div>
                    <div style="margin-top: 40px;">3</div>
                </div>
                <div class="podium-info">
                    <div class="podium-name">${top3[2].name}</div>
                    <div class="podium-points">${top3[2].points}</div>
                    <div class="podium-level">${top3[2].level}</div>
                </div>
            </div>
        </div>
    `;
    
    podium.innerHTML = podiumHTML;
}

function updateRankingTable() {
    const tableBody = document.getElementById('rankingTableBody');
    if (!tableBody) return;
    
    if (filteredParticipants.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">
                    <div class="empty-state">
                        <i class="fas fa-trophy" style="font-size: 48px; margin-bottom: 15px; display: block; color: #adb5bd;"></i>
                        <h3 style="margin-bottom: 10px; color: #495057;">Aucun participant</h3>
                        <p style="color: #6c757d;">Modifiez vos filtres pour voir le classement</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    let tableHTML = '';
    
    filteredParticipants.forEach((participant, index) => {
        const rank = index + 1;
        const rankClass = getRankClass(rank);
        const progressionClass = participant.progression >= 0 ? 'text-success' : 'text-danger';
        const progressionIcon = participant.progression >= 0 ? 'fa-arrow-up' : 'fa-arrow-down';
        
        tableHTML += `
            <tr>
                <td>
                    <span class="rank-badge ${rankClass}">${rank}</span>
                </td>
                <td>
                    <div class="user-cell">
                        <div class="user-avatar-small">${getInitials(participant.name)}</div>
                        <div>
                            <div class="user-name">${participant.name}</div>
                            <small class="text-muted">${participant.favoriteCategory || 'Non défini'}</small>
                        </div>
                    </div>
                </td>
                <td>
                    <span class="badge ${getLevelBadgeClass(participant.level)}">
                        ${participant.level}
                    </span>
                </td>
                <td>
                    <strong class="points-value">${participant.points}</strong>
                </td>
                <td>
                    <div class="progress" style="height: 8px; width: 100px;">
                        <div class="progress-bar bg-primary" 
                             style="width: ${participant.completedChallenges > 0 ? 
                                 (participant.completedChallenges / participant.totalChallenges) * 100 : 0}%">
                        </div>
                    </div>
                    <small>${participant.completedChallenges}/${participant.totalChallenges}</small>
                </td>
                <td>
                    <div class="success-rate">
                        <div class="rate-value">${participant.successRate}%</div>
                        <div class="rate-bar">
                            <div class="rate-fill" style="width: ${participant.successRate}%"></div>
                        </div>
                    </div>
                </td>
                <td>
                    <span class="${progressionClass}">
                        <i class="fas ${progressionIcon}"></i>
                        ${Math.abs(participant.progression)}%
                    </span>
                </td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = tableHTML;
    
    // Ajouter les styles
    const style = document.createElement('style');
    style.textContent = `
        .rank-badge {
            display: inline-block;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 14px;
            color: white;
        }
        
        .rank-badge.gold {
            background: linear-gradient(135deg, #FFD700, #FFA500);
        }
        
        .rank-badge.silver {
            background: linear-gradient(135deg, #C0C0C0, #A0A0A0);
        }
        
        .rank-badge.bronze {
            background: linear-gradient(135deg, #CD7F32, #A0522D);
        }
        
        .rank-badge.other {
            background: #6c757d;
        }
        
        .points-value {
            font-size: 18px;
            font-weight: 700;
            color: #4dabf7;
        }
        
        .success-rate {
            display: flex;
            flex-direction: column;
            gap: 5px;
        }
        
        .rate-value {
            font-weight: 600;
            font-size: 14px;
        }
        
        .rate-bar {
            height: 6px;
            background: #e9ecef;
            border-radius: 3px;
            overflow: hidden;
        }
        
        .rate-fill {
            height: 100%;
            background: linear-gradient(90deg, #40c057, #2b8a3e);
            border-radius: 3px;
        }
        
        .text-success {
            color: #40c057 !important;
        }
        
        .text-danger {
            color: #fa5252 !important;
        }
    `;
    document.head.appendChild(style);
}

function getRankClass(rank) {
    switch(rank) {
        case 1: return 'gold';
        case 2: return 'silver';
        case 3: return 'bronze';
        default: return 'other';
    }
}

function getLevelBadgeClass(level) {
    switch(level) {
        case 'expert': return 'badge-danger';
        case 'avancé': return 'badge-warning';
        case 'intermédiaire': return 'badge-success';
        case 'débutant': return 'badge-primary';
        default: return 'badge-secondary';
    }
}

function initializeMonthSelector() {
    const monthSelector = document.getElementById('monthSelector');
    if (!monthSelector) return;
    
    const months = [];
    const now = new Date();
    
    // Générer les 12 derniers mois
    for (let i = 0; i < 12; i++) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
        const monthValue = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        months.push({
            name: monthName.charAt(0).toUpperCase() + monthName.slice(1),
            value: monthValue
        });
    }
    
    // Ajouter les options
    monthSelector.innerHTML = months.map(month => 
        `<option value="${month.value}">${month.name}</option>`
    ).join('');
}

function updateMonthlyRanking() {
    const monthSelector = document.getElementById('monthSelector');
    const monthValue = monthSelector ? monthSelector.value : '';
    const monthlyRankingBody = document.getElementById('monthlyRankingBody');
    const monthRankingCount = document.getElementById('monthRankingCount');
    
    if (!monthlyRankingBody) return;
    
    // Trier par points mensuels
    const monthlyParticipants = [...participants]
        .filter(p => p.monthlyPoints > 0)
        .sort((a, b) => b.monthlyPoints - a.monthlyPoints)
        .slice(0, 10); // Top 10
    
    if (monthRankingCount) {
        monthRankingCount.textContent = `${monthlyParticipants.length} participants`;
    }
    
    if (monthlyParticipants.length === 0) {
        monthlyRankingBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">
                    <div class="empty-state" style="padding: 20px;">
                        <i class="fas fa-chart-line" style="font-size: 32px; margin-bottom: 10px; display: block; color: #adb5bd;"></i>
                        <p style="color: #6c757d;">Aucune donnée pour ce mois</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    let tableHTML = '';
    
    monthlyParticipants.forEach((participant, index) => {
        const rank = index + 1;
        const progressionClass = participant.progression >= 0 ? 'text-success' : 'text-danger';
        const progressionIcon = participant.progression >= 0 ? 'fa-arrow-up' : 'fa-arrow-down';
        
        tableHTML += `
            <tr>
                <td>
                    <span class="rank-badge ${getRankClass(rank)}">${rank}</span>
                </td>
                <td>
                    <div class="user-cell">
                        <div class="user-avatar-small">${getInitials(participant.name)}</div>
                        <div>
                            <div class="user-name">${participant.name}</div>
                            <small class="text-muted">${participant.level}</small>
                        </div>
                    </div>
                </td>
                <td>
                    <strong class="points-value">${participant.monthlyPoints}</strong>
                </td>
                <td>
                    <span class="${progressionClass}">
                        <i class="fas ${progressionIcon}"></i>
                        ${Math.abs(participant.progression)}%
                    </span>
                </td>
                <td>
                    <span class="badge badge-success">${participant.completedChallenges}</span>
                </td>
            </tr>
        `;
    });
    
    monthlyRankingBody.innerHTML = tableHTML;
}

function initializeCharts() {
    // Graphique d'évolution des points
    const pointsEvolutionCtx = document.getElementById('pointsEvolutionChart');
    if (pointsEvolutionCtx) {
        const top10 = participants.slice(0, 10);
        const labels = top10.map(p => p.name.split(' ')[0]);
        const data = top10.map(p => p.points);
        
        new Chart(pointsEvolutionCtx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Points totaux',
                    data: data,
                    borderColor: '#4dabf7',
                    backgroundColor: 'rgba(77, 171, 247, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const participant = top10[context.dataIndex];
                                return `${participant.name}: ${context.parsed.y} points`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Points'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Participants'
                        }
                    }
                }
            }
        });
    }
    
    // Graphique de répartition par catégorie
    const categoryDistributionCtx = document.getElementById('categoryDistributionChart');
    if (categoryDistributionCtx) {
        const categories = {};
        participants.forEach(p => {
            const category = p.favoriteCategory || 'Autre';
            categories[category] = (categories[category] || 0) + 1;
        });
        
        const labels = Object.keys(categories);
        const data = Object.values(categories);
        const backgroundColors = [
            '#4dabf7', '#40c057', '#ff922b', '#f06595', 
            '#7950f2', '#20c997', '#fa5252', '#ffd43b'
        ];
        
        new Chart(categoryDistributionCtx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: backgroundColors,
                    borderWidth: 1,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.raw;
                                const total = data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${context.label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }
}

function updateCharts() {
    // Mettre à jour le graphique de classement (si visible)
    if (currentView === 'chart') {
        updateRankingChart();
    }
    
    // Mettre à jour les meilleurs scores
    updateBestScores();
}

function updateRankingChart() {
    const chartContainer = document.getElementById('rankingChartContainer');
    const chartCanvas = document.getElementById('rankingChart');
    
    if (!chartContainer || !chartCanvas) return;
    
    // Détruire le chart existant
    const existingChart = Chart.getChart(chartCanvas);
    if (existingChart) {
        existingChart.destroy();
    }
    
    const top10 = filteredParticipants.slice(0, 10);
    const labels = top10.map((p, i) => `#${i + 1} ${p.name.split(' ')[0]}`);
    const data = top10.map(p => p.points);
    
    new Chart(chartCanvas, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Points',
                data: data,
                backgroundColor: [
                    '#FFD700', '#C0C0C0', '#CD7F32',
                    '#4dabf7', '#40c057', '#ff922b', 
                    '#f06595', '#7950f2', '#20c997', '#fa5252'
                ],
                borderColor: '#fff',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                datalabels: {
                    color: '#fff',
                    font: {
                        weight: 'bold'
                    },
                    formatter: function(value) {
                        return value;
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Points'
                    }
                },
                x: {
                    ticks: {
                        maxRotation: 45
                    }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}

function updateBestScores() {
    const bestScores = document.getElementById('bestScores');
    if (!bestScores) return;
    
    // Récupérer les 5 meilleurs scores
    const topScores = filteredParticipants
        .slice(0, 5)
        .map(p => ({
            name: p.name,
            score: p.successRate,
            points: p.points,
            challenges: p.completedChallenges
        }));
    
    const scoresHTML = `
        <div class="scores-list">
            ${topScores.map((score, index) => `
                <div class="score-item ${index === 0 ? 'highlight' : ''}">
                    <div class="score-rank">
                        <span class="rank-number">${index + 1}</span>
                    </div>
                    <div class="score-info">
                        <div class="score-name">${score.name}</div>
                        <div class="score-stats">
                            <span class="stat">
                                <i class="fas fa-star"></i> ${score.points} pts
                            </span>
                            <span class="stat">
                                <i class="fas fa-check"></i> ${score.challenges} challenges
                            </span>
                            <span class="stat">
                                <i class="fas fa-percentage"></i> ${score.score}% réussite
                            </span>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
        
        <style>
            .scores-list {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            
            .score-item {
                display: flex;
                align-items: center;
                gap: 15px;
                padding: 15px;
                background: #f8f9fa;
                border-radius: 10px;
                border-left: 4px solid #4dabf7;
                transition: all 0.3s ease;
            }
            
            .score-item.highlight {
                background: linear-gradient(135deg, #f8f9fa, #e7f5ff);
                border-left-color: #ffd700;
                box-shadow: 0 3px 10px rgba(255, 215, 0, 0.2);
            }
            
            .score-item:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            }
            
            .score-rank {
                width: 40px;
                height: 40px;
                background: #4dabf7;
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: 700;
                font-size: 18px;
            }
            
            .score-item.highlight .score-rank {
                background: #ffd700;
            }
            
            .score-info {
                flex: 1;
            }
            
            .score-name {
                font-weight: 600;
                color: #2c3e50;
                margin-bottom: 5px;
            }
            
            .score-stats {
                display: flex;
                gap: 15px;
                flex-wrap: wrap;
            }
            
            .stat {
                display: flex;
                align-items: center;
                gap: 5px;
                font-size: 12px;
                color: #6c757d;
            }
            
            .stat i {
                color: #4dabf7;
            }
        </style>
    `;
    
    bestScores.innerHTML = scoresHTML;
}

function toggleView() {
    const tableContainer = document.getElementById('rankingTableContainer');
    const chartContainer = document.getElementById('rankingChartContainer');
    const toggleBtn = document.querySelector('.card-header .btn');
    
    if (currentView === 'table') {
        tableContainer.style.display = 'none';
        chartContainer.style.display = 'block';
        currentView = 'chart';
        if (toggleBtn) {
            toggleBtn.innerHTML = '<i class="fas fa-list"></i> Tableau';
        }
        updateRankingChart();
    } else {
        tableContainer.style.display = 'block';
        chartContainer.style.display = 'none';
        currentView = 'table';
        if (toggleBtn) {
            toggleBtn.innerHTML = '<i class="fas fa-chart-bar"></i> Graphique';
        }
    }
}

function exportRankingsToCSV() {
    if (filteredParticipants.length === 0) {
        showNotification('Aucune donnée à exporter', 'warning');
        return;
    }
    
    const headers = [
        'Rang',
        'Participant',
        'Email',
        'Niveau',
        'Points totaux',
        'Points mensuels',
        'Progression (%)',
        'Challenges réussis',
        'Challenges totaux',
        'Taux de réussite (%)',
        'Catégorie préférée',
        'Date d\'inscription',
        'Statut'
    ];
    
    const data = filteredParticipants.map((participant, index) => [
        index + 1,
        escapeCSV(participant.name),
        escapeCSV(participant.email || ''),
        participant.level,
        participant.points,
        participant.monthlyPoints,
        participant.progression,
        participant.completedChallenges,
        participant.totalChallenges,
        participant.successRate,
        escapeCSV(participant.favoriteCategory || ''),
        formatDateForCSV(participant.joinDate),
        participant.status
    ]);
    
    const BOM = '\uFEFF';
    let csvContent = BOM + headers.join(';') + '\r\n';
    data.forEach(row => {
        csvContent += row.join(';') + '\r\n';
    });
    
    const timestamp = new Date().toISOString()
        .replace(/:/g, '-')
        .replace(/\..+/, '')
        .replace('T', '_');
    
    const filename = `classement_${timestamp}.csv`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    link.download = filename;
    link.style.cssText = 'display: none';
    
    document.body.appendChild(link);
    link.click();
    
    setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, 100);
    
    showNotification(`Export CSV réussi (${filteredParticipants.length} participants)`, 'success');
}

function refreshRankings() {
    loadData().then(() => {
        updateRankings();
        showNotification('Classement actualisé', 'success');
    });
}

function resetFilters() {
    document.getElementById('periodFilter').value = 'all';
    document.getElementById('categoryFilter').value = 'all';
    document.getElementById('levelFilter').value = 'all';
    updateRankings();
}

function showError(message) {
    const container = document.querySelector('.page-content');
    if (!container) return;
    
    const errorHTML = `
        <div class="error-state">
            <i class="fas fa-exclamation-triangle"></i>
            <h2>Erreur</h2>
            <p>${message}</p>
            <button class="btn btn-primary" onclick="location.reload()">
                <i class="fas fa-redo"></i> Réessayer
            </button>
        </div>
    `;
    
    container.innerHTML = errorHTML;
}

// Fonctions utilitaires
function escapeCSV(value) {
    if (value === null || value === undefined || value === '') {
        return '';
    }
    
    const stringValue = String(value).trim();
    if (stringValue === '') return '';
    
    const needsEscaping = stringValue.includes('"') || 
                         stringValue.includes(';') || 
                         stringValue.includes(',') || 
                         stringValue.includes('\n') || 
                         stringValue.includes('\r');
    
    if (needsEscaping) {
        return '"' + stringValue.replace(/"/g, '""') + '"';
    }
    
    return stringValue;
}

function formatDateForCSV(dateString) {
    if (!dateString) return '';
    
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR');
    } catch (error) {
        return dateString;
    }
}

function getInitials(name) {
    if (!name) return 'NN';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 3);
}

function logout() {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
        window.location.href = 'index.html';
    }
}

// Exposer les fonctions globales
window.updateRankings = updateRankings;
window.toggleView = toggleView;
window.exportRankingsToCSV = exportRankingsToCSV;
window.refreshRankings = refreshRankings;
window.resetFilters = resetFilters;
window.updateMonthlyRanking = updateMonthlyRanking;
window.logout = logout;