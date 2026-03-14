let components = [];
let currentComponent = null;
let currentComponentIndex = -1;
let scoreDebugId = 0;
let tagDebugId = 0;

function cleanText(text) {
    if (!text) return '';
    return text.replace(/\r/g, '');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

document.addEventListener('DOMContentLoaded', function() {
    setupComponentButtons();
    updatePreview();
    checkOrientation();
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', saveComponent);
    }
});

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

function setupComponentButtons() {
    document.querySelectorAll('.component-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            const type = btn.dataset.type;
            openConfigModal(type);
        });
    });
}

function showSaveLoadMenu() {
    const modal = document.getElementById('saveLoadModal');
    if (modal) modal.classList.add('show');
}
function closeSaveLoadMenu() {
    const modal = document.getElementById('saveLoadModal');
    if (modal) modal.classList.remove('show');
}

function showSaveDialog() {
    closeSaveLoadMenu();
    const modal = document.getElementById('saveDialog');
    const jsonOutput = document.getElementById('saveJsonOutput');
    if (!modal || !jsonOutput) return;
    const projectData = {
        version: '1.0',
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
    const json = document.getElementById('saveJsonOutput')?.innerText;
    if (!json) return;
    fallbackCopy(json, '✅ 项目 JSON 已复制');
}

// 🎯 新增：下载 JSON 文件功能
function downloadJson() {
    const json = document.getElementById('saveJsonOutput')?.innerText;
    if (!json) {
        showToast('❌ 没有可下载的内容', 'error');
        return;
    }
    
    // 生成文件名：neko-app mc-rawtext＋时间戳.json
    const now = new Date();
    const timestamp = now.getFullYear() + 
                     String(now.getMonth() + 1).padStart(2, '0') + 
                     String(now.getDate()).padStart(2, '0') + 
                     String(now.getHours()).padStart(2, '0') + 
                     String(now.getMinutes()).padStart(2, '0') + 
                     String(now.getSeconds()).padStart(2, '0');
    
    const filename = 'neko-app mc-rawtext' + timestamp + '.json';
    
    // 创建 Blob 和下载链接
    const blob = new Blob([json], { type: 'application/json' });
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

function showLoadDialog() {
    closeSaveLoadMenu();
    const modal = document.getElementById('loadDialog');
    const jsonInput = document.getElementById('loadJsonInput');
    if (!modal || !jsonInput) return;
    jsonInput.value = '';
    modal.classList.add('show');
}
function closeLoadDialog() {
    const modal = document.getElementById('loadDialog');
    if (modal) modal.classList.remove('show');
}

function validateJSON(jsonText) {
    const errors = [];
    let projectData;
    try {
        projectData = JSON.parse(jsonText);
    } catch (e) {
        return { valid: false, errors: ['❌ JSON 格式错误：' + e.message] };
    }
    if (!projectData.components) {
        errors.push('❌ 缺少必要字段：components');
    } else if (!Array.isArray(projectData.components)) {
        errors.push('❌ components 必须是数组');
    } else {
        projectData.components.forEach(function(comp, index) {
            if (!comp.type) errors.push('❌ 组件 [' + index + '] 缺少 type 字段');
            if (!comp.data) errors.push('❌ 组件 [' + index + '] 缺少 data 字段');
        });
    }
    return { valid: errors.length === 0, errors: errors, data: projectData };
}

function loadProject() {
    const jsonInput = document.getElementById('loadJsonInput');
    if (!jsonInput) return;
    const jsonText = jsonInput.value.trim();
    if (!jsonText) {
        showToast('❌ 请输入 JSON 代码', 'error');
        return;
    }
    const validation = validateJSON(jsonText);
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
    scores.forEach(function(score) {
        const id = scoreDebugId++;
        const item = document.createElement('div');
        item.className = 'score-debug-item';
        item.id = 'scoreDebug_' + id;
        item.innerHTML = '<div class="debug-item"><label>记分项名称</label><input type="text" class="score-objective" value="' + escapeHtml(score.objective || '') + '" oninput="updatePreview()"></div><div class="debug-item"><label>分数值</label><input type="number" class="score-value" value="' + escapeHtml(score.value || '0') + '" oninput="updatePreview()"></div><div class="score-debug-actions"><button onclick="removeScoreDebug(' + id + ')">删除</button></div>';
        container.appendChild(item);
    });
    updateScoreCount();
}

function loadTagDebug(tags) {
    const container = document.getElementById('tagDebugList');
    if (!container) return;
    container.innerHTML = '';
    tagDebugId = 0;
    tags.forEach(function(tag) {
        const id = tagDebugId++;
        const item = document.createElement('div');
        item.className = 'score-debug-item';
        item.id = 'tagDebug_' + id;
        item.innerHTML = '<div class="debug-item"><label>标签名称</label><input type="text" class="tag-name" value="' + escapeHtml(tag.tag || '') + '" oninput="updatePreview()"></div><div class="score-debug-actions"><button onclick="removeTagDebug(' + id + ')">删除</button></div>';
        container.appendChild(item);
    });
    updateTagCount();
}

function showAddDebugMenu() {
    const modal = document.getElementById('addDebugModal');
    if (modal) modal.classList.add('show');
}
function closeAddDebugMenu() {
    const modal = document.getElementById('addDebugModal');
    if (modal) modal.classList.remove('show');
}

function openConfigModal(type, index) {
    if (index === undefined) index = -1;
    const modal = document.getElementById('configModal');
    const title = document.getElementById('modalTitle');
    const form = document.getElementById('modalForm');
    if (!modal || !form) { console.error('弹窗元素不存在'); return; }
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
    if (!form) { console.error('表单不存在'); return; }
    const data = {};
    const inputs = form.querySelectorAll('input, textarea, select');
    for (let i = 0; i < inputs.length; i++) {
        const input = inputs[i];
        if (input.name) data[input.name] = cleanText(input.value);
    }
    if (currentComponent.type === 'condition') {
        data.trueText = cleanText(form.querySelector('[name="trueText"]')?.value || '');
        data.falseText = cleanText(form.querySelector('[name="falseText"]')?.value || '');
        data.selector = cleanText(form.querySelector('[name="selector"]')?.value || '@p');
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

function generateFormHTML(type, data) {
    if (!data) data = {};
    switch (type) {
        case 'text':
            return '<div class="form-group"><label>文本内容</label><textarea name="text" placeholder="输入文本...（支持换行和§格式代码）">' + escapeHtml(data.text || '') + '</textarea><small>💡 按 Enter 换行<br>💡 支持 § 格式代码（§c 红色，§l 粗体，§k 混淆）</small></div>';
        case 'score':
            return '<div class="form-row"><div class="form-group"><label>选择器</label><input type="text" name="selector" placeholder="@p" value="' + escapeHtml(data.selector || '@p') + '"></div><div class="form-group"><label>记分项</label><input type="text" name="objective" placeholder="money" value="' + escapeHtml(data.objective || '') + '"></div></div>';
        case 'selector':
            return '<div class="form-group"><label>选择器</label><input type="text" name="selector" placeholder="@p" value="' + escapeHtml(data.selector || '@p') + '"></div>';
        case 'entityName':
            return '<div class="form-group"><label>选择器</label><input type="text" name="selector" placeholder="@e[type=player,limit=1]" value="' + escapeHtml(data.selector || '@p') + '"></div><small>💡 实体名称组件生成 {"selector":"..."} 结构</small>';
        case 'entityNBT':
            return '<div class="form-row"><div class="form-group"><label>选择器</label><input type="text" name="selector" placeholder="@p" value="' + escapeHtml(data.selector || '@p') + '"></div><div class="form-group"><label>NBT 路径</label><input type="text" name="nbt" placeholder="Health" value="' + escapeHtml(data.nbt || '') + '"></div></div>';
        case 'condition':
            return '<div class="form-group"><label>条件选择器</label><input type="text" name="selector" placeholder="@p[scores=kill=5] 或 @a[tag=hasItem]" value="' + escapeHtml(data.selector || '@p') + '"><small>支持 scores 范围：=5、=1..10、=..10、=1..，可用! 反选</small></div><div class="form-group"><label>条件成立时显示</label><textarea name="trueText" placeholder="条件成立时显示的文本">' + escapeHtml(data.trueText || '条件成立') + '</textarea></div><div class="form-group"><label>条件不成立时显示</label><textarea name="falseText" placeholder="条件不成立时显示的文本">' + escapeHtml(data.falseText || '条件不成立') + '</textarea></div>';
        default:
            return '<p style="color: var(--accent-red);">未知组件类型</p>';
    }
}

function parseFormatCodes(text, formatState) {
    if (!text) return { html: text, state: formatState || { color: '#FFFFFF', isBold: false, isObfuscated: false, isItalic: false } };
    if (!formatState) formatState = { color: '#FFFFFF', isBold: false, isObfuscated: false, isItalic: false };
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
                state.color = '#FFFFFF'; state.isBold = false; state.isObfuscated = false; state.isItalic = false;
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

function parseSelectorCondition(selector) {
    const conditions = { scores: [], tags: [] };
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
        html += '<div class="component-item"><div class="component-item-info"><div class="component-item-type">' + comp.type + '</div><div class="component-item-preview">' + escapeHtml(preview) + '</div></div><div class="component-item-actions"><button class="btn-up" onclick="moveComponent(' + index + ', -1)">↑</button><button class="btn-down" onclick="moveComponent(' + index + ', 1)">↓</button><button class="btn-edit" onclick="openConfigModal(\'' + comp.type + '\', ' + index + ')">编辑</button><button class="btn-delete" onclick="deleteComponent(' + index + ')">删除</button></div></div>';
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
        case 'condition': return '条件：' + (data.selector || '@p') + ' ? "' + (data.trueText || '?') + '" : "' + (data.falseText || '?') + '"';
        default: return comp.type;
    }
}

function deleteComponent(index) {
    components.splice(index, 1);
    renderComponentsList();
    updatePreview();
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
            objective: item.querySelector('.score-objective')?.value || '',
            value: item.querySelector('.score-value')?.value || '0'
        });
    }
    return scores;
}

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
        tags.push({ tag: item.querySelector('.tag-name')?.value || '' });
    }
    return tags;
}

