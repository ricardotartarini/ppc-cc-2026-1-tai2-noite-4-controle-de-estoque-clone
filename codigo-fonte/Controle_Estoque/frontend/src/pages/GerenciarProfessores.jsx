import React, { useEffect, useState } from 'react';
import authService from '../services/auth';
import { supabase } from '../services/supabase';

export default function GerenciarProfessores() {
  const [professores, setProfessores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [removendoId, setRemovendoId] = useState(null);
  const [usuarioAtual, setUsuarioAtual] = useState(null);

  const carregarProfessores = async () => {
    setLoading(true);
    setErro('');

    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('id, email, nome_completo, codigo_professor, tipo_usuario')
        .order('nome_completo', { ascending: true });

      if (error) {
        throw new Error(error.message || 'Erro ao carregar professores');
      }

      const professoresFiltrados = (data || []).filter((usuario) => {
        if (!usuario) return false;
        const tipo = String(usuario.tipo_usuario || '').trim().toLowerCase();
        return tipo === 'professor' || tipo === 'prof' || tipo === 'docente' || tipo.includes('prof');
      });

      console.log('Total de registros:', data?.length);
      console.log('Professores encontrados:', professoresFiltrados.length);
      console.log('Professores:', professoresFiltrados);

      setProfessores(professoresFiltrados);
    } catch (err) {
      setErro(err.message || 'Erro inesperado ao carregar professores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const carregarUsuarioAtual = async () => {
      const usuario = await authService.getUser();
      setUsuarioAtual(usuario);
    };

    carregarUsuarioAtual();
    carregarProfessores();
  }, []);

  const removerProfessor = async (professor) => {
    if (professor.id === usuarioAtual?.id) {
      setErro('Você não pode remover a sua própria conta.');
      return;
    }

    const confirmar = window.confirm(`Você está prestes a remover a conta do professor ${professor.nome_completo}.\n\nEssa ação não poderá ser desfeita.`);
    if (!confirmar) return;

    setRemovendoId(professor.id);
    setErro('');
    setSucesso('');

    try {
      const response = await fetch(`http://localhost:5000/api/usuarios/professores/${professor.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${authService.getToken()}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao remover professor');
      }

      setSucesso(data.message || 'Professor removido com sucesso.');
      carregarProfessores();
    } catch (err) {
      setErro(err.message || 'Erro inesperado ao remover professor');
    } finally {
      setRemovendoId(null);
    }
  };

  return (
    <div className="page" style={{ padding: '24px', color: '#fff' }}>
      <header className="page__header" style={{ marginBottom: '24px' }}>
        <h1 className="page__title" style={{ fontSize: '26px', fontWeight: 'bold' }}>👨‍🏫 Gerenciar Professores</h1>
        <p className="page__subtitle" style={{ color: '#94a3b8' }}>
          Visualize as contas de professores cadastradas e remova as que não forem mais necessárias.
        </p>
      </header>

      {erro && (
        <div style={{ background: '#ef444422', border: '1px solid #ef4444', color: '#f87171', padding: '12px', borderRadius: '6px', marginBottom: '16px' }}>
          {erro}
        </div>
      )}

      {sucesso && (
        <div style={{ background: '#22c55e22', border: '1px solid #22c55e', color: '#4ade80', padding: '12px', borderRadius: '6px', marginBottom: '16px' }}>
          {sucesso}
        </div>
      )}

      <div className="ui-card" style={{ background: '#1e293b', borderRadius: '12px', border: '1px solid #334155', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>Carregando professores...</div>
        ) : professores.length === 0 ? (
          <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>Nenhum professor cadastrado.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ background: '#334155', color: '#f8fafc' }}>
                <tr>
                  <th style={{ padding: '12px 16px' }}>Nome</th>
                  <th style={{ padding: '12px 16px' }}>E-mail</th>
                  <th style={{ padding: '12px 16px' }}>Código</th>
                  <th style={{ padding: '12px 16px' }}>Ação</th>
                </tr>
              </thead>
              <tbody>
                {professores.map((professor) => (
                  <tr key={professor.id} style={{ borderBottom: '1px solid #334155' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 'bold' }}>{professor.nome_completo || '—'}</td>
                    <td style={{ padding: '12px 16px', color: '#cbd5e1' }}>{professor.email || '—'}</td>
                    <td style={{ padding: '12px 16px' }}>{professor.codigo_professor || '—'}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <button
                        onClick={() => removerProfessor(professor)}
                        disabled={removendoId === professor.id || professor.id === usuarioAtual?.id}
                        style={{ background: professor.id === usuarioAtual?.id ? '#64748b' : '#ef4444', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: removendoId === professor.id || professor.id === usuarioAtual?.id ? 'not-allowed' : 'pointer', opacity: removendoId === professor.id || professor.id === usuarioAtual?.id ? 0.7 : 1 }}
                      >
                        {professor.id === usuarioAtual?.id ? 'Sua conta' : removendoId === professor.id ? 'Removendo...' : 'Excluir'}
                      </button>
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
