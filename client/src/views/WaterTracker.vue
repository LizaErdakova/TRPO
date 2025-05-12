<template>
  <div class="water-tracker">
    <h1 class="text-2xl font-bold mb-6" style="color: white;">Трекер воды</h1>
    
    <!-- Карточка с отслеживанием воды -->
    <div class="water-card">
      <div class="info-section">
        <div class="date-control">
          <el-button @click="changeDate(-1)" icon="el-icon-arrow-left" circle></el-button>
          <el-date-picker
            v-model="selectedDate"
            type="date"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            placeholder="Выберите дату"
            @change="loadWaterStatus"
          ></el-date-picker>
          <el-button @click="changeDate(1)" icon="el-icon-arrow-right" circle></el-button>
        </div>

        <div class="water-info">
          <div class="water-stats">
            <div class="stat-item">
              <div class="stat-label">Выпито</div>
              <div class="stat-value">{{ waterAmount }} мл</div>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <div class="stat-label">Норма</div>
              <div class="stat-value">{{ waterNorm }} мл</div>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <div class="stat-label">Осталось</div>
              <div class="stat-value">{{ remainingAmount }} мл</div>
            </div>
          </div>
          
          <div class="water-progress-container">
            <div class="water-graphic">
              <div class="water-level" :style="{ height: `${percentCompleted}%` }">
                <div class="water-waves"></div>
              </div>
            </div>
            <div class="progress-text">{{ percentCompleted }}%</div>
          </div>
        </div>
      </div>
      
      <div class="add-water-section">
        <h3 class="section-title">Добавить воду</h3>
        
        <div class="quick-add-buttons">
          <el-button 
            v-for="amount in [100, 200, 300, 500]" 
            :key="amount"
            class="quick-add-button"
            @click="addWater(amount)"
          >
            +{{ amount }} мл
          </el-button>
        </div>
        
        <div class="custom-amount">
          <el-input-number
            v-model="customAmount"
            :min="1"
            :max="5000"
            :step="50"
            placeholder="Введите объем"
          />
          <el-button type="primary" @click="addWater(customAmount)">
            Добавить воду
          </el-button>
        </div>
      </div>
      
      <!-- Секция удаления воды -->
      <div class="remove-water-section" v-if="waterAmount > 0">
        <h3 class="section-title">Удалить воду</h3>
        
        <div class="quick-remove-buttons">
          <el-button 
            v-for="amount in [100, 200, 300, 500]" 
            :key="amount"
            class="quick-remove-button"
            @click="removeWater(amount)"
            :disabled="amount > waterAmount"
          >
            -{{ amount }} мл
          </el-button>
        </div>
        
        <div class="custom-amount">
          <el-input-number
            v-model="removeAmount"
            :min="1"
            :max="waterAmount"
            :step="50"
            placeholder="Введите объем"
          />
          <el-button type="danger" @click="removeWater(removeAmount)" :disabled="!removeAmount || removeAmount <= 0">
            Удалить воду
          </el-button>
        </div>
      </div>
      
      <div class="water-history-section" v-if="waterHistory.length > 0">
        <h3 class="section-title">История потребления воды</h3>
        <div class="history-chart">
          <div
            v-for="(entry, index) in displayedHistory"
            :key="index"
            class="history-bar"
            :class="{ 'current-day': entry.date === selectedDate }"
          >
            <div class="history-day">{{ formatDay(entry.date) }}</div>
            <div class="history-bar-container">
              <div 
                class="history-bar-fill"
                :style="{
                  height: (entry.percentCompleted || 0) + '%'
                }"
              >
                <div class="water-waves-small" v-if="entry.percentCompleted > 0"></div>
              </div>
            </div>
            <div class="history-amount">{{ Math.round((entry.amount || 0) / 100) / 10 }}л</div>
          </div>
        </div>

        <!-- Временный блок для отладки -->
        <div v-if="false" class="debug-info">
          <h4 class="section-title">Отладочная информация (данные истории)</h4>
          <div v-for="(entry, index) in waterHistory" :key="'debug-' + index" style="margin-bottom: 8px; font-size: 12px;">
            <strong>Дата:</strong> {{ entry.date }} |
            <strong>Количество:</strong> {{ entry.amount }} мл |
            <strong>Процент:</strong> {{ entry.percentCompleted }}%
          </div>
        </div>
      </div>
    </div>
    
    <div class="water-tips">
      <h3 class="tips-title">Советы для достаточного потребления воды:</h3>
      <ul class="tips-list">
        <li>Начинайте день со стакана воды</li>
        <li>Установите регулярные напоминания</li>
        <li>Носите с собой многоразовую бутылку</li>
        <li>Пейте стакан воды за 30 минут до еды</li>
        <li>Добавляйте в воду ломтики фруктов для вкуса</li>
      </ul>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { ElMessage } from 'element-plus';

