const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    // Получаем токен из заголовка запроса
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'Отсутствует токен авторизации' });
    }

    // Формат: "Bearer TOKEN"
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Неверный формат токена' });
    }

    // Проверяем токен
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Ошибка аутентификации:', error);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Срок действия токена истек' });
    }
    res.status(401).json({ message: 'Ошибка аутентификации' });
  }
}; 