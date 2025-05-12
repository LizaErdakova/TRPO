const pool = require('./src/config/database');

async function checkDatabase() {
  try {
    console.log('Проверка структуры базы данных:');
    
    // Проверка таблицы продуктов
    console.log('\n--- Таблица products ---');
    const [products] = await pool.query('SELECT * FROM products');
    console.log(`Найдено ${products.length} продуктов:`);
    console.log(products);
    
    // Проверка таблицы пользователей
    console.log('\n--- Таблица users ---');
    const [users] = await pool.query('SELECT id, name, email FROM users');
    console.log(`Найдено ${users.length} пользователей:`);
    console.log(users);
    
    // Проверка структуры таблицы meals
    console.log('\n--- Структура таблицы meals ---');
    const [mealsStruct] = await pool.query('DESCRIBE meals');
    console.log(mealsStruct);
    
    // Проверка содержимого таблицы meals
    console.log('\n--- Содержимое таблицы meals ---');
    const [meals] = await pool.query('SELECT * FROM meals LIMIT 10');
    console.log(`Найдено записей: ${meals.length}`);
    console.log(meals);
    
    // Проверка внешних ключей
    console.log('\n--- Внешние ключи таблицы meals ---');
    const [mealsForeignKeys] = await pool.query(`
      SELECT TABLE_NAME, COLUMN_NAME, CONSTRAINT_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE REFERENCED_TABLE_NAME IS NOT NULL AND TABLE_NAME = 'meals'
    `);
    console.log(mealsForeignKeys);
    
    // Проверка структуры таблицы water_tracker
    console.log('\n--- Структура таблицы water_tracker ---');
    const [waterStruct] = await pool.query('DESCRIBE water_tracker');
    console.log(waterStruct);
    
    // Проверка содержимого таблицы water_tracker
    console.log('\n--- Содержимое таблицы water_tracker ---');
    const [water] = await pool.query('SELECT * FROM water_tracker LIMIT 10');
    console.log(`Найдено записей: ${water.length}`);
    console.log(water);
  } catch (error) {
    console.error('Ошибка при проверке базы данных:', error);
  } finally {
    // Закрываем подключение и завершаем программу
    process.exit();
  }
}

// Запуск проверки
checkDatabase(); 