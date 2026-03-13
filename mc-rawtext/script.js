// script.js - 最终完整修复版（scores 范围匹配支持）

// ==================== 全局变量 ====================
let components = [];
let currentComponent = null;
let currentComponentIndex = -1;
let scoreDebugId = 0;
let tagDebugId = 0;

// ==================== 工具函数 ====================
function cleanText(text) {
    if (!text) return '';
    return text.replace(/\r/g, '');
}

// ==================== 初始化 ====================
document.addEventListener('DOMContentLoaded', () => {
    setupComponentButtons();
    updatePreview();
    checkOrientation();
    
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', saveComponent);
    }
});

// ==================== 检查屏幕方向 ====================
function checkOrientation() {
    const warning = document.getElementById('landscapeWarning');
    const app = document.querySelector('.app-container');
    if (window.innerWidth < 1000 || window.innerHeight > window.innerWidth) {
        if (warning) warning.style.display = 'flex';
        if (app) app.style.display = 'none';
    } else {
        if (warning) warning.style.display = 'none';
        if (app) app.style.display = 'flex';
    }
}

window.addEventListener('resize', checkOrientation);

// ==================== 组件按钮 ====================
function setupComponentButtons() {
    document.querySelectorAll('.component-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.dataset.type;
            openConfigModal(type);
        });
    });
}

// ==================== 添加调试变量菜单 ====================
function showAddDebugMenu() {
    const modal = document.getElementById('addDebugModal');
    if (modal) modal.classList.add('show');
}

function closeAddDebugMenu() {
    const modal = document.getElementById('addDebugModal');
    if (modal) modal.classList.remove('show');
}

// ==================== 弹窗控制 ====================
function openConfigModal(type, index = -1) {
    const modal = document.getElementById('configModal');
    const title = document.getElementById('modalTitle');
    const form = document.getElementById('modalForm');
    
    if (!modal || !form) {
        console.error('弹窗元素不存在');
        return;
    }
    
    currentComponentIndex = index;
    
    if (index >= 0 && components[index]) {
        currentComponent = { ...components[index] };
        currentComponent.data = { ...components[index].data };
        title.innerText = '编辑组件';
    } else {
        currentComponent = { type: type, data: {} };
        title.innerText = '添加组件';
    }
    
    form.innerHTML = generateFormHTML(type, currentComponent.data);
    modal.classList.add('show');
}

function closeModal() {
    const modal = document.getElementById('configModal');
    if (modal) modal.classList.remove('show');
    currentComponent = null;
    currentComponentIndex = -1;
}

function saveComponent() {
    const form = document.getElementById('modalForm');
    if (!form) return;
    
    const data = {};
    const inputs = form.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
        if (input.name) {
            data[input.name] = cleanText(input.value);
        }
    });
    
    if (currentComponent.type === 'condition') {
        data.trueText = cleanText(form.querySelector('[name="trueText"]')?.value || '');
        data.falseText = cleanText(form.querySelector('[name="falseText"]')?.value || '');
        data.selector = cleanText(form.querySelector('[name="selector"]')?.value || '@p');
    }
    
    currentComponent.data = data;
    
    if (currentComponentIndex >= 0) {
        components[currentComponentIndex] = { ...currentComponent };
    } else {
        components.push({ ...currentComponent });
    }
    
    closeModal();
    renderComponentsList();
    updatePreview();
}

