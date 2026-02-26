// script.js

// 当前状态
let currentType = CommandType.ALL;
let currentSection = 'commands';

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    console.log('📜 指令数据:', commandsData.length, '条');
    console.log('🎯 基础选择器:', baseSelectors.length, '个');
    console.log('⚙️ 选择器参数:', selectorParams.length, '个');
    
    renderCommands(commandsData);
    renderBaseSelectors();
    renderSelectorParams();
    setupSearch();
    updateNavActive();
});

// ==================== 指令渲染 ====================

function renderCommands(data) {
    const container = document.getElementById('commandsContainer');
    container.innerHTML = '';

    if (data.length === 0) {
        container.innerHTML = '<div class="empty-state">🔍 未找到相关指令</div>';
        return;
    }

    data.forEach(cmd => {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.type = cmd.type;
        card.onclick = () => openModal(cmd, 'command');
        
        card.innerHTML = `
            <div class="card-header">
                <div class="card-title">${cmd.name}</div>
                <span class="card-type type-${cmd.type}">${cmd.typeName}</span>
            </div>
            <p class="card-desc">${cmd.description.substring(0, 60)}${cmd.description.length > 60 ? '...' : ''}</p>
            <div class="card-tags">
                ${cmd.tags.slice(0, 3).map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
        `;
        container.appendChild(card);
    });
}

// ==================== 选择器渲染 ====================

function renderBaseSelectors() {
    const container = document.getElementById('baseSelectorsGrid');
    container.innerHTML = '';
    
    baseSelectors.forEach(sel => {
        const card = document.createElement('div');
        card.className = 'selector-card base';
        card.style.borderLeftColor = sel.color;
        card.onclick = () => copyToClipboardText(sel.code);
        
        card.innerHTML = `
            <div class="selector-code" style="color: ${sel.color}">${sel.code}</div>
            <div class="selector-name">${sel.name}</div>
            <div class="selector-desc">${sel.desc}</div>
            <div class="selector-example">例：<code>${sel.example}</code></div>
        `;
        container.appendChild(card);
    });
}

function renderSelectorParams() {
    const container = document.getElementById('selectorParamsGrid');
    container.innerHTML = '';
    
    selectorParams.forEach(param => {
        const card = document.createElement('div');
        card.className = 'selector-card param';
        card.style.borderLeftColor = param.color;
        
        const hasNegative = param.negative && param.negative !== '不支持负向筛选';
        
        card.innerHTML = `
            <div class="param-header">
                <div class="param-name" style="color: ${param.color}">${param.param}</div>
                <div class="param-title">${param.name}</div>
            </div>
            <div class="param-syntax" onclick="copyToClipboardText('${param.syntax.replace(/'/g, "\\'")}')">
                ${param.syntax}
            </div>
            <div class="param-desc">${param.desc}</div>
            <div class="param-example">
                <span>✅ 正例：</span><code>${param.example}</code>
            </div>
            ${hasNegative ? `
            <div class="param-negative">
                <span>❌ 排除：</span><code>${param.negative}</code>
            </div>
            ` : ''}
        `;
        container.appendChild(card);
    });
}

// ==================== 搜索功能 ====================

function setupSearch() {
    const input = document.getElementById('searchInput');
    input.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        
        if (currentSection === 'commands') {
            const filtered = currentType === CommandType.ALL 
                ? commandsData.filter(cmd => matchSearch(cmd, term))
                : commandsData.filter(cmd => cmd.type === currentType && matchSearch(cmd, term));
            renderCommands(filtered);
        } else if (currentSection === 'selectors') {
            filterSelectors(term);
        }
    });
}

function matchSearch(cmd, term) {
    return cmd.name.toLowerCase().includes(term) || 
           cmd.description.toLowerCase().includes(term) ||
           cmd.tags.some(tag => tag.toLowerCase().includes(term));
}

