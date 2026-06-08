import Sortable from 'https://cdn.jsdelivr.net/npm/sortablejs@1.15.2/modular/sortable.esm.js';

// --- XSS PROTECTION ---
// Экранирует HTML-спецсимволы для защиты от XSS-атак
function escapeHTML(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Day labels for schedule badges (0=Sun, 1=Mon, ..., 6=Sat)
const DAY_LABELS = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

// --- STATE MANAGEMENT ---
let state = {
  blocks: [],
  items: [],
  skincareItems: [],
  lastCompletionDate: '',
  lastWeekNumber: 0,
  settings: {
    dailyTrackingEnabled: false,
    onboardingCompleted: false,
    skincareEnabled: false,
    suppSchedulingEnabled: false,
    suppStockEnabled: false,
    skinExpirationEnabled: false
  }
};

let editMode = false;
let searchQuery = '';

const DEFAULT_STATE = {
  blocks: [],
  items: [],
  skincareItems: [],
  lastCompletionDate: '',
  lastWeekNumber: 0,
  settings: {
    dailyTrackingEnabled: false,
    onboardingCompleted: false,
    skincareEnabled: false,
    suppSchedulingEnabled: false,
    suppStockEnabled: false,
    skinExpirationEnabled: false
  }
};

const DEMO_STATE = {
  blocks: [
    { id: 'block-utro', name: 'Утро', sub: 'натощак', icon: '☀️', color: 'utro' },
    { id: 'block-den', name: 'День', sub: 'с едой', icon: '🌤️', color: 'den' },
    { id: 'block-eve', name: 'Вечер', sub: '', icon: '🌆', color: 'eve' },
    { id: 'block-noc', name: 'Ночь', sub: 'за 40–60 мин до сна', icon: '🌙', color: 'noc' }
  ],
  items: [
    // Morning
    { id: 'item-1', blockId: 'block-utro', name: 'B12 метилкобаламин', dose: '1000 мкг', cond: '', checked: false },
    { id: 'item-2', blockId: 'block-utro', name: 'Метилфолат 5-MTHF', dose: '400 мкг', cond: '', checked: false },
    { id: 'item-3', blockId: 'block-utro', name: 'NAC + Селен', dose: '600 мг', cond: '', checked: false },
    { id: 'item-4', blockId: 'block-utro', name: 'Lion\'s Mane', dose: '500 мг', cond: '', checked: false },
    { id: 'item-5', blockId: 'block-utro', name: 'Мака', dose: '500 мг', cond: '', checked: false },
    { id: 'item-6', blockId: 'block-utro', name: 'L-Теанин', dose: '200 мг', cond: 'с кофе', checked: false },
    // Day
    { id: 'item-7', blockId: 'block-den', name: 'Витамин D3 + K2', dose: '5000МЕ / 100мкг', cond: '', checked: false },
    { id: 'item-8', blockId: 'block-den', name: 'Омега-3 EPA+DHA', dose: '2100 мг', cond: '', checked: false },
    { id: 'item-9', blockId: 'block-den', name: 'Бор Albion', dose: '6 мг', cond: '', checked: false },
    { id: 'item-10', blockId: 'block-den', name: 'Цинк пиколинат', dose: '25 мг', cond: '', checked: false },
    { id: 'item-11', blockId: 'block-den', name: 'Витамин C', dose: '500 мг', cond: '', checked: false },
    { id: 'item-12', blockId: 'block-den', name: 'Магний бисглицинат', dose: '200 мг', cond: '', checked: false },
    // Evening
    { id: 'item-13', blockId: 'block-eve', name: 'Псиллиум', dose: '4 ч.л.', cond: 'за 30 мин до остального', checked: false },
    { id: 'item-14', blockId: 'block-eve', name: 'Ашваганда KSM-66', dose: '600 мг', cond: '', checked: false },
    { id: 'item-15', blockId: 'block-eve', name: 'L-Теанин', dose: '200 мг', cond: '', checked: false },
    // Night
    { id: 'item-16', blockId: 'block-noc', name: 'Магний бисглицинат', dose: '200 мг', cond: '', checked: false },
    { id: 'item-17', blockId: 'block-noc', name: 'Глицин', dose: '5 г', checked: false },
    { id: 'item-18', blockId: 'block-noc', name: 'Таурин', dose: '2 г', checked: false }
  ],
  skincareItems: [
    { id: 'skin-demo-1', name: 'Очищающий гель CeraVe', timing: 'morning', scheduleType: 'daily', currentWeekCount: 0, history: {} },
    { id: 'skin-demo-2', name: 'Тоник с салициловой кислотой', timing: 'morning', scheduleType: 'days', scheduleDays: [1, 3, 5], currentWeekCount: 0, history: {} },
    { id: 'skin-demo-3', name: 'Сыворотка с Витамином C', timing: 'morning', scheduleType: 'daily', currentWeekCount: 0, history: {} },
    { id: 'skin-demo-4', name: 'Солнцезащитный крем SPF 50', timing: 'morning', scheduleType: 'daily', currentWeekCount: 0, history: {} },
    { id: 'skin-demo-5', name: 'Гидрофильное масло', timing: 'evening', scheduleType: 'daily', currentWeekCount: 0, history: {} },
    { id: 'skin-demo-6', name: 'Пилинг с AHA/BHA кислотами', timing: 'evening', scheduleType: 'frequency', targetFrequency: 2, currentWeekCount: 0, history: {} },
    { id: 'skin-demo-7', name: 'Ночной увлажняющий крем', timing: 'evening', scheduleType: 'daily', currentWeekCount: 0, history: {} }
  ],
  lastCompletionDate: '',
  settings: {
    dailyTrackingEnabled: false,
    onboardingCompleted: true,
    skincareEnabled: false,
    suppSchedulingEnabled: false,
    suppStockEnabled: false,
    skinExpirationEnabled: false
  }
};

// Get today's local date string YYYY-MM-DD
function getTodayString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Get ISO week number for a Date
function getISOWeek(date) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  d.setHours(0, 0, 0, 0);
  // Thursday of current week
  d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
  const week1 = new Date(d.getFullYear(), 0, 4);
  return 1 + Math.round(((d - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
}

function getCurrentWeekNumber() {
  return getISOWeek(new Date());
}

function isScheduledForToday(item) {
  if (!state.settings.suppSchedulingEnabled) {
    return true;
  }
  if (!item.scheduleType || item.scheduleType === 'daily') {
    return true;
  }
  if (item.scheduleType === 'days') {
    const todayDOW = getTodayDOW();
    return item.scheduleDays && item.scheduleDays.includes(todayDOW);
  }
  return true;
}

// Load state from local storage or set defaults
function loadState() {
  const localData = localStorage.getItem('supplement_tracker_state');
  if (localData) {
    try {
      state = JSON.parse(localData);
      
      // Ensure data compatibility
      if (!state.blocks || !state.items) {
        state = JSON.parse(JSON.stringify(DEFAULT_STATE));
      }
      if (!state.settings) {
        state.settings = {
          dailyTrackingEnabled: false,
          onboardingCompleted: true,
          skincareEnabled: false,
          suppSchedulingEnabled: false,
          suppStockEnabled: false,
          skinExpirationEnabled: false
        };
      } else {
        if (state.settings.onboardingCompleted === undefined) {
          state.settings.onboardingCompleted = true; // Migrate existing users
        }
        if (state.settings.skincareEnabled === undefined) state.settings.skincareEnabled = false;
        if (state.settings.suppSchedulingEnabled === undefined) state.settings.suppSchedulingEnabled = false;
        if (state.settings.suppStockEnabled === undefined) state.settings.suppStockEnabled = false;
        if (state.settings.skinExpirationEnabled === undefined) state.settings.skinExpirationEnabled = false;
      }
      // Migrate: add skincareItems if missing
      if (!state.skincareItems) {
        state.skincareItems = [];
      }
      if (state.lastWeekNumber === undefined) {
        state.lastWeekNumber = getCurrentWeekNumber();
      }
      // Migrate items fields
      if (state.items) {
        state.items.forEach(item => {
          if (!item.scheduleType) item.scheduleType = 'daily';
          if (!item.scheduleDays) item.scheduleDays = [];
        });
      }
    } catch (e) {
      state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    }
  } else {
    state = JSON.parse(JSON.stringify(DEFAULT_STATE));
  }

  // Check if date has changed for auto-reset of checked status
  const today = getTodayString();
  if (state.lastCompletionDate !== today) {
    state.items.forEach(item => item.checked = false);
    state.lastCompletionDate = today;
    saveState();
  }

  // Weekly reset for skincare counters
  const currentWeek = getCurrentWeekNumber();
  if (state.lastWeekNumber !== currentWeek) {
    state.skincareItems.forEach(item => {
      item.currentWeekCount = 0;
    });
    state.lastWeekNumber = currentWeek;
    saveState();
  }
  
  applyFeatureToggles();
}

// Save state to local storage
function saveState() {
  localStorage.setItem('supplement_tracker_state', JSON.stringify(state));
  applyFeatureToggles();
  renderProgressBar();
  updateResetFABVisibility();
}

function applyFeatureToggles() {
  // 1. Skincare tab toggle
  const bottomNav = document.querySelector('.bottom-nav');
  if (bottomNav) {
    if (state.settings.skincareEnabled) {
      bottomNav.style.display = 'flex';
      document.body.classList.remove('no-bottom-nav');
    } else {
      bottomNav.style.display = 'none';
      document.body.classList.add('no-bottom-nav');
      // Force active screen to supplements
      const navSupplements = document.getElementById('nav-supplements');
      const navSkincare = document.getElementById('nav-skincare');
      const screenSupplements = document.getElementById('screen-supplements');
      const screenSkincare = document.getElementById('screen-skincare');
      
      if (navSupplements) navSupplements.classList.add('active');
      if (navSkincare) navSkincare.classList.remove('active');
      if (screenSupplements) screenSupplements.classList.add('active');
      if (screenSkincare) screenSkincare.classList.remove('active');
    }
  }

  // 2. Supplements scheduling toggle
  const itemSchedGroup = document.getElementById('item-scheduling-toggle-group');
  if (itemSchedGroup) {
    itemSchedGroup.style.display = state.settings.suppSchedulingEnabled ? 'block' : 'none';
  }

  // 3. Supplements stock toggle
  const itemStockGroup = document.getElementById('item-stock-toggle-group');
  if (itemStockGroup) {
    itemStockGroup.style.display = state.settings.suppStockEnabled ? 'block' : 'none';
  }

  // 4. Skincare expiration toggle
  const skincareExpGroup = document.getElementById('skincare-expiration-toggle-group');
  if (skincareExpGroup) {
    skincareExpGroup.style.display = state.settings.skinExpirationEnabled ? 'block' : 'none';
  }
}

// --- DOM ELEMENTS ---
const stacksGrid = document.getElementById('stacks-grid');
const headerDate = document.getElementById('header-date');
const progressSection = document.querySelector('.progress-section');
const progressText = document.getElementById('progress-text');
const progressFill = document.getElementById('progress-fill');
const themeToggle = document.getElementById('theme-toggle');
const editModeToggle = document.getElementById('edit-mode-toggle');
const resetDailyBtn = document.getElementById('reset-daily-btn');
const addBlockContainer = document.getElementById('add-block-container');
const addBlockBtn = document.getElementById('add-block-btn');
const searchInput = document.getElementById('search-input');
const searchClearBtn = document.getElementById('search-clear-btn');
const settingsBtn = document.getElementById('settings-btn');
const toastEl = document.getElementById('toast');
const settingDailyTracking = document.getElementById('setting-daily-tracking');
const settingSkincareEnabled = document.getElementById('setting-skincare-enabled');
const settingSuppScheduling = document.getElementById('setting-supp-scheduling');
const settingSuppStock = document.getElementById('setting-supp-stock');
const settingSkinExpiration = document.getElementById('setting-skin-expiration');

// Modals
const dialogBlock = document.getElementById('dialog-block');
const formBlock = document.getElementById('form-block');
const dialogItem = document.getElementById('dialog-item');
const formItem = document.getElementById('form-item');
const dialogSettings = document.getElementById('dialog-settings');

// --- THEME ---
function initTheme() {
  const currentTheme = localStorage.getItem('app-theme') || 'light';
  if (currentTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

themeToggle.addEventListener('click', () => {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('app-theme', isDark ? 'dark' : 'light');
});

// --- TOAST NOTIFICATIONS ---
function showToast(message, duration = 2000) {
  toastEl.textContent = message;
  toastEl.style.display = 'block';
  setTimeout(() => {
    toastEl.style.display = 'none';
  }, duration);
}

// --- PROGRESS & FAB ---
function renderProgressBar() {
  if (!state.settings.dailyTrackingEnabled) {
    progressSection.style.display = 'none';
    return;
  }
  progressSection.style.display = 'block';

  const todayItems = state.items.filter(item => isScheduledForToday(item));
  const total = todayItems.length;
  const completed = todayItems.filter(item => item.checked).length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  progressText.textContent = `${completed} из ${total} (${percentage}%)`;
  progressFill.style.width = `${percentage}%`;
}

function updateResetFABVisibility() {
  if (!state.settings.dailyTrackingEnabled) {
    resetDailyBtn.classList.remove('visible');
    return;
  }
  const hasChecked = state.items.some(item => item.checked);
  if (hasChecked && !editMode) {
    resetDailyBtn.classList.add('visible');
  } else {
    resetDailyBtn.classList.remove('visible');
  }
}

resetDailyBtn.addEventListener('click', () => {
  if (confirm('Сбросить весь сегодняшний прогресс приема?')) {
    state.items.forEach(item => item.checked = false);
    saveState();
    renderApp();
    showToast('Прогресс сброшен');
  }
});

// --- DATE FORMATTER ---
function renderDate() {
  const options = { weekday: 'long', day: 'numeric', month: 'long' };
  const dateStr = new Date().toLocaleDateString('ru-RU', options);
  const capitalizedDateStr = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
  headerDate.textContent = capitalizedDateStr;
}

// --- RENDER HELPERS ---

// Render empty state when no blocks exist
function renderEmptyState() {
  const emptyCard = document.createElement('div');
  emptyCard.className = 'empty-state-card';
  emptyCard.innerHTML = `
    <div class="empty-state-illustration">🌱</div>
    <h3 class="empty-state-title">Ритуалы ещё не добавлены</h3>
    <p class="empty-state-text">Создайте первый блок — например «Утро», «День» или «Вечер» — и добавьте витамины или добавки.</p>
    <button id="btn-create-first-block" class="btn-action btn-primary btn-empty-state">
      Создать первый блок
    </button>
  `;

  emptyCard.querySelector('#btn-create-first-block').addEventListener('click', () => {
    if (!editMode) {
      editModeToggle.click();
    }
    openBlockModal(null);
  });

  stacksGrid.appendChild(emptyCard);
  stacksGrid.style.display = 'block';
}

// Build schedule badge HTML
function buildScheduleBadge(item) {
  if (!state.settings.suppSchedulingEnabled || item.scheduleType !== 'days' || !item.scheduleDays || item.scheduleDays.length === 0) {
    return '';
  }
  const dayLabels = item.scheduleDays.map(d => DAY_LABELS[d]).join(', ');
  return `<span class="row-schedule-badge">📅 ${dayLabels}</span>`;
}

// Build stock badge HTML
function buildStockBadge(item) {
  if (!state.settings.suppStockEnabled || item.stockTotal === undefined || item.stockTotal === null || item.stockTotal === '') {
    return '';
  }
  const total = parseInt(item.stockTotal);
  const take = parseInt(item.stockTake) || 1;
  if (total <= 10 || total <= take * 5) {
    return `<span class="stock-warning-badge">Осталось: ${total}</span>`;
  }
  return '';
}

// Render single item row
function renderItemRow(item, isScheduledToday) {
  const row = document.createElement('div');
  const isItemChecked = state.settings.dailyTrackingEnabled && item.checked;
  let rowClasses = ['row-item'];
  if (isItemChecked) rowClasses.push('checked');
  if (!isScheduledToday && editMode) rowClasses.push('not-today');
  row.className = rowClasses.join(' ');
  row.dataset.id = item.id;

  // Perform search filter if active
  if (searchQuery) {
    const matches = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matches) {
      row.style.display = 'none';
    }
  }

  const scheduleBadge = buildScheduleBadge(item);
  const stockBadge = buildStockBadge(item);

  row.innerHTML = `
    <div class="row-item-left">
      <div class="custom-checkbox ${isItemChecked ? 'checked' : ''}" style="display: ${state.settings.dailyTrackingEnabled ? 'flex' : 'none'};" role="checkbox" aria-checked="${isItemChecked}"></div>
      <div class="row-content">
        <span class="row-name">${escapeHTML(item.name)}</span>
        <div class="row-meta">
          ${item.cond ? `<span class="row-cond">${escapeHTML(item.cond)}</span>` : ''}
          ${scheduleBadge}
        </div>
      </div>
    </div>
    <span class="dose-tag">${escapeHTML(item.dose)}</span>
    ${stockBadge}
    <div class="row-edit-actions">
      <button class="btn-card-action btn-edit-item" title="Редактировать">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
      </button>
      <div class="btn-card-action item-drag-handle" title="Перетащить">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>
      </div>
    </div>
  `;

  // Checkbox Click event
  const checkbox = row.querySelector('.custom-checkbox');
  checkbox.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!state.settings.dailyTrackingEnabled) return;
    item.checked = !item.checked;

    // Stock decrement/increment logic
    if (state.settings.suppStockEnabled && item.stockTotal !== undefined && item.stockTotal !== null && item.stockTotal !== '') {
      const take = parseInt(item.stockTake) || 1;
      const totalVal = parseInt(item.stockTotal);
      if (item.checked) {
        item.stockTotal = Math.max(0, totalVal - take);
      } else {
        item.stockTotal = totalVal + take;
      }
    }

    saveState();
    renderApp();
  });

  // Row click to toggle checkbox (except in edit mode)
  row.addEventListener('click', () => {
    if (!editMode && state.settings.dailyTrackingEnabled) {
      checkbox.click();
    }
  });

  // Edit supplement event
  row.querySelector('.btn-edit-item').addEventListener('click', (e) => {
    e.stopPropagation();
    openItemModal(item);
  });

  return row;
}

// Render single block card
function renderBlockCard(block) {
  const blockItems = state.items.filter(item => item.blockId === block.id);
  const card = document.createElement('div');
  card.className = `card ${block.color || 'utro'}`;
  card.dataset.id = block.id;

  card.innerHTML = `
    <div class="card-header">
      <div class="card-header-left">
        <div class="card-ico">${escapeHTML(block.icon) || '💊'}</div>
        <div class="card-titles">
          <span class="card-label">${escapeHTML(block.name)}</span>
          ${block.sub ? `<span class="card-sub">${escapeHTML(block.sub)}</span>` : ''}
        </div>
      </div>
      <div class="card-header-right">
        <button class="btn-mark-all" data-block-id="${escapeHTML(block.id)}" title="Отметить все">✓ Все</button>
        <button class="btn-card-action btn-edit-block" title="Редактировать блок" style="display: ${editMode ? 'flex' : 'none'};">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
        </button>
        <div class="btn-card-action block-drag-handle" title="Перетащить блок" style="display: ${editMode ? 'flex' : 'none'};">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>
        </div>
      </div>
    </div>
    <div class="rows-container" data-block-id="${escapeHTML(block.id)}"></div>
    <button class="add-item-card-btn" data-block-id="${escapeHTML(block.id)}">
      <span>+ Добавить добавку</span>
    </button>
  `;

  const rowsContainer = card.querySelector('.rows-container');

  // Add Row Items
  blockItems.forEach(item => {
    const isScheduledToday = isScheduledForToday(item);
    if (!isScheduledToday && !editMode) {
      return;
    }
    const row = renderItemRow(item, isScheduledToday);
    rowsContainer.appendChild(row);
  });

  // Mark-all button logic
  setupMarkAllButton(card, blockItems);

  // Edit block event
  card.querySelector('.btn-edit-block').addEventListener('click', (e) => {
    e.stopPropagation();
    openBlockModal(block);
  });

  // Add supplement item inside block event
  card.querySelector('.add-item-card-btn').addEventListener('click', (e) => {
    openItemModal(null, block.id);
  });

  return card;
}

// Setup mark-all button for a block
function setupMarkAllButton(card, blockItems) {
  const markAllBtn = card.querySelector('.btn-mark-all');
  const todayBlockItems = blockItems.filter(i => isScheduledForToday(i));

  const updateMarkAllState = () => {
    const allDone = todayBlockItems.length > 0 && todayBlockItems.every(i => i.checked);
    markAllBtn.classList.toggle('all-done', allDone);
    markAllBtn.textContent = allDone ? '✓ Готово' : '✓ Все';

    if (todayBlockItems.length === 0) {
      markAllBtn.style.display = 'none';
    } else {
      markAllBtn.style.display = '';
    }
  };
  updateMarkAllState();
  
  markAllBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!state.settings.dailyTrackingEnabled) return;
    const allDone = todayBlockItems.every(i => i.checked);

    todayBlockItems.forEach(i => {
      const wasChecked = i.checked;
      i.checked = !allDone;

      // Apply stock adjustment on toggle
      if (state.settings.suppStockEnabled && i.stockTotal !== undefined && i.stockTotal !== null && i.stockTotal !== '') {
        const take = parseInt(i.stockTake) || 1;
        const totalVal = parseInt(i.stockTotal);
        if (i.checked && !wasChecked) {
          i.stockTotal = Math.max(0, totalVal - take);
        } else if (!i.checked && wasChecked) {
          i.stockTotal = totalVal + take;
        }
      }
    });

    saveState();
    renderApp();
  });
}

