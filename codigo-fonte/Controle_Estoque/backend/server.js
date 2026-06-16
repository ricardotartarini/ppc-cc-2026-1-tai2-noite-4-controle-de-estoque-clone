// Backend Node.js/Express para o sistema de controle de estoque.
// Ele recebe requisições do frontend, valida o JWT e usa Supabase como banco de dados.
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const ALLOWED_USER_TYPES = ['professor', 'tecnico'];

// Middleware global
// CORS permite que o frontend em outra porta acesse esta API.
// express.json() permite ler JSON do corpo da requisição.
app.use(cors());
app.use(express.json());

// Supabase Client
// O backend usa a chave de serviço para poder ler e escrever no banco em nome do sistema.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role for backend
const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware de autenticação JWT
// Verifica se o token existe e se é válido antes de liberar acesso às rotas protegidas.
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// Função auxiliar para gerar código de professor único
// Gera 8 números aleatórios (ex: 12345678)
const gerarCodigoProfessor = () => {
  let codigo = '';
  for (let i = 0; i < 8; i++) {
    codigo += Math.floor(Math.random() * 10);
  }
  return codigo;
};

// Função para validar se é email ou código de professor
// Código de professor: 8 dígitos numéricos (ex: 12345678)
const identificarEntrada = (entrada) => {
  if (entrada.includes('@')) {
    return { tipo: 'email', valor: entrada };
  }
  if (/^\d{8}$/.test(entrada)) {
    return { tipo: 'codigo_professor', valor: entrada };
  }
  return { tipo: 'email', valor: entrada }; // Padrão como email
};

const isTableMissingError = (error) => {
  const msg = (error?.message || '').toString().toLowerCase();
  return error?.code === 'PGRST205' || msg.includes('relation "usuarios" does not exist') || msg.includes('could not find the table');
};

// Routes

// Auth Routes: login e registro de usuário
app.post('/api/auth/login', async (req, res) => {
  try {
    const { entrada, password, userType } = req.body;

    if (!ALLOWED_USER_TYPES.includes(userType)) {
      return res.status(400).json({ error: 'Tipo de usuário inválido' });
    }

    if (!entrada || !password) {
      return res.status(400).json({ error: 'Email/Código e senha são obrigatórios' });
    }

    const entradaIdentificada = identificarEntrada(entrada);

    let usuarioData = null;
    let emailDoBanco = null;

    // Se for código de professor, buscar email correspondente
    if (entradaIdentificada.tipo === 'codigo_professor') {
      const { data: usuario, error: fetchError } = await supabase
        .from('usuarios')
        .select('email')
        .eq('codigo_professor', entradaIdentificada.valor)
        .eq('tipo_usuario', userType)
        .single();

      if (fetchError || !usuario) {
        return res.status(400).json({ error: 'Código de professor ou tipo de usuário inválido' });
      }

      emailDoBanco = usuario.email;
    } else {
      emailDoBanco = entrada;
    }

    // Fazer login com o email encontrado
    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailDoBanco,
      password
    });

    if (error || !data?.user) {
      return res.status(400).json({ error: 'Email/Código ou senha incorretos' });
    }

    const storedUserType = data.user.user_metadata?.user_type;
    if (!storedUserType || storedUserType !== userType) {
      return res.status(401).json({ error: 'Tipo de usuário incorreto para esta conta' });
    }

    // Buscar dados adicionais do usuário
    const { data: usuarioCompleto } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', data.user.id)
      .single();

    const token = jwt.sign(
      { id: data.user.id, email: data.user.email, userType: storedUserType, codigoProfessor: usuarioCompleto?.codigo_professor },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: data.user.id,
        email: data.user.email,
        fullName: data.user.user_metadata?.full_name || data.user.email,
        userType: storedUserType,
        codigoProfessor: usuarioCompleto?.codigo_professor || null
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, fullName, userType } = req.body;

    if (!email || !password || !fullName || !userType) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    if (!ALLOWED_USER_TYPES.includes(userType)) {
      return res.status(400).json({ error: 'Tipo de usuário inválido' });
    }

    const { data: createdUser, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        user_type: userType
      }
    });

    if (createError || !createdUser?.user) {
      return res.status(400).json({ error: createError?.message || 'Erro ao criar conta' });
    }

    // Gerar código de professor se for professor
    const codigoProfessor = userType === 'professor' ? gerarCodigoProfessor() : null;

    let insertError = null;
    let insertResult = null;
    try {
      const insertResponse = await supabase
        .from('usuarios')
        .insert({
          id: createdUser.user.id,
          email,
          nome_completo: fullName,
          tipo_usuario: userType,
          codigo_professor: codigoProfessor
        });

      insertError = insertResponse.error;
      insertResult = insertResponse.data;
    } catch (err) {
      insertError = err;
    }

    if (insertError) {
      // Se falhar ao inserir, deletar o usuário de auth
      await supabase.auth.admin.deleteUser(createdUser.user.id);
      console.error('Erro insert usuarios:', insertError);
      let errorMessage = insertError?.message || 'Erro ao finalizar registro do usuário';
      if (isTableMissingError(insertError)) {
        errorMessage = 'Tabela "usuarios" não encontrada no banco. Execute migrations_usuarios.sql no Supabase e tente novamente.';
      }
      return res.status(400).json({ error: errorMessage });
    }

    const token = jwt.sign(
      { id: createdUser.user.id, email: createdUser.user.email, userType, codigoProfessor },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: createdUser.user.id,
        email: createdUser.user.email,
        fullName,
        userType,
        codigoProfessor
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: error.message || 'Erro interno do servidor' });
  }
});