export default {
  name: 'WaterTrackerPage',
  data() {
    return {
      selectedDate: new Date().toISOString().split('T')[0], // Текущая дата в формате YYYY-MM-DD
      waterAmount: 0, // Выпито воды в мл
      waterNorm: 2000, // Норма воды в мл (будет рассчитана динамически)
      percentCompleted: 0, // Процент выполнения дневной нормы
      customAmount: 250, // Пользовательский объем добавляемой воды
      removeAmount: 100, // Пользовательский объем удаляемой воды
      loading: false,
      waterHistory: [] // История потребления воды
    };
  },
  computed: {
    remainingAmount() {
      const remaining = this.waterNorm - this.waterAmount;
      return remaining > 0 ? remaining : 0;
    },
    
    // Вычисляемое свойство для отображения истории с выбранной датой по центру
    displayedHistory() {
      if (!this.waterHistory || this.waterHistory.length === 0) {
        return this.createEmptyHistory();
      }
      
      // Создаем массив дат для отображения (3 до, 1 текущая, 3 после)
      const dates = [];
      const today = new Date(this.selectedDate);
      
      // Добавляем 3 даты до выбранной
      for (let i = 3; i > 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        dates.push(date.toISOString().split('T')[0]);
      }
      
      // Добавляем выбранную дату
      dates.push(this.selectedDate);
      
      // Добавляем 3 даты после выбранной
      for (let i = 1; i <= 3; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        dates.push(date.toISOString().split('T')[0]);
      }
      
      // Преобразуем даты в объекты записей
      const result = dates.map(date => {
        // Для текущей даты используем актуальные значения из состояния компонента
        if (date === this.selectedDate) {
          return {
            date: this.selectedDate,
            amount: this.waterAmount,
            percentCompleted: this.waterAmount > 0 ? this.percentCompleted : 5, // Минимум 5% для пустых сосудов
            isVirtual: false
          };
        }
        
        // Для других дат ищем записи в истории - проверяем все возможные форматы даты
        let historyEntry = this.waterHistory.find(entry => entry.date === date);
        
        // Если не нашли по точному совпадению, пробуем найти по дате без учета формата
        if (!historyEntry) {
          const targetDate = new Date(date).setHours(0, 0, 0, 0);
          historyEntry = this.waterHistory.find(entry => {
            const entryDate = new Date(entry.date).setHours(0, 0, 0, 0);
            return entryDate === targetDate;
          });
        }
        
        if (historyEntry) {
          // Для дат с историей возвращаем значения из истории
          return {
            date,
            amount: historyEntry.amount || 0,
            percentCompleted: historyEntry.amount > 0 
              ? Math.max(historyEntry.percentCompleted || Math.min(Math.round((historyEntry.amount / 2000) * 100), 100), 5) 
              : 5,
            isVirtual: false
          };
        }
        
        // Для дат без записей создаем пустые записи
        return {
          date,
          amount: 0,
          percentCompleted: 5, // Минимальное отображение воды (5%)
          isVirtual: true
        };
      });
      
      return result;
    },
    // Добавим метод для создания пустой истории
    createEmptyHistory() {
      const dates = [];
      const today = new Date(this.selectedDate);
      
      // Добавляем 3 даты до выбранной
      for (let i = 3; i > 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        dates.push(date.toISOString().split('T')[0]);
      }
      
      // Добавляем выбранную дату
      dates.push(this.selectedDate);
      
      // Добавляем 3 даты после выбранной
      for (let i = 1; i <= 3; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        dates.push(date.toISOString().split('T')[0]);
      }
      
      return dates.map(date => ({
        date,
        amount: date === this.selectedDate ? this.waterAmount : 0,
        percentCompleted: date === this.selectedDate ? Math.max(this.percentCompleted, 5) : 5, // Минимум 5%
        isVirtual: true
      }));
    }
  },
  created() {
    // Загружаем данные о воде при создании компонента
    this.loadWaterStatus();
    
    // Загружаем историю потребления воды
    this.loadWaterHistory();
  },
  watch: {
    // Наблюдаем за изменением выбранной даты
    selectedDate(newDate, oldDate) {
      console.log(`Дата изменена с ${oldDate} на ${newDate}`);
      if (newDate !== oldDate) {
        // При изменении даты обновляем запись в истории для предыдущей даты
        this.updateCurrentDayInHistory();
      }
    }
  },
  methods: {
    // Загрузка статуса потребления воды за выбранную дату
    async loadWaterStatus() {
      this.loading = true;
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          ElMessage.warning('Необходимо авторизоваться для доступа к трекеру воды');
          return;
        }
        
        const response = await axios.get('http://localhost:3000/api/water/status', {
          headers: { Authorization: `Bearer ${token}` },
          params: { date: this.selectedDate }
        });
        
        this.waterAmount = response.data.amount;
        this.waterNorm = response.data.norm;
        this.percentCompleted = response.data.percentCompleted;
        
        // Обновляем запись в истории для текущей даты, если она уже существует
        this.updateCurrentDayInHistory();
      } catch (error) {
        console.error('Ошибка при загрузке данных о потреблении воды:', error);
        ElMessage.error('Не удалось загрузить данные о потреблении воды');
      } finally {
        this.loading = false;
      }
    },
    
    // Обновляем запись в истории для текущей даты
    updateCurrentDayInHistory() {
      if (!this.waterHistory || this.waterHistory.length === 0) return;
      
      const currentDayIndex = this.waterHistory.findIndex(entry => entry.date === this.selectedDate);
      
      if (currentDayIndex !== -1) {
        // Обновляем существующую запись
        this.waterHistory[currentDayIndex] = {
          ...this.waterHistory[currentDayIndex],
          amount: this.waterAmount,
          percentCompleted: this.percentCompleted
        };
      } else {
        // Добавляем новую запись для текущего дня
        this.waterHistory.push({
          date: this.selectedDate,
          amount: this.waterAmount,
          percentCompleted: this.percentCompleted
        });
        
        // Сортируем историю по датам
        this.waterHistory.sort((a, b) => new Date(a.date) - new Date(b.date));
      }
    },
    
    // Загрузка истории потребления воды при смене даты и первоначально
    async loadWaterHistory() {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const response = await axios.get('http://localhost:3000/api/water/history', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('Получена история из API:', response.data);
        
        // Убедимся, что у нас есть корректный массив истории
        const historyData = Array.isArray(response.data.history) 
          ? response.data.history 
          : (response.data.data || []);
        
        // Преобразуем и сортируем историю по дате (от ранних к поздним)
        this.waterHistory = historyData
          .filter(entry => entry && entry.date) // Убедимся, что у записи есть дата
          .map(entry => ({
            date: entry.date,
            amount: entry.amount || 0,
            percentCompleted: entry.percentCompleted || (entry.amount > 0 ? Math.min(Math.round((entry.amount / 2000) * 100), 100) : 0)
          }))
          .sort((a, b) => new Date(a.date) - new Date(b.date));
        
        console.log('Сохраненная история в компоненте:', this.waterHistory);
        
        // Обновляем текущий день в истории
        this.updateCurrentDayInHistory();
      } catch (error) {
        console.error('Ошибка при загрузке истории потребления воды:', error);
      }
    },
    
    // Добавление записи о выпитой воде
    async addWater(amount) {
      if (!amount || amount <= 0) {
        ElMessage.warning('Укажите корректное количество воды');
        return;
      }
      
      this.loading = true;
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          ElMessage.warning('Необходимо авторизоваться для добавления записи о воде');
          return;
        }
        
        const response = await axios.post('http://localhost:3000/api/water/track', {
          amount,
          date: this.selectedDate
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Обновляем данные из ответа
        const waterData = response.data.water;
        this.waterAmount = waterData.amount;
        this.waterNorm = waterData.norm;
        this.percentCompleted = waterData.percentCompleted;
        
        // Показываем сообщение об успехе
        ElMessage.success(`Добавлено ${amount} мл воды`);
        
        // Обновляем историю потребления
        this.loadWaterHistory();
      } catch (error) {
        console.error('Ошибка при добавлении записи о воде:', error);
        ElMessage.error('Не удалось добавить запись о воде');
      } finally {
        this.loading = false;
      }
    },
    
    // Удаление записи о выпитой воде
    async removeWater(amount) {
      if (!amount || amount <= 0 || amount > this.waterAmount) {
        ElMessage.warning('Укажите корректное количество воды для удаления');
        return;
      }
      
      this.loading = true;
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          ElMessage.warning('Необходимо авторизоваться для удаления записи о воде');
          return;
        }
        
        const response = await axios.delete('http://localhost:3000/api/water/remove', {
          headers: { Authorization: `Bearer ${token}` },
          data: {
            amount,
            date: this.selectedDate
          }
        });
        
        // Обновляем данные из ответа
        const waterData = response.data.water;
        this.waterAmount = waterData.amount;
        this.waterNorm = waterData.norm;
        this.percentCompleted = waterData.percentCompleted;
        
        // Показываем сообщение об успехе
        ElMessage.success(`Удалено ${amount} мл воды`);
        
        // Обновляем историю потребления
        this.loadWaterHistory();
      } catch (error) {
        console.error('Ошибка при удалении записи о воде:', error);
        if (error.response && error.response.data) {
          ElMessage.error(error.response.data.message || 'Не удалось удалить запись о воде');
        } else {
          ElMessage.error('Не удалось удалить запись о воде');
        }
      } finally {
        this.loading = false;
      }
    },
    
    // Изменение выбранной даты
    async changeDate(days) {
      // Сначала сохраняем данные для текущей даты
      this.updateCurrentDayInHistory();
      
      // Затем меняем дату
      const date = new Date(this.selectedDate);
      date.setDate(date.getDate() + days);
      this.selectedDate = date.toISOString().split('T')[0];
      
      // Загружаем данные для новой даты
      await this.loadWaterStatus();
    },
    
    // Форматирование дня недели для истории потребления
    formatDay(dateStr) {
      try {
        const date = new Date(dateStr);
        const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
        const dayName = days[date.getDay()];
        const dayNum = date.getDate();
        
        return `${dayName} ${dayNum}`;
      } catch (e) {
        console.error('Ошибка форматирования даты:', e);
        return dateStr;
      }
    }
  }
};
</script>

