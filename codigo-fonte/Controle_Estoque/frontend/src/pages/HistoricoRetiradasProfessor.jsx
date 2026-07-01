import React, { useEffect, useState } from 'react';
import authService from '../services/auth';
import { supabase } from '../services/supabase';

export default function HistoricoRetiradasProfessor() {
  const [user, setUser] = useState(null);
  const [historico, setHistorico] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');

  const getDataMovimentacao = (item) => item.created_at || item.criado_em || item.data;

  useEffect(() => {
    const carregarUsuario = async () => {
      const usuario = await authService.getUser();
      setUser(usuario);
    };

    carregarUsuario();
  }, []);

  useEffect(() => {
    const carregarDados = async () => {
      if (!user?.fullName) {
        setHistorico([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const { data: produtosData, error: produtosError } = await supabase
          .from('laboratorio_produtos')
          .select('id, nome, codigo');

        if (produtosError) throw produtosError;
        setProdutos(produtosData || []);

        const { data: movimentacoesData, error: movimentacoesError } = await supabase
          .from('movimentacoes')
          .select('*')
          .eq('usuario', user.fullName)
          .eq('tipo', 'saida')
          .order('id', { ascending: false });

        if (movimentacoesError) throw movimentacoesError;
        setHistorico(movimentacoesData || []);
      } catch (error) {
        console.error('Erro ao carregar historico do professor:', error);
      } finally {
        setLoading(false);
      }
    };

    carregarDados();

    if (!user?.fullName) {
      return undefined;
    }

    const channel = supabase
      .channel(`historico-retiradas-professor-${user.fullName}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'movimentacoes' },
        (payload) => {
          const movimentacao = payload.new || payload.old;
          if (String(movimentacao?.usuario) === String(user.fullName)) {
            carregarDados();
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'laboratorio_produtos' },
        () => {
          carregarDados();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user?.fullName]);

  const getNomeProduto = (id) => {
    const produto = produtos.find((item) => String(item.id) === String(id));
    return produto ? `[${produto.codigo}] ${produto.nome}` : 'Produto desconhecido';
  };

  const dadosFiltrados = historico.filter((item) => {
    const nomeProduto = getNomeProduto(item.produto_id).toLowerCase();
    return busca ? nomeProduto.includes(busca.toLowerCase()) : true;
  });

  const exportarCSV = () => {
    const headers = ['ID Movimentacao', 'Data', 'Produto', 'Quantidade'];

    const rows = dadosFiltrados.map((item) => {
      const dataMovimentacao = new Date(getDataMovimentacao(item)).toLocaleString('pt-BR');
      return [
        item.id,
        dataMovimentacao,
        `"${getNomeProduto(item.produto_id)}"`,
        item.quantidade
      ];
    });

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `historico_retiradas_${new Date().getTime()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const retiradasRecentes = historico.slice(0, 10);

  return (
    <div className="page" style={{ padding: '24px', color: '#fff' }}>
      <header className="page__header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h1 className="page__title" style={{ fontSize: '26px', fontWeight: 'bold' }}>📚 Histórico de Retiradas</h1>
          <p className="page__subtitle" style={{ color: '#94a3b8' }}>Consulte todas as saídas registradas na sua conta de professor.</p>
        </div>
        <button onClick={exportarCSV} style={{ background: '#10b981', color: '#fff', padding: '10px 20px', borderRadius: '6px', border: 'none', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>📥</span> Exportar CSV
        </button>
      </header>

      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Buscar por nome ou código..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          style={{ background: '#0f172a', border: '1px solid #334155', padding: '10px', borderRadius: '6px', color: '#fff', flex: '1 1 300px' }}
        />
      </div>

      <div style={{ background: '#0f172a', padding: '24px', borderRadius: '12px', border: '1px solid #1e293b', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #334155', paddingBottom: '15px' }}>
          <span style={{ fontSize: '20px' }}>📋</span>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#f8fafc', margin: 0 }}>
            Retiradas Recentes
          </h3>
        </div>

        {retiradasRecentes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 0', color: '#64748b' }}>
            <p style={{ fontSize: '14px', margin: 0 }}>Nenhuma retirada recente encontrada.</p>
            <p style={{ fontSize: '12px', marginTop: '5px' }}>As ultimas saidas deste professor aparecerao aqui.</p>
          </div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {retiradasRecentes.map((item) => (
              <li key={item.id} style={{ background: '#1e293b', padding: '14px', borderRadius: '8px', borderLeft: '4px solid #10b981', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#f8fafc' }}>{getNomeProduto(item.produto_id)}</span>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>{new Date(getDataMovimentacao(item)).toLocaleString('pt-BR')}</span>
                </div>
                <div style={{ background: '#047857', color: '#fff', padding: '6px 10px', borderRadius: '6px', fontWeight: 'bold', fontSize: '14px' }}>
                  -{item.quantidade}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="ui-card" style={{ background: '#1e293b', borderRadius: '12px', border: '1px solid #334155', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>Carregando histórico...</div>
        ) : dadosFiltrados.length === 0 ? (
          <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>Nenhuma retirada encontrada.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ background: '#334155', color: '#f8fafc' }}>
                <tr>
                  <th style={{ padding: '12px 16px' }}>Data</th>
                  <th style={{ padding: '12px 16px' }}>Produto</th>
                  <th style={{ padding: '12px 16px' }}>Qtd</th>
                </tr>
              </thead>
              <tbody>
                {dadosFiltrados.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #334155' }}>
                    <td style={{ padding: '12px 16px', color: '#cbd5e1' }}>
                      {new Date(getDataMovimentacao(item)).toLocaleString('pt-BR')}
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 'bold' }}>
                      {getNomeProduto(item.produto_id)}
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 'bold', color: '#fca5a5' }}>
                      -{item.quantidade}
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