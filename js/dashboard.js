// Dashboard JavaScript

class Dashboard {
    constructor() {
        this.charts = {};
        this.data = {};
        this.init();
    }

    async init() {
        await this.loadData();
        this.renderDashboard();
        this.initCharts();
        this.setupEventListeners();
    }

    async loadData() {
        try {
            // Load dashboard data from JSON files
            const responses = await Promise.all([
                fetch('data/challenges.json').then(r => r.json()),
                fetch('data/users.json').then(r => r.json()),
                fetch('data/submissions.json').then(r => r.json()),
                fetch('data/rankings.json').then(r => r.json()),
                fetch('data/categories.json').then(r => r.json())
            ]);
            
            this.data = {
                challenges: responses[0],
                users: responses[1],
                submissions: responses[2],
                rankings: responses[3],
                categories: responses[4]
            };
            
            // Process data for charts and KPIs
            this.processDataForCharts();
            this.prepareTopParticipants();
            
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            // Use sample data if files don't exist
            this.loadSampleData();
        }
    }

    loadSampleData() {
        // Fallback sample data
        this.data = {
            soumissionsParMois: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                soumises: [420, 480, 510, 580, 530, 600, 650, 630, 700, 680, 720, 750],
                acceptees: [310, 350, 380, 420, 390, 440, 480, 470, 520, 510, 540, 560]
            },
            challengesParCategorie: {
                labels: ['Algorithmes', 'Structures', 'Web Dev', 'BDD', 'Sécurité', 'IA/ML'],
                data: [12, 8, 10, 6, 5, 7]
            },
            repartitionUtilisateurs: {
                labels: ['Étudiants', 'Professionnels', 'Enseignants', 'Autres'],
                data: [65, 20, 10, 5]
            },
            solutionsStats: {
                labels: ['Acceptées', 'Rejetées', 'En attente'],
                data: [2874, 745, 228]
            },
            performanceParticipants: {
                participants: ['Sophie M.', 'Lucas D.', 'Emma B.', 'Thomas P.', 'Julie R.', 'Alex L.', 'Marie C.', 'Pierre D.'],
                soumissions: [45, 38, 42, 31, 29, 35, 27, 33],
                tauxReussite: [92, 85, 88, 79, 76, 82, 74, 80]
            },
         topParticipants: [
    { rank: 1, name: 'Amina El Amrani', avatar: 'SM', challenges: 24, points: 2458 },
    { rank: 2, name: 'Youssef Benali', avatar: 'LD', challenges: 23, points: 2318 },
    { rank: 3, name: 'Sara Bouchtaoui', avatar: 'EB', challenges: 21, points: 2185 },
    { rank: 4, name: 'Hamza El Idrissi', avatar: 'TP', challenges: 19, points: 1958 },
    { rank: 5, name: 'Khadija Ait Lahcen', avatar: 'JR', challenges: 18, points: 1898 }
],
            kpis: {
                totalParticipants: 1248,
                activeChallenges: 48,
                totalSubmissions: 3847,
                successRate: 74
            }
        };
    }

    processDataForCharts() {
        // Process real data for KPIs
        this.calculateKPIs();
        
        // Process real data for charts
        this.prepareSubmissionsChart();
        this.prepareChallengesByCategory();
        this.prepareUsersDistribution();
        this.prepareSolutionsStats();
        this.preparePerformanceData();
    }

    calculateKPIs() {
        // Calculate KPIs from real data
        const totalParticipants = this.data.users?.length || 0;
        const activeChallenges = this.data.challenges?.filter(c => c.status === 'Actif').length || 0;
        const totalSubmissions = this.data.submissions?.length || 0;
        
        // Calculate success rate
        const acceptedSubmissions = this.data.submissions?.filter(s => s.status === 'Accepté').length || 0;
        const successRate = totalSubmissions > 0 ? Math.round((acceptedSubmissions / totalSubmissions) * 100) : 0;
        
        this.data.kpis = {
            totalParticipants,
            activeChallenges,
            totalSubmissions,
            successRate
        };
    }

    prepareSubmissionsChart() {
        // Group submissions by month (simplified - would need actual dates in data)
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        // For now, use sample data or generate from submissions
        // In a real app, you would process submission dates
        this.data.soumissionsParMois = {
            labels: months,
            soumises: months.map((_, i) => Math.floor(Math.random() * 300) + 400), // Sample
            acceptees: months.map((_, i) => Math.floor(Math.random() * 200) + 300) // Sample
        };
    }

    prepareChallengesByCategory() {
        if (!this.data.categories || !this.data.challenges) {
            this.data.challengesParCategorie = {
                labels: ['Algorithmes', 'Structures', 'Web Dev', 'BDD', 'Sécurité', 'IA/ML'],
                data: [12, 8, 10, 6, 5, 7]
            };
            return;
        }
        
        // Count challenges per category
        const categoryCounts = {};
        this.data.categories.forEach(category => {
            const count = this.data.challenges.filter(challenge => 
                challenge.category === category.name
            ).length;
            categoryCounts[category.name] = count;
        });
        
        this.data.challengesParCategorie = {
            labels: this.data.categories.map(c => c.name),
            data: this.data.categories.map(c => categoryCounts[c.name] || 0)
        };
    }

    prepareUsersDistribution() {
        // Simple distribution - in real app you would have user types
        const totalUsers = this.data.users?.length || 100;
        this.data.repartitionUtilisateurs = {
            labels: ['Étudiants', 'Professionnels', 'Enseignants', 'Autres'],
            data: [
                Math.round(totalUsers * 0.65),
                Math.round(totalUsers * 0.20),
                Math.round(totalUsers * 0.10),
                Math.round(totalUsers * 0.05)
            ]
        };
    }

    prepareSolutionsStats() {
        if (!this.data.submissions) {
            this.data.solutionsStats = {
                labels: ['Acceptées', 'Rejetées', 'En attente'],
                data: [2874, 745, 228]
            };
            return;
        }
        
        const accepted = this.data.submissions.filter(s => s.status === 'Accepté').length;
        const rejected = this.data.submissions.filter(s => s.status === 'Rejeté').length;
        const pending = this.data.submissions.filter(s => s.status === 'En attente').length;
        
        this.data.solutionsStats = {
            labels: ['Acceptées', 'Rejetées', 'En attente'],
            data: [accepted, rejected, pending]
        };
    }

    preparePerformanceData() {
        if (!this.data.rankings || this.data.rankings.length === 0) {
            this.data.performanceParticipants = {
                participants: ['Sophie M.', 'Lucas D.', 'Emma B.', 'Thomas P.', 'Julie R.', 'Alex L.', 'Marie C.', 'Pierre D.'],
                soumissions: [45, 38, 42, 31, 29, 35, 27, 33],
                tauxReussite: [92, 85, 88, 79, 76, 82, 74, 80]
            };
            return;
        }
        
        // Use top 8 from rankings for performance chart
        const topParticipants = this.data.rankings.slice(0, 8);
        
        this.data.performanceParticipants = {
            participants: topParticipants.map(p => p.full_name.split(' ')[0] + ' ' + p.full_name.split(' ')[1][0] + '.'),
            soumissions: topParticipants.map(p => p.challenges_completed || Math.floor(Math.random() * 20) + 20),
            tauxReussite: topParticipants.map(p => p.success_rate || Math.floor(Math.random() * 20) + 75)
        };
    }

    prepareTopParticipants() {
        if (!this.data.rankings || this.data.rankings.length === 0) {
            this.data.topParticipants = [
                { rank: 1, name: 'Sophie Martin', avatar: 'SM', challenges: 24, points: 2458 },
                { rank: 2, name: 'Lucas Dubois', avatar: 'LD', challenges: 23, points: 2318 },
                { rank: 3, name: 'Emma Bernard', avatar: 'EB', challenges: 21, points: 2185 },
                { rank: 4, name: 'Thomas Petit', avatar: 'TP', challenges: 19, points: 1958 },
                { rank: 5, name: 'Julie Roux', avatar: 'JR', challenges: 18, points: 1898 }
            ];
            return;
        }
        
        // Take top 5 from rankings
        const top5 = this.data.rankings.slice(0, 5);
        
        this.data.topParticipants = top5.map(participant => ({
            rank: participant.rank,
            name: participant.full_name,
            avatar: this.getAvatarFromName(participant.full_name),
            challenges: participant.challenges_completed || 0,
            points: participant.points || 0
        }));
    }

    getAvatarFromName(fullName) {
        if (!fullName) return '??';
        const names = fullName.split(' ');
        if (names.length >= 2) {
            return (names[0][0] + names[1][0]).toUpperCase();
        }
        return fullName.substring(0, 2).toUpperCase();
    }

    renderDashboard() {
        const container = document.getElementById('dashboard-content');
        if (!container) return;

        container.innerHTML = `
            <div class="dashboard-header">
               
               
                    <button id="export-btn" class="btn">
                        <i class="fas fa-download"></i> Exporter
                    </button>
                </div>
            </div>
            
            <!-- KPI Cards -->
            <div class="kpi-container">
                <div class="kpi-card">
                    <div class="kpi-icon">
                        <i class="fas fa-users"></i>
                    </div>
                    <h3>Total Participants</h3>
                    <div class="value" id="total-participants">${this.formatNumber(this.data.kpis?.totalParticipants || 0)}</div>
                    <div class="trend"><i class="fas fa-arrow-up"></i> ${this.getRandomTrend()}% vs mois dernier</div>
                </div>
                
                <div class="kpi-card">
                    <div class="kpi-icon">
                        <i class="fas fa-tasks"></i>
                    </div>
                    <h3>Challenges Actifs</h3>
                    <div class="value" id="active-challenges">${this.data.kpis?.activeChallenges || 0}</div>
                    <div class="trend"><i class="fas fa-arrow-up"></i> ${this.getRandomTrend()}% vs mois dernier</div>
                </div>
                
                <div class="kpi-card">
                    <div class="kpi-icon">
                        <i class="fas fa-paper-plane"></i>
                    </div>
                    <h3>Solutions Soumises</h3>
                    <div class="value" id="total-submissions">${this.formatNumber(this.data.kpis?.totalSubmissions || 0)}</div>
                    <div class="trend"><i class="fas fa-arrow-up"></i> ${this.getRandomTrend()}% vs mois dernier</div>
                </div>
                
                <div class="kpi-card">
                    <div class="kpi-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <h3>Taux de Réussite</h3>
                    <div class="value" id="success-rate">${this.data.kpis?.successRate || 0}%</div>
                    <div class="trend ${this.getTrendDirection(this.data.kpis?.successRate || 0)}">
                        <i class="fas fa-${this.getTrendIcon(this.data.kpis?.successRate || 0)}"></i> 
                        ${this.getRandomTrend()}% vs mois dernier
                    </div>
                </div>
            </div>
            
            <!-- Chart Filters -->
            <div class="chart-filter">
                <h3>Filtres de visualisation</h3>
                <div class="filter-options">
                    <div class="filter-btn active" data-chart="line">Soumissions par mois</div>
                    <div class="filter-btn active" data-chart="bar">Challenges par catégorie</div>
                    <div class="filter-btn active" data-chart="pie">Répartition des utilisateurs</div>
                    <div class="filter-btn active" data-chart="doughnut">Solutions acceptées vs rejetées</div>
                    <div class="filter-btn active" data-chart="scatter">Performance des participants</div>
                    <div class="filter-btn" id="select-all">Tout sélectionner</div>
                    <div class="filter-btn" id="deselect-all">Tout désélectionner</div>
                </div>
            </div>
            
            <!-- Charts -->
            <div class="charts-container">
                <!-- Line Chart -->
                <div class="chart-box large line-chart">
                    <div class="chart-header">
                        <h3>Soumissions par mois</h3>
                        <select class="date-filter" id="year-filter">
                            <option value="2024">2024</option>
                            <option value="2023">2023</option>
                            <option value="2022">2022</option>
                        </select>
                    </div>
                    <div class="chart-container">
                        <canvas id="lineChart"></canvas>
                    </div>
                </div>
                
                <!-- Bar Chart -->
                <div class="chart-box bar-chart">
                    <div class="chart-header">
                        <h3>Challenges par catégorie</h3>
                    </div>
                    <div class="chart-container small">
                        <canvas id="barChart"></canvas>
                    </div>
                </div>
                
                <!-- Pie Chart -->
                <div class="chart-box pie-chart">
                    <div class="chart-header">
                        <h3>Répartition des utilisateurs</h3>
                    </div>
                    <div class="chart-container small">
                        <canvas id="pieChart"></canvas>
                    </div>
                </div>
                
                <!-- Doughnut Chart -->
                <div class="chart-box doughnut-chart">
                    <div class="chart-header">
                        <h3>Solutions acceptées vs rejetées</h3>
                    </div>
                    <div class="chart-container small">
                        <canvas id="doughnutChart"></canvas>
                    </div>
                </div>
                
                <!-- Scatter Chart -->
                <div class="chart-box large scatter-chart">
                    <div class="chart-header">
                        <h3>Performance des participants</h3>
                        <div>
                            <span class="filter-btn active" id="filter-active" style="padding: 5px 10px; font-size: 14px;">Top 8</span>
                            <span class="filter-btn" id="filter-all" style="padding: 5px 10px; font-size: 14px;">Tous</span>
                        </div>
                    </div>
                    <div class="chart-container">
                        <canvas id="scatterChart"></canvas>
                    </div>
                </div>
            </div>
            
            <!-- Top Participants -->
            <div class="participants-container">
                <h3>Top Participants - Les meilleurs codeurs de la semaine</h3>
                <div class="table-container">
                    <table id="top-participants-table">
                        <thead>
                            <tr>
                                <th width="10%">Rang</th>
                                <th width="50%">Participant</th>
                                <th width="20%">Challenges complétés</th>
                                <th width="20%">Points</th>
                            </tr>
                        </thead>
                        <tbody id="top-participants-body">
                            <!-- Will be populated by JavaScript -->
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div class="footer">
                <p>CodingHub Dashboard &copy; ${new Date().getFullYear()} | Données mises à jour en temps réel</p>
            </div>
        `;

        this.renderTopParticipants();
    }

    renderTopParticipants() {
        const tbody = document.getElementById('top-participants-body');
        if (!tbody || !this.data.topParticipants) return;

        tbody.innerHTML = this.data.topParticipants.map(participant => `
            <tr>
                <td class="rank">${participant.rank}</td>
                <td>
                    <div class="user-cell">
                        <div class="user-avatar-small">${participant.avatar}</div>
                        <div class="user-name">${participant.name}</div>
                    </div>
                </td>
                <td>${participant.challenges}</td>
                <td class="points">${this.formatNumber(participant.points)} pts</td>
            </tr>
        `).join('');
    }

    formatNumber(num) {
        return new Intl.NumberFormat('fr-FR').format(num);
    }

    getRandomTrend() {
        const trends = [2, 5, 8, 12, 15, 18];
        return trends[Math.floor(Math.random() * trends.length)];
    }

    getTrendDirection(successRate) {
        return successRate < 70 ? 'down' : '';
    }

    getTrendIcon(successRate) {
        return successRate < 70 ? 'arrow-down' : 'arrow-up';
    }

    initCharts() {
        this.createLineChart();
        this.createBarChart();
        this.createPieChart();
        this.createDoughnutChart();
        this.createScatterChart();
        this.setupChartFilters();
    }

    createLineChart() {
        const ctx = document.getElementById('lineChart').getContext('2d');
        if (!this.data.soumissionsParMois) return;
        
        this.charts.line = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.data.soumissionsParMois.labels,
                datasets: [
                    {
                        label: 'Soumissions',
                        data: this.data.soumissionsParMois.soumises,
                        borderColor: '#4dabf7',
                        backgroundColor: 'rgba(77, 171, 247, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.3
                    },
                    {
                        label: 'Acceptées',
                        data: this.data.soumissionsParMois.acceptees,
                        borderColor: '#40c057',
                        backgroundColor: 'rgba(64, 192, 87, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.3
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Nombre de soumissions'
                        }
                    }
                }
            }
        });
    }

    createBarChart() {
        const ctx = document.getElementById('barChart').getContext('2d');
        if (!this.data.challengesParCategorie) return;
        
        this.charts.bar = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: this.data.challengesParCategorie.labels,
                datasets: [{
                    label: 'Nombre de challenges',
                    data: this.data.challengesParCategorie.data,
                    backgroundColor: [
                        '#4dabf7', '#ff922b', '#40c057', '#f06595', '#7950f2', '#20c997'
                    ],
                    borderColor: [
                        '#3b8bc4', '#e67e22', '#37b24d', '#d6336c', '#6741d9', '#1ba97a'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Nombre de challenges'
                        }
                    }
                }
            }
        });
    }

    createPieChart() {
        const ctx = document.getElementById('pieChart').getContext('2d');
        if (!this.data.repartitionUtilisateurs) return;
        
        this.charts.pie = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: this.data.repartitionUtilisateurs.labels,
                datasets: [{
                    data: this.data.repartitionUtilisateurs.data,
                    backgroundColor: [
                        '#4dabf7', '#ff922b', '#40c057', '#f06595'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                    }
                }
            }
        });
    }

    createDoughnutChart() {
        const ctx = document.getElementById('doughnutChart').getContext('2d');
        if (!this.data.solutionsStats) return;
        
        this.charts.doughnut = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: this.data.solutionsStats.labels,
                datasets: [{
                    data: this.data.solutionsStats.data,
                    backgroundColor: [
                        '#40c057', '#fa5252', '#ffd43b'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                    }
                }
            }
        });
    }

    createScatterChart() {
        const ctx = document.getElementById('scatterChart').getContext('2d');
        if (!this.data.performanceParticipants) return;
        
        const scatterData = this.data.performanceParticipants.participants.map((participant, index) => ({
            x: this.data.performanceParticipants.soumissions[index],
            y: this.data.performanceParticipants.tauxReussite[index]
        }));
        
        this.charts.scatter = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Participants',
                    data: scatterData,
                    backgroundColor: '#4dabf7',
                    borderColor: '#3b8bc4',
                    borderWidth: 1,
                    pointRadius: 8,
                    pointHoverRadius: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const index = context.dataIndex;
                                const participant = this.data.performanceParticipants.participants[index];
                                const soumissions = this.data.performanceParticipants.soumissions[index];
                                const taux = this.data.performanceParticipants.tauxReussite[index];
                                return `${participant}: ${soumissions} soumissions, ${taux}% réussite`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Nombre de soumissions'
                        },
                        beginAtZero: true
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Taux de réussite (%)'
                        },
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }

    setupChartFilters() {
        const filterButtons = document.querySelectorAll('.filter-btn[data-chart]');
        const selectAllBtn = document.getElementById('select-all');
        const deselectAllBtn = document.getElementById('deselect-all');
        
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const chartType = btn.getAttribute('data-chart');
                const isActive = btn.classList.contains('active');
                
                if (isActive) {
                    btn.classList.remove('active');
                    this.hideChart(chartType);
                } else {
                    btn.classList.add('active');
                    this.showChart(chartType);
                }
            });
        });
        
        selectAllBtn.addEventListener('click', () => {
            filterButtons.forEach(btn => {
                btn.classList.add('active');
                const chartType = btn.getAttribute('data-chart');
                this.showChart(chartType);
            });
        });
        
        deselectAllBtn.addEventListener('click', () => {
            filterButtons.forEach(btn => {
                btn.classList.remove('active');
                const chartType = btn.getAttribute('data-chart');
                this.hideChart(chartType);
            });
        });
        
        // Participant filter
        const filterTop8 = document.getElementById('filter-active');
        const filterAll = document.getElementById('filter-all');
        
        if (filterTop8 && filterAll) {
            filterTop8.addEventListener('click', () => {
                filterTop8.classList.add('active');
                filterAll.classList.remove('active');
                this.filterScatterChart('top8');
            });
            
            filterAll.addEventListener('click', () => {
                filterAll.classList.add('active');
                filterTop8.classList.remove('active');
                this.filterScatterChart('all');
            });
        }
    }

    hideChart(chartType) {
        const chartElements = document.querySelectorAll(`.${chartType}-chart`);
        chartElements.forEach(el => {
            el.style.display = 'none';
        });
    }

    showChart(chartType) {
        const chartElements = document.querySelectorAll(`.${chartType}-chart`);
        chartElements.forEach(el => {
            el.style.display = 'block';
        });
    }

    filterScatterChart(filterType) {
        // In a real app, this would filter the data based on filter type
        console.log('Filter scatter chart:', filterType);
        
        if (filterType === 'top8' && this.data.performanceParticipants) {
            // Use only top 8 participants
            const top8Data = this.data.performanceParticipants.participants
                .slice(0, 8)
                .map((participant, index) => ({
                    x: this.data.performanceParticipants.soumissions[index],
                    y: this.data.performanceParticipants.tauxReussite[index]
                }));
            
            if (this.charts.scatter) {
                this.charts.scatter.data.datasets[0].data = top8Data;
                this.charts.scatter.update();
            }
        } else if (filterType === 'all' && this.data.performanceParticipants) {
            // Use all data
            const allData = this.data.performanceParticipants.participants.map((participant, index) => ({
                x: this.data.performanceParticipants.soumissions[index],
                y: this.data.performanceParticipants.tauxReussite[index]
            }));
            
            if (this.charts.scatter) {
                this.charts.scatter.data.datasets[0].data = allData;
                this.charts.scatter.update();
            }
        }
    }

    setupEventListeners() {
        // Export button
        const exportBtn = document.getElementById('export-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportDashboard());
        }

        // Period filter
        const periodFilter = document.getElementById('period-filter');
        if (periodFilter) {
            periodFilter.addEventListener('change', (e) => {
                this.filterByPeriod(e.target.value);
            });
        }

        // Year filter for line chart
        const yearFilter = document.getElementById('year-filter');
        if (yearFilter) {
            yearFilter.addEventListener('change', (e) => {
                this.filterByYear(e.target.value);
            });
        }
    }

    exportDashboard() {
        App.showToast('Export des données en cours...', 'info');
        
        // Create export data
        const exportData = {
            timestamp: new Date().toISOString(),
            kpis: this.data.kpis,
            topParticipants: this.data.topParticipants,
            charts: {
                submissionsByMonth: this.data.soumissionsParMois,
                challengesByCategory: this.data.challengesParCategorie,
                usersDistribution: this.data.repartitionUtilisateurs,
                solutionsStats: this.data.solutionsStats,
                performanceData: this.data.performanceParticipants
            }
        };
        
        // Convert to JSON and download
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `dashboard_export_${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        App.showToast('Dashboard exporté avec succès!', 'success');
    }

    filterByPeriod(period) {
        App.showToast(`Filtre appliqué: ${period}`, 'info');
        
        // In a real implementation, this would fetch filtered data
        console.log('Filter by period:', period);
        
        // Update charts with filtered data
        // For now, just update the success rate trend
        const successRateElement = document.getElementById('success-rate');
        if (successRateElement) {
            const newRate = Math.floor(Math.random() * 20) + 70;
            successRateElement.textContent = `${newRate}%`;
            
            const trendElement = successRateElement.parentElement.querySelector('.trend');
            if (trendElement) {
                trendElement.className = newRate < 70 ? 'trend down' : 'trend';
                trendElement.innerHTML = `<i class="fas fa-${newRate < 70 ? 'arrow-down' : 'arrow-up'}"></i> ${this.getRandomTrend()}% vs ${period === 'week' ? 'semaine' : 'mois'} dernier`;
            }
        }
    }

    filterByYear(year) {
        App.showToast(`Données affichées pour ${year}`, 'info');
        
        // In a real implementation, this would update the line chart with data for the selected year
        console.log('Filter by year:', year);
        
        // Simulate data change for different years
        if (this.charts.line && this.data.soumissionsParMois) {
            const multiplier = year === '2023' ? 0.8 : year === '2022' ? 0.6 : 1;
            
            this.charts.line.data.datasets[0].data = this.data.soumissionsParMois.soumises.map(val => Math.round(val * multiplier));
            this.charts.line.data.datasets[1].data = this.data.soumissionsParMois.acceptees.map(val => Math.round(val * multiplier));
            this.charts.line.update();
        }
    }
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('dashboard.html') || 
        window.location.pathname.endsWith('dashboard.html')) {
        window.dashboard = new Dashboard();
    }
});

// Function to load dashboard page (for SPA navigation)
window.loadDashboardPage = function() {
    window.dashboard = new Dashboard();
};