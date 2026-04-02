document.addEventListener('DOMContentLoaded', () => {
  // 🧩 配置中心（完整阴影模块）
  const config = {
    dimensions: {
      en: 'Dimensions', zh: '尺寸比例', enabled: true,
      params: [
        { key: 'width', en: 'Width', zh: '宽度', type: 'range', min: 50, max: 1200, def: 300, unit: 'px' },
        { key: 'height', en: 'Height', zh: '高度', type: 'range', min: 50, max: 900, def: 200, unit: 'px' },
        { key: 'aspectRatio', en: 'Aspect Ratio', zh: '宽高比', type: 'text', def: 'auto', placeholder: 'e.g. 16/9' }
      ]
    },
    spacing: {
      en: 'Spacing', zh: '内外间距', enabled: true,
      params: [
        { key: 'padding', en: 'Padding', zh: '内边距', type: 'range', min: 0, max: 80, def: 20, unit: 'px' },
        { key: 'margin', en: 'Margin', zh: '外边距', type: 'range', min: 0, max: 60, def: 0, unit: 'px' }
      ]
    },
    layout: {
      en: 'Layout', zh: 'Flex/Grid 布局', enabled: true,
      params: [
        { key: 'display', en: 'Display', zh: '显示模式', type: 'select', options: ['block', 'flex', 'grid', 'inline-block'], def: 'flex' },
        { key: 'justifyContent', en: 'Justify', zh: '主轴对齐', type: 'select', options: ['flex-start', 'center', 'flex-end', 'space-between', 'space-around', 'space-evenly'], def: 'center' },
        { key: 'alignItems', en: 'Align', zh: '交叉轴对齐', type: 'select', options: ['flex-start', 'center', 'flex-end', 'stretch', 'baseline'], def: 'center' },
        { key: 'gap', en: 'Gap', zh: '子元素间距', type: 'range', min: 0, max: 40, def: 10, unit: 'px' },
        { key: 'flexWrap', en: 'Wrap', zh: '换行', type: 'select', options: ['nowrap', 'wrap', 'wrap-reverse'], def: 'nowrap' }
      ]
    },
    border: {
      en: 'Border', zh: '边框圆角', enabled: true,
      params: [
        { key: 'borderWidth', en: 'Width', zh: '线宽', type: 'range', min: 0, max: 20, def: 1, unit: 'px' },
        { key: 'borderStyle', en: 'Style', zh: '样式', type: 'select', options: ['solid', 'dashed', 'dotted', 'double', 'groove', 'ridge'], def: 'solid' },
        { key: 'borderColor', en: 'Color', zh: '颜色', type: 'color', def: '#cbd5e1' },
        { key: 'borderRadius', en: 'Radius', zh: '圆角', type: 'range', min: 0, max: 150, def: 12, unit: 'px' }
      ]
    },
    background: {
      en: 'Background', zh: '背景透明', enabled: true,
      params: [
        { key: 'bgColor', en: 'Color', zh: '填充色', type: 'color', def: '#3b82f6' },
        { key: 'opacity', en: 'Opacity', zh: '整体透明度', type: 'range', min: 0, max: 1, step: 0.05, def: 1 }
      ]
    },
    shadow: {
      en: 'Shadow', zh: '投影效果', enabled: true,
      params: [
        { key: 'shadowX', en: 'Offset X', zh: '水平偏移', type: 'range', min: -50, max: 50, def: 0, unit: 'px' },
        { key: 'shadowY', en: 'Offset Y', zh: '垂直偏移', type: 'range', min: -50, max: 50, def: 6, unit: 'px' },
        { key: 'shadowBlur', en: 'Blur', zh: '模糊半径', type: 'range', min: 0, max: 50, def: 15, unit: 'px' },
        { key: 'shadowSpread', en: 'Spread', zh: '扩展半径', type: 'range', min: -20, max: 50, def: 0, unit: 'px' },
        { key: 'shadowColor', en: 'Color', zh: '颜色', type: 'color', def: '#000000' },
        { key: 'shadowOpacity', en: 'Opacity', zh: '透明度', type: 'range', min: 0, max: 1, step: 0.05, def: 0.25 },
        { key: 'shadowInset', en: 'Type', zh: '类型', type: 'select', options: ['outset', 'inset'], def: 'outset' }
      ]
    },
    transform: {
      en: 'Transform', zh: '2D 变换', enabled: true,
      params: [
        { key: 'translateX', en: 'Translate X', zh: '水平位移', type: 'range', min: -100, max: 100, def: 0, unit: 'px' },
        { key: 'translateY', en: 'Translate Y', zh: '垂直位移', type: 'range', min: -100, max: 100, def: 0, unit: 'px' },
        { key: 'rotate', en: 'Rotate', zh: '旋转角度', type: 'range', min: -180, max: 180, def: 0, unit: 'deg' },
        { key: 'scale', en: 'Scale', zh: '缩放比例', type: 'range', min: 0.5, max: 2, step: 0.05, def: 1 }
      ]
    },
    filter: {
      en: 'Filter', zh: '滤镜效果', enabled: true,
      params: [
        { key: 'blur', en: 'Blur', zh: '模糊', type: 'range', min: 0, max: 20, def: 0, unit: 'px' },
        { key: 'brightness', en: 'Brightness', zh: '亮度', type: 'range', min: 0, max: 2, step: 0.05, def: 1 },
        { key: 'contrast', en: 'Contrast', zh: '对比度', type: 'range', min: 0, max: 2, step: 0.05, def: 1 },
        { key: 'saturate', en: 'Saturate', zh: '饱和度', type: 'range', min: 0, max: 3, step: 0.1, def: 1 }
      ]
    },
    position: {
      en: 'Position', zh: '定位层级', enabled: true,
      params: [
        { key: 'position', en: 'Position', zh: '定位模式', type: 'select', options: ['static', 'relative', 'absolute', 'fixed', 'sticky'], def: 'static' },
        { key: 'zIndex', en: 'Z-Index', zh: '层叠顺序', type: 'text', def: 'auto', placeholder: 'auto / number' },
        { key: 'overflow', en: 'Overflow', zh: '溢出处理', type: 'select', options: ['visible', 'hidden', 'scroll', 'auto'], def: 'visible' },
        { key: 'cursor', en: 'Cursor', zh: '鼠标样式', type: 'select', options: ['default', 'pointer', 'move', 'crosshair', 'not-allowed'], def: 'default' }
      ]
    },
    typography: {
      en: 'Typography', zh: '基础排版', enabled: true,
      params: [
        { key: 'fontSize', en: 'Font Size', zh: '字号', type: 'range', min: 10, max: 48, def: 16, unit: 'px' },
        { key: 'fontWeight', en: 'Weight', zh: '字重', type: 'select', options: ['300', '400', '500', '600', '700', '800'], def: '500' },
        { key: 'color', en: 'Color', zh: '文字颜色', type: 'color', def: '#ffffff' },
        { key: 'textAlign', en: 'Align', zh: '文本对齐', type: 'select', options: ['left', 'center', 'right', 'justify'], def: 'center' }
      ]
    }
  };

  // 🌐 运行时状态
  const state = {
    lang: 'en',
    currentCat: 'dimensions',
    values: {},
    theme: 'dark',
    currentMode: 0 // 0:控制, 1:CSS, 2:收起
  };

  Object.values(config).forEach(cat => cat.params.forEach(p => state.values[p.key] = p.def));

  const preview = document.getElementById('preview');
  const cssOutput = document.getElementById('cssOutput');
  const navTabs = document.getElementById('navTabs');
  const paramsArea = document.getElementById('paramsArea');
  const catSwitch = document.getElementById('catSwitch');
  const toggleLabel = document.getElementById('toggleLabel');
  const bgToggle = document.getElementById('bgToggle');
  const copyBtn = document.getElementById('copyBtn');
  const modeToggle = document.getElementById('modeToggle');

  const modes = ['mode-control', 'mode-css', 'mode-collapsed'];
  const modeLabels = ['🎛️ 控制台模式', '📋 CSS 代码模式', '🔽 已收起'];

  // 🎯 三态切换逻辑
  function switchMode() {
    state.currentMode = (state.currentMode + 1) % 3;
    document.body.classList.remove(...modes);
    document.body.classList.add(modes[state.currentMode]);
    modeToggle.textContent = modeLabels[state.currentMode];
  }

  modeToggle.addEventListener('click', switchMode);

  // 🧭 渲染导航
  function renderTabs() {
    navTabs.innerHTML = '';
    Object.keys(config).forEach(key => {
      const btn = document.createElement('button');
      btn.className = `tab-btn ${key === state.currentCat ? 'active' : ''}`;
      btn.textContent = config[key][state.lang];
      btn.dataset.cat = key;
      btn.addEventListener('click', () => {
        state.currentCat = key;
        renderTabs();
        updateToggleUI();
        renderParams();
      });
      navTabs.appendChild(btn);
    });
  }

  // 🎛️ 渲染参数控件
  function renderParams() {
    paramsArea.innerHTML = '';
    const cat = config[state.currentCat];
    paramsArea.classList.toggle('disabled', !cat.enabled);

    cat.params.forEach(p => {
      const item = document.createElement('div'); item.className = 'param-item';
      const label = document.createElement('label'); label.textContent = p[state.lang];
      const row = document.createElement('div'); row.className = 'param-row';

      if (p.type === 'range') {
        const slider = document.createElement('input'); slider.type = 'range'; slider.min = p.min; slider.max = p.max; slider.step = p.step || 1; slider.value = state.values[p.key];
        const num = document.createElement('input'); num.type = 'number'; num.min = p.min; num.max = p.max; num.step = p.step || 1; num.value = state.values[p.key];
        const sync = (val) => { state.values[p.key] = parseFloat(val); slider.value = val; num.value = val; render(); };
        slider.addEventListener('input', e => sync(e.target.value));
        num.addEventListener('input', e => sync(e.target.value));
        row.append(slider, num);
        if (p.unit) { const u = document.createElement('span'); u.className = 'unit'; u.textContent = p.unit; row.appendChild(u); }
      } else if (p.type === 'color') {
        const picker = document.createElement('input'); picker.type = 'color'; picker.value = state.values[p.key];
        const text = document.createElement('input'); text.type = 'text'; text.value = state.values[p.key]; text.maxLength = 7;
        const sync = (val) => { if (/^#[0-9A-Fa-f]{6}$/.test(val)) { state.values[p.key] = val; picker.value = val; text.value = val; render(); } };
        picker.addEventListener('input', e => sync(e.target.value));
        text.addEventListener('input', e => sync(e.target.value));
        row.append(picker, text);
      } else if (p.type === 'select') {
        const sel = document.createElement('select');
        p.options.forEach(opt => { const o = document.createElement('option'); o.value = opt; o.textContent = opt; if (opt === state.values[p.key]) o.selected = true; sel.appendChild(o); });
        sel.addEventListener('change', e => { state.values[p.key] = e.target.value; render(); });
        row.appendChild(sel);
      } else if (p.type === 'text') {
        const inp = document.createElement('input'); inp.type = 'text'; inp.value = state.values[p.key];
        if (p.placeholder) inp.placeholder = p.placeholder;
        inp.addEventListener('input', e => { state.values[p.key] = e.target.value; render(); });
        row.appendChild(inp);
      }
      item.append(label, row);
      paramsArea.appendChild(item);
    });
  }

  // 🎨 核心渲染
  function render() {
    preview.style.cssText = '';
    
    if (config.dimensions.enabled) {
      preview.style.width = state.values.width + 'px';
      preview.style.height = state.values.height + 'px';
      if (state.values.aspectRatio !== 'auto') preview.style.aspectRatio = state.values.aspectRatio;
    }
    if (config.spacing.enabled) {
      preview.style.padding = state.values.padding + 'px';
      preview.style.margin = state.values.margin + 'px';
    }
    if (config.border.enabled) {
      preview.style.border = `${state.values.borderWidth}px ${state.values.borderStyle} ${state.values.borderColor}`;
      preview.style.borderRadius = state.values.borderRadius + 'px';
    }
    if (config.background.enabled) {
      preview.style.backgroundColor = hexToRgba(state.values.bgColor, state.values.opacity);
    }
    if (config.position.enabled) {
      preview.style.position = state.values.position;
      preview.style.zIndex = state.values.zIndex;
      preview.style.overflow = state.values.overflow;
      preview.style.cursor = state.values.cursor;
    }
    if (config.typography.enabled) {
      preview.style.fontSize = state.values.fontSize + 'px';
      preview.style.fontWeight = state.values.fontWeight;
      preview.style.color = state.values.color;
      preview.style.textAlign = state.values.textAlign;
    }
    if (config.transform.enabled) {
      const parts = [];
      if (state.values.translateX !== 0) parts.push(`translateX(${state.values.translateX}px)`);
      if (state.values.translateY !== 0) parts.push(`translateY(${state.values.translateY}px)`);
      if (state.values.rotate !== 0) parts.push(`rotate(${state.values.rotate}deg)`);
      if (state.values.scale !== 1) parts.push(`scale(${state.values.scale})`);
      preview.style.transform = parts.length ? parts.join(' ') : 'none';
    }
    if (config.filter.enabled) {
      const parts = [];
      if (state.values.blur > 0) parts.push(`blur(${state.values.blur}px)`);
      if (state.values.brightness !== 1) parts.push(`brightness(${state.values.brightness})`);
      if (state.values.contrast !== 1) parts.push(`contrast(${state.values.contrast})`);
      if (state.values.saturate !== 1) parts.push(`saturate(${state.values.saturate})`);
      preview.style.filter = parts.length ? parts.join(' ') : 'none';
    }
    if (config.layout.enabled) {
      preview.style.display = state.values.display;
      if (state.values.display === 'flex' || state.values.display === 'grid') {
        preview.style.justifyContent = state.values.justifyContent;
        preview.style.alignItems = state.values.alignItems;
        preview.style.gap = state.values.gap + 'px';
        preview.style.flexWrap = state.values.flexWrap;
      }
    }
    if (config.shadow.enabled) {
      const x = state.values.shadowX, y = state.values.shadowY;
      const blur = state.values.shadowBlur, spread = state.values.shadowSpread;
      const color = hexToRgba(state.values.shadowColor, state.values.shadowOpacity);
      const inset = state.values.shadowInset === 'inset' ? 'inset ' : '';
      preview.style.boxShadow = `${inset}${x}px ${y}px ${blur}px ${spread}px ${color}`;
    }

    cssOutput.textContent = `.container {\n${generateCSS()}}`;
  }

  function generateCSS() {
    const rules = [];
    if (config.dimensions.enabled) {
      rules.push(`  width: ${state.values.width}px;`);
      rules.push(`  height: ${state.values.height}px;`);
      if (state.values.aspectRatio !== 'auto') rules.push(`  aspect-ratio: ${state.values.aspectRatio};`);
    }
    if (config.spacing.enabled) {
      rules.push(`  padding: ${state.values.padding}px;`);
      if (state.values.margin > 0) rules.push(`  margin: ${state.values.margin}px;`);
    }
    if (config.border.enabled) {
      rules.push(`  border: ${state.values.borderWidth}px ${state.values.borderStyle} ${state.values.borderColor};`);
      rules.push(`  border-radius: ${state.values.borderRadius}px;`);
    }
    if (config.background.enabled) {
      rules.push(`  background-color: ${hexToRgba(state.values.bgColor, state.values.opacity)};`);
    }
    if (config.layout.enabled) {
      rules.push(`  display: ${state.values.display};`);
      if (state.values.display === 'flex' || state.values.display === 'grid') {
        rules.push(`  justify-content: ${state.values.justifyContent};`);
        rules.push(`  align-items: ${state.values.alignItems};`);
        rules.push(`  gap: ${state.values.gap}px;`);
        rules.push(`  flex-wrap: ${state.values.flexWrap};`);
      }
    }
    if (config.shadow.enabled) {
      const x = state.values.shadowX, y = state.values.shadowY;
      const blur = state.values.shadowBlur, spread = state.values.shadowSpread;
      const color = hexToRgba(state.values.shadowColor, state.values.shadowOpacity);
      const inset = state.values.shadowInset === 'inset' ? 'inset ' : '';
      rules.push(`  box-shadow: ${inset}${x}px ${y}px ${blur}px ${spread}px ${color};`);
    }
    if (config.transform.enabled) {
      const parts = [];
      if (state.values.translateX !== 0) parts.push(`translateX(${state.values.translateX}px)`);
      if (state.values.translateY !== 0) parts.push(`translateY(${state.values.translateY}px)`);
      if (state.values.rotate !== 0) parts.push(`rotate(${state.values.rotate}deg)`);
      if (state.values.scale !== 1) parts.push(`scale(${state.values.scale})`);
      rules.push(`  transform: ${parts.length ? parts.join(' ') : 'none'};`);
    }
    if (config.filter.enabled) {
      const parts = [];
      if (state.values.blur > 0) parts.push(`blur(${state.values.blur}px)`);
      if (state.values.brightness !== 1) parts.push(`brightness(${state.values.brightness})`);
      if (state.values.contrast !== 1) parts.push(`contrast(${state.values.contrast})`);
      if (state.values.saturate !== 1) parts.push(`saturate(${state.values.saturate})`);
      rules.push(`  filter: ${parts.length ? parts.join(' ') : 'none'};`);
    }
    if (config.position.enabled) {
      rules.push(`  position: ${state.values.position};`);
      if (state.values.zIndex !== 'auto') rules.push(`  z-index: ${state.values.zIndex};`);
      rules.push(`  overflow: ${state.values.overflow};`);
      rules.push(`  cursor: ${state.values.cursor};`);
    }
    if (config.typography.enabled) {
      rules.push(`  font-size: ${state.values.fontSize}px;`);
      rules.push(`  font-weight: ${state.values.fontWeight};`);
      rules.push(`  color: ${state.values.color};`);
      rules.push(`  text-align: ${state.values.textAlign};`);
    }
    return rules.join('\n');
  }

  function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  // 🔄 交互控制
  function updateToggleUI() {
    const cat = config[state.currentCat];
    catSwitch.checked = cat.enabled;
    toggleLabel.textContent = cat.enabled ? 'ON' : 'OFF';
    toggleLabel.style.color = cat.enabled ? 'var(--accent)' : 'var(--text-muted)';
  }

  catSwitch.addEventListener('change', () => {
    config[state.currentCat].enabled = catSwitch.checked;
    updateToggleUI(); renderParams(); render();
  });

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active'); state.lang = btn.dataset.lang; renderTabs(); renderParams();
    });
  });

  // 🌑 背景切换
  const themes = ['dark', 'light', 'gray'];
  const themeIcons = ['🌑', '️', '🌫️'];
  bgToggle.addEventListener('click', () => {
    const idx = themes.indexOf(state.theme);
    state.theme = themes[(idx + 1) % themes.length];
    document.body.setAttribute('data-theme', state.theme);
    bgToggle.textContent = themeIcons[(idx + 1) % themes.length];
  });

  // 📋 复制代码
  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(cssOutput.textContent);
      const orig = copyBtn.textContent;
      copyBtn.textContent = '✓ Copied'; copyBtn.style.background = 'var(--success)';
      setTimeout(() => { copyBtn.textContent = orig; copyBtn.style.background = ''; }, 1200);
    } catch {}
  });

  // 🚀 初始化
  document.body.setAttribute('data-theme', state.theme);
  renderTabs(); updateToggleUI(); renderParams(); render();
});