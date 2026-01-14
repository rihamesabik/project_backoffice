// submissions.js - Gestion des soumissions
let submissions = [];
let filteredSubmissions = [];
let currentPage = 1;
const itemsPerPage = 8;
let currentQuickActionId = null;

// Initialisation
document.addEventListener('DOMContentLoaded', async function() {
    await loadSubmissions();
    setupEventListeners();
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

function setupEventListeners() {
    // Initialiser les écouteurs d'événements si nécessaire
}

// Charger les soumissions depuis le fichier JSON
async function loadSubmissions() {
    try {
        const response = await fetch('data/submissions.json');
        if (!response.ok) {
            throw new Error('Erreur de chargement des données');
        }
        const data = await response.json();
        submissions = data.submissions || [];
        filteredSubmissions = [...submissions];
        displaySubmissions();
        updateStats();
    } catch (error) {
        console.error('Erreur:', error);
        showError('Impossible de charger les soumissions');
        submissions = getFallbackSubmissions();
        filteredSubmissions = [...submissions];
        displaySubmissions();
        updateStats();
    }
}

// Fallback si le fichier JSON ne peut être chargé
function getFallbackSubmissions() {
    return [
        {
            id: 1001,
            userName: "Sophie Martin",
            challengeName: "QuickSort Opt",
            language: "C++",
            score: 980,
            maxScore: 1000,
            status: "accepté",
            date: "2024-05-12 14:30:00"
        },
        {
            id: 1002,
            userName: "Lucas Dubois",
            challengeName: "Arbre binaire",
            language: "Java",
            score: 920,
            maxScore: 1000,
            status: "accepté",
            date: "2024-05-11 09:15:00"
        },
        {
            id: 1003,
            userName: "Emma Bernard",
            challengeName: "Hash Table",
            language: "Python",
            score: 880,
            maxScore: 1000,
            status: "rejeté",
            date: "2024-05-10 16:45:00"
        },
        {
            id: 1004,
            userName: "Thomas Petit",
            challengeName: "Dijkstra",
            language: "JavaScript",
            score: 750,
            maxScore: 1000,
            status: "en attente",
            date: "2024-05-09 11:20:00"
        }
    ];
}

function displaySubmissions() {
    const tableBody = document.getElementById('submissionsTableBody');
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const submissionsToDisplay = filteredSubmissions.slice(startIndex, endIndex);
    
    if (!tableBody) return;
    
    if (submissionsToDisplay.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center">
                    <div class="empty-state">
                        <i class="fas fa-inbox" style="font-size: 48px; margin-bottom: 15px; display: block; color: #adb5bd;"></i>
                        <h3 style="margin-bottom: 10px; color: #495057;">Aucune soumission trouvée</h3>
                        <p style="color: #6c757d;">Essayez de modifier vos filtres de recherche</p>
                    </div>
                </td>
            </tr>
        `;
        setupPagination();
        updateTableInfo();
        return;
    }
    
    let tableHTML = '';
    
    submissionsToDisplay.forEach(sub => {
        // Badge statut
        let statusBadge = '';
        switch(sub.status) {
            case 'accepté': 
                statusBadge = '<span class="badge badge-success">Accepté</span>'; 
                break;
            case 'rejeté': 
                statusBadge = '<span class="badge badge-danger">Rejeté</span>'; 
                break;
            case 'en attente': 
                statusBadge = '<span class="badge badge-warning">En attente</span>'; 
                break;
        }
        
        // Barre de progression du score
        const scorePercentage = Math.round((sub.score / sub.maxScore) * 100);
        let scoreColor = '';
        if (scorePercentage >= 90) scoreColor = 'bg-success';
        else if (scorePercentage >= 70) scoreColor = 'bg-warning';
        else scoreColor = 'bg-danger';
        
        const initials = getInitials(sub.userName);
        const formattedDate = formatDate(sub.date);
        
        tableHTML += `
            <tr>
                <td>#${sub.id}</td>
                <td>
                    <div class="user-cell">
                        <div class="user-avatar-small">${initials}</div>
                        <div>
                            <div class="user-name">${sub.userName}</div>
                            <small class="text-muted">${sub.language}</small>
                        </div>
                    </div>
                </td>
                <td>
                    <strong>${sub.challengeName}</strong>
                    <div class="text-muted" style="font-size: 12px; margin-top: 2px;">
                        ${sub.challengeCategory || 'Non catégorisé'}
                    </div>
                </td>
                <td>
                    <span class="language-badge">${sub.language}</span>
                </td>
                <td>
                    <div class="score-display">
                        <div class="score-value">${sub.score}/${sub.maxScore}</div>
                        <div class="progress" style="height: 6px; width: 100px; margin-top: 5px;">
                            <div class="progress-bar ${scoreColor}" style="width: ${scorePercentage}%"></div>
                        </div>
                    </div>
                </td>
                <td>${statusBadge}</td>
                <td>${formattedDate}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-action btn-view" onclick="viewDetails(${sub.id})" title="Voir détails">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-action ${sub.status === 'accepté' ? 'btn-edit' : 'btn-success'}" onclick="quickAction(${sub.id})" title="Actions rapides">
                            <i class="fas fa-bolt"></i>
                        </button>
                        <button class="btn-action btn-delete" onclick="deleteSubmission(${sub.id})" title="Supprimer">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = tableHTML;
    
    // Ajouter le CSS pour les badges de langage
    const style = document.createElement('style');
    style.textContent = `
        .language-badge {
            display: inline-block;
            padding: 4px 10px;
            background: #e9ecef;
            color: #495057;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
            font-family: 'Courier New', monospace;
        }
        
        .progress {
            background-color: #e9ecef;
            border-radius: 4px;
            overflow: hidden;
        }
        
        .progress-bar {
            height: 100%;
            border-radius: 4px;
            transition: width 0.6s ease;
        }
        
        .bg-success { background-color: #40c057 !important; }
        .bg-warning { background-color: #ff922b !important; }
        .bg-danger { background-color: #fa5252 !important; }
        
        .score-value {
            font-weight: 700;
            font-size: 14px;
        }
        
        .quick-actions-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin-bottom: 20px;
        }
        
        .quick-action-btn {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 20px 15px;
            background: #f8f9fa;
            border: 2px solid #dee2e6;
            border-radius: 10px;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .quick-action-btn:hover {
            background: #4dabf7;
            color: white;
            border-color: #4dabf7;
            transform: translateY(-2px);
        }
        
        .quick-action-btn.reject:hover {
            background: #fa5252;
            border-color: #fa5252;
        }
        
        .quick-action-btn i {
            font-size: 24px;
            margin-bottom: 10px;
        }
    `;
    document.head.appendChild(style);
    
    setupPagination();
    updateTableInfo();
}

function updateStats() {
    const totalSubmissions = document.getElementById('totalSubmissions');
    const acceptedSubmissions = document.getElementById('acceptedSubmissions');
    const pendingSubmissions = document.getElementById('pendingSubmissions');
    const avgScore = document.getElementById('avgScore');
    
    if (totalSubmissions) totalSubmissions.textContent = submissions.length;
    
    if (acceptedSubmissions) {
        const acceptedCount = submissions.filter(s => s.status === 'accepté').length;
        acceptedSubmissions.textContent = acceptedCount;
    }
    
    if (pendingSubmissions) {
        const pendingCount = submissions.filter(s => s.status === 'en attente').length;
        pendingSubmissions.textContent = pendingCount;
    }
    
    if (avgScore) {
        const avg = submissions.length > 0 ? 
            Math.round(submissions.reduce((sum, s) => sum + s.score, 0) / submissions.length) : 0;
        avgScore.textContent = avg;
    }
}

function updateTableInfo() {
    const tableInfo = document.getElementById('tableInfo');
    if (tableInfo) {
        const start = (currentPage - 1) * itemsPerPage + 1;
        const end = Math.min(currentPage * itemsPerPage, filteredSubmissions.length);
        const total = filteredSubmissions.length;
        tableInfo.textContent = `${start}-${end} sur ${total} soumissions`;
    }
}

function searchSubmissions() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    
    const searchTerm = searchInput.value.toLowerCase();
    filteredSubmissions = submissions.filter(sub => 
        sub.userName.toLowerCase().includes(searchTerm) ||
        sub.challengeName.toLowerCase().includes(searchTerm) ||
        sub.id.toString().includes(searchTerm)
    );
    currentPage = 1;
    displaySubmissions();
}

function filterSubmissions() {
    const statusFilter = document.getElementById('statusFilter');
    const languageFilter = document.getElementById('languageFilter');
    const dateFilter = document.getElementById('dateFilter');
    const searchInput = document.getElementById('searchInput');
    
    if (!statusFilter || !languageFilter || !dateFilter || !searchInput) return;
    
    const statusValue = statusFilter.value;
    const languageValue = languageFilter.value;
    const dateValue = dateFilter.value;
    const searchTerm = searchInput.value.toLowerCase();
    
    filteredSubmissions = submissions.filter(sub => {
        const matchesSearch = !searchTerm || 
            sub.userName.toLowerCase().includes(searchTerm) ||
            sub.challengeName.toLowerCase().includes(searchTerm);
        const matchesStatus = !statusValue || sub.status === statusValue;
        const matchesLanguage = !languageValue || sub.language === languageValue;
        const matchesDate = filterByDate(sub.date, dateValue);
        
        return matchesSearch && matchesStatus && matchesLanguage && matchesDate;
    });
    
    currentPage = 1;
    displaySubmissions();
}

function filterByDate(dateString, filterType) {
    if (!filterType) return true;
    
    const date = new Date(dateString);
    const today = new Date();
    
    switch(filterType) {
        case 'today':
            return date.toDateString() === today.toDateString();
        case 'week':
            const weekAgo = new Date();
            weekAgo.setDate(today.getDate() - 7);
            return date >= weekAgo;
        case 'month':
            const monthAgo = new Date();
            monthAgo.setMonth(today.getMonth() - 1);
            return date >= monthAgo;
        default:
            return true;
    }
}

function sortSubmissions() {
    const sortSelect = document.getElementById('sortSelect');
    if (!sortSelect) return;
    
    const sortBy = sortSelect.value;
    
    filteredSubmissions.sort((a, b) => {
        switch(sortBy) {
            case 'date-desc': return new Date(b.date) - new Date(a.date);
            case 'date-asc': return new Date(a.date) - new Date(b.date);
            case 'score-desc': return b.score - a.score;
            case 'score-asc': return a.score - b.score;
            default: return 0;
        }
    });
    
    displaySubmissions();
}

function clearFilters() {
    const searchInput = document.getElementById('searchInput');
    const statusFilter = document.getElementById('statusFilter');
    const languageFilter = document.getElementById('languageFilter');
    const dateFilter = document.getElementById('dateFilter');
    const sortSelect = document.getElementById('sortSelect');
    
    if (searchInput) searchInput.value = '';
    if (statusFilter) statusFilter.value = '';
    if (languageFilter) languageFilter.value = '';
    if (dateFilter) dateFilter.value = '';
    if (sortSelect) sortSelect.value = 'date-desc';
    
    filteredSubmissions = [...submissions];
    currentPage = 1;
    displaySubmissions();
}

function setupPagination() {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;
    
    const totalPages = Math.ceil(filteredSubmissions.length / itemsPerPage);
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    
    // Bouton précédent
    paginationHTML += `
        <button class="page-btn ${currentPage === 1 ? 'disabled' : ''}" 
                onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
            <i class="fas fa-chevron-left"></i>
        </button>
    `;
    
    // Pages
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    if (startPage > 1) {
        paginationHTML += `<button class="page-btn" onclick="changePage(1)">1</button>`;
        if (startPage > 2) {
            paginationHTML += `<span class="page-dots">...</span>`;
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <button class="page-btn ${i === currentPage ? 'active' : ''}" 
                    onclick="changePage(${i})">
                ${i}
            </button>
        `;
    }
    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationHTML += `<span class="page-dots">...</span>`;
        }
        paginationHTML += `<button class="page-btn" onclick="changePage(${totalPages})">${totalPages}</button>`;
    }
    
    // Bouton suivant
    paginationHTML += `
        <button class="page-btn ${currentPage === totalPages ? 'disabled' : ''}" 
                onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
            <i class="fas fa-chevron-right"></i>
        </button>
    `;
    
    pagination.innerHTML = paginationHTML;
}

function changePage(page) {
    if (page < 1 || page > Math.ceil(filteredSubmissions.length / itemsPerPage)) return;
    currentPage = page;
    displaySubmissions();
}

// Actions rapides
function quickAction(submissionId) {
    currentQuickActionId = submissionId;
    const modal = document.getElementById('quickActionModal');
    const title = document.getElementById('quickActionTitle');
    
    if (modal && title) {
        const submission = submissions.find(s => s.id === submissionId);
        if (submission) {
            title.textContent = `Actions pour #${submissionId}`;
        }
        modal.style.display = 'flex';
    }
}

function closeQuickActionModal() {
    const modal = document.getElementById('quickActionModal');
    if (modal) {
        modal.style.display = 'none';
    }
    currentQuickActionId = null;
}

function acceptSubmission(submissionId) {
    const submission = submissions.find(s => s.id === submissionId);
    if (!submission) return;
    
    submission.status = 'accepté';
    filteredSubmissions = [...submissions];
    displaySubmissions();
    updateStats();
    
    const comment = document.getElementById('quickComment').value;
    if (comment) {
        showNotification(`Soumission #${submissionId} acceptée avec commentaire`, 'success');
    } else {
        showNotification(`Soumission #${submissionId} acceptée`, 'success');
    }
    
    closeQuickActionModal();
}

function rejectSubmission(submissionId) {
    const submission = submissions.find(s => s.id === submissionId);
    if (!submission) return;
    
    submission.status = 'rejeté';
    filteredSubmissions = [...submissions];
    displaySubmissions();
    updateStats();
    
    const comment = document.getElementById('quickComment').value;
    if (comment) {
        showNotification(`Soumission #${submissionId} rejetée avec commentaire`, 'warning');
    } else {
        showNotification(`Soumission #${submissionId} rejetée`, 'warning');
    }
    
    closeQuickActionModal();
}

function runSingleTest(submissionId) {
    showNotification(`Tests en cours pour la soumission #${submissionId}...`, 'info');
    // Simulation de tests
    setTimeout(() => {
        showNotification(`Tests terminés pour #${submissionId}`, 'success');
    }, 2000);
}

function viewDetails(submissionId) {
    window.location.href = `submission-details.html?id=${submissionId}`;
}

function deleteSubmission(submissionId) {
    if (confirm(`Supprimer la soumission #${submissionId} ? Cette action est irréversible.`)) {
        const index = submissions.findIndex(s => s.id === submissionId);
        if (index !== -1) {
            submissions.splice(index, 1);
            filteredSubmissions = filteredSubmissions.filter(s => s.id !== submissionId);
            displaySubmissions();
            updateStats();
            showNotification(`Soumission #${submissionId} supprimée`, 'success');
        }
    }
}

function runTests() {
    const pendingSubmissions = submissions.filter(s => s.status === 'en attente');
    if (pendingSubmissions.length === 0) {
        showNotification('Aucune soumission en attente', 'info');
        return;
    }
    
    showNotification(`Exécution des tests pour ${pendingSubmissions.length} soumissions...`, 'info');
    
    // Simulation de l'exécution des tests
    setTimeout(() => {
        let processed = 0;
        pendingSubmissions.forEach(sub => {
            // Simuler un résultat aléatoire
            const randomScore = Math.floor(Math.random() * 500) + 500;
            sub.score = randomScore;
            sub.status = randomScore >= 700 ? 'accepté' : 'rejeté';
            processed++;
            
            if (processed === pendingSubmissions.length) {
                filteredSubmissions = [...submissions];
                displaySubmissions();
                updateStats();
                showNotification(`${pendingSubmissions.length} soumissions traitées`, 'success');
            }
        });
    }, 3000);
}

// ============= FONCTION EXPORT CSV UNIQUE ET CORRECTE =============
function exportToCSV() {
    console.log('=== DÉBUT EXPORT CSV ===');
    
    if (filteredSubmissions.length === 0) {
        showNotification('Aucune donnée à exporter', 'warning');
        return;
    }
    
    console.log('Nombre de soumissions à exporter:', filteredSubmissions.length);
    console.log('Première soumission:', filteredSubmissions[0]);
    
    // Préparer les en-têtes avec les colonnes principales
    const headers = [
        'ID',
        'Participant',
        'Challenge',
        'Catégorie',
        'Langage',
        'Score',
        'Score Max',
        'Statut',
        'Date de soumission',
        'Temps d\'exécution (ms)',
        'Mémoire utilisée (MB)'
    ];
    
    // Préparer les données
    const data = filteredSubmissions.map(sub => {
        // Formatage de la date
        let formattedDate = 'N/A';
        try {
            const date = new Date(sub.date);
            formattedDate = date.toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            formattedDate = sub.date || 'N/A';
        }
        
        return [
            sub.id,
            escapeCSV(sub.userName || ''),
            escapeCSV(sub.challengeName || ''),
            escapeCSV(sub.challengeCategory || 'Non catégorisé'),
            sub.language || 'N/A',
            sub.score || 0,
            sub.maxScore || 1000,
            sub.status || 'N/A',
            formattedDate,
            sub.executionTime || 'N/A',
            sub.memoryUsage || 'N/A'
        ];
    });
    
    // Ajouter BOM pour UTF-8 (important pour Excel)
    const BOM = '\uFEFF';
    
    // Créer le contenu CSV avec point-virgule comme séparateur
    let csvContent = BOM + headers.join(';') + '\r\n';
    data.forEach(row => {
        csvContent += row.join(';') + '\r\n';
    });
    
    console.log('Contenu CSV généré (premières lignes):', csvContent.substring(0, 500));
    
    // Générer un nom de fichier avec timestamp
    const timestamp = new Date().toISOString()
        .replace(/:/g, '-')
        .replace(/\..+/, '')
        .replace('T', '_');
    
    const filename = `soumissions_${timestamp}.csv`;
    
    // Créer le blob avec le bon type MIME
    const blob = new Blob([csvContent], { 
        type: 'text/csv;charset=utf-8'
    });
    
    // Vérifier si le blob est valide
    if (blob.size === 0) {
        console.error('Erreur: Blob vide');
        showNotification('Erreur: données CSV vides', 'error');
        return;
    }
    
    console.log('Taille du blob:', blob.size, 'bytes');
    
    // Créer le lien de téléchargement
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.href = url;
    link.download = filename;
    link.style.cssText = `
        display: none;
        position: absolute;
        left: -9999px;
    `;
    
    document.body.appendChild(link);
    
    try {
        console.log('Tentative de téléchargement...');
        link.click();
        console.log('Téléchargement déclenché');
        showNotification(`Export CSV réussi (${filteredSubmissions.length} soumissions)`, 'success');
        
    } catch (error) {
        console.error('Erreur lors du téléchargement:', error);
        showNotification('Erreur lors de l\'export CSV', 'error');
        
        // Essayer une méthode alternative
        try {
            // Méthode alternative pour certains navigateurs
            if (navigator.msSaveOrOpenBlob) {
                navigator.msSaveOrOpenBlob(blob, filename);
            } else {
                // Ouvrir dans une nouvelle fenêtre
                const newWindow = window.open(url, '_blank');
                if (!newWindow) {
                    showNotification('Le navigateur bloque les popups. Autorisez-les pour télécharger.', 'warning');
                }
            }
        } catch (altError) {
            console.error('Erreur méthode alternative:', altError);
        }
    } finally {
        // Nettoyer après un délai
        setTimeout(() => {
            if (link.parentNode) {
                document.body.removeChild(link);
            }
            URL.revokeObjectURL(url);
            console.log('Nettoyage terminé');
        }, 1000);
    }
}

// Fonction d'échappement pour CSV
function escapeCSV(value) {
    if (value === null || value === undefined || value === '') {
        return '';
    }
    
    const stringValue = String(value).trim();
    
    // Si vide après trim, retourner vide
    if (stringValue === '') {
        return '';
    }
    
    // Vérifier si besoin d'échappement
    const needsEscaping = stringValue.includes('"') || 
                         stringValue.includes(';') || 
                         stringValue.includes(',') || 
                         stringValue.includes('\n') || 
                         stringValue.includes('\r') ||
                         stringValue.includes('\t');
    
    if (needsEscaping) {
        // Échapper les guillemets existants et entourer de guillemets
        return '"' + stringValue.replace(/"/g, '""') + '"';
    }
    
    return stringValue;
}

// Fonction PDF (simulation)
function exportToPDF() {
    showNotification('Export PDF en cours de développement...', 'info');
}

function refreshData() {
    loadSubmissions();
    showNotification('Données actualisées', 'info');
}

function showError(message) {
    const contentDiv = document.getElementById('submissionsTableBody');
    if (!contentDiv) return;
    
    contentDiv.innerHTML = `
        <tr>
            <td colspan="8" class="text-center">
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: #fa5252; margin-bottom: 20px;"></i>
                    <h2 style="color: #fa5252; margin-bottom: 15px;">Erreur</h2>
                    <p style="color: #6c757d; margin-bottom: 25px;">${message}</p>
                </div>
            </td>
        </tr>
    `;
}

// Fonction de test pour vérifier l'export CSV
function testCSVExport() {
    console.log('=== TEST CSV EXPORT ===');
    console.log('Données disponibles:', filteredSubmissions.length);
    
    if (filteredSubmissions.length === 0) {
        console.log('Aucune donnée à tester');
        return;
    }
    
    // Tester l'échappement
    const testString = 'Test avec "guillemets" et ; point-virgule';
    console.log('Test échappement:', testString, '->', escapeCSV(testString));
    
    // Tester avec les vraies données
    const testData = filteredSubmissions.slice(0, 2);
    const headers = ['ID', 'Participant', 'Challenge', 'Score'];
    const data = testData.map(sub => [
        sub.id,
        escapeCSV(sub.userName),
        escapeCSV(sub.challengeName),
        sub.score
    ]);
    
    const BOM = '\uFEFF';
    let csvContent = BOM + headers.join(';') + '\r\n';
    data.forEach(row => {
        csvContent += row.join(';') + '\r\n';
    });
    
    console.log('Contenu test généré:', csvContent);
    
    // Télécharger le test
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    link.download = 'test_export.csv';
    link.style.cssText = 'display: none';
    
    document.body.appendChild(link);
    link.click();
    
    setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, 100);
    
    showNotification('Test CSV terminé', 'success');
}

function logout() {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
        window.location.href = 'index.html';
    }
}

// Fonctions utilitaires
function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        return dateString;
    }
}

function getInitials(name) {
    if (!name) return 'NN';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 3);
}

// Exposer les fonctions globales
window.searchSubmissions = searchSubmissions;
window.filterSubmissions = filterSubmissions;
window.sortSubmissions = sortSubmissions;
window.clearFilters = clearFilters;
window.changePage = changePage;
window.quickAction = quickAction;
window.closeQuickActionModal = closeQuickActionModal;
window.acceptSubmission = acceptSubmission;
window.rejectSubmission = rejectSubmission;
window.runSingleTest = runSingleTest;
window.viewDetails = viewDetails;
window.deleteSubmission = deleteSubmission;
window.runTests = runTests;
window.exportToCSV = exportToCSV;
window.exportToPDF = exportToPDF;
window.refreshData = refreshData;
window.testCSVExport = testCSVExport;
window.logout = logout;