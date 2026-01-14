// Gestion des catégories - CRUD simple
class CategoriesCRUD {
    constructor() {
        this.categories = [];
        this.filteredCategories = [];
        this.currentView = 'grid'; // 'grid' ou 'table'
        
        // Couleurs disponibles
        this.colorOptions = [
            '#4a6cf7', '#28a745', '#ffc107', '#dc3545', 
            '#17a2b8', '#6f42c1', '#fd7e14', '#20c997',
            '#e83e8c', '#6c757d'
        ];
        
        this.init();
    }
    
    async init() {
        // Charger les données depuis le fichier JSON
        await this.loadFromJSON();
        
        // Initialiser les événements
        this.setupEventListeners();
        
        // Rendre les options de couleur
        this.renderColorOptions();
        
        // Afficher les catégories
        this.renderCategories();
        
        // Mettre à jour les statistiques
        this.updateStats();
    }
    
    // Charger les données depuis le fichier JSON
    async loadFromJSON() {
        try {
            const response = await fetch('data/categories.json');
            
            if (!response.ok) {
                throw new Error('Erreur de chargement du fichier JSON');
            }
            
            const data = await response.json();
            this.categories = data.categories || [];
            
            // Si pas de données, créer des données de démo
            if (this.categories.length === 0) {
                this.createDemoData();
            }
            
            console.log('Données chargées:', this.categories.length, 'catégories');
            
        } catch (error) {
            console.error('Erreur:', error);
            // Créer des données de démo en cas d'erreur
            this.createDemoData();
        }
    }
    
