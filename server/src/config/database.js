const mysql = require('mysql2/promise');
require('dotenv').config();

// Отладочный вывод
console.log('Переменные окружения:', {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD, // Прямой вывод пароля для отладки
  database: process.env.DB_NAME
});

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'kbju_counter',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Проверка подключения
pool.getConnection()
  .then(connection => {
    console.log('Успешное подключение к базе данных');
    connection.release();
  })
  .catch(err => {
    console.error('Ошибка подключения к базе данных:', err);
  });

// Создание таблицы users, если она не существует
const createUsersTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        age INT,
        gender VARCHAR(20),
        height INT,
        weight DECIMAL(5,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('Таблица users успешно создана или уже существует');
  } catch (error) {
    console.error('Ошибка при создании таблицы users:', error);
  }
};

// Создание таблицы calories, если она не существует
const createCaloriesTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS calories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        daily_calories INT NOT NULL,
        proteins INT NOT NULL,
        fats INT NOT NULL,
        carbs INT NOT NULL,
        goal VARCHAR(20) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('Таблица calories успешно создана или уже существует');
  } catch (error) {
    console.error('Ошибка при создании таблицы calories:', error);
  }
};

// Создание таблицы products, если она не существует, и заполнение тестовыми данными
const createProductsTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        calories INT NOT NULL,
        proteins INT NOT NULL,
        fats INT NOT NULL,
        carbs INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('Таблица products успешно создана или уже существует');
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM products');
    if (rows[0].count === 0) {
      console.log('Добавление тестовых продуктов');
      await pool.query(`
        INSERT INTO products (name, calories, proteins, fats, carbs) VALUES
        ('Apple', 52, 0.3, 0.2, 14),
        ('Banana', 96, 1.3, 0.3, 27),
        ('Chicken Breast', 165, 31, 3.6, 0),
        ('Almonds', 579, 21, 50, 22),
        ('Broccoli', 55, 3.7, 0.6, 11)
      `);
    }
  } catch (error) {
    console.error('Ошибка при создании таблицы products:', error);
  }
};

// Инициализация базы данных
const initDatabase = async () => {
  await createUsersTable();
  await createCaloriesTable();
  await createProductsTable();
};

initDatabase();

module.exports = pool; 