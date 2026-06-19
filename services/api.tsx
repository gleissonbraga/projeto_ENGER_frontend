import axios from 'axios';

const apiUrll = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL: apiUrll, // Substitua pela porta do seu backend ENGER
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;