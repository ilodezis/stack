# ✨ Ritual

<p align="center">
  <img src="icon.png" alt="Ritual Logo" width="128" height="128" />
</p>

<h3 align="center">Ritual 2.1</h3>

<p align="center">
  Быстрое, приватное и полностью офлайн-приложение для отслеживания ежедневных ритуалов:<br>
  витамины, добавки и уход за кожей в одном месте.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/vanilla-JS-f7df1e.svg?style=flat-square&logo=javascript&logoColor=black" alt="Vanilla JS" />
  <img src="https://img.shields.io/badge/PWA-supported-00c0f0.svg?style=flat-square&logo=progressive-web-apps&logoColor=white" alt="PWA" />
  <img src="https://img.shields.io/badge/Offline--first-enabled-4caf50.svg?style=flat-square" alt="Offline-First" />
  <img src="https://img.shields.io/badge/License-MIT-green.svg?style=flat-square" alt="License" />
  <img src="https://img.shields.io/badge/Build-not--required-orange.svg?style=flat-square" alt="No Build Required" />
</p>

---

## 🌐 Языки / Languages

- [Русский](#-русский)
- [English](#-english)

---

## 🇷🇺 Русский

**Ritual** — это минималистичное PWA-приложение для контроля ежедневных привычек, приёма витаминов и уходовой косметики.

Никакой регистрации, серверов и облаков — все данные хранятся только на вашем устройстве в `localStorage`.

### 🎯 Философия: Приватность прежде всего
* 🔒 **Без регистрации** — никаких аккаунтов, email или телефонов
* ☁️ **Без серверов** — данные никогда не покидают устройство
* 📦 **Полный контроль** — экспорт и импорт данных в один клик
* 🔐 **XSS-защита** — весь пользовательский ввод экранируется

---

### 📋 Содержание
1. [Возможности](#-возможности)
2. [Модульные настройки](#%EF%B8%8F-модульные-настройки)
3. [Установка PWA](#-установка-pwa)
4. [Быстрый старт](#-локальный-запуск)
5. [Структура](#-структура-проекта)
6. [Тесты](#-тестирование)
7. [Безопасность](#-безопасность)
8. [Лицензия](#-лицензия)

---

### ✨ Возможности

#### 💊 Трекер добавок
* **Блоки по времени** — «Утро», «День», «Вечер», «Ночь» или свои собственные
* **Кастомизация** — emoji, названия, цветовые темы для каждого блока
* **Прогресс-бар** — визуальный процент выполнения на день
* **Кнопка «✓ Все»** — отметить весь блок сразу
* **Авто-сброс** — новый день = новые галочки

#### 🧴 Уход за кожей
* **Утро / Вечер** — раздельные списки средств
* **3 типа расписания**:
  - Ежедневно
  - По дням недели (Пн, Ср, Пт)
  - N раз в неделю
* **Контроль сроков** — PAO (после открытия) и EXP (срок годности)
* **Статусы**: `⚠️ Просрочено`, `⏳ Истекает через N дней`, `✓ Свежий`

#### ⚙️ Модульные настройки

Всё выключено по умолчанию. Включайте только нужное:

| Функция | Описание |
|---------|----------|
| **Отметка о приёме** | Чекбоксы и прогресс-бар на сегодня |
| **Раздел «Уход»** | Вкладка для уходовых средств |
| **Расписание добавок** | Приём по конкретным дням недели |
| **Учёт запасов** | Списание капсул и предупреждения |
| **Сроки косметики** | Контроль PAO и EXP |

---

### 📱 Установка PWA

#### iOS (Safari)
1. Откройте сайт в Safari
2. Нажмите **«Поделиться»** (квадрат со стрелкой ↑)
3. Выберите **«На экран "Домой"»**

#### Android (Chrome)
1. Откройте сайт в Chrome
2. Нажмите **⋮** → **«Установить приложение»**
3. Или **«Добавить на главный экран»**

#### Важно: Обновление PWA
Приложение использует **гибридную стратегию кэширования**:
- HTML загружается из сети (всегда свежая версия)
- CSS/JS кэшируются с фоновым обновлением

Если вы не видите изменений после обновления:
1. Откройте приложение в браузере (не через иконку)
2. Обновите с очисткой кэша (Cmd+Shift+R / Ctrl+Shift+R)
3. Удалите старую иконку PWA и добавьте заново

---

### 💻 Локальный запуск

Никаких сборщиков — только статические файлы:

```bash
# Python 3
python3 -m http.server 8000

# Node.js
npx serve .

# PHP
php -S localhost:8000
```

Откройте `http://localhost:8000` в браузере.

---

### 📁 Структура проекта

```
ritual/
├── index.html          # Разметка, модальные окна, настройки
├── manifest.json       # PWA-манифест (иконки, цвета, start_url)
├── sw.js               # Service Worker (гибридное кэширование)
├── icon.png            # Иконка приложения (180×180)
├── css/
│   └── app.css         # Стили: CSS-переменные, тёмная тема, адаптив
├── js/
│   └── app.js          # Логика: состояние, рендеринг, события
└── tests/
    └── test_ritual.py  # E2E-тесты (pytest + Selenium)
```

---

### 🧪 Тестирование

```bash
# Установка зависимостей
pip install pytest selenium

# Запуск всех тестов
python3 -m pytest tests/test_ritual.py -v

# Один тест по имени
python3 -m pytest tests/test_ritual.py::test_onboarding_and_basic_setup -v
```

**Что тестируется:**
- Онбординг и создание первого блока
- Расписание добавок и учёт запасов
- Сроки годности косметики
- Feature flags (выключены по умолчанию)

---

### 🔒 Безопасность

#### XSS-защита
Весь пользовательский ввод экранируется перед вставкой в DOM:

```javascript
function escapeHTML(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
```

**Защищены:**
- Названия блоков и добавок
- Дозировки и условия приёма
- Названия уходовых средств

#### Бэкап данных
Перед каждым импортом автоматически создаётся резервная копия в `localStorage`.

**Восстановление:**
Настройки → «Восстановление из бэкапа» → «Восстановить»

---

### 📄 Лицензия

**MIT License** — используйте свободно.

---

## 🇺🇸 English

**Ritual** is a lightweight PWA for tracking daily supplements and skincare routines.

No registration, no servers, no cloud — all data stays on your device in `localStorage`.

### 🎯 Philosophy: Privacy First
* 🔒 **Zero registration** — no accounts, emails, or phone numbers
* ☁️ **No servers** — data never leaves your device
* 📦 **Full control** — one-click export/import
* 🔐 **XSS protection** — all user input is escaped

---

### 📋 Table of Contents
1. [Features](#-features)
2. [Modular Options](#%EF%B8%8F-modular-options)
3. [PWA Installation](#-pwa-installation)
4. [Quick Start](#-local-development)
5. [Structure](#-project-structure)
6. [Testing](#-testing)
7. [Security](#-security)
8. [License](#-license)

---

### ✨ Features

#### 💊 Supplement Tracker
* **Time-based blocks** — "Morning", "Afternoon", "Evening", "Night" or custom
* **Customization** — emoji, names, color themes per block
* **Progress bar** — visual daily completion percentage
* **"✓ All" button** — mark entire block at once
* **Auto-reset** — new day = fresh checkboxes

#### 🧴 Skincare
* **Morning / Evening** — separate lists
* **3 schedule types**:
  - Daily
  - Specific days (Mon, Wed, Fri)
  - N times per week
* **Expiration control** — PAO (after opening) and EXP (expiry date)
* **Status badges**: `⚠️ Expired`, `⏳ Expires in N days`, `✓ Fresh`

#### ⚙️ Modular Options

Everything is OFF by default. Enable only what you need:

| Feature | Description |
|---------|-------------|
| **Daily tracking** | Checkboxes and progress bar |
| **Skincare tab** | Dedicated skincare screen |
| **Supplement scheduling** | Specific days of week |
| **Stock counter** | Pill tracking and low-stock warnings |
| **Expiration dates** | PAO and EXP tracking |

---

### 📱 PWA Installation

#### iOS (Safari)
1. Open in Safari
2. Tap **Share** (square with ↑)
3. Select **"Add to Home Screen"**

#### Android (Chrome)
1. Open in Chrome
2. Tap **⋮** → **"Install app"**
3. Or **"Add to home screen"**

#### Important: PWA Updates
The app uses **hybrid caching strategy**:
- HTML loads from network (always fresh)
- CSS/JS cached with background updates

If you don't see changes after update:
1. Open app in browser (not via icon)
2. Hard refresh (Cmd+Shift+R / Ctrl+Shift+R)
3. Remove old PWA icon and add again

---

### 💻 Local Development

No build tools — just static files:

```bash
# Python 3
python3 -m http.server 8000

# Node.js
npx serve .

# PHP
php -S localhost:8000
```

Open `http://localhost:8000` in your browser.

---

### 📁 Project Structure

```
ritual/
├── index.html          # HTML structure, modals, settings
├── manifest.json       # PWA manifest (icons, colors, start_url)
├── sw.js               # Service Worker (hybrid caching)
├── icon.png            # App icon (180×180)
├── css/
│   └── app.css         # Styles: CSS vars, dark mode, responsive
├── js/
│   └── app.js          # Logic: state, rendering, events
└── tests/
    └── test_ritual.py  # E2E tests (pytest + Selenium)
```

---

### 🧪 Testing

```bash
# Install dependencies
pip install pytest selenium

# Run all tests
python3 -m pytest tests/test_ritual.py -v

# Single test by name
python3 -m pytest tests/test_ritual.py::test_onboarding_and_basic_setup -v
```

**Test coverage:**
- Onboarding and first block creation
- Supplement scheduling and stock tracking
- Skincare expiration dates
- Feature flags (disabled by default)

---

### 🔒 Security

#### XSS Protection
All user input is escaped before DOM insertion:

```javascript
function escapeHTML(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
```

**Protected fields:**
- Block and supplement names
- Dosage and conditions
- Skincare product names

#### Data Backup
Automatic backup before every import to `localStorage`.

**Restore:**
Settings → "Restore from backup" → "Restore"

---

### 📄 License

**MIT License** — use freely.

---

<p align="center">
  <sub>Разработано с заботой о здоровье 🌱</sub>
</p>
