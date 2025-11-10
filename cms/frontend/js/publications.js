// 论文管理模块

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
        <div class="publication-card">
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
                <button onclick="editPublication(${index})" class="btn-success">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deletePublication(${index})" class="btn-danger">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// 打开添加论文模态框
document.getElementById('add-publication-btn')?.addEventListener('click', () => {
    openPublicationModal();
});

// 打开论文模态框
function openPublicationModal(publication = null, index = null) {
    const modal = document.getElementById('publication-modal');
    const form = document.getElementById('publication-form');
    const title = document.getElementById('modal-title');

    // 重置表单
    form.reset();
    document.getElementById('image-preview').innerHTML = '';

    if (publication) {
        // 编辑模式
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
            document.getElementById('image-preview').innerHTML = `
                <img src="${publication.image}" alt="预览" class="w-32 h-32 object-cover rounded border">
            `;
        }
    } else {
        // 添加模式
        title.textContent = '添加论文';
        document.getElementById('edit-index').value = '';
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

// 上传图片
document.getElementById('image-upload')?.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
        const result = await uploadFile(file, '/publications/upload-image');
        document.querySelector('input[name="image"]').value = result.path;

        // 显示预览
        document.getElementById('image-preview').innerHTML = `
            <img src="${result.path}" alt="预览" class="w-32 h-32 object-cover rounded border">
        `;

        showNotification('图片上传成功', 'success');
    } catch (error) {
        showNotification('图片上传失败: ' + error.message, 'error');
    }
});

// 上传 BibTeX
document.getElementById('bibtex-upload')?.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
        const result = await uploadFile(file, '/publications/upload-bibtex');
        document.querySelector('input[name="bibtex"]').value = result.path;
        showNotification('BibTeX 上传成功', 'success');
    } catch (error) {
        showNotification('BibTeX 上传失败: ' + error.message, 'error');
    }
});
