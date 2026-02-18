// 个人信息管理模块

// 加载个人信息
async function loadProfile() {
    try {
        const data = await apiRequest('/profile/');
        AppState.profile = data;
        renderProfile();
    } catch (error) {
        showNotification('加载个人信息失败: ' + error.message, 'error');
    }
}

// 渲染个人信息
function renderProfile() {
    const config = AppState.profile.config || {};
    const about = AppState.profile.about || '';
    const research = AppState.profile.research_interests || '';

    // 基本信息
    document.getElementById('profile-title').value = config.title || '';
    document.getElementById('profile-position').value = config.position || '';
    document.getElementById('profile-affiliation').value = config.affiliation || '';
    document.getElementById('profile-email').value = config.email || '';

    // 社交链接
    document.getElementById('profile-scholar').value = config.google_scholar || '';
    document.getElementById('profile-github').value = config.github_link || '';
    document.getElementById('profile-linkedin').value = config.linkedin || '';

    // CV 文件
    const cvLink = config.cv_link || '';
    const cvDisplay = document.getElementById('cv-current-file');
    if (cvDisplay) {
        cvDisplay.textContent = cvLink ? cvLink.split('/').pop() : '未设置';
    }

    // About Me 和 Research Interests
    document.getElementById('profile-about').value = about;
    document.getElementById('profile-research').value = research;
}

// 保存个人信息
document.getElementById('save-profile-btn')?.addEventListener('click', async () => {
    const btn = document.getElementById('save-profile-btn');
    const originalText = btn.innerHTML;

    try {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>保存中...';

        // 获取所有字段
        const updates = {
            title: document.getElementById('profile-title').value,
            position: document.getElementById('profile-position').value,
            affiliation: document.getElementById('profile-affiliation').value,
            email: document.getElementById('profile-email').value,
            google_scholar: document.getElementById('profile-scholar').value,
            github_link: document.getElementById('profile-github').value,
            linkedin: document.getElementById('profile-linkedin').value,
        };

        // 更新配置字段
        for (const [field, value] of Object.entries(updates)) {
            if (value) {
                await apiRequest(`/profile/config?field=${field}&value=${encodeURIComponent(value)}`, {
                    method: 'PUT',
                });
            }
        }

        // 更新 About Me
        const about = document.getElementById('profile-about').value;
        if (about) {
            await apiRequest('/profile/about', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({content: about}),
            });
        }

        // 更新 Research Interests
        const research = document.getElementById('profile-research').value;
        if (research) {
            await apiRequest('/profile/research-interests', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({content: research}),
            });
        }

        showNotification('个人信息保存成功', 'success');
    } catch (error) {
        showNotification('保存失败: ' + error.message, 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
});

// 上传 CV
document.getElementById('upload-cv-btn')?.addEventListener('click', async () => {
    const fileInput = document.getElementById('cv-upload');
    const btn = document.getElementById('upload-cv-btn');
    const status = document.getElementById('cv-upload-status');

    if (!fileInput.files || fileInput.files.length === 0) {
        showNotification('请先选择 PDF 文件', 'error');
        return;
    }

    const file = fileInput.files[0];
    if (!file.name.toLowerCase().endsWith('.pdf')) {
        showNotification('请上传 PDF 格式的文件', 'error');
        return;
    }

    const originalText = btn.innerHTML;
    try {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>上传中...';

        const formData = new FormData();
        formData.append('file', file);

        const result = await apiRequest('/profile/upload-cv', {
            method: 'POST',
            body: formData,
        });

        // 更新显示
        document.getElementById('cv-current-file').textContent = file.name;
        fileInput.value = '';

        status.textContent = `上传成功：${result.path}`;
        status.style.display = 'block';
        setTimeout(() => { status.style.display = 'none'; }, 3000);

        showNotification('CV 上传成功', 'success');
    } catch (error) {
        showNotification('CV 上传失败: ' + error.message, 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
});
