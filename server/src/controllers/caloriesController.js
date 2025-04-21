const Joi = require('joi');
const pool = require('../config/database');

// Схема валидации для расчета КБЖУ
const calculationSchema = Joi.object({
  gender: Joi.string().valid('male', 'female').required(),
  age: Joi.number().integer().min(12).max(100).required(),
  weight: Joi.number().min(30).max(300).required(),
  height: Joi.number().integer().min(100).max(250).required(),
  activity: Joi.number().valid(1.2, 1.375, 1.55, 1.725, 1.9).required(),
  goal: Joi.string().valid('lose', 'maintain', 'gain').required()
});

// Схема валидации для сохранения результатов
const saveSchema = Joi.object({
  dailyCalories: Joi.number().integer().min(500).max(10000).required(),
  proteins: Joi.number().integer().min(0).max(1000).required(),
  fats: Joi.number().integer().min(0).max(1000).required(),
  carbs: Joi.number().integer().min(0).max(1000).required(),
  goal: Joi.string().valid('lose', 'maintain', 'gain').required()
});

// Расчет КБЖУ
const calculateCalories = async (req, res) => {
  try {
    // Валидация входных данных
    const { error, value } = calculationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
        field: error.details[0].path[0]
      });
    }

    const { gender, age, weight, height, activity, goal } = value;

    // Расчет базового метаболизма (BMR) по формуле Миффлина-Сан Жеора
    let bmr = 0;
    if (gender === 'male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }
    
    // Умножаем на коэффициент активности
    let dailyCalories = bmr * activity;
    
    // Корректируем в зависимости от цели
    switch (goal) {
      case 'lose':
        // Дефицит 20% для похудения
        dailyCalories *= 0.8;
        break;
      case 'gain':
        // Профицит 15% для набора массы
        dailyCalories *= 1.15;
        break;
      // Для поддержания ничего не меняем
    }
    
    // Расчет БЖУ
    let proteinPercentage, fatPercentage, carbPercentage;
    
    switch (goal) {
      case 'lose':
        proteinPercentage = 0.35;
        fatPercentage = 0.20;
        carbPercentage = 0.45;
        break;
      case 'maintain':
        proteinPercentage = 0.30;
        fatPercentage = 0.30;
        carbPercentage = 0.40;
        break;
      case 'gain':
        proteinPercentage = 0.25;
        fatPercentage = 0.25;
        carbPercentage = 0.50;
        break;
    }
    
    // Расчет граммов БЖУ
    const proteins = Math.round((dailyCalories * proteinPercentage) / 4); // 4 калории в 1 г белка
    const fats = Math.round((dailyCalories * fatPercentage) / 9); // 9 калорий в 1 г жира
    const carbs = Math.round((dailyCalories * carbPercentage) / 4); // 4 калории в 1 г углеводов
    
    res.json({
      calories: Math.round(dailyCalories),
      proteins,
      fats,
      carbs,
      goal
    });
  } catch (error) {
    console.error('Ошибка при расчете КБЖУ:', error);
    res.status(500).json({ message: 'Ошибка при расчете КБЖУ' });
  }
};

// Сохранение результатов расчета
const saveCalculation = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Валидация входных данных
    const { error, value } = saveSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
        field: error.details[0].path[0]
      });
    }

    const { dailyCalories, proteins, fats, carbs, goal } = value;

    // Проверяем, есть ли уже запись для этого пользователя
    const [existingRecords] = await pool.query(
      'SELECT id FROM calories WHERE user_id = ?',
      [userId]
    );

    if (existingRecords.length > 0) {
      // Обновляем существующую запись
      await pool.query(
        'UPDATE calories SET daily_calories = ?, proteins = ?, fats = ?, carbs = ?, goal = ? WHERE user_id = ?',
        [dailyCalories, proteins, fats, carbs, goal, userId]
      );
    } else {
      // Создаем новую запись
      await pool.query(
        'INSERT INTO calories (user_id, daily_calories, proteins, fats, carbs, goal) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, dailyCalories, proteins, fats, carbs, goal]
      );
    }

    res.status(201).json({ message: 'Расчет КБЖУ успешно сохранен' });
  } catch (error) {
    console.error('Ошибка при сохранении расчета КБЖУ:', error);
    res.status(500).json({ message: 'Ошибка при сохранении расчета КБЖУ' });
  }
};

// Получение последнего расчета пользователя
const getUserCalculation = async (req, res) => {
  try {
    const userId = req.user.userId;

    const [records] = await pool.query(
      'SELECT daily_calories, proteins, fats, carbs, goal FROM calories WHERE user_id = ?',
      [userId]
    );

    if (records.length === 0) {
      return res.status(404).json({ message: 'Расчет КБЖУ не найден' });
    }

    res.json(records[0]);
  } catch (error) {
    console.error('Ошибка при получении расчета КБЖУ:', error);
    res.status(500).json({ message: 'Ошибка при получении расчета КБЖУ' });
  }
};

// Получение всех расчетов КБЖУ (для администратора или тестирования)
const getAllCalories = async (req, res) => {
  try {
    // Соединяем таблицы calories и users для отображения имен пользователей
    const [records] = await pool.query(`
      SELECT c.id, c.user_id, u.name as user_name, u.email, 
             c.daily_calories, c.proteins, c.fats, c.carbs, c.goal, 
             c.created_at, c.updated_at
      FROM calories c
      JOIN users u ON c.user_id = u.id
      ORDER BY c.id DESC
    `);

    res.json(records);
  } catch (error) {
    console.error('Ошибка при получении списка расчетов КБЖУ:', error);
    res.status(500).json({ message: 'Ошибка при получении списка расчетов КБЖУ' });
  }
};

module.exports = {
  calculateCalories,
  saveCalculation,
  getUserCalculation,
  getAllCalories
}; 