# ✨ Ritual

<p align="center">
  <img src="icon.png" alt="Ritual Logo" width="128" height="128" />
</p>

<h3 align="center">Ritual</h3>

<p align="center">
  A beautiful, private, and offline-first tracker for your daily health and self-care routines.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/vanilla-JS-f7df1e.svg?style=flat-square&logo=javascript&logoColor=black" alt="Vanilla JS" />
  <img src="https://img.shields.io/badge/PWA-supported-00c0f0.svg?style=flat-square&logo=progressive-web-apps&logoColor=white" alt="PWA" />
  <img src="https://img.shields.io/badge/Offline--First-enabled-4caf50.svg?style=flat-square" alt="Offline-First" />
  <img src="https://img.shields.io/badge/License-MIT-green.svg?style=flat-square" alt="License" />
  <img src="https://img.shields.io/badge/Build-not--required-orange.svg?style=flat-square" alt="No Build Required" />
</p>

---

## 🌐 Languages / Языки

- [Русский](#-русский)
- [English](#-english)

---

## 🇷🇺 Русский

**Ritual** — это быстрое, эстетичное и полностью приватное веб-приложение для контроля ежедневных привычек, приема витаминов и уходовой косметики.

Приложение спроектировано как **Progressive Web App (PWA)**: оно устанавливается прямо на экран вашего смартфона или компьютера, работает полностью автономно без интернета и мгновенно запускается.

### 🎯 Философия проекта: Приватность прежде всего
Мы считаем, что данные о вашем здоровье и ежедневной рутине должны принадлежать только вам. 
* 🔒 **Без регистрации и SMS**: Никаких аккаунтов, email или номеров телефона.
* ☁️ **Никаких серверов**: Ваши данные никогда не покинут устройство и хранятся исключительно в локальной памяти браузера (`localStorage`).
* 📦 **Полный контроль**: Вы можете в любой момент выгрузить резервную копию своих данных в один клик.

---

### 🗺️ Содержание
1. [Возможности приложения](#-возможности)
2. [Модульная архитектура](#%EF%B8%8F-модульная-настройка)
3. [Как установить на устройство](#-установка-pwa)
4. [Быстрый запуск для разработчиков](#-локальный-запуск)
5. [Структура проекта](#-структура-проекта)
6. [Тестирование](#-тестирование)
7. [Лицензия](#-лицензия)

---

### ✨ Возможности

#### 💊 Базовый трекер добавок
* **Дневные блоки** — группируйте витамины по времени приема: «Утро», «День», «Вечер» или создавайте свои кастомные группы.
* **Кастомизация** — выбирайте подходящие emoji, меняйте названия и цветовые темы блоков для быстрого ориентирования.
* **Интуитивный трекинг** — отмечайте приемы одним касанием, следите за процентом выполнения на стильном прогресс-баре и используйте кнопку «✓ Все» для быстрого завершения целого блока.
* **Умный автосброс** — приложение само понимает, когда наступил новый день, и плавно сбрасывает галочки прогресса.

#### ⚙️ Модульная настройка: Усложняйте только по желанию
Приложение по умолчанию запускается в минималистичном виде. Если вам нужен расширенный контроль, просто активируйте нужные тумблеры в **Настройках**:

* **🧴 Вкладка «Уход за кожей»** — открывает полноценный раздел для контроля утренних и вечерних косметических средств:
  * *Три типа расписания*: Ежедневно, по конкретным дням недели (например, только Пн, Ср, Пт) или фиксированное число раз в неделю (`N раз в неделю`).
  * *Удобное ведение*: Интерактивные пузырьки дней недели с галочками и прогресс-бары частоты использования.
* **📅 Расписание добавок по дням** — позволяет пить определенные витамины строго в выбранные дни. В обычные дни эти добавки скрываются с экрана, чтобы не перегружать вас лишней информацией.
* **📦 Учет запасов (Счетчик таблеток)** — автоматически списывает капсулы из банки при отметке приема. Когда запас подходит к критическому порогу (менее 10 шт. или на 5 дней приема), рядом с добавкой загорается предупреждающий оранжевый бейдж `⚠️ Осталось: N шт.`.
* **⏳ Контроль свежести косметики (EXP и PAO)** — следит за сроками годности кремов и сывороток по дате открытия (PAO) или абсолютному сроку годности (EXP), отображая понятные цветовые статусы (`⚠️ Просрочено`, `⏳ Истекает через N дней` или `✓ Свежий`).

---

### 📱 Установка (PWA)

Благодаря технологии Progressive Web App, Ritual работает как нативное приложение:

* **iOS (Safari)**:
  1. Откройте сайт приложения.
  2. Нажмите кнопку **«Поделиться»** (квадрат со стрелкой).
  3. Выберите **«На экран "Домой"»**.
* **Android (Chrome / Firefox)**:
  1. Откройте сайт приложения.
  2. В правом верхнем углу нажмите на меню `⋮`.
  3. Выберите **«Установить приложение»** или **«Добавить на главный экран»**.

Приложение появится на вашем рабочем столе с собственной иконкой и будет запускаться в полноэкранном режиме, скрывая адресную строку браузера.

---

### 💻 Локальный запуск

Ritual написан на чистом Vanilla HTML, CSS и JavaScript без использования сложных сборщиков (Webpack, Vite и др.). Для запуска на компьютере достаточно любого локального сервера:

```bash
# Вариант 1: С помощью встроенного модуля Python (если установлен Python)
python -m http.server 8000

# Вариант 2: С помощью Node.js (npx)
npx serve .
```

После этого откройте в браузере адрес `http://localhost:8000` (или `http://localhost:3000` при использовании `serve`).

---

### 📁 Структура проекта

```
ritual/
├── index.html          # Вся разметка приложения, модальные окна настроек и добавления
├── manifest.json       # PWA манифест конфигурации отображения на экране
├── sw.js               # Service Worker для кэширования статики и автообновления приложения
├── icon.png            # Брендовая иконка приложения
├── css/
│   └── app.css         # Стилистическая система: CSS Custom Properties, адаптивность и темы
├── js/
│   └── app.js          # Логика: управление состоянием, рендеринг, пересчет дат и Drag-and-Drop
└── tests/
    └── test_ritual.py  # Интеграционные тесты (pytest + Selenium) для проверки всех сценариев
```

---

### 🧪 Тестирование

Для гарантии стабильности в проекте написаны автоматические end-to-end тесты с использованием Selenium. Тесты имитируют реальные действия пользователя (клик по кнопкам, ввод данных, открытие настроек) в безголовом режиме Chrome.

**Запуск тестов:**
1. Установите зависимости тестирования:
   ```bash
   pip install pytest selenium
   ```
2. Запустите тесты:
   ```bash
   python -m pytest tests/
   ```

---

### 📄 Лицензия

Проект распространяется под свободной лицензией **MIT**. Вы можете свободно использовать, модифицировать и распространять этот код.

---

## 🇺🇸 English

**Ritual** is a fast, visually stunning, and completely private web application for tracking your daily habits, supplements, and skincare routines.

Built as a **Progressive Web App (PWA)**, it installs directly onto your phone or computer, operates fully offline, and launches instantly.

### 🎯 Core Philosophy: Absolute Privacy
We believe your personal wellness data should belong to you and only you.
* 🔒 **Zero Registration**: No accounts, emails, or phone numbers required.
* ☁️ **No Cloud Servers**: Your data never leaves your device; it is stored strictly in browser memory (`localStorage`).
* 📦 **Full Ownership**: Export your data into a JSON file at any time with a single click.

---

### 🗺️ Table of Contents
1. [Features](#-features)
2. [Modular Architecture](#%EF%B8%8F-modular-options)
3. [PWA Installation](#-pwa-installation)
4. [Local Development](#-local-development)
5. [Project Directory Structure](#-project-structure)
6. [Testing Guide](#-testing)
7. [License](#-license)

---

### ✨ Features

#### 💊 Core Supplement Tracker
* **Time-of-day Blocks** — organize supplements into clean sections like "Morning", "Afternoon", "Evening", or your own custom groups.
* **Customization** — choose relevant emojis, name your blocks, and pick color themes for clear visualization.
* **Intuitive Tracking** — check off items with a single tap, track daily progress via a smooth completion bar, and use "✓ All" to quickly finish a block.
* **Automated Reset** — the app automatically detects when a new day starts and resets your progress checkmarks.

#### ⚙️ Modular Options: Add Complexity Only When Needed
Ritual starts with a clean, distraction-free setup. When you need advanced tracking, activate the modules in **Settings**:

* **🧴 Skincare Tab** — unlocks a dedicated screen to manage your morning and evening skincare routines:
  * *Three Schedule Types*: Daily, specific days (e.g. Mon, Wed, Fri), or fixed weekly frequency (`N times a week`).
  * *Visual Progress*: Interactive day-bubbles with checkmarks and weekly progress indicators.
* **📅 Supplement Scheduling** — schedule supplements for specific days. Off-day items are hidden from the dashboard, keeping your daily list focused.
* **📦 Inventory Stock Counter** — decrements pill counts automatically as you log your intake. Triggers an orange warning badge `⚠️ Remaining: N` when stocks run low (under 10 pills or 5 days of dosage).
* **⏳ Expiration Control (EXP & PAO)** — monitors product shelf-life using open dates (PAO) or expiration dates (EXP), displaying status badges:
  * `⚠️ Expired` (red) — unsafe to use.
  * `⏳ Expires in N days` (yellow) — shows when there are fewer than 30 days left.
  * `✓ Fresh` (green) — product is fully safe.

---

### 📱 PWA Installation

Thanks to PWA technology, Ritual looks and feels like a native app:

* **iOS (Safari)**:
  1. Open the app URL.
  2. Tap the **Share** button.
  3. Select **"Add to Home Screen"**.
* **Android (Chrome / Firefox)**:
  1. Open the app URL.
  2. Tap the menu icon `⋮`.
  3. Select **"Install app"** or **"Add to home screen"**.

A beautiful **Ritual** icon will appear on your home screen, launching the application in fullscreen mode.

---

### 💻 Local Development

The project is lightweight and written in pure Vanilla HTML, CSS, and JS. No complicated bundlers or build steps needed. Spin up any static web server:

```bash
# Python
python -m http.server 8000

# Node.js
npx serve .
```

Open `http://localhost:8000` (or `http://localhost:3000` with `serve`) in your browser.

---

### 📁 Project Structure

```
ritual/
├── index.html          # Main HTML structure, styling references, and modals
├── manifest.json       # PWA configurations for launcher icons and colors
├── sw.js               # Service Worker for state caching and offline capability
├── icon.png            # High-resolution application icon
├── css/
│   └── app.css         # Styling system: fluid layouts, themes, responsive CSS Grid
├── js/
│   └── app.js          # Logic: modular toggles, state, date, and drag-and-drop engines
└── tests/
    └── test_ritual.py  # Automation tests (pytest + Selenium) for user actions
```

---

### 🧪 Testing

The repository includes integration tests written in Python using pytest and Selenium to test user scenarios in headless Chrome.

**How to run tests:**
1. Install testing packages:
   ```bash
   pip install pytest selenium
   ```
2. Run the test suite:
   ```bash
   python -m pytest tests/
   ```

---

### 📄 License

This project is licensed under the terms of the **MIT License**. Feel free to use, modify, and distribute the code as you wish.
