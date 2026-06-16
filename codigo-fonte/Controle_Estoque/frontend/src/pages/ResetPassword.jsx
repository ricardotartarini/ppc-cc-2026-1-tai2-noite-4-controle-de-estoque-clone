// ResetPassword.jsx (Crie este novo arquivo na pasta dos seus componentes/telas)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import '../styles/Login.css';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Verifica se a URL contém o token de recuperação enviado pelo Supabase
    const hash = window.location.hash;
    if (!hash || !hash.includes('access_token')) {
      setError('Link inválido ou expirado. Solicite a recuperação novamente.');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setLoading(true);

    try {
      // O Supabase usa a sessão temporária criada pelo link para atualizar a senha
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) throw error;

      setMessage('Senha atualizada com sucesso! Redirecionando...');
      
      setTimeout(() => {
        navigate('/'); 
      }, 3000);
      
    } catch (err) {
      setError('Erro ao atualizar a senha: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title" style={{ color: '#ffffff' }}>Criar Nova Senha</h2>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="password">Nova Senha *</label>
            <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                placeholder="Sua nova senha"
                style={{ width: '100%', paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '10px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', padding: 0 }}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar Nova Senha *</label>
            <input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="form-input"
              placeholder="Confirme sua nova senha"
            />
          </div>

          {error && <div className="error-message">{error}</div>}
          {message && <div style={{ color: '#4ade80', fontSize: '14px', marginBottom: '15px', textAlign: 'center', fontWeight: 'bold' }}>{message}</div>}

          <button type="submit" className="btn-submit" disabled={loading || message}>
            {loading ? 'Salvando...' : 'Atualizar Senha'}
          </button>
        </form>
      </div>
    </div>
  );
}