// script.js - 最终修复版

// ==================== 全局变量 ====================
let components = [];
let currentComponent = null;
let currentComponentIndex = -1;
let scoreDebugId = 0;

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

// ==================== 组件按钮 ====================
function setupComponentButtons() {
    document.querySelectorAll('.component-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.dataset.type;
            openConfigModal(type);
        });
    });
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
    if (modal) {
        modal.classList.remove('show');
    }
    currentComponent = null;
    currentComponentIndex = -1;
}

function saveComponent() {
    console.log('保存组件...');
    
    const form = document.getElementById('modalForm');
    if (!form) {
        console.error('表单不存在');
        return;
    }
    
    const data = {};
    const inputs = form.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
        if (input.name) {
            data[input.name] = input.value;
        }
    });
    
    if (currentComponent.type === 'condition') {
        data.trueText = form.querySelector('[name="trueText"]')?.value || '';
        data.falseText = form.querySelector('[name="falseText"]')?.value || '';
        data.selector = form.querySelector('[name="selector"]')?.value || '@p';
    }
    
    console.log('组件数据:', data);
    currentComponent.data = data;
    
    if (currentComponentIndex >= 0) {
        components[currentComponentIndex] = { ...currentComponent };
    } else {
        components.push({ ...currentComponent });
    }
    
    console.log('组件列表:', components);
    
    closeModal();
    renderComponentsList();
    updatePreview();
}

