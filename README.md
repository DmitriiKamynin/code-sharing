# Code Sharing App - Монорепозиторий

Монорепозиторий для приложения совместного редактирования кода в реальном времени.

## Структура проекта

```
.
├── packages/
│   ├── backend/      # NestJS backend приложение
│   └── frontend/     # React frontend приложение
├── package.json      # Корневой package.json с workspaces
└── README.md
```

## Требования

- Node.js >= 18.0.0
- npm >= 9.0.0

## Установка

Установите все зависимости для всех пакетов:

```bash
npm install
```

Это установит зависимости для корневого проекта и всех workspace пакетов.

## Разработка

### Запуск всех сервисов одновременно

```bash
npm run dev
```

Это запустит:
- Backend на `http://localhost:3001`
- Frontend на `http://localhost:3000`

### Запуск отдельных сервисов

```bash
# Только backend
npm run dev:backend

# Только frontend
npm run dev:frontend
```

## Сборка

### Сборка всех пакетов

```bash
npm run build
```

### Сборка отдельных пакетов

```bash
# Backend
npm run build:backend

# Frontend
npm run build:frontend
```

## Production

### Запуск backend в production режиме

```bash
npm run start:backend
```

### Запуск frontend в production режиме

```bash
npm run start:frontend
```

## Другие команды

```bash
# Линтинг всех пакетов
npm run lint

# Тестирование всех пакетов
npm run test

# Очистка всех node_modules и build артефактов
npm run clean
```

## Пакеты

### @code-sharing/backend

NestJS приложение с WebSocket поддержкой для синхронизации кода в реальном времени.

**Порт:** 3001

### @code-sharing/frontend

React приложение с Monaco Editor для совместного редактирования кода.

**Порт:** 3000

## Технологии

- **Backend:** NestJS, TypeScript, Socket.IO
- **Frontend:** React, Monaco Editor, Socket.IO Client
