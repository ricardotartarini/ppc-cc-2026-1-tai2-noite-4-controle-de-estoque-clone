const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const ALLOWED_USER_TYPES = ['professor', 'tecnico'];

export const authService = {
  // Função para fazer login via backend (aceita email ou código de professor)
  login: async (entrada, password, userType) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ entrada, password, userType }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao fazer login');
      }

      const data = await response.json();

      // Armazenar token e dados do usuário
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('userType', data.user.userType);

      // Disparar evento de mudança de autenticação
      window.dispatchEvent(new Event('authChange'));

      return data;
    } catch (error) {
      throw error;
    }
  },

  // Função para registrar novo usuário via backend
  register: async (email, password, fullName, userType) => {
    try {
      if (!ALLOWED_USER_TYPES.includes(userType)) {
        throw new Error('Tipo de usuário inválido');
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, fullName, userType }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar conta');
      }

      const data = await response.json();

      // Armazenar token e dados do usuário
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('userType', data.user.userType);

      // Disparar evento de mudança de autenticação
      window.dispatchEvent(new Event('authChange'));

      return data;
    } catch (error) {
      throw error;
    }
  },

  // Função para fazer logout
  logout: async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userType');
    // Disparar evento customizado
    window.dispatchEvent(new Event('authChange'));
  },

  // Função para obter dados do usuário
  getUser: async () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      return JSON.parse(user);
    }
    return null;
  },

  // Função para verificar se o usuário está autenticado
  isAuthenticated: async () => {
    const token = localStorage.getItem('token');
    return !!token;
  },

  // Função para obter token
  getToken: () => {
    return localStorage.getItem('token');
  },

  getAuthHeaders: () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }
};

export default authService;
