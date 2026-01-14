// Gestion des challenges - CRUD simple
class ChallengesCRUD {
    constructor() {
        this.challenges = [];
        this.filteredChallenges = [];
        this.currentView = 'grid'; // 'grid' ou 'table'
        this.categories = [];
        
        this.init();
    }
    
    async init() {
        // Charger les données depuis le fichier JSON
        await this.loadFromJSON();
        
        // Extraire les catégories uniques
        this.extractCategories();
        
        // Initialiser les événements
        this.setupEventListeners();
        
        // Remplir les filtres
        this.populateFilters();
        
        // Afficher les challenges
        this.renderChallenges();
        
        // Mettre à jour les statistiques
        this.updateStats();
    }
    
    // Charger les données depuis le fichier JSON
    async loadFromJSON() {
        try {
            const response = await fetch('data/challenges.json');
            
            if (!response.ok) {
                throw new Error('Erreur de chargement du fichier JSON');
            }
            
            const data = await response.json();
            this.challenges = data.challenges || [];
            
            // Si pas de données, créer des données de démo
            if (this.challenges.length === 0) {
                this.createDemoData();
            }
            
            console.log('Données chargées:', this.challenges.length, 'challenges');
            
        } catch (error) {
            console.error('Erreur:', error);
            // Créer des données de démo en cas d'erreur
            this.createDemoData();
        }
    }
    
    // Extraire les catégories uniques
    extractCategories() {
        const categoriesSet = new Set();
        this.challenges.forEach(challenge => {
            if (challenge.category) {
                categoriesSet.add(challenge.category);
            }
        });
        this.categories = Array.from(categoriesSet).sort();
    }
    
    // Créer des données de démonstration
    createDemoData() {
        this.challenges = [
            {
                "id": 1,
                "title": "Inverser une chaîne de caractères",
                "description": "Écrire une fonction qui prend une chaîne de caractères en entrée et retourne cette chaîne inversée.",
                "category": "Algorithmes",
                "difficulty": "Facile",
                "points": 10,
                "status": "Actif",
                "created_at": "2024-01-15",
                "submissions": 245,
                "success_rate": 85
            },
            {
                "id": 2,
                "title": "Trouver le plus grand élément dans un tableau",
                "description": "Implémenter une fonction qui retourne le plus grand nombre dans un tableau d'entiers.",
                "category": "Algorithmes",
                "difficulty": "Facile",
                "points": 15,
                "status": "Actif",
                "created_at": "2024-01-20",
                "submissions": 198,
                "success_rate": 78
            },
            {
                "id": 3,
                "title": "Validation de mot de passe",
                "description": "Créer une fonction qui valide si un mot de passe répond aux critères de sécurité.",
                "category": "Sécurité",
                "difficulty": "Moyen",
                "points": 25,
                "status": "Actif",
                "created_at": "2024-02-05",
                "submissions": 156,
                "success_rate": 65
            },
            {
                "id": 4,
                "title": "Calculatrice RPN",
                "description": "Implémenter une calculatrice utilisant la notation polonaise inverse.",
                "category": "Structures",
                "difficulty": "Difficile",
                "points": 50,
                "status": "Actif",
                "created_at": "2024-02-15",
                "submissions": 89,
                "success_rate": 42
            },
            {
                "id": 5,
                "title": "ToDo List en React",
                "description": "Créer une application ToDo List complète avec React et localStorage.",
                "category": "Web Dev",
                "difficulty": "Moyen",
                "points": 30,
                "status": "Actif",
                "created_at": "2024-03-01",
                "submissions": 120,
                "success_rate": 70
            }
        ];
        this.extractCategories();
    }
    
