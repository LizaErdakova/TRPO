# FitFuel - Калькулятор КБЖУ

Веб-приложение для подсчета калорий и макронутриентов с возможностью ведения дневника питания.

## Архитектура проекта

### Структура проекта
```
fitfuel/
├── client/              # Frontend приложение на Vue.js
│   ├── src/
│   │   ├── components/  # Vue компоненты
│   │   ├── views/       # Страницы приложения
│   │   ├── router/      # Настройки маршрутизации
│   │   └── main.js      # Точка входа
│   └── package.json
│
└── server/              # Backend на Node.js + Express
    ├── src/
    │   ├── config/      # Конфигурация БД
    │   ├── controllers/ # Контроллеры
    │   ├── routes/      # Маршруты API
    │   ├── utils/       # Вспомогательные функции
    │   └── index.js     # Точка входа сервера
    └── package.json
```

### Взаимодействие компонентов

1. **Frontend (Vue.js)**
   - Компоненты используют Vue Router для навигации
   - Axios выполняет HTTP-запросы к backend API
   - JWT токены хранятся в localStorage для аутентификации
   - Защищенные маршруты требуют авторизации

2. **Backend (Express.js)**
   - REST API обрабатывает запросы от frontend
   - Использует JWT для аутентификации
   - Взаимодействует с MySQL для хранения данных
   - Валидирует входные данные через Joi

3. **База данных (MySQL)**
   - Хранит информацию о пользователях
   - Таблицы для продуктов и рецептов
   - Дневник питания пользователей

### API Endpoints

- POST `/api/auth/register` - Регистрация пользователя
- POST `/api/auth/login` - Аутентификация
- GET `/api/auth/users` - Получение списка пользователей

## Установка и настройка

### 1. Подготовка окружения

1. **Установите Node.js**
   - Скачайте и установите [Node.js](https://nodejs.org/) (версия 14 или выше)
   - Проверьте установку:
     ```bash
     node --version
     npm --version
     ```

2. **Установите MySQL**
   - Скачайте и установите [MySQL Community Server](https://dev.mysql.com/downloads/mysql/)
   - Или установите [XAMPP](https://www.apachefriends.org/) (включает MySQL)
   - Запомните пароль root пользователя при установке

3. **Установите VS Code** (рекомендуемая IDE)
   - Скачайте и установите [Visual Studio Code](https://code.visualstudio.com/)
   - Установите расширения:
     - Vue Language Features (Volar)
     - TypeScript Vue Plugin (Volar)
     - ESLint
     - Prettier

### 2. Настройка базы данных

1. **Запустите MySQL**
   - Если установлен XAMPP: запустите MySQL через Control Panel
   - Если установлен MySQL Server: убедитесь, что сервис запущен

2. **Создайте базу данных**
   ```sql
   CREATE DATABASE kbju_counter;
   ```

3. **Настройте подключение**
   - В папке server создайте файл .env:
     ```env
     PORT=3000
     DB_HOST=localhost
     DB_USER=root
     DB_PASSWORD=ваш_пароль_от_mysql
     DB_NAME=kbju_counter
     JWT_SECRET=ваш_секретный_ключ
     ```

### 3. Запуск проекта

1. **Клонируйте репозиторий**
   ```bash
   git clone [URL вашего репозитория]
   cd fitfuel
   ```

2. **Запуск сервера**
   ```bash
   cd server
   npm install
   npm run dev
   ```
   Сервер запустится на http://localhost:3000

3. **Запуск клиента** (в новом терминале)
   ```bash
   cd client
   npm install
   npm run serve
   ```
   Клиент запустится на http://localhost:8080

### 4. Проверка работоспособности

1. Откройте http://localhost:8080 в браузере
2. Проверьте регистрацию нового пользователя
3. Проверьте вход в систему
4. Список пользователей доступен по адресу http://localhost:3000/api/auth/users

## Устранение проблем

1. **Ошибка "EADDRINUSE: address already in use :::3000"**
   - Порт 3000 занят другим процессом
   - Выполните в терминале:
     ```bash
     # Windows
     netstat -ano | findstr :3000
     taskkill /PID номер_процесса /F
     ```

2. **Ошибка подключения к MySQL**
   - Проверьте, запущен ли MySQL сервер
   - Проверьте правильность учетных данных в .env
   - Убедитесь, что база данных создана

3. **Ошибки установки зависимостей**
   ```bash
   # Очистите кэш npm
   npm cache clean --force
   # Удалите node_modules и package-lock.json
   rm -rf node_modules package-lock.json
   # Установите зависимости заново
   npm install
   ```

## Разработка

### Структура базы данных

```sql
-- Пользователи
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  age INT,
  height INT,
  weight DECIMAL(5,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Остальные таблицы будут добавлены позже
```

### Безопасность
- Пароли хешируются с помощью bcrypt
- Используется JWT для аутентификации
- Валидация всех входных данных
- Защита от SQL-инъекций через подготовленные запросы

## Планы по развитию
- Добавление калькулятора КБЖУ
- Создание базы продуктов
- Ведение дневника питания
- Статистика и графики
- Рекомендации по питанию 