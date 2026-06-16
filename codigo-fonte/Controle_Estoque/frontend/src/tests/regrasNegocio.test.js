// src/tests/regrasNegocio.test.js
// Testes unitários (Automatizados)
import { calcularSaidaEstoque } from '../utils/regrasNegocio';

describe('Regras de Negócio: Saída de Estoque', () => {
  
  test('Deve subtrair corretamente quando o estoque for suficiente', () => {
    const novoEstoque = calcularSaidaEstoque(10, 3);
    expect(novoEstoque).toBe(7);
  });

  test('Deve lançar erro quando a tentativa de retirada for maior que o estoque', () => {
    expect(() => {
      calcularSaidaEstoque(5, 10);
    }).toThrow('Saldo insuficiente. Estoque atual é de apenas 5 unidades.');
  });

  test('Deve lançar erro quando a retirada for zero ou negativa', () => {
    expect(() => {
      calcularSaidaEstoque(20, -5);
    }).toThrow('A quantidade de retirada deve ser maior que zero.');
    
    expect(() => {
      calcularSaidaEstoque(20, 0);
    }).toThrow('A quantidade de retirada deve ser maior que zero.');
  });

});