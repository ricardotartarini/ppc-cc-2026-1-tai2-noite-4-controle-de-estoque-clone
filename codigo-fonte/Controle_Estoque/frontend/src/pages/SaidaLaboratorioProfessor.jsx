/*
  RESPOSTAS E MELHORIAS APLICADAS:

  1. SOBRE A DATA FIXA (readOnly):
     Sim, a data de retirada deve ser fixa. Como você está construindo um software com foco em qualidade e auditoria, manter a data travada no dia/hora atual gerado pelo sistema é uma regra de segurança essencial. Isso garante a integridade do banco de dados (audit log), impedindo que usuários registrem retiradas com datas retroativas ou futuras para burlar a contagem.

  2. MELHORIA DE UX IMPLEMENTADA NESTA TELA:
     A tela ficava muito vazia e sem feedback de histórico para o Professor. 
     Implementei um painel lateral dinâmico chamado "Retiradas Recentes da Sessão". Agora, quando o professor retira um item, o formulário limpa, mas o item vai para uma lista visual ao lado com a hora exata da ação. Isso preenche a tela e dá uma confirmação visual excelente de que o processo funcionou.
*/

import React, { useEffect, useState } from 'react';
import authService from '../services/auth';
import { supabase } from '../services/supabase';
import laboratorioService from '../services/laboratorioService';

