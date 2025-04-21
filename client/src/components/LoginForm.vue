<template>
  <div class="login-form">
    <h2>Вход</h2>
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

      <button type="submit" :disabled="loading">
        {{ loading ? 'Вход...' : 'Войти' }}
      </button>
    </form>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'LoginForm',
  data() {
    return {
      form: {
        email: '',
        password: ''
      },
      loading: false,
      errors: {
        email: '',
        password: ''
      }
    };
  },
  methods: {
    clearErrors() {
      this.errors = {
        email: '',
        password: ''
      };
    },
    async handleSubmit() {
      this.loading = true;
      this.clearErrors();

      try {
        const response = await axios.post('http://localhost:3000/api/auth/login', this.form);
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
          this.errors.email = 'Произошла ошибка при входе. Попробуйте позже.';
        }
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.login-form {
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