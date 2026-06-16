// src/utils/regrasNegocio.js
// Arquivo isolado com as lógicas críticas (Prevenção de quantidade negativa)
export function calcularSaidaEstoque(estoqueAtual, quantidadeRetirada) {
  const atual = Number(estoqueAtual) || 0;
  const retirada = Number(quantidadeRetirada) || 0;

  if (retirada <= 0) {
    throw new Error("A quantidade de retirada deve ser maior que zero.");
  }
  
  if (atual < retirada) {
    throw new Error(`Saldo insuficiente. Estoque atual é de apenas ${atual} unidades.`);
  }

  return atual - retirada;
}