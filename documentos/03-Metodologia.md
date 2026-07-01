# Metodologia

Esta seção descreve a organização da equipe para a execução das tarefas do projeto e as ferramentas utilizadas para a manutenção dos códigos e demais artefatos.

## Gerenciamento de Projeto

A metodologia ágil escolhida para o desenvolvimento deste projeto foi o SCRUM, pois como citam Amaral, Fleury e Isoni (2019, p. 68), seus benefícios são a:
> “visão clara dos resultados a entregar; ritmo e disciplina necessários à execução; definição de papéis e responsabilidades dos integrantes do projeto (Scrum Owner, Scrum Master e Team); empoderamento dos membros da equipe de projetos para atingir o desafio; conhecimento distribuído e compartilhado de forma colaborativa; ambiência favorável para crítica às ideias e não às pessoas.”

### Divisão de Papéis

A equipe utiliza o Scrum como base para definição do processo de desenvolvimento do nosso Sistema de Controle de Estoque. A divisão de papéis ficou configurada da seguinte forma:

* **Scrum Master:** Pedro — Responsável por garantir o fluxo de trabalho e remover impedimentos da equipe.
* **Product Owner:** João Gustavo — Responsável por alinhar os requisitos do sistema de estoque e priorizar as tarefas do Backlog.
* **Equipe de Desenvolvimento:** Alice, João Gustavo, Pedro, Ricardo, Danilo e João Victor — Responsáveis pela implementação das regras de negócio, banco de dados e rotas da aplicação.
* **Equipe de Design:** Alice, João Gustavo, Pedro e Ricardo — Responsáveis pelo design da interface (UI) e experiência do usuário (UX) com foco em usabilidade comercial.

---

## Processo

Para acompanhar o andamento do projeto, a execução das tarefas e o status de desenvolvimento da solução de controle de estoque, a equipe utilizou o **GitHub Projects**. Nosso quadro Kanban foi estruturado com as seguintes colunas:

* **Backlog:** Recebe as tarefas macro identificadas no início do projeto (ex: estruturar banco de dados, criar rotas de entrada/saída).
* **To Do (A Fazer):** Representa a Sprint atual. Aqui ficam os cartões que a equipe se comprometeu a entregar na semana.
* **Doing (Em Andamento):** Quando um membro inicia uma tarefa (ex: codificar tela de login), o cartão é movido para cá.
* **Done (Concluído):** Tarefas revisadas, testadas e integradas ao código principal do MVP.

---

## Etiquetas

As tarefas (Issues) dentro do nosso gerenciador de projetos são etiquetadas para facilitar a identificação visual da natureza da atividade. O esquema de cores e categorias adotado é o seguinte:

* `bug`: Erro encontrado no código do sistema de estoque.
* `documentation`: Atualizações nos arquivos markdown de documentação.
* `enhancement`: Melhorias ou novas funcionalidades adicionadas ao MVP.
* `duplicate`: Tarefas ou problemas repetidos.

---

## Ferramentas

Os artefatos do projeto são desenvolvidos a partir de diversas plataformas. A relação dos ambientes utilizados pela equipe para o desenvolvimento do Controle de Estoque com seu respectivo propósito é apresentada na tabela abaixo:

| AMBIENTE | PLATAFORMA | LINK DE ACESSO |
| :--- | :--- | :--- |
| **Repositório de código fonte** | GitHub | https://github.com/ricardotartarini/ppc-cc-2026-1-tai2-noite-4-controle-de-estoque-clone |
| **Documentos do projeto** | GitHub Wiki / Docs | https://github.com/ricardotartarini/ppc-cc-2026-1-tai2-noite-4-controle-de-estoque-clone |
| **Hospedagem da Aplicação** | Vercel | https://ppc-cc-2026-1-tai2-noite-4-controle-de-estoque-clone-186lxqfna.vercel.app/login |

---

## Estratégia de Organização de Codificação

Todos os artefatos relacionados à implementação e visualização dos conteúdos do projeto do site foram inseridos na pasta principal do repositório, seguindo as boas práticas do GitHub GitFlow (com commits focados nas branches de desenvolvimento antes do merge final na branch `main` para a entrega do MVP).