// --- RENDER APPLICATION ---
function renderApp() {
  stacksGrid.innerHTML = '';
  renderDate();

  if (state.blocks.length === 0) {
    renderEmptyState();
  } else {
    stacksGrid.style.display = '';
    state.blocks.forEach(block => {
      const card = renderBlockCard(block);
      stacksGrid.appendChild(card);
    });
  }

  renderProgressBar();
  updateResetFABVisibility();

  // Sync daily-tracking-on class for mark-all CSS visibility
  document.body.classList.toggle('daily-tracking-on', state.settings.dailyTrackingEnabled);

  if (editMode) {
    initDragAndDrop();
  }
}

// --- DRAG AND DROP (SortableJS) ---
let sortableBlocks = null;
let sortableItemsList = [];

function initDragAndDrop() {
  // Clear any existing instances
  if (sortableBlocks) {
    sortableBlocks.destroy();
  }
  sortableItemsList.forEach(s => s.destroy());
  sortableItemsList = [];
  
  // Sort Blocks
  sortableBlocks = Sortable.create(stacksGrid, {
    handle: '.block-drag-handle',
    animation: 200,
    ghostClass: 'sortable-ghost',
    chosenClass: 'sortable-chosen',
    dragClass: 'sortable-drag',
    onEnd: (evt) => {
      const reorderedBlocks = [];
      const cardElements = stacksGrid.querySelectorAll('.card');
      cardElements.forEach(cardEl => {
        const id = cardEl.dataset.id;
        const block = state.blocks.find(b => b.id === id);
        if (block) reorderedBlocks.push(block);
      });
      state.blocks = reorderedBlocks;
      saveState();
    }
  });
  
  // Sort Items (within and between blocks)
  const rowsContainers = stacksGrid.querySelectorAll('.rows-container');
  rowsContainers.forEach(container => {
    const sItem = Sortable.create(container, {
      group: 'items', // Allow dragging items between blocks
      handle: '.item-drag-handle',
      animation: 200,
      ghostClass: 'sortable-ghost',
      chosenClass: 'sortable-chosen',
      dragClass: 'sortable-drag',
      onEnd: (evt) => {
        const updatedItems = [];
        
        // Loop through all blocks and scan their item rows in the DOM
        const cards = stacksGrid.querySelectorAll('.card');
        cards.forEach(card => {
          const blockId = card.dataset.id;
          const rows = card.querySelectorAll('.row-item');
          rows.forEach(row => {
            const itemId = row.dataset.id;
            const item = state.items.find(i => i.id === itemId);
            if (item) {
              item.blockId = blockId; // Update block binding if it was moved to another card
              updatedItems.push(item);
            }
          });
        });
        
        // Catch any items that were filtered out during search and didn't appear in DOM
        state.items.forEach(item => {
          if (!updatedItems.find(ui => ui.id === item.id)) {
            updatedItems.push(item);
          }
        });
        
        state.items = updatedItems;
        saveState();
        renderApp(); // Full re-render to update classes/background stripes
      }
    });
    sortableItemsList.push(sItem);
  });
}

