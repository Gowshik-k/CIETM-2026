import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import axios from 'axios'


import { BrowserRouter } from 'react-router-dom';

if (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.trim() !== '') {
  axios.defaults.baseURL = import.meta.env.VITE_API_URL;
} else if (import.meta.env.DEV) {
  // Use relative path '/api' in development so Vite's proxy can forward it
  axios.defaults.baseURL = ''; 
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)