<style scoped>
.water-tracker {
  padding: 2rem;
  max-width: 1000px;
  margin: 0 auto;
}

/* Основная карточка трекера воды */
.water-card {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  margin-bottom: 2rem;
}

/* Секция с информацией о воде */
.info-section {
  margin-bottom: 2rem;
}

.date-control {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.water-info {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
}

.water-stats {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 300px;
}

.stat-item {
  text-align: center;
  flex: 1;
}

.stat-label {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
}

.stat-divider {
  width: 1px;
  background-color: #eee;
  height: 50px;
}

.water-progress-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 200px;
}

.water-graphic {
  width: 120px;
  height: 200px;
  border-radius: 60px;
  border: 2px solid #3498db;
  overflow: hidden;
  background-color: #f5f5f5;
  position: relative;
  margin-right: 1.5rem;
}

.water-level {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #3498db;
  transition: height 0.5s;
  overflow: hidden;
}

.water-waves {
  position: absolute;
  top: -10px;
  left: 0;
  width: 100%;
  height: 20px;
  background: linear-gradient(
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent 
  );
  animation: waveAnimation 2s infinite linear;
}

@keyframes waveAnimation {
  0% { 
    transform: translateX(-50%); 
  }
  100% { 
    transform: translateX(50%); 
  }
}

