import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/auth';
import { supabase } from '../services/supabase';
import '../styles/Login.css';

function Login() {
  const navigate = useNavigate();
  const [isNewUser, setIsNewUser] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  
  const [tipoPerfil, setTipoPerfil] = useState('professor');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResetMessage('');
    setLoading(true);

    const emailLimpo = email.trim();

    if (isForgotPassword) {
      if (!emailLimpo) {
        setError('Por favor, informe seu e-mail para recuperar a senha.');
        setLoading(false);
        return;
      }
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(emailLimpo, {
          redirectTo: window.location.origin + '/reset-password',
        });
        if (error) throw error;
        setResetMessage('Se houver uma conta com este e-mail, enviamos um link de recuperação.');
      } catch (err) {
        setError('Erro ao solicitar recuperação de senha.');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!emailLimpo || !password) {
      setError('E-mail/Código e senha são obrigatórios');
      setLoading(false);
      return;
    }

    if (isNewUser) {
      if (password.length < 6) {
        setError('A senha deve ter no mínimo 6 caracteres.');
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setError('As senhas não coincidem');
        setLoading(false);
        return;
      }
      if (!fullName.trim()) {
        setError('Nome completo é obrigatório');
        setLoading(false);
        return;
      }
    }

    try {
      if (isNewUser) {
        const resultado = await authService.register(emailLimpo, password, fullName.trim(), tipoPerfil);
        setIsNewUser(false);
        setError('');
        if (resultado?.user?.codigoProfessor && tipoPerfil === 'professor') {
          alert(`Conta criada com sucesso!\n\nSeu código de professor: ${resultado.user.codigoProfessor}\n\nVocê pode usar este código para fazer login.`);
        } else {
          alert('Conta criada com sucesso! Faça seu login.');
        }
      } else {
        // Enviando entrada (pode ser email ou código de professor)
        await authService.login(emailLimpo, password, tipoPerfil);
        window.dispatchEvent(new Event('authChange'));
        navigate('/');
      }
    } catch (err) {
      let msg = err.message;
      if (msg === 'Invalid login credentials') {
        msg = 'E-mail/Código ou senha incorretos.';
      } else if (msg === 'User already registered' || msg === 'A user with this email address has already been registered') {
        msg = 'Este e-mail já está cadastrado no sistema.';
      }
      setError(msg || 'Erro ao processar requisição. Verifique suas credenciais e perfil.');
    } finally {
      setLoading(false);
    }
  };

  const toggleView = (view) => {
    setIsNewUser(view === 'register');
    setIsForgotPassword(view === 'forgot');
    setError('');
    setResetMessage('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title" style={{ color: '#ffffff' }}>
          {isForgotPassword ? 'Recuperar Senha' : isNewUser ? 'Criar Conta' : 'Acesso ao Med_Estoque'}
        </h2>
        
        <form onSubmit={handleSubmit} className="login-form">
          
          {/* OS BOTÕES DE PERFIL VOLTARAM A APARECER TANTO NO LOGIN QUANTO NO CADASTRO */}
          {!isForgotPassword && (
            <div className="form-group" style={{ marginBottom: '15px' }}>
              <label style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '8px', display: 'block' }}>
                Acessar como:
              </label>
              <div style={{ display: 'flex', gap: '20px', background: '#0f172a', padding: '10px', borderRadius: '6px', border: '1px solid #334155' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', cursor: 'pointer' }}>
                  <input type="radio" name="perfil" value="professor" checked={tipoPerfil === 'professor'} onChange={() => setTipoPerfil('professor')} />
                  Professor
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', cursor: 'pointer' }}>
                  <input type="radio" name="perfil" value="tecnico" checked={tipoPerfil === 'tecnico'} onChange={() => setTipoPerfil('tecnico')} />
                  Técnico
                </label>
              </div>
            </div>
          )}

          {isNewUser && (
            <div className="form-group">
              <label htmlFor="fullName">Nome Completo *</label>
              <input id="fullName" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="form-input" placeholder="Seu nome completo" />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">
              {isNewUser ? 'E-mail *' : 'E-mail ou Código de Professor *'}
            </label>
            <input 
              id="email" 
              type="text" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="form-input" 
              placeholder={isNewUser ? "seu.email@instituicao.com" : "seu.email@instituicao.com ou 12345678"}
            />
          </div>

          {!isForgotPassword && (
            <div className="form-group">
              <label htmlFor="password">Senha *</label>
              <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                <input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="form-input" placeholder="Sua senha" style={{ width: '100%', paddingRight: '40px' }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '10px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', padding: 0 }} title={showPassword ? "Ocultar senha" : "Mostrar senha"}>{showPassword ? '🙈' : '👁️'}</button>
              </div>
            </div>
          )}

          {isNewUser && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar Senha *</label>
              <input id="confirmPassword" type={showPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="form-input" placeholder="Confirme sua senha" />
            </div>
          )}

          {!isNewUser && !isForgotPassword && (
             <div style={{ textAlign: 'right', marginBottom: '15px' }}>
               <button type="button" onClick={() => toggleView('forgot')} style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', fontSize: '13px' }}>Esqueceu a senha?</button>
             </div>
          )}

          {error && <div className="error-message">{error}</div>}
          {resetMessage && <div style={{ color: '#4ade80', fontSize: '14px', marginBottom: '15px', textAlign: 'center' }}>{resetMessage}</div>}

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Processando...' : isForgotPassword ? 'Enviar Link' : isNewUser ? 'Criar Conta' : 'Fazer Login'}
          </button>

          <div className="toggle-auth">
            <p style={{ color: '#94a3b8' }}>
              {isForgotPassword ? 'Lembrou sua senha? ' : isNewUser ? 'Já tem conta? ' : 'Não tem conta? '}
              <button type="button" onClick={() => toggleView(isNewUser || isForgotPassword ? 'login' : 'register')} className="toggle-btn">
                {isForgotPassword || isNewUser ? 'Fazer Login' : 'Criar Conta'}
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;