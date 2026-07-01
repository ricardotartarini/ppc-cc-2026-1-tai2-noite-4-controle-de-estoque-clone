import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import authService from '../services/auth';

const PROF_LINKS = [
  { to: '/professor/saida-laboratorio', label: 'Saída laboratório' },
  { to: '/professor/historico-retiradas', label: 'Histórico retiradas' }
];

const TEC_LINKS = [
  { to: '/estoque', label: 'Estoque' },
  { to: '/movimentacao', label: 'Movimentação' },
  { to: '/tecnico/solicitar-compra', label: 'Solicitar compra' },
  { to: '/tecnico/minhas-solicitacoes', label: 'Minhas solicitações' },
  { to: '/tecnico/historico', label: 'Auditoria' },
  { to: '/tecnico/gerenciar-professores', label: 'Professores' }
];

function linkClass({ isActive }) {
  return 'app-sidebar__link' + (isActive ? ' app-sidebar__link--active' : '');
}

export default function AppSidebar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await authService.getUser();
      setUser(userData);
    };
    fetchUser();
  }, []);

  const userRole = user?.tipo || user?.role || user?.userType || 'professor';
  const links = userRole === 'tecnico' ? TEC_LINKS : PROF_LINKS;
  const roleLabel = userRole === 'tecnico' ? 'Técnico' : 'Professor';

  return (
    <aside className="app-sidebar" aria-label="Menu lateral">
      <div className="app-sidebar__profile">
        <span className="app-sidebar__profile-title">Olá, {user?.fullName || 'Usuário'}</span>
        <span className="app-sidebar__profile-role">{roleLabel}</span>
      </div>

      <nav className="app-sidebar__nav" aria-label="Navegação principal">
        <NavLink to="/" end className={linkClass}>
          Início
        </NavLink>
        {links.map((item) => (
          <NavLink key={item.to} to={item.to} className={linkClass}>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}