// ==================== 表单生成 ====================
function generateFormHTML(type, data) {
    switch (type) {
        case 'text':
            return `
                <div class="form-group">
                    <label>文本内容</label>
                    <textarea name="text" placeholder="输入文本...（支持换行和§格式代码）">${escapeHtml(data.text || '')}</textarea>
                    <small>💡 按 Enter 换行<br>💡 支持 § 格式代码（§c 红色，§l 粗体，§k 混淆）</small>
                </div>
            `;
        case 'score':
            return `
                <div class="form-row">
                    <div class="form-group">
                        <label>选择器</label>
                        <input type="text" name="selector" placeholder="@p" value="${escapeHtml(data.selector || '@p')}">
                    </div>
                    <div class="form-group">
                        <label>记分项</label>
                        <input type="text" name="objective" placeholder="money" value="${escapeHtml(data.objective || '')}">
                    </div>
                </div>
            `;
        case 'selector':
            return `
                <div class="form-group">
                    <label>选择器</label>
                    <input type="text" name="selector" placeholder="@p" value="${escapeHtml(data.selector || '@p')}">
                </div>
            `;
        case 'entityName':
            return `
                <div class="form-group">
                    <label>选择器</label>
                    <input type="text" name="selector" placeholder="@e[type=player,limit=1]" value="${escapeHtml(data.selector || '@p')}">
                </div>
            `;
        case 'entityNBT':
            return `
                <div class="form-row">
                    <div class="form-group">
                        <label>选择器</label>
                        <input type="text" name="selector" placeholder="@p" value="${escapeHtml(data.selector || '@p')}">
                    </div>
                    <div class="form-group">
                        <label>NBT 路径</label>
                        <input type="text" name="nbt" placeholder="Health" value="${escapeHtml(data.nbt || '')}">
                    </div>
                </div>
            `;
        case 'condition':
            return `
                <div class="form-group">
                    <label>条件选择器</label>
                    <input type="text" name="selector" placeholder="@p[scores=kill=5] 或 @a[tag=hasItem]" value="${escapeHtml(data.selector || '@p')}">
                    <small>支持 scores 范围：=5、=1..10、=..10、=1..，可用! 反选</small>
                </div>
                <div class="form-group">
                    <label>条件成立时显示</label>
                    <textarea name="trueText" placeholder="条件成立时显示的文本">${escapeHtml(data.trueText || '条件成立')}</textarea>
                </div>
                <div class="form-group">
                    <label>条件不成立时显示</label>
                    <textarea name="falseText" placeholder="条件不成立时显示的文本">${escapeHtml(data.falseText || '条件不成立')}</textarea>
                </div>
            `;
        default:
            return '<p style="color: var(--accent-red);">未知组件类型</p>';
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ==================== 格式代码解析（跨组件状态） ====================
function parseFormatCodes(text, formatState = {}) {
    if (!text) return { html: text, state: formatState };
    
    let result = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    
    const colors = {
        '§0': '#000000', '§1': '#0000AA', '§2': '#00AA00', '§3': '#00AAAA',
        '§4': '#AA0000', '§5': '#AA00AA', '§6': '#FFAA00', '§7': '#AAAAAA',
        '§8': '#555555', '§9': '#5555FF', '§a': '#55FF55', '§b': '#55FFFF',
        '§c': '#FF5555', '§d': '#FF55FF', '§e': '#FFFF55', '§f': '#FFFFFF',
        '§m': '#880000', '§n': '#AA5500'
    };
    
    let state = {
        color: formatState.color || '#FFFFFF',
        isBold: formatState.isBold || false,
        isObfuscated: formatState.isObfuscated || false,
        isItalic: formatState.isItalic || false
    };
    
    let html = '';
    const parts = result.split(/(§[0-9a-fkmnlor])/gi);
    
    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (!part) continue;
        
        if (part.match(/^§[0-9a-fkmnlor]$/i)) {
            const code = part.toLowerCase();
            if (code === '§r') {
                state.color = '#FFFFFF';
                state.isBold = false;
                state.isObfuscated = false;
                state.isItalic = false;
            } else if (code === '§k') {
                state.isObfuscated = true;
            } else if (code === '§l') {
                state.isBold = true;
            } else if (code === '§o') {
                state.isItalic = true;
            } else if (colors[code]) {
                state.color = colors[code];
            }
        } else {
            let displayText = part;
            if (state.isObfuscated) {
                displayText = '•'.repeat(part.length);
            }
            let styles = `color: ${state.color};`;
            if (state.isBold) styles += ' font-weight: bold;';
            if (state.isItalic) styles += ' font-style: italic;';
            html += `<span style="${styles}">${displayText}</span>`;
        }
    }
    
    return { html, state };
}

// ==================== 解析 scores 条件（支持范围） ====================
function parseSelectorCondition(selector) {
    const conditions = { scores: [], tags: [] };
    
    // 解析 scores 条件：scores={name=value} 或 scores={name=!value}
    const scoresRegex = /scores={?([a-zA-Z0-9_]+)=(!)?(\d*\.\.\d*|\d+)}?/g;
    let match;
    while ((match = scoresRegex.exec(selector)) !== null) {
        const name = match[1];
        const isInverted = match[2] === '!';
        const valueStr = match[3];
        
        let min = null, max = null;
        if (valueStr.includes('..')) {
            const parts = valueStr.split('..');
            if (parts[0] !== '') min = parseInt(parts[0]);
            if (parts[1] !== '') max = parseInt(parts[1]);
        } else {
            min = max = parseInt(valueStr);
        }
        
        conditions.scores.push({ name, min, max, inverted: isInverted });
    }
    
    // 解析 tag 条件
    const tagRegex = /tag=(!)?([a-zA-Z0-9_]+)/g;
    while ((match = tagRegex.exec(selector)) !== null) {
        conditions.tags.push({ tag: match[2], inverted: match[1] === '!' });
    }
    
    return conditions;
}

// ==================== 检查条件是否成立 ====================
function checkCondition(selector) {
    const conditions = parseSelectorCondition(selector);
    const debugScores = getScoreDebugValues();
    const debugTags = getTagDebugValues();
    
    // 检查 scores 条件
    for (const cond of conditions.scores) {
        const scoreData = debugScores.find(s => s.objective === cond.name);
        const scoreValue = scoreData ? parseInt(scoreData.value) : null;
        
        let matches = false;
        if (scoreValue !== null) {
            if (cond.min !== null && cond.max !== null) {
                matches = scoreValue >= cond.min && scoreValue <= cond.max;
            } else if (cond.min !== null) {
                matches = scoreValue >= cond.min;
            } else if (cond.max !== null) {
                matches = scoreValue <= cond.max;
            }
        }
        
        if (cond.inverted) {
            if (matches) return false;
        } else {
            if (!matches) return false;
        }
    }
    
    // 检查 tag 条件
    for (const cond of conditions.tags) {
        const hasTag = debugTags.some(t => t.tag === cond.tag);
        if (cond.inverted) {
            if (hasTag) return false;
        } else {
            if (!hasTag) return false;
        }
    }
    
    return true;
}

// ==================== 渲染组件列表 ====================
function renderComponentsList() {
    const container = document.getElementById('componentsList');
    if (!container) return;
    
    if (!components || components.length === 0) {
        container.innerHTML = '<div class="empty-state">👈 从左侧选择组件添加</div>';
        return;
    }
    
    container.innerHTML = components.map((comp, index) => {
        const preview = getComponentPreview(comp);
        return `
            <div class="component-item">
                <div class="component-item-info">
                    <div class="component-item-type">${comp.type}</div>
                    <div class="component-item-preview">${escapeHtml(preview)}</div>
                </div>
                <div class="component-item-actions">
                    <button class="btn-up" onclick="moveComponent(${index}, -1)">↑</button>
                    <button class="btn-down" onclick="moveComponent(${index}, 1)">↓</button>
                    <button class="btn-edit" onclick="openConfigModal('${comp.type}', ${index})">编辑</button>
                    <button class="btn-delete" onclick="deleteComponent(${index})">删除</button>
                </div>
            </div>
        `;
    }).join('');
}

function getComponentPreview(comp) {
    if (!comp || !comp.data) return '(空)';
    const data = comp.data;
    switch (comp.type) {
        case 'text': return data.text || '(空文本)';
        case 'score': return `分数：${data.selector || '@p'} ${data.objective || '?'}`;
        case 'selector': return `选择器：${data.selector || '@p'}`;
        case 'entityName': return `实体名：${data.selector || '@p'}`;
        case 'entityNBT': return `NBT: ${data.nbt || '?'}`;
        case 'condition': return `条件：${data.selector || '@p'} ? "${data.trueText || '?'}" : "${data.falseText || '?'}"`;
        default: return comp.type;
    }
}

// ==================== 组件操作 ====================
function deleteComponent(index) {
    components.splice(index, 1);
    renderComponentsList();
    updatePreview();
}

function moveComponent(index, direction) {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= components.length) return;
    [components[index], components[newIndex]] = [components[newIndex], components[index]];
    renderComponentsList();
    updatePreview();
}

