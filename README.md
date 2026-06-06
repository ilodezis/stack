# ✨ Ritual

[Русский](#русский) | [English](#english)

---

## Русский

**Ritual** — красивое, быстрое и полностью приватное веб-приложение для отслеживания ежедневных ритуалов: витаминов, добавок и уходовых средств.

Спроектировано как **Progressive Web App (PWA)** — устанавливается на главный экран смартфона и работает без интернета.

В приложении реализована модульная архитектура: все продвинутые функции можно включать и выключать в настройках по отдельности, сохраняя интерфейс простым и чистым для новых пользователей.

---

### ✨ Возможности

#### 💊 Трекер добавок
- **Блоки по времени суток** — создавай разделы «Утро», «День», «Вечер» и любые другие.
- **Кастомизация** — название, подзаголовок, emoji и цветовая тема для каждого блока.
- **Ежедневный трекинг** — отмечай принятые добавки галочкой, прогресс-бар дня, кнопка «✓ Все» для быстрой отметки целого блока.
- **Автосброс** — прогресс сбрасывается автоматически при наступлении нового дня.
- **Drag & Drop** — меняй порядок блоков и добавок, перетаскивай добавки между блоками.

#### ⚙️ Модульные функции (Включаются в Настройках)
- **🧴 Раздел «Уход за кожей»** — включает отдельную вкладку в нижней навигации для отслеживания утренней и вечерней рутины ухода.
  - **Три типа расписания**: Ежедневно, по выбранным дням недели (например, только Пн, Ср, Пт) или N раз в неделю с интерактивными счетчиками.
  - **Drag & Drop** — меняй порядок уходовых средств в режиме настройки.
  - **Недельный сброс** — счетчики частоты обнуляются с началом новой ISO-недели.
- **📅 Расписание добавок по дням недели** — возможность настраивать прием конкретных добавок в определенные дни (например, только по средам). Добавки, не запланированные на сегодня, автоматически скрываются с главного экрана (или приглушаются в режиме настройки). Прогресс-бар дня учитывает только запланированные на сегодня элементы.
- **📦 Счетчик запасов таблеток** — отслеживает количество капсул в банке и списывает разовую дозу при отметке приема (и возвращает при снятии отметки). Поддерживает автосписание при групповой отметке «✓ Все». Показывает оранжевый предупреждающий бейдж `⚠️ Осталось: N шт.`, когда запас подходит к концу.
- **⏳ Сроки годности косметики (EXP и PAO)** — рассчитывает остаточный срок использования средств ухода по дате открытия и периоду PAO (в месяцах) или по абсолютному сроку EXP. Выводит на карточках предупреждающие бейджи:
  - `⚠️ Просрочено` (красный) — средство использовать небезопасно.
  - `⏳ Истекает через N дн.` (желтый) — если до конца срока осталось менее 30 дней.
  - `✓ Свежий` (зеленый) — средство в порядке.

#### 🎨 Дизайн и UX
- **Модульный интерфейс** — приложение запускается в максимально чистом и минималистичном виде. Дополнительные вкладки и поля форм скрыты, пока вы не включите их в настройках.
- **Тёмная и светлая тема** — ручная и автоматическая (системная).
- **Премиум-дизайн** — glassmorphism, плавные анимации, микро-анимации элементов.
- **100% офлайн** — Service Worker кэширует все файлы для работы без сети.

#### 🔒 Приватность и данные
- Все данные хранятся только в `localStorage` вашего браузера — никакого сервера, полная анонимность.
- **Экспорт / импорт** — сохраняй резервную копию в JSON и легко переносите данные на другие устройства.

---

### 📱 Как установить на телефон

1. Открой приложение в браузере смартфона.
2. **iOS (Safari)**: Нажми кнопку «Поделиться» → «На экран "Домой"».
3. **Android (Chrome)**: Нажми меню `⋮` → «Установить приложение» или «Добавить на главный экран».

На рабочем столе появится иконка **Ritual** — приложение откроется в полноэкранном режиме без интерфейса браузера.

---

### 🛠️ Локальная разработка

Проект написан на чистом Vanilla HTML / CSS / JS — сборка не требуется. Запусти любой статический сервер:

```bash
# Python
python -m http.server 8000

# Node.js (npx)
npx serve .
```

Для запуска интеграционных тестов (требуется Python и Chrome):
```bash
pip install pytest selenium
python -m pytest tests/
```

---

### 🧬 Стек

| Технология | Роль |
|---|---|
| HTML5 / CSS3 | Семантическая вёрстка, CSS Custom Properties, Grid & Flexbox, кастомные переключатели |
| JavaScript ES6+ | Модульная логика, стейт, рендеринг списков, расчет сроков годности, LocalStorage, File API |
| SortableJS | Drag & Drop списков на мобильных |
| PWA (Manifest + SW) | Установка на HomeScreen, офлайн-режим, автоматическое обновление кэша (Stale-While-Revalidate) |

---

### 📁 Структура проекта

```
ritual/
├── index.html          # Основной HTML, модальные окна, структура форм
├── manifest.json       # PWA-манифест (имя, иконки, цвета)
├── sw.js               # Service Worker (кэширование и фоновое обновление)
├── icon.png            # Иконка приложения
├── css/
│   └── app.css         # Все стили: дизайн-система, темы, бейджи остатков и годности
├── js/
│   └── app.js          # Вся логика: стейт, модульные настройки, расчеты дат и запасов, D&D
└── tests/
    └── test_ritual.py  # Интеграционные E2E тесты (pytest + Selenium)
```

---

## English

**Ritual** is a beautiful, fast, and fully private web application for tracking your daily rituals: vitamins, supplements, and skincare routines.

Designed as a **Progressive Web App (PWA)** — it installs on your smartphone's home screen and works completely offline.

It features a modular layout where advanced options can be toggled on/off individually in Settings, keeping the interface clean and simple for new users.

---

### ✨ Features

#### 💊 Supplement Tracker
- **Blocks by Time of Day** — create custom sections like "Morning", "Afternoon", "Evening", and more.
- **Customization** — name, subtitle, emoji, and a unique color theme for each block.
- **Daily Tracking** — check off taken supplements, view a daily progress bar, and use the "✓ All" button to quickly mark an entire block.
- **Auto-reset** — progress resets automatically at midnight.
- **Drag & Drop** — reorder blocks and items, and drag supplements between blocks.

#### ⚙️ Modular Features (Toggleable in Settings)
- **🧴 Skincare Section** — enables a bottom navigation bar and a dedicated screen for morning and evening skincare routines.
  - **Three Schedule Types**: Daily, specific days of the week (e.g. Mon, Wed, Fri), or N times a week with interactive progress counters.
  - **Drag & Drop** — reorder skincare cards in edit mode.
  - **Weekly Reset** — frequency counters automatically reset at the start of a new ISO week.
- **📅 Supplement Scheduling** — schedule supplements for specific days of the week (e.g., Wednesdays only). Off-day supplements are hidden from the dashboard (or dimmed in edit mode) to focus your attention, and the progress bar adjusts to count only today's schedule.
- **📦 Pill Stock Counter** — tracks remaining capsules/pills and automatically decrements the dosage when marked as checked (and increments back when unchecked). Supports bulk updates via "✓ All". Displays an orange warning badge `⚠️ Remaining: N` when stocks run low.
- **⏳ Skincare Expiration Tracker (EXP & PAO)** — monitors opened dates, Period After Opening (PAO) months, and absolute expiration dates (EXP). Renders status badges on skincare cards:
  - `⚠️ Expired` (red) — unsafe to use.
  - `⏳ Expires in N days` (yellow) — appears if expiration is less than 30 days away.
  - `✓ Fresh` (green) — item is safe to use.

#### 🎨 Design & UX
- **Modular Layout** — starts with a minimalist setup. Advanced form fields and tabs remain completely hidden until enabled in settings.
- **Dark & Light Themes** — manual toggle or automatic system matching.
- **Premium Aesthetics** — glassmorphism, smooth animations, and elegant micro-interactions.
- **100% Offline** — Service Worker caches all assets for offline use.

#### 🔒 Privacy & Data
- All data is stored locally in the browser's `localStorage` — no servers, no databases, absolute privacy.
- **Export / Import** — save backups to JSON files and restore them on other devices.

---

### 📱 How to Install on Your Phone

1. Open the app link in your smartphone's browser.
2. **iOS (Safari)**: Tap "Share" → "Add to Home Screen".
3. **Android (Chrome)**: Tap menu `⋮` → "Install app" or "Add to home screen".

The **Ritual** icon will appear on your home screen, and the app will open in fullscreen mode without any browser interface.

---

### 🛠️ Local Development

The project is built with pure Vanilla HTML / CSS / JS — no build tools or bundlers are required. Run any static server:

```bash
# Python
python -m http.server 8000

# Node.js (npx)
npx serve .
```

To run integration E2E tests (requires Python and Chrome):
```bash
pip install pytest selenium
python -m pytest tests/
```

---

### 🧬 Tech Stack

| Technology | Role |
|---|---|
| HTML5 / CSS3 | Semantic markup, CSS Custom Properties, Grid & Flexbox, custom switches |
| JavaScript ES6+ | Modular state, DOM rendering, date and stock calculations, LocalStorage, File API |
| SortableJS | Drag & Drop lists for mobile browsers |
| PWA (Manifest + SW) | Home screen installation, offline mode, background update checking (Stale-While-Revalidate) |

---

### 📁 Project Structure

```
ritual/
├── index.html          # Main HTML structure and modals
├── manifest.json       # PWA manifest (app name, icons, colors)
├── sw.js               # Service Worker (cache management and update checks)
├── icon.png            # App icon
├── css/
│   └── app.css         # All styles: design system, themes, layouts, status badges
├── js/
│   └── app.js          # Core JS: modular state, expiration and stock logic, rendering, D&D
└── tests/
    └── test_ritual.py  # E2E integration tests (pytest + Selenium)
```
