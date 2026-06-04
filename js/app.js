import Sortable from 'https://cdn.jsdelivr.net/npm/sortablejs@1.15.2/modular/sortable.esm.js';

// --- STATE MANAGEMENT ---
let state = {
  blocks: [],
  items: [],
  lastCompletionDate: '',
  settings: {
    dailyTrackingEnabled: false,
    onboardingCompleted: false
  }
};

let editMode = false;
let searchQuery = '';

const DEFAULT_STATE = {
  blocks: [],
  items: [],
  lastCompletionDate: '',
  settings: {
    dailyTrackingEnabled: false,
    onboardingCompleted: false
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
  lastCompletionDate: '',
  settings: {
    dailyTrackingEnabled: false,
    onboardingCompleted: true
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
        state.settings = { dailyTrackingEnabled: false, onboardingCompleted: true };
      } else if (state.settings.onboardingCompleted === undefined) {
        state.settings.onboardingCompleted = true; // Migrate existing users
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
}

// Save state to local storage
function saveState() {
  localStorage.setItem('supplement_tracker_state', JSON.stringify(state));
  renderProgressBar();
  updateResetFABVisibility();
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

  const total = state.items.length;
  const completed = state.items.filter(item => item.checked).length;
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
  const blocksCount = state.blocks.length;
  
  // Pluralize blocks label
  let blocksText = 'блоков';
  if (blocksCount === 1) blocksText = 'блок';
  else if (blocksCount >= 2 && blocksCount <= 4) blocksText = 'блока';
  
  headerDate.textContent = `${blocksCount} ${blocksText} · ${dateStr}`;
}

// --- RENDER APPLICATION ---
function renderApp() {
  stacksGrid.innerHTML = '';
  renderDate();
  
  if (state.blocks.length === 0) {
    const emptyCard = document.createElement('div');
    emptyCard.className = 'empty-state-card';
    emptyCard.innerHTML = `
      <div class="empty-state-illustration">🌱</div>
      <h3 class="empty-state-title">Стек добавок пуст</h3>
      <p class="empty-state-text">Создайте свой первый блок (например: Утро, День или Вечер), чтобы начать добавлять витамины.</p>
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
  } else {
    stacksGrid.style.display = '';
    state.blocks.forEach(block => {
    // Filter items belonging to this block
    const blockItems = state.items.filter(item => item.blockId === block.id);
    
    // Card Wrapper
    const card = document.createElement('div');
    card.className = `card ${block.color || 'utro'}`;
    card.dataset.id = block.id;
    
    // Header
    card.innerHTML = `
      <div class="card-header">
        <div class="card-header-left">
          <div class="card-ico">${block.icon || '💊'}</div>
          <div class="card-titles">
            <span class="card-label">${block.name}</span>
            ${block.sub ? `<span class="card-sub">${block.sub}</span>` : ''}
          </div>
        </div>
        <div class="card-header-right">
          <button class="btn-card-action btn-edit-block" title="Редактировать блок" style="display: ${editMode ? 'flex' : 'none'};">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
          </button>
          <div class="btn-card-action block-drag-handle" title="Перетащить блок" style="display: ${editMode ? 'flex' : 'none'};">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>
          </div>
        </div>
      </div>
      <div class="rows-container" data-block-id="${block.id}"></div>
      <button class="add-item-card-btn" data-block-id="${block.id}">
        <span>+ Добавить добавку</span>
      </button>
    `;
    
    const rowsContainer = card.querySelector('.rows-container');
    
    // Add Row Items
    blockItems.forEach(item => {
      const row = document.createElement('div');
      const isItemChecked = state.settings.dailyTrackingEnabled && item.checked;
      row.className = `row-item ${isItemChecked ? 'checked' : ''}`;
      row.dataset.id = item.id;
      
      // Perform search filter if active
      if (searchQuery) {
        const matches = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        if (!matches) {
          row.style.display = 'none';
        }
      }
      
      row.innerHTML = `
        <div class="row-item-left">
          <div class="custom-checkbox ${isItemChecked ? 'checked' : ''}" style="display: ${state.settings.dailyTrackingEnabled ? 'flex' : 'none'};" role="checkbox" aria-checked="${isItemChecked}"></div>
          <div class="row-content">
            <span class="row-name">${item.name}</span>
            ${item.cond ? `<span class="row-cond">${item.cond}</span>` : ''}
          </div>
        </div>
        <span class="dose-tag">${item.dose}</span>
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
        saveState();
        
        // Visual toggle without full re-render for smooth response
        row.classList.toggle('checked', item.checked);
        checkbox.classList.toggle('checked', item.checked);
        checkbox.setAttribute('aria-checked', item.checked);
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
      
      rowsContainer.appendChild(row);
    });
    
    // Edit block event
    card.querySelector('.btn-edit-block').addEventListener('click', (e) => {
      e.stopPropagation();
      openBlockModal(block);
    });
    
    // Add supplement item inside block event
    card.querySelector('.add-item-card-btn').addEventListener('click', (e) => {
      openItemModal(null, block.id);
    });
    
    stacksGrid.appendChild(card);
  });
  } // End of state.blocks.length === 0 else block
  
  renderProgressBar();
  updateResetFABVisibility();
  
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
  if (item) {
    // Edit existing
    document.getElementById('item-dialog-title').textContent = 'Редактировать';
    document.getElementById('edit-item-id').value = item.id;
    document.getElementById('item-block-id').value = item.blockId;
    document.getElementById('item-name').value = item.name;
    document.getElementById('item-dose').value = item.dose;
    document.getElementById('item-cond').value = item.cond || '';
    
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
  
  if (id) {
    // Update existing
    const item = state.items.find(i => i.id === id);
    if (item) {
      item.name = name;
      item.dose = dose;
      item.cond = cond;
    }
  } else {
    // Create new
    const newId = `item-${Date.now()}`;
    state.items.push({ id: newId, blockId, name, dose, cond, checked: false });
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

// --- SETTINGS DIALOG ACTIONS ---
settingsBtn.addEventListener('click', () => {
  settingDailyTracking.checked = state.settings.dailyTrackingEnabled;
  dialogSettings.showModal();
});

settingDailyTracking.addEventListener('change', (e) => {
  state.settings.dailyTrackingEnabled = e.target.checked;
  saveState();
  renderApp();
  showToast(state.settings.dailyTrackingEnabled ? 'Отметка о приеме включена' : 'Отметка о приеме выключена');
});

// Reset stack to default state
document.getElementById('btn-reset-default').addEventListener('click', () => {
  if (confirm('Вы уверены, что хотите сбросить все ваши настройки к начальным? Все текущие данные будут удалены.')) {
    state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    state.lastCompletionDate = getTodayString();
    saveState();
    renderApp();
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
  downloadAnchor.setAttribute("download", `supplement-stack-backup-${getTodayString()}.json`);
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
        state = importedData;
        // Keep date alignment or force current
        state.lastCompletionDate = state.lastCompletionDate || getTodayString();
        saveState();
        renderApp();
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
    showToast('Стек настроен! Добавьте первый блок');
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
    showToast('Демо-стек успешно загружен!');
  };
}

// --- INITIALIZE APP ---
initTheme();
loadState();
checkOnboarding();
renderApp();
