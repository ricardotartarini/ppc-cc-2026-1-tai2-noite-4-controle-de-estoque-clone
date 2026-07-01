// src/pages/HistoricoMovimentacoes.jsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

export default function HistoricoMovimentacoes() {
  const [historico, setHistorico] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState('');
  const [busca, setBusca] = useState('');

  useEffect(() => {
    carregarDados();

    const channel = supabase
      .channel('auditoria-movimentacoes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'laboratorio_produtos' },
        () => {
          carregarDados();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'movimentacoes' },
        () => {
          carregarDados();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const { data: prodData } = await supabase
        .from('laboratorio_produtos')
        .select('id, nome, codigo');
      setProdutos(prodData || []);

      const { data: usuariosData } = await supabase
        .from('usuarios')
        .select('id, nome_completo, email, tipo_usuario');
      setUsuarios(usuariosData || []);

      const { data: movData } = await supabase
        .from('movimentacoes')
        .select('*')
        .order('id', { ascending: false });
      
      setHistorico(movData || []);
    } catch (error) {
      console.error("Erro ao buscar histórico:", error);
    } finally {
      setLoading(false);
    }
  };

  const getNomeProduto = (id) => {
    const prod = produtos.find(p => String(p.id) === String(id));
    return prod ? `[${prod.codigo}] ${prod.nome}` : 'Produto Desconhecido';
  };

  const getResponsavel = (userId) => {
    const usuario = usuarios.find((item) => String(item.id) === String(userId));
    if (!usuario) return 'Sistema/Não identificado';
    return usuario.nome_completo || usuario.email || 'Usuário sem nome';
  };

  const exportarCSV = () => {
    const headers = ['ID Movimentacao', 'Data', 'Produto', 'Tipo', 'Quantidade', 'Responsavel'];
    
    const rows = dadosFiltrados.map(h => {
      const dataFormatada = new Date(h.data || h.created_at).toLocaleDateString('pt-BR');
      return [
        h.id,
        dataFormatada,
        `"${getNomeProduto(h.produto_id)}"`,
        h.tipo.toUpperCase(),
        h.quantidade,
        `"${getResponsavel(h.user_id)}"`
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `auditoria_estoque_${new Date().getTime()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const dadosFiltrados = historico.filter(item => {
    const matchTipo = filtroTipo ? item.tipo === filtroTipo : true;
    const nomeProduto = getNomeProduto(item.produto_id).toLowerCase();
    const responsavel = getResponsavel(item.user_id).toLowerCase();
    const termoBusca = busca.toLowerCase();
    const matchBusca = busca ? nomeProduto.includes(termoBusca) || responsavel.includes(termoBusca) : true;
    return matchTipo && matchBusca;
  });

  return (
    <div className="page" style={{ padding: '24px', color: '#fff' }}>
      <header className="page__header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h1 className="page__title" style={{ fontSize: '26px', fontWeight: 'bold' }}>🔍 Auditoria de Estoque</h1>
          <p className="page__subtitle" style={{ color: '#94a3b8' }}>Histórico completo de movimentações com exportação para relatórios.</p>
        </div>
        <button onClick={exportarCSV} style={{ background: '#10b981', color: '#fff', padding: '10px 20px', borderRadius: '6px', border: 'none', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>📥</span> Exportar CSV
        </button>
      </header>

      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <input 
          type="text" 
          placeholder="Buscar por produto, código ou responsável..." 
          value={busca} 
          onChange={(e) => setBusca(e.target.value)} 
          style={{ background: '#0f172a', border: '1px solid #334155', padding: '10px', borderRadius: '6px', color: '#fff', flex: '1 1 300px' }}
        />
        <select 
          value={filtroTipo} 
          onChange={(e) => setFiltroTipo(e.target.value)}
          style={{ background: '#0f172a', border: '1px solid #334155', padding: '10px', borderRadius: '6px', color: '#fff', width: '200px' }}
        >
          <option value="">Todos os Tipos</option>
          <option value="entrada">Entrada</option>
          <option value="saida">Saída</option>
        </select>
      </div>

      <div className="ui-card" style={{ background: '#1e293b', borderRadius: '12px', border: '1px solid #334155', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>Carregando auditoria...</div>
        ) : dadosFiltrados.length === 0 ? (
          <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>Nenhuma movimentação encontrada.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ background: '#334155', color: '#f8fafc' }}>
                <tr>
                  <th style={{ padding: '12px 16px' }}>Data</th>
                  <th style={{ padding: '12px 16px' }}>Produto</th>
                  <th style={{ padding: '12px 16px' }}>Responsável</th>
                  <th style={{ padding: '12px 16px' }}>Tipo</th>
                  <th style={{ padding: '12px 16px' }}>Qtd</th>
                </tr>
              </thead>
              <tbody>
                {dadosFiltrados.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #334155' }}>
                    <td style={{ padding: '12px 16px', color: '#cbd5e1' }}>
                      {new Date(item.data || item.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 'bold' }}>
                      {getNomeProduto(item.produto_id)}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#cbd5e1' }}>
                      {getResponsavel(item.user_id)}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ 
                        background: item.tipo === 'entrada' ? '#064e3b' : '#7f1d1d', 
                        color: item.tipo === 'entrada' ? '#34d399' : '#fca5a5', 
                        padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' 
                      }}>
                        {item.tipo}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 'bold' }}>
                      {item.tipo === 'entrada' ? '+' : '-'}{item.quantidade}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}