// --- SEARCH FILTER ---
searchInput.addEventListener('input', (e) => {
  searchQuery = e.target.value;
  searchClearBtn.style.display = searchQuery ? 'block' : 'none';
  
  // Efficiently filter rows without fully rebuilding DOM
  const cards = stacksGrid.querySelectorAll('.card');
  cards.forEach(card => {
    const blockId = card.dataset.id;
    const rows = card.querySelectorAll('.row-item');
    rows.forEach(row => {
      const itemId = row.dataset.id;
      const item = state.items.find(i => i.id === itemId);
      if (item) {
        const matches = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        row.style.display = matches ? 'flex' : 'none';
      }
    });
  });
});

searchClearBtn.addEventListener('click', () => {
  searchInput.value = '';
  searchQuery = '';
  searchClearBtn.style.display = 'none';
  renderApp();
  searchInput.focus();
});

// --- EDIT MODE TOGGLE ---
editModeToggle.addEventListener('click', () => {
  editMode = !editMode;
  document.body.classList.toggle('edit-mode', editMode);
  editModeToggle.classList.toggle('active', editMode);
  
  const toggleText = editModeToggle.querySelector('.btn-text');
  toggleText.textContent = editMode ? 'Готово' : 'Настроить';
  
  addBlockContainer.style.display = editMode ? 'block' : 'none';
  
  renderApp();
  showToast(editMode ? 'Режим настройки активен' : 'Изменения сохранены');
});

