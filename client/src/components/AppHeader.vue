<template>
  <header class="app-header">
    <div class="logo">
      <router-link to="/">FitFuel</router-link>
    </div>
    
    <nav class="main-nav">
      <router-link to="/">Главная</router-link>
      <router-link to="/calculator">Калькулятор</router-link>
      <router-link to="/articles">Статьи</router-link>
      <router-link to="/food-diary" v-if="isAuthenticated">Журнал питания</router-link>
    </nav>
    
    <div class="search-box">
      <input type="text" placeholder="Поиск..." />
      <button class="search-btn">Найти</button>
    </div>
    
    <div class="auth-section" v-if="!isAuthenticated">
      <router-link to="/login" class="auth-btn login">Войти</router-link>
      <router-link to="/register" class="auth-btn register">Регистрация</router-link>
    </div>
    
    <div class="user-section" v-else>
      <div class="user-menu" @click="toggleUserMenu">
        <span class="user-name">{{ userName }}</span>
        <div class="user-avatar">
          <span class="avatar-placeholder">{{ userInitials }}</span>
        </div>
        <div class="dropdown-menu" v-if="showUserMenu">
          <router-link to="/profile" class="dropdown-item">Профиль</router-link>
          <router-link to="/food-diary" class="dropdown-item">Журнал питания</router-link>
          <div class="dropdown-divider"></div>
          <button @click="logout" class="dropdown-item logout">Выйти</button>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

export default {
  name: 'AppHeader',
  setup() {
    const isAuthenticated = ref(false);
    const userName = ref('');
    const showUserMenu = ref(false);
    const router = useRouter();
    
    const userInitials = computed(() => {
      if (!userName.value) return '';
      return userName.value.split(' ')
        .map(name => name.charAt(0).toUpperCase())
        .join('')
        .substring(0, 2);
    });
    
    const checkAuthStatus = () => {
      const token = localStorage.getItem('token');
      isAuthenticated.value = !!token;
      
      if (isAuthenticated.value) {
        loadUserProfile();
      }
    };
    
    const loadUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3000/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        userName.value = response.data.name || 'Пользователь';
      } catch (error) {
        console.error('Ошибка при загрузке профиля:', error);
      }
    };
    
    const toggleUserMenu = () => {
      showUserMenu.value = !showUserMenu.value;
    };
    
    const logout = () => {
      localStorage.removeItem('token');
      isAuthenticated.value = false;
      showUserMenu.value = false;
      router.push('/');
    };
    
    // Закрыть меню при клике вне его
    const handleClickOutside = (event) => {
      const userMenu = document.querySelector('.user-menu');
      if (userMenu && !userMenu.contains(event.target) && showUserMenu.value) {
        showUserMenu.value = false;
      }
    };
    
    onMounted(() => {
      checkAuthStatus();
      
      // Проверять статус авторизации при изменении URL
      router.afterEach(() => {
        checkAuthStatus();
      });
      
      // Добавить обработчик клика для закрытия меню
      document.addEventListener('click', handleClickOutside);
    });
    
    return {
      isAuthenticated,
      userName,
      userInitials,
      showUserMenu,
      toggleUserMenu,
      logout
    };
  }
};
</script>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  background-color: #4CAF50;
  color: white;
}

.logo {
  font-size: 2rem;
  font-weight: bold;
  font-family: 'Arial', sans-serif;
}

.logo a {
  color: white;
  text-decoration: none;
}

.main-nav {
  display: flex;
  gap: 2rem;
}

.main-nav a {
  color: white;
  text-decoration: none;
  font-size: 1.1rem;
  transition: color 0.3s;
  padding: 0.5rem 0;
}

.main-nav a:hover,
.main-nav a.router-link-active {
  color: #e0e0e0;
  border-bottom: 2px solid white;
}

.search-box {
  display: flex;
  gap: 0.5rem;
}

.search-box input {
  padding: 0.5rem;
  border: none;
  border-radius: 4px;
  width: 200px;
}

.search-btn {
  background-color: #45a049;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.search-btn:hover {
  background-color: #3d8b40;
}

.auth-section {
  display: flex;
  gap: 1rem;
}

.auth-btn {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  text-decoration: none;
  transition: all 0.3s;
}

.login {
  color: white;
  border: 1px solid white;
}

.register {
  background-color: white;
  color: #4CAF50;
}

.login:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.register:hover {
  background-color: #f0f0f0;
}

.user-section {
  position: relative;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.user-name {
  color: white;
  font-weight: 500;
}

.user-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background-color: white;
  color: #4CAF50;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  width: 200px;
  margin-top: 0.5rem;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.dropdown-item {
  display: block;
  padding: 0.75rem 1rem;
  color: #333;
  text-decoration: none;
  transition: background-color 0.3s;
}

.dropdown-item:hover {
  background-color: #f5f5f5;
}

.dropdown-divider {
  height: 1px;
  background-color: #eee;
  margin: 0.5rem 0;
}

.logout {
  color: #d32f2f;
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
}
</style> 