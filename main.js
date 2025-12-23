// 静水流深 - 诗意项目管理应用
// 主要JavaScript逻辑

class ProjectManager {
    constructor() {
        this.projects = this.loadProjects();
        this.focusSessions = this.loadFocusSessions();
        this.settings = this.loadSettings();
        this.currentFilters = {
            category: ['work', 'study', 'life', 'creative'],
            priority: ['high', 'medium', 'low'],
            status: ['pending', 'in-progress']
        };
        this.currentSort = 'created';
        this.searchQuery = '';
        
        this.init();
    }

    init() {
        this.initTheme();
        this.bindEvents();
        this.renderProjects();
        this.updateStats();
        this.initAnimations();
    }

    // 主题系统
    initTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        this.setTheme(savedTheme);
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
        this.showNotification('主题已切换', 'success');
    }

    // 数据管理
    loadProjects() {
        const saved = localStorage.getItem('projects');
        if (saved) {
            return JSON.parse(saved);
        }
        
        // 返回示例数据
        return [
            {
                id: this.generateId(),
                name: '网站重构项目',
                description: '重新设计和开发现有的企业网站，提升用户体验和性能',
                category: 'work',
                priority: 'high',
                status: 'in-progress',
                tags: ['前端开发', 'UI设计', '性能优化'],
                createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                updatedAt: new Date().toISOString(),
                dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
                totalFocusTime: 7200,
                focusSessions: []
            },
            {
                id: this.generateId(),
                name: '学习React框架',
                description: '深入学习React生态系统和最佳实践',
                category: 'study',
                priority: 'medium',
                status: 'pending',
                tags: ['React', 'JavaScript', '前端'],
                createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                updatedAt: new Date().toISOString(),
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                totalFocusTime: 3600,
                focusSessions: []
            },
            {
                id: this.generateId(),
                name: '健身计划',
                description: '制定并执行个人健身计划，保持健康生活方式',
                category: 'life',
                priority: 'medium',
                status: 'in-progress',
                tags: ['健康', '运动', '生活方式'],
                createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                updatedAt: new Date().toISOString(),
                dueDate: null,
                totalFocusTime: 1800,
                focusSessions: []
            },
            {
                id: this.generateId(),
                name: '摄影作品集',
                description: '整理和编辑个人摄影作品，制作在线作品集',
                category: 'creative',
                priority: 'low',
                status: 'pending',
                tags: ['摄影', '设计', '作品集'],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
                totalFocusTime: 0,
                focusSessions: []
            }
        ];
    }

    loadFocusSessions() {
        const saved = localStorage.getItem('focusSessions');
        return saved ? JSON.parse(saved) : [];
    }

    loadSettings() {
        const saved = localStorage.getItem('settings');
        return saved ? JSON.parse(saved) : {
            theme: 'light',
            notifications: { enabled: true, sound: true, desktop: true },
            focusSettings: { defaultDuration: 1500, breakDuration: 300, autoStartBreak: true },
            statistics: { dailyGoal: 7200, weeklyGoal: 25200 }
        };
    }

    saveProjects() {
        localStorage.setItem('projects', JSON.stringify(this.projects));
    }

    saveFocusSessions() {
        localStorage.setItem('focusSessions', JSON.stringify(this.focusSessions));
    }

    saveSettings() {
        localStorage.setItem('settings', JSON.stringify(this.settings));
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // 项目管理
    addProject(projectData) {
        const project = {
            id: this.generateId(),
            ...projectData,
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            totalFocusTime: 0,
            focusSessions: []
        };
        
        this.projects.unshift(project);
        this.saveProjects();
        this.renderProjects();
        this.updateStats();
        this.showNotification('项目已创建，时光开始流转', 'success');
        
        return project;
    }

    updateProject(id, updates) {
        const index = this.projects.findIndex(p => p.id === id);
        if (index !== -1) {
            this.projects[index] = {
                ...this.projects[index],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            this.saveProjects();
            this.renderProjects();
            this.updateStats();
            this.showNotification('项目已更新，如流水般自然', 'success');
        }
    }

    deleteProject(id) {
        const index = this.projects.findIndex(p => p.id === id);
        if (index !== -1) {
            this.projects.splice(index, 1);
            this.saveProjects();
            this.renderProjects();
            this.updateStats();
            this.showNotification('项目已归墟，重新开始', 'info');
        }
    }

    startFocus(projectId) {
        const project = this.projects.find(p => p.id === projectId);
        if (project) {
            // 保存当前专注的项目ID到localStorage
            localStorage.setItem('currentFocusProject', projectId);
            // 跳转到专注页面
            window.location.href = 'focus.html';
        }
    }

    // 筛选和排序
    applyFilters() {
        let filtered = this.projects.filter(project => {
            // 分类筛选
            if (!this.currentFilters.category.includes(project.category)) return false;
            
            // 优先级筛选
            if (!this.currentFilters.priority.includes(project.priority)) return false;
            
            // 状态筛选
            if (!this.currentFilters.status.includes(project.status)) return false;
            
            // 搜索筛选
            if (this.searchQuery) {
                const query = this.searchQuery.toLowerCase();
                return project.name.toLowerCase().includes(query) ||
                       project.description.toLowerCase().includes(query) ||
                       project.tags.some(tag => tag.toLowerCase().includes(query));
            }
            
            return true;
        });

        // 排序
        filtered.sort((a, b) => {
            switch (this.currentSort) {
                case 'priority':
                    const priorityOrder = { high: 3, medium: 2, low: 1 };
                    return priorityOrder[b.priority] - priorityOrder[a.priority];
                case 'due-date':
                    if (!a.dueDate) return 1;
                    if (!b.dueDate) return -1;
                    return new Date(a.dueDate) - new Date(b.dueDate);
                case 'focus-time':
                    return b.totalFocusTime - a.totalFocusTime;
                case 'created':
                default:
                    return new Date(b.createdAt) - new Date(a.createdAt);
            }
        });

        return filtered;
    }

    // 渲染函数
    renderProjects() {
        const container = document.getElementById('projects-container');
        const emptyState = document.getElementById('empty-state');
        const filtered = this.applyFilters();

        if (filtered.length === 0) {
            container.innerHTML = '';
            emptyState.classList.remove('hidden');
            return;
        }

        emptyState.classList.add('hidden');
        container.innerHTML = filtered.map(project => this.createProjectCard(project)).join('');
        
        // 添加事件监听
        this.bindProjectEvents();
    }

    createProjectCard(project) {
        const categoryNames = {
            work: '工作',
            study: '学习',
            life: '生活',
            creative: '创意'
        };

        const priorityNames = {
            high: '高',
            medium: '中',
            low: '低'
        };

        const statusNames = {
            pending: '待开始',
            'in-progress': '进行中',
            completed: '已完成'
        };

        const dueDate = project.dueDate ? new Date(project.dueDate) : null;
        const isOverdue = dueDate && dueDate < new Date() && project.status !== 'completed';
        const daysUntilDue = dueDate ? Math.ceil((dueDate - new Date()) / (1000 * 60 * 60 * 24)) : null;

        const focusHours = Math.floor(project.totalFocusTime / 3600);
        const focusMinutes = Math.floor((project.totalFocusTime % 3600) / 60);

        return `
            <div class="project-card glass-card rounded-xl p-6 priority-${project.priority} category-${project.category}" data-project-id="${project.id}">
                <div class="flex justify-between items-start mb-4">
                    <div class="flex-1">
                        <h3 class="text-lg font-semibold mb-2 line-clamp-2">${project.name}</h3>
                        <p class="text-sm text-gray-500 mb-3 line-clamp-2">${project.description}</p>
                    </div>
                    <div class="flex items-center space-x-2 ml-4">
                        <button class="edit-project-btn p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" data-project-id="${project.id}">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                            </svg>
                        </button>
                        <button class="delete-project-btn p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" data-project-id="${project.id}">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                        </button>
                    </div>
                </div>

                <div class="flex flex-wrap gap-2 mb-4">
                    <span class="tag px-2 py-1 rounded-full text-xs">${categoryNames[project.category]}</span>
                    <span class="tag px-2 py-1 rounded-full text-xs">优先级 ${priorityNames[project.priority]}</span>
                    <span class="tag px-2 py-1 rounded-full text-xs">${statusNames[project.status]}</span>
                    ${project.tags.map(tag => `<span class="tag px-2 py-1 rounded-full text-xs">${tag}</span>`).join('')}
                </div>

                ${project.dueDate ? `
                    <div class="mb-4">
                        <div class="flex items-center justify-between text-sm mb-1">
                            <span class="text-gray-500">截止日期</span>
                            <span class="${isOverdue ? 'text-red-500' : 'text-gray-600'}">
                                ${dueDate.toLocaleDateString('zh-CN')}
                                ${daysUntilDue !== null ? daysUntilDue < 0 ? `(逾期 ${Math.abs(daysUntilDue)} 天)` : daysUntilDue === 0 ? '(今天)' : `(还有 ${daysUntilDue} 天)` : ''}
                            </span>
                        </div>
                    </div>
                ` : ''}

                <div class="mb-4">
                    <div class="flex items-center justify-between text-sm mb-1">
                        <span class="text-gray-500">专注时间</span>
                        <span class="text-gray-600">${focusHours}小时${focusMinutes}分</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${Math.min(100, (project.totalFocusTime / 3600) * 10)}%"></div>
                    </div>
                </div>

                <div class="flex space-x-2">
                    <button class="start-focus-btn btn-primary flex-1 ripple-effect" data-project-id="${project.id}">
                        <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15M9 10V9a2 2 0 012-2h2a2 2 0 012 2v1M9 10v5a2 2 0 002 2h2a2 2 0 002-2v-5"/>
                        </svg>
                        开始专注
                    </button>
                    <button class="btn-secondary px-3" onclick="projectManager.editProject('${project.id}')">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }

    // 更新统计信息
    updateStats() {
        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        
        // 今日专注时间
        const todayFocusTime = this.focusSessions
            .filter(session => new Date(session.startTime) >= todayStart)
            .reduce((total, session) => total + session.duration, 0);
        
        const todayHours = Math.floor(todayFocusTime / 3600);
        const todayMinutes = Math.floor((todayFocusTime % 3600) / 60);
        document.getElementById('today-focus-time').textContent = `${todayHours}小时${todayMinutes}分`;

        // 进行中的项目
        const activeProjects = this.projects.filter(p => p.status === 'in-progress').length;
        document.getElementById('active-projects').textContent = activeProjects;

        // 即将到期
        const dueSoon = this.projects.filter(p => {
            if (!p.dueDate || p.status === 'completed') return false;
            const dueDate = new Date(p.dueDate);
            const daysUntil = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
            return daysUntil >= 0 && daysUntil <= 3;
        }).length;
        document.getElementById('due-soon').textContent = dueSoon;
    }

    // 事件绑定
    bindEvents() {
        // 移动端菜单
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const sidebar = document.getElementById('sidebar');
        
        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', () => {
                sidebar.classList.toggle('open');
            });
        }

        // 新增项目按钮
        const addProjectBtn = document.getElementById('add-project-btn');
        if (addProjectBtn) {
            addProjectBtn.addEventListener('click', () => {
                this.showProjectModal();
            });
        }

        // 模态框关闭
        const closeModal = document.getElementById('close-modal');
        const cancelBtn = document.getElementById('cancel-btn');
        const modal = document.getElementById('project-modal');
        
        if (closeModal) {
            closeModal.addEventListener('click', () => {
                this.hideProjectModal();
            });
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.hideProjectModal();
            });
        }

        // 点击模态框背景关闭
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideProjectModal();
                }
            });
        }

        // 项目表单提交
        const projectForm = document.getElementById('project-form');
        if (projectForm) {
            projectForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleProjectSubmit();
            });
        }

        // 搜索
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value;
                this.renderProjects();
            });
        }

        // 排序
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.currentSort = e.target.value;
                this.renderProjects();
            });
        }

        // 筛选器
        const filterCheckboxes = document.querySelectorAll('.filter-checkbox');
        filterCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateFilters();
            });
        });

        // 清除筛选
        const clearFiltersBtn = document.getElementById('clear-filters-btn');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => {
                this.clearFilters();
            });
        }
    }

    bindProjectEvents() {
        // 开始专注按钮
        const startFocusBtns = document.querySelectorAll('.start-focus-btn');
        startFocusBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const projectId = btn.getAttribute('data-project-id');
                this.startFocus(projectId);
            });
        });

        // 删除项目按钮
        const deleteBtns = document.querySelectorAll('.delete-project-btn');
        deleteBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const projectId = btn.getAttribute('data-project-id');
                if (confirm('确定要删除这个项目吗？此操作无法撤销。')) {
                    this.deleteProject(projectId);
                }
            });
        });

        // 编辑项目按钮
        const editBtns = document.querySelectorAll('.edit-project-btn');
        editBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const projectId = btn.getAttribute('data-project-id');
                this.editProject(projectId);
            });
        });
    }

    updateFilters() {
        const checkboxes = document.querySelectorAll('.filter-checkbox');
        
        this.currentFilters = {
            category: [],
            priority: [],
            status: []
        };

        checkboxes.forEach(checkbox => {
            if (checkbox.checked) {
                const filterType = checkbox.getAttribute('data-filter');
                const value = checkbox.value;
                this.currentFilters[filterType].push(value);
            }
        });

        this.renderProjects();
    }

    clearFilters() {
        const checkboxes = document.querySelectorAll('.filter-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = true;
        });
        
        document.getElementById('search-input').value = '';
        this.searchQuery = '';
        
        this.updateFilters();
        this.showNotification('筛选已清除，如清风拂过', 'info');
    }

    // 模态框管理
    showProjectModal(project = null) {
        const modal = document.getElementById('project-modal');
        const form = document.getElementById('project-form');
        const title = modal.querySelector('h3');
        
        if (project) {
            title.textContent = '编辑项目';
            document.getElementById('project-name').value = project.name;
            document.getElementById('project-description').value = project.description;
            document.getElementById('project-category').value = project.category;
            document.getElementById('project-priority').value = project.priority;
            document.getElementById('project-due-date').value = project.dueDate ? project.dueDate.split('T')[0] : '';
            document.getElementById('project-tags').value = project.tags.join(', ');
            form.setAttribute('data-edit-id', project.id);
        } else {
            title.textContent = '创建新项目';
            form.reset();
            form.removeAttribute('data-edit-id');
        }
        
        modal.classList.remove('hidden');
        document.getElementById('project-name').focus();
    }

    hideProjectModal() {
        const modal = document.getElementById('project-modal');
        modal.classList.add('hidden');
    }

    handleProjectSubmit() {
        const form = document.getElementById('project-form');
        const editId = form.getAttribute('data-edit-id');
        
        const projectData = {
            name: document.getElementById('project-name').value.trim(),
            description: document.getElementById('project-description').value.trim(),
            category: document.getElementById('project-category').value,
            priority: document.getElementById('project-priority').value,
            dueDate: document.getElementById('project-due-date').value || null,
            tags: document.getElementById('project-tags').value
                .split(',')
                .map(tag => tag.trim())
                .filter(tag => tag.length > 0)
        };

        if (editId) {
            this.updateProject(editId, projectData);
        } else {
            this.addProject(projectData);
        }
        
        this.hideProjectModal();
    }

    editProject(projectId) {
        const project = this.projects.find(p => p.id === projectId);
        if (project) {
            this.showProjectModal(project);
        }
    }

    // 通知系统
    showNotification(message, type = 'info') {
        const container = document.getElementById('notification-container');
        const notification = document.createElement('div');
        
        const colors = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            warning: 'bg-yellow-500',
            info: 'bg-blue-500'
        };

        notification.className = `glass-card rounded-lg p-4 text-white ${colors[type]} transform translate-x-full transition-transform duration-300`;
        notification.innerHTML = `
            <div class="flex items-center space-x-3">
                <div class="flex-shrink-0">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
                    </svg>
                </div>
                <div class="flex-1">
                    <p class="text-sm font-medium">${message}</p>
                </div>
                <button class="flex-shrink-0 text-white hover:text-gray-200" onclick="this.parentElement.parentElement.remove()">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                    </svg>
                </button>
            </div>
        `;

        container.appendChild(notification);
        
        // 动画显示
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);

        // 自动隐藏
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
    }

    // 动画初始化
    initAnimations() {
        // 页面加载动画
        anime({
            targets: '.floating-animation',
            translateY: [-20, 0],
            opacity: [0, 1],
            delay: anime.stagger(100),
            duration: 800,
            easing: 'easeOutCubic'
        });

        // 卡片悬停动画
        document.addEventListener('mouseenter', (e) => {
            if (e.target.classList.contains('project-card')) {
                anime({
                    targets: e.target,
                    scale: 1.02,
                    duration: 200,
                    easing: 'easeOutCubic'
                });
            }
        }, true);

        document.addEventListener('mouseleave', (e) => {
            if (e.target.classList.contains('project-card')) {
                anime({
                    targets: e.target,
                    scale: 1,
                    duration: 200,
                    easing: 'easeOutCubic'
                });
            }
        }, true);
    }

    // 数据导出
    exportData() {
        const data = {
            projects: this.projects,
            focusSessions: this.focusSessions,
            settings: this.settings,
            exportDate: new Date().toISOString(),
            version: '1.0.0'
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `静水流深-数据备份-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showNotification('数据已导出，如流水般清澈', 'success');
    }

    // 数据导入
    importData(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                if (data.projects && data.focusSessions && data.settings) {
                    this.projects = data.projects;
                    this.focusSessions = data.focusSessions;
                    this.settings = { ...this.settings, ...data.settings };
                    
                    this.saveProjects();
                    this.saveFocusSessions();
                    this.saveSettings();
                    
                    this.renderProjects();
                    this.updateStats();
                    this.setTheme(this.settings.theme);
                    
                    this.showNotification('数据已导入，时光重新流转', 'success');
                } else {
                    throw new Error('数据格式不正确');
                }
            } catch (error) {
                this.showNotification('数据导入失败，请检查文件格式', 'error');
            }
        };
        reader.readAsText(file);
    }

    // 清空所有数据（归墟）
    clearAllData() {
        if (confirm('确定要清空所有数据吗？此操作无法撤销，建议先导出数据备份。')) {
            localStorage.removeItem('projects');
            localStorage.removeItem('focusSessions');
            localStorage.removeItem('settings');
            
            this.projects = [];
            this.focusSessions = [];
            this.settings = this.loadSettings();
            
            this.renderProjects();
            this.updateStats();
            this.showNotification('所有数据已归墟，如梦幻泡影', 'info');
        }
    }
}

// 全局实例
const projectManager = new ProjectManager();

// 页面加载完成后的初始化
document.addEventListener('DOMContentLoaded', () => {
    // 添加一些示例动画
    anime({
        targets: '.glass-card',
        scale: [0.95, 1],
        opacity: [0, 1],
        delay: anime.stagger(50),
        duration: 600,
        easing: 'easeOutCubic'
    });
});

// 导出全局函数供HTML调用
window.projectManager = projectManager;