const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Загрузка переменных окружения с указанием пути к .env файлу
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Маршруты
app.use('/api/auth', require('./routes/auth'));
app.use('/api/calories', require('./routes/calories'));
app.use('/api/users', require('./routes/users'));
app.use('/api/products', require('./routes/products'));

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Что-то пошло не так!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
}); 