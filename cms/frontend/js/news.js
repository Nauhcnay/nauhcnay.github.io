// 新闻管理模块

// 月份映射
const MONTH_ABBR_TO_NUM = {
    'Jan.': '01', 'Feb.': '02', 'Mar.': '03', 'Apr.': '04',
    'May.': '05', 'Jun.': '06', 'Jul.': '07', 'Aug.': '08',
    'Sep.': '09', 'Oct.': '10', 'Nov.': '11', 'Dec.': '12'
};
const MONTH_NUM_TO_ABBR = {
    '01': 'Jan.', '02': 'Feb.', '03': 'Mar.', '04': 'Apr.',
    '05': 'May.', '06': 'Jun.', '07': 'Jul.', '08': 'Aug.',
    '09': 'Sep.', '10': 'Oct.', '11': 'Nov.', '12': 'Dec.'
};

// 解析日期字符串为 { month, year }
// 支持 "Aug. 2024"、"2024-08"、"2024-08-15" 等格式
function parseDateString(dateStr) {
    if (!dateStr) return { month: '', year: '' };

    // 格式: "Mon. YYYY"
    var m1 = dateStr.match(/^(\w+\.?)\s+(\d{4})$/);
    if (m1 && MONTH_ABBR_TO_NUM[m1[1]]) {
        return { month: m1[1], year: m1[2] };
    }

    // 格式: "YYYY-MM" 或 "YYYY-MM-DD"
    var m2 = dateStr.match(/^(\d{4})-(\d{2})/);
    if (m2) {
        var abbr = MONTH_NUM_TO_ABBR[m2[2]] || '';
        return { month: abbr, year: m2[1] };
    }

    return { month: '', year: '' };
}

// 格式化为显示格式 "Mon. YYYY"
function formatDateDisplay(month, year) {
    if (!month || !year) return '';
    return month + ' ' + year;
}

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

    // 显示最近3条新闻作为预览
    const previewCount = 3;
    const newsToShow = AppState.news.slice(0, previewCount);
    const hasMore = AppState.news.length > previewCount;

    let html = newsToShow.map((item, index) => `
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

    // 如果有更多新闻，显示统计信息
    if (hasMore) {
        html += `
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <i class="fas fa-info-circle text-blue-600 mr-2"></i>
                <span class="text-blue-800">
                    显示最近 ${previewCount} 条，共 ${AppState.news.length} 条新闻
                </span>
                <button onclick="showAllNews()" class="ml-3 text-blue-600 hover:text-blue-800 underline">
                    查看全部
                </button>
            </div>
        `;
    } else {
        html += `
            <div class="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center text-sm text-gray-600">
                <i class="fas fa-check-circle text-green-600 mr-2"></i>
                共 ${AppState.news.length} 条新闻
            </div>
        `;
    }

    container.innerHTML = html;
}

// 显示所有新闻
function showAllNews() {
    const container = document.getElementById('news-list');

    const html = AppState.news.map((item, index) => `
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
    `).join('') + `
        <div class="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
            <span class="text-gray-600">共 ${AppState.news.length} 条新闻</span>
            <button onclick="renderNews()" class="ml-3 text-blue-600 hover:text-blue-800 underline">
                <i class="fas fa-compress-alt mr-1"></i>收起
            </button>
        </div>
    `;

    container.innerHTML = html;
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
    const monthSelect = document.getElementById('news-month');
    const yearInput = document.getElementById('news-year');

    // 重置表单
    form.reset();
    monthSelect.value = '';
    yearInput.value = '';

    if (newsItem) {
        // 编辑模式
        title.textContent = '编辑新闻';
        document.getElementById('news-edit-index').value = index;

        // 解析日期并填充下拉框
        var parsed = parseDateString(newsItem.date);
        monthSelect.value = parsed.month;
        yearInput.value = parsed.year;

        form.content.value = newsItem.content || '';
    } else {
        // 添加模式
        title.textContent = '添加新闻';
        document.getElementById('news-edit-index').value = '';

        // 自动填充当前月份和年份
        const now = new Date();
        const monthNum = String(now.getMonth() + 1).padStart(2, '0');
        monthSelect.value = MONTH_NUM_TO_ABBR[monthNum] || '';
        yearInput.value = now.getFullYear();
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
    const monthSelect = document.getElementById('news-month');
    const yearInput = document.getElementById('news-year');

    // 验证
    if (!monthSelect.value) {
        showNotification('请选择月份', 'error');
        return;
    }
    if (!yearInput.value) {
        showNotification('请输入年份', 'error');
        return;
    }
    if (!form.content.value.trim()) {
        showNotification('请输入新闻内容', 'error');
        return;
    }

    // 格式化日期为 "Mon. YYYY"
    const dateStr = formatDateDisplay(monthSelect.value, yearInput.value);

    const data = {
        date: dateStr,
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
