# Registro de Testes de Software

Este relatório consolida as evidências de execução dos testes funcionais planejados para o MVP do sistema **Med_Estoque**, comprovando a validação e o correto funcionamento das regras de negócio estabelecidas.

---

## 📊 Relatório de Resultados dos Testes Executados

### CT-01: Autenticação de Usuário por Perfil (Login)
* **Resultados Obtidos:** O sistema discriminou com sucesso os perfis de acesso. Ao efetuar o login com credenciais válidas, redirecionou o usuário de forma correspondente e dinâmica para as interfaces customizadas de Técnico ou de Professor.
* **Responsável pela Execução:** Alice, João Gustavo, Pedro e Ricardo.

#### 📸 Evidências do Teste:
* **Interface de Entrada unificada:**

<img width="1896" height="866" alt="Captura de tela 2026-07-01 094313" src="https://github.com/user-attachments/assets/2885b711-58d6-43ea-b067-79a2946625a2" />
<img width="1876" height="846" alt="Captura de tela 2026-07-01 102042" src="https://github.com/user-attachments/assets/329673ea-580a-4129-a412-3ef3d5617a89" />
<img width="1832" height="823" alt="Captura de tela 2026-07-01 102126" src="https://github.com/user-attachments/assets/c4597e5b-4ef1-4c24-a9c6-ff2311f6d3c9" />

---

### CT-02: Filtro Dinâmico na Listagem de Estoque
* **Resultados Obtidos:** A renderização das tabelas funcionou corretamente. Os cartões de métricas superiores computaram em tempo real a quantidade de itens críticos e zerados. Ao interagir com os botões de categorias, o sistema filtrou os registros instantaneamente na tela do Técnico.
* **Responsável pela Execução:** Alice, João Gustavo, Pedro e Ricardo.

#### 📸 Evidências do Teste:
* **Painel Geral e Categorias Ativas:**

<img width="1896" height="860" alt="Captura de tela 2026-07-01 094540" src="https://github.com/user-attachments/assets/2cd8215b-49be-4f37-86f3-3fde493006d6" />


---

### CT-03: Validação de Saldo Insuficiente na Movimentação
* **Resultados Obtidos:** A regra de consistência de estoque impediu que transações de saída ficassem com saldo negativo. O sistema disparou um modal/banner visual de erro vermelho na interface do usuário informando que a operação foi bloqueada devido ao saldo em estoque ser menor que o solicitado.
* **Responsável pela Execução:** Alice, João Gustavo, Pedro e Ricardo.

#### 📸 Evidências do Teste:
* **Bloqueio de Saída com Alerta Visual:**

<img width="1896" height="853" alt="Captura de tela 2026-07-01 094917" src="https://github.com/user-attachments/assets/566c5187-86dc-4b9b-865d-6965131ddf79" />

---

### CT-04: Registro de Solicitação de Compra de Materiais
* **Resultados Obtidos:** O formulário persistiu os dados inseridos corretamente. Ao submeter uma solicitação com campos de categoria e justificativa, o registro foi instantaneamente adicionado à lista de acompanhamento com o status estático definido em "Pendente".
* **Responsável pela Execução:** Alice, João Gustavo, Pedro e Ricardo.

#### 📸 Evidências do Teste:
* **Preenchimento do Formulário de Requisição:**

<img width="1895" height="860" alt="Captura de tela 2026-07-01 094706" src="https://github.com/user-attachments/assets/62eded97-e55c-426a-8c25-d2384a311c16" />
<img width="1895" height="857" alt="Captura de tela 2026-07-01 094727" src="https://github.com/user-attachments/assets/7330427a-8322-4349-879b-819a5474ea51" />


* **Persistência na listagem "Minhas Solicitações":**

<img width="1896" height="863" alt="Captura de tela 2026-07-01 094626" src="https://github.com/user-attachments/assets/83e6f137-0022-4178-a577-d55bdd343133" />

---

## 📈 Conclusão das Validações

Todos os testes funcionais críticos projetados para o escopo do MVP rodaram com **100% de sucesso**. A integridade dos saldos foi mantida, a interface em Modo Escuro apresentou excelente tempo de resposta visual e o fluxo de privilégios de usuários foi respeitado em todas as rotas operadas.
