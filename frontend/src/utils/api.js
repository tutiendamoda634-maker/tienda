import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Determinar el tenant basado en el subdominio o localStorage
export const getActiveTenant = () => {
  // 1. Intentar obtener el tenant del subdominio (ej: mitienda.saas.com -> mitienda)
  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  
  // Si estamos en localhost, parts.length puede ser 1, y no hay subdominio claro
  // pero si usamos test.localhost, agarrará "test".
  // Asumimos que si no es localhost o una IP pura (y tiene más de 2 partes), el [0] es el subdominio
  if (parts.length >= 2 && hostname !== 'localhost' && !hostname.match(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/)) {
    // Para dominios simples tipo midominio.com (length=2), el [0] es el dominio root, no un subdominio.
    // Una lógica más robusta asume que la base es, por ejemplo, dodcloud.com.
    // Si la idea es siempre usar subdominios, y no permitimos dominio root para tiendas:
    if (parts.length >= 3 || (hostname.includes('localhost') && parts.length === 2)) {
      return parts[0];
    }
  }

  // 2. Si no es subdominio o estamos testeando en crudo, sacar de localStorage
  const storedTenant = localStorage.getItem("tenant");
  if (storedTenant) {
    return storedTenant;
  }

  // 3. Fallback
  return "modashop"; // O podrías retornar null y obligar al backend a rechazarlo
};

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    const tenant = getActiveTenant();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    if (tenant) {
      config.headers['X-Tenant'] = tenant;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
