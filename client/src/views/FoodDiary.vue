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
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'FoodDiaryPage',
  data() {
    return {
      searchQuery: '',
      selectedProducts: [],
      loading: false
    };
  },
  methods: {
    // Поиск продуктов с автодополнением
    async searchProducts(queryString, callback) {
      if (queryString.length < 2) {
        callback([]);
        return;
      }
      
      this.loading = true;
      try {
        const response = await axios.get('/api/products/search', {
          params: {
            q: queryString,
            limit: 5
          }
        });
        callback(response.data);
      } catch (error) {
        console.error('Ошибка при поиске продуктов:', error);
        callback([]);
      } finally {
        this.loading = false;
      }
    },
    
    // Обработка выбора продукта из списка
    handleProductSelect(item) {
      // Стандартное количество - 100г
      const quantity = 100;
      
      // Добавляем продукт в список выбранных с рассчитанными значениями
      this.selectedProducts.push({
        id: item.id,
        name: item.name,
        calories: item.calories,
        proteins: item.proteins,
        fats: item.fats,
        carbs: item.carbs,
        quantity: quantity,
        calculatedCalories: item.calories,
        calculatedProteins: item.proteins,
        calculatedFats: item.fats,
        calculatedCarbs: item.carbs
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
      return this.selectedProducts.reduce((total, product) => {
        return total + product[calculatedNutrient];
      }, 0).toFixed(1);
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
      
      // Пересчитываем КБЖУ согласно весу
      const calculatedCalories = (product.calories * quantity) / 100;
      const calculatedProteins = (product.proteins * quantity) / 100;
      const calculatedFats = (product.fats * quantity) / 100;
      const calculatedCarbs = (product.carbs * quantity) / 100;
      
      this.selectedProducts[index] = {
        ...product,
        quantity,
        calculatedCalories,
        calculatedProteins,
        calculatedFats,
        calculatedCarbs
      };
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