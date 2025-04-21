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
        
        <div class="mt-2 text-right">
          <el-button type="primary" @click="openAddProductModal">
            Добавить новый продукт
          </el-button>
        </div>
      </div>
    </div>
    
    <!-- Выбранные продукты -->
    <div class="selected-products" v-if="selectedProducts.length > 0">
      <h2 class="text-xl font-semibold mb-4">Выбранные продукты</h2>
      <el-table :data="selectedProducts" style="width: 100%">
        <el-table-column prop="name" label="Название" width="180" />
        <el-table-column label="Вес (г)" width="120">
          <template #default="scope">
            <el-input
              v-model.number="scope.row.quantity"
              type="number"
              size="small"
              min="1"
              max="5000"
              @change="updateNutrition(scope.$index)"
              class="weight-input"
            />
          </template>
        </el-table-column>
        <el-table-column label="Калории" width="100">
          <template #default="scope">
            {{ scope.row.calculatedCalories.toFixed(1) }}
          </template>
        </el-table-column>
        <el-table-column label="Белки (г)" width="100">
          <template #default="scope">
            {{ scope.row.calculatedProteins.toFixed(1) }}
          </template>
        </el-table-column>
        <el-table-column label="Жиры (г)" width="100">
          <template #default="scope">
            {{ scope.row.calculatedFats.toFixed(1) }}
          </template>
        </el-table-column>
        <el-table-column label="Углеводы (г)" width="100">
          <template #default="scope">
            {{ scope.row.calculatedCarbs.toFixed(1) }}
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="Действия" width="120">
          <template #default="scope">
            <el-button 
              type="danger" 
              size="small" 
              @click="removeProduct(scope.$index)"
            >
              Удалить
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- Итоги КБЖУ -->
      <div class="nutrition-summary mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 class="text-lg font-semibold mb-2">Итого за сегодня:</h3>
        <div class="grid grid-cols-4 gap-4">
          <div class="nutrition-item">
            <div class="label">Калории:</div>
            <div class="value">{{ getTotalNutrition('calories') }} ккал</div>
          </div>
          <div class="nutrition-item">
            <div class="label">Белки:</div>
            <div class="value">{{ getTotalNutrition('proteins') }} г</div>
          </div>
          <div class="nutrition-item">
            <div class="label">Жиры:</div>
            <div class="value">{{ getTotalNutrition('fats') }} г</div>
          </div>
          <div class="nutrition-item">
            <div class="label">Углеводы:</div>
            <div class="value">{{ getTotalNutrition('carbs') }} г</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Состояние, если нет выбранных продуктов -->
    <el-empty 
      v-else 
      description="В вашем дневнике пока нет продуктов. Воспользуйтесь поиском, чтобы добавить продукты." 
    />
    
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
      selectedProducts: [],
      loading: false,
      addProductVisible: false,
      isAdmin: false, // Заглушка, потом будем определять по токену
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
  created() {
    // Проверяем, является ли пользователь администратором
    this.checkIfAdmin();
  },
  methods: {
    // Проверка прав администратора
    checkIfAdmin() {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // В учебных целях просто получаем id пользователя из токена
          // В реальном приложении здесь должна быть проверка роли
          const tokenData = JSON.parse(atob(token.split('.')[1]));
          this.isAdmin = tokenData.id === 1; // Считаем пользователя с id=1 администратором
        } catch (error) {
          console.error('Ошибка при проверке прав администратора:', error);
          this.isAdmin = false;
        }
      } else {
        this.isAdmin = false;
      }
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
        
        console.log('Запрос поиска продуктов:', queryString);
        
        const response = await axios.get('/api/products/search', {
          params: {
            q: queryString,
            limit: 5
          },
          headers
        });
        
        console.log('Результаты поиска продуктов:', response.data);
        callback(response.data);
      } catch (error) {
        console.error('Ошибка при поиске продуктов:', error);
        if (error.response) {
          console.error('Ответ сервера:', error.response.data);
        }
        ElMessage({
          message: 'Ошибка при поиске продуктов. Пожалуйста, попробуйте снова.',
          type: 'error'
        });
        callback([]);
      } finally {
        this.loading = false;
      }
    },
    
    // Обработка выбора продукта из списка
    handleProductSelect(item) {
      // Стандартное количество - 100г
      const quantity = 100;
      
      // Преобразуем все значения в числа, чтобы избежать ошибок
      const calories = Number(item.calories) || 0;
      const proteins = Number(item.proteins) || 0;
      const fats = Number(item.fats) || 0;
      const carbs = Number(item.carbs) || 0;
      
      // Добавляем продукт в список выбранных с рассчитанными значениями
      this.selectedProducts.push({
        id: item.id,
        name: item.name,
        calories: calories,
        proteins: proteins,
        fats: fats,
        carbs: carbs,
        quantity: quantity,
        calculatedCalories: calories,
        calculatedProteins: proteins,
        calculatedFats: fats,
        calculatedCarbs: carbs
      });
      
      // Очищаем строку поиска
      this.searchQuery = '';
    },
    
    // Удаление продукта из списка
    removeProduct(index) {
      this.selectedProducts.splice(index, 1);
    },
    
    // Расчет общего количества калорий/белков/жиров/углеводов
    getTotalNutrition(nutrient) {
      const calculatedNutrient = 'calculated' + nutrient.charAt(0).toUpperCase() + nutrient.slice(1);
      const total = this.selectedProducts.reduce((sum, product) => {
        // Проверяем, что значение является числом
        const value = product[calculatedNutrient];
        return sum + (typeof value === 'number' ? value : 0);
      }, 0);
      
      // Проверяем, что результат - число
      return typeof total === 'number' ? total.toFixed(1) : '0.0';
    },
    
    // Обновление КБЖУ при изменении веса продукта
    updateNutrition(index) {
      const product = this.selectedProducts[index];
      let quantity = parseFloat(product.quantity);
      
      // Валидация введенного значения
      if (isNaN(quantity) || quantity < 1) {
        quantity = 1;
        this.selectedProducts[index].quantity = 1;
      } else if (quantity > 5000) {
        quantity = 5000;
        this.selectedProducts[index].quantity = 5000;
      }
      
      // Убедимся, что базовые значения - числа
      const calories = Number(product.calories) || 0;
      const proteins = Number(product.proteins) || 0;
      const fats = Number(product.fats) || 0;
      const carbs = Number(product.carbs) || 0;
      
      // Пересчитываем КБЖУ согласно весу
      const calculatedCalories = (calories * quantity) / 100;
      const calculatedProteins = (proteins * quantity) / 100;
      const calculatedFats = (fats * quantity) / 100;
      const calculatedCarbs = (carbs * quantity) / 100;
      
      this.selectedProducts[index] = {
        ...product,
        quantity,
        calories,
        proteins,
        fats,
        carbs,
        calculatedCalories,
        calculatedProteins,
        calculatedFats,
        calculatedCarbs
      };
    },
    
    // Открыть модальное окно добавления продукта
    openAddProductModal() {
      // Сбрасываем форму
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
      // Проверяем валидность формы
      this.$refs.productForm.validate(async (valid) => {
        if (!valid) {
          return false;
        }
        
        this.loading = true;
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            throw new Error('Требуется авторизация');
          }
          
          console.log('Отправка данных нового продукта:', this.newProduct);
          
          // Преобразуем данные в правильный формат
          const productData = {
            name: this.newProduct.name,
            calories: Number(this.newProduct.calories),
            proteins: Number(this.newProduct.proteins),
            fats: Number(this.newProduct.fats),
            carbs: Number(this.newProduct.carbs),
            isPublic: Boolean(this.newProduct.isPublic)
          };
          
          const response = await axios.post('/api/products/add', productData, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          console.log('Ответ сервера:', response.data);
          
          // Закрываем модальное окно
          this.addProductVisible = false;
          
          // Показываем сообщение об успехе
          ElMessage({
            message: 'Продукт успешно добавлен',
            type: 'success'
          });
          
          // Преобразуем значения с сервера в числа
          const newProduct = response.data.product;
          this.handleProductSelect({
            id: newProduct.id,
            name: newProduct.name,
            calories: Number(newProduct.calories) || 0,
            proteins: Number(newProduct.proteins) || 0,
            fats: Number(newProduct.fats) || 0,
            carbs: Number(newProduct.carbs) || 0
          });
          
        } catch (error) {
          let errorMessage = 'Ошибка при добавлении продукта';
          
          console.error('Ошибка при добавлении продукта:', error);
          if (error.response) {
            console.error('Ответ сервера:', error.response.data);
            
            if (error.response.data && error.response.data.message) {
              errorMessage = error.response.data.message;
              
              // Если есть детали ошибки, показываем их
              if (error.response.data.details) {
                errorMessage = error.response.data.details;
              }
            }
          }
          
          ElMessage({
            message: errorMessage,
            type: 'error',
            duration: 5000
          });
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
}

.product-suggestion {
  padding: 5px 0;
}

.nutrition-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem;
  border-radius: 4px;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.label {
  font-weight: 600;
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
</style> 