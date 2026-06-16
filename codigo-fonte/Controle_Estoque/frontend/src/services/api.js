const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

export const api = {
  getEstoque: async () => {
    const response = await fetch(`${API_BASE_URL}/api/estoque`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar estoque');
    }

    return await response.json();
  },

  movimentarEstoque: async (id, tipo, quantidadeMovimentada) => {
    const response = await fetch(`${API_BASE_URL}/api/estoque/movimentar`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ id, tipo, quantidadeMovimentada }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao movimentar estoque');
    }

    return await response.json();
  }
};
