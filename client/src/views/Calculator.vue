<template>
  <div class="calculator-page">
    <h1>Калькулятор КБЖУ</h1>
    <div class="calculator-container">
      <div class="calculator-form">
        <div class="form-group">
          <label for="gender">Пол:</label>
          <div class="radio-group">
            <label class="radio-label">
              <input type="radio" id="gender-male" name="gender" value="male" v-model="form.gender">
              Мужской
            </label>
            <label class="radio-label">
              <input type="radio" id="gender-female" name="gender" value="female" v-model="form.gender">
              Женский
            </label>
          </div>
        </div>

        <div class="form-group">
          <label for="age">Возраст (лет):</label>
          <input type="number" id="age" v-model.number="form.age" min="12" max="100" required>
        </div>

        <div class="form-group">
          <label for="weight">Вес (кг):</label>
          <input type="number" id="weight" v-model.number="form.weight" min="30" max="300" step="0.1" required>
        </div>

        <div class="form-group">
          <label for="height">Рост (см):</label>
          <input type="number" id="height" v-model.number="form.height" min="100" max="250" required>
        </div>

        <div class="form-group">
          <label for="activity">Уровень активности:</label>
          <select id="activity" v-model="form.activity" required>
            <option value="1.2">Минимальная активность (сидячая работа)</option>
            <option value="1.375">Легкие тренировки (1-3 раза в неделю)</option>
            <option value="1.55">Средняя активность (3-5 раз в неделю)</option>
            <option value="1.725">Высокая активность (6-7 раз в неделю)</option>
            <option value="1.9">Очень высокая активность (физическая работа)</option>
          </select>
        </div>

        <div class="form-group">
          <label>Цель:</label>
          <div class="goal-tabs">
            <button 
              type="button" 
              class="goal-tab" 
              :class="{ 'active': form.goal === 'lose' }"
              @click="form.goal = 'lose'"
            >
              Похудение
            </button>
            <button 
              type="button" 
              class="goal-tab" 
              :class="{ 'active': form.goal === 'maintain' }"
              @click="form.goal = 'maintain'"
            >
              Поддержание
            </button>
            <button 
              type="button" 
              class="goal-tab" 
              :class="{ 'active': form.goal === 'gain' }"
              @click="form.goal = 'gain'"
            >
              Набор массы
            </button>
          </div>
        </div>

        <button type="button" class="calculate-btn" @click="calculateNutrition">Рассчитать</button>
        <button type="button" class="save-btn" @click="saveResults" v-if="results.calories">Сохранить результаты</button>
      </div>

      <div class="calculator-results" v-if="results.calories">
        <h2>Ваши результаты:</h2>
        <div class="results-container">
          <div class="result-card">
            <div class="result-icon">🔥</div>
            <div class="result-value">{{ Math.round(results.calories) }}</div>
            <div class="result-label">Калории (ккал)</div>
          </div>
          <div class="result-card">
            <div class="result-icon">🥩</div>
            <div class="result-value">{{ Math.round(results.proteins) }}</div>
            <div class="result-label">Белки (г)</div>
          </div>
          <div class="result-card">
            <div class="result-icon">🥑</div>
            <div class="result-value">{{ Math.round(results.fats) }}</div>
            <div class="result-label">Жиры (г)</div>
          </div>
          <div class="result-card">
            <div class="result-icon">🍞</div>
            <div class="result-value">{{ Math.round(results.carbs) }}</div>
            <div class="result-label">Углеводы (г)</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'CalculatorPage',
  data() {
    return {
      form: {
        gender: 'male',
        age: 30,
        weight: 70,
        height: 175,
        activity: '1.55',
        goal: 'maintain'
      },
      results: {
        calories: 0,
        proteins: 0,
        fats: 0,
        carbs: 0
      },
      loading: false,
      error: ''
    };
  },
  mounted() {
    this.loadUserData();
  },
  methods: {
    async loadUserData() {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const response = await axios.get('http://localhost:3000/api/users/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        const user = response.data;
        
        if (user) {
          // Заполнить форму данными пользователя, если они доступны
          if (user.gender) this.form.gender = user.gender;
          if (user.age) this.form.age = user.age;
          if (user.weight) this.form.weight = user.weight;
          if (user.height) this.form.height = user.height;
        }
      } catch (error) {
        console.error('Ошибка при загрузке данных пользователя:', error);
      }
    },
    calculateNutrition() {
      // Проверка данных формы
      if (!this.validateForm()) {
        return;
      }

      this.loading = true;
      this.error = '';
      
      try {
        // Расчет базового метаболизма (BMR) по формуле Миффлина-Сан Жеора
        let bmr = 0;
        if (this.form.gender === 'male') {
          bmr = 10 * this.form.weight + 6.25 * this.form.height - 5 * this.form.age + 5;
        } else {
          bmr = 10 * this.form.weight + 6.25 * this.form.height - 5 * this.form.age - 161;
        }
        
        // Умножаем на коэффициент активности
        let dailyCalories = bmr * parseFloat(this.form.activity);
        
        // Корректируем в зависимости от цели
        switch (this.form.goal) {
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
        // Для похудения: 35% белков, 20% жиров, 45% углеводов
        // Для поддержания: 30% белков, 30% жиров, 40% углеводов
        // Для набора массы: 25% белков, 25% жиров, 50% углеводов
        let proteinPercentage, fatPercentage, carbPercentage;
        
        switch (this.form.goal) {
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
        const proteins = (dailyCalories * proteinPercentage) / 4; // 4 калории в 1 г белка
        const fats = (dailyCalories * fatPercentage) / 9; // 9 калорий в 1 г жира
        const carbs = (dailyCalories * carbPercentage) / 4; // 4 калории в 1 г углеводов
        
        this.results = {
          calories: dailyCalories,
          proteins,
          fats,
          carbs
        };
        
      } catch (error) {
        this.error = 'Ошибка при расчете. Проверьте введенные данные.';
        console.error(error);
      } finally {
        this.loading = false;
      }
    },
    async saveResults() {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Необходимо войти в систему, чтобы сохранить результаты');
        return;
      }

      try {
        const response = await axios.post('http://localhost:3000/api/calories/save', {
          dailyCalories: Math.round(this.results.calories),
          proteins: Math.round(this.results.proteins),
          fats: Math.round(this.results.fats),
          carbs: Math.round(this.results.carbs),
          goal: this.form.goal
        }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.status === 201) {
          alert('Результаты успешно сохранены');
        }
      } catch (error) {
        console.error('Ошибка при сохранении результатов:', error);
        alert('Не удалось сохранить результаты. Попробуйте позже.');
      }
    },
    validateForm() {
      if (!this.form.age || !this.form.weight || !this.form.height) {
        this.error = 'Пожалуйста, заполните все поля';
        return false;
      }
      
      if (this.form.age < 12 || this.form.age > 100) {
        this.error = 'Возраст должен быть от 12 до 100 лет';
        return false;
      }
      
      if (this.form.weight < 30 || this.form.weight > 300) {
        this.error = 'Вес должен быть от 30 до 300 кг';
        return false;
      }
      
      if (this.form.height < 100 || this.form.height > 250) {
        this.error = 'Рост должен быть от 100 до 250 см';
        return false;
      }
      
      return true;
    }
  }
};
</script>

