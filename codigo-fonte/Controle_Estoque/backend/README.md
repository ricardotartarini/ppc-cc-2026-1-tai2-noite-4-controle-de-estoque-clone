# Backend para Controle de Estoque Médico

Este é o backend da aplicação de controle de estoque médico, construído com Node.js, Express e Supabase.

## Configuração

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Configure as variáveis de ambiente no arquivo `.env`:
   - `SUPABASE_URL`: URL do seu projeto Supabase
   - `SUPABASE_ANON_KEY`: Chave anônima do Supabase
   - `SUPABASE_SERVICE_ROLE_KEY`: Chave de serviço do Supabase (para operações administrativas)
   - `JWT_SECRET`: Segredo para geração de tokens JWT
   - `PORT`: Porta do servidor (padrão: 5000)

3. Configure as tabelas no Supabase:

### Tabela `estoque`
```sql
CREATE TABLE estoque (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  nome VARCHAR(255) NOT NULL,
  quantidade INTEGER NOT NULL DEFAULT 0,
  categoria VARCHAR(100),
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW()
);
```

### Tabela `usuarios`
Para que o registro de usuários funcione corretamente, execute o arquivo `migrations_usuarios.sql` no Supabase.

```sql
-- Criar tabela de usuários com código de professor único
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  nome_completo VARCHAR(255) NOT NULL,
  tipo_usuario VARCHAR(50) NOT NULL CHECK (tipo_usuario IN ('professor', 'tecnico')),
  codigo_professor VARCHAR(20) UNIQUE,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar índices para melhor desempenho
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_codigo_professor ON usuarios(codigo_professor);
CREATE INDEX IF NOT EXISTS idx_usuarios_tipo ON usuarios(tipo_usuario);

-- Habilitar Row Level Security
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Política para leitura do próprio perfil
CREATE POLICY "Users can read own profile" ON usuarios
  FOR SELECT USING (auth.uid() = id);

-- Política para atualizar o próprio perfil
CREATE POLICY "Users can update own profile" ON usuarios
  FOR UPDATE USING (auth.uid() = id);
```

### Tabela `movimentacoes`
```sql
CREATE TABLE movimentacoes (
  id SERIAL PRIMARY KEY,
  produto_id INTEGER REFERENCES estoque(id),
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('entrada', 'saida')),
  quantidade INTEGER NOT NULL,
  user_id UUID NOT NULL,
  criado_em TIMESTAMP DEFAULT NOW()
);
```

### Tabela `solicitacoes_compra`
```sql
CREATE TABLE solicitacoes_compra (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  professor_nome VARCHAR(255) NOT NULL,
  data DATE NOT NULL,
  codigo_professor VARCHAR(50) NOT NULL,
  tipo_produto VARCHAR(255) NOT NULL,
  quantidade INTEGER NOT NULL,
  observacao TEXT,
  criado_em TIMESTAMP DEFAULT NOW()
);
```

## Executando o Servidor

Para desenvolvimento:
```bash
npm run dev
```

Para produção:
```bash
npm start
```

O servidor será executado na porta definida em `PORT` (padrão: 5000).

## API Endpoints

### Autenticação
- `POST /api/auth/login` - Login de usuário
- `POST /api/auth/register` - Registro de novo usuário

### Estoque
- `GET /api/estoque` - Listar todos os itens do estoque
- `POST /api/estoque/movimentar` - Movimentar estoque (entrada/saída)

### Solicitações de Compra
- `GET /api/solicitacoes-compra` - Listar solicitações do usuário
- `POST /api/solicitacoes-compra` - Criar nova solicitação

Todos os endpoints (exceto login/register) requerem autenticação via JWT token no header `Authorization: Bearer <token>`.