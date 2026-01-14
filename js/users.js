let users = [];
let filteredUsers = [];
let currentPage = 1;
const itemsPerPage = 8;
let userToDelete = null;

// Initialisation
document.addEventListener('DOMContentLoaded', async function() {
    await loadUsers();
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
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', deleteUser);
    }
}

// Charger les utilisateurs depuis le fichier JSON
async function loadUsers() {
    try {
        const response = await fetch('data/users.json');
        if (!response.ok) {
            throw new Error('Erreur de chargement des données');
        }
        const data = await response.json();
        users = data.users || [];
        filteredUsers = [...users];
        displayUsers();
        updateStats();
    } catch (error) {
        console.error('Erreur:', error);
        showError('Impossible de charger les participants');
        // Fallback aux données de test
        users = getFallbackUsers();
        filteredUsers = [...users];
        displayUsers();
        updateStats();
    }
}

// Fallback si le fichier JSON ne peut être chargé
function getFallbackUsers() {
    return [
        { id: 1, name: "Sophie Martin", email: "sophie.martin@email.com", level: "expert", points: 2458, role: "participant", status: "actif" },
        { id: 2, name: "Lucas Dubois", email: "lucas.dubois@email.com", level: "avancé", points: 2318, role: "participant", status: "actif" },
        { id: 3, name: "Emma Bernard", email: "emma.bernard@email.com", level: "avancé", points: 2185, role: "participant", status: "actif" },
        { id: 4, name: "Thomas Petit", email: "thomas.petit@email.com", level: "intermédiaire", points: 1958, role: "participant", status: "actif" },
        { id: 5, name: "Julie Roux", email: "julie.roux@email.com", level: "intermédiaire", points: 1898, role: "participant", status: "actif" },
        { id: 6, name: "Alexandre Laurent", email: "alex.laurent@email.com", level: "débutant", points: 1250, role: "participant", status: "actif" },
        { id: 7, name: "Marie Chen", email: "marie.chen@email.com", level: "expert", points: 2750, role: "admin", status: "actif" },
        { id: 8, name: "Pierre Dubois", email: "pierre.dubois@email.com", level: "avancé", points: 2100, role: "participant", status: "inactif" },
        { id: 9, name: "Camille Leroy", email: "camille.leroy@email.com", level: "intermédiaire", points: 1650, role: "participant", status: "actif" },
        { id: 10, name: "Hugo Moreau", email: "hugo.moreau@email.com", level: "débutant", points: 950, role: "participant", status: "actif" }
    ];
}

