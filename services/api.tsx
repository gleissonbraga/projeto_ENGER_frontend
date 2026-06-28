import axios from 'axios';

// const apiUrll = "http://localhost:5071/api";
const apiUrll = "https://enger-api.onrender.com/api";

const api = axios.create({
  baseURL: apiUrll, // Substitua pela porta do seu backend ENGER
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;