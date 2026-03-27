// script.js - MC Title Raw 生成器 2.0（完整修复版）
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

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ==================== 初始化 ====================
document.addEventListener('DOMContentLoaded', function() {
    setupComponentButtons();
    updatePreview();
    checkOrientation();
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', saveComponent);
    }
});

// ==================== 检查屏幕方向（支持 URL 参数） ====================
function checkOrientation() {
    const warning = document.getElementById('landscapeWarning');
    const app = document.querySelector('.app-container');
    
    let forcePortrait = false;
    
    try {
        if (window.URLSearchParams) {
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('force-portrait') === 'true' || 
                urlParams.get('no-orientation-check') === 'true' ||
                urlParams.get('mobile') === 'true' ||
                urlParams.get('portrait') === 'true') {
                forcePortrait = true;
            }
        }
        
        if (!forcePortrait) {
            const queryString = window.location.search.substring(1);
            if (queryString.indexOf('force-portrait=true') !== -1 ||
                queryString.indexOf('no-orientation-check=true') !== -1 ||
                queryString.indexOf('mobile=true') !== -1 ||
                queryString.indexOf('portrait=true') !== -1) {
                forcePortrait = true;
            }
        }
    } catch (e) {
        console.log('⚠️ URL 参数解析失败:', e);
    }
    
    if (forcePortrait) {
        console.log('📱 已启用竖屏模式（通过 URL 参数）');
        if (warning) warning.style.display = 'none';
        if (app) app.style.display = 'flex';
        return;
    }
    
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
    const buttons = document.querySelectorAll('.component-btn');
    for (let i = 0; i < buttons.length; i++) {
        (function(btn) {
            btn.addEventListener('click', function() {
                const type = btn.getAttribute('data-type');
                openConfigModal(type);
            });
        })(buttons[i]);
    }
}

// ==================== 保存对话框 ====================
function showSaveDialog() {
    const modal = document.getElementById('saveDialog');
    const jsonOutput = document.getElementById('saveJsonOutput');
    if (!modal || !jsonOutput) return;
    
    const projectData = {
        version: '2.0',
        timestamp: new Date().toISOString(),
        components: components,
        debugScores: getScoreDebugValues(),
        debugTags: getTagDebugValues()
    };
    
    jsonOutput.innerText = JSON.stringify(projectData, null, 2);
    modal.classList.add('show');
}

function closeSaveDialog() {
    const modal = document.getElementById('saveDialog');
    if (modal) modal.classList.remove('show');
}

function copySaveJson() {
    const json = document.getElementById('saveJsonOutput');
    if (!json || !json.innerText) return;
    fallbackCopy(json.innerText, '✅ 项目 JSON 已复制');
}

