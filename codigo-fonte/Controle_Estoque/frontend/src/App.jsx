// frontend/src/App.jsx

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Movimentacao from './pages/Movimentacao';
import Login from './pages/Login';
import SolicitarCompraMateriais from './pages/SolicitarCompraMateriais';
import MinhasSolicitacoesCompra from './pages/MinhasSolicitacoesCompra';
import SaidaLaboratorioProfessor from './pages/SaidaLaboratorioProfessor';
import AprovacaoComprasProfessor from './pages/AprovacaoComprasProfessor';
import MenuPrincipal from './pages/MenuPrincipal';
import ResetPassword from './pages/ResetPassword';
import HistoricoMovimentacoes from './pages/HistoricoMovimentacoes';
import AppNavbar from './components/AppNavbar';
import AppSidebar from './components/AppSidebar';

function AppLayout({ onLogout }) {
  return (
    <div className="app-container app-container--authed">
      <AppNavbar onLogout={onLogout} />
      <div className="app-shell">
        <AppSidebar />
        <main className="app-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function ProtectedRoute({ isAuthenticated }) {
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

function ProfessorRoute({ children, userRole }) {
  return userRole === 'professor' ? children : <Navigate to="/" replace />;
}

function TecnicoRoute({ children, userRole }) {
  return userRole === 'tecnico' ? children : <Navigate to="/" replace />;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null); 
  const [loading, setLoading] = useState(true);

  const loadAuthData = () => {
    const token = localStorage.getItem('token');
    const userDataStr = localStorage.getItem('user');
    
    if (token && userDataStr) {
      const user = JSON.parse(userDataStr);
      setIsAuthenticated(true);
      setUserRole(user.userType || user.tipo || user.role || 'professor'); 
    } else {
      setIsAuthenticated(false);
      setUserRole(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadAuthData();
    const handleAuthChange = () => loadAuthData();
    window.addEventListener('authChange', handleAuthChange);
    return () => window.removeEventListener('authChange', handleAuthChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUserRole(null);
  };

  if (loading) {
    return (
      <div className="app-loading" style={{ color: '#fff', padding: '20px' }}>
        <span>Carregando Estrutura…</span>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/reset-password" element={isAuthenticated ? <Navigate to="/" replace /> : <ResetPassword />} />

        <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
          <Route element={<AppLayout onLogout={handleLogout} />}>
            
            <Route path="/" element={<MenuPrincipal />} />
            
            <Route path="/estoque" element={<TecnicoRoute userRole={userRole}><Dashboard /></TecnicoRoute>} />
            <Route path="/movimentacao" element={<TecnicoRoute userRole={userRole}><Movimentacao /></TecnicoRoute>} />
            <Route path="/tecnico/solicitar-compra" element={<TecnicoRoute userRole={userRole}><SolicitarCompraMateriais /></TecnicoRoute>} />
            <Route path="/tecnico/minhas-solicitacoes" element={<TecnicoRoute userRole={userRole}><MinhasSolicitacoesCompra /></TecnicoRoute>} />
            <Route path="/tecnico/historico" element={<TecnicoRoute userRole={userRole}><HistoricoMovimentacoes /></TecnicoRoute>} />

            <Route path="/professor/saida-laboratorio" element={<ProfessorRoute userRole={userRole}><SaidaLaboratorioProfessor /></ProfessorRoute>} />
            <Route path="/professor/aprovar-compras" element={<ProfessorRoute userRole={userRole}><AprovacaoComprasProfessor /></ProfessorRoute>} />

          </Route>
        </Route>

        <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
      </Routes>
    </Router>
  );
}

export default App;