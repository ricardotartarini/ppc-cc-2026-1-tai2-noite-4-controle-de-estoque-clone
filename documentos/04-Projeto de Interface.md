# Projeto de Interface

Esta seção apresenta a modelagem da experiência do usuário e os conceitos visuais que guiaram o desenvolvimento da interface do Sistema de Controle de Estoque (**Med_Estoque**).

---

## User Flow

O Fluxo de Usuário (User Flow) mapeia o caminho que o Professor e o Técnico percorrem dentro da aplicação Med_Estoque para realizar suas respectivas tarefas, desde o controle de acesso até a movimentação e auditoria dos insumos de laboratório.

---

## Protótipo

O desenvolvimento das interfaces foi validado para atender de forma clara e ágil as necessidades de gerenciamento de laboratórios acadêmicos, garantindo usabilidade tanto para o corpo técnico quanto para os docentes.

### Protótipo de Alta Fidelidade / Telas do Sistema

Abaixo estão documentadas as telas reais da aplicação que compõem o MVP final do projeto:

#### 1. Tela de Autenticação (Login)
Uma interface centralizada onde o usuário escolhe o seu perfil de acesso (**Professor** ou **Técnico**) e insere suas credenciais de forma segura.

<img width="1896" height="866" alt="Captura de tela 2026-07-01 094313" src="https://github.com/user-attachments/assets/bec3360e-4ae3-4614-b61b-616e3ebddb42" />

---

### 👤 Fluxos e Telas do Perfil: Professor

#### 2. Dashboard / Painel Inicial (Professor)
Painel limpo focado nas atribuições do docente, dando acesso direto aos módulos de registro de saída de materiais para aulas práticas e aprovação de solicitações de compras de insumos.

<img width="1893" height="860" alt="Captura de tela 2026-07-01 094404" src="https://github.com/user-attachments/assets/617bee96-3e9c-4558-a7b5-87d89d1a90a7" />


#### 3. Saída de Material (Laboratório)
Interface para o professor registrar a retirada de itens. O sistema conta com uma regra de negócio que valida o estoque atual em tempo real e impede a operação emitindo um alerta visual caso o saldo seja insuficiente.

<img width="1896" height="853" alt="Captura de tela 2026-07-01 094917" src="https://github.com/user-attachments/assets/9f690a6e-dc8d-41c1-a60e-109842bb4eea" />
<img width="1892" height="855" alt="Captura de tela 2026-07-01 094945" src="https://github.com/user-attachments/assets/8936a00a-e401-4b0a-85ce-3b8404938098" />

---

### 🛠️ Fluxos e Telas do Perfil: Técnico

#### 4. Dashboard / Painel Inicial (Técnico)
Visão geral do sistema para o perfil técnico. Apresenta um banner central em destaque com alertas automáticos e críticos de estoque (ex: quantidade de produtos que estão acabando) e os blocos de gerenciamento operacional.

<img width="1892" height="857" alt="Captura de tela 2026-07-01 094509" src="https://github.com/user-attachments/assets/d919463c-7da8-42cb-a3c4-06af991d6cc5" />


#### 5. Gestão de Estoque (Listagem Geral)
Listagem completa do inventário do laboratório. Apresenta cartões de métricas rápidas (Total de itens, Críticos, Zerados), filtros dinâmicos por categorias de insumos (Esterilização, Equipamento, Vidraria, etc.) e botões para adicionar novos produtos ou realizar ajustes manuais.

<img width="1896" height="860" alt="Captura de tela 2026-07-01 094540" src="https://github.com/user-attachments/assets/afed2d7a-8142-4f75-be39-523dcb8fd96a" />


#### 6. Solicitação de Compra de Materiais
Formulário simples e direto utilizado pelo técnico para pedir a reposição de novos materiais ao setor responsável, permitindo definir a categoria, quantidade e justificativa/observações.

<img width="1892" height="853" alt="Captura de tela 2026-07-01 094639" src="https://github.com/user-attachments/assets/02162b75-206e-4e43-876c-9bee7f65db52" />


#### 7. Acompanhamento de Solicitações
Tabela onde o técnico consegue monitorar o andamento e o status (ex: Pendente) dos pedidos de novos insumos encaminhados.

<img width="1896" height="863" alt="Captura de tela 2026-07-01 094626" src="https://github.com/user-attachments/assets/c946df83-7a29-4e3c-8de3-b96f66fe1499" />

#### 8. Registro de Movimentação (Fluxo de Entrada e Saída)
Interface dedicada a registrar manualmente o fluxo de insumos no estoque central, permitindo selecionar o item e o tipo de operação (Entrada ou Saída).

* **Seleção do Tipo de Movimentação:**

<img width="1895" height="860" alt="Captura de tela 2026-07-01 094706" src="https://github.com/user-attachments/assets/2f2f2fd6-e4cd-45fa-9b66-622e2e46ca23" />

* **Confirmação e Sucesso da Operação:**
O sistema notifica o usuário visualmente assim que o saldo é atualizado com sucesso no banco de dados.

<img width="1895" height="857" alt="Captura de tela 2026-07-01 094727" src="https://github.com/user-attachments/assets/d4e47fdf-c722-49be-97c9-9bbdf226a070" />

#### 9. Auditoria de Estoque e Relatórios
Histórico completo e cronológico de todas as entradas e saídas de mercadorias registradas no laboratório, contendo a data exata da operação, o código do produto e a quantidade movimentada. Conta também com a funcionalidade de exportação de dados para relatórios em formato CSV.

<img width="1895" height="858" alt="Captura de tela 2026-07-01 094744" src="https://github.com/user-attachments/assets/5e1471e3-a66d-40fa-8852-ae9c0d6530f6" />
