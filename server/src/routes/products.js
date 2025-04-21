const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const Joi = require('joi');
const jwt = require('jsonwebtoken');

// Middleware для проверки аутентификации
const authMiddleware = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      // Если токена нет, пользователь не аутентифицирован, но мы позволяем
      // доступ к общедоступным продуктам
      req.user = null;
      return next();
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    // Если токен недействителен, пользователь не аутентифицирован
    req.user = null;
    next();
  }
};

/**
 * @route   GET /api/products/search
 * @desc    Поиск продуктов по части названия (общих и личных)
 * @access  Public/Private
 */
router.get('/search', authMiddleware, async (req, res) => {
  try {
    const query = req.query.q || '';
    const limit = parseInt(req.query.limit) || 10;
    
    if (limit > 50) {
      return res.status(400).json({ message: 'Максимальный лимит 50 записей' });
    }
    
    const searchPattern = `%${query}%`;
    
    let sqlQuery;
    let params;
    
    // Упрощенный запрос для поиска 
    if (req.user) {
      // Запрос для авторизованного пользователя (ищем общие + личные продукты)
      sqlQuery = `
        SELECT id, name, calories, proteins, fats, carbs, 
               CASE WHEN user_id IS NOT NULL THEN 1 ELSE 0 END AS is_personal
        FROM products 
        WHERE name LIKE ? AND (is_public = TRUE OR user_id = ?)
        ORDER BY name
        LIMIT ?
      `;
      params = [searchPattern, req.user.id, limit];
    } else {
      // Запрос для неавторизованного пользователя (только общие продукты)
      sqlQuery = `
        SELECT id, name, calories, proteins, fats, carbs, 0 AS is_personal
        FROM products 
        WHERE name LIKE ? AND is_public = TRUE
        ORDER BY name
        LIMIT ?
      `;
      params = [searchPattern, limit];
    }
    
    console.log('SQL запрос поиска:', sqlQuery);
    console.log('Параметры запроса:', params);
    
    const [products] = await pool.query(sqlQuery, params);
    
    console.log('Результаты поиска:', products.length ? products : 'Продукты не найдены');
    
    res.json(products);
  } catch (error) {
    console.error('Ошибка при поиске продуктов:', error.message);
    console.error('Стек ошибки:', error.stack);
    res.status(500).json({ message: 'Ошибка сервера при поиске продуктов' });
  }
});

/**
 * @route   POST /api/products/add
 * @desc    Добавление нового продукта (личного или общего)
 * @access  Private
 */
