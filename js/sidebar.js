// sidebar.js - Logique réutilisable pour la sidebar
// Dans sidebar.js
function loadUserProfile() {
    // Essayer d'abord le profil settings
    const profile = localStorage.getItem('codinghub_profile');
    let username, fullname, role, avatar;
    
    if (profile) {
        try {
            const profileData = JSON.parse(profile);
            fullname = profileData.fullName || 'Admin';
            role = profileData.role || 'Administrateur';
            avatar = profileData.avatar || 'AD';
            username = profileData.email ? profileData.email.split('@')[0] : 'admin';
        } catch (e) {
            console.error('Erreur parsing profile:', e);
        }
    }
    
    // Fallback aux anciennes clés
    username = username || localStorage.getItem('codinghub_username') || 'admin';
    fullname = fullname || localStorage.getItem('codinghub_fullname') || 'Administrateur';
    role = role || localStorage.getItem('codinghub_role') || 'Administrateur';
    avatar = avatar || 'AD';
    
    // Mettre à jour l'avatar avec les initiales
    const avatarEl = document.querySelector('.user-avatar');
    if (avatarEl) {
        avatarEl.textContent = avatar;
    }
    
    // Mettre à jour les informations
    const usernameEl = document.querySelector('.user-info h3');
    const roleEl = document.querySelector('.user-info p');
    
    if (usernameEl) usernameEl.textContent = fullname;
    if (roleEl) roleEl.textContent = role;
}
// Fonction pour charger la sidebar dans une page
function loadSidebar() {
    // Vérifier si la sidebar n'est pas déjà chargée
    if (!document.getElementById('sidebar')) {
        // Créer une requête pour charger sidebar.html
        fetch('sidebar.html')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Impossible de charger la sidebar');
                }
                return response.text();
            })
            .then(html => {
                // Insérer la sidebar au début du body
                document.body.insertAdjacentHTML('afterbegin', html);
                
                // Charger le CSS de la sidebar
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = 'css/sidebar.css';
                document.head.appendChild(link);
                
                // Initialiser la sidebar
                initSidebar();
            })
            .catch(error => {
                console.error('Erreur lors du chargement de la sidebar:', error);
                // Fallback: créer la sidebar manuellement
                createFallbackSidebar();
            });
    } else {
        // Si la sidebar est déjà présente, juste l'initialiser
        initSidebar();
    }
}

