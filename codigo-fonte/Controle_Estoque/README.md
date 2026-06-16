# Controle de Estoque Médico & Acadêmico

Este projeto é um sistema completo de gestão de estoque focado na área da saúde, com frontend React.js e backend Node.js/Express integrado ao Supabase.

## Estrutura
- `/frontend-web`: Aplicação React.js (interface do usuário).
- `/backend`: API REST Node.js/Express (servidor backend).
- `frontend-web/src/services/`: Serviços para comunicação com a API.

## Pré-requisitos
- Node.js (versão 16 ou superior)
- Conta no Supabase (para banco de dados)

## Configuração Inicial

### 1. Backend
1. Entre na pasta `backend`:
   ```bash
   cd backend
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure o arquivo `.env` com suas credenciais do Supabase:
   ```env
   SUPABASE_URL=https://seu-projeto.supabase.co
   SUPABASE_ANON_KEY=sua-chave-anonima
   SUPABASE_SERVICE_ROLE_KEY=sua-chave-de-servico
   JWT_SECRET=seu-segredo-jwt-seguro
   PORT=5000
   ```

4. Crie as tabelas no Supabase (veja `backend/README.md` para os scripts SQL).

### 2. Frontend
1. Entre na pasta `frontend-web`:
   ```bash
   cd frontend-web
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure o arquivo `.env.local`:
   ```env
   REACT_APP_API_URL=http://localhost:5000
   ```

## Como Executar

### Desenvolvimento (Frontend + Backend simultaneamente)
Na raiz do projeto:
```bash
npm run dev
```

### Apenas Frontend
```bash
npm start
```

### Apenas Backend
```bash
npm run server:dev
```

## Funcionalidades
- **Autenticação**: Login e registro de usuários (professores/técnicos)
- **Controle de Estoque**: Visualização, entradas e saídas de materiais
- **Solicitações de Compra**: Professores podem solicitar compras de materiais
- **Interface Responsiva**: Design moderno e intuitivo

## Segurança
- Autenticação JWT
- Validação de dados
- Controle de acesso baseado em roles
- Comunicação segura entre frontend e backend

## Requisitos Atendidos
- RF-01 a RF-07 (Cadastro, Entradas, Saídas, Visualização)
- RNF-01 a RNF-05 (Interface intuitiva, dados claros)
- Segurança aprimorada com backend dedicado
