# Vikokon — итоги сессии

**Дата:** 2025-07-17

## Что сделали

### 1. Импорт тестов из JSON («Загрузить пробник»)

Кнопка в админке принимает `.json` файл от нейронки (ChatGPT / Claude), которая конвертирует PDF-пробник ЕГЭ/ОГЭ в структурированный JSON.

**POST `/api/admin/tests/import`** — принимает JSON, маппит типы вопросов:

| answer_type из JSON | Тип в системе |
|---|---|
| `text`, `number` | `text_input` |
| `digit_pairs`, `matching` | `matching` |
| `digits_any_order` | `multiple_select` |
| `sequence`, `sequence_short` | `sequence` |
| нет `answer_type` (часть 2) | `open_response` |

Поддерживает оба формата JSON: старый (`title`, `questions`) и реальный от ChatGPT (`exam_title`, `part1`, `part2`, `prompt`).

Тест всегда создаётся как **черновик** (`is_draft = 1`). Если есть `image_note` — показывается жёлтая плашка «Нет картинки: ...» в редакторе вопроса. Нераспознанные типы возвращаются списком ошибок.

### 2. Тип вопроса `open_response` (развёрнутый ответ)

- `questions.type = 'open_response'`, поля `grading_criteria` (TEXT), `max_points` (INTEGER)
- Ученик вводит текст, отправляет — автопроверки нет
- `attempts.status = 'pending_review'` если в тесте есть хотя бы один `open_response`
- На экране прохождения — textarea + «Отправить» + отображение критериев
- В модалке деталей попытки — ответ ученика + «Ожидает ручной проверки»

### 3. Дублирование тестов и наборов карточек

Кнопка 📋 в списке тестов и наборов карточек. Создаёт полную копию (все вопросы/карточки, все поля) как черновик с названием «... (копия)».

- **POST `/api/admin/tests/:id/duplicate`**
- **POST `/api/admin/flashcard-sets/:id/duplicate`**

### 4. Исправления

- Добавлена обработка `open_response` в payload отправки ответов учеником (`App.jsx`)
- Добавлено `grading_criteria` в оба API-эндпоинта (студенческий и публичный)
- Добавлены защитные проверки от `undefined` в `handleFinish`
- Добавлена миграция БД: `image_note`, `grading_criteria`, `max_points`, `attempts.status`

## Изменённые файлы

### Бэкенд
- `server/db.js` — миграции для новых полей
- `server/routes/admin.js` — POST /tests/import, POST /tests/:id/duplicate, обновлённые INSERT/SELECT для новых полей
- `server/routes/tests.js` — обработка `open_response` при сдаче, `grading_criteria` в ответах
- `server/routes/flashcards.js` — POST /flashcard-sets/:id/duplicate

### Фронтенд
- `client/src/api.js` — `importTest`, `duplicateTest`, `duplicateCardSet`
- `client/src/App.jsx` — обработка `open_response` в payload, `grading_criteria` в данных квиза
- `client/src/screens/admin.jsx` — кнопки «Загрузить пробник», «📋 Дублировать», тип `open_response` в редакторах, `image_note` плашки
- `client/src/screens/quiz.jsx` — `open_response` UI (textarea + «Отправить»), `lockOpenResponse`
- `client/src/screens/tasks.jsx` — `grading_criteria` в данных квиза

## Промт для генерации JSON из PDF

См. конец обсуждения — полный промт для ChatGPT/Claude, который конвертирует PDF-пробник в совместимый JSON.