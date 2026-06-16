const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

export const solicitacoesCompraService = {
  async listByProfessor() {
    const response = await fetch(`${API_BASE_URL}/api/solicitacoes-compra`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar solicitações');
    }

    return await response.json();
  },

  async add(payload) {
    const response = await fetch(`${API_BASE_URL}/api/solicitacoes-compra`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao adicionar solicitação');
    }

    return await response.json();
  }
};