    setupEventListeners() {
        // Boutons de vue
        document.getElementById('grid-view-btn').addEventListener('click', () => {
            this.switchView('grid');
        });
        
        document.getElementById('table-view-btn').addEventListener('click', () => {
            this.switchView('table');
        });
        
        // Boutons d'ajout
        document.getElementById('add-challenge-btn').addEventListener('click', () => {
            this.openAddModal();
        });
        
        document.getElementById('add-first-challenge-btn').addEventListener('click', () => {
            this.openAddModal();
        });
        
        // Recherche
        document.getElementById('search-input').addEventListener('input', (e) => {
            this.applyFilters();
        });
        
        // Filtres
        document.getElementById('category-filter').addEventListener('change', () => {
            this.applyFilters();
        });
        
        document.getElementById('difficulty-filter').addEventListener('change', () => {
            this.applyFilters();
        });
        
        document.getElementById('status-filter').addEventListener('change', () => {
            this.applyFilters();
        });
        
        document.getElementById('clear-filters-btn').addEventListener('click', () => {
            this.clearFilters();
        });
        
        // Sauvegarde de challenge
        document.getElementById('saveChallengeBtn').addEventListener('click', () => {
            this.saveChallenge();
        });
        
        // Confirmation de suppression
        document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
            this.confirmDelete();
        });
    }
    
    populateFilters() {
        const categorySelect = document.getElementById('category-filter');
        const categoryModalSelect = document.getElementById('challengeCategory');
        
        // Ajouter l'option vide
        categorySelect.innerHTML = '<option value="">Toutes les catégories</option>';
        categoryModalSelect.innerHTML = '<option value="">Sélectionner une catégorie</option>';
        
        // Ajouter les catégories
        this.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categorySelect.appendChild(option.cloneNode(true));
            categoryModalSelect.appendChild(option);
        });
        
        // Ajouter d'autres catégories courantes
        const additionalCategories = ['Web Dev', 'Backend', 'Mobile', 'IA', 'DevOps'];
        additionalCategories.forEach(category => {
            if (!this.categories.includes(category)) {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                categoryModalSelect.appendChild(option);
            }
        });
    }
    
    switchView(view) {
        this.currentView = view;
        
        // Mettre à jour les boutons
        document.getElementById('grid-view-btn').classList.toggle('active', view === 'grid');
        document.getElementById('table-view-btn').classList.toggle('active', view === 'table');
        
        // Afficher/masquer les vues
        document.getElementById('challenges-grid-view').style.display = view === 'grid' ? 'grid' : 'none';
        document.getElementById('challenges-table-view').style.display = view === 'table' ? 'block' : 'none';
        
        this.renderChallenges();
    }
    
    applyFilters() {
        const searchTerm = document.getElementById('search-input').value.toLowerCase();
        const categoryFilter = document.getElementById('category-filter').value;
        const difficultyFilter = document.getElementById('difficulty-filter').value;
        const statusFilter = document.getElementById('status-filter').value;
        
        this.filteredChallenges = this.challenges.filter(challenge => {
            // Filtre par recherche
            const matchesSearch = searchTerm === '' || 
                challenge.title.toLowerCase().includes(searchTerm) ||
                challenge.description.toLowerCase().includes(searchTerm);
            
            // Filtre par catégorie
            const matchesCategory = categoryFilter === '' || challenge.category === categoryFilter;
            
            // Filtre par difficulté
            const matchesDifficulty = difficultyFilter === '' || challenge.difficulty === difficultyFilter;
            
            // Filtre par statut
            const matchesStatus = statusFilter === '' || challenge.status === statusFilter;
            
            return matchesSearch && matchesCategory && matchesDifficulty && matchesStatus;
        });
        
        this.renderChallenges();
    }
    
    clearFilters() {
        document.getElementById('search-input').value = '';
        document.getElementById('category-filter').value = '';
        document.getElementById('difficulty-filter').value = '';
        document.getElementById('status-filter').value = '';
        
        this.applyFilters();
    }
    
    renderChallenges() {
        // Si pas de filtrage, utiliser tous les challenges
        if (this.filteredChallenges.length === 0 && 
            document.getElementById('search-input').value === '' &&
            document.getElementById('category-filter').value === '' &&
            document.getElementById('difficulty-filter').value === '' &&
            document.getElementById('status-filter').value === '') {
            this.filteredChallenges = [...this.challenges];
        }
        
        // Afficher/masquer l'état vide
        const emptyState = document.getElementById('empty-state');
        
        if (this.filteredChallenges.length === 0) {
            emptyState.style.display = 'block';
            document.getElementById('challenges-grid-view').style.display = 'none';
            document.getElementById('challenges-table-view').style.display = 'none';
            return;
        } else {
            emptyState.style.display = 'none';
        }
        
        // Rendu selon la vue
        if (this.currentView === 'grid') {
            this.renderGridView();
        } else {
            this.renderTableView();
        }
    }
    
    renderGridView() {
        const container = document.getElementById('challenges-grid-view');
        container.innerHTML = '';
        
        this.filteredChallenges.forEach(challenge => {
            const card = this.createChallengeCard(challenge);
            container.appendChild(card);
        });
    }
    
    renderTableView() {
        const tbody = document.getElementById('challengesTableBody');
        tbody.innerHTML = '';
        
        this.filteredChallenges.forEach(challenge => {
            const row = this.createTableRow(challenge);
            tbody.appendChild(row);
        });
    }
    
    createChallengeCard(challenge) {
        const card = document.createElement('div');
        card.className = 'challenge-card';
        
        // Déterminer la couleur de la bordure basée sur la difficulté
        let borderColor = '#4a6cf7'; // Par défaut
        let difficultyClass = '';
        
        switch(challenge.difficulty) {
            case 'Facile':
                borderColor = '#28a745';
                difficultyClass = 'difficulty-easy';
                break;
            case 'Moyen':
                borderColor = '#ffc107';
                difficultyClass = 'difficulty-medium';
                break;
            case 'Difficile':
                borderColor = '#dc3545';
                difficultyClass = 'difficulty-hard';
                break;
        }
        
        card.style.borderTopColor = borderColor;
        
        // Déterminer la classe de statut
        const statusClass = challenge.status === 'Actif' ? 'status-active' : 'status-inactive';
        
        card.innerHTML = `
            <div class="challenge-card-header">
                <div class="challenge-card-title">
                    <h4>${challenge.title}</h4>
                    <div class="challenge-points">${challenge.points} pts</div>
                </div>
                <div class="challenge-meta">
                    <span class="challenge-category">${challenge.category}</span>
                    <span class="challenge-difficulty ${difficultyClass}">${challenge.difficulty}</span>
                </div>
            </div>
            <div class="challenge-card-body">
                <p class="challenge-description">${challenge.description}</p>
                <div class="challenge-stats">
                    <div class="stat-item">
                        <span class="stat-value">${challenge.submissions}</span>
                        <span class="stat-label">Soumissions</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${challenge.success_rate}%</span>
                        <span class="stat-label">Réussite</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${this.formatDate(challenge.created_at)}</span>
                        <span class="stat-label">Créé le</span>
                    </div>
                </div>
            </div>
            <div class="challenge-actions">
                <span class="status-badge ${statusClass}">${challenge.status}</span>
                <div class="action-buttons">
                    <button class="btn-action btn-view view-btn" data-id="${challenge.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-action btn-edit edit-btn" data-id="${challenge.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-action btn-delete delete-btn" data-id="${challenge.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        
        // Ajouter les événements aux boutons
        card.querySelector('.view-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.viewChallenge(challenge.id);
        });
        
        card.querySelector('.edit-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.openEditModal(challenge.id);
        });
        
        card.querySelector('.delete-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.openDeleteModal(challenge.id);
        });
        
        return card;
    }
    
    createTableRow(challenge) {
        const row = document.createElement('tr');
        
        // Déterminer la classe de difficulté
        let difficultyClass = '';
        switch(challenge.difficulty) {
            case 'Facile':
                difficultyClass = 'difficulty-easy';
                break;
            case 'Moyen':
                difficultyClass = 'difficulty-medium';
                break;
            case 'Difficile':
                difficultyClass = 'difficulty-hard';
                break;
        }
        
        // Déterminer la couleur de la barre de progression
        let progressBarClass = '';
        if (challenge.success_rate >= 80) {
            progressBarClass = 'bg-success';
        } else if (challenge.success_rate >= 60) {
            progressBarClass = 'bg-warning';
        } else {
            progressBarClass = 'bg-danger';
        }
        
        row.innerHTML = `
            <td>${challenge.id}</td>
            <td><strong>${challenge.title}</strong></td>
            <td>${challenge.category}</td>
            <td><span class="${difficultyClass}" style="padding: 4px 12px; border-radius: 20px; font-size: 12px;">${challenge.difficulty}</span></td>
            <td><strong>${challenge.points}</strong></td>
            <td>${challenge.submissions}</td>
            <td>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span>${challenge.success_rate}%</span>
                    <div class="progress" style="flex: 1; max-width: 100px;">
                        <div class="progress-bar ${progressBarClass}" style="width: ${challenge.success_rate}%"></div>
                    </div>
                </div>
            </td>
            <td>
                <span class="${challenge.status === 'Actif' ? 'status-active' : 'status-inactive'}" style="padding: 4px 12px; border-radius: 20px; font-size: 12px;">
                    ${challenge.status}
                </span>
            </td>
            <td>
                <div style="display: flex; gap: 8px;">
                    <button class="btn-action btn-view view-btn" data-id="${challenge.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-action btn-edit edit-btn" data-id="${challenge.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-action btn-delete delete-btn" data-id="${challenge.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        // Ajouter les événements aux boutons
        row.querySelector('.view-btn').addEventListener('click', () => {
            this.viewChallenge(challenge.id);
        });
        
        row.querySelector('.edit-btn').addEventListener('click', () => {
            this.openEditModal(challenge.id);
        });
        
        row.querySelector('.delete-btn').addEventListener('click', () => {
            this.openDeleteModal(challenge.id);
        });
        
        return row;
    }
    
    updateStats() {
        const totalChallenges = this.challenges.length;
        const totalSubmissions = this.challenges.reduce((sum, challenge) => sum + challenge.submissions, 0);
        const avgSuccessRate = this.challenges.length > 0 
            ? Math.round(this.challenges.reduce((sum, challenge) => sum + challenge.success_rate, 0) / this.challenges.length)
            : 0;
        const totalPoints = this.challenges.reduce((sum, challenge) => sum + challenge.points, 0);
        
        document.getElementById('total-challenges').textContent = totalChallenges;
        document.getElementById('total-submissions').textContent = totalSubmissions;
        document.getElementById('avg-success-rate').textContent = `${avgSuccessRate}%`;
        document.getElementById('total-points').textContent = totalPoints;
    }
    
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }
    
    openAddModal() {
        document.getElementById('modalTitle').textContent = 'Nouveau Challenge';
        document.getElementById('challengeId').value = '';
        document.getElementById('challengeTitle').value = '';
        document.getElementById('challengeDescription').value = '';
        document.getElementById('challengeCategory').value = '';
        document.getElementById('challengeDifficulty').value = 'Facile';
        document.getElementById('challengePoints').value = '10';
        document.getElementById('challengeStatus').value = 'Actif';
        
        const modal = new bootstrap.Modal(document.getElementById('challengeModal'));
        modal.show();
    }
    
    openEditModal(id) {
        const challenge = this.challenges.find(c => c.id === id);
        if (!challenge) return;
        
        document.getElementById('modalTitle').textContent = 'Modifier le Challenge';
        document.getElementById('challengeId').value = challenge.id;
        document.getElementById('challengeTitle').value = challenge.title;
        document.getElementById('challengeDescription').value = challenge.description;
        document.getElementById('challengeCategory').value = challenge.category;
        document.getElementById('challengeDifficulty').value = challenge.difficulty;
        document.getElementById('challengePoints').value = challenge.points;
        document.getElementById('challengeStatus').value = challenge.status;
        
        const modal = new bootstrap.Modal(document.getElementById('challengeModal'));
        modal.show();
    }
    
    // FONCTION "VOIR" CORRIGÉE
    viewChallenge(id) {
        const challenge = this.challenges.find(c => c.id === id);
        if (!challenge) return;
        
        // Déterminer la classe de difficulté
        let difficultyClass = '';
        let difficultyColor = '';
        switch(challenge.difficulty) {
            case 'Facile':
                difficultyClass = 'difficulty-easy';
                difficultyColor = '#28a745';
                break;
            case 'Moyen':
                difficultyClass = 'difficulty-medium';
                difficultyColor = '#ffc107';
                break;
            case 'Difficile':
                difficultyClass = 'difficulty-hard';
                difficultyColor = '#dc3545';
                break;
        }
        
        // Déterminer la couleur de la barre de progression
        let progressBarClass = '';
        if (challenge.success_rate >= 80) {
            progressBarClass = 'bg-success';
        } else if (challenge.success_rate >= 60) {
            progressBarClass = 'bg-warning';
        } else {
            progressBarClass = 'bg-danger';
        }
        
        // Créer le contenu de la modal de détails
        const detailHtml = `
            <div class="challenge-details">
                <div class="row mb-4">
                    <div class="col-md-8">
                        <h3>${challenge.title}</h3>
                        <div class="d-flex gap-3 flex-wrap mb-3">
                            <span class="badge" style="background-color: rgba(74, 108, 247, 0.1); color: #4a6cf7; padding: 6px 12px; font-size: 14px;">
                                ${challenge.category}
                            </span>
                            <span class="badge ${difficultyClass}" style="padding: 6px 12px; font-size: 14px;">
                                ${challenge.difficulty}
                            </span>
                            <span class="badge" style="background-color: #4a6cf7; color: white; padding: 6px 12px; font-size: 14px;">
                                ${challenge.points} points
                            </span>
                            <span class="badge ${challenge.status === 'Actif' ? 'status-active' : 'status-inactive'}" style="padding: 6px 12px; font-size: 14px;">
                                ${challenge.status}
                            </span>
                        </div>
                    </div>
                    <div class="col-md-4 text-end">
                        <div class="text-muted">ID: #${challenge.id}</div>
                        <div class="text-muted">Créé le: ${this.formatDate(challenge.created_at)}</div>
                    </div>
                </div>
                
                <div class="row">
                    <div class="col-md-8">
                        <div class="card mb-4">
                            <div class="card-header">
                                <h5 class="mb-0">Description</h5>
                            </div>
                            <div class="card-body">
                                <p class="mb-0">${challenge.description}</p>
                            </div>
                        </div>
                        
                        <div class="card">
                            <div class="card-header">
                                <h5 class="mb-0">Instructions recommandées</h5>
                            </div>
                            <div class="card-body">
                                <ul class="mb-0">
                                    <li>Implémentez la fonction requise</li>
                                    <li>Testez avec différents cas d'utilisation</li>
                                    <li>Optimisez votre solution pour la performance</li>
                                    <li>Commentez votre code pour plus de clarté</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-md-4">
                        <div class="card mb-4">
                            <div class="card-header">
                                <h5 class="mb-0">Statistiques</h5>
                            </div>
                            <div class="card-body">
                                <div class="mb-3">
                                    <div class="d-flex justify-content-between mb-2">
                                        <span>Soumissions:</span>
                                        <strong>${challenge.submissions}</strong>
                                    </div>
                                    <div class="d-flex justify-content-between mb-2">
                                        <span>Taux de réussite:</span>
                                        <strong>${challenge.success_rate}%</strong>
                                    </div>
                                    <div class="progress mb-3">
                                        <div class="progress-bar ${progressBarClass}" style="width: ${challenge.success_rate}%"></div>
                                    </div>
                                    <div class="d-flex justify-content-between mb-2">
                                        <span>Difficulté:</span>
                                        <span class="${difficultyClass}" style="font-weight: 500;">${challenge.difficulty}</span>
                                    </div>
                                    <div class="d-flex justify-content-between">
                                        <span>Points:</span>
                                        <strong>${challenge.points}</strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="card">
                            <div class="card-header">
                                <h5 class="mb-0">Actions</h5>
                            </div>
                            <div class="card-body">
                                <div class="d-grid gap-2">
                                    <button class="btn btn-primary" onclick="challengesApp.openEditModal(${challenge.id})">
                                        <i class="fas fa-edit me-2"></i> Modifier
                                    </button>
                                    <button class="btn btn-outline-danger" onclick="challengesApp.openDeleteModal(${challenge.id})">
                                        <i class="fas fa-trash me-2"></i> Supprimer
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Mettre à jour le contenu de la modal
        document.getElementById('viewChallengeDetails').innerHTML = detailHtml;
        
        // Afficher la modal
        const modal = new bootstrap.Modal(document.getElementById('viewChallengeModal'));
        modal.show();
    }
    
    saveChallenge() {
        const id = document.getElementById('challengeId').value;
        const title = document.getElementById('challengeTitle').value.trim();
        const description = document.getElementById('challengeDescription').value.trim();
        const category = document.getElementById('challengeCategory').value;
        const difficulty = document.getElementById('challengeDifficulty').value;
        const points = parseInt(document.getElementById('challengePoints').value);
        const status = document.getElementById('challengeStatus').value;
        
        if (!title || !category) {
            alert('Le titre et la catégorie sont requis');
            return;
        }
        
        if (id) {
            // Modification
            const index = this.challenges.findIndex(c => c.id === parseInt(id));
            if (index !== -1) {
                this.challenges[index] = {
                    ...this.challenges[index],
                    title,
                    description,
                    category,
                    difficulty,
                    points,
                    status
                };
                alert('Challenge mis à jour avec succès!');
            }
        } else {
            // Ajout
            const newId = this.challenges.length > 0 ? Math.max(...this.challenges.map(c => c.id)) + 1 : 1;
            const newChallenge = {
                id: newId,
                title,
                description,
                category,
                difficulty,
                points,
                status,
                created_at: new Date().toISOString().split('T')[0],
                submissions: 0,
                success_rate: 0
            };
            this.challenges.push(newChallenge);
            alert('Challenge créé avec succès!');
            
            // Mettre à jour les catégories si nouvelle catégorie
            if (!this.categories.includes(category)) {
                this.categories.push(category);
                this.populateFilters();
            }
        }
        
        // Fermer le modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('challengeModal'));
        modal.hide();
        
        // Réinitialiser le filtre et mettre à jour
        this.filteredChallenges = [...this.challenges];
        this.applyFilters();
        this.updateStats();
    }
    
    openDeleteModal(id) {
        const challenge = this.challenges.find(c => c.id === id);
        if (!challenge) return;
        
        // Stocker l'ID à supprimer
        document.getElementById('deleteModal').dataset.deleteId = id;
        
        const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
        modal.show();
    }
    
    confirmDelete() {
        const id = parseInt(document.getElementById('deleteModal').dataset.deleteId);
        const challengeIndex = this.challenges.findIndex(c => c.id === id);
        
        if (challengeIndex !== -1) {
            this.challenges.splice(challengeIndex, 1);
            alert('Challenge supprimé avec succès!');
            
            // Réinitialiser le filtre et mettre à jour
            this.filteredChallenges = [...this.challenges];
            this.applyFilters();
            this.updateStats();
        }
        
        // Fermer le modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('deleteModal'));
        modal.hide();
    }
}
// Fonction pour afficher les détails d'un challenge
function showChallengeDetails(challengeId) {
    const challenge = challengesData.find(c => c.id === challengeId);
    if (!challenge) return;
    
    const difficultyClass = getDifficultyClass(challenge.difficulty);
    const statusClass = challenge.status === 'Actif' ? 'status-badge-active' : 'status-badge-inactive';
    
    const html = `
        <div class="challenge-details-container">
            <div class="challenge-details-header">
                <div class="challenge-details-title">
                    <h3>${challenge.title}</h3>
                    <div class="challenge-details-meta">
                        <span class="challenge-details-points">${challenge.points} pts</span>
                        <span class="challenge-category-badge">
                            <i class="fas fa-folder"></i> ${challenge.category}
                        </span>
                        <span class="challenge-difficulty-badge ${difficultyClass}">
                            <i class="fas fa-signal"></i> ${challenge.difficulty}
                        </span>
                        <span class="challenge-status-badge ${statusClass}">
                            <i class="fas fa-circle"></i> ${challenge.status}
                        </span>
                    </div>
                </div>
            </div>
            
            <div class="challenge-details-body">
                <div class="challenge-details-section">
                    <h5><i class="fas fa-file-alt"></i> Description</h5>
                    <div class="challenge-details-content">
                        ${challenge.description || 'Aucune description fournie.'}
                    </div>
                </div>
                
                <div class="challenge-details-section">
                    <h5><i class="fas fa-chart-bar"></i> Statistiques</h5>
                    <div class="challenge-details-stats">
                        <div class="challenge-stat-card">
                            <span class="challenge-stat-value">${challenge.submissions || 0}</span>
                            <span class="challenge-stat-label">Soumissions</span>
                        </div>
                        <div class="challenge-stat-card">
                            <span class="challenge-stat-value">${challenge.successRate || 0}%</span>
                            <span class="challenge-stat-label">Taux de réussite</span>
                        </div>
                        <div class="challenge-stat-card">
                            <span class="challenge-stat-value">${challenge.attempts || 0}</span>
                            <span class="challenge-stat-label">Tentatives</span>
                        </div>
                        <div class="challenge-stat-card">
                            <span class="challenge-stat-value">${formatDate(challenge.createdDate)}</span>
                            <span class="challenge-stat-label">Date de création</span>
                        </div>
                    </div>
                </div>
                
                <div class="challenge-details-section">
                    <h5><i class="fas fa-code"></i> Informations techniques</h5>
                    <div class="challenge-details-content">
                        <div style="display: grid; grid-template-columns: auto 1fr; gap: 10px 20px;">
                            <strong>ID :</strong> <span>${challenge.id}</span>
                            <strong>Durée estimée :</strong> <span>${challenge.estimatedTime || 'Non spécifiée'}</span>
                            <strong>Tags :</strong> <span>${challenge.tags ? challenge.tags.join(', ') : 'Aucun'}</span>
                            <strong>Langages :</strong> <span>${challenge.languages ? challenge.languages.join(', ') : 'Tous'}</span>
                        </div>
                    </div>
                </div>
                
                ${challenge.testCases ? `
                <div class="challenge-details-section">
                    <h5><i class="fas fa-vial"></i> Cas de test</h5>
                    <div class="challenge-details-content">
                        <pre style="background: #f5f5f5; padding: 15px; border-radius: 5px; font-size: 14px;">${JSON.stringify(challenge.testCases, null, 2)}</pre>
                    </div>
                </div>
                ` : ''}
            </div>
        </div>
    `;
    
    document.getElementById('viewChallengeDetails').innerHTML = html;
    
    // Configurer le bouton "Modifier"
    document.getElementById('editFromViewBtn').onclick = () => {
        editChallenge(challengeId);
        bootstrap.Modal.getInstance(document.getElementById('viewChallengeModal')).hide();
    };
    
    // Afficher le modal
    const viewModal = new bootstrap.Modal(document.getElementById('viewChallengeModal'));
    viewModal.show();
}

// Helper function pour obtenir la classe CSS de difficulté
function getDifficultyClass(difficulty) {
    switch(difficulty.toLowerCase()) {
        case 'facile': return 'difficulty-badge-easy';
        case 'moyen': return 'difficulty-badge-medium';
        case 'difficile': return 'difficulty-badge-hard';
        default: return 'difficulty-badge-medium';
    }
}

// Helper function pour formater la date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

// Créer une instance globale
window.ChallengesCRUD = ChallengesCRUD;