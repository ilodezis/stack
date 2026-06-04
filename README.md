# ✨ Ritual

[🇷🇺 Читать на русском](#-русский) | [🇬🇧 Read in English](#-english)

---

## 🇷🇺 Русский

**Ritual** — красивое, быстрое и полностью приватное веб-приложение для отслеживания ежедневных ритуалов: витаминов, добавок и уходовых средств.

Спроектировано как **Progressive Web App (PWA)** — устанавливается на главный экран смартфона и работает без интернета.

---

### ✨ Возможности

#### 💊 Трекер добавок
- **Блоки по времени суток** — создавай разделы «Утро», «День», «Вечер» и любые другие
- **Кастомизация** — название, подзаголовок, emoji и цветовая тема для каждого блока
- **Ежедневный трекинг** — отмечай принятые добавки галочкой, прогресс-бар дня, кнопка «✓ Все» для быстрой отметки целого блока
- **Автосброс** — прогресс сбрасывается автоматически при наступлении нового дня
- **Drag & Drop** — меняй порядок блоков и добавок, перетаскивай добавки между блоками

#### 🧴 Трекер уходовых средств
- **Секции «Утро» и «Вечер»** — отдельные списки для утреннего и вечернего ухода
- **Три типа расписания** для каждого средства:
  - **Ежедневно** — применяется каждый день
  - **По дням** — выбираешь конкретные дни недели (Пн, Ср, Пт и т.д.)
  - **N раз в неделю** — указываешь частоту, отмечаешь кнопками `+` / `−`
- **Визуализация** — пузырьки дней недели с подсветкой «сегодня» и галочкой выполнения; прогресс-бар для частотных средств
- **Drag & Drop** — меняй порядок карточек в режиме «Настроить»
- **Недельный сброс** — счётчики частоты автоматически обнуляются с началом новой ISO-недели

#### 🎨 Дизайн и UX
- **Bottom Navigation** — переключение между разделами «Добавки» и «Уход»
- **Тёмная и светлая тема** — ручная и автоматическая
- **Премиум-дизайн** — glassmorphism, плавные анимации, micro-interactions
- **100% офлайн** — Service Worker кэширует всё приложение

#### 🔒 Приватность и данные
- Все данные хранятся только в `localStorage` браузера — никакого сервера, никаких баз данных
- **Экспорт / импорт** — сохраняй резервную копию в JSON и восстанавливай на другом устройстве

---

### 📱 Как установить на телефон

1. Открой приложение в браузере смартфона
2. **iOS (Safari)**: «Поделиться» → «На экран "Домой"»
3. **Android (Chrome)**: меню `⋮` → «Установить приложение» или «Добавить на главный экран»

На рабочем столе появится иконка **Ritual** — приложение откроется в полноэкранном режиме без рамок браузера.

---

### 🛠️ Локальная разработка

Проект на чистом Vanilla HTML / CSS / JS — никакой сборки не нужно. Запусти любой статический сервер:

```bash
# Python
python -m http.server 8000

# Node.js (npx)
npx serve .
```

---

### 🧬 Стек

| Технология | Роль |
|---|---|
| HTML5 / CSS3 | Семантическая вёрстка, CSS Custom Properties, Grid & Flexbox |
| JavaScript ES6+ | Логика приложения, DOM, LocalStorage, File API |
| SortableJS | Drag & Drop на мобильных |
| PWA (Manifest + SW) | Установка на HomeScreen, офлайн-режим, Stale-While-Revalidate |

---

### 📁 Структура проекта

```
ritual/
├── index.html          # Основной HTML, вся разметка приложения
├── manifest.json       # PWA-манифест (имя, иконки, цвета)
├── sw.js               # Service Worker (кэширование)
├── icon.png            # Иконка приложения
├── css/
│   └── app.css         # Все стили: дизайн-система, компоненты, темы
└── js/
    └── app.js          # Вся логика: стейт, рендер, D&D, skincare-модуль
```

---

## 🇬🇧 English

**Ritual** is a beautiful, fast, and fully private web application for tracking your daily rituals: vitamins, supplements, and skincare routines.

Designed as a **Progressive Web App (PWA)** — it installs on your smartphone's home screen and works completely offline.

---

### ✨ Features

#### 💊 Supplement Tracker
- **Blocks by Time of Day** — create custom sections like "Morning", "Afternoon", "Evening", and more
- **Customization** — name, subtitle, emoji, and a unique color theme for each block
- **Daily Tracking** — check off taken supplements, view a daily progress bar, and use the "✓ All" button to quickly mark an entire block
- **Auto-reset** — progress resets automatically at midnight
- **Drag & Drop** — reorder blocks and items, and drag supplements between blocks

#### 🧴 Skincare Tracker
- **Morning & Evening Sections** — separate routines for your morning and evening skincare
- **Three Schedule Types** for each product:
  - **Daily** — applies to every single day
  - **Specific Days** — select custom days of the week (Mon, Wed, Fri, etc.)
  - **N Times a Week** — specify the weekly frequency, track progress with `+` / `−` buttons
- **Visual Progress** — weekday bubbles with a "today" highlight and completion checkmarks; progress bar for frequency-based products
- **Drag & Drop** — reorder skincare cards in "Edit" mode
- **Weekly Reset** — frequency counters automatically reset at the start of a new ISO week

#### 🎨 Design & UX
- **Bottom Navigation** — switch seamlessly between the "Supplements" and "Skincare" sections
- **Dark & Light Themes** — manual toggle or automatic system mode matching
- **Premium Aesthetics** — glassmorphism, smooth animations, and elegant micro-interactions
- **100% Offline** — Service Worker caches all assets for offline use

#### 🔒 Privacy & Data
- All data is stored locally in the browser's `localStorage` — no servers, no databases, absolute privacy
- **Export / Import** — save backups to JSON files and restore them on other devices

---

### 📱 How to Install on Your Phone

1. Open the app link in your smartphone's browser
2. **iOS (Safari)**: Tap "Share" → "Add to Screen"
3. **Android (Chrome)**: Tap menu `⋮` → "Install app" or "Add to home screen"

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

---

### 🧬 Tech Stack

| Technology | Role |
|---|---|
| HTML5 / CSS3 | Semantic markup, CSS Custom Properties, Grid & Flexbox |
| JavaScript ES6+ | Core application logic, DOM manipulation, LocalStorage, File API |
| SortableJS | Drag & Drop lists for mobile browsers |
| PWA (Manifest + SW) | Home screen installation, offline mode, Stale-While-Revalidate caching |

---

### 📁 Project Structure

```
ritual/
├── index.html          # Main HTML markup
├── manifest.json       # PWA manifest (app name, icons, colors)
├── sw.js               # Service Worker (offline cache management)
├── icon.png            # App icon
├── css/
│   └── app.css         # All styles: design system, themes, and layouts
└── js/
    └── app.js          # Core JS: state management, render engine, D&D
```
