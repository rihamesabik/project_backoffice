// sidebar.js - Version corrigée

// Fonction pour charger la sidebar dans une page
function loadSidebar() {
    // Vérifier si la sidebar n'est pas déjà chargée
    if (!document.getElementById('sidebar')) {
        fetch('sidebar.html')
            .then(response => {
                if (!response.ok) throw new Error('Impossible de charger la sidebar');
                return response.text();
            })
            .then(html => {
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
                console.error('Erreur:', error);
                createFallbackSidebar();
            });
    } else {
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
              
            </ul>
            
            <div class="user-profile">
                <div class="user-avatar" id="sidebar-avatar">AD</div>
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
    console.log("🚀 Initialisation sidebar");
    loadUserProfile();
    updateActiveMenuItem();
    setupSidebarEvents();
    
    // Écouter les mises à jour de profil
    setupProfileListeners();
}

// Charger le profil utilisateur - CORRIGÉ
function loadUserProfile() {
    console.log("📥 Chargement du profil");
    
    // 1. Essayer de charger depuis codinghub_profile (Settings)
    const profile = localStorage.getItem('codinghub_profile');
    let fullname = 'Admin';
    let role = 'Administrateur';
    let avatar = 'AD';
    
    if (profile) {
        try {
            const profileData = JSON.parse(profile);
            fullname = profileData.fullName || 'Admin';
            role = profileData.role || 'Administrateur';
            avatar = profileData.avatar || 'AD';
            console.log("✅ Profil chargé depuis codinghub_profile:", {fullname, role, avatar});
        } catch (e) {
            console.error('❌ Erreur parsing profile:', e);
        }
    }
    
    // 2. Fallback aux anciennes clés
    if (!fullname) fullname = localStorage.getItem('codinghub_fullname') || 'Admin';
    if (!role) role = localStorage.getItem('codinghub_role') || 'Administrateur';
    
    // 3. Mettre à jour l'avatar
    const avatarEl = document.getElementById('sidebar-avatar');
    if (avatarEl) {
        avatarEl.textContent = avatar;
        console.log("✅ Avatar mis à jour:", avatar);
    } else {
        console.log("❌ Élément sidebar-avatar non trouvé");
    }
    
    // 4. Mettre à jour le nom
    const usernameEl = document.getElementById('sidebar-username');
    if (usernameEl) {
        usernameEl.textContent = fullname;
        console.log("✅ Nom mis à jour:", fullname);
    } else {
        console.log("❌ Élément sidebar-username non trouvé");
    }
    
    // 5. Mettre à jour le rôle
    const roleEl = document.getElementById('sidebar-role');
    if (roleEl) {
        roleEl.textContent = role;
        console.log("✅ Rôle mis à jour:", role);
    } else {
        console.log("❌ Élément sidebar-role non trouvé");
    }
}

// Écouter les mises à jour de profil
function setupProfileListeners() {
    // Écouter les changements de localStorage
    window.addEventListener('storage', function(e) {
        if (e.key === 'codinghub_profile') {
            console.log("📦 Changement détecté dans codinghub_profile");
            loadUserProfile();
        }
    });
    
    // Écouter les événements personnalisés
    window.addEventListener('profileUpdated', function(e) {
        if (e.detail) {
            console.log("📡 Événement profileUpdated reçu");
            // Mettre à jour localStorage puis recharger
            localStorage.setItem('codinghub_profile', JSON.stringify(e.detail));
            loadUserProfile();
        }
    });
}

// Mettre à jour l'élément de menu actif
function updateActiveMenuItem() {
    const currentPage = window.location.pathname.split('/').pop().replace('.html', '') || 'dashboard';
    
    document.querySelectorAll('.menu li').forEach(li => {
        li.classList.remove('active');
    });
    
    const activeItem = document.querySelector(`.menu li[data-page="${currentPage}"]`);
    if (activeItem) {
        activeItem.classList.add('active');
        console.log("✅ Menu actif:", currentPage);
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
    
    // Déconnexion
    const logoutBtn = document.getElementById('logout-sidebar-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}

// Navigation
function navigateToPage(page) {
    const currentPage = window.location.pathname.split('/').pop().replace('.html', '');
    if (currentPage === page) return;
    
    window.location.href = `${page}.html`;
}

// Déconnexion
function handleLogout(e) {
    e.preventDefault();
    
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
        localStorage.removeItem('codinghub_logged_in');
        localStorage.removeItem('codinghub_username');
        localStorage.removeItem('codinghub_fullname');
        localStorage.removeItem('codinghub_role');
        localStorage.removeItem('codinghub_profile'); // Supprimer aussi le profil
        
        window.location.href = 'index.html';
    }
}

// Synchroniser le profil (appelée depuis Settings)
function syncUserProfile(profileData) {
    console.log("🔄 Synchronisation du profil depuis sidebar.js");
    
    // Sauvegarder dans codinghub_profile
    localStorage.setItem('codinghub_profile', JSON.stringify(profileData));
    
    // Mettre à jour la sidebar
    loadUserProfile();
    
    // Déclencher un événement pour les autres pages
    window.dispatchEvent(new CustomEvent('profileUpdated', {
        detail: profileData
    }));
}

// Toggle sidebar mobile
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.toggle('collapsed');
        localStorage.setItem('sidebar_collapsed', sidebar.classList.contains('collapsed'));
    }
}

// Restaurer l'état de la sidebar
function restoreSidebarState() {
    const sidebar = document.getElementById('sidebar');
    const isCollapsed = localStorage.getItem('sidebar_collapsed') === 'true';
    
    if (sidebar && isCollapsed) {
        sidebar.classList.add('collapsed');
    }
}

// Initialiser quand le DOM est chargé
document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname.split('/').pop();
    
    // Ne pas charger sur login
    if (currentPage !== 'index.html' && currentPage !== '') {
        console.log("🌐 Chargement sidebar pour:", currentPage);
        loadSidebar();
    }
    
    restoreSidebarState();
});

// Exporter les fonctions
window.SidebarManager = {
    loadSidebar,
    toggleSidebar,
    syncUserProfile,
    navigateToPage,
    handleLogout
};