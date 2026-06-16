// SolicitarCompraMateriais.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/auth';
import { supabase } from '../services/supabase';
import { solicitacoesCompraService } from '../services/solicitacoesCompra';

export default function SolicitarCompraMateriais() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  
  const [produtosBanco, setProdutosBanco] = useState([]);
  const [categorias, setCategorias] = useState([]);
  
  const [categoria, setCategoria] = useState('');
  const [produtoId, setProdutoId] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [observacao, setObservacao] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sucesso, setSucesso] = useState('');

  useEffect(() => {
    const getUser = async () => {
      const u = await authService.getUser();
      setUser(u);
    };
    getUser();
  }, []);

  useEffect(() => {
    const carregarProdutos = async () => {
      const { data, error } = await supabase
        .from('laboratorio_produtos')
        .select('*')
        .order('nome', { ascending: true });

      if (error) {
        console.error('Erro ao buscar produtos:', error);
      } else if (data) {
        setProdutosBanco(data);
        const listaCategorias = [...new Set(data.map(p => p.categoria))].filter(Boolean);
        setCategorias(listaCategorias);
      }
    };
    carregarProdutos();
  }, []);

  const produtosFiltrados = produtosBanco.filter(p => p.categoria === categoria);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSucesso('');
    
    if (observacao) {
      const lixoDetectado = /(.)\1{4,}/.test(observacao);
      if (observacao.trim().length < 5 || lixoDetectado) {
        setError('Por favor, insira uma justificativa válida e detalhada.');
        return;
      }
    }

    setLoading(true);

    const produtoSelecionado = produtosBanco.find(p => String(p.id) === String(produtoId));

    if (!produtoSelecionado) {
      setError('Selecione um produto válido da lista.');
      setLoading(false);
      return;
    }

    try {
      const hoje = new Date().toISOString().slice(0, 10);
      const usuarioAtual = await authService.getUser();

      await solicitacoesCompraService.add({
        tecnicoNome: usuarioAtual?.fullName || 'Técnico',
        data: hoje,
        codigoTecnico: 'TEC-' + (usuarioAtual?.id ? usuarioAtual.id.slice(0, 4).toUpperCase() : '000'),
        tipoProduto: produtoSelecionado.nome,
        quantidade: Number(quantidade),
        observacao: observacao.trim() || ''
      });

      setSucesso('Solicitação de compra enviada com sucesso!');
      setQuantidade('');
      setObservacao('');
      setProdutoId('');
      setCategoria('');

      setTimeout(() => {
        navigate('/tecnico/minhas-solicitacoes');
      }, 2000);

    } catch (err) {
      setError(`Erro ao enviar solicitação: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page" style={{ padding: '24px', color: '#fff' }}>
      <header className="page__header" style={{ marginBottom: '24px' }}>
        <h1 className="page__title" style={{ fontSize: '26px', fontWeight: 'bold' }}>📝 Solicitar Compra de Materiais</h1>
        <p className="page__subtitle" style={{ color: '#94a3b8' }}>Peça reposição de insumos para o estoque do laboratório.</p>
      </header>

      <div className="ui-card" style={{ background: '#1e293b', padding: '30px', borderRadius: '12px', maxWidth: '600px', border: '1px solid #334155' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="form-field" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label htmlFor="categoria" style={{ fontWeight: '600' }}>Filtrar por Categoria *</label>
            <select id="categoria" className="ui-select" style={{ background: '#0f172a', border: '1px solid #334155', padding: '10px', borderRadius: '6px', color: '#fff' }} value={categoria} onChange={(e) => { setCategoria(e.target.value); setProdutoId(''); }} required>
              <option value="">-- Selecione a categoria --</option>
              {categorias.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          {categoria && (
            <div className="form-field" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label htmlFor="produto" style={{ fontWeight: '600' }}>Nome / Descrição do Produto *</label>
              <select id="produto" className="ui-select" style={{ background: '#0f172a', border: '1px solid #334155', padding: '10px', borderRadius: '6px', color: '#fff' }} value={produtoId} onChange={(e) => setProdutoId(e.target.value)} required>
                <option value="">-- Selecione o produto --</option>
                {produtosFiltrados.map(p => (
                  <option key={p.id} value={p.id}>[{p.codigo}] {p.nome}</option>
                ))}
              </select>
            </div>
          )}

          <div className="form-field" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label htmlFor="quantidade" style={{ fontWeight: '600' }}>Quantidade Necessária *</label>
            <input id="quantidade" type="number" min={1} className="ui-input" style={{ background: '#0f172a', border: '1px solid #334155', padding: '10px', borderRadius: '6px', color: '#fff', width: '120px' }} value={quantidade} onChange={(e) => setQuantidade(e.target.value)} required placeholder="Ex: 50" />
          </div>

          <div className="form-field" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label htmlFor="observacao" style={{ fontWeight: '600', color: '#94a3b8' }}>
              Observações / Justificativa <span style={{ fontSize: '13px', fontWeight: 'normal', color: '#64748b' }}>(Opcional)</span>
            </label>
            <textarea id="observacao" className="ui-textarea" rows={4} style={{ background: '#0f172a', border: '1px solid #334155', padding: '10px', borderRadius: '6px', color: '#fff', resize: 'vertical' }} value={observacao} onChange={(e) => setObservacao(e.target.value)} placeholder="Indique urgência, marcas preferenciais ou mais detalhes..." />
          </div>

          {error && <div style={{ background: '#ef444422', border: '1px solid #ef4444', color: '#f87171', padding: '12px', borderRadius: '6px' }}>{error}</div>}
          {sucesso && <div style={{ background: '#22c55e22', border: '1px solid #22c55e', color: '#4ade80', padding: '12px', borderRadius: '6px' }}>{sucesso}</div>}

          <button type="submit" className="btn" style={{ background: loading || !produtoId ? '#0369a1' : '#0284c7', color: '#fff', padding: '12px', borderRadius: '6px', border: 'none', fontWeight: 'bold', cursor: loading || !produtoId ? 'not-allowed' : 'pointer', marginTop: '10px' }} disabled={loading || !produtoId}>
            {loading ? 'Enviando Pedido…' : 'Enviar Solicitação de Compra'}
          </button>
        </form>
      </div>
    </div>
  );
}