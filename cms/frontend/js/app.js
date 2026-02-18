// API 基础 URL
const API_BASE = '/api';

// 全局状态
const AppState = {
    currentTab: 'publications',
    publications: [],
    news: [],
    profile: {},
    gitStatus: {}
};

// 初始化应用
document.addEventListener('DOMContentLoaded', async () => {
    console.log('CMS 初始化中...');

    // 初始化 Tab 切换
    initTabs();

    // 加载初始数据
    await loadInitialData();

    // 绑定事件
    bindEvents();

    console.log('CMS 初始化完成');
});

// 初始化 Tab 切换
function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.tab;

            // 移除所有激活状态
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // 添加当前激活状态
            btn.classList.add('active');
            document.getElementById(`${tabName}-tab`).classList.add('active');

            // 更新状态
            AppState.currentTab = tabName;

            // 重新加载数据
            loadTabData(tabName);
        });
    });
}

// 加载初始数据
async function loadInitialData() {
    showLoading();

    try {
        // 加载 Git 状态
        await loadGitStatus();

        // 加载当前 Tab 的数据
        await loadTabData(AppState.currentTab);

        hideLoading();
    } catch (error) {
        console.error('加载数据失败:', error);
        showNotification('加载数据失败: ' + error.message, 'error');
        hideLoading();
    }
}

// 加载 Tab 数据
async function loadTabData(tabName) {
    switch (tabName) {
        case 'publications':
            await loadPublications();
            break;
        case 'news':
            await loadNews();
            break;
        case 'profile':
            await loadProfile();
            break;
        case 'git':
            await loadGitInfo();
            break;
    }
}

// 绑定事件
function bindEvents() {
    // 同步按钮
    document.getElementById('sync-btn').addEventListener('click', async () => {
        await syncToGit();
    });
}

// API 请求封装
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;

    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    const finalOptions = { ...defaultOptions, ...options };

    try {
        const response = await fetch(url, finalOptions);

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || `HTTP ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API 请求失败:', error);
        throw error;
    }
}

// 加载 Git 状态
async function loadGitStatus() {
    try {
        const status = await apiRequest('/git/status');
        AppState.gitStatus = status;

        // 更新顶部显示
        document.getElementById('branch-name').textContent = status.branch;

        return status;
    } catch (error) {
        console.error('加载 Git 状态失败:', error);
    }
}

// 同步到 Git
async function syncToGit() {
    const btn = document.getElementById('sync-btn');
    const deployCheckbox = document.getElementById('deploy-checkbox');
    const deploy = deployCheckbox?.checked || false;
    const originalText = btn.innerHTML;

    try {
        btn.disabled = true;
        btn.innerHTML = deploy
            ? '<i class="fas fa-spinner fa-spin mr-2"></i>部署中...'
            : '<i class="fas fa-spinner fa-spin mr-2"></i>同步中...';

        const url = deploy ? '/git/auto-commit?deploy=true' : '/git/auto-commit';
        const result = await apiRequest(url, {
            method: 'POST',
        });

        if (result.success) {
            if (result.deployed) {
                showNotification('已提交并部署到 main 分支，网站将自动更新', 'success');
            } else {
                showNotification('成功提交并推送到远程仓库', 'success');
            }
            if (deployCheckbox) deployCheckbox.checked = false;
            await loadGitStatus();
        } else {
            showNotification(result.error || '同步失败', 'error');
        }
    } catch (error) {
        showNotification('同步失败: ' + error.message, 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
}

// 显示通知
function showNotification(message, type = 'info') {
    const container = document.getElementById('notification-container');

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="flex items-center justify-between">
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-white hover:text-gray-200">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

    container.appendChild(notification);

    // 3秒后自动移除
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// 显示加载状态
function showLoading() {
    // 可以添加全局加载动画
    console.log('加载中...');
}

// 隐藏加载状态
function hideLoading() {
    console.log('加载完成');
}

// 格式化日期
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN');
}

// 转义 HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 上传文件
async function uploadFile(file, endpoint) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        throw new Error('上传失败');
    }

    return await response.json();
}
