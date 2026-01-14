// submission-details.js - Gestion des détails d'une soumission

let currentSubmission = null;

document.addEventListener('DOMContentLoaded', async function() {
    await loadSubmissionDetails();
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

async function loadSubmissionDetails() {
    const contentDiv = document.getElementById('submissionDetailsContent');
    if (!contentDiv) return;
    
    // Afficher le chargement
    contentDiv.innerHTML = `
        <div class="loading-state">
            <div class="spinner"></div>
            <p>Chargement des détails de la soumission...</p>
        </div>
    `;
    
    // Récupérer l'ID depuis l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const submissionId = parseInt(urlParams.get('id'));
    
    if (!submissionId) {
        showError('ID de la soumission non spécifié');
        return;
    }
    
    try {
        const response = await fetch('data/submissions.json');
        if (!response.ok) {
            throw new Error('Erreur de chargement des données');
        }
        const data = await response.json();
        currentSubmission = data.submissions.find(s => s.id === submissionId);
        
        if (!currentSubmission) {
            showError('Soumission non trouvée');
            return;
        }
        
        displaySubmissionDetails();
        initializeCharts();
        hljs.highlightAll(); // Activer la coloration syntaxique
    } catch (error) {
        console.error('Erreur:', error);
        showError('Impossible de charger les détails de la soumission');
    }
}

function displaySubmissionDetails() {
    const contentDiv = document.getElementById('submissionDetailsContent');
    if (!contentDiv) return;
    
    // Styles CSS pour cette page
    const styles = `
        <style>
            .submission-header {
                background: white;
                border-radius: 10px;
                padding: 30px;
                margin-bottom: 25px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            }
            
            .header-top {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 20px;
                flex-wrap: wrap;
                gap: 20px;
            }
            
            .submission-info {
                flex: 1;
                min-width: 300px;
            }
            
            .submission-id {
                color: #6c757d;
                font-size: 14px;
                margin-bottom: 5px;
            }
            
            .submission-title {
                font-size: 28px;
                color: #2c3e50;
                margin-bottom: 15px;
                font-weight: 700;
            }
            
            .participant-info {
                display: flex;
                align-items: center;
                gap: 15px;
                margin-bottom: 15px;
            }
            
            .participant-avatar {
                width: 50px;
                height: 50px;
                background: linear-gradient(135deg, #4dabf7, #339af0);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                font-size: 18px;
                flex-shrink: 0;
            }
            
            .participant-details h4 {
                margin: 0 0 5px 0;
                color: #2c3e50;
                font-size: 18px;
            }
            
            .participant-details p {
                margin: 0;
                color: #6c757d;
                font-size: 14px;
            }
            
            .header-stats {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 15px;
                background: #f8f9fa;
                border-radius: 10px;
                padding: 20px;
                margin-top: 20px;
            }
            
            .stat-box {
                text-align: center;
            }
            
            .stat-value {
                font-size: 24px;
                font-weight: 700;
                color: #2c3e50;
                margin-bottom: 5px;
            }
            
            .stat-label {
                font-size: 12px;
                color: #6c757d;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .decision-actions {
                display: flex;
                gap: 15px;
                margin-top: 20px;
                flex-wrap: wrap;
            }
            
            .btn-approve {
                background: linear-gradient(135deg, #40c057, #2b8a3e);
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 500;
                display: flex;
                align-items: center;
                gap: 8px;
                transition: all 0.3s ease;
            }
            
            .btn-reject {
                background: linear-gradient(135deg, #fa5252, #c92a2a);
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 500;
                display: flex;
                align-items: center;
                gap: 8px;
                transition: all 0.3s ease;
            }
            
            .btn-approve:hover, .btn-reject:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            }
            
            .status-badge-large {
                display: inline-block;
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 14px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .status-accepted {
                background: linear-gradient(135deg, #d3f9d8, #b2f2bb);
                color: #2b8a3e;
                border: 1px solid #69db7c;
            }
            
            .status-rejected {
                background: linear-gradient(135deg, #ffe3e3, #ffc9c9);
                color: #c92a2a;
                border: 1px solid #ff8787;
            }
            
            .status-pending {
                background: linear-gradient(135deg, #fff3bf, #ffec99);
                color: #e67700;
                border: 1px solid #ffd43b;
            }
            
            /* Section code */
            .code-section {
                background: white;
                border-radius: 10px;
                padding: 30px;
                margin-bottom: 25px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            }
            
            .section-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 1px solid #e9ecef;
            }
            
            .section-title {
                font-size: 20px;
                color: #2c3e50;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .code-container {
                background: #0d1117;
                border-radius: 8px;
                padding: 20px;
                overflow-x: auto;
                font-family: 'Courier New', monospace;
                font-size: 14px;
                line-height: 1.5;
                margin-top: 15px;
                position: relative;
            }
            
            .code-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
                color: #8b949e;
                font-size: 12px;
                padding-bottom: 10px;
                border-bottom: 1px solid #30363d;
            }
            
            .language-tag {
                background: #238636;
                color: white;
                padding: 4px 10px;
                border-radius: 4px;
                font-weight: 600;
                font-size: 12px;
            }
            
            .code-actions {
                display: flex;
                gap: 10px;
            }
            
            .btn-copy {
                background: #21262d;
                color: #c9d1d9;
                border: 1px solid #30363d;
                padding: 6px 12px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 12px;
                transition: all 0.3s ease;
            }
            
            .btn-copy:hover {
                background: #30363d;
                color: white;
            }
            
            pre {
                margin: 0;
                padding: 0;
                overflow-x: auto;
            }
            
            code {
                font-family: 'Courier New', monospace;
                font-size: 14px;
                line-height: 1.5;
            }
            
            /* Tests section */
            .tests-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 20px;
                margin-top: 20px;
            }
            
            .test-card {
                background: white;
                border-radius: 10px;
                padding: 20px;
                border: 1px solid #e9ecef;
                transition: all 0.3s ease;
            }
            
            .test-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }
            
            .test-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
            }
            
            .test-name {
                font-weight: 600;
                color: #2c3e50;
                font-size: 16px;
            }
            
            .test-status {
                padding: 4px 10px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 600;
                text-transform: uppercase;
            }
            
            .test-passed {
                background: #d3f9d8;
                color: #2b8a3e;
            }
            
            .test-failed {
                background: #ffe3e3;
                color: #c92a2a;
            }
            
            .test-pending {
                background: #fff3bf;
                color: #e67700;
            }
            
            .test-details {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 10px;
                font-size: 13px;
            }
            
            .detail-item {
                display: flex;
                flex-direction: column;
            }
            
            .detail-label {
                color: #6c757d;
                font-size: 12px;
                margin-bottom: 2px;
            }
            
            .detail-value {
                color: #495057;
                font-weight: 500;
                font-family: 'Courier New', monospace;
            }
            
            /* Quality metrics */
            .quality-metrics {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                margin-top: 20px;
            }
            
            .metric-card {
                background: white;
                border-radius: 10px;
                padding: 20px;
                text-align: center;
                border: 1px solid #e9ecef;
            }
            
            .metric-value {
                font-size: 32px;
                font-weight: 700;
                color: #4dabf7;
                margin-bottom: 5px;
            }
            
            .metric-label {
                font-size: 14px;
                color: #6c757d;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .metric-bar {
                height: 8px;
                background: #e9ecef;
                border-radius: 4px;
                margin-top: 10px;
                overflow: hidden;
            }
            
            .metric-fill {
                height: 100%;
                background: linear-gradient(90deg, #4dabf7, #339af0);
                border-radius: 4px;
            }
            
            /* Charts container */
            .charts-container {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
                gap: 20px;
                margin-top: 20px;
            }
            
            .chart-card {
                background: white;
                border-radius: 10px;
                padding: 20px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            }
            
            .chart-title {
                font-size: 16px;
                color: #2c3e50;
                margin-bottom: 15px;
                font-weight: 600;
            }
            
            .chart-wrapper {
                height: 250px;
                position: relative;
            }
            
            /* Review section */
            .review-section {
                background: white;
                border-radius: 10px;
                padding: 30px;
                margin-top: 25px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            }
            
            .review-comment {
                background: #f8f9fa;
                border-radius: 8px;
                padding: 20px;
                border-left: 4px solid #4dabf7;
                margin-top: 15px;
            }
            
            .review-author {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 10px;
            }
            
            .review-avatar {
                width: 32px;
                height: 32px;
                background: #e9ecef;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                color: #495057;
                font-size: 14px;
            }
            
            .review-meta {
                flex: 1;
            }
            
            .review-name {
                font-weight: 600;
                color: #2c3e50;
                font-size: 14px;
            }
            
            .review-date {
                color: #6c757d;
                font-size: 12px;
            }
            
            .review-content {
                color: #495057;
                line-height: 1.6;
                font-size: 14px;
            }
            
            @media (max-width: 768px) {
                .header-top {
                    flex-direction: column;
                }
                
                .header-stats {
                    grid-template-columns: repeat(2, 1fr);
                }
                
                .charts-container {
                    grid-template-columns: 1fr;
                }
                
                .tests-grid {
                    grid-template-columns: 1fr;
                }
                
                .decision-actions {
                    flex-direction: column;
                }
                
                .decision-actions button {
                    width: 100%;
                    justify-content: center;
                }
                
                .test-details {
                    grid-template-columns: 1fr;
                }
                
                .quality-metrics {
                    grid-template-columns: repeat(2, 1fr);
                }
            }
            
            @media (max-width: 480px) {
                .header-stats {
                    grid-template-columns: 1fr;
                }
                
                .quality-metrics {
                    grid-template-columns: 1fr;
                }
                
                .code-actions {
                    flex-direction: column;
                }
            }
        </style>
    `;
    
    const submission = currentSubmission;
    const initials = getInitials(submission.userName);
    const formattedDate = formatDate(submission.date);
    const scorePercentage = Math.round((submission.score / submission.maxScore) * 100);
    
    // Déterminer le badge de statut
    let statusBadge = '';
    switch(submission.status) {
        case 'accepté': 
            statusBadge = '<span class="status-badge-large status-accepted">Accepté</span>'; 
            break;
        case 'rejeté': 
            statusBadge = '<span class="status-badge-large status-rejected">Rejeté</span>'; 
            break;
        case 'en attente': 
            statusBadge = '<span class="status-badge-large status-pending">En attente</span>'; 
            break;
    }
    
    const html = styles + `
        <div class="submission-header">
            <div class="header-top">
                <div class="submission-info">
                    <div class="submission-id">SOUMISSION #${submission.id}</div>
                    <h1 class="submission-title">${submission.challengeName}</h1>
                    
                    <div class="participant-info">
                        <div class="participant-avatar">${initials}</div>
                        <div class="participant-details">
                            <h4>Soumis par ${submission.userName}</h4>
                            <p>Le ${formattedDate}</p>
                        </div>
                    </div>
                    
                    ${statusBadge}
                </div>
                
                <div class="score-display">
                    <div class="score-circle">
                        <div class="score-value">${submission.score}</div>
                        <div class="score-max">/${submission.maxScore}</div>
                    </div>
                    <div class="score-percentage">${scorePercentage}%</div>
                </div>
            </div>
            
            <div class="header-stats">
                <div class="stat-box">
                    <div class="stat-value">${submission.executionTime || 0} ms</div>
                    <div class="stat-label">Temps d'exécution</div>
                </div>
                <div class="stat-box">
                    <div class="stat-value">${submission.memoryUsage || 0} MB</div>
                    <div class="stat-label">Mémoire utilisée</div>
                </div>
                <div class="stat-box">
                    <div class="stat-value">${submission.timeComplexity || 'N/A'}</div>
                    <div class="stat-label">Complexité temporelle</div>
                </div>
                <div class="stat-box">
                    <div class="stat-value">${submission.spaceComplexity || 'N/A'}</div>
                    <div class="stat-label">Complexité spatiale</div>
                </div>
            </div>
            
            ${submission.status === 'en attente' ? `
                <div class="decision-actions">
                    <button class="btn-approve" onclick="openDecisionModal('accepté')">
                        <i class="fas fa-check"></i> Approuver la soumission
                    </button>
                    <button class="btn-reject" onclick="openDecisionModal('rejeté')">
                        <i class="fas fa-times"></i> Rejeter la soumission
                    </button>
                    <button class="btn btn-secondary" onclick="runTests(${submission.id})">
                        <i class="fas fa-play"></i> Exécuter les tests
                    </button>
                </div>
            ` : ''}
        </div>
        
        <div class="code-section">
            <div class="section-header">
                <h2 class="section-title">
                    <i class="fas fa-code"></i> Code Source
                </h2>
                <div class="code-actions">
                    <button class="btn-copy" onclick="copyCode()">
                        <i class="fas fa-copy"></i> Copier le code
                    </button>
                    <button class="btn-copy" onclick="downloadCode(${submission.id})">
                        <i class="fas fa-download"></i> Télécharger
                    </button>
                </div>
            </div>
            
            <div class="code-header">
                <div class="language-tag">${submission.language}</div>
                <div>${submission.linesOfCode || 'N/A'} lignes</div>
            </div>
            
            <div class="code-container">
                <pre><code class="language-${getLanguageClass(submission.language)}">${escapeHtml(submission.code)}</code></pre>
            </div>
        </div>
        
        <div class="code-section">
            <div class="section-header">
                <h2 class="section-title">
                    <i class="fas fa-vial"></i> Résultats des Tests
                </h2>
                <div class="test-summary">
                    ${getTestSummary(submission)}
                </div>
            </div>
            
            ${submission.testResults && submission.testResults.length > 0 ? `
                <div class="tests-grid">
                    ${submission.testResults.map(test => `
                        <div class="test-card">
                            <div class="test-header">
                                <div class="test-name">${test.name}</div>
                                <div class="test-status ${getTestStatusClass(test.status)}">${test.status}</div>
                            </div>
                            
                            <div class="test-details">
                                <div class="detail-item">
                                    <span class="detail-label">Temps d'exécution</span>
                                    <span class="detail-value">${test.executionTime} ms</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">Mémoire</span>
                                    <span class="detail-value">${test.memory} MB</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">Entrée</span>
                                    <span class="detail-value">${test.input}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">Attendu</span>
                                    <span class="detail-value">${test.expected}</span>
                                </div>
                                ${test.actual ? `
                                    <div class="detail-item">
                                        <span class="detail-label">Obtenu</span>
                                        <span class="detail-value">${test.actual}</span>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : '<p>Aucun test disponible</p>'}
        </div>
        
        <div class="code-section">
            <div class="section-header">
                <h2 class="section-title">
                    <i class="fas fa-chart-bar"></i> Métriques de Qualité
                </h2>
            </div>
            
            ${submission.qualityMetrics ? `
                <div class="quality-metrics">
                    <div class="metric-card">
                        <div class="metric-value">${submission.qualityMetrics.cyclomaticComplexity || 0}</div>
                        <div class="metric-label">Complexité Cyclomatique</div>
                        <div class="metric-bar">
                            <div class="metric-fill" style="width: ${Math.min((submission.qualityMetrics.cyclomaticComplexity || 0) * 10, 100)}%"></div>
                        </div>
                    </div>
                    
                    <div class="metric-card">
                        <div class="metric-value">${submission.qualityMetrics.linesOfCode || 0}</div>
                        <div class="metric-label">Lignes de Code</div>
                        <div class="metric-bar">
                            <div class="metric-fill" style="width: ${Math.min((submission.qualityMetrics.linesOfCode || 0) * 2, 100)}%"></div>
                        </div>
                    </div>
                    
                    <div class="metric-card">
                        <div class="metric-value">${submission.qualityMetrics.codeDuplication || 0}%</div>
                        <div class="metric-label">Duplication de Code</div>
                        <div class="metric-bar">
                            <div class="metric-fill" style="width: ${submission.qualityMetrics.codeDuplication || 0}%"></div>
                        </div>
                    </div>
                    
                    <div class="metric-card">
                        <div class="metric-value">${submission.qualityMetrics.codeStyleScore || 0}/100</div>
                        <div class="metric-label">Style de Code</div>
                        <div class="metric-bar">
                            <div class="metric-fill" style="width: ${submission.qualityMetrics.codeStyleScore || 0}%"></div>
                        </div>
                    </div>
                </div>
                
                <div class="charts-container">
                    <div class="chart-card">
                        <div class="chart-title">Distribution des Complexités</div>
                        <div class="chart-wrapper">
                            <canvas id="complexityChart"></canvas>
                        </div>
                    </div>
                    
                    <div class="chart-card">
                        <div class="chart-title">Performances d'Exécution</div>
                        <div class="chart-wrapper">
                            <canvas id="performanceChart"></canvas>
                        </div>
                    </div>
                </div>
            ` : '<p>Aucune métrique de qualité disponible</p>'}
        </div>
        
        ${submission.reviewerComments ? `
            <div class="review-section">
                <h2 class="section-title">
                    <i class="fas fa-comment-medical"></i> Analyse du Reviewer
                </h2>
                
                <div class="review-comment">
                    <div class="review-author">
                        <div class="review-avatar">JD</div>
                        <div class="review-meta">
                            <div class="review-name">Jane Doe</div>
                            <div class="review-date">Admin - ${formattedDate}</div>
                        </div>
                    </div>
                    <div class="review-content">
                        ${submission.reviewerComments}
                    </div>
                </div>
            </div>
        ` : ''}
        
        <style>
            .score-display {
                text-align: center;
                min-width: 150px;
            }
            
            .score-circle {
                width: 100px;
                height: 100px;
                background: linear-gradient(135deg, #4dabf7, #339af0);
                border-radius: 50%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                color: white;
                margin: 0 auto 10px;
                box-shadow: 0 4px 12px rgba(77, 171, 247, 0.3);
            }
            
            .score-value {
                font-size: 32px;
                font-weight: 700;
                line-height: 1;
            }
            
            .score-max {
                font-size: 16px;
                opacity: 0.8;
            }
            
            .score-percentage {
                font-size: 20px;
                font-weight: 600;
                color: #2c3e50;
            }
        </style>
    `;
    
    contentDiv.innerHTML = html;
}

function getTestSummary(submission) {
    if (!submission.testResults || submission.testResults.length === 0) {
        return '<span class="text-muted">Aucun test exécuté</span>';
    }
    
    const passed = submission.testResults.filter(t => t.status === 'réussi').length;
    const failed = submission.testResults.filter(t => t.status === 'échoué').length;
    const pending = submission.testResults.filter(t => t.status === 'en cours').length;
    const total = submission.testResults.length;
    
    return `
        <span class="badge badge-success" style="margin-right: 10px;">
            ${passed} réussi${passed > 1 ? 's' : ''}
        </span>
        <span class="badge badge-danger" style="margin-right: 10px;">
            ${failed} échoué${failed > 1 ? 's' : ''}
        </span>
        ${pending > 0 ? `
            <span class="badge badge-warning">
                ${pending} en attente
            </span>
        ` : ''}
    `;
}

function getTestStatusClass(status) {
    switch(status) {
        case 'réussi': return 'test-passed';
        case 'échoué': return 'test-failed';
        case 'en cours': return 'test-pending';
        default: return 'test-pending';
    }
}

function getLanguageClass(language) {
    const map = {
        'C++': 'cpp',
        'Java': 'java',
        'Python': 'python',
        'JavaScript': 'javascript',
        'TypeScript': 'typescript',
        'C#': 'csharp',
        'PHP': 'php',
        'Ruby': 'ruby',
        'Go': 'go',
        'Rust': 'rust',
        'Swift': 'swift'
    };
    return map[language] || language.toLowerCase();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function initializeCharts() {
    if (!currentSubmission || !currentSubmission.qualityMetrics) return;
    
    // Chart 1: Complexité
    const complexityCtx = document.getElementById('complexityChart');
    if (complexityCtx) {
        const metrics = currentSubmission.qualityMetrics;
        new Chart(complexityCtx, {
            type: 'radar',
            data: {
                labels: ['Complexité', 'Maintenabilité', 'Fiabilité', 'Sécurité', 'Efficacité'],
                datasets: [{
                    label: 'Métriques de qualité',
                    data: [
                        Math.max(0, 100 - (metrics.cyclomaticComplexity || 0) * 10),
                        metrics.codeStyleScore || 0,
                        100 - (metrics.codeDuplication || 0),
                        85,
                        90
                    ],
                    backgroundColor: 'rgba(77, 171, 247, 0.2)',
                    borderColor: '#4dabf7',
                    borderWidth: 2,
                    pointBackgroundColor: '#4dabf7',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                }]
            },
            options: {
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            stepSize: 20
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }
    
    // Chart 2: Performance
    const performanceCtx = document.getElementById('performanceChart');
    if (performanceCtx && currentSubmission.testResults) {
        const testTimes = currentSubmission.testResults.map(t => t.executionTime || 0);
        const testNames = currentSubmission.testResults.map(t => `Test ${t.testId}`);
        
        new Chart(performanceCtx, {
            type: 'bar',
            data: {
                labels: testNames,
                datasets: [{
                    label: 'Temps d\'exécution (ms)',
                    data: testTimes,
                    backgroundColor: testTimes.map(time => 
                        time < 50 ? '#40c057' : 
                        time < 100 ? '#ff922b' : 
                        '#fa5252'
                    ),
                    borderColor: testTimes.map(time => 
                        time < 50 ? '#2b8a3e' : 
                        time < 100 ? '#e67700' : 
                        '#c92a2a'
                    ),
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
                            text: 'Temps (ms)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Tests'
                        }
                    }
                }
            }
        });
    }
}

function copyCode() {
    if (!currentSubmission) return;
    
    navigator.clipboard.writeText(currentSubmission.code)
        .then(() => showNotification('Code copié dans le presse-papier', 'success'))
        .catch(err => {
            console.error('Erreur lors de la copie:', err);
            showNotification('Erreur lors de la copie', 'error');
        });
}

function downloadCode(submissionId) {
    if (!currentSubmission) return;
    
    const blob = new Blob([currentSubmission.code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `submission_${submissionId}.${getFileExtension(currentSubmission.language)}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('Code téléchargé', 'success');
}

function getFileExtension(language) {
    const map = {
        'C++': 'cpp',
        'Java': 'java',
        'Python': 'py',
        'JavaScript': 'js',
        'TypeScript': 'ts',
        'C#': 'cs',
        'PHP': 'php',
        'Ruby': 'rb',
        'Go': 'go',
        'Rust': 'rs',
        'Swift': 'swift'
    };
    return map[language] || 'txt';
}

function openDecisionModal(defaultStatus) {
    const modal = document.getElementById('decisionModal');
    const statusSelect = document.getElementById('finalStatus');
    const scoreInput = document.getElementById('finalScore');
    
    if (modal && statusSelect && scoreInput) {
        statusSelect.value = defaultStatus;
        scoreInput.value = currentSubmission ? currentSubmission.score : 0;
        modal.style.display = 'flex';
    }
}

function closeDecisionModal() {
    const modal = document.getElementById('decisionModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function saveDecision() {
    const statusSelect = document.getElementById('finalStatus');
    const scoreInput = document.getElementById('finalScore');
    const commentInput = document.getElementById('finalComment');
    
    if (!statusSelect || !scoreInput || !commentInput || !currentSubmission) return;
    
    const newStatus = statusSelect.value;
    const newScore = parseInt(scoreInput.value);
    const comment = commentInput.value;
    
    // Mettre à jour la soumission
    currentSubmission.status = newStatus;
    currentSubmission.score = newScore;
    if (comment) {
        currentSubmission.reviewerComments = comment;
    }
    
    // Dans un cas réel, on enverrait la mise à jour au serveur
    showNotification(`Soumission ${newStatus === 'accepté' ? 'approuvée' : 'rejetée'}`, 'success');
    closeDecisionModal();
    
    // Recharger les détails
    setTimeout(() => {
        displaySubmissionDetails();
        hljs.highlightAll();
        initializeCharts();
    }, 500);
}

function runTests(submissionId) {
    showNotification('Exécution des tests en cours...', 'info');
    
    // Simulation de tests
    setTimeout(() => {
        if (currentSubmission) {
            currentSubmission.testResults.forEach(test => {
                if (test.status === 'en cours') {
                    test.status = Math.random() > 0.3 ? 'réussi' : 'échoué';
                    test.executionTime = Math.floor(Math.random() * 200) + 50;
                    test.memory = Math.floor(Math.random() * 100) + 100;
                }
            });
            
            // Mettre à jour l'affichage
            displaySubmissionDetails();
            hljs.highlightAll();
            initializeCharts();
            showNotification('Tests exécutés avec succès', 'success');
        }
    }, 2000);
}

function showError(message) {
    const contentDiv = document.getElementById('submissionDetailsContent');
    if (!contentDiv) return;
    
    contentDiv.innerHTML = `
        <div class="error-state">
            <i class="fas fa-exclamation-triangle"></i>
            <h2>Erreur</h2>
            <p>${message}</p>
            <a href="submissions.html" class="btn btn-primary">
                <i class="fas fa-arrow-left"></i> Retour à la liste
            </a>
        </div>
    `;
}

// Fonctions utilitaires
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 3);
}

function logout() {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
        window.location.href = 'index.html';
    }
}

// Exposer les fonctions globales
window.copyCode = copyCode;
window.downloadCode = downloadCode;
window.openDecisionModal = openDecisionModal;
window.closeDecisionModal = closeDecisionModal;
window.saveDecision = saveDecision;
window.runTests = runTests;
window.logout = logout;