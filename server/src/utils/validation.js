const Joi = require('joi');

const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Некорректный email',
    'any.required': 'Email обязателен',
    'string.empty': 'Email не может быть пустым'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Пароль должен содержать минимум 6 символов',
    'any.required': 'Пароль обязателен',
    'string.empty': 'Пароль не может быть пустым'
  }),
  name: Joi.string().min(2).required().messages({
    'string.min': 'Имя должно содержать минимум 2 символа',
    'any.required': 'Имя обязательно',
    'string.empty': 'Имя не может быть пустым'
  }),
  age: Joi.number().integer().min(1).max(120).required().messages({
    'number.base': 'Возраст должен быть числом',
    'number.integer': 'Возраст должен быть целым числом',
    'number.min': 'Возраст не может быть меньше 1',
    'number.max': 'Возраст не может быть больше 120',
    'any.required': 'Возраст обязателен'
  }),
  height: Joi.number().integer().min(100).max(250).required().messages({
    'number.base': 'Рост должен быть числом',
    'number.integer': 'Рост должен быть целым числом',
    'number.min': 'Рост не может быть меньше 100 см',
    'number.max': 'Рост не может быть больше 250 см',
    'any.required': 'Рост обязателен'
  }),
  weight: Joi.number().min(30).max(300).required().messages({
    'number.base': 'Вес должен быть числом',
    'number.min': 'Вес не может быть меньше 30 кг',
    'number.max': 'Вес не может быть больше 300 кг',
    'any.required': 'Вес обязателен'
  })
});

module.exports = {
  registerSchema
}; 