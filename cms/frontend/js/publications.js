// 论文管理模块

// ── 作者解析与加粗切换 ──────────────────────────────────────────

// 解析作者字符串为 [{name, bold}] 数组
function parseAuthorsString(str) {
    if (!str || !str.trim()) return [];
    return str.split(',').map(function(s) {
        s = s.trim();
        if (!s) return null;
        var match = s.match(/^<strong>(.*?)<\/strong>$/);
        if (match) {
            return { name: match[1], bold: true };
        }
        return { name: s, bold: false };
    }).filter(Boolean);
}

// 将作者数组序列化回字符串
function serializeAuthors(authors) {
    return authors.map(function(a) {
        return a.bold ? '<strong>' + a.name + '</strong>' : a.name;
    }).join(', ');
}

// 渲染作者标签到 chips 容器
function renderAuthorChips(authors) {
    var container = document.getElementById('author-chips');
    if (!container) return;
    if (!authors || authors.length === 0) {
        container.innerHTML = '<span class="text-xs text-gray-400">输入作者后将自动解析为标签</span>';
        return;
    }
    container.innerHTML = authors.map(function(a, i) {
        return '<span class="author-chip' + (a.bold ? ' bold' : '') + '" data-index="' + i + '">' +
            escapeHtml(a.name) + '</span>';
    }).join('');
}

// 当前编辑中的作者列表
var currentAuthors = [];

// 从输入框同步到 chips
function syncAuthorsFromInput() {
    var input = document.querySelector('#publication-form input[name="authors"]');
    if (!input) return;
    currentAuthors = parseAuthorsString(input.value);
    renderAuthorChips(currentAuthors);
}

// 从 chips 同步回输入框
function syncAuthorsToInput() {
    var input = document.querySelector('#publication-form input[name="authors"]');
    if (!input) return;
    input.value = serializeAuthors(currentAuthors);
}

// 输入框变化时自动解析（去抖动）
var authorsDebounce = null;
document.getElementById('publication-form')?.querySelector('input[name="authors"]')
    ?.addEventListener('input', function() {
        clearTimeout(authorsDebounce);
        authorsDebounce = setTimeout(syncAuthorsFromInput, 400);
    });

// 点击 chip 切换加粗
document.getElementById('author-chips')?.addEventListener('click', function(e) {
    var chip = e.target.closest('.author-chip');
    if (!chip) return;
    var idx = parseInt(chip.dataset.index);
    if (idx >= 0 && idx < currentAuthors.length) {
        currentAuthors[idx].bold = !currentAuthors[idx].bold;
        renderAuthorChips(currentAuthors);
        syncAuthorsToInput();
    }
});

// ── 论文列表 ────────────────────────────────────────────────────

// 加载论文列表
async function loadPublications() {
    try {
        const publications = await apiRequest('/publications/');
        AppState.publications = publications;
        renderPublications();
    } catch (error) {
        showNotification('加载论文列表失败: ' + error.message, 'error');
    }
}

