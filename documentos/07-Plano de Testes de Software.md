# Plano de Testes de Software

Este documento apresenta os cenários e casos de teste funcionais planejados para validar as regras de negócio e a estabilidade do MVP do sistema **Med_Estoque**.

---

## 🧪 Casos de Teste Funcionais

### CT-01: Autenticação de Usuário por Perfil (Login)
* **Requisitos Associados:** RF-01
* **Objetivo do Teste:** Garantir que o sistema valide corretamente as credenciais do usuário e o redirecione para o Dashboard correto baseado no perfil escolhido (Professor ou Técnico).
* **Passos para Execução:**
  1. Acessar a página inicial do Med_Estoque.
  2. Selecionar o perfil "Técnico", preencher as credenciais válidas e clicar em "Fazer Login".
  3. Repetir o processo deslogando e selecionando o perfil "Professor".
  4. Tentar logar com dados inválidos/vazios para testar o bloqueio.
* **Critérios de Êxito:** O Técnico deve ser direcionado para o painel operacional de estoque. O Professor deve ir para o painel de retiradas de aulas. Credenciais inválidas devem retornar uma mensagem de erro e travar o acesso.
* **Responsável pela Elaboração:** Alice, João Gustavo, Ricardo e Pedro.

---

### CT-02: Filtro Dinâmico na Listagem de Estoque
* **Requisitos Associados:** RF-02
* **Objetivo do Teste:** Validar se a tabela de inventário responde corretamente aos filtros por categorias de insumos e exibe as métricas de produtos críticos.
* **Passos para Execução:**
  1. Fazer login como Técnico e acessar a página de "Gestão de Estoque".
  2. Verificar se os cartões superiores exibem o totalizador correto de itens.
  3. Clicar nas tags de filtro (ex: "Esterilização", "Vidraria").
* **Critérios de Êxito:** A tabela deve ocultar imediatamente os insumos que não pertencem à categoria selecionada, facilitando a busca pelo usuário.
* **Responsável pela Elaboração:** Alice, João Gustavo, Ricardo e Pedro.

---

### CT-03: Validação de Saldo Insuficiente na Movimentação
* **Requisitos Associados:** RF-03
* **Objetivo do Teste:** Impedir que o sistema processe saídas de materiais que superem o estoque real disponível, evitando saldos negativos no banco de dados.
* **Passos para Execução:**
  1. Acessar o módulo de Movimentação (Técnico) ou Saída de Material (Professor).
  2. Selecionar um produto qualquer (ex: "Álcool Isopropílico", saldo atual: 15).
  3. Tentar registrar uma saída com uma quantidade superior (ex: 20) e salvar.
* **Critérios de Êxito:** O sistema deve bloquear a gravação da movimentação, manter o saldo original intacto e exibir um aviso em vermelho na tela alertando "Saldo Insuficiente".
* **Responsável pela Elaboração:** Alice, João Gustavo, Ricardo e Pedro.

---

### CT-04: Registro de Solicitação de Compra de Materiais
* **Requisitos Associados:** RF-04
* **Objetivo do Teste:** Confirmar se o fluxo de envio e registro de novas requisições de insumos funciona corretamente.
* **Passos para Execução:**
  1. Logar como Técnico e acessar a tela "Solicitar Compra".
  2. Preencher todos os campos do formulário (Nome do item, quantidade, justificativa) e submeter.
  3. Ir até a tela "Minhas Solicitações" para verificar a persistência do dado.
* **Critérios de Êxito:** O formulário enviado deve gerar uma nova linha na tabela de acompanhamento do técnico, contendo os dados inseridos e o status inicial fixado em "Pendente".
* **Responsável pela Elaboração:** Alice, João Gustavo, Ricardo e Pedro.
