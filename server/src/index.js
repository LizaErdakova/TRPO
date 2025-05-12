const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Загрузка переменных окружения с указанием пути к .env файлу
dotenv.config({ path: path.join(__dirname, '../.env') });

// Проверка загрузки важных переменных окружения
console.log('Проверка переменных окружения:');
console.log('PORT:', process.env.PORT);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('JWT_SECRET (установлен):', Boolean(process.env.JWT_SECRET));

const app = express();

// Настройка CORS для разрешения запросов только с нашего клиента
const corsOptions = {
  origin: ['http://localhost:8080', 'http://localhost:5173'], // Для Vue приложения
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Логирование запросов
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Маршруты
app.use('/api/auth', require('./routes/auth'));
app.use('/api/calories', require('./routes/calories'));
app.use('/api/users', require('./routes/users'));
app.use('/api/products', require('./routes/products'));
app.use('/api/meals', require('./routes/meals'));
app.use('/api/water', require('./routes/water'));

// Проверка API
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error('Ошибка сервера:', err.message);
  console.error('Стек ошибки:', err.stack);
  
  let statusCode = err.statusCode || 500;
  let errorMessage = err.message || 'Что-то пошло не так!';
  
  // Обработка ошибок MySQL
  if (err.code && (err.code.startsWith('ER_') || err.errno)) {
    console.error('Ошибка базы данных:', err.code, err.errno);
    errorMessage = 'Ошибка базы данных';
    statusCode = 500;
  }
  
  res.status(statusCode).json({ 
    message: errorMessage,
    path: req.path,
    timestamp: new Date()
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
  console.log(`Доступен по адресу: http://localhost:${PORT}`);
}); 