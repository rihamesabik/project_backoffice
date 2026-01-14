// Main JavaScript file - handles navigation, authentication, and common functionality

class MainApp {
    constructor() {
        this.currentUser = null;
        this.language = 'fr';
        this.init();
    }

    init() {
        this.checkAuth();
        this.setupEventListeners();
        this.loadTranslations();
        this.setupLoginForm();
    }

    setupLoginForm() {
        const loginForm = document.getElementById('loginForm');
        if (!loginForm) return;

        // Supprimer tout écouteur existant
        const newForm = loginForm.cloneNode(true);
        loginForm.parentNode.replaceChild(newForm, loginForm);
        
        // Réattacher les écouteurs
        const form = document.getElementById('loginForm');
        
        // UN SEUL écouteur de submit
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });
        
        // Clear errors on input
        document.querySelectorAll('#username, #password').forEach(input => {
            input.addEventListener('input', () => {
                document.getElementById(`${input.id}Error`).textContent = '';
            });
        });
        
        // Auto-focus username
        const usernameInput = document.getElementById('username');
        if (usernameInput) {
            setTimeout(() => usernameInput.focus(), 100);
        }
        
        // Enter key to submit
        document.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && (document.activeElement === usernameInput || 
                                      document.activeElement === document.getElementById('password'))) {
                e.preventDefault();
                this.handleLogin();
            }
        });
    }

    handleLogin() {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('rememberMe')?.checked || false;
        
        // Clear previous errors
        document.getElementById('userError').textContent = '';
        document.getElementById('passError').textContent = '';
        
        // Validation
        let isValid = true;
        
        if (!username) {
            document.getElementById('userError').textContent = 'L\'identifiant terminal est requis';
            document.getElementById('username').focus();
            isValid = false;
        }
        
        if (!password) {
            document.getElementById('passError').textContent = 'La clé de chiffrement est requise';
            if (isValid) document.getElementById('password').focus();
            isValid = false;
        }
        
        if (!isValid) return;
        
        // Show loading
        this.showLoading();
        
        // Simulation d'authentification
        setTimeout(() => {
            // Simple authentication (admin/admin)
            if (username === 'admin' && password === 'admin') {
                // Sauvegarder l'état de connexion
                localStorage.setItem('codinghub_logged_in', 'true');
                localStorage.setItem('codinghub_username', username);
                localStorage.setItem('codinghub_fullname', 'Admin User');
                
                if (rememberMe) {
                    localStorage.setItem('codinghub_remember', 'true');
                } else {
                    localStorage.removeItem('codinghub_remember');
                }
                
                this.hideLoading();
                this.showToast('Authentification réussie. Redirection...', 'success');
                
                // Redirection vers dashboard
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
                
            } else {
                this.hideLoading();
                document.getElementById('passError').textContent = 'Identifiants de connexion invalides';
                document.getElementById('password').focus();
                document.getElementById('password').select();
                
                // Shake animation pour l'erreur
                this.triggerShakeAnimation();
            }
        }, 800);
    }

    triggerShakeAnimation() {
        const loginCard = document.querySelector('.login-card');
        if (!loginCard) return;
        
        // Créer et ajouter l'animation shake
        const style = document.createElement('style');
        style.textContent = `
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                20%, 40%, 60%, 80% { transform: translateX(5px); }
            }
        `;
        document.head.appendChild(style);
        
        // Déclencher l'animation
        loginCard.style.animation = 'none';
        setTimeout(() => {
            loginCard.style.animation = 'shake 0.5s ease-in-out';
        }, 10);
        
        // Nettoyer après l'animation
        setTimeout(() => {
            loginCard.style.animation = '';
            style.remove();
        }, 500);
    }

    loadNavbar() {
        const navbarContainer = document.getElementById('navbar-container');
        if (!navbarContainer) return;

        const navbarHTML = `
            <nav class="navbar">
                <div class="navbar-left">
                    <h2 id="page-title">Tableau de bord</h2>
                </div>
                <div class="navbar-right">
                    <div class="navbar-controls">
                        <select id="language-select" class="language-select">
                            <option value="fr">🇫🇷 Français</option>
                            <option value="en">🇬🇧 English</option>
                            <option value="ar">🇸🇦 العربية</option>
                        </select>
                      
                       
                    </div>
                </div>
            </nav>
        `;
        
        navbarContainer.innerHTML = navbarHTML;
        this.setupNavbarEvents();
    }

  
