import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import authService from '../services/auth';

export function ProfessorOnly({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const u = await authService.getUser();
      setUser(u);
      setLoading(false);
    };
    checkUser();
  }, []);

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.userType !== 'professor') return <Navigate to="/" replace />;
  return children;
}

export function TecnicoOnly({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const u = await authService.getUser();
      setUser(u);
      setLoading(false);
    };
    checkUser();
  }, []);

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.userType !== 'tecnico') return <Navigate to="/" replace />;
  return children;
}
