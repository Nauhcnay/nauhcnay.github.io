// 数据分析模块

var viewsChart = null;

async function loadAnalytics() {
    try {
        var data = await apiRequest('/analytics/traffic');
        renderAnalytics(data);
    } catch (error) {
        showNotification('加载分析数据失败: ' + error.message, 'error');
    }
}

function renderAnalytics(data) {
    // 总览卡片
    document.getElementById('stat-total-views').textContent = data.views.count || 0;
    document.getElementById('stat-unique-visitors').textContent = data.views.uniques || 0;
    document.getElementById('stat-total-clones').textContent = data.clones.count || 0;
    document.getElementById('stat-unique-cloners').textContent = data.clones.uniques || 0;

    // 折线图
    renderViewsChart(data.views.views || [], data.clones.clones || []);

    // 来源
    renderReferrers(data.referrers || []);

    // 热门页面
    renderPopularPaths(data.popular_paths || []);
}

function renderViewsChart(views, clones) {
    // 合并日期，对齐两组数据
    var dateSet = {};
    views.forEach(function(v) { dateSet[v.timestamp.slice(0, 10)] = true; });
    clones.forEach(function(c) { dateSet[c.timestamp.slice(0, 10)] = true; });
    var dates = Object.keys(dateSet).sort();

    var viewMap = {};
    var uniqMap = {};
    views.forEach(function(v) {
        var d = v.timestamp.slice(0, 10);
        viewMap[d] = v.count;
        uniqMap[d] = v.uniques;
    });

    var cloneMap = {};
    clones.forEach(function(c) {
        cloneMap[c.timestamp.slice(0, 10)] = c.count;
    });

    var labels = dates.map(function(d) {
        var parts = d.split('-');
        return parts[1] + '/' + parts[2];
    });

    var viewData = dates.map(function(d) { return viewMap[d] || 0; });
    var uniqData = dates.map(function(d) { return uniqMap[d] || 0; });
    var cloneData = dates.map(function(d) { return cloneMap[d] || 0; });

    var ctx = document.getElementById('views-chart').getContext('2d');

    if (viewsChart) {
        viewsChart.destroy();
    }

    viewsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Page Views',
                    data: viewData,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true,
                    tension: 0.3,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                },
                {
                    label: 'Unique Visitors',
                    data: uniqData,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: true,
                    tension: 0.3,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                },
                {
                    label: 'Clones',
                    data: cloneData,
                    borderColor: '#8b5cf6',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    fill: true,
                    tension: 0.3,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index',
            },
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        title: function(items) {
                            return items[0].label;
                        },
                    },
                },
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        precision: 0,
                    },
                },
            },
        },
    });
}

function renderReferrers(referrers) {
    var container = document.getElementById('referrers-list');
    if (referrers.length === 0) {
        container.innerHTML = '<div class="text-gray-400 text-sm">暂无数据</div>';
        return;
    }
    container.innerHTML = referrers.map(function(r) {
        return '<div class="flex justify-between items-center bg-gray-50 rounded px-3 py-2">' +
            '<span class="text-sm font-medium text-gray-700">' + escapeHtml(r.referrer) + '</span>' +
            '<div class="flex gap-3 text-xs text-gray-500">' +
                '<span>' + r.count + ' views</span>' +
                '<span>' + r.uniques + ' unique</span>' +
            '</div>' +
        '</div>';
    }).join('');
}

function renderPopularPaths(paths) {
    var container = document.getElementById('popular-paths-list');
    if (paths.length === 0) {
        container.innerHTML = '<div class="text-gray-400 text-sm">暂无数据</div>';
        return;
    }
    container.innerHTML = paths.map(function(p) {
        return '<div class="flex justify-between items-center bg-gray-50 rounded px-3 py-2">' +
            '<span class="text-sm font-medium text-gray-700 truncate" title="' + escapeHtml(p.path) + '">' + escapeHtml(p.title || p.path) + '</span>' +
            '<div class="flex gap-3 text-xs text-gray-500">' +
                '<span>' + p.count + ' views</span>' +
                '<span>' + p.uniques + ' unique</span>' +
            '</div>' +
        '</div>';
    }).join('');
}
