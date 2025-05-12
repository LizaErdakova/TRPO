const express = require('express');
const router = express.Router();
const { calculateCalories, saveCalculation, getUserCalculation, getAllCalories } = require('../controllers/caloriesController');
const authMiddleware = require('../middleware/auth');

// Маршрут для расчета КБЖУ (доступен всем)
router.post('/calculate', calculateCalories);

// Маршруты, требующие авторизации
router.post('/save', authMiddleware, saveCalculation);
router.get('/user', authMiddleware, getUserCalculation);

// Маршрут для тестирования/администрирования
router.get('/all', getAllCalories);

module.exports = router; 