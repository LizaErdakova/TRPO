const pool = require('../config/database');

// Получение профиля пользователя
const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const [users] = await pool.query(
      'SELECT id, name, email, age, gender, height, weight FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    res.json(users[0]);
  } catch (error) {
    console.error('Ошибка при получении профиля пользователя:', error);
    res.status(500).json({ message: 'Ошибка при получении профиля пользователя' });
  }
};

// Обновление профиля пользователя
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, age, gender, height, weight } = req.body;

    await pool.query(
      'UPDATE users SET name = ?, age = ?, gender = ?, height = ?, weight = ? WHERE id = ?',
      [name, age, gender, height, weight, userId]
    );

    res.json({ message: 'Профиль успешно обновлен' });
  } catch (error) {
    console.error('Ошибка при обновлении профиля пользователя:', error);
    res.status(500).json({ message: 'Ошибка при обновлении профиля пользователя' });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile
}; 