function clearAll() {
    if (confirm('确定要清空所有组件吗？')) {
        components = [];
        renderComponentsList();
        updatePreview();
    }
}

// ==================== 记分板调试 ====================
function addScoreDebug() {
    closeAddDebugMenu();
    const id = scoreDebugId++;
    const container = document.getElementById('scoreDebugList');
    if (!container) return;
    
    const item = document.createElement('div');
    item.className = 'score-debug-item';
    item.id = `scoreDebug_${id}`;
    item.innerHTML = `
        <div class="debug-item">
            <label>记分项名称</label>
            <input type="text" class="score-objective" value="money" oninput="updatePreview()">
        </div>
        <div class="debug-item">
            <label>分数值</label>
            <input type="number" class="score-value" value="100" oninput="updatePreview()">
        </div>
        <div class="score-debug-actions">
            <button onclick="removeScoreDebug(${id})">删除</button>
        </div>
    `;
    
    container.appendChild(item);
    updateScoreCount();
    updatePreview();
    
    setTimeout(() => {
        const rightPanel = document.querySelector('.right-panel .panel-content');
        if (rightPanel) {
            rightPanel.scrollTo({ top: rightPanel.scrollHeight, behavior: 'smooth' });
        }
    }, 100);
}

function removeScoreDebug(id) {
    const item = document.getElementById(`scoreDebug_${id}`);
    if (item) {
        item.remove();
        updateScoreCount();
        updatePreview();
    }
}

