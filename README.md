# Живая клетка — платформа для тестирования по биологии

Веб-приложение для репетитора по биологии: ученики проходят тесты и учат карточки, репетитор создаёт задания, управляет учениками и смотрит результаты. Встроена геймификация — ученики выращивают растения за регулярные занятия.

## Стек

| Слой | Технологии |
|---|---|
| Frontend | React 18, React Router v6, Vite, Lenis (плавная прокрутка) |
| Backend | Node.js 22+, Express 4, express-session + session-file-store |
| База данных | SQLite (встроенный `node:sqlite`) |
| Стили | CSS-переменные, шрифты Fraunces + Manrope |

## Структура проекта

```
Quiz2/
├── client/                      # Фронтенд (Vite + React)
│   ├── src/
│   │   ├── screens/
│   │   │   ├── landing.jsx      # Лендинг с публичными тестами и карточками
│   │   │   ├── login.jsx        # Экран входа по коду
│   │   │   ├── dashboard.jsx    # Дашборд ученика со списком тестов
│   │   │   ├── quiz.jsx         # Прохождение теста + экран результата
│   │   │   ├── flashcards.jsx   # Обучение по карточкам
│   │   │   ├── tasks.jsx        # Страница заданий
│   │   │   ├── admin.jsx        # Панель репетитора
│   │   │   ├── privacy.jsx      # Политика конфиденциальности
│   │   │   └── cookie.jsx       # Политика cookies
│   │   ├── components/
│   │   │   ├── ErrorBoundary.jsx
│   │   │   ├── PlantSVG.jsx     # SVG-анимации растений
│   │   │   └── PlantWidget.jsx  # Виджет полива растения
│   │   ├── App.jsx              # Роутинг + AuthContext
│   │   ├── api.js               # fetch-обёртки для всех эндпоинтов
│   │   ├── botanical.jsx        # SVG-иллюстрации (листья, папоротники, клетки)
│   │   ├── tokens.css           # Дизайн-система: цвета, шрифты, отступы
│   │   ├── components.css       # Компоненты: .btn .card .input .answer и др.
│   │   ├── responsive.css       # Адаптивные стили
│   │   └── main.jsx             # Точка входа
│   ├── index.html
│   └── vite.config.js           # proxy /api → localhost:3001
│
├── server/                      # Бэкенд (Express)
│   ├── db.js                    # SQLite схема, миграции, seed-данные
│   ├── index.js                 # Express + сессии + rate-limit + cleanup
│   ├── utils/
│   │   ├── logger.js            # Логирование запросов
│   │   └── validate.js          # Валидация данных
│   └── routes/
│       ├── auth.js              # Вход/выход/проверка сессии
│       ├── tests.js             # Тесты для учеников + попытки
│       ├── admin.js             # CRUD тестов, ученики, результаты, бэкап
│       ├── flashcards.js        # Карточки для учеников и админа
│       ├── plant.js             # Система растений (геймификация)
│       └── upload.js            # Загрузка изображений
│
├── shared/
│   └── constants.js             # Общие константы (разделы биологии, классы, экзамены)
│
├── data/                        # Данные (создаётся автоматически)
│   ├── biology.db               # База данных SQLite
│   ├── sessions/                # Файлы сессий
│   └── uploads/                 # Загруженные изображения
│       ├── questions/
│       └── flashcards/
│
└── package.json                 # npm workspaces
```

## Быстрый старт

```bash
# 1. Установить зависимости
npm install

# 2. Запустить сервер + клиент одновременно
npm run dev
```

- Клиент: http://localhost:5173
- Сервер: http://localhost:3001

> Требуется **Node.js 22.5+** (использует встроенный `node:sqlite`)

## Роли и доступ

| Вход | Роль | Доступ |
|---|---|---|
| Код `admin` + пароль | Репетитор | Полная панель управления |
| 8-значный код ученика | Ученик | Тесты, карточки, выращивание растений |

Пароль администратора задаётся в `.env` через `ADMIN_PASSWORD` (по умолчанию `changeme`).

## Типы вопросов

| Тип | Описание |
|---|---|
| `single` | Один правильный ответ из предложенных |
| `multiple_select` | Несколько правильных ответов |
| `text_input` | Ввод текста (точное совпадение) |
| `matching` | Соответствие пар (drag-and-drop) |
| `fill_blanks` | Заполнение пропусков |
| `sequence` | Выстраивание порядка |

## Геймификация: система растений

Ученики выращивают растения, заходя на платформу каждый день. Один полив = 1 очко в день. Растение проходит 6 стадий роста (0–5). Когда растение вырастает, его можно забрать в коллекцию и начать выращивать следующее.