// 渲染论文列表
function renderPublications() {
    const container = document.getElementById('publications-list');

    if (AppState.publications.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-file-alt"></i>
                <p class="mt-2">还没有添加论文</p>
                <p class="text-sm">点击右上角"添加论文"按钮开始</p>
            </div>
        `;
        return;
    }

    container.innerHTML = AppState.publications.map((pub, index) => `
        <div class="publication-card" data-index="${index}">
            ${pub.image ? `<img src="${pub.image}" alt="${pub.title}">` : '<div class="w-32 h-32 bg-gray-200 rounded flex items-center justify-center"><i class="fas fa-image text-gray-400 text-2xl"></i></div>'}
            <div class="flex-1">
                <h3 class="text-lg font-semibold text-gray-900 mb-1">${escapeHtml(pub.title)}</h3>
                <p class="text-sm text-gray-600 mb-2">${escapeHtml(pub.authors)}</p>
                <p class="text-sm text-blue-600 font-medium mb-2">${escapeHtml(pub.conference_short)}</p>
                <div class="flex flex-wrap gap-2 mb-2">
                    ${pub.pdf ? `<a href="${pub.pdf}" target="_blank" class="text-sm text-blue-600 hover:underline"><i class="fas fa-file-pdf mr-1"></i>PDF</a>` : ''}
                    ${pub.code ? `<a href="${pub.code}" target="_blank" class="text-sm text-blue-600 hover:underline"><i class="fas fa-code mr-1"></i>Code</a>` : ''}
                    ${pub.page ? `<a href="${pub.page}" target="_blank" class="text-sm text-blue-600 hover:underline"><i class="fas fa-link mr-1"></i>Page</a>` : ''}
                    ${pub.bibtex ? `<a href="${pub.bibtex}" target="_blank" class="text-sm text-blue-600 hover:underline"><i class="fas fa-quote-right mr-1"></i>BibTeX</a>` : ''}
                </div>
                ${pub.featured ? '<span class="badge badge-blue">Featured</span>' : ''}
                ${pub.notes ? `<span class="badge badge-green">${escapeHtml(pub.notes)}</span>` : ''}
            </div>
            <div class="flex flex-col gap-2">
                <button class="drag-handle" title="拖拽排序" style="cursor: grab;">
                    <i class="fas fa-grip-vertical"></i>
                </button>
                <button onclick="editPublication(${index})" class="btn-success">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deletePublication(${index})" class="btn-danger">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');

    initSortable();
}

// 初始化拖拽排序
function initSortable() {
    const el = document.getElementById('publications-list');
    if (!el || el.children.length === 0) return;
    Sortable.create(el, {
        handle: '.drag-handle',
        animation: 150,
        ghostClass: 'dragging',
        dragClass: 'drag-over',
        onEnd: async function (evt) {
            const items = el.children;
            const newIndices = Array.from(items).map(item =>
                parseInt(item.dataset.index)
            );
            try {
                const result = await apiRequest('/publications/reorder', {
                    method: 'POST',
                    body: JSON.stringify(newIndices),
                });
                AppState.publications = result;
                renderPublications();
                showNotification('排序已保存', 'success');
            } catch (error) {
                await loadPublications();
                showNotification('排序保存失败: ' + error.message, 'error');
            }
        },
    });
}

// 打开添加论文模态框
document.getElementById('add-publication-btn')?.addEventListener('click', () => {
    openPublicationModal();
});

// ── 导入步骤逻辑 ──────────────────────────────────────────────

let currentImportMethod = null;

function resetImportStep() {
    currentImportMethod = null;
    const inputArea = document.getElementById('import-input-area');
    const importError = document.getElementById('import-error');
    const parseBtn = document.getElementById('parse-import-btn');

    // 清除方法卡片选中状态
    document.querySelectorAll('.import-method-card').forEach(card => {
        card.classList.remove('selected');
    });

    inputArea.style.display = 'none';
    inputArea.innerHTML = '';
    importError.style.display = 'none';
    importError.textContent = '';
    parseBtn.style.display = 'none';
}

function showImportStep() {
    document.getElementById('import-step').style.display = '';
    document.getElementById('publication-form').style.display = 'none';
    // 也隐藏 modal-footer 的保存按钮，导入步骤有自己的按钮
    document.querySelector('#publication-modal .modal-footer').style.display = 'none';
}

function showFormStep() {
    document.getElementById('import-step').style.display = 'none';
    document.getElementById('publication-form').style.display = '';
    document.querySelector('#publication-modal .modal-footer').style.display = '';
}

function skipImport() {
    showFormStep();
}

function selectImportMethod(method) {
    currentImportMethod = method;
    const inputArea = document.getElementById('import-input-area');
    const parseBtn = document.getElementById('parse-import-btn');
    const importError = document.getElementById('import-error');

    // 更新卡片选中状态
    document.querySelectorAll('.import-method-card').forEach(card => {
        card.classList.toggle('selected', card.dataset.method === method);
    });

    importError.style.display = 'none';
    parseBtn.style.display = '';

    if (method === 'bibtex') {
        inputArea.innerHTML = `
            <label class="form-label">粘贴 BibTeX 条目</label>
            <textarea id="import-input" class="form-input" rows="8"
                placeholder="@inproceedings{key,
  title = {Paper Title},
  author = {Last, First and Last2, First2},
  booktitle = {Conference Name},
  year = {2024}
}"></textarea>
            <p class="text-xs text-gray-500 mt-1">提示：在 Google Scholar 点击论文下方的引号图标，选择 BibTeX 即可复制</p>
        `;
    } else if (method === 'url') {
        inputArea.innerHTML = `
            <label class="form-label">粘贴论文链接</label>
            <input type="url" id="import-input" class="form-input"
                placeholder="https://dl.acm.org/doi/10.1145/... 或 https://arxiv.org/abs/...">
            <p class="text-xs text-gray-500 mt-1">支持：ACM DL、IEEE Xplore、arXiv、doi.org 等链接</p>
        `;
    } else if (method === 'scholar') {
        inputArea.innerHTML = `
            <label class="form-label">粘贴 Google Scholar 链接</label>
            <input type="url" id="import-input" class="form-input"
                placeholder="https://scholar.google.com/citations?view_op=view_citation&...">
            <p class="text-xs text-gray-500 mt-1">提示：在 Scholar 论文页面复制浏览器地址栏链接</p>
        `;
    }
    inputArea.style.display = '';
}

async function parseImport() {
    if (!currentImportMethod) return;

    const inputEl = document.getElementById('import-input');
    const importError = document.getElementById('import-error');
    const parseBtn = document.getElementById('parse-import-btn');
    const inputValue = inputEl ? inputEl.value.trim() : '';

    if (!inputValue) {
        importError.textContent = '请输入内容';
        importError.style.display = '';
        return;
    }

    // 显示加载状态
    parseBtn.disabled = true;
    const originalHTML = parseBtn.innerHTML;
    parseBtn.innerHTML = '<span class="spinner mr-2"></span>解析中...';
    importError.style.display = 'none';

    try {
        const result = await apiRequest('/publications/import', {
            method: 'POST',
            body: JSON.stringify({
                method: currentImportMethod,
                input: inputValue,
            }),
        });

        if (result.success && result.data) {
            fillFormFromImport(result.data);
            showFormStep();
            showNotification('论文信息导入成功，请检查并补充', 'success');
        } else {
            importError.textContent = result.error || '解析失败，请检查输入';
            importError.style.display = '';
        }
    } catch (error) {
        importError.textContent = '请求失败: ' + error.message;
        importError.style.display = '';
    } finally {
        parseBtn.disabled = false;
        parseBtn.innerHTML = originalHTML;
    }
}

function fillFormFromImport(data) {
    const form = document.getElementById('publication-form');
    if (data.title) form.title.value = data.title;
    if (data.authors) form.authors.value = data.authors;
    if (data.conference_short) form.conference_short.value = data.conference_short;
    if (data.conference) form.conference.value = data.conference;
    if (data.pdf) form.pdf.value = data.pdf;
    syncAuthorsFromInput();
}

// 导入步骤事件监听
document.querySelectorAll('.import-method-card').forEach(card => {
    card.addEventListener('click', () => {
        selectImportMethod(card.dataset.method);
    });
});

document.getElementById('skip-import')?.addEventListener('click', (e) => {
    e.preventDefault();
    skipImport();
});

document.getElementById('parse-import-btn')?.addEventListener('click', () => {
    parseImport();
});

// ── 模态框逻辑 ────────────────────────────────────────────────

// 打开论文模态框
function openPublicationModal(publication = null, index = null) {
    const modal = document.getElementById('publication-modal');
    const form = document.getElementById('publication-form');
    const title = document.getElementById('modal-title');

    // 重置表单
    form.reset();
    // 显式清空隐藏字段（form.reset() 对 hidden input 不可靠）
    form.image.value = '';
    form.bibtex.value = '';
    document.getElementById('image-upload').value = '';
    document.getElementById('image-preview').innerHTML = '';
    document.getElementById('bibtex-text').value = '';
    document.getElementById('bibtex-upload').value = '';
    document.getElementById('bibtex-status').style.display = 'none';
    // 重置 BibTeX 模式到"粘贴"
    document.querySelectorAll('.bibtex-tab').forEach(t => t.classList.remove('active'));
    document.querySelector('.bibtex-tab[data-bibtex-mode="paste"]').classList.add('active');
    document.getElementById('bibtex-paste-area').style.display = '';
    document.getElementById('bibtex-upload-area').style.display = 'none';
    resetImportStep();
    // 重置作者标签
    currentAuthors = [];
    renderAuthorChips(currentAuthors);

    if (publication) {
        // 编辑模式：直接显示表单，跳过导入步骤
        title.textContent = '编辑论文';
        document.getElementById('edit-index').value = index;

        // 填充表单
        form.title.value = publication.title || '';
        form.authors.value = publication.authors || '';
        form.conference_short.value = publication.conference_short || '';
        form.conference.value = publication.conference || '';
        form.pdf.value = publication.pdf || '';
        form.code.value = publication.code || '';
        form.page.value = publication.page || '';
        form.notes.value = publication.notes || '';
        form.image.value = publication.image || '';
        form.bibtex.value = publication.bibtex || '';
        form.featured.checked = publication.featured || false;

        // 显示图片预览
        if (publication.image) {
            showImagePreview(publication.image);
        }

        // 解析作者标签
        syncAuthorsFromInput();

        showFormStep();
    } else {
        // 添加模式：显示导入步骤
        title.textContent = '添加论文';
        document.getElementById('edit-index').value = '';
        showImportStep();
    }

    modal.classList.add('active');
}

// 关闭论文模态框
function closePublicationModal() {
    const modal = document.getElementById('publication-modal');
    modal.classList.remove('active');
}

// 保存论文
async function savePublication() {
    const form = document.getElementById('publication-form');
    const index = document.getElementById('edit-index').value;

    // 验证表单
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    // 如果有粘贴的 BibTeX 文本且尚未保存为文件，先保存
    const bibtexText = document.getElementById('bibtex-text').value.trim();
    if (bibtexText && !form.bibtex.value) {
        try {
            const slugName = form.title.value
                ? form.title.value.replace(/[^\w]+/g, '_').substring(0, 50)
                : null;
            const result = await apiRequest('/publications/save-bibtex-text', {
                method: 'POST',
                body: JSON.stringify({ content: bibtexText, filename: slugName }),
            });
            if (result.success) {
                form.bibtex.value = result.path;
            }
        } catch (error) {
            showNotification('BibTeX 保存失败: ' + error.message, 'error');
            return;
        }
    }

    // 收集数据
    const data = {
        title: form.title.value,
        authors: form.authors.value,
        conference_short: form.conference_short.value,
        conference: form.conference.value,
        pdf: form.pdf.value || null,
        code: form.code.value || null,
        page: form.page.value || null,
        notes: form.notes.value || null,
        image: form.image.value || null,
        bibtex: form.bibtex.value || null,
        featured: form.featured.checked,
    };

    try {
        if (index !== '') {
            // 更新
            await apiRequest(`/publications/${index}`, {
                method: 'PUT',
                body: JSON.stringify(data),
            });
            showNotification('论文更新成功', 'success');
        } else {
            // 添加
            await apiRequest('/publications/', {
                method: 'POST',
                body: JSON.stringify(data),
            });
            showNotification('论文添加成功', 'success');
        }

        closePublicationModal();
        await loadPublications();
    } catch (error) {
        showNotification('保存失败: ' + error.message, 'error');
    }
}

// 编辑论文
function editPublication(index) {
    const publication = AppState.publications[index];
    openPublicationModal(publication, index);
}

// 删除论文
async function deletePublication(index) {
    if (!confirm('确定要删除这篇论文吗？')) {
        return;
    }

    try {
        await apiRequest(`/publications/${index}`, {
            method: 'DELETE',
        });
        showNotification('论文删除成功', 'success');
        await loadPublications();
    } catch (error) {
        showNotification('删除失败: ' + error.message, 'error');
    }
}

// 显示图片预览（带删除按钮）
function showImagePreview(imagePath) {
    document.getElementById('image-preview').innerHTML = `
        <div class="flex items-center gap-2 mt-1">
            <img src="${imagePath}" alt="预览" class="w-32 h-32 object-cover rounded border">
            <button type="button" onclick="removeImage()" class="text-red-500 hover:text-red-700 text-sm" title="删除图片">
                <i class="fas fa-trash mr-1"></i>删除图片
            </button>
        </div>
    `;
}

// 删除已上传的图片
function removeImage() {
    const form = document.getElementById('publication-form');
    form.image.value = '';
    document.getElementById('image-upload').value = '';
    document.getElementById('image-preview').innerHTML = '';
}

// 上传图片
document.getElementById('image-upload')?.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
        const result = await uploadFile(file, '/publications/upload-image');
        document.querySelector('input[name="image"]').value = result.path;
        showImagePreview(result.path);
        showNotification('图片上传成功', 'success');
    } catch (error) {
        showNotification('图片上传失败: ' + error.message, 'error');
    }
});

// ── BibTeX 粘贴/上传模式切换 ──────────────────────────────────

document.querySelectorAll('.bibtex-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        const mode = tab.dataset.bibtexMode;
        document.querySelectorAll('.bibtex-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById('bibtex-paste-area').style.display = mode === 'paste' ? '' : 'none';
        document.getElementById('bibtex-upload-area').style.display = mode === 'upload' ? '' : 'none';
    });
});

// 上传 BibTeX 文件
document.getElementById('bibtex-upload')?.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
        const result = await uploadFile(file, '/publications/upload-bibtex');
        document.querySelector('input[name="bibtex"]').value = result.path;
        document.getElementById('bibtex-text').value = '';
        const status = document.getElementById('bibtex-status');
        status.textContent = `已上传: ${result.filename}`;
        status.style.display = '';
        showNotification('BibTeX 上传成功', 'success');
    } catch (error) {
        showNotification('BibTeX 上传失败: ' + error.message, 'error');
    }
});
