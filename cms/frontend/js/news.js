// 新闻管理模块

// 加载新闻列表
async function loadNews() {
    try {
        const news = await apiRequest('/news/');
        AppState.news = news;
        renderNews();
    } catch (error) {
        showNotification('加载新闻列表失败: ' + error.message, 'error');
    }
}

// 渲染新闻列表
function renderNews() {
    const container = document.getElementById('news-list');

    if (AppState.news.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-newspaper"></i>
                <p class="mt-2">还没有添加新闻动态</p>
                <p class="text-sm">点击右上角"添加新闻"按钮开始</p>
            </div>
        `;
        return;
    }

    container.innerHTML = AppState.news.map((item, index) => `
        <div class="news-card">
            <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                    <span class="badge badge-blue">${escapeHtml(item.date)}</span>
                </div>
                <p class="text-gray-800">${escapeHtml(item.content)}</p>
            </div>
            <div class="flex gap-2">
                <button onclick="editNews(${index})" class="btn-success">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteNews(${index})" class="btn-danger">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// 打开添加新闻模态框
document.getElementById('add-news-btn')?.addEventListener('click', () => {
    openNewsModal();
});

// 打开新闻模态框
function openNewsModal(newsItem = null, index = null) {
    const modal = document.getElementById('news-modal');
    const form = document.getElementById('news-form');
    const title = document.getElementById('news-modal-title');

    // 重置表单
    form.reset();

    if (newsItem) {
        // 编辑模式
        title.textContent = '编辑新闻';
        document.getElementById('news-edit-index').value = index;

        // 填充表单
        form.date.value = newsItem.date || '';
        form.content.value = newsItem.content || '';
    } else {
        // 添加模式
        title.textContent = '添加新闻';
        document.getElementById('news-edit-index').value = '';

        // 自动填充当前日期
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        form.date.value = `${year}-${month}`;
    }

    modal.classList.add('active');
}

// 关闭新闻模态框
function closeNewsModal() {
    const modal = document.getElementById('news-modal');
    modal.classList.remove('active');
}

// 保存新闻
async function saveNews() {
    const form = document.getElementById('news-form');
    const index = document.getElementById('news-edit-index').value;

    // 验证表单
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    // 收集数据
    const data = {
        date: form.date.value,
        content: form.content.value,
    };

    try {
        if (index !== '') {
            // 更新
            await apiRequest(`/news/${index}`, {
                method: 'PUT',
                body: JSON.stringify(data),
            });
            showNotification('新闻更新成功', 'success');
        } else {
            // 添加
            await apiRequest('/news/', {
                method: 'POST',
                body: JSON.stringify(data),
            });
            showNotification('新闻添加成功', 'success');
        }

        closeNewsModal();
        await loadNews();
    } catch (error) {
        showNotification('保存失败: ' + error.message, 'error');
    }
}

// 编辑新闻
function editNews(index) {
    const newsItem = AppState.news[index];
    openNewsModal(newsItem, index);
}

// 删除新闻
async function deleteNews(index) {
    if (!confirm('确定要删除这条新闻吗？')) {
        return;
    }

    try {
        await apiRequest(`/news/${index}`, {
            method: 'DELETE',
        });
        showNotification('新闻删除成功', 'success');
        await loadNews();
    } catch (error) {
        showNotification('删除失败: ' + error.message, 'error');
    }
}
