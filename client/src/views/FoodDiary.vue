<template>
  <div class="food-diary">
    <h1 class="text-2xl font-bold mb-6">Журнал питания</h1>
    
    <!-- Форма поиска продуктов -->
    <div class="search-container mb-8">
      <h2 class="text-xl font-semibold mb-4">Добавить продукт</h2>
      <div class="search-form">
        <el-autocomplete
          v-model="searchQuery"
          :fetch-suggestions="searchProducts"
          placeholder="Введите название продукта"
          class="w-full"
          :trigger-on-focus="true"
          @select="handleProductSelect"
        >
          <template #default="{ item }">
            <div class="product-suggestion">
              <div class="product-name">{{ item.name }}</div>
              <div class="product-info text-sm text-gray-600">
                {{ item.calories }} ккал | Б: {{ item.proteins }}г | Ж: {{ item.fats }}г | У: {{ item.carbs }}г
              </div>
            </div>
          </template>
        </el-autocomplete>
        
        <div class="meal-type-selection mt-3">
          <span class="meal-type-label">Тип приема пищи:</span>
          <el-radio-group v-model="selectedMealType" size="medium">
            <el-radio-button label="breakfast">Завтрак</el-radio-button>
            <el-radio-button label="lunch">Обед</el-radio-button>
            <el-radio-button label="dinner">Ужин</el-radio-button>
            <el-radio-button label="snack">Перекус</el-radio-button>
          </el-radio-group>
        </div>
        
        <div class="mt-3 text-right">
          <el-button type="primary" @click="openAddProductModal">
            Добавить новый продукт
          </el-button>
        </div>
      </div>
    </div>
    
    <!-- Дата дневника питания -->
    <div class="date-navigation mb-6">
      <el-button @click="changeDate(-1)" icon="el-icon-arrow-left" circle></el-button>
      <el-date-picker
        v-model="selectedDate"
        type="date"
        format="YYYY-MM-DD"
        value-format="YYYY-MM-DD"
        placeholder="Выберите дату"
        @change="loadMeals"
      ></el-date-picker>
      <el-button @click="changeDate(1)" icon="el-icon-arrow-right" circle></el-button>
    </div>
    
    <!-- Итоги за день -->
    <div class="daily-summary mb-6 p-4 bg-gray-50 rounded-lg">
      <h3 class="text-lg font-semibold mb-3">Итого за день:</h3>
      <div class="grid grid-cols-4 gap-4">
        <div class="summary-item">
          <div class="icon">🔥</div>
          <div class="value">{{ Math.round(totals.calories) }}</div>
          <div class="label">Калории</div>
        </div>
        <div class="summary-item">
          <div class="icon">🥩</div>
          <div class="value">{{ Math.round(totals.proteins) }}</div>
          <div class="label">Белки (г)</div>
        </div>
        <div class="summary-item">
          <div class="icon">🥑</div>
          <div class="value">{{ Math.round(totals.fats) }}</div>
          <div class="label">Жиры (г)</div>
        </div>
        <div class="summary-item">
          <div class="icon">🍞</div>
          <div class="value">{{ Math.round(totals.carbs) }}</div>
          <div class="label">Углеводы (г)</div>
        </div>
      </div>
    </div>
    
    <!-- Контейнер для групп приемов пищи -->
    <div class="meals-container" v-if="hasMeals">
      <!-- Завтрак -->
      <div class="meal-group mb-8" v-if="meals.breakfast.length > 0">
        <div class="meal-header">
          <h3 class="meal-title">
            <span class="meal-icon">🍳</span>
            Завтрак
          </h3>
          <div class="meal-nutrition">
            {{ getMealTotals('breakfast').calories }} ккал
          </div>
        </div>
        
        <div class="meal-items">
          <div class="meal-item" v-for="meal in meals.breakfast" :key="meal.id">
            <div class="meal-name">{{ meal.name }}</div>
            <div class="meal-quantity">{{ meal.quantity }}г</div>
            <div class="meal-nutrition">
              <span>{{ Math.round(meal.nutrition.calories) }} ккал</span>
              <span class="meal-macros">Б: {{ Math.round(meal.nutrition.proteins) }}г | Ж: {{ Math.round(meal.nutrition.fats) }}г | У: {{ Math.round(meal.nutrition.carbs) }}г</span>
            </div>
            <div class="meal-actions">
              <el-button 
                type="danger" 
                size="small" 
                icon="el-icon-delete" 
                circle 
                @click="deleteMeal(meal.id)"
              ></el-button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Обед -->
      <div class="meal-group mb-8" v-if="meals.lunch.length > 0">
        <div class="meal-header">
          <h3 class="meal-title">
            <span class="meal-icon">🍲</span>
            Обед
          </h3>
          <div class="meal-nutrition">
            {{ getMealTotals('lunch').calories }} ккал
          </div>
        </div>
        
        <div class="meal-items">
          <div class="meal-item" v-for="meal in meals.lunch" :key="meal.id">
            <div class="meal-name">{{ meal.name }}</div>
            <div class="meal-quantity">{{ meal.quantity }}г</div>
            <div class="meal-nutrition">
              <span>{{ Math.round(meal.nutrition.calories) }} ккал</span>
              <span class="meal-macros">Б: {{ Math.round(meal.nutrition.proteins) }}г | Ж: {{ Math.round(meal.nutrition.fats) }}г | У: {{ Math.round(meal.nutrition.carbs) }}г</span>
            </div>
            <div class="meal-actions">
              <el-button 
                type="danger" 
                size="small" 
                icon="el-icon-delete" 
                circle 
                @click="deleteMeal(meal.id)"
              ></el-button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Ужин -->
      <div class="meal-group mb-8" v-if="meals.dinner.length > 0">
        <div class="meal-header">
          <h3 class="meal-title">
            <span class="meal-icon">🍽️</span>
            Ужин
          </h3>
          <div class="meal-nutrition">
            {{ getMealTotals('dinner').calories }} ккал
          </div>
        </div>
        
        <div class="meal-items">
          <div class="meal-item" v-for="meal in meals.dinner" :key="meal.id">
            <div class="meal-name">{{ meal.name }}</div>
            <div class="meal-quantity">{{ meal.quantity }}г</div>
            <div class="meal-nutrition">
              <span>{{ Math.round(meal.nutrition.calories) }} ккал</span>
              <span class="meal-macros">Б: {{ Math.round(meal.nutrition.proteins) }}г | Ж: {{ Math.round(meal.nutrition.fats) }}г | У: {{ Math.round(meal.nutrition.carbs) }}г</span>
            </div>
            <div class="meal-actions">
              <el-button 
                type="danger" 
                size="small" 
                icon="el-icon-delete" 
                circle 
                @click="deleteMeal(meal.id)"
              ></el-button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Перекусы -->
      <div class="meal-group mb-8" v-if="meals.snack.length > 0">
        <div class="meal-header">
          <h3 class="meal-title">
            <span class="meal-icon">🍎</span>
            Перекусы
          </h3>
          <div class="meal-nutrition">
            {{ getMealTotals('snack').calories }} ккал
          </div>
        </div>
        
        <div class="meal-items">
          <div class="meal-item" v-for="meal in meals.snack" :key="meal.id">
            <div class="meal-name">{{ meal.name }}</div>
            <div class="meal-quantity">{{ meal.quantity }}г</div>
            <div class="meal-nutrition">
              <span>{{ Math.round(meal.nutrition.calories) }} ккал</span>
              <span class="meal-macros">Б: {{ Math.round(meal.nutrition.proteins) }}г | Ж: {{ Math.round(meal.nutrition.fats) }}г | У: {{ Math.round(meal.nutrition.carbs) }}г</span>
            </div>
            <div class="meal-actions">
              <el-button 
                type="danger" 
                size="small" 
                icon="el-icon-delete" 
                circle 
                @click="deleteMeal(meal.id)"
              ></el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Состояние, если нет записей за выбранный день -->
    <el-empty 
      v-if="!hasMeals" 
      description="В журнале питания нет записей за выбранный день" 
    ></el-empty>
    
    <!-- Модальное окно добавления продукта -->
    <el-dialog
      v-model="addProductVisible"
      title="Добавить новый продукт"
      width="500px"
    >
      <el-form 
        :model="newProduct" 
        :rules="productRules" 
        ref="productForm" 
        label-position="top"
      >
        <el-form-item label="Название продукта" prop="name">
          <el-input v-model="newProduct.name" placeholder="Введите название продукта" />
        </el-form-item>
        
        <el-form-item label="Калории (на 100г)" prop="calories">
          <el-input-number 
            v-model="newProduct.calories" 
            :min="0" 
            :max="5000" 
            :precision="0" 
            :step="1"
            class="w-full"
          />
        </el-form-item>
        
        <div class="grid grid-cols-3 gap-4">
          <el-form-item label="Белки (г)" prop="proteins">
            <el-input-number 
              v-model="newProduct.proteins" 
              :min="0" 
              :max="500" 
              :precision="1" 
              :step="0.1" 
              class="w-full"
            />
          </el-form-item>
          
          <el-form-item label="Жиры (г)" prop="fats">
            <el-input-number 
              v-model="newProduct.fats" 
              :min="0" 
              :max="500" 
              :precision="1" 
              :step="0.1"
              class="w-full"
            />
          </el-form-item>
          
          <el-form-item label="Углеводы (г)" prop="carbs">
            <el-input-number 
              v-model="newProduct.carbs" 
              :min="0" 
              :max="500" 
              :precision="1" 
              :step="0.1"
              class="w-full"
            />
          </el-form-item>
        </div>
        
        <el-form-item v-if="isAdmin">
          <el-checkbox v-model="newProduct.isPublic">Добавить в общую базу данных</el-checkbox>
          <div class="text-xs text-gray-500 mt-1">
            Если отмечено, продукт будет доступен всем пользователям
          </div>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addProductVisible = false">Отмена</el-button>
          <el-button type="primary" :loading="loading" @click="submitNewProduct">
            Добавить
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import axios from 'axios';
import { ElMessage } from 'element-plus';

