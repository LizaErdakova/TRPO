const express = require('express');
const router = express.Router();
const pool = require('../config/database');

/**
 * @route   GET /api/products/search
 * @desc    Поиск продуктов по части названия
 * @access  Public
 */
router.get('/search', async (req, res) => {
  try {
    const query = req.query.q || '';
    const limit = parseInt(req.query.limit) || 10;
    
    if (limit > 50) {
      return res.status(400).json({ message: 'Максимальный лимит 50 записей' });
    }
    
    const searchPattern = `%${query}%`;
    const [products] = await pool.query(
      'SELECT id, name, calories, proteins, fats, carbs FROM products WHERE name LIKE ? ORDER BY name LIMIT ?',
      [searchPattern, limit]
    );
    
    res.json(products);
  } catch (error) {
    console.error('Ошибка при поиске продуктов:', error);
    res.status(500).json({ message: 'Ошибка сервера при поиске продуктов' });
  }
});

/**
 * @route   GET /api/products
 * @desc    Получение всех продуктов
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;
    
    if (limit > 100) {
      return res.status(400).json({ message: 'Максимальный лимит 100 записей' });
    }
    
    const [products] = await pool.query(
      'SELECT id, name, calories, proteins, fats, carbs FROM products ORDER BY name LIMIT ? OFFSET ?',
      [limit, offset]
    );
    
    // Получаем общее количество продуктов для пагинации
    const [countResult] = await pool.query('SELECT COUNT(*) as total FROM products');
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