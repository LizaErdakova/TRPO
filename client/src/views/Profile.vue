<template>
  <div class="profile-page">
    <div class="profile-container">
      <div class="sidebar">
        <div class="favorites-section">
          <h3 class="sidebar-title">
            <span class="icon">🔖</span> Избранное
          </h3>
          <ul class="favorites-list">
            <li>Сосиски - 100 грамм</li>
            <li>Плов узбекский - 1 порция</li>
            <li>Чикенбургер ВиТ - 1 шт.</li>
          </ul>
        </div>
        
        <div class="daily-progress-section">
          <h3 class="sidebar-title">
            <span class="icon">⚡</span> Прогресс за день
          </h3>
          <div class="progress-item">
            <div class="progress-label">ККАЛ: {{ dailyProgress.calories }}/{{ dailyNorm.calories }}</div>
          </div>
          <div class="progress-item">
            <div class="progress-label">Белки: {{ dailyProgress.proteins }}/{{ dailyNorm.proteins }} г</div>
          </div>
          <div class="progress-item">
            <div class="progress-label">Жиры: {{ dailyProgress.fats }}/{{ dailyNorm.fats }} г</div>
          </div>
          <div class="progress-item">
            <div class="progress-label">Углеводы: {{ dailyProgress.carbs }}/{{ dailyNorm.carbs }} г</div>
          </div>
          <div class="progress-item">
            <div class="progress-label">Вода: {{ dailyProgress.water }}/{{ dailyNorm.water }} л</div>
          </div>
        </div>
        
        <button class="sidebar-btn add-meal-btn">Добавить прием пищи</button>
        <button class="sidebar-btn settings-btn">Настройки</button>
      </div>
      
      <div class="main-content">
        <h1 class="page-title">Профиль</h1>
        
        <div class="profile-info-card">
          <div class="profile-header">
            <div class="profile-avatar" v-if="userProfile.avatarUrl">
              <img :src="userProfile.avatarUrl" alt="Аватар пользователя" />
            </div>
            <div class="profile-avatar placeholder" v-else>
              {{ userInitials }}
            </div>
            
            <div class="profile-details">
              <div class="profile-field">Имя: {{ userProfile.name }}</div>
              <div class="profile-field">Возраст: {{ userProfile.age }}л</div>
              <div class="profile-field">Рост: {{ userProfile.height }}см</div>
              <div class="profile-field">Вес: {{ userProfile.weight }} кг</div>
              <div class="profile-field">Цель: {{ userProfile.goal }}</div>
            </div>
          </div>
          
          <button class="edit-profile-btn" @click="openEditProfileModal">Изменить данные</button>
        </div>
        
        <div class="progress-card">
          <h2 class="section-title">Мой прогресс</h2>
          <div class="weight-chart">
            <!-- Здесь будет график изменения веса -->
            <div class="chart-placeholder">
              График изменения веса будет здесь
            </div>
          </div>
          
          <div class="nutrition-summary">
            <div class="summary-item">
              <div class="summary-label">Цель:</div>
              <div class="summary-value">{{ userProfile.goal }}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Суточная норма КБЖУ:</div>
              <div class="summary-value">{{ dailyNorm.calories }}ккал</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Фактическое потребление:</div>
              <div class="summary-value">{{ dailyProgress.calories }} ккал</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Вода:</div>
              <div class="summary-value">{{ dailyProgress.water }} из {{ dailyNorm.water }} л</div>
            </div>
          </div>
        </div>
        
        <div class="statistics-card">
          <h2 class="section-title">Статистика</h2>
          <div class="statistics-content">
            <div class="charts-container">
              <div class="chart-placeholder calories-chart">
                Калории
              </div>
              <div class="chart-placeholder protein-chart">
                Белки
              </div>
              <div class="chart-placeholder carbs-chart">
                Углеводы
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';