    // Créer des données de démonstration si le JSON est vide ou non trouvé
    createDemoData() {
        this.categories = [
            {
                id: 1,
                name: "Algorithmes",
                description: "Problèmes de tri, recherche, graphes et algorithmes classiques",
                color: "#4a6cf7",
                challenges: 15,
                submissions: 325,
                active: true,
                createdAt: "2024-01-15"
            },
            {
                id: 2,
                name: "Structures de données",
                description: "Listes, arbres, tables de hachage et structures complexes",
                color: "#28a745",
                challenges: 12,
                submissions: 218,
                active: true,
                createdAt: "2024-02-10"
            }
        ];
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
        document.getElementById('add-category-btn').addEventListener('click', () => {
            this.openAddModal();
        });
        
        document.getElementById('add-first-category-btn').addEventListener('click', () => {
            this.openAddModal();
        });
        
        // Recherche
        document.getElementById('search-input').addEventListener('input', (e) => {
            this.filterCategories(e.target.value);
        });
        
        // Sauvegarde de catégorie
        document.getElementById('saveCategoryBtn').addEventListener('click', () => {
            this.saveCategory();
        });
        
        // Confirmation de suppression
        document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
            this.confirmDelete();
        });
    }
    
    renderColorOptions() {
        const container = document.getElementById('colorOptions');
        container.innerHTML = '';
        
        this.colorOptions.forEach(color => {
            const colorOption = document.createElement('div');
            colorOption.className = 'color-option';
            colorOption.style.backgroundColor = color;
            colorOption.dataset.color = color;
            
            colorOption.addEventListener('click', () => {
                document.querySelectorAll('.color-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                colorOption.classList.add('selected');
                document.getElementById('selectedColor').value = color;
            });
            
            container.appendChild(colorOption);
        });
        
        // Sélectionner la première couleur par défaut
        if (this.colorOptions.length > 0) {
            container.firstChild.classList.add('selected');
            document.getElementById('selectedColor').value = this.colorOptions[0];
        }
    }
    
    switchView(view) {
        this.currentView = view;
        
        // Mettre à jour les boutons
        document.getElementById('grid-view-btn').classList.toggle('active', view === 'grid');
        document.getElementById('table-view-btn').classList.toggle('active', view === 'table');
        
        // Afficher/masquer les vues
        document.getElementById('categories-grid-view').style.display = view === 'grid' ? 'grid' : 'none';
        document.getElementById('categories-table-view').style.display = view === 'table' ? 'block' : 'none';
        
        this.renderCategories();
    }
    
    filterCategories(searchTerm) {
        const term = searchTerm.toLowerCase().trim();
        
        if (term === '') {
            this.filteredCategories = [...this.categories];
        } else {
            this.filteredCategories = this.categories.filter(category => {
                return category.name.toLowerCase().includes(term) ||
                       category.description.toLowerCase().includes(term);
            });
        }
        
        this.renderCategories();
    }
    
    renderCategories() {
        // Si pas de filtrage, utiliser toutes les catégories
        if (this.filteredCategories.length === 0) {
            this.filteredCategories = [...this.categories];
        }
        
        // Afficher/masquer l'état vide
        const emptyState = document.getElementById('empty-state');
        
        if (this.filteredCategories.length === 0) {
            emptyState.style.display = 'block';
            document.getElementById('categories-grid-view').style.display = 'none';
            document.getElementById('categories-table-view').style.display = 'none';
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
        const container = document.getElementById('categories-grid-view');
        container.innerHTML = '';
        
        this.filteredCategories.forEach(category => {
            const card = this.createCategoryCard(category);
            container.appendChild(card);
        });
    }
    
    renderTableView() {
        const tbody = document.getElementById('categoriesTableBody');
        tbody.innerHTML = '';
        
        this.filteredCategories.forEach(category => {
            const row = this.createTableRow(category);
            tbody.appendChild(row);
        });
    }
    
    createCategoryCard(category) {
        const card = document.createElement('div');
        card.className = 'category-card';
        card.style.borderTopColor = category.color;
        
        card.innerHTML = `
            <div class="category-card-header">
                <div class="category-card-title">
                    <div class="category-color" style="background-color: ${category.color};"></div>
                    <h4 style="margin: 0; font-size: 18px;">${category.name}</h4>
                    ${!category.active ? '<span class="badge bg-secondary ms-2">Inactif</span>' : ''}
                </div>
                <div class="category-actions">
                    <button class="btn btn-sm btn-view edit-btn" data-id="${category.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-delete delete-btn" data-id="${category.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="category-card-body">
                <p style="color: #6c757d; margin-bottom: 15px; line-height: 1.5;">${category.description}</p>
                <div class="category-stats">
                    <div style="text-align: center;">
                        <span class="stat-value">${category.challenges}</span>
                        <span class="stat-label">Challenges</span>
                    </div>
                    <div style="text-align: center;">
                        <span class="stat-value">${category.submissions}</span>
                        <span class="stat-label">Soumissions</span>
                    </div>
                    <div style="text-align: center;">
                        <span class="stat-value">${Math.round(category.submissions / category.challenges) || 0}</span>
                        <span class="stat-label">Moy/challenge</span>
                    </div>
                </div>
            </div>
        `;
        
        // Ajouter les événements aux boutons
        card.querySelector('.edit-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.openEditModal(category.id);
        });
        
        card.querySelector('.delete-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.openDeleteModal(category.id);
        });
        
        return card;
    }
    
    createTableRow(category) {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td><strong>${category.name}</strong></td>
            <td>${category.description}</td>
            <td>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="width: 20px; height: 20px; background-color: ${category.color}; border-radius: 4px;"></div>
                    <span>${category.color}</span>
                </div>
            </td>
            <td><strong>${category.challenges}</strong></td>
            <td>
                ${category.active 
                    ? '<span class="badge bg-success">Actif</span>' 
                    : '<span class="badge bg-secondary">Inactif</span>'}
            </td>
            <td>
                <div style="display: flex; gap: 8px;">
                    <button class="btn btn-view edit-btn" data-id="${category.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-delete delete-btn" data-id="${category.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        // Ajouter les événements aux boutons
        row.querySelector('.edit-btn').addEventListener('click', () => {
            this.openEditModal(category.id);
        });
        
        row.querySelector('.delete-btn').addEventListener('click', () => {
            this.openDeleteModal(category.id);
        });
        
        return row;
    }
    
    updateStats() {
        const totalCategories = this.categories.length;
        const totalChallenges = this.categories.reduce((sum, cat) => sum + cat.challenges, 0);
        const totalSubmissions = this.categories.reduce((sum, cat) => sum + cat.submissions, 0);
        
        document.getElementById('total-categories').textContent = totalCategories;
        document.getElementById('total-challenges').textContent = totalChallenges;
        document.getElementById('total-submissions').textContent = totalSubmissions;
    }
    
    openAddModal() {
        document.getElementById('modalTitle').textContent = 'Nouvelle Catégorie';
        document.getElementById('categoryId').value = '';
        document.getElementById('categoryName').value = '';
        document.getElementById('categoryDescription').value = '';
        document.getElementById('categoryActive').checked = true;
        
        // Réinitialiser la sélection de couleur
        document.querySelectorAll('.color-option').forEach(opt => {
            opt.classList.remove('selected');
        });
        document.querySelector('.color-option').classList.add('selected');
        document.getElementById('selectedColor').value = this.colorOptions[0];
        
        const modal = new bootstrap.Modal(document.getElementById('categoryModal'));
        modal.show();
    }
    
    openEditModal(id) {
        const category = this.categories.find(c => c.id === id);
        if (!category) return;
        
        document.getElementById('modalTitle').textContent = 'Modifier la Catégorie';
        document.getElementById('categoryId').value = category.id;
        document.getElementById('categoryName').value = category.name;
        document.getElementById('categoryDescription').value = category.description;
        document.getElementById('categoryActive').checked = category.active;
        document.getElementById('selectedColor').value = category.color;
        
        // Sélectionner la bonne couleur
        document.querySelectorAll('.color-option').forEach(opt => {
            opt.classList.remove('selected');
            if (opt.dataset.color === category.color) {
                opt.classList.add('selected');
            }
        });
        
        const modal = new bootstrap.Modal(document.getElementById('categoryModal'));
        modal.show();
    }
    
    saveCategory() {
        const id = document.getElementById('categoryId').value;
        const name = document.getElementById('categoryName').value.trim();
        const description = document.getElementById('categoryDescription').value.trim();
        const color = document.getElementById('selectedColor').value;
        const active = document.getElementById('categoryActive').checked;
        
        if (!name) {
            alert('Le nom de la catégorie est requis');
            return;
        }
        
        if (id) {
            // Modification
            const index = this.categories.findIndex(c => c.id === parseInt(id));
            if (index !== -1) {
                this.categories[index] = {
                    ...this.categories[index],
                    name,
                    description,
                    color,
                    active
                };
                alert('Catégorie mise à jour avec succès!');
            }
        } else {
            // Ajout
            const newId = this.categories.length > 0 ? Math.max(...this.categories.map(c => c.id)) + 1 : 1;
            const newCategory = {
                id: newId,
                name,
                description,
                color,
                challenges: 0,
                submissions: 0,
                active,
                createdAt: new Date().toISOString().split('T')[0]
            };
            this.categories.push(newCategory);
            alert('Catégorie créée avec succès!');
        }
        
        // Fermer le modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('categoryModal'));
        modal.hide();
        
        // Réinitialiser le filtre et mettre à jour
        this.filteredCategories = [...this.categories];
        this.renderCategories();
        this.updateStats();
    }
    
    openDeleteModal(id) {
        const category = this.categories.find(c => c.id === id);
        if (!category) return;
        
        // Stocker l'ID à supprimer
        document.getElementById('deleteModal').dataset.deleteId = id;
        
        const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
        modal.show();
    }
    
    confirmDelete() {
        const id = parseInt(document.getElementById('deleteModal').dataset.deleteId);
        const categoryIndex = this.categories.findIndex(c => c.id === id);
        
        if (categoryIndex !== -1) {
            this.categories.splice(categoryIndex, 1);
            alert('Catégorie supprimée avec succès!');
            
            // Réinitialiser le filtre et mettre à jour
            this.filteredCategories = [...this.categories];
            this.renderCategories();
            this.updateStats();
        }
        
        // Fermer le modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('deleteModal'));
        modal.hide();
    }
}

// Créer une instance globale
window.CategoriesCRUD = CategoriesCRUD;