// --- MODAL: BLOCK DIALOG ---
const btnDeleteBlock = document.getElementById('btn-delete-block');

function openBlockModal(block = null) {
  if (block) {
    // Edit existing block
    document.getElementById('block-dialog-title').textContent = 'Редактировать блок';
    document.getElementById('edit-block-id').value = block.id;
    document.getElementById('block-name').value = block.name;
    document.getElementById('block-icon').value = block.icon || '';
    document.getElementById('block-sub').value = block.sub || '';
    
    // Select color radio
    const colorRadio = formBlock.querySelector(`input[name="block-color"][value="${block.color || 'utro'}"]`);
    if (colorRadio) colorRadio.checked = true;
    
    btnDeleteBlock.style.display = 'block';
  } else {
    // Add new block
    document.getElementById('block-dialog-title').textContent = 'Новый блок';
    document.getElementById('edit-block-id').value = '';
    formBlock.reset();
    
    btnDeleteBlock.style.display = 'none';
  }
  dialogBlock.showModal();
}

formBlock.addEventListener('submit', (e) => {
  e.preventDefault();
  const id = document.getElementById('edit-block-id').value;
  const name = document.getElementById('block-name').value.trim();
  const icon = document.getElementById('block-icon').value.trim();
  const sub = document.getElementById('block-sub').value.trim();
  const color = formBlock.querySelector('input[name="block-color"]:checked').value;
  
  if (id) {
    // Update existing
    const block = state.blocks.find(b => b.id === id);
    if (block) {
      block.name = name;
      block.icon = icon || '💊';
      block.sub = sub;
      block.color = color;
    }
  } else {
    // Create new block
    const newId = `block-${Date.now()}`;
    state.blocks.push({ id: newId, name, sub, icon: icon || '💊', color });
  }
  
  saveState();
  renderApp();
  dialogBlock.close();
  showToast('Блок сохранен');
});

btnDeleteBlock.addEventListener('click', () => {
  const id = document.getElementById('edit-block-id').value;
  if (!id) return;
  
  const blockItems = state.items.filter(item => item.blockId === id);
  const msg = blockItems.length > 0 
    ? `Удалить этот блок и все добавки в нем (${blockItems.length} шт.)?`
    : 'Удалить этот блок?';
    
  if (confirm(msg)) {
    state.blocks = state.blocks.filter(b => b.id !== id);
    state.items = state.items.filter(item => item.blockId !== id);
    saveState();
    renderApp();
    dialogBlock.close();
    showToast('Блок удален');
  }
});

addBlockBtn.addEventListener('click', () => {
  openBlockModal(null);
});

