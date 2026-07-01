# Programação de Funcionalidades

Implementação da aplicação prática por meio dos requisitos funcionais codificados para o MVP do sistema **Med_Estoque**.

---

## 🔐 1. Controle de Acesso e Autenticação (Login)

* **Tela da Funcionalidade:**

<img width="1896" height="866" alt="Captura de tela 2026-07-01 094313" src="https://github.com/user-attachments/assets/f0628600-0169-43eb-b062-d15d1b80efd3" />
<img width="1876" height="857" alt="Captura de tela 2026-07-01 100916" src="https://github.com/user-attachments/assets/58804533-f8f3-4f44-bbe7-64a44590afe1" />


* **Requisito Atendido:**
  * **RF-01:** O sistema deve permitir o controle de acesso diferenciado por perfil, identificando se o usuário é um **Professor** ou um **Técnico** de laboratório antes de liberar o painel correspondente.
* **Instruções de Acesso:**
  1. Acesse a página inicial do sistema.
  2. Escolha o perfil desejado no seletor superior.
  3. Insira as credenciais válidas e clique em "Fazer Login".
* **Responsável:** Alice, João Gustavo, Pedro e Ricardo.

---

## 📦 2. Gerenciamento e Monitoramento de Estoque

* **Tela da Funcionalidade:**

<img width="1896" height="860" alt="Captura de tela 2026-07-01 094540" src="https://github.com/user-attachments/assets/2cad0ff4-cde0-46ba-b543-49d972d7a160" />

* **Requisito Atendido:**
  * **RF-02:** O sistema deve listar todos os insumos e materiais cadastrados no laboratório, exibindo indicadores em tempo real sobre o total de itens, quantidades críticas (estoque baixo) e itens zerados, além de permitir filtros por categoria.

* **Estrutura de Dados:**
  * Estrutura JSON/Banco de dados para produtos:
    ```json
    {
      "id_produto": 101,
      "nome": "Álcool Isopropílico 70%",
      "categoria": "Esterilização",
      "quantidade_atual": 15,
      "estoque_minimo": 20,
      "status": "Crítico"
    }
    ```
* **Instruções de Acesso:**
  1. Logue com o perfil de **Técnico**.
  2. No menu lateral ou painel inicial, clique em "Gestão de Estoque".
* **Responsável:** Alice, João Gustavo, Pedro e Ricardo.

---

## 📥 3. Registro de Movimentação (Entradas e Saídas com Validação)

* **Telas da Funcionalidade:**
<img width="1892" height="855" alt="Captura de tela 2026-07-01 094945" src="https://github.com/user-attachments/assets/36b0da57-0b85-435e-af63-c4fe1d920819" />
<img width="1896" height="853" alt="Captura de tela 2026-07-01 094917" src="https://github.com/user-attachments/assets/585a1150-81f2-4575-b09b-e40e1ee61fe9" />
<img width="1895" height="857" alt="Captura de tela 2026-07-01 094727" src="https://github.com/user-attachments/assets/a79a0d89-dd64-4ffd-b375-a76f13423cf4" />
<img width="1895" height="860" alt="Captura de tela 2026-07-01 094706" src="https://github.com/user-attachments/assets/7f880453-4c63-4de3-b787-2f14f66af58c" />
<img width="1892" height="853" alt="Captura de tela 2026-07-01 094639" src="https://github.com/user-attachments/assets/93588696-4787-4055-88dc-d990a9fafaf8" />

* **Requisito Atendido:**
  * **RF-03:** O sistema deve permitir o lançamento manual de entradas e saídas de materiais. Caso uma saída solicitada (seja por Técnico ou Professor) supere o saldo disponível em estoque, o sistema deve bloquear a operação e exibir um alerta visual de "Saldo Insuficiente".
* **Instruções de Acesso:**
  1. Vá até o módulo de "Movimentação" ou "Saída de Material" (conforme o perfil).
  2. Selecione o item desejado.
  3. Insira a quantidade e realize o teste (tente inserir um valor acima do saldo para testar o bloqueio de segurança).
* **Responsável:** Ricardo, Pedro e João Gustavo.

---

## 📋 4. Solicitação de Compras de Insumos

* **Telas da Funcionalidade:**

<img width="1892" height="853" alt="Captura de tela 2026-07-01 094639" src="https://github.com/user-attachments/assets/dc850536-db5b-4749-b9dd-107d83de7d33" />
<img width="1896" height="863" alt="Captura de tela 2026-07-01 094626" src="https://github.com/user-attachments/assets/e3e78f56-4b40-4d96-b869-39ab33b87570" />

* **Requisito Atendido:**
  * **RF-04:** O sistema deve permitir que o Técnico registre uma solicitação de compra de novos materiais justificando a necessidade, e que essa requisição fique listada com o status "Pendente" aguardando aprovação.
* **Estrutura de Dados:**
  * Registro de requisição: `id_solicitacao`, `item`, `categoria`, `quantidade`, `observacao`, `status: "Pendente"`.
* **Instruções de Acesso:**
  1. Logue como **Técnico**.
  2. Acesse o módulo "Solicitar Compra" e preencha o formulário.
  3. Verifique o registro criado na tela "Minhas Solicitações".
* **Responsável:** Alice, João Gustavo, Pedro e Ricardo.