router.post('/add', authMiddleware, async (req, res) => {
  // Требуем аутентификацию для добавления продуктов
  if (!req.user) {
    return res.status(401).json({ message: 'Требуется авторизация' });
  }

  // Валидация с помощью Joi
  const schema = Joi.object({
    name: Joi.string().min(2).max(255).required().messages({
      'string.min': 'Название должно быть не менее 2 символов',
      'string.max': 'Название должно быть не более 255 символов',
      'any.required': 'Название продукта обязательно'
    }),
    calories: Joi.number().min(0).max(5000).required().messages({
      'number.base': 'Калории должны быть числом',
      'number.min': 'Калории не могут быть отрицательными',
      'number.max': 'Калории не могут превышать 5000',
      'any.required': 'Калории обязательны'
    }),
    proteins: Joi.number().min(0).max(500).required().messages({
      'number.base': 'Белки должны быть числом',
      'number.min': 'Белки не могут быть отрицательными',
      'number.max': 'Белки не могут превышать 500г',
      'any.required': 'Белки обязательны'
    }),
    fats: Joi.number().min(0).max(500).required().messages({
      'number.base': 'Жиры должны быть числом',
      'number.min': 'Жиры не могут быть отрицательными',
      'number.max': 'Жиры не могут превышать 500г',
      'any.required': 'Жиры обязательны'
    }),
    carbs: Joi.number().min(0).max(500).required().messages({
      'number.base': 'Углеводы должны быть числом',
      'number.min': 'Углеводы не могут быть отрицательными',
      'number.max': 'Углеводы не могут превышать 500г',
      'any.required': 'Углеводы обязательны'
    }),
    isPublic: Joi.boolean().default(false)
  });

  const { error, value } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      message: 'Ошибка валидации', 
      details: error.details[0].message,
      field: error.details[0].path[0]
    });
  }

  try {
    console.log('Получены данные продукта:', value);
    
    // Преобразуем числовые данные, чтобы избежать проблем с типами
    const safeProductData = {
      name: value.name,
      calories: Number(value.calories),
      proteins: Number(value.proteins),
      fats: Number(value.fats),
      carbs: Number(value.carbs),
      isPublic: Boolean(value.isPublic)
    };
    
    console.log('Обработанные данные продукта:', safeProductData);
    
    // Проверяем, существует ли уже продукт с таким названием
    let checkSql, checkParams;
    
    if (safeProductData.isPublic) {
      // Проверка администратора
      if (req.user.id !== 1) { 
        return res.status(403).json({ message: 'Только администраторы могут добавлять общедоступные продукты' });
      }
      
      checkSql = 'SELECT id FROM products WHERE name = ? AND is_public = TRUE';
      checkParams = [safeProductData.name];
    } else {
      checkSql = 'SELECT id FROM products WHERE name = ? AND user_id = ?';
      checkParams = [safeProductData.name, req.user.id];
    }
    
    console.log('SQL запрос проверки:', checkSql);
    console.log('Параметры проверки:', checkParams);
    
    const [existingProducts] = await pool.query(checkSql, checkParams);
    
    if (existingProducts.length > 0) {
      return res.status(400).json({ 
        message: 'Продукт с таким названием уже существует',
        field: 'name'
      });
    }
    
    // Добавляем новый продукт
    const insertSql = `
      INSERT INTO products (name, calories, proteins, fats, carbs, user_id, is_public)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const insertParams = [
      safeProductData.name,
      safeProductData.calories,
      safeProductData.proteins,
      safeProductData.fats,
      safeProductData.carbs,
      safeProductData.isPublic ? null : req.user.id,
      safeProductData.isPublic
    ];
    
    console.log('SQL запрос добавления:', insertSql);
    console.log('Параметры добавления:', insertParams);
    
    const [result] = await pool.query(insertSql, insertParams);
    
    // Получаем созданный продукт
    const [newProduct] = await pool.query('SELECT * FROM products WHERE id = ?', [result.insertId]);
    
    console.log('Новый продукт добавлен:', newProduct[0]);
    
    res.status(201).json({
      message: 'Продукт успешно добавлен',
      product: newProduct[0]
    });
  } catch (error) {
    console.error('Ошибка при добавлении продукта:', error.message);
    console.error('Стек ошибки:', error.stack);
    res.status(500).json({ message: 'Ошибка сервера при добавлении продукта' });
  }
});

/**
 * @route   GET /api/products
 * @desc    Получение всех продуктов (общих и личных)
 * @access  Public/Private
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;
    
    if (limit > 100) {
      return res.status(400).json({ message: 'Максимальный лимит 100 записей' });
    }
    
    // Базовый запрос для получения общедоступных продуктов
    let sql = `
      SELECT id, name, calories, proteins, fats, carbs, 
             user_id IS NOT NULL AS is_personal
      FROM products 
      WHERE is_public = TRUE`;
    
    const params = [];
    
    // Если пользователь аутентифицирован, добавляем его личные продукты
    if (req.user) {
      sql += ` OR user_id = ?`;
      params.push(req.user.id);
    }
    
    sql += ` ORDER BY is_personal DESC, name LIMIT ? OFFSET ?`;
    params.push(limit, offset);
    
    const [products] = await pool.query(sql, params);
    
    // Получаем общее количество продуктов для пагинации
    let countSql = `SELECT COUNT(*) as total FROM products WHERE is_public = TRUE`;
    if (req.user) {
      countSql += ` OR user_id = ?`;
    }
    
    const [countResult] = await pool.query(countSql, req.user ? [req.user.id] : []);
    const total = countResult[0].total;
    
    res.json({
      products,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Ошибка при получении продуктов:', error);
    res.status(500).json({ message: 'Ошибка сервера при получении продуктов' });
  }
});

module.exports = router; 