checkAuth() {
    const isLoggedIn = localStorage.getItem('codinghub_logged_in') === 'true';
    const currentPage = window.location.pathname;
    
    console.log("🔍 Debug Netlify:", {
        isLoggedIn,
        currentPage,
        fullURL: window.location.href
    });

    // Liste des pages protégées
    const protectedPages = ['/dashboard', '/users', '/challenges', 
                           '/submissions', '/categories', '/rankings', '/settings'];
    
    const isProtectedPage = protectedPages.some(page => currentPage.includes(page));
    const isLoginPage = currentPage === '/' || currentPage === '' || 
                       currentPage.includes('index.html');

    // CAS 1: SUR LA PAGE DE LOGIN
    if (isLoginPage) {
        // NE RIEN FAIRE - laisser l'utilisateur voir la page de login
        // Même s'il est déjà connecté
        console.log("📄 Affichage de la page de login");
        return;
    }
    
    // CAS 2: Page protégée SANS être connecté
    if (isProtectedPage && !isLoggedIn) {
        console.log("🚫 Accès refusé, redirection vers login");
        window.location.href = '/';
        return;
    }
    
    // CAS 3: Connecté sur page protégée → charger navbar
    if (isLoggedIn && isProtectedPage) {
        console.log("✅ Utilisateur connecté, chargement navbar");
        this.loadNavbar();
        this.setupNavigation();
    }
}


    setupNavbarEvents() {
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }

        const languageSelect = document.getElementById('language-select');
        if (languageSelect) {
            languageSelect.value = this.language;
            languageSelect.addEventListener('change', (e) => {
                this.changeLanguage(e.target.value);
            });
        }
        
        // Notification button
        const notificationBtn = document.querySelector('.notification-btn');
        if (notificationBtn) {
            notificationBtn.addEventListener('click', () => {
                this.showToast('Vous avez 3 notifications non lues', 'info');
            });
        }
    }

    setupNavigation() {
        const menuItems = document.querySelectorAll('.menu li');
        menuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const page = item.dataset.page;
                this.navigateTo(page, e);
            });
        });
    }

    navigateTo(page, event) {
        // Remove active class from all menu items
        document.querySelectorAll('.menu li').forEach(li => li.classList.remove('active'));
        // Add active class to clicked item
        event.currentTarget.classList.add('active');
        
        // Update page title
        const pageTitles = {
            'dashboard': 'Tableau de bord',
            'challenges': 'Challenges',
            'users': 'Participants',
            'submissions': 'Soumissions',
            'categories': 'Catégories',
            'rankings': 'Classement',
            'settings': 'Paramètres'
        };
        
        const pageTitle = document.getElementById('page-title');
        if (pageTitle && pageTitles[page]) {
            pageTitle.textContent = pageTitles[page];
        }
        
        // Rediriger vers la page HTML correspondante
        if (page !== 'dashboard') {
            window.location.href = `${page}.html`;
        }
    }

    setupEventListeners() {
        // Language selector on login page
        const loginLanguageSelect = document.querySelector('.language-selector select');
        if (loginLanguageSelect) {
            loginLanguageSelect.addEventListener('change', (e) => {
                this.changeLanguage(e.target.value);
            });
        }
        
        // Auto-fill demo credentials on double click
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        
        if (usernameInput && passwordInput) {
            usernameInput.addEventListener('dblclick', () => {
                usernameInput.value = 'admin';
                passwordInput.value = 'admin';
                this.showToast('Identifiants de démo chargés', 'info');
            });
        }
    }

    logout() {
        // Confirm logout
        if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
            localStorage.removeItem('codinghub_logged_in');
            localStorage.removeItem('codinghub_username');
            localStorage.removeItem('codinghub_fullname');
            localStorage.removeItem('codinghub_remember');
            window.location.href = 'index.html';
        }
    }

    changeLanguage(lang) {
        this.language = lang;
        localStorage.setItem('codinghub_language', lang);
        this.loadTranslations();
    }

    loadTranslations() {
        const lang = localStorage.getItem('codinghub_language') || 'fr';
        this.language = lang;
        
        // Update language selector
        const languageSelects = document.querySelectorAll('#language-select, .language-selector select');
        languageSelects.forEach(select => {
            if (select) select.value = lang;
        });
        
        // Apply translations
        this.applyTranslations(lang);
    }

    applyTranslations(lang) {
        const translations = {
            fr: {
                'login.title': 'Connexion',
                'login.username': 'Identifiant terminal',
                'login.password': 'Clé de chiffrement',
                'login.remember': 'Se souvenir de cette session',
                'login.button': 'Exécuter connexion',
                'login.hint': 'Identifiants par défaut : admin / admin',
                'login.error.required': 'Ce champ est requis',
                'login.error.invalid': 'Identifiants invalides',
                'dashboard.title': 'Tableau de bord',
                'users.title': 'Participants',
                'challenges.title': 'Challenges',
                'submissions.title': 'Soumissions',
                'categories.title': 'Catégories',
                'rankings.title': 'Classement',
                'settings.title': 'Paramètres'
            },
            en: {
                'login.title': 'Login',
                'login.username': 'Terminal ID',
                'login.password': 'Encryption Key',
                'login.remember': 'Remember this session',
                'login.button': 'Execute Login',
                'login.hint': 'Default credentials: admin / admin',
                'login.error.required': 'This field is required',
                'login.error.invalid': 'Invalid credentials',
                'dashboard.title': 'Dashboard',
                'users.title': 'Users',
                'challenges.title': 'Challenges',
                'submissions.title': 'Submissions',
                'categories.title': 'Categories',
                'rankings.title': 'Rankings',
                'settings.title': 'Settings'
            },
            ar: {
                'login.title': 'تسجيل الدخول',
                'login.username': 'معرف المحطة',
                'login.password': 'مفتاح التشفير',
                'login.remember': 'تذكر هذه الجلسة',
                'login.button': 'تنفيذ الاتصال',
                'login.hint': 'بيانات الاعتماد الافتراضية: admin / admin',
                'login.error.required': 'هذا الحقل مطلوب',
                'login.error.invalid': 'بيانات الاعتماد غير صالحة',
                'dashboard.title': 'لوحة التحكم',
                'users.title': 'المستخدمين',
                'challenges.title': 'التحديات',
                'submissions.title': 'التقديمات',
                'categories.title': 'الفئات',
                'rankings.title': 'التصنيفات',
                'settings.title': 'الإعدادات'
            }
        };
        
        const translation = translations[lang];
        if (!translation) return;
        
        // Apply translations to elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (translation[key]) {
                element.textContent = translation[key];
            }
        });
        
        // Apply translations to login page elements
        if (document.getElementById('username')) {
            const usernameLabel = document.querySelector('label[for="username"]');
            if (usernameLabel) usernameLabel.textContent = translation['login.username'];
            
            const passwordLabel = document.querySelector('label[for="password"]');
            if (passwordLabel) passwordLabel.textContent = translation['login.password'];
            
            const rememberLabel = document.querySelector('label[for="rememberMe"]');
            if (rememberLabel) rememberLabel.textContent = translation['login.remember'];
            
            const loginButton = document.querySelector('.btn-login');
            if (loginButton) {
                loginButton.innerHTML = `<i class="fas fa-terminal me-2"></i>${translation['login.button']} &gt;`;
            }
            
            const hint = document.querySelector('.hint');
            if (hint) {
                hint.textContent = translation['login.hint'];
            }
            
            // Update page title
            document.title = `CodingHub | ${translation['login.title']}`;
        }
    }

    // Utility functions
    showLoading() {
        // Supprimer les loaders existants
        this.hideLoading();
        
        const loader = document.createElement('div');
        loader.className = 'loading-overlay';
        loader.innerHTML = '<div class="spinner"></div>';
        document.body.appendChild(loader);
    }

    hideLoading() {
        const loader = document.querySelector('.loading-overlay');
        if (loader) loader.remove();
    }

    showToast(message, type = 'success') {
        // Remove existing toasts
        document.querySelectorAll('.toast').forEach(toast => toast.remove());
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icons = {
            'success': 'check-circle',
            'error': 'exclamation-circle',
            'warning': 'exclamation-triangle',
            'info': 'info-circle'
        };
        
        toast.innerHTML = `
            <i class="fas fa-${icons[type] || 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(toast);
        
        // Animation d'entrée
        setTimeout(() => toast.classList.add('show'), 10);
        
        // Auto-remove après 3 secondes
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.App = new MainApp();
});

// Fonctions utilitaires communes

// Formater une date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

// Générer les initiales à partir d'un nom
function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

// Vérifier si un élément est visible dans le viewport
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// Débouncer une fonction
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Copier du texte dans le presse-papier
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Texte copié dans le presse-papier', 'success');
    }).catch(err => {
        console.error('Erreur lors de la copie:', err);
        showNotification('Erreur lors de la copie', 'error');
    });
}

// Afficher une notification
function showNotification(message, type = 'info') {
    // Vérifier s'il existe déjà une notification
    const existingNotification = document.querySelector('.global-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `global-notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    document.body.appendChild(notification);
    
    // Animation d'entrée
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Supprimer automatiquement après 5 secondes
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 5000);
}

