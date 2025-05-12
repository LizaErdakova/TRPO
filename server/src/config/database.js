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
        proteins DECIMAL(5,2) NOT NULL,
        fats DECIMAL(5,2) NOT NULL,
        carbs DECIMAL(5,2) NOT NULL,
        user_id INT NULL,
        is_public BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_products_name (name),
        INDEX idx_products_user_public (user_id, is_public)
      )
    `);
    console.log('Таблица products успешно создана или уже существует');
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM products');
    if (rows[0].count === 0) {
      console.log('Добавление продуктов в базу данных');
      await pool.query(`
        INSERT INTO products (name, calories, proteins, fats, carbs, is_public, user_id) VALUES
        ('Яблоко', 52, 0.3, 0.2, 14, TRUE, NULL),
        ('Банан', 96, 1.3, 0.3, 27, TRUE, NULL),
        ('Куриная грудка', 165, 31, 3.6, 0, TRUE, NULL),
        ('Миндаль', 579, 21, 50, 22, TRUE, NULL),
        ('Брокколи', 55, 3.7, 0.6, 11, TRUE, NULL),
        ('Картофель', 77, 2.0, 0.1, 17, TRUE, NULL),
        ('Говядина', 250, 26.0, 17.0, 0, TRUE, NULL),
        ('Творог 5%', 121, 18.0, 5.0, 3.0, TRUE, NULL),
        ('Гречка', 343, 12.6, 3.3, 68.0, TRUE, NULL),
        ('Овсянка', 352, 12.3, 6.1, 65.7, TRUE, NULL),
        ('Молоко 3.2%', 60, 2.9, 3.2, 4.7, TRUE, NULL),
        ('Кефир 2.5%', 51, 3.0, 2.5, 4.0, TRUE, NULL),
        ('Яйцо куриное', 157, 12.7, 11.5, 0.7, TRUE, NULL),
        ('Лосось', 208, 20.0, 13.6, 0, TRUE, NULL),
        ('Рис белый', 344, 6.7, 0.7, 78.9, TRUE, NULL),
        ('Макароны', 337, 10.4, 1.1, 69.7, TRUE, NULL),
        ('Томаты', 20, 0.6, 0.2, 4.2, TRUE, NULL),
        ('Огурцы', 15, 0.8, 0.1, 3.0, TRUE, NULL),
        ('Морковь', 35, 1.3, 0.1, 6.9, TRUE, NULL),
        ('Свекла', 40, 1.5, 0.1, 8.8, TRUE, NULL),
        ('Апельсин', 47, 0.9, 0.2, 11.8, TRUE, NULL),
        ('Груша', 42, 0.4, 0.3, 10.3, TRUE, NULL),
        ('Авокадо', 160, 2.0, 14.7, 8.5, TRUE, NULL),
        ('Киви', 61, 1.1, 0.5, 14.7, TRUE, NULL),
        ('Сыр Российский', 363, 23.4, 30.0, 0, TRUE, NULL),
        ('Грецкий орех', 654, 15.2, 65.2, 7.0, TRUE, NULL),
        ('Фундук', 628, 15.0, 61.5, 9.3, TRUE, NULL),
        ('Кешью', 572, 18.5, 43.8, 30.2, TRUE, NULL),
        ('Мёд', 304, 0.8, 0, 81.5, TRUE, NULL),
        ('Хлеб ржаной', 214, 6.6, 1.2, 44.3, TRUE, NULL),
        ('Хлеб пшеничный', 265, 8.1, 1.0, 53.4, TRUE, NULL),
        ('Булгур', 342, 12.3, 1.3, 75.9, TRUE, NULL),
        ('Чечевица', 116, 9.0, 0.4, 20.1, TRUE, NULL),
        ('Фасоль', 123, 9.0, 0.5, 21.5, TRUE, NULL),
        ('Горох', 298, 23.0, 1.2, 53.3, TRUE, NULL),
        ('Тыква', 28, 1.0, 0.1, 7.7, TRUE, NULL),
        ('Баклажан', 24, 0.9, 0.1, 5.5, TRUE, NULL),
        ('Цветная капуста', 30, 2.5, 0.3, 5.2, TRUE, NULL),
        ('Шпинат', 22, 2.9, 0.3, 3.6, TRUE, NULL),
        ('Индейка', 196, 19.2, 13.2, 0, TRUE, NULL),
        ('Свинина', 242, 16.0, 19.4, 0, TRUE, NULL),
        ('Тунец', 144, 24.4, 4.6, 0, TRUE, NULL),
        ('Треска', 78, 17.7, 0.7, 0, TRUE, NULL),
        ('Креветки', 95, 20.1, 1.8, 0, TRUE, NULL),
        ('Йогурт натуральный', 60, 5.0, 2.0, 6.0, TRUE, NULL),
        ('Творожный сыр', 310, 7.0, 30.0, 3.0, TRUE, NULL),
        ('Сметана 20%', 204, 2.8, 20.0, 3.2, TRUE, NULL),
        ('Оливковое масло', 898, 0, 99.8, 0, TRUE, NULL),
        ('Арахисовая паста', 588, 25.0, 50.0, 20.0, TRUE, NULL),
        ('Шоколад горький', 539, 6.2, 35.3, 54.4, TRUE, NULL)
        ('Клубника', 32, 0.7, 0.3, 7.7, TRUE, NULL),
        ('Малина', 52, 1.2, 0.7, 11.9, TRUE, NULL),
        ('Черника', 57, 0.7, 0.3, 14.5, TRUE, NULL),
        ('Смородина черная', 44, 1.0, 0.4, 10.3, TRUE, NULL),
        ('Крыжовник', 43, 0.9, 0.2, 9.9, TRUE, NULL),
        ('Манго', 60, 0.8, 0.4, 14.9, TRUE, NULL),
        ('Ананас', 49, 0.5, 0.1, 12.6, TRUE, NULL),
        ('Папайя', 43, 0.5, 0.2, 10.8, TRUE, NULL),
        ('Гранат', 83, 1.7, 0.3, 18.7, TRUE, NULL),
        ('Курага', 241, 5.2, 0.3, 55.0, TRUE, NULL),
        ('Чернослив', 231, 2.3, 0.7, 57.5, TRUE, NULL),
        ('Изюм', 299, 3.1, 0.5, 71.2, TRUE, NULL),
        ('Финики', 277, 1.8, 0.2, 72.9, TRUE, NULL),
        ('Шампиньоны', 27, 2.9, 0.4, 3.3, TRUE, NULL),
        ('Белые грибы', 34, 3.7, 1.7, 3.7, TRUE, NULL),
        ('Вешенки', 38, 2.5, 0.4, 6.5, TRUE, NULL),
        ('Лисички', 19, 1.5, 0.5, 3.7, TRUE, NULL),
        ('Укроп', 40, 2.5, 0.5, 8.0, TRUE, NULL),
        ('Петрушка', 47, 3.7, 0.4, 9.0, TRUE, NULL),
        ('Базилик', 23, 3.2, 0.6, 2.7, TRUE, NULL),
        ('Кинза', 23, 2.1, 0.5, 4.0, TRUE, NULL),
        ('Руккола', 25, 2.6, 0.7, 3.7, TRUE, NULL),
        ('Колбаса вареная', 260, 12.0, 23.0, 0.1, TRUE, NULL),
        ('Ветчина', 270, 22.6, 19.5, 0.0, TRUE, NULL),
        ('Бекон', 500, 10.0, 52.0, 0.0, TRUE, NULL),
        ('Паштет печеночный', 308, 14.0, 28.0, 3.0, TRUE, NULL),
        ('Сельдь', 217, 17.7, 16.4, 0.0, TRUE, NULL),
        ('Скумбрия', 191, 18.0, 13.2, 0.0, TRUE, NULL),
        ('Икра красная', 249, 31.0, 13.5, 0.0, TRUE, NULL),
        ('Морская капуста', 49, 0.9, 0.2, 11.2, TRUE, NULL),
        ('Кукурузная крупа', 337, 8.3, 1.2, 75.0, TRUE, NULL),
        ('Перловая крупа', 324, 9.3, 1.1, 73.7, TRUE, NULL),
        ('Пшено', 348, 11.5, 3.3, 69.3, TRUE, NULL),
        ('Кускус', 376, 12.8, 0.6, 77.4, TRUE, NULL),
        ('Киноа', 368, 14.1, 6.1, 64.2, TRUE, NULL),
        ('Мармелад', 293, 0.4, 0.1, 73.0, TRUE, NULL),
        ('Зефир', 304, 0.8, 0.0, 78.5, TRUE, NULL),
        ('Пастила', 310, 0.5, 0.0, 80.4, TRUE, NULL),
        ('Печенье сахарное', 417, 7.5, 11.8, 74.9, TRUE, NULL),
        ('Конфеты шоколадные', 540, 4.3, 30.2, 65.3, TRUE, NULL),
        ('Кофе молотый', 0, 0.2, 0.0, 0.0, TRUE, NULL),
        ('Зеленый чай', 0, 0.0, 0.0, 0.0, TRUE, NULL),
        ('Какао-порошок', 289, 24.3, 15.0, 35.9, TRUE, NULL),
        ('Майонез', 629, 3.1, 67.0, 3.9, TRUE, NULL),
        ('Кетчуп', 93, 1.8, 0.2, 22.2, TRUE, NULL),
        ('Горчица', 162, 8.0, 10.2, 11.3, TRUE, NULL),
        ('Соевый соус', 60, 5.6, 0.1, 8.8, TRUE, NULL),
        ('Кунжут', 573, 19.4, 48.7, 23.4, TRUE, NULL),
        ('Семена льна', 534, 18.3, 42.2, 28.9, TRUE, NULL),
        ('Семена чиа', 486, 16.5, 30.7, 42.1, TRUE, NULL),
        ('Семечки подсолнечника', 578, 20.8, 52.9, 19.4, TRUE, NULL),
        ('Семечки тыквенные', 559, 30.2, 49.1, 10.7, TRUE, NULL),
        ('Мука пшеничная', 342, 10.8, 1.3, 73.6, TRUE, NULL),
        ('Мука ржаная', 325, 10.7, 1.7, 70.9, TRUE, NULL),
        ('Мука кукурузная', 331, 7.2, 1.5, 75.0, TRUE, NULL),
        ('Крахмал', 343, 0.1, 0.0, 85.6, TRUE, NULL),
        ('Сода пищевая', 0, 0.0, 0.0, 0.0, TRUE, NULL),
        ('Соль поваренная', 0, 0.0, 0.0, 0.0, TRUE, NULL),
        ('Перец черный молотый', 251, 10.4, 3.3, 63.9, TRUE, NULL),
        ('Сахар', 399, 0.0, 0.0, 99.7, TRUE, NULL),
        ('Халва', 516, 11.6, 29.7, 54.0, TRUE, NULL),
        ('Козинаки', 545, 13.6, 42.0, 38.5, TRUE, NULL),
        ('Сухари панировочные', 394, 11.2, 1.4, 81.4, TRUE, NULL),
        ('Корица', 247, 4.0, 1.2, 81.0, TRUE, NULL),
        ('Ваниль', 288, 0.1, 0.1, 12.7, TRUE, NULL),
        ('Имбирь', 80, 1.8, 0.8, 17.8, TRUE, NULL),
        ('Чеснок', 143, 6.8, 0.5, 33.1, TRUE, NULL),
        ('Хрен', 71, 3.2, 0.4, 16.3, TRUE, NULL),
        ('Квас', 27, 0.2, 0.0, 5.2, TRUE, NULL),
        ('Пиво светлое', 42, 0.3, 0.0, 4.6, TRUE, NULL),
        ('Вино красное сухое', 68, 0.1, 0.0, 0.3, TRUE, NULL),
        ('Творожный десерт', 155, 5.0, 10.0, 13.0, TRUE, NULL),
        ('Грейпфрут', 36, 0.9, 0.2, 8.7, TRUE, NULL),
        ('Кабачок', 24, 0.6, 0.3, 4.9, TRUE, NULL),
        ('Капуста белокочанная', 28, 1.8, 0.1, 5.4, TRUE, NULL),
        ('Тофу', 76, 8.1, 4.2, 1.9, TRUE, NULL),
        ('Соевое молоко', 32, 3.0, 1.0, 3.0, TRUE, NULL),
        ('Кумыс', 51, 2.1, 1.9, 5.0, TRUE, NULL),
        ('Масло сливочное', 748, 0.8, 82.5, 0.8, TRUE, NULL),
        ('Кокосовое масло', 892, 0.0, 99.1, 0.0, TRUE, NULL),
        ('Льняное масло', 898, 0.0, 99.8, 0.0, TRUE, NULL),
        ('Подсолнечное масло', 899, 0.0, 99.9, 0.0, TRUE, NULL),
        ('Кунжутное масло', 899, 0.0, 99.9, 0.0, TRUE, NULL),
        ('Сорго', 339, 10.6, 3.5, 74.6, TRUE, NULL),
        ('Батат', 86, 1.6, 0.1, 20.1, TRUE, NULL),
        ('Соевые бобы', 173, 16.6, 8.6, 10.9, TRUE, NULL),
        ('Маслины', 115, 0.8, 10.7, 6.9, TRUE, NULL)
      `);
      console.log('Продукты успешно добавлены');
    }
  } catch (error) {
    console.error('Ошибка при создании таблицы products:', error);
  }
};

// Создание таблицы meals для хранения приемов пищи
const createMealsTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS meals (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        product_id INT NOT NULL,
        quantity DECIMAL(7,2) NOT NULL,
        meal_type ENUM('breakfast', 'lunch', 'dinner', 'snack') NOT NULL,
        date DATE NOT NULL DEFAULT (CURRENT_DATE),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        INDEX idx_meals_user_date (user_id, date),
        INDEX idx_meals_type (meal_type)
      )
    `);
    console.log('Таблица meals успешно создана или уже существует');
  } catch (error) {
    console.error('Ошибка при создании таблицы meals:', error);
  }
};