function generateJSON() {
    if (!components || components.length === 0) return { rawtext: [] };
    const rawtext = [];
    for (let i = 0; i < components.length; i++) {
        const comp = components[i];
        if (!comp || !comp.type) continue;
        let item = null;
        switch (comp.type) {
            case 'text':
                item = { text: cleanText(comp.data?.text || '') };
                break;
            case 'score':
                item = { score: { name: cleanText(comp.data?.selector || '@p'), objective: cleanText(comp.data?.objective || '') } };
                break;
            case 'selector':
                item = { selector: cleanText(comp.data?.selector || '@p') };
                break;
            case 'entityName':
                item = { selector: cleanText(comp.data?.selector || '@p') };
                break;
            case 'entityNBT':
                item = { nbt: { selector: cleanText(comp.data?.selector || '@p'), nbt: cleanText(comp.data?.nbt || '') } };
                break;
            case 'condition':
                item = { translate: '%%2', with: { rawtext: [ { selector: cleanText(comp.data?.selector || '@p') }, { text: cleanText(comp.data?.trueText || '') }, { text: cleanText(comp.data?.falseText || '') } ] } };
                break;
            default:
                item = { text: '' };
        }
        if (item) rawtext.push(item);
    }
    return { rawtext: rawtext };
}

function updatePreview() {
    const json = generateJSON();
    const previewContent = document.getElementById('previewContent');
    const jsonOutput = document.getElementById('jsonOutput');
    const commandOutput = document.getElementById('commandOutput');
    if (!previewContent || !jsonOutput || !commandOutput) return;
    previewContent.innerHTML = renderPreviewText(json.rawtext);
    const isPretty = jsonOutput.dataset.pretty === 'true';
    jsonOutput.innerText = isPretty ? JSON.stringify(json, null, 2) : JSON.stringify(json);
    commandOutput.innerText = '/titleraw @a title ' + JSON.stringify(json);
}

function renderPreviewText(rawtextArray) {
    if (!rawtextArray || rawtextArray.length === 0) return '<span style="color: #666;">(无内容)</span>';
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
    let html = '';
    for (let i = 0; i < rawtextArray.length; i++) {
        const item = rawtextArray[i];
        if (!item) continue;
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
    const saveModal = document.getElementById('saveLoadModal');
    const saveDialog = document.getElementById('saveDialog');
    const loadDialog = document.getElementById('loadDialog');
    if (modal && event.target == modal) closeModal();
    if (addModal && event.target == addModal) closeAddDebugMenu();
    if (saveModal && event.target == saveModal) closeSaveLoadMenu();
    if (saveDialog && event.target == saveDialog) closeSaveDialog();
    if (loadDialog && event.target == loadDialog) closeLoadDialog();
}

window.debugData = function() {
    console.log('=== 当前数据 ===');
    console.log('组件数:', components?.length || 0);
    console.log('Scores:', getScoreDebugValues());
    console.log('Tags:', getTagDebugValues());
};