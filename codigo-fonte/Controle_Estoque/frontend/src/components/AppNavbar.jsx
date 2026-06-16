import React from 'react';
import { NavLink } from 'react-router-dom';

function homeClass({ isActive }) {
  return 'app-nav__home' + (isActive ? ' app-nav__home--active' : '');
}

export default function AppNavbar({ onLogout }) {
  return (
    <nav className="app-nav" aria-label="Barra superior">
      <span className="app-nav__brand">Med-Estoque</span>
      <div className="app-nav__actions">
        <NavLink to="/" end className={homeClass}>
          Início
        </NavLink>
        <button type="button" className="app-nav__logout" onClick={onLogout}>
          Sair
        </button>
      </div>
    </nav>
  );
}
