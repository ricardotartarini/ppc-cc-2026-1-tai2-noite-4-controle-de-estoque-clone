import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import authService from '../services/auth';
import { supabase } from '../services/supabase'; 

const ALL_CARDS = [
  { to: '/estoque', icon: '📦', title: 'Controle de estoque', description: 'Consulte códigos e quantidades disponíveis.', roles: ['tecnico'] },
  { to: '/professor/saida-laboratorio', icon: '🧪', title: 'Saída (laboratório)', description: 'Registre materiais retirados para aulas práticas.', roles: ['professor'] },
  { to: '/professor/historico-retiradas', icon: '📚', title: 'Histórico de retiradas', description: 'Veja todas as saídas já registradas na sua conta.', roles: ['professor'] },
  { to: '/tecnico/solicitar-compra', icon: '📝', title: 'Solicitar compra', description: 'Peça reposição de materiais ao setor responsável.', roles: ['tecnico'] },
  { to: '/tecnico/minhas-solicitacoes', icon: '📋', title: 'Histórico de compras', description: 'Veja o andamento das solicitações.', roles: ['tecnico'] },
  { to: '/tecnico/historico', icon: '🔍', title: 'Auditoria e Relatórios', description: 'Histórico completo de entradas e saídas com exportação CSV.', roles: ['tecnico'] }
];

export default function MenuPrincipal() {
  const [user, setUser] = useState(null);
  const [saudacao, setSaudacao] = useState('');
  const [produtosEmBaixa, setProdutosEmBaixa] = useState(0);
  const [pedidosPendentes, setPedidosPendentes] = useState(0);

  useEffect(() => {
    const hora = new Date().getHours();
    if (hora >= 5 && hora < 12) setSaudacao('Bom dia');
    else if (hora >= 12 && hora < 18) setSaudacao('Boa tarde');
    else setSaudacao('Boa noite');

    let userRoleRef = 'professor';

    const carregarAlertas = async (role) => {
      const r = role || userRoleRef;
      if (r !== 'tecnico') return;

      const { count: countEstoque } = await supabase
        .from('laboratorio_produtos')
        .select('*', { count: 'exact', head: true })
        .lt('quantidade', 5);
      setProdutosEmBaixa(countEstoque || 0);

      const { count: countPedidos } = await supabase
        .from('solicitacoes_compra')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Pendente');
      setPedidosPendentes(countPedidos || 0);
    };

    const init = async () => {
      const u = await authService.getUser();
      setUser(u);
      userRoleRef = u?.userType || u?.tipo || u?.role || 'professor';
      await carregarAlertas(userRoleRef);
    };

    init();

    const channelEstoque = supabase
      .channel('laboratorio-produtos-menu')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'laboratorio_produtos' }, () => {
        carregarAlertas();
      })
      .subscribe();

    const channelCompras = supabase
      .channel('solicitacoes-compra-menu')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'solicitacoes_compra' }, () => {
        carregarAlertas();
      })
      .subscribe();

    return () => {
      channelEstoque.unsubscribe();
      channelCompras.unsubscribe();
    };
  }, []);

  const userRole = user?.userType || user?.tipo || user?.role || 'professor'; 
  const cardsPermitidos = ALL_CARDS.filter(card => card.roles.includes(userRole));

  return (
    <div className="page" style={{ padding: '24px' }}>
      <header className="page__header" style={{ marginBottom: '30px' }}>
        <h1 className="page__title" style={{ fontSize: '28px', color: '#f8fafc' }}>{saudacao}, {user?.fullName?.split(' ')[0] || 'Usuário'}!</h1>
        <p className="page__subtitle" style={{ color: '#94a3b8', fontSize: '16px' }}>
          Você está acessando como <strong>{userRole === 'tecnico' ? 'Técnico' : 'Professor'}</strong>.
        </p>
      </header>

      {userRole === 'tecnico' && (produtosEmBaixa > 0 || pedidosPendentes > 0) && (
        <div style={{ display: 'flex', gap: '20px', marginBottom: '40px', flexWrap: 'wrap' }}>
          
          {produtosEmBaixa > 0 && (
            <div style={{ background: '#7f1d1d', border: '1px solid #ef4444', padding: '16px 20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '15px', flex: '1 1 300px' }}>
              <span style={{ fontSize: '24px' }}>⚠️</span>
              <div>
                <h4 style={{ margin: 0, color: '#fca5a5', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Alerta de Estoque</h4>
                <p style={{ margin: '4px 0 0 0', color: '#fff', fontWeight: 'bold' }}>{produtosEmBaixa} produtos estão acabando</p>
              </div>
            </div>
          )}

          {pedidosPendentes > 0 && (
            <div style={{ background: '#7e22ce', border: '1px solid #a855f7', padding: '16px 20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '15px', flex: '1 1 300px' }}>
              <span style={{ fontSize: '24px' }}>🔔</span>
              <div>
                <h4 style={{ margin: 0, color: '#d8b4fe', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Solicitações</h4>
                <p style={{ margin: '4px 0 0 0', color: '#fff', fontWeight: 'bold' }}>{pedidosPendentes} pedidos aguardando análise</p>
              </div>
            </div>
          )}

        </div>
      )}

      <h3 style={{ color: '#e2e8f0', marginBottom: '15px', fontSize: '18px' }}>Módulos do Sistema</h3>
      <div className="hub-grid" role="navigation" aria-label="Módulos do sistema">
        {cardsPermitidos.map((item) => (
          <Link key={item.to} to={item.to} className="hub-card">
            <span className="hub-card__icon" aria-hidden="true">{item.icon}</span>
            <div className="hub-card__content">
              <h2 className="hub-card__title">{item.title}</h2>
              <p className="hub-card__desc">{item.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}