// Fallback si sidebar.html n'est pas trouvé
function createFallbackSidebar() {
    const sidebarHTML = `
        <div class="sidebar" id="sidebar">
            <div class="logo">
                <i class="fas fa-code"></i>
                <h1>CodingHub</h1>
            </div>
            
            <ul class="menu" id="main-menu">
                <li data-page="dashboard">
                    <i class="fas fa-tachometer-alt"></i>
                    <span>Tableau de bord</span>
                </li>
                <li data-page="challenges">
                    <i class="fas fa-tasks"></i>
                    <span>Challenges</span>
                </li>
                <li data-page="users">
                    <i class="fas fa-users"></i>
                    <span>Participants</span>
                </li>
                <li data-page="submissions">
                    <i class="fas fa-paper-plane"></i>
                    <span>Soumissions</span>
                </li>
                <li data-page="categories">
                    <i class="fas fa-folder"></i>
                    <span>Catégories</span>
                </li>
                <li data-page="rankings">
                    <i class="fas fa-trophy"></i>
                    <span>Classement</span>
                </li>
                <li data-page="settings">
                    <i class="fas fa-cog"></i>
                    <span>Paramètres</span>
                </li>
            </ul>
            
            <div class="user-profile">
                <div class="user-avatar" id="sidebar-avatar">Ad</div>
                <div class="user-info">
                    <h3 id="sidebar-username">Admin</h3>
                    <p id="sidebar-role">Administrateur</p>
                </div>
                <button class="logout-btn-sidebar" id="logout-sidebar-btn" title="Déconnexion">
                    <i class="fas fa-sign-out-alt"></i>
                </button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('afterbegin', sidebarHTML);
    initSidebar();
}

// Initialiser la sidebar
function initSidebar() {
    updateActiveMenuItem();
    setupSidebarEvents();
    loadUserProfile();
}

// Mettre à jour l'élément de menu actif
function updateActiveMenuItem() {
    // Obtenir le nom de la page actuelle
    const currentPage = window.location.pathname.split('/').pop().replace('.html', '') || 'dashboard';
    
    // Retirer la classe active de tous les éléments
    document.querySelectorAll('.menu li').forEach(li => {
        li.classList.remove('active');
    });
    
    // Ajouter la classe active à l'élément correspondant
    const activeItem = document.querySelector(`.menu li[data-page="${currentPage}"]`);
    if (activeItem) {
        activeItem.classList.add('active');
    }
}

// Configurer les événements de la sidebar
function setupSidebarEvents() {
    // Navigation du menu
    document.querySelectorAll('.menu li').forEach(item => {
        item.addEventListener('click', function() {
            const page = this.getAttribute('data-page');
            if (page) {
                navigateToPage(page);
            }
        });
    });
    
    // Déconnexion depuis la sidebar
    const logoutBtn = document.getElementById('logout-sidebar-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Navigation au clavier
    document.addEventListener('keydown', (e) => {
        if (e.altKey) {
            switch(e.key) {
                case '1':
                    navigateToPage('dashboard');
                    break;
                case '2':
                    navigateToPage('challenges');
                    break;
                case '3':
                    navigateToPage('users');
                    break;
                case '4':
                    navigateToPage('submissions');
                    break;
                case '5':
                    navigateToPage('categories');
                    break;
                case '6':
                    navigateToPage('rankings');
                    break;
                case '7':
                    navigateToPage('settings');
                    break;
            }
        }
    });
}

// Navigation vers une page
function navigateToPage(page) {
    // Si on est déjà sur la page, ne rien faire
    const currentPage = window.location.pathname.split('/').pop().replace('.html', '');
    if (currentPage === page) return;
    
    // Rediriger vers la page
    window.location.href = `${page}.html`;
}

// Gérer la déconnexion
function handleLogout(e) {
    e.preventDefault();
    
    // Confirmation de déconnexion
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
        // Supprimer les données de session
        localStorage.removeItem('codinghub_logged_in');
        localStorage.removeItem('codinghub_username');
        localStorage.removeItem('codinghub_fullname');
        localStorage.removeItem('codinghub_role');
        
        // Rediriger vers la page de login
        window.location.href = 'index.html';
    }
}

// Charger le profil utilisateur
function loadUserProfile() {
    const username = localStorage.getItem('codinghub_username') || 'Admin';
    const fullname = localStorage.getItem('codinghub_fullname') || 'Administrateur';
    const role = localStorage.getItem('codinghub_role') || 'Administrateur';
    
    // Mettre à jour l'avatar avec les initiales
    const avatar = document.getElementById('sidebar-avatar');
    if (avatar) {
        const initials = getInitials(fullname);
        avatar.textContent = initials;
    }
    
    // Mettre à jour les informations
    const usernameEl = document.getElementById('sidebar-username');
    const roleEl = document.getElementById('sidebar-role');
    
    if (usernameEl) usernameEl.textContent = username;
    if (roleEl) roleEl.textContent = role;
}

// Obtenir les initiales d'un nom
function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
}

// Fonction pour changer le statut de la sidebar (mobile)
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.toggle('collapsed');
        
        // Sauvegarder l'état dans localStorage
        const isCollapsed = sidebar.classList.contains('collapsed');
        localStorage.setItem('sidebar_collapsed', isCollapsed);
    }
}

// Fonction pour restaurer l'état de la sidebar
function restoreSidebarState() {
    const sidebar = document.getElementById('sidebar');
    const isCollapsed = localStorage.getItem('sidebar_collapsed') === 'true';
    
    if (sidebar && isCollapsed) {
        sidebar.classList.add('collapsed');
    }
}

// Fonction pour synchroniser le profil entre les pages
function syncUserProfile(profileData) {
    localStorage.setItem('codinghub_username', profileData.username || 'Admin');
    localStorage.setItem('codinghub_fullname', profileData.fullName || 'Administrateur');
    localStorage.setItem('codinghub_role', profileData.role || 'Administrateur');
    
    // Mettre à jour la sidebar
    loadUserProfile();
}

// Initialiser quand le DOM est chargé
document.addEventListener('DOMContentLoaded', function() {
    // Charger la sidebar sur toutes les pages sauf index.html
    const currentPage = window.location.pathname.split('/').pop();
    if (currentPage !== 'index.html' && currentPage !== '') {
        loadSidebar();
    }
    
    // Restaurer l'état de la sidebar
    restoreSidebarState();
});

// Exporter les fonctions pour une utilisation globale
window.SidebarManager = {
    loadSidebar,
    toggleSidebar,
    syncUserProfile,
    navigateToPage,
    handleLogout
};