function getNotificationIcon(type) {
    switch(type) {
        case 'success': return 'check-circle';
        case 'error': return 'exclamation-circle';
        case 'warning': return 'exclamation-triangle';
        default: return 'info-circle';
    }
}

// Ajouter le CSS pour les notifications globales
const notificationStyles = `
    .global-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        transform: translateX(120%);
        transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 15px;
        min-width: 300px;
        max-width: 400px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        backdrop-filter: blur(10px);
    }
    
    .global-notification.show {
        transform: translateX(0);
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 12px;
        flex: 1;
    }
    
    .notification-content i {
        font-size: 20px;
        flex-shrink: 0;
    }
    
    .notification-close {
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        flex-shrink: 0;
        transition: all 0.3s ease;
    }
    
    .notification-close:hover {
        background: rgba(255, 255, 255, 0.3);
        transform: rotate(90deg);
    }
    
    .notification-success {
        background: linear-gradient(135deg, #40c057, #2b8a3e);
    }
    
    .notification-error {
        background: linear-gradient(135deg, #fa5252, #c92a2a);
    }
    
    .notification-warning {
        background: linear-gradient(135deg, #ff922b, #e67700);
    }
    
    .notification-info {
        background: linear-gradient(135deg, #4dabf7, #339af0);
    }
`;

