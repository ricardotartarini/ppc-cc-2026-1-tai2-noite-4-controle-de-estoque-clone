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

  // NOVO ESTADO: Armazena o histórico de retiradas feitas enquanto a tela estiver aberta
  const [retiradasSessao, setRetiradasSessao] = useState([]);

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
      const novaQuantidade = estoqueAtual - qtdSubtrair;
      
      const { error: errorUpdate } = await supabase
        .from('laboratorio_produtos')
        .update({ quantidade: novaQuantidade })
        .eq('id', produtoId);

      if (errorUpdate) throw errorUpdate;

      const { error: errorMov } = await supabase
        .from('movimentacoes')
        .insert([{
          produto_id: produtoId,
          tipo: 'saida',
          quantidade: qtdSubtrair,
          user_id: user?.id || null
        }]);

      if (errorMov) console.error('Erro no histórico:', errorMov.message);

      setProdutosBanco(prev => prev.map(p => p.id === produtoId ? { ...p, quantidade: novaQuantidade } : p));
      
      // Atualiza o painel lateral com o novo item retirado
      setRetiradasSessao(prev => [
        {
          id: Date.now(),
          nome: produtoSelecionado.nome,
          codigo: produtoSelecionado.codigo,
          qtd: qtdSubtrair,
          hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
        ...prev
      ]);

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
    <div className="page" style={{ padding: '24px', color: '#fff', display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
      
      {/* LADO ESQUERDO: Formulário de Saída */}
      <div style={{ flex: '1 1 500px' }}>
        <header className="page__header" style={{ marginBottom: '24px' }}>
          <h1 className="page__title" style={{ fontSize: '26px', fontWeight: 'bold' }}>🧪 Saída de Material (Laboratório)</h1>
          <p className="page__subtitle" style={{ color: '#94a3b8' }}>Registre a retirada de insumos para aulas práticas.</p>
        </header>

        <div className="ui-card" style={{ background: '#1e293b', padding: '30px', borderRadius: '12px', border: '1px solid #334155' }}>
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

      {/* LADO DIREITO: Painel visual de acompanhamento da sessão */}
      <div style={{ flex: '1 1 300px', background: '#0f172a', padding: '24px', borderRadius: '12px', border: '1px solid #1e293b' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #334155', paddingBottom: '15px' }}>
          <span style={{ fontSize: '20px' }}>📋</span>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#f8fafc', margin: 0 }}>
            Retiradas Recentes
          </h3>
        </div>
        
        {retiradasSessao.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 0', color: '#64748b' }}>
            <p style={{ fontSize: '14px', margin: 0 }}>Nenhuma retirada registrada nesta sessão.</p>
            <p style={{ fontSize: '12px', marginTop: '5px' }}>Os itens aparecerão aqui após a confirmação.</p>
          </div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {retiradasSessao.map(item => (
              <li key={item.id} style={{ background: '#1e293b', padding: '14px', borderRadius: '8px', borderLeft: '4px solid #10b981', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#f8fafc' }}>{item.nome}</span>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>Código: {item.codigo} • {item.hora}</span>
                </div>
                <div style={{ background: '#047857', color: '#fff', padding: '6px 10px', borderRadius: '6px', fontWeight: 'bold', fontSize: '14px' }}>
                  -{item.qtd}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

    </div>
  );
}