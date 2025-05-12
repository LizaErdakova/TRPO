<template>
  <div class="register-form">
    <h2>Регистрация</h2>
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="email">Email:</label>
        <input
          type="email"
          id="email"
          v-model="form.email"
          required
          placeholder="Введите email"
          :class="{ 'error': errors.email }"
        />
        <span class="error-message" v-if="errors.email">{{ errors.email }}</span>
      </div>

      <div class="form-group">
        <label for="password">Пароль:</label>
        <input
          type="password"
          id="password"
          v-model="form.password"
          required
          placeholder="Введите пароль"
          :class="{ 'error': errors.password }"
        />
        <span class="error-message" v-if="errors.password">{{ errors.password }}</span>
      </div>

      <div class="form-group">
        <label for="name">Имя:</label>
        <input
          type="text"
          id="name"
          v-model="form.name"
          required
          placeholder="Введите имя"
          :class="{ 'error': errors.name }"
        />
        <span class="error-message" v-if="errors.name">{{ errors.name }}</span>
      </div>

      <div class="form-group">
        <label for="age">Возраст:</label>
        <input
          type="number"
          id="age"
          v-model="form.age"
          required
          min="1"
          max="120"
          placeholder="Введите"
          :class="{ 'error': errors.age }"
        />
        <span class="error-message" v-if="errors.age">{{ errors.age }}</span>
      </div>

      <div class="form-group">
        <label for="height">Рост (см):</label>
        <input
          type="number"
          id="height"
          v-model="form.height"
          required
          min="100"
          max="250"
          placeholder="Введите"
          :class="{ 'error': errors.height }"
        />
        <span class="error-message" v-if="errors.height">{{ errors.height }}</span>
      </div>

      <div class="form-group">
        <label for="weight">Вес (кг):</label>
        <input
          type="number"
          id="weight"
          v-model="form.weight"
          required
          min="30"
          max="300"
          step="0.1"
          placeholder="Введите в"
          :class="{ 'error': errors.weight }"
        />
        <span class="error-message" v-if="errors.weight">{{ errors.weight }}</span>
      </div>

      <button type="submit" :disabled="loading">
        {{ loading ? 'Регистрация...' : 'Зарегистрироваться' }}
      </button>
    </form>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'RegisterForm',
  data() {
    return {
      form: {
        email: '',
        password: '',
        name: '',
        age: '',
        height: '',
        weight: ''
      },
      loading: false,
      errors: {
        email: '',
        password: '',
        name: '',
        age: '',
        height: '',
        weight: ''
      }
    };
  },
  methods: {
    clearErrors() {
      this.errors = {
        email: '',
        password: '',
        name: '',
        age: '',
        height: '',
        weight: ''
      };
    },
    async handleSubmit() {
      this.loading = true;
      this.clearErrors();

      try {
        const response = await axios.post('http://localhost:3000/api/auth/register', this.form);
        localStorage.setItem('token', response.data.token);
        this.$router.push('/');
      } catch (error) {
        if (error.response?.data?.message) {
          const field = error.response.data.field;
          if (field) {
            this.errors[field] = error.response.data.message;
          } else {
            this.errors.email = error.response.data.message;
          }
        } else {
          this.errors.email = 'Произошла ошибка при регистрации. Попробуйте позже.';
        }
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.register-form {
  width: 300px;
  margin: 20px auto;
  padding: 20px;
  background: white;
}

h2 {
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 10px;
}

label {
  display: block;
  margin-bottom: 5px;
}

input {
  width: 100%;
  padding: 5px;
  border: 1px solid #ccc;
}

input.error {
  border-color: red;
}

.error-message {
  color: red;
  font-size: 12px;
  margin-top: 3px;
}

button {
  width: 100%;
  padding: 8px;
  background-color: #4CAF50;
  color: white;
  border: none;
  cursor: pointer;
  margin-top: 10px;
}

button:disabled {
  background-color: #cccccc;
}
</style> 