// Jekyll 预览模块

const previewBtn = document.getElementById('preview-btn');
const previewStopBtn = document.getElementById('preview-stop-btn');
let previewRunning = false;
let previewUrl = null;

// 页面加载时检查预览状态
(async function checkPreviewStatus() {
    try {
        const status = await apiRequest('/preview/status');
        updatePreviewButton(status.running, status.url);
    } catch (_) {
        // ignore
    }
})();

function updatePreviewButton(running, url) {
    previewRunning = running;
    previewUrl = url;
    if (running) {
        previewBtn.classList.remove('btn-secondary');
        previewBtn.classList.add('btn-success');
        previewBtn.innerHTML = '<i class="fas fa-eye mr-2"></i>预览中';
        previewBtn.title = '点击打开预览页面';
        previewStopBtn.style.display = '';
    } else {
        previewBtn.classList.remove('btn-success');
        previewBtn.classList.add('btn-secondary');
        previewBtn.innerHTML = '<i class="fas fa-eye mr-2"></i>预览';
        previewBtn.title = '启动 Jekyll 本地预览';
        previewStopBtn.style.display = 'none';
    }
}

// 点击：启动预览或打开预览页面
previewBtn?.addEventListener('click', async () => {
    if (previewRunning && previewUrl) {
        window.open(previewUrl, '_blank');
        return;
    }

    // 未运行 → 启动
    previewBtn.disabled = true;
    previewBtn.innerHTML = '<span class="spinner mr-2"></span>启动中...';

    try {
        const result = await apiRequest('/preview/start', { method: 'POST' });
        if (result.success) {
            showNotification(result.message, 'success');
            updatePreviewButton(true, result.url);
            setTimeout(() => {
                if (result.url) window.open(result.url, '_blank');
            }, 4000);
        } else {
            showNotification(result.message, 'error');
            updatePreviewButton(false, null);
        }
    } catch (error) {
        showNotification('启动预览失败: ' + error.message, 'error');
        updatePreviewButton(false, null);
    } finally {
        previewBtn.disabled = false;
    }
});

// 停止按钮
previewStopBtn?.addEventListener('click', async () => {
    previewStopBtn.disabled = true;
    try {
        const result = await apiRequest('/preview/stop', { method: 'POST' });
        showNotification(result.message, 'info');
        updatePreviewButton(false, null);
    } catch (error) {
        showNotification('停止预览失败: ' + error.message, 'error');
    } finally {
        previewStopBtn.disabled = false;
    }
});
