import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import RegisterForm from '../components/RegisterForm.vue';
import LoginForm from '../components/LoginForm.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterForm
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginForm
  },
  {
    path: '/calculator',
    name: 'Calculator',
    component: () => import('../views/Calculator.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/articles',
    name: 'Articles',
    component: () => import('../views/Articles.vue')
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/Profile.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/food-diary',
    name: 'FoodDiary',
    component: () => import('../views/FoodDiary.vue'),
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Защита маршрутов
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  if (to.matched.some(record => record.meta.requiresAuth) && !token) {
    next('/login');
  } else {
    next();
  }
});

export default router; 