// ==================== 表单生成 ====================
function generateFormHTML(type, data) {
    console.log('生成表单:', type, data);
    
    switch (type) {
        case 'text':
            return `
                <div class="form-group">
                    <label>文本内容</label>
                    <textarea name="text" placeholder="输入文本...（支持换行）">${escapeHtml(data.text || '')}</textarea>
                    <small>💡 按 Enter 换行，JSON 中会保留为 \\n</small>
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
                    <input type="text" name="selector" placeholder="@p" value="${escapeHtml(data.selector || '@p')}">
                    <small>例如：@p[scores=kill=1..] 或 @a[tag=hasItem]</small>
                </div>
                <div class="form-group">
                    <label>条件成立时显示</label>
                    <textarea name="trueText" placeholder="条件成立时显示的文本">${escapeHtml(data.trueText || '条件成立')}</textarea>
                </div>
                <div class="form-group">
                    <label>条件不成立时显示</label>
                    <textarea name="falseText" placeholder="条件不成立时显示的文本">${escapeHtml(data.falseText || '条件不成立')}</textarea>
                </div>
                <div class="form-group">
                    <label>说明</label>
                    <p style="color: var(--text-muted); font-size: 0.85rem;">
                        此组件会根据选择器是否匹配到实体来决定显示哪段文本。<br>
                        在右侧调试区可以设置条件是否成立来预览效果。
                    </p>
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
            <label>玩家名/选择器</label>
            <input type="text" class="score-selector" value="@p" oninput="updatePreview()">
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
    
    // 关键修复：自动滚动到底部
    setTimeout(() => {
        const rightPanel = document.querySelector('.right-panel .panel-content');
        if (rightPanel) {
            rightPanel.scrollTo({
                top: rightPanel.scrollHeight,
                behavior: 'smooth'
            });
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
    const count = document.querySelectorAll('.score-debug-item').length;
    const countEl = document.getElementById('scoreCount');
    if (countEl) countEl.innerText = `(${count})`;
}

function getScoreDebugValues() {
    const scores = [];
    document.querySelectorAll('.score-debug-item').forEach(item => {
        scores.push({
            objective: item.querySelector('.score-objective')?.value || '',
            selector: item.querySelector('.score-selector')?.value || '',
            value: item.querySelector('.score-value')?.value || '0'
        });
    });
    return scores;
}

// ==================== 生成 JSON ====================
function generateJSON() {
    if (!components || components.length === 0) {
        return { rawtext: [] };
    }
    
    const rawtext = components.map(comp => {
        if (!comp || !comp.type) return null;
        
        const obj = {};
        
        switch (comp.type) {
            case 'text':
                obj.rawtext = [{ text: comp.data?.text || '' }];
                break;
            
            case 'score':
                obj.rawtext = [{
                    score: {
                        name: comp.data?.selector || '@p',
                        objective: comp.data?.objective || ''
                    }
                }];
                break;
            
            case 'selector':
                obj.rawtext = [{ selector: comp.data?.selector || '@p' }];
                break;
            
            case 'entityName':
                obj.rawtext = [{ entityname: comp.data?.selector || '@p' }];
                break;
            
            case 'entityNBT':
                obj.rawtext = [{
                    nbt: {
                        selector: comp.data?.selector || '@p',
                        nbt: comp.data?.nbt || ''
                    }
                }];
                break;
            
            case 'condition':
                obj.rawtext = [{
                    translate: '%%2',
                    with: {
                        rawtext: [
                            { selector: comp.data?.selector || '@p' },
                            { text: comp.data?.trueText || '' },
                            { text: comp.data?.falseText || '' }
                        ]
                    }
                }];
                break;
            
            default:
                obj.rawtext = [{ text: '' }];
        }
        
        return obj;
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
    jsonOutput.innerText = JSON.stringify(json, null, 2);
    commandOutput.innerText = `/titleraw @a title ${JSON.stringify(json)}`;
}

function renderPreviewText(rawtextArray) {
    if (!rawtextArray || rawtextArray.length === 0) {
        return '<span style="color: #666;">(无内容)</span>';
    }
    
    const debugVars = {
        playerName: document.getElementById('debugPlayerName')?.value || 'Steve',
        selectorP: document.getElementById('debugSelectorP')?.value || 'Steve',
        selectorR: document.getElementById('debugSelectorR')?.value || 'Alex',
        selectorA: document.getElementById('debugSelectorA')?.value || '所有玩家',
        entityName: document.getElementById('debugEntityName')?.value || '僵尸',
        entityNBT: document.getElementById('debugEntityNBT')?.value || '20',
        condition: document.getElementById('debugCondition')?.value === 'true',
        scores: getScoreDebugValues()
    };
    
    return rawtextArray.map(item => {
        if (!item || !item.rawtext || !item.rawtext[0]) return '';
        
        const rt = item.rawtext[0];
        let text = '';
        
        if (rt.text) {
            text = rt.text.replace(/\n/g, '<br>');
        } else if (rt.translate === '%%2' && rt.with && rt.with.rawtext) {
            const conditionMet = debugVars.condition;
            if (conditionMet && rt.with.rawtext[1]?.text) {
                text = rt.with.rawtext[1].text.replace(/\n/g, '<br>');
            } else if (!conditionMet && rt.with.rawtext[2]?.text) {
                text = rt.with.rawtext[2].text.replace(/\n/g, '<br>');
            } else {
                text = '(条件判断)';
            }
        } else if (rt.score) {
            const scoreData = debugVars.scores.find(s => 
                s.objective === rt.score.objective && 
                s.selector === rt.score.name
            );
            text = scoreData ? scoreData.value : '??';
        } else if (rt.selector) {
            text = rt.selector === '@p' ? debugVars.selectorP :
                   rt.selector === '@r' ? debugVars.selectorR :
                   rt.selector === '@a' ? debugVars.selectorA :
                   rt.selector;
        } else if (rt.entityname) {
            text = debugVars.entityName;
        } else if (rt.nbt) {
            text = debugVars.entityNBT;
        }
        
        return `<span>${text}</span>`;
    }).join('');
}

// ==================== 复制功能 ====================
function copyJSON() {
    const json = document.getElementById('jsonOutput')?.innerText;
    if (!json) return;
    navigator.clipboard.writeText(json).then(() => {
        showToast('✅ JSON 已复制');
    }).catch(() => {
        showToast('❌ 复制失败');
    });
}

function copyCommand() {
    const cmd = document.getElementById('commandOutput')?.innerText;
    if (!cmd) return;
    navigator.clipboard.writeText(cmd).then(() => {
        showToast('✅ 命令已复制');
    }).catch(() => {
        showToast('❌ 复制失败');
    });
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

// ==================== 窗口点击关闭弹窗 ====================
window.onclick = function(event) {
    const modal = document.getElementById('configModal');
    if (modal && event.target == modal) {
        closeModal();
    }
}

// ==================== 调试工具 ====================
window.debugData = () => {
    console.log('=== 当前数据 ===');
    console.log('组件数:', components?.length || 0);
    console.log('组件列表:', components);
};