export default {
  name: 'ProfilePage',
  setup() {
    const userProfile = ref({
      name: 'Пользователь',
      age: 25,
      height: 180,
      weight: 75,
      goal: 'сбросить вес',
      avatarUrl: null
    });
    
    const dailyNorm = ref({
      calories: 2000,
      proteins: 80,
      fats: 80,
      carbs: 200,
      water: 2
    });
    
    const dailyProgress = ref({
      calories: 1200,
      proteins: 60,
      fats: 40,
      carbs: 150,
      water: 1.6
    });
    
    const userInitials = computed(() => {
      if (!userProfile.value.name) return '';
      return userProfile.value.name.split(' ')
        .map(name => name.charAt(0).toUpperCase())
        .join('')
        .substring(0, 2);
    });
    
    const loadUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const response = await axios.get('http://localhost:3000/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data) {
          userProfile.value = {
            name: response.data.name || 'Пользователь',
            age: response.data.age || 25,
            height: response.data.height || 180,
            weight: response.data.weight || 75,
            goal: 'сбросить вес', // Это поле можно добавить в базу данных
            avatarUrl: null
          };
        }
        
        // Загрузка суточной нормы калорий
        const caloriesResponse = await axios.get('http://localhost:3000/api/calories/user', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (caloriesResponse.data) {
          dailyNorm.value = {
            calories: caloriesResponse.data.daily_calories || 2000,
            proteins: caloriesResponse.data.proteins || 80,
            fats: caloriesResponse.data.fats || 80,
            carbs: caloriesResponse.data.carbs || 200,
            water: 2
          };
        }
        
      } catch (error) {
        console.error('Ошибка при загрузке профиля:', error);
      }
    };
    
    const openEditProfileModal = () => {
      alert('Функция редактирования профиля в разработке');
    };
    
    onMounted(() => {
      loadUserProfile();
    });
    
    return {
      userProfile,
      dailyNorm,
      dailyProgress,
      userInitials,
      openEditProfileModal
    };
  }
};
</script>

<style scoped>
.profile-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.profile-container {
  display: flex;
  gap: 2rem;
}

.sidebar {
  width: 300px;
  flex-shrink: 0;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
}

.main-content {
  flex: 1;
}

.page-title {
  margin-bottom: 1.5rem;
  font-size: 2rem;
  color: #333;
}

.sidebar-title {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  font-size: 1.2rem;
  color: #333;
}

.icon {
  margin-right: 0.5rem;
}

.favorites-list {
  list-style: none;
  padding: 0;
  margin-bottom: 2rem;
}

.favorites-list li {
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
  color: #555;
}

.progress-item {
  margin-bottom: 0.5rem;
}

.progress-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.25rem;
  font-size: 0.9rem;
  color: #555;
}

.sidebar-btn {
  width: 100%;
  padding: 0.75rem;
  margin-top: 1rem;
  border: none;
  border-radius: 4px;
  background-color: #4CAF50;
  color: white;
  cursor: pointer;
  transition: background-color 0.3s;
}

.sidebar-btn:hover {
  background-color: #45a049;
}

.settings-btn {
  background-color: #f5f5f5;
  color: #333;
}

.settings-btn:hover {
  background-color: #e0e0e0;
}

.profile-info-card,
.progress-card,
.statistics-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.profile-header {
  display: flex;
  gap: 2rem;
  margin-bottom: 1rem;
}

.profile-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
}

.profile-avatar.placeholder {
  background-color: #4CAF50;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
}

.profile-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-details {
  flex: 1;
}

.profile-field {
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
  color: #333;
}

.edit-profile-btn {
  padding: 0.75rem 1.5rem;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.edit-profile-btn:hover {
  background-color: #45a049;
}

.section-title {
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  color: #333;
}

.chart-placeholder {
  height: 200px;
  background-color: #f5f5f5;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #777;
  margin-bottom: 1.5rem;
}

.nutrition-summary {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.summary-item {
  display: flex;
  flex-direction: column;
}

.summary-label {
  font-size: 0.9rem;
  color: #777;
}

.summary-value {
  font-size: 1.1rem;
  font-weight: 500;
  color: #333;
}

.charts-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

@media (max-width: 992px) {
  .profile-container {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
  }
  
  .nutrition-summary,
  .charts-container {
    grid-template-columns: 1fr;
  }
}
</style> 