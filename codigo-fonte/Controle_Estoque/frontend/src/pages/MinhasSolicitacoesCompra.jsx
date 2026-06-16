import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import authService from '../services/auth';
import { supabase } from '../services/supabase';
import { solicitacoesCompraService } from '../services/solicitacoesCompra';

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

export default function MinhasSolicitacoesCompra() {
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      // Usar o endpoint backend que retorna solicitações do usuário autenticado
      const data = await solicitacoesCompraService.listByProfessor();
      setLista(data || []);
    } catch (error) {
      console.error('Erro ao carregar solicitações:', error.message || error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  return (
    <div className="page" style={{ padding: '24px', color: '#fff' }}>
      <header className="page__header" style={{ marginBottom: '24px' }}>
        <h1 className="page__title" style={{ fontSize: '26px', fontWeight: 'bold' }}>📋 Minhas Solicitações de Compra</h1>
        <p className="page__subtitle" style={{ color: '#94a3b8' }}>Acompanhe o andamento dos seus pedidos de novos insumos.</p>
      </header>

      {loading ? (
        <div style={{ padding: '20px' }}>⏳ Carregando solicitações...</div>
      ) : lista.length === 0 ? (
        <div className="ui-empty-state" style={{ background: '#1e293b', padding: '30px', borderRadius: '8px', border: '1px dashed #334155' }}>
          Você ainda não enviou nenhuma solicitação.{' '}
<Link to="/tecnico/solicitar-compra" style={{ color: '#38bdf8', textDecoration: 'underline' }}>Solicitar compra de materiais</Link>        </div>
      ) : (
        <div className="ui-table-wrap" style={{ background: '#1e293b', borderRadius: '8px', overflow: 'hidden', border: '1px solid #334155' }}>
          <table className="ui-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: '#334155', color: '#f8fafc' }}>
              <tr>
                <th style={{ padding: '12px' }}>#</th>
                <th style={{ padding: '12px' }}>Data</th>
                <th style={{ padding: '12px' }}>Técnico</th> {/* <-- ALTERADO AQUI */}
                <th style={{ padding: '12px' }}>Código do Solicitante</th>
                <th style={{ padding: '12px' }}>Tipo produto / Item</th>
                <th style={{ padding: '12px' }}>Qtd</th>
                <th style={{ padding: '12px' }}>Observação</th>
                <th style={{ padding: '12px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((s) => (
                <tr key={s.id} style={{ borderBottom: '1px solid #334155' }}>
                  <td style={{ padding: '12px' }}>{s.id}</td>
                  <td style={{ padding: '12px' }}>{formatarDataBR(s.data)}</td>
                  <td style={{ padding: '12px' }}>{s.professor_nome || s.professorOriginal || '—'}</td>
                  <td style={{ padding: '12px' }}>{s.codigo_professor || '—'}</td>
                  <td style={{ padding: '12px' }}>{s.tipo_produto || '—'}</td>
                  <td style={{ padding: '12px' }}>
                    <strong>{s.quantidade}</strong>
                  </td>
                  <td style={{ padding: '12px', maxWidth: '220px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#94a3b8' }}>
                    {s.observacao || '—'}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ background: '#1e3a8a', color: '#60a5fa', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                      {s.status || 'Pendente'}
                    </span>
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