function downloadJson() {
    const json = document.getElementById('saveJsonOutput');
    if (!json || !json.innerText) {
        showToast('❌ 没有可下载的内容', 'error');
        return;
    }
    
    const now = new Date();
    const timestamp = now.getFullYear() + 
                     String(now.getMonth() + 1).padStart(2, '0') + 
                     String(now.getDate()).padStart(2, '0') + 
                     String(now.getHours()).padStart(2, '0') + 
                     String(now.getMinutes()).padStart(2, '0') + 
                     String(now.getSeconds()).padStart(2, '0');
    
    const filename = 'neko-app mc-rawtext' + timestamp + '.json';
    const blob = new Blob([json.innerText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('✅ 文件已下载：' + filename);
}

// ==================== 加载对话框 ====================
function showLoadDialog() {
    const modal = document.getElementById('loadDialog');
    const jsonInput = document.getElementById('loadJsonInput');
    if (!modal || !jsonInput) return;
    
    jsonInput.value = '';
    const fileInput = document.getElementById('loadFileInput');
    if (fileInput) fileInput.value = '';
    
    modal.classList.add('show');
}

function closeLoadDialog() {
    const modal = document.getElementById('loadDialog');
    if (modal) modal.classList.remove('show');
}

// ==================== 版本转换提示 ====================
function showVersionConvertDialog(version) {
    const modal = document.getElementById('versionConvertDialog');
    const message = document.getElementById('versionConvertMessage');
    if (!modal || !message) return;
    
    message.innerHTML = '检测到上传的 JSON 为 ' + version + ' 版本<br>是否跳转至版本转换器？';
    modal.classList.add('show');
}

function closeVersionConvertDialog() {
    const modal = document.getElementById('versionConvertDialog');
    if (modal) modal.classList.remove('show');
}

function convertVersion() {
    closeVersionConvertDialog();
    // 🎯 这里可以跳转到版本转换器页面
    // window.location.href = 'converter.html';
    showToast('🔧 尝试拉起窗口...', 'info');
}

// ==================== 文件上传处理 ====================
function handleFileUpload(input) {
    const file = input.files[0];
    if (!file) return;
    
    if (file.name.indexOf('.json') === -1) {
        showToast('❌ 请选择.json 文件', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const jsonText = e.target.result;
        const jsonInput = document.getElementById('loadJsonInput');
        if (jsonInput) {
            jsonInput.value = jsonText;
        }
        showToast('✅ 文件已读取，点击"加载"按钮继续');
    };
    reader.onerror = function() {
        showToast('❌ 文件读取失败', 'error');
    };
    reader.readAsText(file);
    input.value = '';
}

// ==================== 🎯 JSON 验证与版本检测 ====================
function validateJSON(jsonText) {
    const errors = [];
    let projectData;
    
    try {
        projectData = JSON.parse(jsonText);
    } catch (e) {
        return { valid: false, errors: ['❌ JSON 格式错误：' + e.message], version: 'unknown' };
    }
    
    // 🎯 检测版本
    const version = projectData.version || '1.0';
    
    // 🎯 版本检测：只允许 2.0 版本
    if (version === '1.0') {
        return { valid: false, errors: ['⚠️ 检测到 1.0 版本'], version: '1.0', needsConvert: true };
    }
    
    if (!projectData.components) {
        errors.push('❌ 缺少必要字段：components');
    } else if (!Array.isArray(projectData.components)) {
        errors.push('❌ components 必须是数组');
    } else {
        for (let i = 0; i < projectData.components.length; i++) {
            const comp = projectData.components[i];
            if (!comp.type) errors.push('❌ 组件 [' + i + '] 缺少 type 字段');
            if (comp.data === undefined) {
                comp.data = {};
            }
        }
    }
    
    return { valid: errors.length === 0, errors: errors, data: projectData, version: version };
}

function loadProject() {
    const jsonInput = document.getElementById('loadJsonInput');
    if (!jsonInput) return;
    
    const jsonText = jsonInput.value.trim();
    if (!jsonText) {
        showToast('❌ 请输入 JSON 代码或选择文件', 'error');
        return;
    }
    
    const validation = validateJSON(jsonText);
    
    // 🎯 版本检测：1.0 版本提示转换
    if (validation.needsConvert) {
        showVersionConvertDialog(validation.version);
        return;
    }
    
    if (!validation.valid) {
        showToast('❌ JSON 验证失败:\n' + validation.errors.join('\n'), 'error');
        return;
    }
    
    try {
        const projectData = validation.data;
        components = projectData.components || [];
        if (projectData.debugScores) loadScoreDebug(projectData.debugScores);
        if (projectData.debugTags) loadTagDebug(projectData.debugTags);
        
        renderComponentsList();
        updatePreview();
        closeLoadDialog();
        showToast('✅ 项目加载成功！');
    } catch (e) {
        showToast('❌ 加载失败：' + e.message, 'error');
    }
}

function loadScoreDebug(scores) {
    const container = document.getElementById('scoreDebugList');
    if (!container) return;
    
    container.innerHTML = '';
    scoreDebugId = 0;
    
    for (let i = 0; i < scores.length; i++) {
        const score = scores[i];
        const id = scoreDebugId++;
        const item = document.createElement('div');
        item.className = 'score-debug-item';
        item.id = 'scoreDebug_' + id;
        item.innerHTML = '<div class="debug-item"><label>记分项名称</label><input type="text" class="score-objective" value="' + escapeHtml(score.objective || '') + '" oninput="updatePreview()"></div><div class="debug-item"><label>分数值</label><input type="number" class="score-value" value="' + escapeHtml(score.value || '0') + '" oninput="updatePreview()"></div><div class="score-debug-actions"><button onclick="removeScoreDebug(' + id + ')">删除</button></div>';
        container.appendChild(item);
    }
    
    updateScoreCount();
}

function loadTagDebug(tags) {
    const container = document.getElementById('tagDebugList');
    if (!container) return;
    
    container.innerHTML = '';
    tagDebugId = 0;
    
    for (let i = 0; i < tags.length; i++) {
        const tag = tags[i];
        const id = tagDebugId++;
        const item = document.createElement('div');
        item.className = 'score-debug-item';
        item.id = 'tagDebug_' + id;
        item.innerHTML = '<div class="debug-item"><label>标签名称</label><input type="text" class="tag-name" value="' + escapeHtml(tag.tag || '') + '" oninput="updatePreview()"></div><div class="score-debug-actions"><button onclick="removeTagDebug(' + id + ')">删除</button></div>';
        container.appendChild(item);
    }
    
    updateTagCount();
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
function openConfigModal(type, index) {
    if (index === undefined) index = -1;
    
    const modal = document.getElementById('configModal');
    const title = document.getElementById('modalTitle');
    const form = document.getElementById('modalForm');
    
    if (!modal || !form) {
        console.error('弹窗元素不存在');
        return;
    }
    
    currentComponentIndex = index;
    
    if (index >= 0 && components[index]) {
        currentComponent = JSON.parse(JSON.stringify(components[index]));
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
    if (!form) {
        console.error('表单不存在');
        return;
    }
    
    const data = {};
    const inputs = form.querySelectorAll('input, textarea, select');
    
    for (let i = 0; i < inputs.length; i++) {
        const input = inputs[i];
        if (input.name) data[input.name] = cleanText(input.value);
    }
    
    if (currentComponent.type === 'condition') {
        data.branches = parseInt(data.branches || '2');
        // 🎯 保存多个选择器
        for (let j = 0; j < data.branches - 1; j++) {
            data['selector' + (j + 1)] = cleanText(data['selector' + (j + 1)] || '@p');
        }
        // 保存文本
        for (let j = 1; j <= data.branches; j++) {
            data['text' + j] = cleanText(data['text' + j] || '');
        }
    }
    
    currentComponent.data = data;
    
    if (currentComponentIndex >= 0) {
        components[currentComponentIndex] = JSON.parse(JSON.stringify(currentComponent));
    } else {
        components.push(JSON.parse(JSON.stringify(currentComponent)));
    }
    
    closeModal();
    renderComponentsList();
    updatePreview();
}

// ==================== 🎯 表单生成（动态选择器） ====================
function generateFormHTML(type, data) {
    if (!data) data = {};
    
    switch (type) {
        case 'text':
            return '<div class="form-group"><label>文本内容</label><textarea name="text" placeholder="输入文本...（支持换行和§格式代码）">' + escapeHtml(data.text || '') + '</textarea><small>💡 按 Enter 换行<br>💡 支持 § 格式代码（§c 红色，§l 粗体，§k 混淆）<br>⚠️ §n 褐色，§p 深红色，§6/§e 金色</small></div>';
        
        case 'score':
            return '<div class="form-row"><div class="form-group"><label>选择器</label><input type="text" name="selector" placeholder="@p" value="' + escapeHtml(data.selector || '') + '"></div><div class="form-group"><label>记分项</label><input type="text" name="objective" placeholder="money" value="' + escapeHtml(data.objective || '') + '"></div></div>';
        
        case 'selector':
            return '<div class="form-group"><label>选择器</label><input type="text" name="selector" placeholder="@p" value="' + escapeHtml(data.selector || '') + '"></div>';
        
        case 'entityName':
            return '<div class="form-group"><label>选择器</label><input type="text" name="selector" placeholder="@e[type=player,limit=1]" value="' + escapeHtml(data.selector || '') + '"></div><small>💡 实体名称组件生成 {"selector":"..."} 结构</small>';
        
        case 'entityNBT':
            return '<div class="form-row"><div class="form-group"><label>选择器</label><input type="text" name="selector" placeholder="@p" value="' + escapeHtml(data.selector || '') + '"></div><div class="form-group"><label>NBT 路径</label><input type="text" name="nbt" placeholder="Health" value="' + escapeHtml(data.nbt || '') + '"></div></div>';
        
        case 'condition':
            const branches = parseInt(data.branches || '2');
            let html = '<div class="form-group"><label>分支数量</label><select name="branches" onchange="updateConditionForm(this.value)">';
            for (let i = 2; i <= 5; i++) {
                html += '<option value="' + i + '"' + (branches === i ? ' selected' : '') + '>' + i + ' 个分支（%%' + i + '）</option>';
            }
            html += '</select><small>💡 %%2=如果/否则，%%3=如果/否则如果/否则，以此类推</small></div>';
            
            // 🎯 动态生成 n-1 个选择器输入框
            html += '<div class="form-group"><label>条件选择器 (共' + (branches - 1) + '个)</label>';
            for (let j = 0; j < branches - 1; j++) {
                const selectorValue = data['selector' + (j + 1)] || '@p';
                html += '<div style="margin-bottom: 8px;"><input type="text" name="selector' + (j + 1) + '" placeholder="选择器 ' + (j + 1) + '" value="' + escapeHtml(selectorValue) + '"><small style="color: var(--text-muted);">选择器 ' + (j + 1) + '</small></div>';
            }
            html += '<small>支持 scores 范围：=5、=1..10、=..10、=1..，可用! 反选</small></div>';
            
            // 生成 n 个文本输入框
            for (let i = 1; i <= branches; i++) {
                const label = i === 1 ? '如果条件成立' : (i === branches ? '否则' : '否则如果');
                html += '<div class="form-group"><label>' + label + '时显示</label><textarea name="text' + i + '" placeholder="' + label + '时显示的文本">' + escapeHtml(data['text' + i] || '') + '</textarea></div>';
            }
            
            return html;
        
        default:
            return '<p style="color: var(--accent-red);">未知组件类型</p>';
    }
}

// 🎯 动态更新条件表单
function updateConditionForm(branches) {
    const modal = document.getElementById('configModal');
    const form = document.getElementById('modalForm');
    const type = currentComponent.type;
    const data = currentComponent.data;
    data.branches = parseInt(branches);
    form.innerHTML = generateFormHTML(type, data);
}

// ==================== 🎯 格式代码解析 ====================
function parseFormatCodes(text, formatState) {
    if (!text) return { html: text, state: formatState || { color: '#FFFFFF', isBold: false, isObfuscated: false, isItalic: false } };
    if (!formatState) formatState = { color: '#FFFFFF', isBold: false, isObfuscated: false, isItalic: false };
    
    let result = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    
    const colors = {
        '§0': '#000000', '§1': '#0000AA', '§2': '#00AA00', '§3': '#00AAAA',
        '§4': '#AA0000', '§5': '#AA00AA', '§6': '#FFAA00', '§7': '#AAAAAA',
        '§8': '#555555', '§9': '#5555FF', '§a': '#55FF55', '§b': '#55FFFF',
        '§c': '#FF5555', '§d': '#FF55FF', '§e': '#FFFF55', '§f': '#FFFFFF',
        '§m': '#880000', '§n': '#AA5500', '§p': '#880000'
    };
    
    let state = {
        color: formatState.color || '#FFFFFF',
        isBold: formatState.isBold || false,
        isObfuscated: formatState.isObfuscated || false,
        isItalic: formatState.isItalic || false
    };
    
    let html = '';
    const parts = result.split(/(§[0-9a-fkmnlopr])/gi);
    
    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (!part) continue;
        
        if (part.match(/^§[0-9a-fkmnlopr]$/i)) {
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
            if (state.isObfuscated) displayText = '•'.repeat(part.length);
            
            let styles = 'color: ' + state.color + ';';
            if (state.isBold) styles += ' font-weight: bold;';
            if (state.isItalic) styles += ' font-style: italic;';
            
            html += '<span style="' + styles + '">' + displayText + '</span>';
        }
    }
    
    return { html: html, state: state };
}

// ==================== 🎯 多重条件判断解析 ====================
function parseSelectorCondition(selector) {
    const conditions = { scores: [], tags: [] };
    const scoresRegex = /scores={?([a-zA-Z0-9_]+)=(!)?(\d*\.\.\d*|\d+)}?/g;
    let match;
    
    while ((match = scoresRegex.exec(selector)) !== null) {
        const name = match[1];
        const isInverted = match[2] === '!';
        const valueStr = match[3];
        let min = null, max = null;
        
        if (valueStr.indexOf('..') !== -1) {
            const parts = valueStr.split('..');
            if (parts[0] !== '') min = parseInt(parts[0]);
            if (parts[1] !== '') max = parseInt(parts[1]);
        } else {
            min = max = parseInt(valueStr);
        }
        
        conditions.scores.push({ name: name, min: min, max: max, inverted: isInverted });
    }
    
    const tagRegex = /tag=(!)?([a-zA-Z0-9_]+)/g;
    while ((match = tagRegex.exec(selector)) !== null) {
        conditions.tags.push({ tag: match[2], inverted: match[1] === '!' });
    }
    
    return conditions;
}

function checkCondition(selector) {
    const conditions = parseSelectorCondition(selector);
    const debugScores = getScoreDebugValues();
    const debugTags = getTagDebugValues();
    
    for (let i = 0; i < conditions.scores.length; i++) {
        const cond = conditions.scores[i];
        const scoreData = debugScores.find(function(s) { return s.objective === cond.name; });
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
        
        if (cond.inverted) { if (matches) return false; }
        else { if (!matches) return false; }
    }
    
    for (let i = 0; i < conditions.tags.length; i++) {
        const cond = conditions.tags[i];
        const hasTag = debugTags.some(function(t) { return t.tag === cond.tag; });
        if (cond.inverted) { if (hasTag) return false; }
        else { if (!hasTag) return false; }
    }
    
    return true;
}

// ==================== 🎯 渲染组件列表 ====================
function renderComponentsList() {
    const container = document.getElementById('componentsList');
    if (!container) return;
    
    if (!components || components.length === 0) {
        container.innerHTML = '<div class="empty-state">👈 从左侧选择组件添加</div>';
        return;
    }
    
    let html = '';
    for (let index = 0; index < components.length; index++) {
        const comp = components[index];
        const preview = getComponentPreview(comp);
        const conditionClass = comp.type === 'condition' ? ' condition-type' : '';
        html += '<div class="component-item' + conditionClass + '"><div class="component-item-info"><div class="component-item-type">' + comp.type + '</div><div class="component-item-preview">' + escapeHtml(preview) + '</div></div><div class="component-item-actions"><button class="btn-up" onclick="moveComponent(' + index + ', -1)">↑</button><button class="btn-down" onclick="moveComponent(' + index + ', 1)">↓</button><button class="btn-copy" onclick="duplicateComponent(' + index + ')">📋</button><button class="btn-edit" onclick="openConfigModal(\'' + comp.type + '\', ' + index + ')">编辑</button><button class="btn-delete" onclick="deleteComponent(' + index + ')">删除</button></div></div>';
    }
    container.innerHTML = html;
}

function getComponentPreview(comp) {
    if (!comp || !comp.data) return '(空)';
    const data = comp.data;
    
    switch (comp.type) {
        case 'text': return data.text || '(空文本)';
        case 'score': return '分数：' + (data.selector || '@p') + ' ' + (data.objective || '?');
        case 'selector': return '选择器：' + (data.selector || '@p');
        case 'entityName': return '实体名：' + (data.selector || '@p');
        case 'entityNBT': return 'NBT: ' + (data.nbt || '?');
        case 'condition':
            const branches = data.branches || 2;
            return '条件：' + (data.selector1 || '@p') + ' (' + branches + '分支)';
        default: return comp.type;
    }
}

function deleteComponent(index) {
    components.splice(index, 1);
    renderComponentsList();
    updatePreview();
}

// ==================== 🎯 复制组件功能 ====================
function duplicateComponent(index) {
    if (index < 0 || index >= components.length) return;
    const original = components[index];
    const duplicate = JSON.parse(JSON.stringify(original));
    components.splice(index + 1, 0, duplicate);
    renderComponentsList();
    updatePreview();
    showToast('✅ 组件已复制');
}

function moveComponent(index, direction) {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= components.length) return;
    const temp = components[index];
    components[index] = components[newIndex];
    components[newIndex] = temp;
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
    item.id = 'scoreDebug_' + id;
    item.innerHTML = '<div class="debug-item"><label>记分项名称</label><input type="text" class="score-objective" value="money" oninput="updatePreview()"></div><div class="debug-item"><label>分数值</label><input type="number" class="score-value" value="100" oninput="updatePreview()"></div><div class="score-debug-actions"><button onclick="removeScoreDebug(' + id + ')">删除</button></div>';
    container.appendChild(item);
    
    updateScoreCount();
    updatePreview();
    
    setTimeout(function() {
        const rightPanel = document.querySelector('.right-panel .panel-content');
        if (rightPanel) rightPanel.scrollTo({ top: rightPanel.scrollHeight, behavior: 'smooth' });
    }, 100);
}

function removeScoreDebug(id) {
    const item = document.getElementById('scoreDebug_' + id);
    if (item) { item.remove(); updateScoreCount(); updatePreview(); }
}

function updateScoreCount() {
    const count = document.querySelectorAll('#scoreDebugList .score-debug-item').length;
    const countEl = document.getElementById('scoreCount');
    if (countEl) countEl.innerText = '(' + count + ')';
}

function getScoreDebugValues() {
    const scores = [];
    const items = document.querySelectorAll('#scoreDebugList .score-debug-item');
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        scores.push({
            objective: item.querySelector('.score-objective') ? item.querySelector('.score-objective').value : '',
            value: item.querySelector('.score-value') ? item.querySelector('.score-value').value : '0'
        });
    }
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
    item.id = 'tagDebug_' + id;
    item.innerHTML = '<div class="debug-item"><label>标签名称</label><input type="text" class="tag-name" value="hasItem" oninput="updatePreview()"></div><div class="score-debug-actions"><button onclick="removeTagDebug(' + id + ')">删除</button></div>';
    container.appendChild(item);
    
    updateTagCount();
    updatePreview();
    
    setTimeout(function() {
        const rightPanel = document.querySelector('.right-panel .panel-content');
        if (rightPanel) rightPanel.scrollTo({ top: rightPanel.scrollHeight, behavior: 'smooth' });
    }, 100);
}

function removeTagDebug(id) {
    const item = document.getElementById('tagDebug_' + id);
    if (item) { item.remove(); updateTagCount(); updatePreview(); }
}

function updateTagCount() {
    const count = document.querySelectorAll('#tagDebugList .score-debug-item').length;
    const countEl = document.getElementById('tagCount');
    if (countEl) countEl.innerText = '(' + count + ')';
}

function getTagDebugValues() {
    const tags = [];
    const items = document.querySelectorAll('#tagDebugList .score-debug-item');
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        tags.push({ tag: item.querySelector('.tag-name') ? item.querySelector('.tag-name').value : '' });
    }
    return tags;
}

// ==================== 🎯 生成 JSON（n-1 选择器 + n 文本） ====================
function generateJSON() {
    if (!components || components.length === 0) return { rawtext: [] };
    
    const rawtext = [];
    for (let i = 0; i < components.length; i++) {
        const comp = components[i];
        if (!comp || !comp.type) continue;
        
        let item = null;
        switch (comp.type) {
            case 'text':
                item = { text: cleanText(comp.data && comp.data.text ? comp.data.text : '') };
                break;
            case 'score':
                item = { score: { name: cleanText(comp.data && comp.data.selector ? comp.data.selector : '@p'), objective: cleanText(comp.data && comp.data.objective ? comp.data.objective : '') } };
                break;
            case 'selector':
                item = { selector: cleanText(comp.data && comp.data.selector ? comp.data.selector : '@p') };
                break;
            case 'entityName':
                item = { selector: cleanText(comp.data && comp.data.selector ? comp.data.selector : '@p') };
                break;
            case 'entityNBT':
                item = { nbt: { selector: cleanText(comp.data && comp.data.selector ? comp.data.selector : '@p'), nbt: cleanText(comp.data && comp.data.nbt ? comp.data.nbt : '') } };
                break;
            case 'condition':
                // 🎯 2.0 多重条件判断 - 选择器数量 = 分支数 - 1
                const branches = parseInt(comp.data && comp.data.branches ? comp.data.branches : '2');
                const rawtextArray = [];
                
                // 🎯 添加 n-1 个选择器
                for (let j = 0; j < branches - 1; j++) {
                    rawtextArray.push({ selector: cleanText(comp.data && comp.data['selector' + (j + 1)] ? comp.data['selector' + (j + 1)] : '@p') });
                }
                
                // 🎯 添加 n 个文本
                for (let j = 1; j <= branches; j++) {
                    rawtextArray.push({ text: cleanText(comp.data && comp.data['text' + j] ? comp.data['text' + j] : '') });
                }
                
                item = { translate: '%%' + branches, with: { rawtext: rawtextArray } };
                break;
            default:
                item = { text: '' };
        }
        
        if (item) rawtext.push(item);
    }
    
    return { rawtext: rawtext };
}

// ==================== 预览渲染 ====================
function updatePreview() {
    const json = generateJSON();
    const previewContent = document.getElementById('previewContent');
    const jsonOutput = document.getElementById('jsonOutput');
    const commandOutput = document.getElementById('commandOutput');
    
    if (!previewContent || !jsonOutput || !commandOutput) return;
    
    previewContent.innerHTML = renderPreviewText(json.rawtext);
    
    const isPretty = jsonOutput.getAttribute('data-pretty') === 'true';
    jsonOutput.innerText = isPretty ? JSON.stringify(json, null, 2) : JSON.stringify(json);
    
    commandOutput.innerText = '/titleraw @a title ' + JSON.stringify(json);
}

function renderPreviewText(rawtextArray) {
    if (!rawtextArray || rawtextArray.length === 0) return '<span style="color: #666;">(无内容)</span>';
    
    const debugVars = {
        selectorP: document.getElementById('debugSelectorP') ? document.getElementById('debugSelectorP').value : 'Steve',
        selectorR: document.getElementById('debugSelectorR') ? document.getElementById('debugSelectorR').value : 'Alex',
        selectorA: document.getElementById('debugSelectorA') ? document.getElementById('debugSelectorA').value : '所有玩家',
        entityName: document.getElementById('debugEntityName') ? document.getElementById('debugEntityName').value : '僵尸',
        entityNBT: document.getElementById('debugEntityNBT') ? document.getElementById('debugEntityNBT').value : '20',
        scores: getScoreDebugValues(),
        tags: getTagDebugValues()
    };
    
    let formatState = { color: '#FFFFFF', isBold: false, isObfuscated: false, isItalic: false };
    let html = '';
    
    for (let i = 0; i < rawtextArray.length; i++) {
        const item = rawtextArray[i];
        if (!item) continue;
        
        let text = '';
        
        if (item.text) {
            const result = parseFormatCodes(item.text, formatState);
            text = result.html;
            formatState = result.state;
        } else if (item.translate && item.translate.indexOf('%%') === 0 && item.with && item.with.rawtext) {
            // 🎯 2.0 多重条件判断预览
            const branches = parseInt(item.translate.substring(2));
            const selector = item.with.rawtext[0] && item.with.rawtext[0].selector ? item.with.rawtext[0].selector : '@p';
            const conditionMet = checkCondition(selector);
            
            let selectedBranch = 1;
            if (conditionMet) {
                selectedBranch = 1;
            } else {
                selectedBranch = branches;
            }
            
            // 🎯 文本在 rawtext 数组中的位置 = 选择器数量 + 分支索引
            const textIndex = (branches - 1) + selectedBranch;
            if (item.with.rawtext[textIndex] && item.with.rawtext[textIndex].text) {
                const result = parseFormatCodes(item.with.rawtext[textIndex].text, formatState);
                text = result.html;
                formatState = result.state;
            } else {
                text = '(条件判断)';
            }
        } else if (item.score) {
            const scoreData = debugVars.scores.find(function(s) { return s.objective === item.score.objective; });
            text = scoreData ? scoreData.value : '??';
            text = '<span style="color: ' + formatState.color + '">' + text + '</span>';
        } else if (item.selector) {
            text = item.selector === '@p' ? debugVars.selectorP :
                   item.selector === '@r' ? debugVars.selectorR :
                   item.selector === '@a' ? debugVars.selectorA :
                   item.selector;
            text = '<span style="color: ' + formatState.color + '">' + text + '</span>';
        } else if (item.nbt) {
            text = debugVars.entityNBT;
            text = '<span style="color: ' + formatState.color + '">' + text + '</span>';
        }
        
        html += '<span>' + text + '</span>';
    }
    
    return html;
}

// ==================== 复制功能 ====================
function copyJSON() {
    const json = document.getElementById('jsonOutput');
    if (!json || !json.innerText) return;
    fallbackCopy(json.innerText, '✅ JSON 已复制');
}

function copyCommand() {
    const cmd = document.getElementById('commandOutput');
    if (!cmd || !cmd.innerText) return;
    fallbackCopy(cmd.innerText, '✅ 命令已复制');
}

function fallbackCopy(text, successMsg) {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(function() { showToast(successMsg); }).catch(function() { execCopy(text, successMsg); });
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

function toggleJSONFormat() {
    const jsonOutput = document.getElementById('jsonOutput');
    const formatBtn = document.getElementById('formatBtn');
    const json = generateJSON();
    
    const isPretty = jsonOutput.getAttribute('data-pretty') === 'true';
    jsonOutput.setAttribute('data-pretty', isPretty ? 'false' : 'true');
    
    if (isPretty) {
        jsonOutput.innerText = JSON.stringify(json);
        if (formatBtn) formatBtn.innerText = '美化';
    } else {
        jsonOutput.innerText = JSON.stringify(json, null, 2);
        if (formatBtn) formatBtn.innerText = '紧凑';
    }
}

function showToast(message, type) {
    if (!type) type = 'success';
    const toast = document.createElement('div');
    toast.className = 'toast';
    if (type === 'error') toast.classList.add('toast-error');
    toast.innerText = message;
    document.body.appendChild(toast);
    setTimeout(function() { toast.classList.add('show'); }, 10);
    setTimeout(function() {
        toast.classList.remove('show');
        setTimeout(function() { toast.remove(); }, 300);
    }, 2000);
}

window.onclick = function(event) {
    const modal = document.getElementById('configModal');
    const addModal = document.getElementById('addDebugModal');
    const saveDialog = document.getElementById('saveDialog');
    const loadDialog = document.getElementById('loadDialog');
    const versionConvertDialog = document.getElementById('versionConvertDialog');
    
    if (modal && event.target == modal) closeModal();
    if (addModal && event.target == addModal) closeAddDebugMenu();
    if (saveDialog && event.target == saveDialog) closeSaveDialog();
    if (loadDialog && event.target == loadDialog) closeLoadDialog();
    if (versionConvertDialog && event.target == versionConvertDialog) closeVersionConvertDialog();
}

window.debugData = function() {
    console.log('=== 当前数据 ===');
    console.log('组件数:', components ? components.length : 0);
    console.log('Scores:', getScoreDebugValues());
    console.log('Tags:', getTagDebugValues());
};