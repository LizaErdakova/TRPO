const mysql = require('mysql2/promise');
require('dotenv').config();

async function initializeDatabase() {
  // Шаг 1: Создание соединения без указания базы данных
  const rootConnection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1234',
  });

  console.log('Подключение к MySQL успешно установлено');

  try {
    // Шаг 2: Создание базы данных, если она не существует
    console.log(`Создание базы данных ${process.env.DB_NAME || 'kbju_counter'}...`);
    await rootConnection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'kbju_counter'}`);
    console.log('База данных успешно создана или уже существует');

    // Шаг 3: Подключение к созданной базе данных
    await rootConnection.query(`USE ${process.env.DB_NAME || 'kbju_counter'}`);

    // Шаг 4: Создание таблицы users
    console.log('Создание таблицы users...');
    await rootConnection.query(`
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

    // Шаг 5: Создание таблицы calories
    console.log('Создание таблицы calories...');
    await rootConnection.query(`
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
    
    console.log('Инициализация базы данных успешно завершена');
  } catch (error) {
    console.error('Ошибка при инициализации базы данных:', error);
  } finally {
    await rootConnection.end();
    process.exit(0);
  }
}

// Запуск инициализации
initializeDatabase(); 