const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const authMiddleware = require('../middleware/auth');

/**
 * @route POST /api/meals/add
 * @desc Добавление приема пищи
 * @access Private
 */
router.post('/add', authMiddleware, async (req, res) => {
  try {
    const { product_id, quantity, meal_type, date } = req.body;
    const user_id = req.user.userId;
    
    console.log('Получен запрос на добавление приема пищи:', {
      product_id,
      quantity,
      meal_type,
      date,
      user_id
    });

    // Проверка корректности данных
    if (!product_id || !quantity || !meal_type || quantity <= 0) {
      console.log('Ошибка валидации данных приема пищи:', { product_id, quantity, meal_type });
      return res.status(400).json({ message: 'Некорректные данные' });
    }

    // Проверяем существование продукта
    console.log('Поиск продукта в БД, id:', product_id);
    const [productRows] = await pool.query(
      'SELECT * FROM products WHERE id = ? AND (is_public = true OR user_id = ?)',
      [product_id, user_id]
    );
    
    console.log('Найденные продукты:', productRows.length);

    if (productRows.length === 0) {
      console.log('Продукт не найден в БД, id:', product_id);
      return res.status(404).json({ message: 'Продукт не найден' });
    }

    // Форматирование даты, если она передана
    let formattedDate = new Date().toISOString().split('T')[0]; // Текущая дата по умолчанию
    if (date) {
      formattedDate = new Date(date).toISOString().split('T')[0];
    }
    console.log('Форматированная дата:', formattedDate);

    // Добавляем прием пищи
    console.log('Добавление записи в таблицу meals:', {
      user_id,
      product_id,
      quantity,
      meal_type,
      formattedDate
    });
    
    try {
      const [result] = await pool.query(
        'INSERT INTO meals (user_id, product_id, quantity, meal_type, date) VALUES (?, ?, ?, ?, ?)',
        [user_id, product_id, quantity, meal_type, formattedDate]
      );
      console.log('Прием пищи успешно добавлен, id:', result.insertId);

      // Рассчитываем КБЖУ по данным продукта
      const product = productRows[0];
      const ratio = quantity / 100; // продукты обычно на 100г
      const calculatedCalories = product.calories * ratio;
      const calculatedProteins = product.proteins * ratio;
      const calculatedFats = product.fats * ratio;
      const calculatedCarbs = product.carbs * ratio;

      res.status(201).json({
        message: 'Прием пищи успешно добавлен',
        mealId: result.insertId,
        nutrition: {
          calories: calculatedCalories,
          proteins: calculatedProteins,
          fats: calculatedFats,
          carbs: calculatedCarbs
        }
      });
    } catch (dbError) {
      console.error('Ошибка SQL при добавлении приема пищи:', dbError);
      res.status(500).json({ message: 'Ошибка при добавлении в базу данных', error: dbError.message });
    }
  } catch (error) {
    console.error('Ошибка при добавлении приема пищи:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

/**
 * @route GET /api/meals/get
 * @desc Получение приемов пищи за указанную дату
 * @access Private
 */
router.get('/get', authMiddleware, async (req, res) => {
  try {
    const user_id = req.user.userId;
    let { date } = req.query;
    
    // Форматирование даты, если она передана
    if (!date) {
      date = new Date().toISOString().split('T')[0]; // Текущая дата
    } else {
      date = new Date(date).toISOString().split('T')[0];
    }

    // Получаем все приемы пищи пользователя за указанную дату
    const [meals] = await pool.query(`
      SELECT m.id, m.product_id, m.quantity, m.meal_type, m.date, 
             p.name, p.calories, p.proteins, p.fats, p.carbs
      FROM meals m
      JOIN products p ON m.product_id = p.id
      WHERE m.user_id = ? AND m.date = ?
      ORDER BY m.meal_type
    `, [user_id, date]);
    
    // Группировка по типам приемов пищи
    const mealsByType = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snack: []
    };
    
    // Общие суммарные значения за день
    const totals = {
      calories: 0,
      proteins: 0,
      fats: 0,
      carbs: 0
    };
    
    meals.forEach(meal => {
      const ratio = meal.quantity / 100; // продукты обычно на 100г
      const calculatedCalories = meal.calories * ratio;
      const calculatedProteins = meal.proteins * ratio;
      const calculatedFats = meal.fats * ratio;
      const calculatedCarbs = meal.carbs * ratio;
      
      const mealItem = {
        id: meal.id,
        product_id: meal.product_id,
        name: meal.name,
        quantity: meal.quantity,
        nutrition: {
          calories: calculatedCalories,
          proteins: calculatedProteins,
          fats: calculatedFats,
          carbs: calculatedCarbs
        }
      };
      
      mealsByType[meal.meal_type].push(mealItem);
      
      // Добавляем к общей сумме
      totals.calories += calculatedCalories;
      totals.proteins += calculatedProteins;
      totals.fats += calculatedFats;
      totals.carbs += calculatedCarbs;
    });
    
    res.json({
      date,
      meals: mealsByType,
      totals
    });
  } catch (error) {
    console.error('Ошибка при получении приемов пищи:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

/**
 * @route DELETE /api/meals/:id
 * @desc Удаление приема пищи
 * @access Private
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const user_id = req.user.userId;
    const meal_id = req.params.id;
    
    // Проверяем, принадлежит ли прием пищи пользователю
    const [mealCheck] = await pool.query(
      'SELECT id FROM meals WHERE id = ? AND user_id = ?', 
      [meal_id, user_id]
    );
    
    if (mealCheck.length === 0) {
      return res.status(404).json({ message: 'Прием пищи не найден' });
    }
    
    // Удаляем прием пищи
    await pool.query('DELETE FROM meals WHERE id = ?', [meal_id]);
    
    res.json({ message: 'Прием пищи успешно удален' });
  } catch (error) {
    console.error('Ошибка при удалении приема пищи:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router; 