// Injecter les styles des notifications
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);

// Dans main.js - ajoutez si manquant
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

// Synchroniser le profil au chargement de CHAQUE page
function syncProfileOnLoad() {
    const saved = localStorage.getItem('codinghub_profile');
    if (saved) {
        try {
            const profile = JSON.parse(saved);
            
            // Mettre à jour la sidebar
            const avatar = document.querySelector('.user-profile .user-avatar');
            const name = document.querySelector('.user-info h3');
            const role = document.querySelector('.user-info p');
            
            if (avatar) avatar.textContent = profile.avatar || 'JD';
            if (name) name.textContent = profile.fullName || 'Jane Doe';
            if (role) role.textContent = profile.role || 'Super Admin';
            
            // Appliquer la langue
            if (profile.language) {
                document.documentElement.lang = profile.language;
            }
            
        } catch (e) {
            console.error("Erreur de synchronisation:", e);
        }
    }
}

// Écouter les mises à jour du profil
window.addEventListener('profileUpdated', function(e) {
    console.log("🔄 Profil mis à jour globalement");
    
    const profile = e.detail;
    
    // Mettre à jour la sidebar
    const avatar = document.querySelector('.user-profile .user-avatar');
    const name = document.querySelector('.user-info h3');
    const role = document.querySelector('.user-info p');
    
    if (avatar) avatar.textContent = profile.avatar;
    if (name) name.textContent = profile.fullName;
    if (role) role.textContent = profile.role;
    
    // Mettre à jour la langue
    if (profile.language) {
        document.documentElement.lang = profile.language;
    }
});

// Synchroniser au chargement
document.addEventListener('DOMContentLoaded', function() {
    syncProfileOnLoad();
});

// Synchroniser quand le localStorage change (autres onglets)
window.addEventListener('storage', function(e) {
    if (e.key === 'codinghub_profile') {
        syncProfileOnLoad();
    }
});