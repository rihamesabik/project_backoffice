// Service API pour les catégories
class CategoryService {
    constructor() {
        this.baseUrl = 'data'; // Répertoire des fichiers JSON
        this.endpoints = {
            categories: 'categories.json',
            challenges: 'challenges.json',
            submissions: 'submissions.json'
        };
    }
    
    // Charger les catégories depuis le fichier JSON
    async getCategories() {
        try {
            const response = await fetch(`${this.baseUrl}/${this.endpoints.categories}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data.categories || [];
            
        } catch (error) {
            console.error('Erreur lors du chargement des catégories:', error);
            throw error;
        }
    }
    
    // Charger les challenges par catégorie (si vous avez ce fichier)
    async getChallengesByCategory(categoryId) {
        try {
            const response = await fetch(`${this.baseUrl}/${this.endpoints.challenges}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            const challenges = data.challenges || [];
            
            // Filtrer les challenges par catégorie
            return challenges.filter(challenge => challenge.categoryId === categoryId);
            
        } catch (error) {
            console.error('Erreur lors du chargement des challenges:', error);
            return [];
        }
    }
    
    // Méthode pour simuler une API REST (pour développement)
    async saveCategories(categories) {
        // Note: Ceci ne fonctionne que si vous avez un backend
        // Pour un fichier JSON statique, vous ne pouvez pas écrire directement
        
        console.log('Simulation de sauvegarde des catégories:', categories);
        
        // Pour développement, on simule un délai
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ success: true, message: 'Catégories sauvegardées (simulation)' });
            }, 500);
        });
    }
    
    // Méthode pour sauvegarder localement dans localStorage (fallback)
    saveToLocalStorage(categories) {
        try {
            localStorage.setItem('codinghub_categories_backup', JSON.stringify(categories));
            return true;
        } catch (error) {
            console.error('Erreur lors de la sauvegarde dans localStorage:', error);
            return false;
        }
    }
    
    // Méthode pour charger depuis localStorage (fallback)
    loadFromLocalStorage() {
        try {
            const data = localStorage.getItem('codinghub_categories_backup');
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Erreur lors du chargement depuis localStorage:', error);
            return null;
        }
    }
}

// Exporter le service
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CategoryService;
}