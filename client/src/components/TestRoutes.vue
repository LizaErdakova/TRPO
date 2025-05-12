<template>
  <div class="test-routes">
    <h1>Тестирование API-маршрутов</h1>
    
    <div class="test-section">
      <h2>Добавление приема пищи</h2>
      <div class="test-inputs">
        <div class="input-group">
          <label>ID Продукта:</label>
          <input v-model.number="mealTest.productId" type="number" />
        </div>
        <div class="input-group">
          <label>Количество (г):</label>
          <input v-model.number="mealTest.quantity" type="number" />
        </div>
        <div class="input-group">
          <label>Тип приема пищи:</label>
          <select v-model="mealTest.mealType">
            <option value="breakfast">Завтрак</option>
            <option value="lunch">Обед</option>
            <option value="dinner">Ужин</option>
            <option value="snack">Перекус</option>
          </select>
        </div>
        <button @click="testAddMeal" :disabled="isLoading">Тест добавления приема пищи</button>
      </div>
      
      <div class="result" v-if="mealResult">
        <h3>Результат:</h3>
        <pre>{{ mealResult }}</pre>
      </div>
    </div>
    
    <div class="test-section">
      <h2>Получение приемов пищи</h2>
      <div class="test-inputs">
        <div class="input-group">
          <label>Дата (YYYY-MM-DD):</label>
          <input v-model="mealsGetTest.date" type="date" />
        </div>
        <button @click="testGetMeals" :disabled="isLoading">Тест получения приемов пищи</button>
      </div>
      
      <div class="result" v-if="mealsGetResult">
        <h3>Результат:</h3>
        <pre>{{ mealsGetResult }}</pre>
      </div>
    </div>
    
    <div class="test-section">
      <h2>Добавление записи о воде</h2>
      <div class="test-inputs">
        <div class="input-group">
          <label>Количество (мл):</label>
          <input v-model.number="waterTest.amount" type="number" />
        </div>
        <button @click="testAddWater" :disabled="isLoading">Тест добавления воды</button>
      </div>
      
      <div class="result" v-if="waterResult">
        <h3>Результат:</h3>
        <pre>{{ waterResult }}</pre>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'TestRoutes',
  data() {
    return {
      isLoading: false,
      mealTest: {
        productId: 1,
        quantity: 100,
        mealType: 'breakfast'
      },
      mealResult: null,
      mealsGetTest: {
        date: new Date().toISOString().split('T')[0]
      },
      mealsGetResult: null,
      waterTest: {
        amount: 250
      },
      waterResult: null
    };
  },
  methods: {
    async testAddMeal() {
      this.isLoading = true;
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          alert('Необходима авторизация');
          return;
        }
        
        console.log('Отправка запроса на добавление приема пищи:', {
          product_id: this.mealTest.productId,
          quantity: this.mealTest.quantity,
          meal_type: this.mealTest.mealType
        });
        
        const response = await axios.post('http://localhost:3000/api/meals/add', {
          product_id: this.mealTest.productId,
          quantity: this.mealTest.quantity,
          meal_type: this.mealTest.mealType
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        this.mealResult = {
          status: response.status,
          data: response.data
        };
        
        console.log('Результат запроса:', this.mealResult);
      } catch (error) {
        console.error('Ошибка при тестировании добавления приема пищи:', error);
        this.mealResult = {
          error: true,
          status: error.response?.status,
          message: error.response?.data?.message || error.message
        };
      } finally {
        this.isLoading = false;
      }
    },
    
    async testGetMeals() {
      this.isLoading = true;
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          alert('Необходима авторизация');
          return;
        }
        
        console.log('Отправка запроса на получение приемов пищи для даты:', this.mealsGetTest.date);
        
        const response = await axios.get('http://localhost:3000/api/meals/get', {
          headers: { Authorization: `Bearer ${token}` },
          params: { date: this.mealsGetTest.date }
        });
        
        this.mealsGetResult = {
          status: response.status,
          data: response.data
        };
        
        console.log('Результат запроса:', this.mealsGetResult);
      } catch (error) {
        console.error('Ошибка при тестировании получения приемов пищи:', error);
        this.mealsGetResult = {
          error: true,
          status: error.response?.status,
          message: error.response?.data?.message || error.message
        };
      } finally {
        this.isLoading = false;
      }
    },
    
    async testAddWater() {
      this.isLoading = true;
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          alert('Необходима авторизация');
          return;
        }
        
        console.log('Отправка запроса на добавление воды:', {
          amount: this.waterTest.amount
        });
        
        const response = await axios.post('http://localhost:3000/api/water/track', {
          amount: this.waterTest.amount
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        this.waterResult = {
          status: response.status,
          data: response.data
        };
        
        console.log('Результат запроса:', this.waterResult);
      } catch (error) {
        console.error('Ошибка при тестировании добавления воды:', error);
        this.waterResult = {
          error: true,
          status: error.response?.status,
          message: error.response?.data?.message || error.message
        };
      } finally {
        this.isLoading = false;
      }
    }
  }
};
</script>

<style scoped>
.test-routes {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

h1 {
  margin-bottom: 2rem;
  color: #333;
}

.test-section {
  margin-bottom: 2rem;
  padding: 1rem;
  border: 1px solid #eee;
  border-radius: 4px;
}

h2 {
  margin-bottom: 1rem;
  font-size: 1.2rem;
  color: #333;
}

.test-inputs {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.input-group {
  display: flex;
  align-items: center;
}

.input-group label {
  width: 150px;
  font-weight: 500;
}

input, select {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 200px;
}

button {
  padding: 0.5rem 1rem;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  margin-top: 0.5rem;
  align-self: flex-start;
}

button:hover {
  background-color: #45a049;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.result {
  margin-top: 1rem;
  padding: 1rem;
  background-color: #f5f5f5;
  border-radius: 4px;
}

pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  max-height: 300px;
  overflow-y: auto;
}
</style> 