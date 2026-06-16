# Instruções de Implementação - Sistema de Código de Professor

## 📋 Resumo das Mudanças

Este sistema implementa a geração automática de códigos únicos para professores ao criarem contas, permitindo login com email OU código de professor.

## 🔧 Passos de Implementação

### 1. **Instalar dependências do backend**

Execute no diretório `backend/`:
```bash
npm install
```

Isso instalará o pacote `uuid` necessário para gerar códigos únicos.

### 2. **Criar tabela de usuários no Supabase**

1. Acesse o [Console do Supabase](https://app.supabase.com/)
2. Vá para **SQL Editor** → **New Query**
3. Copie e execute o conteúdo do arquivo `migrations_usuarios.sql`:

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

### 3. **Reiniciar o backend**

Se o backend estava rodando, pare-o e reinicie:
```bash
npm start
```

## 🎯 Como Funciona

### **Criação de Conta**
1. Um professor cria uma conta
2. O sistema gera automaticamente um código único (formato: `PROF-A2B3C4D5`)
3. O código é exibido no alert após o registro
4. O código é armazenado na tabela `usuarios`

### **Login**
O professor pode fazer login de duas formas:
- **Com email**: `professor@instituicao.com` + senha
- **Com código**: `PROF-A2B3C4D5` + senha

O sistema detecta automaticamente se é email ou código.

### **Recuperação de Senha**
Se o professor esquecer a senha:
1. Na tela de "Esqueceu a senha?", digita apenas o **email**
2. Recebe um link de recuperação de senha normalmente

## 📝 Mudanças no Código

### Backend (`server.js`)
- ✅ Importação de `uuid` para gerar códigos
- ✅ Função `gerarCodigoProfessor()` - cria código único
- ✅ Função `identificarEntrada()` - detecta email ou código
- ✅ Modificado `/api/auth/login` - aceita email ou código
- ✅ Modificado `/api/auth/register` - gera código para professor
- ✅ Novo endpoint `/api/auth/perfil` - retorna dados do usuário (inclui código)

### Frontend (`auth.js`)
- ✅ Função `login()` alterada para aceitar "entrada" (email ou código)

### Frontend (`Login.jsx`)
- ✅ Campo de email agora aceita tanto email quanto código
- ✅ Placeholder atualizado: "seu.email@instituicao.com ou PROF-XXXXX"
- ✅ Label dinâmico que indica "E-mail ou Código de Professor" no login
- ✅ Alert exibe o código após criar conta de professor
- ✅ Mensagens de erro ajustadas

## 🧪 Testando

### Teste 1: Criar conta de professor
1. Clique em "Criar Conta"
2. Selecione "Professor"
3. Preencha os dados
4. Após sucesso, você verá o código no alert (ex: `PROF-A2B3C4D5`)
5. Copie e salve este código

### Teste 2: Login com email
1. Na tela de login, escolha "Professor"
2. Digite seu email
3. Digite sua senha
4. Clique em "Fazer Login"
✓ Deve funcionar normalmente

### Teste 3: Login com código
1. Na tela de login, escolha "Professor"
2. Digite seu código (ex: `PROF-A2B3C4D5`)
3. Digite sua senha
4. Clique em "Fazer Login"
✓ Deve fazer login com sucesso

### Teste 4: Recuperação de senha
1. Clique em "Esqueceu a senha?"
2. Digite apenas seu email (não o código)
3. Clique em "Enviar Link"
✓ Deve receber email de recuperação

## 📊 Estrutura do Código de Professor

Formato: `PROF-XXXXXXXX`
- Prefixo: `PROF`
- Seguido de 8 caracteres hexadecimais aleatórios (em maiúsculas)
- Totalmente único no sistema
- Nunca muda (permanente)
- Salvo na tabela `usuarios`

## 🔒 Segurança

- Códigos são únicos e imutáveis
- Senhas não são armazenadas em texto plano (bcrypt)
- Row Level Security (RLS) ativado na tabela `usuarios`
- Recuperação de senha funciona apenas pelo email registrado
- JWT tokens incluem o código do professor (se aplicável)

## 📱 Exemplo de Uso

**Cenário 1 - Professor novo**
```
1. Acessa a aplicação
2. Clica em "Criar Conta"
3. Seleciona "Professor"
4. Preenche: Nome, Email, Senha
5. Sistema gera: PROF-A2B3C4D5
6. Alert mostra o código
7. Professor salva o código em local seguro
```

**Cenário 2 - Professor retornando**
```
Opção A (email):
- Digite: seu.email@instituicao.com
- Digite: sua_senha
- Login bem-sucedido ✓

Opção B (código):
- Digite: PROF-A2B3C4D5
- Digite: sua_senha
- Login bem-sucedido ✓
```

**Cenário 3 - Recuperar senha**
```
1. Clica em "Esqueceu a senha?"
2. Digite seu email
3. Recebe email com link
4. Reseta a senha
5. Pode fazer login com email ou código
```

## 🆘 Troubleshooting

**Problema**: "Erro ao criar conta" após inserir dados
- **Solução**: Verifique se a tabela `usuarios` foi criada no Supabase

**Problema**: "Código de professor inválido" ao tentar login
- **Solução**: Certifique-se de que o código está no formato correto (PROF-XXXXX)

**Problema**: Backend não inicia
- **Solução**: Execute `npm install` para instalar todas as dependências

**Problema**: Email duplicado ao tentar registrar
- **Solução**: O email já foi registrado. Use outro email ou faça login se já tem conta
