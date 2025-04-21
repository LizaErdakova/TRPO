<template>
  <div class="home">
    <main class="main-content">
      <div class="hero-section">
        <h1>Добро пожаловать в FitFuel</h1>
        <p>Ваш персональный помощник в подсчете калорий и достижении целей</p>
        <div class="cta-buttons">
          <router-link to="/calculator" class="cta-btn">Начать путь к здоровью</router-link>
          <router-link to="/food-diary" class="cta-btn secondary" v-if="isAuthenticated">Вести дневник питания</router-link>
          <router-link to="/register" class="cta-btn secondary" v-else>Попробовать калькулятор</router-link>
        </div>
      </div>
    </main>

    <footer class="footer">
      <div class="footer-content">
        <div class="contact-info">
          <p>Почта: fitfuel@greu.rf</p>
          <p>Телефон: 88005553535</p>
        </div>
        <div class="social-links">
          <a href="#" class="social-link">ВКонтакте</a>
          <a href="#" class="social-link">РЭУ.РФ</a>
          <a href="#" class="social-link">Телеграм</a>
        </div>
        <button class="feedback-btn">Оставить отзыв</button>
      </div>
    </footer>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';

export default {
  name: 'HomePage',
  setup() {
    const isAuthenticated = ref(false);
    
    const checkAuthStatus = () => {
      const token = localStorage.getItem('token');
      isAuthenticated.value = !!token;
    };
    
    onMounted(() => {
      checkAuthStatus();
    });
    
    return {
      isAuthenticated
    };
  }
};
</script>

<style scoped>
.home {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

.main-content {
  flex: 1;
  padding: 4rem 2rem;
}

.hero-section {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}

.hero-section h1 {
  font-size: 3rem;
  color: #333;
  margin-bottom: 1rem;
}

.hero-section p {
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 2rem;
}

.cta-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.cta-btn {
  padding: 1rem 2rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: bold;
  transition: all 0.3s;
}

.cta-btn:first-child {
  background-color: #4CAF50;
  color: white;
}

.cta-btn.secondary {
  background-color: white;
  color: #4CAF50;
  border: 2px solid #4CAF50;
}

.cta-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.footer {
  background-color: #333;
  color: white;
  padding: 2rem;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.contact-info p {
  margin: 0.5rem 0;
}

.social-links {
  display: flex;
  gap: 1rem;
}

.social-link {
  color: white;
  text-decoration: none;
  transition: color 0.3s;
}

.social-link:hover {
  color: #4CAF50;
}

.feedback-btn {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.feedback-btn:hover {
  background-color: #45a049;
}

@media (max-width: 768px) {
  .footer-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .cta-buttons {
    flex-direction: column;
  }
}
</style> 