.progress-text {
  font-size: 2rem;
  font-weight: bold;
  color: #3498db;
}

/* Секция добавления воды */
.add-water-section {
  padding-top: 1.5rem;
  border-top: 1px solid #eee;
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #333;
}

.quick-add-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.quick-add-button {
  min-width: 100px;
}

.custom-amount {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

/* История потребления воды */
.water-history-section {
  padding-top: 1.5rem;
  border-top: 1px solid #eee;
  margin-bottom: 1.5rem;
}

.history-chart {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 1rem;
  height: 200px;
  margin-top: 1.5rem;
}

.history-bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 50px;
}

.history-bar.current-day .history-day {
  font-weight: bold;
  color: #333;
}

.history-day {
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.history-bar-container {
  width: 30px;
  height: 120px;
  background-color: #f0f0f0;
  border-radius: 15px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  box-sizing: border-box;
  border: 1px solid #d4e6f1;
}

.history-bar.current-day .history-bar-container {
  border: 2px solid #3498db;
  box-shadow: 0 0 8px rgba(52, 152, 219, 0.5);
}

.history-bar-fill {
  position: absolute; 
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: #3498db !important; /* Принудительно применяем синий цвет */
  transition: height 0.5s;
  min-height: 1px;
  overflow: hidden;
  z-index: 1; /* Гарантируем, что заполнение будет поверх фона */
}

.water-waves-small {
  position: absolute;
  top: -5px;
  left: 0;
  width: 100%;
  height: 10px;
  background: linear-gradient(
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent 
  );
  animation: waveAnimationSmall 2.5s infinite linear;
  opacity: 0.7;
}

@keyframes waveAnimationSmall {
  0% { 
    transform: translateX(-60%); 
  }
  100% { 
    transform: translateX(60%); 
  }
}

.history-amount {
  font-size: 0.8rem;
  color: #333;
  margin-top: 0.5rem;
  font-weight: 500;
}

.history-bar.current-day .history-amount {
  font-weight: bold;
  color: #3498db;
}

/* Советы по потреблению воды */
.water-tips {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 1.5rem;
}

.tips-title {
  color:rgb(2, 78, 16);
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.tips-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 0.5rem;
  padding-left: 1.5rem;
}

.tips-list li {
  color:rgb(2, 78, 16);
}

/* Адаптивность */
@media (max-width: 768px) {
  .water-stats {
    flex-direction: column;
    gap: 1rem;
  }
  
  .stat-divider {
    width: 80%;
    height: 1px;
  }
  
  .water-info {
    flex-direction: column;
  }
  
  .water-progress-container {
    flex-direction: column;
    align-items: center;
  }
  
  .water-graphic {
    margin-right: 0;
    margin-bottom: 1rem;
  }
  
  .history-chart {
    overflow-x: auto;
    padding-bottom: 1rem;
    justify-content: flex-start;
  }
}

/* Стили для кнопок быстрого удаления */
.quick-remove-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.quick-remove-button {
  min-width: 100px;
}

/* Стили для кнопок быстрого удаления (сделать их белыми, как кнопки добавления) */
.quick-remove-button.el-button {
  background-color: white;
  color: #606266;
  border-color: #DCDFE6;
}

.quick-remove-button.el-button:hover {
  color: #409EFF;
  border-color: #c6e2ff;
  background-color: #ecf5ff;
}

.quick-remove-button.el-button:disabled {
  color: #C0C4CC;
  cursor: not-allowed;
  background-color: #FFF;
  border-color: #EBEEF5;
}
</style> 