<style scoped>
.calculator-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

h1 {
  text-align: center;
  color: white;
  margin-bottom: 2rem;
}

.calculator-container {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  justify-content: center;
}

.calculator-form {
  flex: 1;
  min-width: 300px;
  max-width: 500px;
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #444;
}

input[type="number"],
select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.radio-group {
  display: flex;
  gap: 1.5rem;
}

.radio-label {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.radio-label input {
  margin-right: 0.5rem;
}

.goal-tabs {
  display: flex;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
}

.goal-tab {
  flex: 1;
  padding: 0.75rem;
  text-align: center;
  background-color: #f5f5f5;
  border: none;
  cursor: pointer;
  transition: all 0.3s;
}

.goal-tab.active {
  background-color: #4CAF50;
  color: white;
}

.calculate-btn,
.save-btn {
  width: 100%;
  padding: 0.9rem;
  margin-top: 1rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
}

.calculate-btn {
  background-color: #4CAF50;
  color: white;
}

.save-btn {
  background-color: #2196F3;
  color: white;
}

.calculate-btn:hover {
  background-color: #45a049;
}

.save-btn:hover {
  background-color: #0b7dda;
}

.calculator-results {
  flex: 1;
  min-width: 300px;
  max-width: 500px;
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.calculator-results h2 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #333;
}

.results-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.result-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem;
  border-radius: 8px;
  background-color: #f9f9f9;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.result-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.result-value {
  font-size: 1.75rem;
  font-weight: bold;
  color: #333;
}

.result-label {
  margin-top: 0.5rem;
  color: #666;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .calculator-container {
    flex-direction: column;
  }
  
  .calculator-form,
  .calculator-results {
    max-width: 100%;
  }
  
  .results-container {
    grid-template-columns: 1fr;
  }
}
</style> 