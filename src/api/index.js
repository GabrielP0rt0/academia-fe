/**
 * API wrapper for backend communication
 * Base URL: http://localhost:8000/api
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

/**
 * Generic fetch wrapper with error handling
 */
async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        throw new Error('Não autenticado');
      }

      const errorData = await response.json().catch(() => ({ detail: 'Erro desconhecido' }));
      throw new Error(errorData.detail || `Erro ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error.message === 'Não autenticado') {
      throw error;
    }
    throw new Error(error.message || 'Erro na requisição');
  }
}

// Auth endpoints
export const auth = {
  login: async (credentials) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },
};

// Students endpoints
export const students = {
  list: async () => {
    return apiRequest('/students');
  },
  getById: async (id) => {
    return apiRequest(`/students/${id}`);
  },
  create: async (data) => {
    return apiRequest('/students', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// Classes endpoints
export const classes = {
  list: async () => {
    return apiRequest('/classes');
  },
  create: async (data) => {
    return apiRequest('/classes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// Attendance endpoints
export const attendance = {
  create: async (data) => {
    return apiRequest('/attendance', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  createBulk: async (entries) => {
    return apiRequest('/attendance/bulk', {
      method: 'POST',
      body: JSON.stringify({ entries }),
    });
  },
  getByClass: async (classId, fromDate, toDate) => {
    const params = new URLSearchParams();
    if (fromDate) params.append('from', fromDate);
    if (toDate) params.append('to', toDate);
    const queryString = params.toString();
    const url = `/attendance/class/${classId}${queryString ? `?${queryString}` : ''}`;
    return apiRequest(url);
  },
};

// Evaluations endpoints
export const evaluations = {
  listByStudent: async (studentId) => {
    return apiRequest(`/evaluations/student/${studentId}`);
  },
  create: async (data) => {
    return apiRequest('/evaluations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  chartData: async (studentId) => {
    return apiRequest(`/evaluations/student/${studentId}/chart-data`);
  },
};

// Finance endpoints
export const finance = {
  list: async (date) => {
    const url = date ? `/finance?date=${date}` : '/finance';
    return apiRequest(url);
  },
  create: async (data) => {
    return apiRequest('/finance', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// Dashboard endpoints
export const dashboard = {
  summary: async (date) => {
    const url = date ? `/dashboard/summary?date=${date}` : '/dashboard/summary';
    return apiRequest(url);
  },
};

// Export default API object
const api = {
  auth,
  students,
  classes,
  attendance,
  evaluations,
  finance,
  dashboard,
};

export default api;

