import authService from './auth';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Cache para evitar requisições repetidas
let produtosCache = null;

export const laboratorioService = {
  /**
   * Busca todos os produtos do laboratório organizados por categoria
   * Retorna: { categorias: [], produtos: { categoria: [...] } }
   */
  async getProdutos() {
    // Se já tem cache, retorna do cache
    if (produtosCache) {
      return produtosCache;
    }

    try {
      const headers = authService.getAuthHeaders();
      const response = await fetch(`${API_URL}/api/laboratorio-produtos`, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        throw new Error(`Erro ao buscar produtos: ${response.statusText}`);
      }

      const data = await response.json();
      produtosCache = data;
      return data;
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      throw error.message || 'Não foi possível carregar os produtos';
    }
  },

  /**
   * Retorna os produtos de uma categoria específica
   */
  async getProdutosPorCategoria(categoria) {
    try {
      const data = await this.getProdutos();
      return data.produtos[categoria] || [];
    } catch (error) {
      console.error('Erro ao buscar produtos por categoria:', error);
      return [];
    }
  },

  /**
   * Busca um produto específico pelo código
   */
  async getProdutoPorCodigo(codigo) {
    try {
      const data = await this.getProdutos();
      for (const categoria in data.produtos) {
        const produto = data.produtos[categoria].find(p => p.codigo === codigo);
        if (produto) {
          return produto;
        }
      }
      return null;
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      return null;
    }
  },

  async registrarSaida(produtoId, quantidade) {
    try {
      const headers = authService.getAuthHeaders();
      const response = await fetch(`${API_URL}/api/laboratorio-produtos/saida`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ produtoId, quantidade })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Não foi possível registrar a saída');
      }

      const data = await response.json();
      this.clearCache();
      return data;
    } catch (error) {
      console.error('Erro ao registrar saída:', error);
      throw error;
    }
  },

  /**
   * Limpa o cache (útil após atualizar produtos)
   */
  clearCache() {
    produtosCache = null;
  }
};

export default laboratorioService;