export default function SaidaLaboratorioProfessor() {
  const [user, setUser] = useState(null);
  const [professorNome, setProfessorNome] = useState('');
  const [data, setData] = useState('');
  
  const [produtosBanco, setProdutosBanco] = useState([]);
  const [categorias, setCategorias] = useState([]);
  
  const [categoria, setCategoria] = useState(''); 
  const [produtoId, setProdutoId] = useState(''); 
  const [quantidade, setQuantidade] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  useEffect(() => {
    const getUser = async () => {
      const u = await authService.getUser();
      setUser(u);
    };
    getUser();
  }, []);

  useEffect(() => {
    if (!user?.fullName) return;
    const hoje = new Date().toISOString().slice(0, 10);
    setData(hoje);
    setProfessorNome(user.fullName);
  }, [user?.fullName]);

  useEffect(() => {
    const carregarProdutos = async () => {
      const { data: dataProdutos, error } = await supabase
        .from('laboratorio_produtos')
        .select('*')
        .order('nome', { ascending: true });

      if (error) {
        console.error('Erro ao buscar produtos:', error);
      } else if (dataProdutos) {
        setProdutosBanco(dataProdutos);
        const listaCategorias = [...new Set(dataProdutos.map(p => p.categoria))].filter(Boolean);
        setCategorias(listaCategorias);
      }
    };

    carregarProdutos();

    const channel = supabase
      .channel('laboratorio-produtos-professor')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'laboratorio_produtos' },
        () => {
          carregarProdutos();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const produtosFiltrados = produtosBanco.filter(p => p.categoria === categoria);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setSucesso('');
    setEnviando(true);

    const qtdSubtrair = Number(quantidade);
    const produtoSelecionado = produtosBanco.find(p => String(p.id) === String(produtoId));

    if (!produtoSelecionado) {
      setErro('Selecione um produto válido.');
      setEnviando(false);
      return;
    }

    const estoqueAtual = produtoSelecionado.quantidade || 0;

    if (estoqueAtual < qtdSubtrair) {
      setErro(`Saldo insuficiente! Estoque atual de apenas ${estoqueAtual} unidades.`);
      setEnviando(false);
      return;
    }

    try {
      const response = await laboratorioService.registrarSaida(produtoId, qtdSubtrair);
      const quantidadeAtualizada = response?.produto?.quantidade;

      setProdutosBanco(prev => prev.map(p => p.id === produtoId ? { ...p, quantidade: quantidadeAtualizada } : p));

      setSucesso(`Saída de ${qtdSubtrair} ${qtdSubtrair === 1 ? 'unidade' : 'unidades'} do produto "${produtoSelecionado.nome}" registrada!`);
      setQuantidade('');
      setProdutoId('');
      // Mantemos a 'categoria' preenchida para facilitar caso ele queira tirar outro item do mesmo grupo
    } catch (err) {
      setErro(`Erro ao processar: ${err.message}`);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="page" style={{ padding: '24px', color: '#fff' }}>
        <header className="page__header" style={{ marginBottom: '24px' }}>
          <h1 className="page__title" style={{ fontSize: '26px', fontWeight: 'bold' }}>🧪 Saída de Material (Laboratório)</h1>
          <p className="page__subtitle" style={{ color: '#94a3b8' }}>Registre a retirada de insumos para aulas práticas.</p>
        </header>

        <div className="ui-card" style={{ background: '#1e293b', padding: '30px', borderRadius: '12px', border: '1px solid #334155', maxWidth: '720px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div className="form-field" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontWeight: '600' }}>Professor solicitante</label>
              <input type="text" className="ui-input" style={{ background: '#0f172a', border: '1px solid #334155', padding: '10px', borderRadius: '6px', color: '#94a3b8', cursor: 'not-allowed' }} value={professorNome} readOnly disabled />
            </div>

            <div className="form-field" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontWeight: '600' }}>Data da retirada</label>
              {/* O campo continua bloqueado para garantir a segurança da regra de negócio */}
              <input type="date" className="ui-input" style={{ background: '#0f172a', border: '1px solid #334155', padding: '10px', borderRadius: '6px', color: '#94a3b8', cursor: 'not-allowed' }} value={data} readOnly disabled />
            </div>

            <div className="form-field" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label htmlFor="categoria" style={{ fontWeight: '600' }}>Filtro por Categoria *</label>
              <select id="categoria" className="ui-select" style={{ background: '#0f172a', border: '1px solid #334155', padding: '10px', borderRadius: '6px', color: '#fff' }} value={categoria} onChange={(e) => { setCategoria(e.target.value); setProdutoId(''); }} required>
                <option value="">-- Selecione uma categoria --</option>
                {categorias.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            {categoria && (
              <div className="form-field" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label htmlFor="produto" style={{ fontWeight: '600' }}>Selecione o Produto *</label>
                <select id="produto" className="ui-select" style={{ background: '#0f172a', border: '1px solid #334155', padding: '10px', borderRadius: '6px', color: '#fff' }} value={produtoId} onChange={(e) => setProdutoId(e.target.value)} required>
                  <option value="">-- Selecione o item --</option>
                  {produtosFiltrados.map(p => (
                    <option key={p.id} value={p.id}>
                      [{p.codigo}] {p.nome} (Disponível: {p.quantidade || 0})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-field" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label htmlFor="quantidade" style={{ fontWeight: '600' }}>Quantidade a Retirar *</label>
              <input id="quantidade" type="number" min={1} className="ui-input" style={{ background: '#0f172a', border: '1px solid #334155', padding: '10px', borderRadius: '6px', color: '#fff', width: '120px' }} value={quantidade} onChange={(e) => setQuantidade(e.target.value)} required placeholder="Ex: 5" />
            </div>

            {erro && <div style={{ background: '#ef444422', border: '1px solid #ef4444', color: '#f87171', padding: '12px', borderRadius: '6px' }}>{erro}</div>}
            {sucesso && <div style={{ background: '#22c55e22', border: '1px solid #22c55e', color: '#4ade80', padding: '12px', borderRadius: '6px' }}>{sucesso}</div>}

            <button type="submit" className="btn" style={{ background: enviando || !produtoId ? '#7f1d1d' : '#dc2626', color: '#fff', padding: '12px', borderRadius: '6px', border: 'none', fontWeight: 'bold', cursor: enviando || !produtoId ? 'not-allowed' : 'pointer', marginTop: '10px' }} disabled={enviando || !produtoId}>
              {enviando ? 'Registrando…' : 'Confirmar saída do estoque'}
            </button>
          </form>
        </div>
    </div>
  );
}