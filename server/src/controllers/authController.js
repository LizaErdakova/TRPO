const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const { registerSchema } = require('../utils/validation');

const register = async (req, res) => {
  try {
    const { name, email, password, age, height, weight } = req.body;

    // Преобразование числовых значений
    const userData = {
      name,
      email,
      password,
      age: Number(age),
      height: Number(height),
      weight: Number(weight)
    };

    // Валидация входных данных
    const { error } = registerSchema.validate(userData);
    if (error) {
      const field = error.details[0].path[0];
      return res.status(400).json({
        message: error.details[0].message,
        field
      });
    }

    // Проверка существования пользователя
    const [existingUsers] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({
        message: 'Пользователь с таким email уже существует',
        field: 'email'
      });
    }

    // Хеширование пароля
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Создание пользователя
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, age, height, weight) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, age, height, weight]
    );

    res.status(201).json({
      message: 'Пользователь успешно зарегистрирован',
      userId: result.insertId
    });
  } catch (error) {
    console.error('Ошибка при регистрации:', error);
    res.status(500).json({
      message: 'Ошибка при регистрации пользователя',
      field: 'email'
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Валидация входных данных
    if (!email || !password) {
      return res.status(400).json({
        message: 'Пожалуйста, заполните все поля',
        field: !email ? 'email' : 'password'
      });
    }

    // Поиск пользователя по email
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      return res.status(401).json({
        message: 'Неверный email или пароль',
        field: 'email'
      });
    }

    const user = users[0];

    // Проверка пароля
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({
        message: 'Неверный email или пароль',
        field: 'password'
      });
    }

    // Генерация JWT токена
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Ошибка при входе:', error);
    res.status(500).json({
      message: 'Ошибка при входе в систему',
      field: 'email'
    });
  }
};

const getUsers = async (req, res) => {
  try {
    const [users] = await pool.query('SELECT id, name, email FROM users');
    res.json(users);
  } catch (error) {
    console.error('Ошибка при получении пользователей:', error);
    res.status(500).json({ message: 'Ошибка при получении списка пользователей' });
  }
};

module.exports = {
  register,
  login,
  getUsers
}; 