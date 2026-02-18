// Git 管理模块

// 加载 Git 信息
async function loadGitInfo() {
    await loadGitStatus();
    await loadGitDiff();
    await loadRecentCommits();
}

// 加载详细的 Git 状态
async function loadGitStatus() {
    try {
        const status = await apiRequest('/git/status');
        AppState.gitStatus = status;
        renderGitStatus();
    } catch (error) {
        showNotification('加载 Git 状态失败: ' + error.message, 'error');
    }
}

// 渲染 Git 状态
function renderGitStatus() {
    const container = document.getElementById('git-detailed-status');
    const status = AppState.gitStatus;

    const modifiedCount = status.modified_files?.length || 0;
    const untrackedCount = status.untracked_files?.length || 0;
    const stagedCount = status.staged_files?.length || 0;

    container.innerHTML = `
        <div class="space-y-2">
            <div class="flex items-center justify-between">
                <span class="font-medium">当前分支:</span>
                <span class="badge badge-blue">${escapeHtml(status.branch || '-')}</span>
            </div>
            <div class="flex items-center justify-between">
                <span class="font-medium">仓库状态:</span>
                <span class="badge ${status.is_dirty ? 'badge-yellow' : 'badge-green'}">
                    ${status.is_dirty ? '有未提交的更改' : '干净'}
                </span>
            </div>
            ${modifiedCount > 0 ? `
                <div class="mt-4">
                    <p class="font-medium mb-2">已修改文件 (${modifiedCount}):</p>
                    <ul class="list-disc list-inside text-sm text-gray-600">
                        ${status.modified_files.map(f => `<li>${escapeHtml(f)}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
            ${untrackedCount > 0 ? `
                <div class="mt-4">
                    <p class="font-medium mb-2">未跟踪文件 (${untrackedCount}):</p>
                    <ul class="list-disc list-inside text-sm text-gray-600">
                        ${status.untracked_files.map(f => `<li>${escapeHtml(f)}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
            ${stagedCount > 0 ? `
                <div class="mt-4">
                    <p class="font-medium mb-2">已暂存文件 (${stagedCount}):</p>
                    <ul class="list-disc list-inside text-sm text-gray-600">
                        ${status.staged_files.map(f => `<li>${escapeHtml(f)}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
        </div>
    `;

    // 更新顶部状态
    document.getElementById('branch-name').textContent = status.branch || '-';
}

// 加载 Git diff
async function loadGitDiff() {
    try {
        const result = await apiRequest('/git/diff');
        renderGitDiff(result.diff);
    } catch (error) {
        console.error('加载 diff 失败:', error);
    }
}

// 渲染 Git diff
function renderGitDiff(diff) {
    const container = document.getElementById('git-diff');

    if (!diff || diff.trim() === '') {
        container.textContent = '没有更改';
        container.className = 'bg-gray-50 text-gray-500 rounded p-4 text-sm text-center';
        return;
    }

    container.textContent = diff;
    container.className = 'bg-gray-900 text-gray-100 rounded p-4 overflow-x-auto text-sm font-mono';
}

// 加载最近提交
async function loadRecentCommits() {
    try {
        const commits = await apiRequest('/git/commits?limit=10');
        renderRecentCommits(commits);
    } catch (error) {
        console.error('加载提交历史失败:', error);
    }
}

// 渲染最近提交
function renderRecentCommits(commits) {
    const container = document.getElementById('recent-commits');

    if (commits.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-sm">没有提交记录</p>';
        return;
    }

    container.innerHTML = commits.map(commit => `
        <div class="bg-gray-50 rounded p-3 border border-gray-200">
            <div class="flex items-start justify-between">
                <div class="flex-1">
                    <p class="font-medium text-gray-900">${escapeHtml(commit.message)}</p>
                    <p class="text-sm text-gray-600 mt-1">
                        <span class="badge badge-blue">${commit.sha}</span>
                        <span class="ml-2">${escapeHtml(commit.author)}</span>
                        <span class="ml-2">${formatDate(commit.date)}</span>
                    </p>
                </div>
            </div>
        </div>
    `).join('');
}

// 提交更改
document.getElementById('commit-btn')?.addEventListener('click', async () => {
    const message = document.getElementById('commit-message').value.trim();

    if (!message) {
        showNotification('请输入提交信息', 'warning');
        return;
    }

    const btn = document.getElementById('commit-btn');
    const originalText = btn.innerHTML;

    try {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>提交中...';

        await apiRequest('/git/commit', {
            method: 'POST',
            body: JSON.stringify({
                message: message,
                push: false,
            }),
        });

        showNotification('提交成功', 'success');
        document.getElementById('commit-message').value = '';
        await loadGitInfo();
    } catch (error) {
        showNotification('提交失败: ' + error.message, 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
});

// 提交并推送
document.getElementById('commit-push-btn')?.addEventListener('click', async () => {
    const message = document.getElementById('commit-message').value.trim();

    if (!message) {
        showNotification('请输入提交信息', 'warning');
        return;
    }

    const btn = document.getElementById('commit-push-btn');
    const originalText = btn.innerHTML;

    try {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>提交并推送中...';

        await apiRequest('/git/commit', {
            method: 'POST',
            body: JSON.stringify({
                message: message,
                push: true,
            }),
        });

        showNotification('提交并推送成功', 'success');
        document.getElementById('commit-message').value = '';
        await loadGitInfo();
    } catch (error) {
        showNotification('提交并推送失败: ' + error.message, 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
});