function updateScoreCount() {
    const count = document.querySelectorAll('#scoreDebugList .score-debug-item').length;
    const countEl = document.getElementById('scoreCount');
    if (countEl) countEl.innerText = `(${count})`;
}

function getScoreDebugValues() {
    const scores = [];
    document.querySelectorAll('#scoreDebugList .score-debug-item').forEach(item => {
        scores.push({
            objective: item.querySelector('.score-objective')?.value || '',
            value: item.querySelector('.score-value')?.value || '0'
        });
    });
    return scores;
}

// ==================== 标签调试 ====================
function addTagDebug() {
    closeAddDebugMenu();
    const id = tagDebugId++;
    const container = document.getElementById('tagDebugList');
    if (!container) return;
    
    const item = document.createElement('div');
    item.className = 'score-debug-item';
    item.id = `tagDebug_${id}`;
    item.innerHTML = `
        <div class="debug-item">
            <label>标签名称</label>
            <input type="text" class="tag-name" value="hasItem" oninput="updatePreview()">
        </div>
        <div class="score-debug-actions">
            <button onclick="removeTagDebug(${id})">删除</button>
        </div>
    `;
    
    container.appendChild(item);
    updateTagCount();
    updatePreview();
    
    setTimeout(() => {
        const rightPanel = document.querySelector('.right-panel .panel-content');
        if (rightPanel) {
            rightPanel.scrollTo({ top: rightPanel.scrollHeight, behavior: 'smooth' });
        }
    }, 100);
}

function removeTagDebug(id) {
    const item = document.getElementById(`tagDebug_${id}`);
    if (item) {
        item.remove();
        updateTagCount();
        updatePreview();
    }
}

function updateTagCount() {
    const count = document.querySelectorAll('#tagDebugList .score-debug-item').length;
    const countEl = document.getElementById('tagCount');
    if (countEl) countEl.innerText = `(${count})`;
}

function getTagDebugValues() {
    const tags = [];
    document.querySelectorAll('#tagDebugList .score-debug-item').forEach(item => {
        tags.push({ tag: item.querySelector('.tag-name')?.value || '' });
    });
    return tags;
}

// ==================== 生成 JSON ====================
function generateJSON() {
    if (!components || components.length === 0) {
        return { rawtext: [] };
    }
    
    const rawtext = components.map(comp => {
        if (!comp || !comp.type) return null;
        
        switch (comp.type) {
            case 'text':
                return { text: cleanText(comp.data?.text || '') };
            case 'score':
                return {
                    score: {
                        name: cleanText(comp.data?.selector || '@p'),
                        objective: cleanText(comp.data?.objective || '')
                    }
                };
            case 'selector':
                return { selector: cleanText(comp.data?.selector || '@p') };
            case 'entityName':
                return { entityname: cleanText(comp.data?.selector || '@p') };
            case 'entityNBT':
                return {
                    nbt: {
                        selector: cleanText(comp.data?.selector || '@p'),
                        nbt: cleanText(comp.data?.nbt || '')
                    }
                };
            case 'condition':
                return {
                    translate: '%%2',
                    with: {
                        rawtext: [
                            { selector: cleanText(comp.data?.selector || '@p') },
                            { text: cleanText(comp.data?.trueText || '') },
                            { text: cleanText(comp.data?.falseText || '') }
                        ]
                    }
                };
            default:
                return { text: '' };
        }
    }).filter(item => item !== null);
    
    return { rawtext };
}

// ==================== 预览渲染 ====================
function updatePreview() {
    const json = generateJSON();
    const previewContent = document.getElementById('previewContent');
    const jsonOutput = document.getElementById('jsonOutput');
    const commandOutput = document.getElementById('commandOutput');
    
    if (!previewContent || !jsonOutput || !commandOutput) return;
    
    previewContent.innerHTML = renderPreviewText(json.rawtext);
    
    const isPretty = jsonOutput.dataset.pretty === 'true';
    jsonOutput.innerText = isPretty ? JSON.stringify(json, null, 2) : JSON.stringify(json);
    
    commandOutput.innerText = `/titleraw @a title ${JSON.stringify(json)}`;
}

