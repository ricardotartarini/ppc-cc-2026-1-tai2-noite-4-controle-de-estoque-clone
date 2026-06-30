import React, { useState, useEffect } from 'react';
// Importe o supabase (ajuste o caminho '../supabase' se o seu arquivo supabase.js estiver em outra pasta)
import { supabase } from '../services/supabase';

export default function Movimentacao() {
  const [estoque, setEstoque] = useState([]);
  const [form, setForm] = useState({ produtoId: '', tipo: 'entrada', quantidade: '' });
  const [feedback, setFeedback] = useState({ type: '', text: '' });
  const [carregando, setCarregando] = useState(false);

  // 1. Busca os produtos diretamente do Supabase
  const carregarProdutos = async () => {
    const { data, error } = await supabase
      .from('laboratorio_produtos')
      .select('*')
      .order('nome', { ascending: true });

    if (error) {
      console.error('Erro ao buscar produtos:', error);
    } else {
      setEstoque(data || []);
    }
  };

  useEffect(() => {
    carregarProdutos();

    const channel = supabase
      .channel('laboratorio-produtos-movimentacao')
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback({ type: '', text: '' });
    setCarregando(true);

    const produtoSelecionado = estoque.find(p => String(p.id) === String(form.produtoId));
    if (!produtoSelecionado) return;

    const qtdDigitada = Number(form.quantidade);
    let novaQuantidade = produtoSelecionado.quantidade || 0;

    if (form.tipo === 'entrada') {
      novaQuantidade += qtdDigitada;
    } else {
      if (novaQuantidade < qtdDigitada) {
        setFeedback({ type: 'error', text: 'Estoque insuficiente!' });
        setCarregando(false);
        return;
      }
      novaQuantidade -= qtdDigitada;
    }

    try {
      // AÇÃO 1: Atualiza o estoque atual do produto
      const { error: updateError } = await supabase
        .from('laboratorio_produtos')
        .update({ quantidade: novaQuantidade })
        .eq('id', produtoSelecionado.id);

      if (updateError) throw updateError;

      // AÇÃO 2: Grava o registro no histórico (tabela movimentacoes)
      const { error: logError } = await supabase
        .from('movimentacoes')
        .insert([
          {
            produto_id: produtoSelecionado.id,
            tipo: form.tipo,
            quantidade: qtdDigitada,
            usuario: 'Administrador', // Aqui você pode puxar o nome do usuário logado depois
            data: new Date().toISOString()
          }
        ]);

      if (logError) throw logError;

      setFeedback({ type: 'success', text: 'Estoque atualizado e histórico registrado!' });
      setForm({ ...form, quantidade: '' });
      carregarProdutos();
    } catch (err) {
      console.error(err);
      setFeedback({ type: 'error', text: 'Erro ao processar movimentação.' });
    } finally {
      setCarregando(false);
    }
  };
  
  return (
    <div className="page">
      <header className="page__header">
        <h1 className="page__title">Registro de movimentação</h1>
        <p className="page__subtitle">
          Entrada ou saída de insumos no estoque central. Os dados são atualizados em tempo real no painel.
        </p>
      </header>

      <div className="card card--narrow">
        <form className="form-stack" onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="mov-produto">Insumo</label>
            <select
              id="mov-produto"
              className="ui-select"
              value={form.produtoId}
              onChange={(e) => setForm({ ...form, produtoId: e.target.value })}
              required
            >
              <option value="">Selecione o insumo</option>
              {estoque.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.nome} (Estoque atual: {i.quantidade})
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="mov-tipo">Tipo</label>
            <select
              id="mov-tipo"
              className="ui-select"
              value={form.tipo}
              onChange={(e) => setForm({ ...form, tipo: e.target.value })}
            >
              <option value="entrada">Entrada (+)</option>
              <option value="saida">Saída (−)</option>
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="mov-qtd">Quantidade</label>
            <input
              id="mov-qtd"
              className="ui-input field-width-xs"
              type="number"
              min={1}
              placeholder="Unidades"
              value={form.quantidade}
              onChange={(e) => setForm({ ...form, quantidade: e.target.value })}
              required
            />
          </div>

          {feedback.text && (
            <div className={feedback.type === 'error' ? 'alert alert--error' : 'alert alert--success'}>
              {feedback.text}
            </div>
          )}

          <button type="submit" className="btn btn--primary" disabled={carregando}>
            {carregando ? 'Registrando...' : 'Confirmar registro'}
          </button>
        </form>
      </div>
    </div>
  );
}