// Utility functions

class Utils {
    static formatDate(date, format = 'fr-FR') {
        const d = new Date(date);
        return d.toLocaleDateString(format, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    static formatDateTime(date, format = 'fr-FR') {
        const d = new Date(date);
        return d.toLocaleDateString(format, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    static formatNumber(num) {
        return new Intl.NumberFormat('fr-FR').format(num);
    }

    static debounce(func, wait) {
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

    static throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    static exportToCSV(data, filename = 'export.csv') {
        if (!data.length) return;
        
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => {
                const cell = row[header];
                return typeof cell === 'string' && cell.includes(',') ? `"${cell}"` : cell;
            }).join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    static exportToPDF(elementId, filename = 'export.pdf') {
        // This would use jsPDF library
        console.log('Export to PDF:', elementId, filename);
        alert('Export PDF - Cette fonctionnalité nécessiterait jsPDF');
    }

    static validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    static validatePassword(password) {
        return password.length >= 8;
    }

    static getQueryParam(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    }

    static setQueryParam(name, value) {
        const url = new URL(window.location);
        url.searchParams.set(name, value);
        window.history.pushState({}, '', url);
    }

    static removeQueryParam(name) {
        const url = new URL(window.location);
        url.searchParams.delete(name);
        window.history.pushState({}, '', url);
    }

    static deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    static arrayToObject(arr, key) {
        return arr.reduce((obj, item) => {
            obj[item[key]] = item;
            return obj;
        }, {});
    }

    static objectToArray(obj) {
        return Object.keys(obj).map(key => ({ id: key, ...obj[key] }));
    }

    static sortArray(arr, key, direction = 'asc') {
        return arr.sort((a, b) => {
            if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
            if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
            return 0;
        });
    }

    static filterArray(arr, filters) {
        return arr.filter(item => {
            return Object.keys(filters).every(key => {
                if (!filters[key]) return true;
                const value = item[key];
                const filter = filters[key].toString().toLowerCase();
                return value.toString().toLowerCase().includes(filter);
            });
        });
    }

    static paginateArray(arr, page = 1, perPage = 10) {
        const start = (page - 1) * perPage;
        const end = start + perPage;
        return {
            data: arr.slice(start, end),
            total: arr.length,
            page,
            perPage,
            totalPages: Math.ceil(arr.length / perPage)
        };
    }

    static getRandomColor() {
        const colors = ['#4dabf7', '#40c057', '#ff922b', '#f06595', '#7950f2', '#20c997', '#fa5252', '#fcc419'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    static copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            App.showToast('Copié dans le presse-papier!', 'success');
        }).catch(err => {
            console.error('Erreur de copie:', err);
            App.showToast('Erreur lors de la copie', 'error');
        });
    }

    static downloadFile(content, filename, type = 'text/plain') {
        const blob = new Blob([content], { type });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
    }

    static readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsText(file);
        });
    }

    static calculatePercentage(part, total) {
        if (total === 0) return 0;
        return Math.round((part / total) * 100);
    }

    static formatDuration(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) {
            return `${hours}h ${minutes}m ${secs}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${secs}s`;
        } else {
            return `${secs}s`;
        }
    }

    static sanitizeHTML(html) {
        const div = document.createElement('div');
        div.textContent = html;
        return div.innerHTML;
    }

    static createElement(tag, attributes = {}, children = []) {
        const element = document.createElement(tag);
        
        Object.keys(attributes).forEach(key => {
            if (key === 'className') {
                element.className = attributes[key];
            } else if (key === 'textContent') {
                element.textContent = attributes[key];
            } else if (key === 'innerHTML') {
                element.innerHTML = attributes[key];
            } else {
                element.setAttribute(key, attributes[key]);
            }
        });
        
        children.forEach(child => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else {
                element.appendChild(child);
            }
        });
        
        return element;
    }

    static showModal(title, content, buttons = []) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">${content}</div>
                ${buttons.length ? `
                    <div class="modal-footer">
                        ${buttons.map(btn => `
                            <button class="btn ${btn.class || ''}" data-action="${btn.action || ''}">
                                ${btn.text}
                            </button>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
        
        document.body.appendChild(modal);
        
        const closeModal = () => modal.remove();
        
        modal.querySelector('.modal-overlay').addEventListener('click', closeModal);
        modal.querySelector('.modal-close').addEventListener('click', closeModal);
        
        modal.querySelectorAll('.modal-footer .btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                if (action === 'close') closeModal();
            });
        });
        
        return modal;
    }

    static confirm(message) {
        return new Promise((resolve) => {
            const modal = this.showModal('Confirmation', message, [
                { text: 'Annuler', action: 'close', class: 'btn-secondary' },
                { text: 'Confirmer', action: 'confirm', class: 'btn-primary' }
            ]);
            
            modal.querySelector('[data-action="confirm"]').addEventListener('click', () => {
                modal.remove();
                resolve(true);
            });
            
            modal.querySelector('[data-action="close"]').addEventListener('click', () => {
                modal.remove();
                resolve(false);
            });
        });
    }

    static prompt(message, defaultValue = '') {
        return new Promise((resolve) => {
            const content = `
                <p>${message}</p>
                <input type="text" class="prompt-input" value="${defaultValue}">
            `;
            
            const modal = this.showModal('Saisie', content, [
                { text: 'Annuler', action: 'close', class: 'btn-secondary' },
                { text: 'OK', action: 'ok', class: 'btn-primary' }
            ]);
            
            const input = modal.querySelector('.prompt-input');
            input.focus();
            
            modal.querySelector('[data-action="ok"]').addEventListener('click', () => {
                const value = input.value;
                modal.remove();
                resolve(value);
            });
            
            modal.querySelector('[data-action="close"]').addEventListener('click', () => {
                modal.remove();
                resolve(null);
            });
            
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const value = input.value;
                    modal.remove();
                    resolve(value);
                }
            });
        });
    }
}

// Make Utils available globally
window.Utils = Utils;