// Inventory Routes
app.get('/api/estoque', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('estoque')
      .select('*')
      .order('nome');

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/api/estoque/movimentar', authenticateToken, async (req, res) => {
  try {
    const { id, tipo, quantidadeMovimentada } = req.body;

    // Get current item
    const { data: item, error: fetchError } = await supabase
      .from('estoque')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    let newQuantidade = item.quantidade;

    if (tipo === 'entrada') {
      newQuantidade += Number(quantidadeMovimentada);
    } else if (tipo === 'saida') {
      if (item.quantidade < quantidadeMovimentada) {
        return res.status(400).json({ error: 'Estoque insuficiente' });
      }
      newQuantidade -= Number(quantidadeMovimentada);
    } else {
      return res.status(400).json({ error: 'Tipo de movimentação inválido' });
    }

    // Update quantity
    const { data, error } = await supabase
      .from('estoque')
      .update({ quantidade: newQuantidade })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Log movement
    await supabase
      .from('movimentacoes')
      .insert({
        produto_id: id,
        tipo,
        quantidade: quantidadeMovimentada,
        user_id: req.user.id,
        criado_em: new Date()
      });

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Purchase Requests Routes
app.get('/api/solicitacoes-compra', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('solicitacoes_compra')
      .select('*')
      .eq('user_id', req.user.id)
      .order('criado_em', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/api/solicitacoes-compra', authenticateToken, async (req, res) => {
  try {
    const { tecnicoNome, data, codigoTecnico, tipoProduto, quantidade, observacao } = req.body;

    const { data: result, error } = await supabase
      .from('solicitacoes_compra')
      .insert({
        user_id: req.user.id,
        professor_nome: tecnicoNome,
        data,
        codigo_professor: codigoTecnico,
        tipo_produto: tipoProduto,
        quantidade: Number(quantidade),
        observacao,
        status: 'Pendente',
        criado_em: new Date()
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Endpoint para listar todas as solicitações (visível apenas para professores)
app.get('/api/solicitacoes-compra/all', authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== 'professor') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const { data, error } = await supabase
      .from('solicitacoes_compra')
      .select('*')
      .order('criado_em', { ascending: false });

    if (error) return res.status(400).json({ error: error.message });

    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Laboratory Products Routes
// Retorna todos os produtos do laboratório organizados por categoria
app.get('/api/laboratorio-produtos', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('laboratorio_produtos')
      .select('id, codigo, nome, categoria')
      .order('categoria', { ascending: true })
      .order('codigo', { ascending: true });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Organizar produtos por categoria
    const produtosPorCategoria = {};
    data.forEach((produto) => {
      if (!produtosPorCategoria[produto.categoria]) {
        produtosPorCategoria[produto.categoria] = [];
      }
      produtosPorCategoria[produto.categoria].push({
        id: produto.id,
        codigo: produto.codigo,
        nome: produto.nome
      });
    });

    res.json({
      categorias: Object.keys(produtosPorCategoria),
      produtos: produtosPorCategoria
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Endpoint para obter dados do perfil do usuário (incluindo código de professor)
app.get('/api/auth/perfil', authenticateToken, async (req, res) => {
  try {
    const { data: usuario, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error || !usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({
      id: usuario.id,
      email: usuario.email,
      nome_completo: usuario.nome_completo,
      tipo_usuario: usuario.tipo_usuario,
      codigo_professor: usuario.codigo_professor,
      criado_em: usuario.criado_em
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar perfil' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});