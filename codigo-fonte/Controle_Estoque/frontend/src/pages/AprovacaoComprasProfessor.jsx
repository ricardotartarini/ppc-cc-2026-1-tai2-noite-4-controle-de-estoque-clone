// frontend/src/pages/AprovacaoComprasProfessor.jsx

import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../services/supabase';

function formatarDataBR(isoOrDate) {
  if (!isoOrDate) return '—';
  if (/^\d{4}-\d{2}-\d{2}$/.test(isoOrDate)) {
    const [y, m, d] = isoOrDate.split('-');
    return `${d}/${m}/${y}`;
  }
  const d = new Date(isoOrDate);
  if (Number.isNaN(d.getTime())) return String(isoOrDate);
  return d.toLocaleDateString('pt-BR');
}

export default function AprovacaoComprasProfessor() {
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('solicitacoes_compra')
        .select('*')
        .order('id', { ascending: false });

      if (error) throw error;
      setLista(data || []);
    } catch (error) {
      console.error("Erro ao carregar solicitações:", error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregar();

    const channel = supabase
      .channel('solicitacoes-compra-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'solicitacoes_compra' },
        () => {
          carregar();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [carregar]);

  const atualizarStatus = async (id, novoStatus) => {
    try {
      const { error } = await supabase
        .from('solicitacoes_compra')
        .update({ status: novoStatus })
        .eq('id', id);

      if (error) throw error;
      carregar();
    } catch (error) {
      console.error(`Erro ao ${novoStatus.toLowerCase()} solicitação:`, error.message);
    }
  };

  return (
    <div className="page" style={{ padding: '24px', color: '#fff' }}>
      <header className="page__header" style={{ marginBottom: '24px' }}>
        <h1 className="page__title" style={{ fontSize: '26px', fontWeight: 'bold' }}>✅ Aprovação de Compras</h1>
        <p className="page__subtitle" style={{ color: '#94a3b8' }}>Gerencie as solicitações de insumos feitas pelos técnicos.</p>
      </header>

      {loading ? (
        <div style={{ padding: '20px' }}>⏳ Carregando solicitações...</div>
      ) : lista.length === 0 ? (
        <div className="ui-empty-state" style={{ background: '#1e293b', padding: '30px', borderRadius: '8px', border: '1px dashed #334155' }}>
          Nenhuma solicitação encontrada.
        </div>
      ) : (
        <div className="ui-table-wrap" style={{ background: '#1e293b', borderRadius: '8px', overflow: 'hidden', border: '1px solid #334155' }}>
          <table className="ui-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: '#334155', color: '#f8fafc' }}>
              <tr>
                <th style={{ padding: '12px' }}>#</th>
                <th style={{ padding: '12px' }}>Data</th>
                <th style={{ padding: '12px' }}>Técnico</th>
                <th style={{ padding: '12px' }}>Item</th>
                <th style={{ padding: '12px' }}>Qtd</th>
                <th style={{ padding: '12px' }}>Observação</th>
                <th style={{ padding: '12px' }}>Status</th>
                <th style={{ padding: '12px' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((s) => (
                <tr key={s.id} style={{ borderBottom: '1px solid #334155' }}>
                  <td style={{ padding: '12px' }}>{s.id}</td>
                  <td style={{ padding: '12px' }}>{formatarDataBR(s.data)}</td>
                  <td style={{ padding: '12px' }}>{s.professor_nome || s.professorOriginal || '—'}</td>
                  <td style={{ padding: '12px' }}>{s.tipo_produto || '—'}</td>
                  <td style={{ padding: '12px' }}><strong>{s.quantidade}</strong></td>
                  <td style={{ padding: '12px', maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#94a3b8' }}>
                    {s.observacao || '—'}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ 
                      background: s.status === 'Aprovado' ? '#065f46' : s.status === 'Recusado' ? '#7f1d1d' : '#1e3a8a', 
                      color: s.status === 'Aprovado' ? '#34d399' : s.status === 'Recusado' ? '#f87171' : '#60a5fa', 
                      padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' 
                    }}>
                      {s.status || 'Pendente'}
                    </span>
                  </td>
                  <td style={{ padding: '12px', display: 'flex', gap: '8px' }}>
                    {(!s.status || s.status === 'Pendente') && (
                      <>
                        <button onClick={() => atualizarStatus(s.id, 'Aprovado')} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Aprovar</button>
                        <button onClick={() => atualizarStatus(s.id, 'Recusado')} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Recusar</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}