// --- MODAL: ITEM DIALOG ---
const btnDeleteItem = document.getElementById('btn-delete-item');

function openItemModal(item = null, defaultBlockId = '') {
  // Reset all fields
  document.querySelectorAll('#item-days-picker .day-pick-btn').forEach(btn => btn.classList.remove('selected'));
  document.getElementById('item-subfield-days').classList.remove('visible');
  document.getElementById('item-schedule-daily').checked = true;
  document.getElementById('item-stock-total').value = '';
  document.getElementById('item-stock-take').value = '';

  if (item) {
    // Edit existing
    document.getElementById('item-dialog-title').textContent = 'Редактировать';
    document.getElementById('edit-item-id').value = item.id;
    document.getElementById('item-block-id').value = item.blockId;
    document.getElementById('item-name').value = item.name;
    document.getElementById('item-dose').value = item.dose;
    document.getElementById('item-cond').value = item.cond || '';
    
    // Set stock values
    document.getElementById('item-stock-total').value = item.stockTotal !== undefined ? item.stockTotal : '';
    document.getElementById('item-stock-take').value = item.stockTake !== undefined ? item.stockTake : '';
    
    // Set scheduling values
    const scheduleType = item.scheduleType || 'daily';
    const scheduleDays = item.scheduleDays || [];
    
    const scheduleRadio = document.querySelector(`input[name="item-schedule"][value="${scheduleType}"]`);
    if (scheduleRadio) scheduleRadio.checked = true;
    
    if (scheduleType === 'days') {
      document.getElementById('item-subfield-days').classList.add('visible');
      document.querySelectorAll('#item-days-picker .day-pick-btn').forEach(btn => {
        if (scheduleDays.includes(Number(btn.dataset.day))) {
          btn.classList.add('selected');
        }
      });
    }
    
    btnDeleteItem.style.display = 'block';
  } else {
    // Add new
    document.getElementById('item-dialog-title').textContent = 'Добавить добавку';
    document.getElementById('edit-item-id').value = '';
    document.getElementById('item-block-id').value = defaultBlockId;
    formItem.reset();
    
    btnDeleteItem.style.display = 'none';
  }
  dialogItem.showModal();
}

formItem.addEventListener('submit', (e) => {
  e.preventDefault();
  const id = document.getElementById('edit-item-id').value;
  const blockId = document.getElementById('item-block-id').value;
  const name = document.getElementById('item-name').value.trim();
  const dose = document.getElementById('item-dose').value.trim();
  const cond = document.getElementById('item-cond').value.trim();
  
  // Read stock control fields
  const stockTotalInput = document.getElementById('item-stock-total').value;
  const stockTakeInput = document.getElementById('item-stock-take').value;
  const stockTotal = stockTotalInput !== '' ? parseInt(stockTotalInput) : undefined;
  const stockTake = stockTakeInput !== '' ? parseInt(stockTakeInput) : undefined;
  
  // Read schedule fields
  const scheduleType = document.querySelector('input[name="item-schedule"]:checked').value;
  const scheduleDays = [];
  if (scheduleType === 'days') {
    document.querySelectorAll('#item-days-picker .day-pick-btn.selected').forEach(btn => {
      scheduleDays.push(Number(btn.dataset.day));
    });
  }
  
  if (id) {
    // Update existing
    const item = state.items.find(i => i.id === id);
    if (item) {
      item.name = name;
      item.dose = dose;
      item.cond = cond;
      item.scheduleType = scheduleType;
      item.scheduleDays = scheduleType === 'days' ? scheduleDays : undefined;
      item.stockTotal = stockTotal;
      item.stockTake = stockTake;
    }
  } else {
    // Create new
    const newId = `item-${Date.now()}`;
    state.items.push({
      id: newId,
      blockId,
      name,
      dose,
      cond,
      checked: false,
      scheduleType,
      scheduleDays: scheduleType === 'days' ? scheduleDays : undefined,
      stockTotal,
      stockTake
    });
  }
  
  saveState();
  renderApp();
  dialogItem.close();
  showToast('Добавка сохранена');
});

btnDeleteItem.addEventListener('click', () => {
  const id = document.getElementById('edit-item-id').value;
  if (!id) return;
  
  if (confirm('Удалить эту добавку из списка?')) {
    state.items = state.items.filter(i => i.id !== id);
    saveState();
    renderApp();
    dialogItem.close();
    showToast('Добавка удалена');
  }
});

// Schedule type radio switching for supplements
document.querySelectorAll('input[name="item-schedule"]').forEach(radio => {
  radio.addEventListener('change', () => {
    const val = document.querySelector('input[name="item-schedule"]:checked').value;
    document.getElementById('item-subfield-days').classList.toggle('visible', val === 'days');
  });
});

// --- SETTINGS DIALOG ACTIONS ---
settingsBtn.addEventListener('click', () => {
  settingDailyTracking.checked = state.settings.dailyTrackingEnabled;
  settingSkincareEnabled.checked = state.settings.skincareEnabled || false;
  settingSuppScheduling.checked = state.settings.suppSchedulingEnabled || false;
  settingSuppStock.checked = state.settings.suppStockEnabled || false;
  settingSkinExpiration.checked = state.settings.skinExpirationEnabled || false;
  dialogSettings.showModal();
});

settingDailyTracking.addEventListener('change', (e) => {
  state.settings.dailyTrackingEnabled = e.target.checked;
  saveState();
  renderApp();
  showToast(state.settings.dailyTrackingEnabled ? 'Отметка о приеме включена' : 'Отметка о приеме выключена');
});

settingSkincareEnabled.addEventListener('change', (e) => {
  state.settings.skincareEnabled = e.target.checked;
  saveState();
  renderApp();
  renderSkincareScreen();
  showToast(state.settings.skincareEnabled ? 'Раздел Уход включен' : 'Раздел Уход выключен');
});

settingSuppScheduling.addEventListener('change', (e) => {
  state.settings.suppSchedulingEnabled = e.target.checked;
  saveState();
  renderApp();
  showToast(state.settings.suppSchedulingEnabled ? 'Расписание добавок включено' : 'Расписание добавок выключено');
});

settingSuppStock.addEventListener('change', (e) => {
  state.settings.suppStockEnabled = e.target.checked;
  saveState();
  renderApp();
  showToast(state.settings.suppStockEnabled ? 'Учет запасов добавок включен' : 'Учет запасов добавок выключен');
});

settingSkinExpiration.addEventListener('change', (e) => {
  state.settings.skinExpirationEnabled = e.target.checked;
  saveState();
  renderSkincareScreen();
  showToast(state.settings.skinExpirationEnabled ? 'Сроки годности косметики включены' : 'Сроки годности косметики выключены');
});

// Reset stack to default state
document.getElementById('btn-reset-default').addEventListener('click', () => {
  if (confirm('Вы уверены, что хотите сбросить все ваши настройки к начальным? Все текущие данные будут удалены.')) {
    state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    state.lastCompletionDate = getTodayString();
    state.lastWeekNumber = getCurrentWeekNumber();
    saveState();
    renderApp();
    renderSkincareScreen();
    dialogSettings.close();
    checkOnboarding();
    showToast('Стек сброшен к исходному');
  }
});