// Создание таблицы water_tracker для отслеживания потребления воды
const createWaterTrackerTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS water_tracker (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        amount INT NOT NULL COMMENT 'Количество воды в мл',
        date DATE NOT NULL DEFAULT (CURRENT_DATE),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_water_user_date (user_id, date),
        UNIQUE KEY unique_user_date (user_id, date)
      )
    `);
    console.log('Таблица water_tracker успешно создана или уже существует');
  } catch (error) {
    console.error('Ошибка при создании таблицы water_tracker:', error);
  }
};

// Инициализация базы данных
const initDatabase = async () => {
  await createUsersTable();
  await createCaloriesTable();
  
  // Проверяем существование таблиц meals и water_tracker
  const [mealsTables] = await pool.query(`
    SELECT COUNT(*) as count FROM information_schema.tables 
    WHERE table_schema = ? AND table_name = 'meals'
  `, [process.env.DB_NAME || 'kbju_counter']);
  
  const hasMealsTable = mealsTables[0].count > 0;
  
  // Пересоздаем таблицу продуктов только если нет таблицы meals
  if (!hasMealsTable) {
    try {
      console.log('Попытка перезаписи таблицы products...');
      await pool.query('DROP TABLE IF EXISTS products');
      console.log('Таблица products успешно удалена. Создание новой таблицы...');
      await createProductsTable();
      console.log('Таблица products успешно пересоздана');
    } catch (error) {
      console.error('Ошибка при пересоздании таблицы products:', error);
      // Если не удалось пересоздать, пробуем обычное создание
      await createProductsTable();
    }
  } else {
    console.log('Таблица meals существует, пропускаем пересоздание таблицы products');
    await createProductsTable(); // Просто создаем таблицу, если она не существует
  }
  
  // Создаем новые таблицы для приемов пищи и трекера воды
  await createMealsTable();
  await createWaterTrackerTable();
};

initDatabase();

module.exports = pool; 