export default {
  name: 'FoodDiaryPage',
  data() {
    return {
      searchQuery: '',
      selectedMealType: 'breakfast', // Выбранный тип приема пищи (завтрак по умолчанию)
      selectedDate: new Date().toISOString().split('T')[0], // Текущая дата в формате YYYY-MM-DD
      meals: {
        breakfast: [],
        lunch: [],
        dinner: [],
        snack: []
      },
      totals: {
        calories: 0,
        proteins: 0,
        fats: 0,
        carbs: 0
      },
      loading: false,
      addProductVisible: false,
      isAdmin: false,
      newProduct: {
        name: '',
        calories: 0,
        proteins: 0,
        fats: 0,
        carbs: 0,
        isPublic: false
      },
      productRules: {
        name: [
          { required: true, message: 'Пожалуйста, введите название продукта', trigger: 'blur' },
          { min: 2, message: 'Название должно быть не менее 2 символов', trigger: 'blur' }
        ],
        calories: [
          { required: true, message: 'Пожалуйста, укажите калорийность', trigger: 'blur' },
          { type: 'number', min: 0, max: 5000, message: 'Калории должны быть от 0 до 5000', trigger: 'blur' }
        ],
        proteins: [
          { required: true, message: 'Пожалуйста, укажите содержание белков', trigger: 'blur' },
          { type: 'number', min: 0, max: 500, message: 'Белки должны быть от 0 до 500г', trigger: 'blur' }
        ],
        fats: [
          { required: true, message: 'Пожалуйста, укажите содержание жиров', trigger: 'blur' },
          { type: 'number', min: 0, max: 500, message: 'Жиры должны быть от 0 до 500г', trigger: 'blur' }
        ],
        carbs: [
          { required: true, message: 'Пожалуйста, укажите содержание углеводов', trigger: 'blur' },
          { type: 'number', min: 0, max: 500, message: 'Углеводы должны быть от 0 до 500г', trigger: 'blur' }
        ]
      }
    };
  },
  computed: {
    // Проверка наличия приемов пищи
    hasMeals() {
      return this.meals.breakfast.length > 0 || 
             this.meals.lunch.length > 0 || 
             this.meals.dinner.length > 0 || 
             this.meals.snack.length > 0;
    }
  },
  created() {
    // Проверяем, является ли пользователь администратором
    this.checkIfAdmin();
    
    // Загружаем приемы пищи для текущей даты
    this.loadMeals();
  },
  methods: {
    // Проверка прав администратора
    checkIfAdmin() {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const tokenData = JSON.parse(atob(token.split('.')[1]));
          this.isAdmin = tokenData.userId === 1; // Считаем пользователя с userId=1 администратором
        } catch (error) {
          console.error('Ошибка при проверке прав администратора:', error);
          this.isAdmin = false;
        }
      } else {
        this.isAdmin = false;
      }
    },
    
    // Загрузка приемов пищи за выбранную дату
    async loadMeals() {
      console.log('Вызван метод loadMeals для даты:', this.selectedDate);
      this.loading = true;
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          ElMessage.warning('Необходимо авторизоваться для доступа к журналу питания');
          return;
        }
        
        console.log('Отправка запроса на получение приемов пищи');
        const response = await axios.get('http://localhost:3000/api/meals/get', {
          headers: { Authorization: `Bearer ${token}` },
          params: { date: this.selectedDate }
        });
        
        console.log('Получен ответ от сервера:', response.data);
        
        // Заполняем приемы пищи и итоги из ответа сервера
        this.meals = response.data.meals;
        this.totals = response.data.totals;
        console.log('Обновлены данные:', {
          breakfast: this.meals.breakfast.length,
          lunch: this.meals.lunch.length,
          dinner: this.meals.dinner.length,
          snack: this.meals.snack.length,
          totals: this.totals
        });
      } catch (error) {
        console.error('Ошибка при загрузке приемов пищи:', error);
        if (error.response) {
          console.error('Ответ сервера:', error.response.data);
          console.error('Статус ответа:', error.response.status);
        }
        ElMessage.error('Не удалось загрузить данные журнала питания');
      } finally {
        this.loading = false;
      }
    },
    
    // Изменение выбранной даты
    changeDate(days) {
      const date = new Date(this.selectedDate);
      date.setDate(date.getDate() + days);
      this.selectedDate = date.toISOString().split('T')[0];
      this.loadMeals();
    },
    
    // Расчет итогов КБЖУ для конкретного типа приема пищи
    getMealTotals(mealType) {
      const totals = {
        calories: 0,
        proteins: 0,
        fats: 0,
        carbs: 0
      };
      
      this.meals[mealType].forEach(meal => {
        totals.calories += meal.nutrition.calories;
        totals.proteins += meal.nutrition.proteins;
        totals.fats += meal.nutrition.fats;
        totals.carbs += meal.nutrition.carbs;
      });
      
      return {
        calories: Math.round(totals.calories),
        proteins: Math.round(totals.proteins),
        fats: Math.round(totals.fats),
        carbs: Math.round(totals.carbs)
      };
    },
    
    // Поиск продуктов с автодополнением
    async searchProducts(queryString, callback) {
      if (queryString.length < 2) {
        callback([]);
        return;
      }
      
      this.loading = true;
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        const response = await axios.get('http://localhost:3000/api/products/search', {
          params: {
            q: queryString,
            limit: 5
          },
          headers
        });
        
        callback(response.data);
      } catch (error) {
        console.error('Ошибка при поиске продуктов:', error);
        ElMessage.error('Ошибка при поиске продуктов. Пожалуйста, попробуйте снова.');
        callback([]);
      } finally {
        this.loading = false;
      }
    },
    
    // Обработка выбора продукта из списка
    async handleProductSelect(item) {
      console.log('Вызван метод handleProductSelect с продуктом:', item);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          ElMessage.warning('Необходимо авторизоваться для добавления продуктов');
          return;
        }
        
        // Стандартное количество - 100г
        const quantity = 100;
        
        console.log('Отправка запроса на добавление продукта в прием пищи:', {
          product_id: item.id,
          quantity,
          meal_type: this.selectedMealType,
          date: this.selectedDate
        });
        
        // Отправляем запрос на сервер для добавления приема пищи
        const response = await axios.post('http://localhost:3000/api/meals/add', {
          product_id: item.id,
          quantity,
          meal_type: this.selectedMealType,
          date: this.selectedDate
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('Получен ответ от сервера:', response.data);
        
        // Обновляем список приемов пищи
        console.log('Вызов loadMeals для обновления данных');
        await this.loadMeals();
        
        // Очищаем строку поиска
        this.searchQuery = '';
        
        ElMessage.success('Продукт добавлен в журнал питания');
      } catch (error) {
        console.error('Ошибка при добавлении продукта в журнал питания:', error);
        if (error.response) {
          console.error('Ответ сервера:', error.response.data);
          console.error('Статус ответа:', error.response.status);
        }
        ElMessage.error('Не удалось добавить продукт в журнал питания');
      }
    },
    
    // Удаление приема пищи из журнала
    async deleteMeal(mealId) {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        await axios.delete(`http://localhost:3000/api/meals/${mealId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Обновляем список приемов пищи
        this.loadMeals();
        
        ElMessage.success('Продукт удален из журнала питания');
      } catch (error) {
        console.error('Ошибка при удалении приема пищи:', error);
        ElMessage.error('Не удалось удалить продукт из журнала питания');
      }
    },
    
    // Открыть модальное окно добавления продукта
    openAddProductModal() {
      this.newProduct = {
        name: '',
        calories: 0,
        proteins: 0,
        fats: 0,
        carbs: 0,
        isPublic: false
      };
      this.addProductVisible = true;
    },
    
    // Добавление нового продукта
    async submitNewProduct() {
      this.$refs.productForm.validate(async (valid) => {
        if (!valid) return false;
        
        this.loading = true;
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            throw new Error('Требуется авторизация');
          }
          
          // Преобразуем данные в правильный формат
          const productData = {
            name: this.newProduct.name,
            calories: Number(this.newProduct.calories),
            proteins: Number(this.newProduct.proteins),
            fats: Number(this.newProduct.fats),
            carbs: Number(this.newProduct.carbs),
            isPublic: Boolean(this.newProduct.isPublic)
          };
          
          const response = await axios.post('http://localhost:3000/api/products/add', productData, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          // Закрываем модальное окно
          this.addProductVisible = false;
          
          // Показываем сообщение об успехе
          ElMessage.success('Продукт успешно добавлен');
          
          // Добавляем продукт в журнал питания, если создание прошло успешно
          if (response.data && response.data.product) {
            await this.handleProductSelect({
              id: response.data.product.id,
              name: response.data.product.name,
              calories: Number(response.data.product.calories) || 0,
              proteins: Number(response.data.product.proteins) || 0,
              fats: Number(response.data.product.fats) || 0,
              carbs: Number(response.data.product.carbs) || 0
            });
          }
        } catch (error) {
          let errorMessage = 'Ошибка при добавлении продукта';
          
          console.error('Ошибка при добавлении продукта:', error);
          if (error.response && error.response.data) {
            errorMessage = error.response.data.message || errorMessage;
          }
          
          ElMessage.error(errorMessage);
        } finally {
          this.loading = false;
        }
      });
    }
  }
};
</script>

<style scoped>
.food-diary {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.search-form {
  margin-bottom: 1rem;
  background-color: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.meal-type-selection {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.meal-type-label {
  font-weight: 600;
  margin-right: 0.5rem;
}

.date-navigation {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.daily-summary {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.summary-item .icon {
  font-size: 1.5rem;
  margin-bottom: 0.25rem;
}

.summary-item .value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
}

.summary-item .label {
  font-size: 0.9rem;
  color: #666;
  margin-top: 0.25rem;
}

.meal-group {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.meal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background-color: #f5f5f5;
  border-bottom: 1px solid #eee;
}

.meal-title {
  display: flex;
  align-items: center;
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
}

.meal-icon {
  font-size: 1.4rem;
  margin-right: 0.5rem;
}

.meal-nutrition {
  font-weight: 600;
  color: #4CAF50;
}

.meal-items {
  padding: 0.5rem;
}

.meal-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #eee;
}

.meal-item:last-child {
  border-bottom: none;
}

.meal-name {
  flex: 1;
  font-weight: 500;
}

.meal-quantity {
  width: 70px;
  text-align: center;
  color: #666;
  font-size: 0.9rem;
}

.meal-nutrition {
  width: 250px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.meal-macros {
  font-size: 0.8rem;
  color: #666;
  margin-top: 0.25rem;
}

.meal-actions {
  width: 50px;
  text-align: right;
}

/* Стили для корректного выравнивания input-number */
:deep(.el-input-number) {
  width: 100%;
}

:deep(.el-input-number .el-input__wrapper) {
  padding-right: 0;
}

:deep(.el-input-number .el-input__inner) {
  text-align: center;
  padding: 0 8px;
}

:deep(.el-input-number .el-input-number__decrease),
:deep(.el-input-number .el-input-number__increase) {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Стили для текстового поля ввода граммовки */
.weight-input {
  width: 100%;
}

:deep(.weight-input .el-input__wrapper) {
  padding: 0 8px;
}

:deep(.weight-input .el-input__inner) {
  text-align: center;
  -moz-appearance: textfield; /* Firefox */
}

/* Скрываем стрелки для числового поля в других браузерах */
:deep(.weight-input .el-input__inner::-webkit-outer-spin-button),
:deep(.weight-input .el-input__inner::-webkit-inner-spin-button) {
  -webkit-appearance: none;
  margin: 0;
}

/* Белый текст для заголовков и параграфов на фоне фонового изображения */
.food-diary h1,
.food-diary h2,
.food-diary p {
  color: white;
}

/* Адаптивность для мобильных устройств */
@media (max-width: 768px) {
  .meal-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .meal-nutrition,
  .meal-quantity {
    width: 100%;
    text-align: left;
  }
  
  .meal-actions {
    width: 100%;
    text-align: left;
    margin-top: 0.5rem;
  }
  
  .meal-nutrition {
    align-items: flex-start;
  }
}
</style> 