function displayUsers() {
    const tableBody = document.getElementById('usersTableBody');
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const usersToDisplay = filteredUsers.slice(startIndex, endIndex);
    
    if (!tableBody) return;
    
    if (usersToDisplay.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">
                    <div class="empty-state">
                        <i class="fas fa-users-slash" style="font-size: 48px; margin-bottom: 15px; display: block; color: #adb5bd;"></i>
                        <h3 style="margin-bottom: 10px; color: #495057;">Aucun participant trouvé</h3>
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
    
    usersToDisplay.forEach(user => {
        // Badge niveau
        let levelBadge = '';
        switch(user.level) {
            case 'débutant': levelBadge = '<span class="badge badge-primary">Débutant</span>'; break;
            case 'intermédiaire': levelBadge = '<span class="badge badge-success">Intermédiaire</span>'; break;
            case 'avancé': levelBadge = '<span class="badge badge-warning">Avancé</span>'; break;
            case 'expert': levelBadge = '<span class="badge badge-danger">Expert</span>'; break;
        }
        
        const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();
        
        tableHTML += `
            <tr>
                <td>#${user.id}</td>
                <td>
                    <div class="user-cell">
                        <div class="user-avatar-small">${initials}</div>
                        <div>
                            <div class="user-name">${user.name}</div>
                            <small class="text-muted">${user.status === 'actif' ? 'Actif' : 'Inactif'}</small>
                        </div>
                    </div>
                </td>
                <td>${user.email}</td>
                <td>${levelBadge}</td>
                <td><strong class="points">${user.points}</strong></td>
                <td>
                    <span class="badge ${user.role === 'admin' ? 'badge-danger' : 'badge-primary'}">
                        ${user.role === 'admin' ? 'Admin' : 'Participant'}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-action btn-view" onclick="viewUser(${user.id})" title="Voir détails">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-action btn-edit" onclick="editUser(${user.id})" title="Modifier">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-action btn-delete" onclick="confirmDelete(${user.id})" title="Supprimer">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = tableHTML;
    setupPagination();
    updateTableInfo();
}

function updateStats() {
    const totalUsers = document.getElementById('totalUsers');
    const activeUsers = document.getElementById('activeUsers');
    const avgPoints = document.getElementById('avgPoints');
    const topScore = document.getElementById('topScore');
    
    if (totalUsers) totalUsers.textContent = users.length;
    
    if (activeUsers) {
        const activeCount = users.filter(u => u.status === 'actif').length;
        activeUsers.textContent = activeCount;
    }
    
    if (avgPoints) {
        const avg = users.length > 0 ? 
            Math.round(users.reduce((sum, u) => sum + u.points, 0) / users.length) : 0;
        avgPoints.textContent = avg;
    }
    
    if (topScore) {
        const maxScore = users.length > 0 ? Math.max(...users.map(u => u.points)) : 0;
        topScore.textContent = maxScore;
    }
}

function updateTableInfo() {
    const tableInfo = document.getElementById('tableInfo');
    if (tableInfo) {
        const start = (currentPage - 1) * itemsPerPage + 1;
        const end = Math.min(currentPage * itemsPerPage, filteredUsers.length);
        const total = filteredUsers.length;
        tableInfo.textContent = `${start}-${end} sur ${total} participants`;
    }
}

function searchUsers() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    
    const searchTerm = searchInput.value.toLowerCase();
    filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm)
    );
    currentPage = 1;
    displayUsers();
}

function filterUsers() {
    const levelFilter = document.getElementById('levelFilter');
    const roleFilter = document.getElementById('roleFilter');
    const searchInput = document.getElementById('searchInput');
    
    if (!levelFilter || !roleFilter || !searchInput) return;
    
    const levelValue = levelFilter.value;
    const roleValue = roleFilter.value;
    const searchTerm = searchInput.value.toLowerCase();
    
    filteredUsers = users.filter(user => {
        const matchesSearch = !searchTerm || 
            user.name.toLowerCase().includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm);
        const matchesLevel = !levelValue || user.level === levelValue;
        const matchesRole = !roleValue || user.role === roleValue;
        return matchesSearch && matchesLevel && matchesRole;
    });
    
    currentPage = 1;
    displayUsers();
}

function sortUsers() {
    const sortSelect = document.getElementById('sortSelect');
    if (!sortSelect) return;
    
    const sortBy = sortSelect.value;
    
    filteredUsers.sort((a, b) => {
        switch(sortBy) {
            case 'name': return a.name.localeCompare(b.name);
            case 'points-desc': return b.points - a.points;
            case 'points-asc': return a.points - b.points;
            case 'level': 
                const levels = { 'débutant': 0, 'intermédiaire': 1, 'avancé': 2, 'expert': 3 };
                return levels[b.level] - levels[a.level];
            default: return 0;
        }
    });
    
    displayUsers();
}

function clearFilters() {
    const searchInput = document.getElementById('searchInput');
    const levelFilter = document.getElementById('levelFilter');
    const roleFilter = document.getElementById('roleFilter');
    const sortSelect = document.getElementById('sortSelect');
    
    if (searchInput) searchInput.value = '';
    if (levelFilter) levelFilter.value = '';
    if (roleFilter) roleFilter.value = '';
    if (sortSelect) sortSelect.value = 'name';
    
    filteredUsers = [...users];
    currentPage = 1;
    displayUsers();
}

function setupPagination() {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;
    
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    
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
    if (page < 1 || page > Math.ceil(filteredUsers.length / itemsPerPage)) return;
    currentPage = page;
    displayUsers();
}

// Modals
function showAddUserModal() {
    const modalTitle = document.getElementById('modalTitle');
    const modalSaveBtn = document.getElementById('modalSaveBtn');
    const userForm = document.getElementById('userForm');
    const userModal = document.getElementById('userModal');
    
    if (!modalTitle || !modalSaveBtn || !userForm || !userModal) return;
    
    modalTitle.textContent = 'Ajouter Participant';
    modalSaveBtn.textContent = 'Ajouter';
    userForm.reset();
    document.getElementById('userId').value = '';
    userModal.style.display = 'flex';
}

function editUser(id) {
    const user = users.find(u => u.id === id);
    if (!user) return;
    
    const modalTitle = document.getElementById('modalTitle');
    const modalSaveBtn = document.getElementById('modalSaveBtn');
    const userModal = document.getElementById('userModal');
    
    if (!modalTitle || !modalSaveBtn || !userModal) return;
    
    modalTitle.textContent = 'Modifier Participant';
    modalSaveBtn.textContent = 'Mettre à jour';
    document.getElementById('userId').value = user.id;
    document.getElementById('userName').value = user.name;
    document.getElementById('userEmail').value = user.email;
    document.getElementById('userLevel').value = user.level;
    document.getElementById('userPoints').value = user.points;
    document.getElementById('userRole').value = user.role;
    userModal.style.display = 'flex';
}

function closeModal() {
    const userModal = document.getElementById('userModal');
    if (userModal) {
        userModal.style.display = 'none';
    }
}

function saveUser() {
    const id = document.getElementById('userId')?.value;
    const name = document.getElementById('userName')?.value;
    const email = document.getElementById('userEmail')?.value;
    const level = document.getElementById('userLevel')?.value;
    const points = parseInt(document.getElementById('userPoints')?.value || '0');
    const role = document.getElementById('userRole')?.value;
    
    if (!name || !email) {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
    }
    
    if (id) {
        // Mise à jour
        const index = users.findIndex(u => u.id === parseInt(id));
        if (index !== -1) {
            users[index] = { ...users[index], name, email, level, points, role };
        }
        showNotification('Participant mis à jour', 'success');
    } else {
        // Ajout
        const newUser = {
            id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
            name, email, level, points, role,
            status: 'actif',
            bio: '',
            joinDate: new Date().toISOString().split('T')[0],
            lastActive: new Date().toISOString().split('T')[0],
            totalChallenges: 0,
            completedChallenges: 0,
            successRate: 0,
            submissions: [],
            achievements: []
        };
        users.push(newUser);
        showNotification('Participant ajouté', 'success');
    }
    
    filteredUsers = [...users];
    displayUsers();
    updateStats();
    closeModal();
}

function confirmDelete(id) {
    const user = users.find(u => u.id === id);
    if (!user) return;
    
    userToDelete = id;
    const confirmMessage = document.getElementById('confirmMessage');
    const confirmModal = document.getElementById('confirmModal');
    
    if (confirmMessage) {
        confirmMessage.textContent = `Êtes-vous sûr de vouloir supprimer le participant "${user.name}" ?`;
    }
    if (confirmModal) {
        confirmModal.style.display = 'flex';
    }
}

function closeConfirmModal() {
    const confirmModal = document.getElementById('confirmModal');
    if (confirmModal) {
        confirmModal.style.display = 'none';
    }
    userToDelete = null;
}

function deleteUser() {
    if (!userToDelete) return;
    
    const index = users.findIndex(u => u.id === userToDelete);
    if (index !== -1) {
        users.splice(index, 1);
        filteredUsers = filteredUsers.filter(u => u.id !== userToDelete);
        displayUsers();
        updateStats();
        showNotification('Participant supprimé', 'success');
    }
    
    closeConfirmModal();
}

function viewUser(id) {
    window.location.href = `user-details.html?id=${id}`;
}

function refreshData() {
    loadUsers();
    showNotification('Données actualisées', 'info');
}

function exportToCSV() {
    if (filteredUsers.length === 0) {
        showNotification('Aucune donnée à exporter', 'warning');
        return;
    }
    
    const headers = ['ID', 'Nom', 'Email', 'Niveau', 'Points', 'Rôle', 'Statut'];
    const data = filteredUsers.map(user => [
        user.id,
        user.name,
        user.email,
        user.level,
        user.points,
        user.role,
        user.status
    ]);
    
    let csvContent = 'data:text/csv;charset=utf-8,' + headers.join(';') + '\n';
    data.forEach(row => csvContent += row.join(';') + '\n');
    
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `participants_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('Export CSV terminé', 'success');
}

function showNotification(message, type = 'info') {
    // Créer une notification simple
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    
    switch(type) {
        case 'success':
            notification.style.background = 'linear-gradient(135deg, #40c057, #2b8a3e)';
            break;
        case 'error':
            notification.style.background = 'linear-gradient(135deg, #fa5252, #c92a2a)';
            break;
        case 'warning':
            notification.style.background = 'linear-gradient(135deg, #ff922b, #e67700)';
            break;
        default:
            notification.style.background = 'linear-gradient(135deg, #4dabf7, #339af0)';
    }
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out forwards';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function showError(message) {
    showNotification(message, 'error');
}

function logout() {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
        window.location.href = 'index.html';
    }
}

// Ajouter le CSS pour les animations de notification
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
    
    .page-dots {
        padding: 0 10px;
        color: #6c757d;
    }
`;
document.head.appendChild(style);

// Exposer les fonctions globales
window.showAddUserModal = showAddUserModal;
window.searchUsers = searchUsers;
window.filterUsers = filterUsers;
window.sortUsers = sortUsers;
window.clearFilters = clearFilters;
window.changePage = changePage;
window.editUser = editUser;
window.confirmDelete = confirmDelete;
window.closeModal = closeModal;
window.closeConfirmModal = closeConfirmModal;
window.saveUser = saveUser;
window.viewUser = viewUser;
window.refreshData = refreshData;
window.exportToCSV = exportToCSV;
window.logout = logout;