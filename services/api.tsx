import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5071/api', // Substitua pela porta do seu backend ENGER
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;