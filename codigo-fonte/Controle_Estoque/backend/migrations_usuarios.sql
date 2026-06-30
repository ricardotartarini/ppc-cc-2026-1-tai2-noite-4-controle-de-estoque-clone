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

-- Política permissiva para leitura de todos os usuários
CREATE POLICY "Allow reading all users" ON usuarios
  FOR SELECT USING (true);

-- Política para atualizar o próprio perfil
CREATE POLICY "Users can update own profile" ON usuarios
  FOR UPDATE USING (auth.uid() = id);