Доступные растения: подсолнух, роза, кактус, папоротник, орхидея, тюльпан, бамбук, лаванда, суккулент, ромашка.

## База данных

Схема включает таблицы:

| Таблица | Назначение |
|---|---|
| `users` | Пользователи (админы и ученики с кодами) |
| `tests` | Тесты (с категорией, классом, разделом) |
| `questions` | Вопросы к тестам |
| `answers` | Варианты ответов |
| `attempts` | Попытки прохождения |
| `attempt_answers` | Ответы ученика в попытке |
| `test_assignments` | Назначение тестов ученикам |
| `flashcard_sets` | Наборы карточек |
| `flashcard_cards` | Карточки (термин + определение + изображение) |
| `flashcard_set_assignments` | Назначение наборов ученикам |
| `sections` | Разделы биологии |
| `topics` | Темы |
| `plant_progress` | Прогресс растения ученика |
| `plant_collection` | Коллекция выращенных растений |

## API

### Auth
```
POST /api/auth/login         { code, password? }  → { user }
POST /api/auth/logout
GET  /api/auth/me                                    → { user } | 401
```

### Тесты (ученики)
```
GET  /api/tests/public                                 → публичный список тестов
GET  /api/tests/public/:id                             → публичный тест
GET  /api/tests                                        → список тестов со статусом
GET  /api/tests/:id                                    → тест с вопросами
POST /api/attempts              { test_id }             → { attempt_id }
POST /api/attempts/:id/submit   { answers }             → { score, max_score }
```

### Карточки (ученики)
```
GET  /api/flashcard-sets/public                 → публичные наборы
GET  /api/flashcard-sets/public/:id             → публичный набор с карточками
GET  /api/flashcard-sets                        → наборы ученика
GET  /api/flashcard-sets/:id                    → набор с карточками
```

### Растения
```
GET  /api/plant                                 → состояние растения
POST /api/plant/water                           → полить (1 раз/день)
POST /api/plant/collect                         → забрать в коллекцию
```

### Загрузка
```
POST /api/upload            { data, folder? }   → { url }
```

### Админ
```
GET    /api/admin/tests                                → список тестов с статистикой
GET    /api/admin/tests/:id                            → тест с вопросами
POST   /api/admin/tests                                → создать тест
PUT    /api/admin/tests/:id                            → обновить тест
DELETE /api/admin/tests/:id                            → удалить тест
PATCH  /api/admin/tests/:id/toggle                     → скрыть/показать
PATCH  /api/admin/tests/:id/publish                    → опубликовать черновик

GET    /api/admin/students                             → список учеников
GET    /api/admin/students/:id                         → данные ученика + назначения
POST   /api/admin/students                             → добавить ученика
DELETE /api/admin/students/:id                         → удалить ученика
POST   /api/admin/students/:id/assign                  → назначить тест
DELETE /api/admin/students/:id/assign/:testId          → снять назначение

GET    /api/admin/students/:id/card-sets               → назначения карточек
POST   /api/admin/students/:id/card-sets               → назначить набор
DELETE /api/admin/students/:id/card-sets/:setId        → снять назначение

GET    /api/admin/results                              → все результаты
DELETE /api/admin/results/:id                          → удалить результат
DELETE /api/admin/results                              → удалить все ({ confirm: "DELETE_ALL" })

GET    /api/admin/flashcard-sets                       → все наборы
POST   /api/admin/flashcard-sets                       → создать набор
PUT    /api/admin/flashcard-sets/:id                   → обновить набор
DELETE /api/admin/flashcard-sets/:id                   → удалить набор
PATCH  /api/admin/flashcard-sets/:id/toggle            → скрыть/показать

GET    /api/admin/sections                             → CRUD разделов
GET    /api/admin/topics                               → CRUD тем

GET    /api/admin/backup                               → скачать бэкап (.zip)
POST   /api/admin/restore                              → восстановить из бэкапа
```

## Переменные окружения

Создайте файл `.env` в корне проекта:

```env
SESSION_SECRET=ваш-секрет
ADMIN_PASSWORD=ваш-пароль
PORT=3001
```

## Дизайн-система

Вдохновлена ботаническими гравюрами и старыми учебниками.

- **Цвет**: зелёная палитра (`--green-800: #2d6a4f`) + тёплый пергамент
- **Шрифты**: Fraunces (заголовки) + Manrope (текст)
- **Темы**: `light` / `sepia` / `dark` через `data-theme` на `<html>`
- **Акцент**: `amber` / `coral` / `ochre` через `data-accent`
