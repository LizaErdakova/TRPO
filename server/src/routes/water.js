const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const authMiddleware = require('../middleware/auth');

/**
 * @route POST /api/water/track
 * @desc Добавление записи о выпитой воде
 * @access Private
 */
router.post('/track', authMiddleware, async (req, res) => {
  try {
    const { amount, date } = req.body;
    const user_id = req.user.userId;
    
    console.log('Получен запрос на добавление воды:', {
      amount,
      date,
      user_id
    });

    // Проверка корректности данных
    if (!amount || isNaN(amount) || amount <= 0) {
      console.log('Ошибка валидации данных о воде:', { amount });
      return res.status(400).json({ message: 'Необходимо указать корректное количество воды' });
    }

    // Форматирование даты, если она передана
    let formattedDate = new Date().toISOString().split('T')[0]; // Текущая дата по умолчанию
    if (date) {
      formattedDate = new Date(date).toISOString().split('T')[0];
    }
    console.log('Форматированная дата:', formattedDate);

    // Проверяем, есть ли уже запись за эту дату
    console.log('Проверка существующей записи в таблице water_tracker');
    const [existingRecord] = await pool.query(
      'SELECT id, amount FROM water_tracker WHERE user_id = ? AND date = ?',
      [user_id, formattedDate]
    );
    console.log('Найдено записей:', existingRecord.length);

    let result;
    try {
      if (existingRecord.length > 0) {
        // Обновляем существующую запись
        const currentAmount = existingRecord[0].amount;
        const newAmount = currentAmount + parseInt(amount);
        console.log('Обновление существующей записи:', {
          id: existingRecord[0].id,
          oldAmount: currentAmount,
          newAmount,
          difference: parseInt(amount)
        });
        
        await pool.query(
          'UPDATE water_tracker SET amount = ?, timestamp = CURRENT_TIMESTAMP WHERE id = ?',
          [newAmount, existingRecord[0].id]
        );
        console.log('Запись успешно обновлена');
        
        result = {
          id: existingRecord[0].id,
          amount: newAmount,
          isUpdated: true
        };
      } else {
        // Создаем новую запись
        console.log('Создание новой записи о воде:', {
          user_id,
          amount: parseInt(amount),
          date: formattedDate
        });
        
        const [insertResult] = await pool.query(
          'INSERT INTO water_tracker (user_id, amount, date) VALUES (?, ?, ?)',
          [user_id, parseInt(amount), formattedDate]
        );
        console.log('Запись успешно добавлена, id:', insertResult.insertId);
        
        result = {
          id: insertResult.insertId,
          amount: parseInt(amount),
          isUpdated: false
        };
      }
    } catch (dbError) {
      console.error('Ошибка SQL при работе с таблицей water_tracker:', dbError);
      return res.status(500).json({ message: 'Ошибка при работе с базой данных', error: dbError.message });
    }

    // Получаем данные о пользователе для расчета нормы воды
    console.log('Получение данных пользователя для расчета нормы');
    const [userRows] = await pool.query(
      'SELECT weight FROM users WHERE id = ?',
      [user_id]
    );
    
    let waterNorm = 2000; // Стандартное значение по умолчанию - 2 литра
    if (userRows.length > 0 && userRows[0].weight) {
      // Расчет нормы воды по весу: 30 мл на 1 кг веса
      waterNorm = Math.round(userRows[0].weight * 30);
      console.log('Норма воды рассчитана по весу:', {
        weight: userRows[0].weight,
        norm: waterNorm
      });
    } else {
      console.log('Используется стандартная норма воды:', waterNorm);
    }
    
    // Расчет процента выполнения нормы
    const percentCompleted = Math.min(100, Math.round((result.amount / waterNorm) * 100));
    console.log('Процент выполнения нормы:', percentCompleted);

    res.status(200).json({
      message: result.isUpdated ? 'Запись о воде обновлена' : 'Запись о воде добавлена',
      water: {
        ...result,
        date: formattedDate,
        norm: waterNorm,
        percentCompleted
      }
    });
  } catch (error) {
    console.error('Ошибка при добавлении записи о воде:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

/**
 * @route GET /api/water/status
 * @desc Получение статуса потребления воды за определенную дату
 * @access Private
 */
router.get('/status', authMiddleware, async (req, res) => {
  try {
    const user_id = req.user.userId;
    let { date } = req.query;

    // Форматирование даты, если она передана
    if (!date) {
      date = new Date().toISOString().split('T')[0]; // Текущая дата
    } else {
      date = new Date(date).toISOString().split('T')[0];
    }

    // Получаем запись о воде за указанную дату
    const [waterRecord] = await pool.query(
      'SELECT id, amount, date, timestamp FROM water_tracker WHERE user_id = ? AND date = ?',
      [user_id, date]
    );

    // Получаем данные о пользователе для расчета нормы воды
    const [userRows] = await pool.query(
      'SELECT weight FROM users WHERE id = ?',
      [user_id]
    );
    
    let waterNorm = 2000; // Стандартное значение по умолчанию - 2 литра (2000 мл)
    if (userRows.length > 0 && userRows[0].weight) {
      // Расчет нормы воды по весу: 30 мл на 1 кг веса
      waterNorm = Math.round(userRows[0].weight * 30);
    }

    // Если записи нет, возвращаем нулевые значения
    if (waterRecord.length === 0) {
      return res.json({
        date,
        amount: 0,
        norm: waterNorm,
        percentCompleted: 0,
        lastUpdated: null
      });
    }

    // Расчет процента выполнения нормы
    const record = waterRecord[0];
    const percentCompleted = Math.min(100, Math.round((record.amount / waterNorm) * 100));

    res.json({
      date,
      amount: record.amount,
      norm: waterNorm,
      percentCompleted,
      lastUpdated: record.timestamp
    });
  } catch (error) {
    console.error('Ошибка при получении статуса потребления воды:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

/**
 * @route GET /api/water/history
 * @desc Получение истории потребления воды за неделю
 * @access Private
 */
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const user_id = req.user.userId;
    
    // Получаем записи о воде за последние 7 дней
    const [waterRecords] = await pool.query(`
      SELECT id, amount, date, timestamp 
      FROM water_tracker 
      WHERE user_id = ? AND date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      ORDER BY date DESC
    `, [user_id]);

    // Получаем данные о пользователе для расчета нормы воды
    const [userRows] = await pool.query(
      'SELECT weight FROM users WHERE id = ?',
      [user_id]
    );
    
    let waterNorm = 2000; // Стандартное значение по умолчанию
    if (userRows.length > 0 && userRows[0].weight) {
      waterNorm = Math.round(userRows[0].weight * 30);
    }

    // Формируем массив с данными за каждый день
    const history = waterRecords.map(record => {
      const percentCompleted = Math.min(100, Math.round((record.amount / waterNorm) * 100));
      return {
        date: record.date,
        amount: record.amount,
        percentCompleted,
        lastUpdated: record.timestamp
      };
    });

    res.json({
      history,
      norm: waterNorm
    });
  } catch (error) {
    console.error('Ошибка при получении истории потребления воды:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

/**
 * @route DELETE /api/water/remove
 * @desc Удаление или уменьшение количества выпитой воды
 * @access Private
 */
router.delete('/remove', authMiddleware, async (req, res) => {
  try {
    const { amount, date } = req.body;
    const user_id = req.user.userId;
    
    console.log('Получен запрос на удаление воды:', {
      amount,
      date,
      user_id
    });

    // Проверка корректности данных
    if (!amount || isNaN(amount) || amount <= 0) {
      console.log('Ошибка валидации данных о воде:', { amount });
      return res.status(400).json({ message: 'Необходимо указать корректное количество воды' });
    }

    // Форматирование даты
    let formattedDate = date;
    if (date) {
      formattedDate = new Date(date).toISOString().split('T')[0];
    } else {
      formattedDate = new Date().toISOString().split('T')[0];
    }
    console.log('Форматированная дата:', formattedDate);

    // Проверяем, есть ли запись за эту дату
    const [existingRecord] = await pool.query(
      'SELECT id, amount FROM water_tracker WHERE user_id = ? AND date = ?',
      [user_id, formattedDate]
    );
    
    if (existingRecord.length === 0) {
      return res.status(404).json({ message: 'Записи о воде за указанную дату не найдено' });
    }

    const currentAmount = existingRecord[0].amount;
    const recordId = existingRecord[0].id;
    
    // Если просят удалить больше, чем есть или ровно столько же - удаляем всю запись
    if (amount >= currentAmount) {
      await pool.query('DELETE FROM water_tracker WHERE id = ?', [recordId]);
      console.log('Запись полностью удалена');
      
      return res.json({
        message: 'Запись о воде удалена',
        water: {
          amount: 0,
          date: formattedDate,
          norm: 2000, // Стандартное значение
          percentCompleted: 0
        }
      });
    } else {
      // Иначе уменьшаем количество
      const newAmount = currentAmount - amount;
      await pool.query(
        'UPDATE water_tracker SET amount = ?, timestamp = CURRENT_TIMESTAMP WHERE id = ?',
        [newAmount, recordId]
      );
      console.log('Количество воды уменьшено:', {
        oldAmount: currentAmount,
        newAmount,
        difference: amount
      });
      
      // Получаем данные о пользователе для расчета нормы воды
      const [userRows] = await pool.query(
        'SELECT weight FROM users WHERE id = ?',
        [user_id]
      );
      
      let waterNorm = 2000; // Стандартное значение по умолчанию - 2 литра
      if (userRows.length > 0 && userRows[0].weight) {
        // Расчет нормы воды по весу: 30 мл на 1 кг веса
        waterNorm = Math.round(userRows[0].weight * 30);
      }
      
      // Расчет процента выполнения нормы
      const percentCompleted = Math.min(100, Math.round((newAmount / waterNorm) * 100));
      
      return res.json({
        message: 'Количество воды уменьшено',
        water: {
          id: recordId,
          amount: newAmount,
          date: formattedDate,
          norm: waterNorm,
          percentCompleted
        }
      });
    }
  } catch (error) {
    console.error('Ошибка при удалении записи о воде:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router; 