function filterSelectors(term) {
    document.querySelectorAll('#baseSelectorsGrid .selector-card').forEach(card => {
        const text = card.innerText.toLowerCase();
        card.style.display = text.includes(term) ? 'block' : 'none';
    });
    
    document.querySelectorAll('#selectorParamsGrid .selector-card').forEach(card => {
        const text = card.innerText.toLowerCase();
        card.style.display = text.includes(term) ? 'block' : 'none';
    });
}

// ==================== 分类筛选 ====================

function filterByType(type) {
    currentType = type;
    currentSection = 'commands';
    updateNavActive();
    showSection('commands');
    
    if (type === CommandType.ALL) {
        renderCommands(commandsData);
    } else {
        const filtered = commandsData.filter(cmd => cmd.type === type);
        renderCommands(filtered);
    }
}

function showSection(section) {
    currentSection = section;
    document.getElementById('searchInput').value = '';
    
    document.getElementById('commandsContainer').style.display = 'none';
    document.getElementById('selectorsSection').style.display = 'none';
    document.getElementById('paramsSection').style.display = 'none';
    
    if (section === 'commands') {
        document.getElementById('commandsContainer').style.display = 'grid';
    } else if (section === 'selectors') {
        document.getElementById('selectorsSection').style.display = 'block';
    } else if (section === 'params') {
        document.getElementById('paramsSection').style.display = 'block';
    }
    
    // 更新导航激活状态
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
}

function updateNavActive() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.type == currentType && currentSection === 'commands') {
            btn.classList.add('active');
        }
    });
}

// ==================== 弹窗功能 ====================

function openModal(data, type) {
    const modal = document.getElementById('detailModal');
    const title = document.getElementById('modalTitle');
    const category = document.getElementById('modalCategory');
    const syntax = document.getElementById('modalSyntax');
    const desc = document.getElementById('modalDesc');
    const example = document.getElementById('modalExample');
    const exampleBox = document.querySelector('.example-box');
    
    if (type === 'command') {
        title.innerText = data.name;
        title.style.color = 'var(--accent-green)';
        category.innerText = data.typeName;
        category.className = `card-type type-${data.type}`;
        syntax.innerText = data.syntax;
        desc.innerText = data.description;
        example.innerText = data.example;
        exampleBox.style.display = 'block';
    } else if (type === 'param') {
        title.innerText = param;
        title.style.color = data.color;
        category.innerText = data.name;
        category.className = 'card-type';
        category.style.background = data.color;
        syntax.innerText = data.syntax;
        desc.innerText = data.desc;
        example.innerText = data.example + (data.negative && data.negative !== '不支持负向筛选' ? ' | ' + data.negative : '');
        exampleBox.style.display = 'block';
    }
    
    modal.style.display = 'flex';
}

function closeModal() {
    document.getElementById('detailModal').style.display = 'none';
}

window.onclick = function(event) {
    const modal = document.getElementById('detailModal');
    if (event.target == modal) {
        closeModal();
    }
}

// ==================== 复制功能 ====================

function copyToClipboardText(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('✅ 已复制到剪贴板');
    }).catch(() => {
        showToast('❌ 复制失败');
    });
}

function copyToClipboard(element) {
    const text = element.innerText;
    copyToClipboardText(text);
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = message;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

// ==================== 调试工具（开发用） ====================

window.debugData = () => {
    console.log('=== 指令数据 ===');
    console.log('总数:', commandsData.length);
    console.log('分类统计:', {
        '全部': commandsData.filter(c => c.type === 1).length,
        '移动': commandsData.filter(c => c.type === 2).length,
        '物品': commandsData.filter(c => c.type === 3).length,
        '实体': commandsData.filter(c => c.type === 4).length,
        '世界': commandsData.filter(c => c.type === 5).length,
    });
    console.log('=== 选择器数据 ===');
    console.log('基础选择器:', baseSelectors.length);
    console.log('参数详解:', selectorParams.length);
};