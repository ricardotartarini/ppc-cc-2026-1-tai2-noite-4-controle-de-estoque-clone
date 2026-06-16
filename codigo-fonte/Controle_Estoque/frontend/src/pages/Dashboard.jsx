import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase'; 

export default function Dashboard() {
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  // Estados de Controle de Interface
  const [modo, setModo] = useState(null); // null, 'ajuste' ou 'cadastro'
  
  // Estados para Filtros e Movimentação
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [produtoSelecionado, setProdutoSelecionado] = useState('');
  const [quantidadeMovimento, setQuantidadeMovimento] = useState(0);

  // Estado para Novo Cadastro
  const [novoProd, setNovoProd] = useState({ nome: '', codigo: '', categoria: '', quantidade: 0 });

  useEffect(() => {
    carregarProdutos();
  }, []);

  const carregarProdutos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('laboratorio_produtos') 
        .select('*')
        .order('nome', { ascending: true });

      if (error) throw error;
      
      setProdutos(data || []);
      const listaCategorias = [...new Set((data || []).map(p => p.categoria))].filter(Boolean);
      setCategorias(listaCategorias);
      
    } catch (error) {
      console.error("Erro ao carregar:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // LÓGICA DE CADASTRO
  const handleCadastro = async (e) => {
    e.preventDefault();
    setSalvando(true);
    try {
      const { error } = await supabase.from('laboratorio_produtos').insert([novoProd]);
      if (error) throw error;
      alert('✅ Produto cadastrado com sucesso!');
      setNovoProd({ nome: '', codigo: '', categoria: '', quantidade: 0 });
      setModo(null);
      carregarProdutos();
    } catch (error) {
      alert('❌ Erro ao cadastrar: ' + error.message);
    } finally {
      setSalvando(false);
    }
  };

  // LÓGICA DE AJUSTE
  const handleRegistrarMovimento = async (e) => {
    e.preventDefault();
    const produto = produtos.find(item => String(item.id) === String(produtoSelecionado));
    if (!produto) return alert("Selecione um produto!");

    setSalvando(true);
    const novaQuantidade = Number(produto.quantidade || 0) + Number(quantidadeMovimento);

    try {
      const { error } = await supabase
        .from('laboratorio_produtos')
        .update({ quantidade: novaQuantidade })
        .eq('id', produto.id);

      if (error) throw error;
      alert('✅ Estoque atualizado com sucesso!');
      setQuantidadeMovimento(0);
      setProdutoSelecionado('');
      setCategoriaFiltro('');
      setModo(null);
      carregarProdutos();
    } catch (error) {
      alert('❌ Erro ao atualizar: ' + error.message);
    } finally {
      setSalvando(false);
    }
  };

  const totalProdutos = produtos.length;
  const estoqueCritico = produtos.filter(p => (p.quantidade || 0) < 5).length;
  const estoqueZerado = produtos.filter(p => (p.quantidade || 0) === 0).length;

  const produtosFiltrados = categoriaFiltro 
    ? produtos.filter(p => p.categoria === categoriaFiltro) 
    : produtos;

  return (
    <div className="page" style={{ padding: '24px', color: '#fff' }}>
      <header className="page__header" style={{ marginBottom: '24px' }}>
        <h1 className="page__title" style={{ fontSize: '26px', fontWeight: 'bold' }}>📦 Gestão de Estoque</h1>
        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
          <button onClick={() => setModo(modo === 'cadastro' ? null : 'cadastro')} style={{ padding: '10px 20px', background: modo === 'cadastro' ? '#475569' : '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
            {modo === 'cadastro' ? '❌ Cancelar Cadastro' : '+ Novo Produto'}
          </button>
          <button onClick={() => setModo(modo === 'ajuste' ? null : 'ajuste')} style={{ padding: '10px 20px', background: modo === 'ajuste' ? '#475569' : '#10b981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
            {modo === 'ajuste' ? '❌ Cancelar Ajuste' : '🔄 Ajuste Manual'}
          </button>
        </div>
      </header>

      {/* PAINEL DE CADASTRO */}
      {modo === 'cadastro' && (
        <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '12px', marginBottom: '30px', border: '1px solid #334155' }}>
          <h3 style={{ marginBottom: '20px' }}>Cadastrar Novo Produto</h3>
          <form onSubmit={handleCadastro} style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <input placeholder="Nome" value={novoProd.nome} onChange={e => setNovoProd({...novoProd, nome: e.target.value})} required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #475569', background: '#0f172a', color: '#fff', flex: '1 1 200px' }} />
            <input placeholder="Código" value={novoProd.codigo} onChange={e => setNovoProd({...novoProd, codigo: e.target.value})} required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #475569', background: '#0f172a', color: '#fff', width: '100px' }} />
            <input placeholder="Categoria" value={novoProd.categoria} onChange={e => setNovoProd({...novoProd, categoria: e.target.value})} required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #475569', background: '#0f172a', color: '#fff', width: '150px' }} />
            <input type="number" placeholder="Qtd" value={novoProd.quantidade} onChange={e => setNovoProd({...novoProd, quantidade: e.target.value})} required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #475569', background: '#0f172a', color: '#fff', width: '80px' }} />
            <button type="submit" disabled={salvando} style={{ padding: '10px 20px', background: '#22c55e', border: 'none', color: '#fff', borderRadius: '6px', fontWeight: 'bold' }}>Salvar</button>
          </form>
        </div>
      )}

      {/* PAINEL DE AJUSTE */}
      {modo === 'ajuste' && (
        <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '12px', marginBottom: '30px', border: '1px solid #334155' }}>
          <h3 style={{ marginBottom: '20px' }}>Registrar Ajuste Manual</h3>
          <form onSubmit={handleRegistrarMovimento} style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <select value={categoriaFiltro} onChange={(e) => { setCategoriaFiltro(e.target.value); setProdutoSelecionado(''); }} style={{ padding: '10px', borderRadius: '6px', background: '#0f172a', color: '#fff', flex: '1' }}>
              <option value="">Todas as categorias...</option>
              {categorias.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <select value={produtoSelecionado} onChange={(e) => setProdutoSelecionado(e.target.value)} required style={{ padding: '10px', borderRadius: '6px', background: '#0f172a', color: '#fff', flex: '2' }}>
              <option value="">Selecione o produto...</option>
              {produtosFiltrados.map(item => <option key={item.id} value={item.id}>{item.nome} — ({item.quantidade} em estoque)</option>)}
            </select>
            <input type="number" value={quantidadeMovimento} onChange={e => setQuantidadeMovimento(e.target.value)} required style={{ padding: '10px', borderRadius: '6px', background: '#0f172a', color: '#fff', width: '80px' }} />
            <button type="submit" disabled={salvando} style={{ padding: '10px 20px', background: '#10b981', border: 'none', color: '#fff', borderRadius: '6px' }}>Confirmar</button>
          </form>
        </div>
      )}

      {/* CARDS DE RESUMO */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
        <div style={{ background: '#1e293b', padding: '20px', borderRadius: '8px', flex: 1 }}>
          <h3 style={{ color: '#94a3b8', fontSize: '14px' }}>Itens</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{totalProdutos}</p>
        </div>
        <div style={{ background: '#1e293b', padding: '20px', borderRadius: '8px', flex: 1 }}>
          <h3 style={{ color: '#94a3b8', fontSize: '14px' }}>Críticos</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#fbbf24' }}>{estoqueCritico}</p>
        </div>
        <div style={{ background: '#1e293b', padding: '20px', borderRadius: '8px', flex: 1 }}>
          <h3 style={{ color: '#94a3b8', fontSize: '14px' }}>Zerados</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#f87171' }}>{estoqueZerado}</p>
        </div>
      </div>

      {/* FILTRO DE CATEGORIAS */}
      {!loading && (
        <div style={{ marginBottom: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>🏷️ Filtrar por Categoria</h3>
            <button 
              onClick={() => setCategoriaFiltro('')}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: '2px solid #475569',
                cursor: 'pointer',
                fontWeight: 'bold',
                background: categoriaFiltro === '' ? '#3b82f6' : 'transparent',
                color: categoriaFiltro === '' ? '#fff' : '#94a3b8',
                transition: 'all 0.3s',
                fontSize: '14px'
              }}
            >
              ✓ Ver Tudo ({produtos.length})
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            {categorias.map(cat => (
              <button 
                key={cat}
                onClick={() => setCategoriaFiltro(cat)}
                style={{
                  padding: '14px 16px',
                  borderRadius: '8px',
                  border: '2px solid transparent',
                  cursor: 'pointer',
                  fontWeight: '600',
                  background: categoriaFiltro === cat ? '#10b981' : '#1e293b',
                  color: categoriaFiltro === cat ? '#fff' : '#94a3b8',
                  borderColor: categoriaFiltro === cat ? '#059669' : '#334155',
                  transition: 'all 0.3s',
                  fontSize: '14px',
                  textAlign: 'left',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span>{cat}</span>
                <span style={{ background: categoriaFiltro === cat ? 'rgba(255,255,255,0.2)' : '#334155', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>
                  {produtos.filter(p => p.categoria === cat).length}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {loading ? <div>Carregando...</div> : (
        <div style={{ background: '#1e293b', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '16px', background: '#0f172a', borderBottom: '1px solid #334155', color: '#94a3b8', fontSize: '14px', fontWeight: 'bold' }}>
            {categoriaFiltro ? `Mostrando ${produtosFiltrados.length} produtos em "${categoriaFiltro}"` : `Mostrando todos os ${produtosFiltrados.length} produtos`}
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#0f172a', color: '#94a3b8' }}>
              <tr>
                <th style={{ padding: '16px' }}>Código</th>
                <th style={{ padding: '16px' }}>Produto</th>
                <th style={{ padding: '16px' }}>Categoria</th>
                <th style={{ padding: '16px' }}>Estoque</th>
              </tr>
            </thead>
            <tbody>
              {produtosFiltrados.length > 0 ? (
                produtosFiltrados.map(item => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #334155' }}>
                    <td style={{ padding: '16px' }}>{item.codigo}</td>
                    <td style={{ padding: '16px' }}>{item.nome}</td>
                    <td style={{ padding: '16px', color: '#60a5fa' }}>{item.categoria}</td>
                    <td style={{ padding: '16px', fontWeight: 'bold', color: item.quantidade < 5 ? '#f87171' : '#4ade80' }}>
                      {item.quantidade}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                    Nenhum produto encontrado nesta categoria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}