// Export stack configuration to JSON file
document.getElementById('btn-export-json').addEventListener('click', () => {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `ritual-backup-${getTodayString()}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  showToast('Экспорт выполнен');
});

// Import trigger and handler
const importTrigger = document.getElementById('btn-import-trigger');
const importFileInput = document.getElementById('import-file-input');

importTrigger.addEventListener('click', () => {
  importFileInput.click();
});

importFileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (evt) => {
    try {
      const importedData = JSON.parse(evt.target.result);
      if (importedData.blocks && Array.isArray(importedData.blocks) && importedData.items && Array.isArray(importedData.items)) {
        // СОЗДАТЬ БЭКАП ПЕРЕД ИМПОРТОМ
        localStorage.setItem('ritual_backup_pre_import', JSON.stringify(state));
        
        state = importedData;
        // Keep date alignment or force current
        state.lastCompletionDate = state.lastCompletionDate || getTodayString();
        if (!state.skincareItems) state.skincareItems = [];
        if (state.lastWeekNumber === undefined) state.lastWeekNumber = getCurrentWeekNumber();
        saveState();
        renderApp();
        renderSkincareScreen();
        dialogSettings.close();
        showToast('Импорт успешно завершен!');
      } else {
        alert('Ошибка: Невалидный формат файла конфигурации. Отсутствуют обязательные списки blocks/items.');
      }
    } catch (err) {
      alert('Ошибка при разборе файла JSON: ' + err.message);
    }
  };
  reader.readAsText(file);
  importFileInput.value = ''; // Reset file input
});

// Restore from backup
document.getElementById('btn-restore-backup').addEventListener('click', () => {
  const backupData = localStorage.getItem('ritual_backup_pre_import');
  if (!backupData) {
    showToast('Бэкап не найден');
    return;
  }
  
  if (confirm('Восстановить данные из последней резервной копии? Текущие данные будут заменены.')) {
    try {
      state = JSON.parse(backupData);
      saveState();
      renderApp();
      renderSkincareScreen();
      dialogSettings.close();
      showToast('Данные восстановлены из бэкапа');
    } catch (err) {
      alert('Ошибка при восстановлении: ' + err.message);
    }
  }
});

// --- CLOSE MODALS ON CANCEL / CROSS ---
document.querySelectorAll('.modal-sheet').forEach(modal => {
  // Close buttons inside modal headers
  const closeBtn = modal.querySelector('.btn-close-modal');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => modal.close());
  }
  
  // Cancel actions in footers
  const cancelBtn = modal.querySelector('.btn-cancel');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => modal.close());
  }
  
  // Close dialog when click is outside dialog contents (on backdrop)
  modal.addEventListener('click', (e) => {
    if (modal.id === 'dialog-onboarding') return;
    
    const dialogDimensions = modal.getBoundingClientRect();
    if (
      e.clientX < dialogDimensions.left ||
      e.clientX > dialogDimensions.right ||
      e.clientY < dialogDimensions.top ||
      e.clientY > dialogDimensions.bottom
    ) {
      modal.close();
    }
  });
});

// --- SW REGISTRATION ---
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('ServiceWorker registered successfully', reg.scope))
      .catch(err => console.log('ServiceWorker registration failed: ', err));
  });
}

// --- ONBOARDING WIZARD LOGIC ---
const dialogOnboarding = document.getElementById('dialog-onboarding');

function checkOnboarding() {
  if (state.settings && state.settings.onboardingCompleted === false) {
    initOnboardingWizard();
    dialogOnboarding.showModal();
  }
}

function initOnboardingWizard() {
  const steps = dialogOnboarding.querySelectorAll('.onboarding-step');
  let currentStep = 1;

  function showStep(stepNumber) {
    steps.forEach(step => {
      const isCurrent = parseInt(step.dataset.step) === stepNumber;
      step.classList.toggle('active', isCurrent);
    });
    currentStep = stepNumber;
  }

  // Next buttons
  const nextButtons = dialogOnboarding.querySelectorAll('.btn-next-step');
  nextButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      if (currentStep < 3) {
        showStep(currentStep + 1);
      }
    });
  });

  // Prevent escape key close
  dialogOnboarding.addEventListener('cancel', (e) => {
    e.preventDefault();
  });

  // Daily Tracking Checkbox
  const onboardingDailyTracking = document.getElementById('onboarding-daily-tracking');
  onboardingDailyTracking.checked = state.settings.dailyTrackingEnabled;
  onboardingDailyTracking.addEventListener('change', (e) => {
    state.settings.dailyTrackingEnabled = e.target.checked;
    settingDailyTracking.checked = e.target.checked;
    saveState();
  });

  // Clean Slate Button
  const btnClean = document.getElementById('btn-onboarding-clean');
  btnClean.onclick = () => {
    state.settings.onboardingCompleted = true;
    saveState();
    dialogOnboarding.close();
    renderApp();
    renderSkincareScreen();
    showToast('Настройка завершена! Создайте первый блок');
  };

  // Load Demo Button
  const btnDemo = document.getElementById('btn-onboarding-demo');
  btnDemo.onclick = () => {
    state = JSON.parse(JSON.stringify(DEMO_STATE));
    state.settings.dailyTrackingEnabled = onboardingDailyTracking.checked;
    state.lastCompletionDate = getTodayString();
    saveState();
    dialogOnboarding.close();
    renderApp();
    renderSkincareScreen();
    showToast('Демо-ритуалы успешно загружены!');
  };
}

// --- INITIALIZE APP ---
initTheme();
loadState();
checkOnboarding();
renderApp();
renderSkincareScreen();
initBottomNav();

// ================================================================
// BOTTOM NAV
// ================================================================
function initBottomNav() {
  const navSupplements = document.getElementById('nav-supplements');
  const navSkincare = document.getElementById('nav-skincare');
  const screenSupplements = document.getElementById('screen-supplements');
  const screenSkincare = document.getElementById('screen-skincare');

  navSupplements.addEventListener('click', () => {
    navSupplements.classList.add('active');
    navSkincare.classList.remove('active');
    screenSupplements.classList.add('active');
    screenSkincare.classList.remove('active');
  });

  navSkincare.addEventListener('click', () => {
    navSkincare.classList.add('active');
    navSupplements.classList.remove('active');
    screenSkincare.classList.add('active');
    screenSupplements.classList.remove('active');
    renderSkincareScreen();
  });
}

// ================================================================
// SKINCARE MODULE
// ================================================================

let skincareEditMode = false;

// Get current day-of-week (0=Sun, 1=Mon, ..., 6=Sat)
function getTodayDOW() {
  return new Date().getDay();
}

// Render the skincare screen
function renderSkincareScreen() {
  const morningList = document.getElementById('skincare-morning-list');
  const eveningList = document.getElementById('skincare-evening-list');
  const morningCount = document.getElementById('skincare-morning-count');
  const eveningCount = document.getElementById('skincare-evening-count');

  morningList.innerHTML = '';
  eveningList.innerHTML = '';

  const morningItems = state.skincareItems.filter(i => i.timing === 'morning');
  const eveningItems = state.skincareItems.filter(i => i.timing === 'evening');

  morningCount.textContent = morningItems.length > 0 ? `${morningItems.length} средств` : '';
  eveningCount.textContent = eveningItems.length > 0 ? `${eveningItems.length} средств` : '';

  // Empty state
  if (state.skincareItems.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'skincare-empty';
    empty.innerHTML = `
      <div class="skincare-empty-icon">🧴</div>
      <div class="skincare-empty-title">Уходовые средства</div>
      <p class="skincare-empty-text">Добавьте первое средство, нажав «Настроить» и кнопку «+» в нужном разделе.</p>
    `;
    morningList.appendChild(empty);
    return;
  }

  [morningItems, eveningItems].forEach((items, idx) => {
    const container = idx === 0 ? morningList : eveningList;
    const timing = idx === 0 ? 'morning' : 'evening';
    items.forEach(item => container.appendChild(buildSkincareCard(item, timing)));
  });
}

function buildSkincareCard(item, timing) {
  const today = getTodayString();
  const todayDOW = getTodayDOW();
  const card = document.createElement('div');
  card.className = `skincare-card ${timing}`;
  card.dataset.id = item.id;

  // 'daily' means all 7 days
  const effectiveDays = item.scheduleType === 'daily'
    ? [0, 1, 2, 3, 4, 5, 6]
    : (item.scheduleDays || []);

  // Determine done state
  let isDoneToday = false;
  if (item.scheduleType === 'days' || item.scheduleType === 'daily') {
    isDoneToday = !!(item.history && item.history[today]);
  }
  if (isDoneToday) card.classList.add('done-today');

  const dragHandleSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>`;
  const editSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>`;

  // --- Days/Daily type bottom section ---
  let bottomSection = '';
  if (item.scheduleType === 'days' || item.scheduleType === 'daily') {
    const bubblesHTML = DAY_LABELS.map((label, i) => {
      const isScheduled = effectiveDays.includes(i);
      const isToday = i === todayDOW;
      const isDone = !!(item.history && item.history[today]) && isToday;

      let cls = '';
      if (!isScheduled) {
        cls = 'off';
      } else if (isToday && isDone) {
        cls = 'today done';
      } else if (isToday) {
        cls = 'today';
      } else {
        cls = 'scheduled';
      }
      return `<div class="day-bubble ${cls}">${label}</div>`;
    }).join('');
    bottomSection = `<div class="skincare-days-row">${bubblesHTML}</div>`;
  } else {
    // Frequency type
    const done = item.currentWeekCount || 0;
    const target = item.targetFrequency || 3;
    const pct = Math.min(100, Math.round((done / target) * 100));
    bottomSection = `
      <div class="skincare-freq-row">
        <span class="skincare-freq-text">На этой неделе</span>
        <span class="skincare-freq-count">${done} / ${target}</span>
        <div class="skincare-progress-bar">
          <div class="skincare-progress-fill" style="width: ${pct}%"></div>
        </div>
        <div class="skincare-freq-controls">
          <button class="btn-freq minus" data-id="${item.id}" aria-label="Уменьшить">−</button>
          <button class="btn-freq plus" data-id="${item.id}" aria-label="Добавить">+</button>
        </div>
      </div>
    `;
  }

  // Calculate expiration/freshness info
  let expiryBadgeHTML = '';
  let expDate = null;
  
  if (state.settings.skinExpirationEnabled) {
    if (item.openedDate && item.paoMonths) {
      const open = new Date(item.openedDate);
      open.setMonth(open.getMonth() + parseInt(item.paoMonths));
      expDate = open;
    }
    if (item.expirationDate) {
      const directExp = new Date(item.expirationDate);
      if (!expDate || directExp < expDate) {
        expDate = directExp;
      }
    }
    
    if (expDate) {
      const todayVal = new Date(getTodayString());
      todayVal.setHours(0,0,0,0);
      const expDateZero = new Date(expDate);
      expDateZero.setHours(0,0,0,0);
      
      const diffTime = expDateZero - todayVal;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) {
        expiryBadgeHTML = `<span class="skincare-expiry-badge expired">⚠️ Просрочено</span>`;
      } else if (diffDays <= 30) {
        expiryBadgeHTML = `<span class="skincare-expiry-badge warning">⏳ Истекает через ${diffDays} дн.</span>`;
      } else {
        expiryBadgeHTML = `<span class="skincare-expiry-badge fresh">✓ Свежий</span>`;
      }
    }
  }

  card.innerHTML = `
    <div class="skincare-card-inner">
      <div class="skincare-card-top">
        <div class="skincare-drag-handle" aria-label="Перетащить">${dragHandleSVG}</div>
        <div class="skincare-card-name-row">
          ${(item.scheduleType === 'days' || item.scheduleType === 'daily') ? '<div class="skincare-done-circle"></div>' : ''}
          <div class="skincare-name-container">
            <span class="skincare-card-name">${escapeHTML(item.name)}</span>
            ${expiryBadgeHTML}
          </div>
        </div>
        <div class="skincare-card-actions">
          <button class="btn-edit-skincare" data-id="${escapeHTML(item.id)}" aria-label="Редактировать">${editSVG}</button>
        </div>
      </div>
      ${bottomSection}
    </div>
  `;

  // Click card to toggle done (days/daily type only)
  if (item.scheduleType === 'days' || item.scheduleType === 'daily') {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.btn-edit-skincare') || e.target.closest('.skincare-drag-handle')) return;
      if (skincareEditMode) return;
      // For 'daily' all days are valid
      if (item.scheduleType === 'days' && !effectiveDays.includes(getTodayDOW())) {
        showToast('Это средство не запланировано на сегодня');
        return;
      }
      if (!item.history) item.history = {};
      const today = getTodayString();
      item.history[today] = !item.history[today];
      item.currentWeekCount = Object.values(item.history).filter(v => v).length;
      saveState();
      renderSkincareScreen();
    });
  }

  // Edit button
  const editBtn = card.querySelector('.btn-edit-skincare');
  editBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openSkincareModal(item);
  });

  // Frequency +/- buttons
  if (item.scheduleType === 'frequency') {
    const plusBtn = card.querySelector('.btn-freq.plus');
    const minusBtn = card.querySelector('.btn-freq.minus');
    plusBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      item.currentWeekCount = (item.currentWeekCount || 0) + 1;
      saveState();
      renderSkincareScreen();
    });
    minusBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      item.currentWeekCount = Math.max(0, (item.currentWeekCount || 0) - 1);
      saveState();
      renderSkincareScreen();
    });
  }

  return card;
}

// Skincare edit mode toggle
const skincareEditToggle = document.getElementById('skincare-edit-toggle');
const skincareEditBtnText = document.getElementById('skincare-edit-btn-text');
let skincareSortableMorning = null;
let skincareSortableEvening = null;

skincareEditToggle.addEventListener('click', () => {
  skincareEditMode = !skincareEditMode;
  document.body.classList.toggle('skincare-edit-mode', skincareEditMode);
  skincareEditToggle.classList.toggle('active', skincareEditMode);
  skincareEditBtnText.textContent = skincareEditMode ? 'Готово' : 'Настроить';

  if (skincareEditMode) {
    initSkincareDragAndDrop();
    showToast('Режим настройки активен');
  } else {
    if (skincareSortableMorning) { skincareSortableMorning.destroy(); skincareSortableMorning = null; }
    if (skincareSortableEvening) { skincareSortableEvening.destroy(); skincareSortableEvening = null; }
    showToast('Изменения сохранены');
  }
});

function initSkincareDragAndDrop() {
  const morningList = document.getElementById('skincare-morning-list');
  const eveningList = document.getElementById('skincare-evening-list');

  const onSortEnd = () => {
    // Rebuild skincareItems order from DOM
    const newOrder = [];
    [morningList, eveningList].forEach(list => {
      list.querySelectorAll('.skincare-card').forEach(cardEl => {
        const id = cardEl.dataset.id;
        const item = state.skincareItems.find(i => i.id === id);
        if (item) newOrder.push(item);
      });
    });
    state.skincareItems = newOrder;
    saveState();
  };

  if (morningList) {
    skincareSortableMorning = Sortable.create(morningList, {
      handle: '.skincare-drag-handle',
      animation: 180,
      ghostClass: 'sortable-ghost',
      chosenClass: 'sortable-chosen',
      onEnd: onSortEnd
    });
  }
  if (eveningList) {
    skincareSortableEvening = Sortable.create(eveningList, {
      handle: '.skincare-drag-handle',
      animation: 180,
      ghostClass: 'sortable-ghost',
      chosenClass: 'sortable-chosen',
      onEnd: onSortEnd
    });
  }
}

// Add buttons
document.getElementById('btn-add-skincare-morning').addEventListener('click', () => openSkincareModal(null, 'morning'));
document.getElementById('btn-add-skincare-evening').addEventListener('click', () => openSkincareModal(null, 'evening'));

// --- SKINCARE MODAL LOGIC ---
const dialogSkincare = document.getElementById('dialog-skincare');
const formSkincare = document.getElementById('form-skincare');
const btnDeleteSkincare = document.getElementById('btn-delete-skincare');
const subfieldDays = document.getElementById('subfield-days');
const subfieldFreq = document.getElementById('subfield-frequency');

// Schedule type radio switching
document.querySelectorAll('input[name="skincare-schedule"]').forEach(radio => {
  radio.addEventListener('change', () => {
    const val = document.querySelector('input[name="skincare-schedule"]:checked').value;
    subfieldDays.classList.toggle('visible', val === 'days');
    subfieldFreq.classList.toggle('visible', val === 'frequency');
  });
});

// Day picker toggle buttons
document.querySelectorAll('.day-pick-btn').forEach(btn => {
  btn.addEventListener('click', () => btn.classList.toggle('selected'));
});

function openSkincareModal(item = null, defaultTiming = 'morning') {
  const titleEl = document.getElementById('skincare-dialog-title');
  const nameInput = document.getElementById('skincare-name');
  const idInput = document.getElementById('edit-skincare-id');
  const freqInput = document.getElementById('skincare-freq-num');

  // Reset form
  formSkincare.reset();
  document.querySelectorAll('.day-pick-btn').forEach(b => b.classList.remove('selected'));
  subfieldDays.classList.add('visible');
  subfieldFreq.classList.remove('visible');
  // Default: show days subfield, check 'days' radio
  document.getElementById('schedule-days').checked = true;
  document.getElementById('skincare-opened-date').value = '';
  document.getElementById('skincare-pao').value = '';
  document.getElementById('skincare-exp-date').value = '';

  if (item) {
    titleEl.textContent = 'Редактировать средство';
    idInput.value = item.id;
    nameInput.value = item.name;
    btnDeleteSkincare.style.display = 'block';

    // Timing
    const timingRadio = document.querySelector(`input[name="skincare-timing"][value="${item.timing}"]`);
    if (timingRadio) timingRadio.checked = true;

    // Schedule type
    const scheduleRadio = document.querySelector(`input[name="skincare-schedule"][value="${item.scheduleType}"]`);
    if (scheduleRadio) scheduleRadio.checked = true;
    subfieldDays.classList.toggle('visible', item.scheduleType === 'days');
    subfieldFreq.classList.toggle('visible', item.scheduleType === 'frequency');
    // daily: no subfields
    if (item.scheduleType === 'daily') {
      subfieldDays.classList.remove('visible');
      subfieldFreq.classList.remove('visible');
    }

    // Expiration details
    document.getElementById('skincare-opened-date').value = item.openedDate || '';
    document.getElementById('skincare-pao').value = item.paoMonths || '';
    document.getElementById('skincare-exp-date').value = item.expirationDate || '';

    // Days
    if (item.scheduleType === 'days' && item.scheduleDays) {
      document.querySelectorAll('.day-pick-btn').forEach(btn => {
        if (item.scheduleDays.includes(Number(btn.dataset.day))) {
          btn.classList.add('selected');
        }
      });
    }

    // Frequency
    if (item.scheduleType === 'frequency') {
      freqInput.value = item.targetFrequency || 3;
    }
  } else {
    titleEl.textContent = 'Добавить средство';
    idInput.value = '';
    btnDeleteSkincare.style.display = 'none';

    // Set default timing
    const timingRadio = document.querySelector(`input[name="skincare-timing"][value="${defaultTiming}"]`);
    if (timingRadio) timingRadio.checked = true;
  }

  dialogSkincare.showModal();
}

formSkincare.addEventListener('submit', (e) => {
  e.preventDefault();
  const id = document.getElementById('edit-skincare-id').value;
  const name = document.getElementById('skincare-name').value.trim();
  const timing = document.querySelector('input[name="skincare-timing"]:checked').value;
  const scheduleType = document.querySelector('input[name="skincare-schedule"]:checked').value;

  const scheduleDays = [];
  if (scheduleType === 'days') {
    document.querySelectorAll('.day-pick-btn.selected').forEach(btn => {
      scheduleDays.push(Number(btn.dataset.day));
    });
  }

  const targetFrequency = parseInt(document.getElementById('skincare-freq-num').value) || 3;
  const openedDate = document.getElementById('skincare-opened-date').value || undefined;
  const paoMonthsInput = document.getElementById('skincare-pao').value;
  const paoMonths = paoMonthsInput !== '' ? parseInt(paoMonthsInput) : undefined;
  const expirationDate = document.getElementById('skincare-exp-date').value || undefined;

  if (id) {
    // Update existing
    const item = state.skincareItems.find(i => i.id === id);
    if (item) {
      item.name = name;
      item.timing = timing;
      item.scheduleType = scheduleType;
      item.scheduleDays = scheduleType === 'days' ? scheduleDays : undefined;
      item.targetFrequency = scheduleType === 'frequency' ? targetFrequency : undefined;
      item.openedDate = openedDate;
      item.paoMonths = paoMonths;
      item.expirationDate = expirationDate;
    }
  } else {
    // Create new
    const newId = `skin-${Date.now()}`;
    state.skincareItems.push({
      id: newId,
      name,
      timing,
      scheduleType,
      scheduleDays: scheduleType === 'days' ? scheduleDays : undefined,
      targetFrequency: scheduleType === 'frequency' ? targetFrequency : undefined,
      currentWeekCount: 0,
      history: {},
      openedDate,
      paoMonths,
      expirationDate
    });
  }

  saveState();
  renderSkincareScreen();
  dialogSkincare.close();
  showToast('Средство сохранено');
});

btnDeleteSkincare.addEventListener('click', () => {
  const id = document.getElementById('edit-skincare-id').value;
  if (!id) return;
  if (confirm('Удалить это средство из списка?')) {
    state.skincareItems = state.skincareItems.filter(i => i.id !== id);
    saveState();
    renderSkincareScreen();
    dialogSkincare.close();
    showToast('Средство удалено');
  }
});