function renderPreviewText(rawtextArray) {
    if (!rawtextArray || rawtextArray.length === 0) {
        return '<span style="color: #666;">(无内容)</span>';
    }
    
    const debugVars = {
        selectorP: document.getElementById('debugSelectorP')?.value || 'Steve',
        selectorR: document.getElementById('debugSelectorR')?.value || 'Alex',
        selectorA: document.getElementById('debugSelectorA')?.value || '所有玩家',
        entityName: document.getElementById('debugEntityName')?.value || '僵尸',
        entityNBT: document.getElementById('debugEntityNBT')?.value || '20',
        scores: getScoreDebugValues(),
        tags: getTagDebugValues()
    };
    
    let formatState = { color: '#FFFFFF', isBold: false, isObfuscated: false, isItalic: false };
    
    return rawtextArray.map(item => {
        if (!item) return '';
        
        let text = '';
        
        if (item.text) {
            const result = parseFormatCodes(item.text, formatState);
            text = result.html;
            formatState = result.state;
        } else if (item.translate === '%%2' && item.with && item.with.rawtext) {
            const selector = item.with.rawtext[0]?.selector || '@p';
            const conditionMet = checkCondition(selector);
            
            if (conditionMet && item.with.rawtext[1]?.text) {
                const result = parseFormatCodes(item.with.rawtext[1].text, formatState);
                text = result.html;
                formatState = result.state;
            } else if (!conditionMet && item.with.rawtext[2]?.text) {
                const result = parseFormatCodes(item.with.rawtext[2].text, formatState);
                text = result.html;
                formatState = result.state;
            } else {
                text = '(条件判断)';
            }
        } else if (item.score) {
            const scoreData = debugVars.scores.find(s => s.objective === item.score.objective);
            text = scoreData ? scoreData.value : '??';
            text = `<span style="color: ${formatState.color}">${text}</span>`;
        } else if (item.selector) {
            text = item.selector === '@p' ? debugVars.selectorP :
                   item.selector === '@r' ? debugVars.selectorR :
                   item.selector === '@a' ? debugVars.selectorA : item.selector;
            text = `<span style="color: ${formatState.color}">${text}</span>`;
        } else if (item.entityname) {
            text = debugVars.entityName;
            text = `<span style="color: ${formatState.color}">${text}</span>`;
        } else if (item.nbt) {
            text = debugVars.entityNBT;
            text = `<span style="color: ${formatState.color}">${text}</span>`;
        }
        
        return `<span>${text}</span>`;
    }).join('');
}

// ==================== 复制功能 ====================
function copyJSON() {
    const json = document.getElementById('jsonOutput')?.innerText;
    if (!json) return;
    fallbackCopy(json, '✅ JSON 已复制');
}

function copyCommand() {
    const cmd = document.getElementById('commandOutput')?.innerText;
    if (!cmd) return;
    fallbackCopy(cmd, '✅ 命令已复制');
}

function fallbackCopy(text, successMsg) {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => showToast(successMsg)).catch(() => execCopy(text, successMsg));
    } else {
        execCopy(text, successMsg);
    }
}

function execCopy(text, successMsg) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '-9999px';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
        document.execCommand('copy');
        showToast(successMsg);
    } catch (e) {
        showToast('❌ 复制失败，请手动复制');
    }
    document.body.removeChild(textarea);
}

// ==================== 切换 JSON 格式化 ====================
function toggleJSONFormat() {
    const jsonOutput = document.getElementById('jsonOutput');
    const formatBtn = document.getElementById('formatBtn');
    const json = generateJSON();
    
    const isPretty = jsonOutput.dataset.pretty === 'true';
    jsonOutput.dataset.pretty = isPretty ? 'false' : 'true';
    
    if (isPretty) {
        jsonOutput.innerText = JSON.stringify(json);
        if (formatBtn) formatBtn.innerText = '美化';
    } else {
        jsonOutput.innerText = JSON.stringify(json, null, 2);
        if (formatBtn) formatBtn.innerText = '紧凑';
    }
}

// ==================== Toast 提示 ====================
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

// ==================== 窗口点击关闭弹窗 ====================
window.onclick = function(event) {
    const modal = document.getElementById('configModal');
    const addModal = document.getElementById('addDebugModal');
    if (modal && event.target == modal) closeModal();
    if (addModal && event.target == addModal) closeAddDebugMenu();
}

// ==================== 调试工具 ====================
window.debugData = () => {
    console.log('=== 当前数据 ===');
    console.log('组件数:', components?.length || 0);
    console.log('Scores:', getScoreDebugValues());
    console.log('Tags:', getTagDebugValues());
};