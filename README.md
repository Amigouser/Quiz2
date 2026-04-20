# Живая клетка — платформа для тестирования по биологии

Веб-приложение для репетитора по биологии: ученики проходят тесты, репетитор создаёт задания и смотрит результаты.

## Стек

| Слой | Технологии |
|---|---|
| Frontend | React 18, React Router v6, Vite |
| Backend | Node.js, Express, express-session |
| База данных | SQLite (встроенный `node:sqlite`, Node 22+) |
| Стили | CSS-переменные, шрифты Fraunces + Manrope |

## Структура проекта

```
Quiz2/
├── client/                  # Фронтенд (Vite + React)
│   ├── src/
│   │   ├── screens/
│   │   │   ├── login.jsx    # Экран входа
│   │   │   ├── dashboard.jsx # Дашборд ученика со списком тестов
│   │   │   ├── quiz.jsx     # Прохождение теста + экран результата
│   │   │   └── admin.jsx    # Панель репетитора
│   │   ├── App.jsx          # Роутинг + AuthContext
│   │   ├── api.js           # fetch-обёртки для всех эндпоинтов
│   │   ├── botanical.jsx    # SVG иллюстрации (листья, папоротники, клетки)
│   │   ├── tokens.css       # Дизайн-система: цвета, шрифты, отступы
│   │   └── components.css   # Компоненты: .btn .card .input .answer и др.
│   ├── index.html
│   └── vite.config.js       # proxy /api → localhost:3001
│
├── server/                  # Бэкенд (Express)
│   ├── db.js                # SQLite схема + seed данные
│   ├── index.js             # Express + сессии
│   └── routes/
│       ├── auth.js          # POST /login, GET /me, POST /logout
│       ├── tests.js         # GET /tests, GET /tests/:id, попытки
│       └── admin.js         # CRUD тестов, ученики, результаты
│
├── data/                    # База данных (создаётся автоматически)
│   └── biology.db
└── package.json             # npm workspaces
```

## Быстрый старт

```bash
# 1. Установить зависимости
npm run install:all

# 2. Запустить сервер + клиент одновременно
npm run dev
```

- Клиент: http://localhost:5173  
- Сервер: http://localhost:3001

> Требуется **Node.js 22.5+** (использует встроенный `node:sqlite`)

## Роли и доступ

| Имя при входе | Роль |
|---|---|
| `admin` | Репетитор — полный доступ к панели управления |
| Любое другое имя | Ученик — доступ к тестам |

Пароль не нужен — вход по имени.

## API

### Auth
```
POST /api/auth/login    { name }  → { user }
POST /api/auth/logout
GET  /api/auth/me                 → { user } | 401
```

### Тесты (для учеников)
```
GET  /api/tests           → список тестов со статусом прохождения
GET  /api/tests/:id       → тест с вопросами и ответами
POST /api/attempts        { test_id } → { attempt_id }
POST /api/attempts/:id/submit  { answers } → { score, max_score }
```

### Админ (только admin)
```
GET    /api/admin/tests
POST   /api/admin/tests
PUT    /api/admin/tests/:id
DELETE /api/admin/tests/:id
PATCH  /api/admin/tests/:id/toggle   — скрыть/показать
PATCH  /api/admin/tests/:id/publish  — опубликовать черновик
GET    /api/admin/students
GET    /api/admin/results
```

## Дизайн-система

Вдохновлена ботаническими гравюрами и старыми учебниками.

- **Цвет**: зелёная палитра (`--green-800: #2d6a4f`) + тёплый пергамент
- **Шрифты**: Fraunces (заголовки) + Manrope (текст)
- **Темы**: `light` / `sepia` / `dark` через `data-theme` на `<html>`
- **Акцент**: `amber` / `coral` / `ochre` через `data-accent`
