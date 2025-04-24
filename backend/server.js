const express = require('express'); // Importa o framework Express para criar o servidor
const path = require('path'); // Importa o módulo path para manipulação de caminhos de arquivos
const app = express(); // Cria uma instância do Express
const port = 3000; // Define a porta em que o servidor irá escutar
const db = require('./db.js'); // Importa o módulo de banco de dados (db.js) para interagir com o banco de dados
const cors = require('cors'); // Importa o módulo CORS para permitir requisições de diferentes origens
const multer = require('multer'); // Importa o módulo Multer para manipulação de uploads de arquivos
const bodyParser = require('body-parser'); // Importa o módulo body-parser para analisar o corpo das requisições

//const fileURLToPath = require('url'); // Não estou usando

// Log para verificar a importação do db
console.log('Tentando importar db...');
console.log('db importado com sucesso:', db ? 'Sim' : 'Não');

// Configura o middleware CORS para permitir requisições do frontend (localhost:5173)
app.use(cors({
  origin: 'http://localhost:5173', // URL do frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos HTTP permitidos
  allowedHeaders: ['Content-Type'], // Permite o cabeçalho necessário para multipart/form-data
}));

// Configura o Express para servir arquivos estáticos da pasta 'uploads'
app.use('/uploads', express.static('uploads'));
// Servir ficheiros estáticos (como o HTML)
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json()); // Configura o Express para processar JSON no corpo das requisições


// Configuração do multer para gerenciar upload arquivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Pasta onde as fotos serão salvas
  },
  filename: (req, file, cb) => {
    // Gera um nome único com timestamp + nome original
    cb(null, Date.now() + '-' + file.originalname); // Nome único para o arquivo
  },
});

// Instancia o multer com configurações de armazenamento e limite de tamanho
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB em bytes
});

// Importa bcrypt para comparação de senhas criptografadas
const bcrypt = require('bcrypt'); // Importando bcrypt para hash de senhas


// Rota GET de teste que retorna uma mensagem JSON
app.get('/api/mensagem', (req, res) => {
  res.json({ mensagem: 'Olá, esta é a resposta da rota!' });
});

// Rota para consultar todas as cidades
// Esta rota não está sendo utilizada no frontend, mas pode ser útil para testes ou futuras implementações
app.get('/api/consultacidade', async (req, res) => {
  try {
    const resultado = await db.consultaCidade();
    res.json(resultado);
  } catch (error) {
    console.error('Erro ao consultar cidades:', error);
    res.status(500).json({ error: 'Erro ao consultar cidades' });
  }// acho q nao to usando essa funcao
});

// Rota para consultar cidades por UF
app.post('/api/consultacidadeporUF', async (req, res) => {
 // console.log("Corpo recebido:", req.body); // Debug
  
  const { ufSelecionado } = req.body; // ← Corrigido para req.body
  
  // Valida se o UF foi fornecido
  if (!ufSelecionado) {
    return res.status(400).json({ error: "UF não fornecida" });
  }

  try {
    // Chama a função do db.js para buscar cidades por UF
    const resultado = await db.consultaCidadeporUF(ufSelecionado);
    //console.log("Resultado do banco:", resultado); // Debug
    
    // Garante que o resultado seja um array
    res.json(Array.isArray(resultado) ? resultado : []);

  } catch (error) {
    // Loga o erro e retorna status 500 com mensagem
    console.error("Erro na consulta:", error);
    res.status(500).json({ error: "Erro no servidor" });
  }
});

/*app.post('/api/login', async (req, res) => {
  try {
    // Extrai email e senha do corpo da requisição
    const { email, senha } = req.body;
    console.log("Tentativa de login:", email);

    // Busca o usuário por email
    const usuario = await db.buscarUsuarioPorEmail(email);
    if (!usuario) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Verifica se o hash da senha é válido
    /*Pega a senha em texto puro fornecida (senha, ex.: "minhaSenha123").
    Usa o mesmo salt que está embutido no hash armazenado (usuario.senha). 
    Gera um novo hash a partir da senha fornecida e compara com o hash armazenado.
    Retorna true se os hashes coincidirem (senha correta) ou false se não (senha incorreta).
    if (!usuario.senha?.startsWith('$2')) {
      console.error("Hash inválido para:", email);
      return res.status(500).json({ error: 'Erro na configuração do servidor' });
    }

    // Compara a senha fornecida com a senha criptografada
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    
    if (!senhaValida) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // RETORNA ID e nome do usuário em caso de sucesso
    res.json({ usuario_id: usuario.id, nome: usuario.nome_completo }); // Nome do usuário para identificar na interface o usuário logado
    console.log("Login bem-sucedido:", email);

  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});*/

// Rota para login, conferindo se o usuário é admin ou usuário comum
app.post('/api/login', async (req, res) => {
  try {
    // Extrai email e senha do corpo da requisição
    const { email, senha } = req.body;
    console.log('Tentativa de login:', email);

    // Busca usuário por email
    const usuario = await db.buscarUsuarioPorEmail(email);
    if (usuario) {
      // Verifica o hash da senha
      if (!usuario.senha?.startsWith('$2')) {
        console.error('Hash inválido para usuário:', email);
        return res.status(500).json({ error: 'Erro na configuração do servidor' });
      }
      const senhaValida = await bcrypt.compare(senha, usuario.senha);
      if (senhaValida) {
        console.log('Login bem-sucedido (usuário):', email);
        return res.json({ usuario_id: usuario.id, nome: usuario.nome_completo, tipo: 'usuario' });
      }
    }

    // Busca admin por email
    const adm = await db.buscarAdminPorEmail(email);
    if (adm) {
      // Verifica o hash da senha
      if (!adm.senha?.startsWith('$2')) {
        console.error('Hash inválido para admin:', email);
        return res.status(500).json({ error: 'Erro na configuração do servidor' });
      }
      const senhaValida = await bcrypt.compare(senha, adm.senha);
      if (senhaValida) {
        console.log('Login bem-sucedido (admin):', email);
        return res.json({ id: adm.id, nome: adm.nome_completo, tipo: 'adm'
        });
      }
    }

    // Se não encontrou usuário ou admin, ou a senha está inválida
    return res.status(401).json({ error: 'Credenciais inválidas' });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

// Rota para cadastrar um novo usuário
app.post('/api/cadastrousuario', async (req, res) => {
  console.log("Chegou no cadastro usuário");
  // Extrai dados do corpo da requisição
  const { nome_completo, email, genero, data_nascimento, uf, id_cidade, senha } = req.body;

  try {
    // Chama a função do db.js para cadastrar usuário
    const usuario_id = await db.cadastrarUsuario(nome_completo, email, genero, data_nascimento, uf, id_cidade, senha);
    // Retorna mensagem de sucesso e ID do usuário
    res.status(200).json({ message: 'Usuário cadastrado com sucesso!', usuario_id });
  } catch (error) {
    console.error('Erro no servidor:', error);
    // Trata erro de email duplicado
    if (error.message === 'Este email já está cadastrado.') {
      return res.status(400).json({ error: error.message });
    }
    // Retorna status 500 para outros erros
    res.status(500).send('Erro ao cadastrar usuário');
  }
});

// Rota para consultar os usuários por ID
app.get('/api/consultausuario', async (req, res) => {
  try {
    // Extrai ID do usuário dos parâmetros de query
      const usuario_id = req.query.id;
      if (!usuario_id) {
          return res.status(400).json({ error: 'ID do usuário não fornecido' });
      }

      // Chama a função do db.js para buscar usuário
      const usuario = await db.consultaUsuarioPorId(usuario_id);
      if (!usuario) {
          return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      console.log('Dados retornados por /api/consultausuario:', usuario); // Log para verificar os dados retornados

      // Retorna os dados do usuário
      res.status(200).json(usuario);
  } catch (error) {
      console.error('Erro ao consultar usuário:', error);
      res.status(500).json({ error: 'Erro ao buscar usuário' });
  }
});

// Rota para alterar os dados do usuário
app.post('/api/alterarusuario', async (req, res) => {
  // Extrai dados do corpo da requisição
  const { usuario_id, nome_completo, email, genero, data_nascimento, uf, id_cidade, senha } = req.body;

  try {
    // Chama a função do db.js para atualizar usuário
    const { nomeNormalizado } = await db.alterarUsuario(usuario_id, nome_completo, email, genero, data_nascimento, uf, id_cidade, senha);
    // Log para verificar o nome normalizado
    console.log('Nome normalizado retornado por alterarUsuario:', nomeNormalizado);

    res.json({
      message: 'Usuário atualizado com sucesso!',
      usuario: {
        id: usuario_id,
        nome_completo: nomeNormalizado,
        email,
        genero,
        data_nascimento,
        uf,
        id_cidade,
      },
    });
  } catch (error) {
    // Loga o erro e retorna status 500
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
});

// Rota para editar os dados do usuário
  app.post('/api/editarusuario', async (req, res) =>  {  
    const {id} = req.body;

    let resultado = await db.consultaUsuarioPorId(id); 
    //console.log(resultado);
    res.send(resultado);
  }
  );                       

// Rota para cadastrar um novo pet com upload de foto
app.post('/api/cadastropet', upload.single('fotoPet'), async (req, res) => {
  console.log('Arquivo recebido:', req.file);
  console.log('Corpo da requisição:', req.body);

  try {
    // Extrai os dados do formulário
    const { nome, sexo, data_nascimento, porte, raca } = req.body;
    const usuario_id = req.body.usuario_id;
    // Define o caminho da foto, se enviada
    const foto = req.file ? `/uploads/${req.file.filename}` : null;

    // Validação campos obrigatórios
    if (!nome || !sexo || !data_nascimento || !porte) {
      return res.status(400).json({ error: 'Dados incompletos' });
    }

    // Chama a função do banco de dados
    const petId = await db.cadastrarPet(usuario_id, foto, nome, sexo, data_nascimento, porte, raca || null);
    console.log('Pet ID retornado pelo banco:', petId); // Log para verificar o ID

    // Retorna o petId e o caminho da foto
    res.status(200).json({
      success: true,
      message: 'Pet cadastrado com sucesso!',
      petId,
      foto // Adiciona o caminho da foto aqui
    });

  } catch (error) {
    console.error('Erro no cadastro:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao cadastrar pet',
      details: error.message
    });
  }
});

// Rota para consultar os pets por ID do dono
app.post('/api/consultapetpordono', async (req, res) =>  {
  // Extrai ID do usuário do corpo da requisição
  const {usuarioSelecionado} = req.body;
  let resultado = await db.consultaPetPorDono(usuarioSelecionado);
  //console.log(resultado);
  res.send(resultado);
});

// Rota para buscar pets do usuário
app.get('/api/consultapets', async (req, res) => {
  try {
    // Extrai ID do usuário dos parâmetros de query
      const usuario_id = req.query.usuario_id;
      if (!usuario_id) {
          return res.status(400).json({ error: 'ID do usuário não fornecido' });
      }

      // Chama a função do db.js para buscar pets
      const pets = await db.consultaPetsPorUsuario(usuario_id);
      res.status(200).json(pets);
      
  } catch (error) {
      console.error('Erro ao consultar pets:', error);
      res.status(500).json({ error: 'Erro ao buscar pets' });
  }
});

// Rota para alterar os dados do pet
app.post('/api/alterarpet', upload.single('fotoPet'), async (req, res) => {
  // Extrai dados do corpo da requisição
  const { pet_id, nome, sexo, data_nascimento, porte, raca, fotoAtual } = req.body;
  // Usa nova foto, se enviada, ou mantém a foto atual
  const foto = req.file ? `/uploads/${req.file.filename}` : fotoAtual; // Caminho relativo da nova foto

  try {
    // Chama a função do db.js para atualizar pet
    await db.alterarPet(pet_id, nome, sexo, data_nascimento, porte, raca, foto);
    // Retorna mensagem de sucesso e dados do pet atualizado
    res.json({
      message: 'Pet atualizado com sucesso!',
      pet: {
        id: pet_id,
        nome,
        sexo,
        data_nascimento,
        porte,
        raca,
        foto, // Retorna o caminho real da foto
      },
    });
  } catch (error) {
    console.error('Erro na rota /api/alterarpet:', error);
    res.status(500).json({ error: 'Erro ao atualizar pet' });
  }
});

// Rota para deletar pet
app.delete('/api/deletarpet', async (req, res) => {
  // Extrai ID do pet dos parâmetros de query
  const { pet_id } = req.query;
  console.log('Recebida requisição para excluir pet ID:', pet_id);

  // Valida se o ID foi fornecido
  if (!pet_id) {
    return res.status(400).json({ error: 'ID do pet é obrigatório' });
  }

  try {
    // Chama a função do db.js para excluir pet
    await db.deletarPet(pet_id);
    res.status(200).json({ message: 'Pet excluído com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rota para criar um novo evento
app.post('/api/criarevento', upload.single("fotoPet"), async (req, res) => {
  // Extrai dados do corpo da requisição
  const { id_usuario, nome_evento, inicio, fim, uf, id_cidade, bairro,  rua, numero, descricao, porte, sexo, complemento, raca, } = req.body;
  // Define o caminho da foto, se enviada
  const foto = req.file ? `/uploads/${req.file.filename}` : null;

  // Valida se id_usuario foi fornecido
  if (!id_usuario) {
    return res.status(400).json({ error: "id_usuario é obrigatório" });
  }

  // Validação de data de início (não pode ser no passado)
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const dataInicio = new Date(inicio);
  if (dataInicio < hoje) {
    return res.status(400).json({ error: "A data de início não pode ser anterior ao dia atual." });
  }

  // Valida data de fim (não pode ser antes do início)
  const dataFim = new Date(fim);
  if (dataFim < dataInicio) {
    return res.status(400).json({ error: "A data de fim não pode ser anterior à data de início." });
  }

  try {
    // Chama a função do db.js para criar evento
    await db.criarEvento( id_usuario, foto, nome_evento, inicio, fim, uf, id_cidade, bairro, rua, numero, descricao, porte, sexo, complemento,  raca );
    // Retorna mensagem de sucesso
    res.json({ message: `Evento "${nome_evento}" criado com sucesso!` });
  } catch (error) {
    console.error("Erro ao criar evento:", error);
    res.status(500).json({ error: "Erro ao criar evento" });
  }
});

// Rota para consultar eventos
app.post('/api/consultareventos', async (req, res) => {
  // Extrai filtros do corpo da requisição
  const filtro = req.body;
  try {
    // Chama a função do db.js para buscar eventos
    const eventos = await db.consultarEventos(filtro);
    console.log("Requisição para consultar eventos com filtros:", filtro);
    // Retorna a lista de eventos
    res.json(eventos);
  } catch (error) {
    // Loga o erro e retorna status 500
    console.error("Erro ao consultar eventos:", error);
    res.status(500).json({ error: "Erro ao consultar eventos" });
  }
});

// Rota para consultar eventos criados por um usuário
app.post('/api/consultareventoscriados', async (req, res) => {
  // Extrai ID do usuário do corpo da requisição
  const { id_usuario } = req.body;
  if (!id_usuario) { // Valida se o ID foi fornecido
      return res.status(400).json({ error: 'id_usuario é obrigatório' });
  }
  try {
    // Chama a função do db.js para buscar eventos criados
      const eventos = await db.consultarEventosCriados(id_usuario);
      // Retorna a lista de eventos
      res.json(eventos);
  } catch (error) {
    // Loga o erro e retorna status 500
      console.error('Erro ao buscar eventos criados:', error);
      res.status(500).json({ error: 'Erro ao buscar eventos criados' });
  }
});

// Rota para inscrever um usuário em um evento
app.post("/api/inscrever", async (req, res) => {
  console.log("Corpo da requisição:", req.body);

  try {
    // Extrai os dados do formulário
    const { usuario_id, evento_id } = req.body;

    // Validação campos obrigatórios
    if (!usuario_id || !evento_id) {
      return res.status(400).json({ error: "Usuário e evento são obrigatórios." });
    }

    // Chama a função do db.js para inscrever usuário
    const inscricaoId = await db.inscreverUsuario(usuario_id, evento_id);
    console.log("Inscrição ID retornado pelo banco:", inscricaoId);

    // Retorna mensagem de sucesso e ID da inscrição
    res.status(200).json({
      success: true,
      message: "Inscrição realizada com sucesso!",
      inscricaoId,
    });
  } catch (error) {
    console.error("Erro no inscrição:", error);
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "Você já está inscrito neste evento." });
    }
    // Trata erro de inscrição duplicada
    if (error.code === "ER_NO_REFERENCED_ROW_2") {
      return res.status(400).json({ error: "Evento ou usuário inválido." });
    }
    res.status(500).json({
      success: false,
      error: "Erro ao realizar inscrição",
      details: error.message,
    });
  }
});

// Rota para buscar eventos inscritos por um usuário
app.post("/api/eventosInscritos", async (req, res) => {
  console.log("Corpo da requisição:", req.body);

  try {
    // Extrai os dados do formulário
    const { usuario_id, filtro } = req.body;

    // Validação campos obrigatórios
    if (!usuario_id) {
      return res.status(400).json({ error: "Usuário é obrigatório." });
    }
    if (!["em_breve", "ja_aconteceu"].includes(filtro)) {
      return res.status(400).json({ error: "Filtro inválido." });
    }

    // Chama a função do db.js para buscar eventos inscritos
    const eventos = await db.consultarEventosInscritos(usuario_id, filtro);
    console.log("Eventos retornados pelo banco:", eventos.length);

    // Retorna a lista de eventos
    res.status(200).json(eventos);
  } catch (error) {
    console.error("Erro ao buscar eventos inscritos:", error);
    res.status(500).json({
      success: false,
      error: "Erro ao carregar eventos inscritos",
      details: error.message,
    });
  }
});

// Rota para desinscrever um usuário de um evento
app.post("/api/desinscrever", async (req, res) => {
  console.log("Corpo da requisição:", req.body);

  try {
    // Extrai dados do corpo da requisição
    const { usuario_id, evento_id } = req.body;

    // Valida campos obrigatórios
    if (!usuario_id || !evento_id) {
      return res.status(400).json({ error: "Usuário e evento são obrigatórios." });
    }

    // Chama a função do db.js para remover inscrição
    const result = await db.removerInscricao(usuario_id, evento_id);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Inscrição não encontrada." });
    }

    // Retorna mensagem de sucesso
    res.status(200).json({ success: true, message: "Desinscrição realizada com sucesso!" });
  } catch (error) {
    // Loga o erro e retorna status 500
    console.error("Erro ao desinscrever:", error);
    res.status(500).json({
      success: false,
      error: "Erro ao desinscrever",
      details: error.message,
    });
  }
});


 

// Nova rota para alterar evento
app.post('/api/alterarevento', upload.single("fotoPet"), async (req, res) => {
  // Extrai dados do corpo da requisição
  const { evento_id, id_usuario, nome_evento, inicio, fim, uf, id_cidade, bairro, rua, numero, descricao, porte, sexo, complemento,   raca, } = req.body;
  // Define o caminho da foto, se enviada
  const foto = req.file ? `/uploads/${req.file.filename}` : null;

  // Valida campos obrigatórios
  if (!evento_id || !id_usuario) {
    return res.status(400).json({ error: "evento_id e id_usuario são obrigatórios" });
  }

  // Validação de data de início (não pode ser no passado)
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const dataInicio = new Date(inicio);
  if (dataInicio < hoje) {
    return res.status(400).json({ error: "A data de início não pode ser anterior ao dia atual." });
  }

  // Validação de data de fim (não pode ser antes da data de início)
  const dataFim = new Date(fim);
  if (dataFim < dataInicio) {
    return res.status(400).json({ error: "A data de fim não pode ser anterior à data de início." });
  }

  try {
    // Chama a função do db.js para atualizar evento
    const updated = await db.alterarEvento( evento_id, id_usuario,    foto, nome_evento, inicio, fim, uf, id_cidade, bairro, rua, numero, descricao, porte, sexo,      complemento, raca );
    // Verifica se a atualização foi bem-sucedida
    if (updated) {
      res.json({ message: `Evento "${nome_evento}" atualizado com sucesso!` });
    } else {
      res.status(403).json({ error: "Você não tem permissão para editar este evento ou evento não encontrado." });
    }
  } catch (error) {
    // Loga o erro e retorna status 500
    console.error("Erro ao alterar evento:", error);
    res.status(500).json({ error: "Erro ao alterar evento" });
  }
});

// Rota para excluir evento
app.post('/api/excluirevento', async (req, res) => {
  // Extrai dados do corpo da requisição
  const { evento_id, id_usuario } = req.body;

  // Valida campos obrigatórios
  if (!evento_id || !id_usuario) {
    return res.status(400).json({ error: "evento_id e id_usuario são obrigatórios" });
  }

  try {
    // Chama a função do db.js para excluir evento
    const deleted = await db.excluirEvento(evento_id, id_usuario);
    // Verifica se a exclusão foi bem-sucedida
    if (deleted) {
      res.json({ message: "Evento excluído com sucesso!" });
    } else {
      res.status(403).json({ error: "Você não tem permissão para excluir este evento ou evento não encontrado." });
    }
  } catch (error) {
    // Loga o erro e retorna status 500
    console.error("Erro ao excluir evento:", error);
    res.status(500).json({ error: "Erro ao excluir evento" });
  }
}); 

// Criar um comentário, somente nas paginas eventos criados e eventos inscritos
app.post("/api/comentarios", async (req, res) => {
  // Extrai dados do corpo da requisição
  const { id_evento, id_usuario, comentario } = req.body;

  // Valida campos obrigatórios e comentário
  if (!id_evento || !id_usuario || !comentario || comentario.trim() === "") {
    return res.status(400).json({ error: "Campos obrigatórios faltando." });
  }
  if (comentario.length > 500) {
    return res.status(400).json({ error: "Comentário muito longo (máx. 500 caracteres)." });
  }

  try {
    // Chama a função do db.js para adicionar comentário
    const adicionado = await db.adicionarComentario(id_evento, id_usuario, comentario);
    // Verifica se o comentário foi adicionado
    if (adicionado) {
      res.json({ message: "Comentário adicionado com sucesso!" });
    } else {
      res.status(400).json({ error: "Não foi possível adicionar o comentário." });
    }
  } catch (error) {
    // Loga o erro e retorna status 500
    console.error("Erro ao processar comentário:", error);
    res.status(500).json({ error: "Erro ao adicionar comentário." });
  }
});

// Consultar comentários de um evento
app.post("/api/consultarcomentarios", async (req, res) => {
  // Extrai ID do evento do corpo da requisição
  const { id_evento } = req.body;
  console.log("Recebido id_evento:", id_evento);

  // Valida campo obrigatório
  if (!id_evento) {
    return res.status(400).json({ error: "ID do evento é obrigatório." });
  }

  try {
    // Chama a função do db.js para buscar comentários
    const comentarios = await db.consultarComentarios(Number(id_evento));
    // Retorna a lista de comentários
    res.json(comentarios);
    console.log("Comentários retornados:", comentarios);
  } catch (error) {
    // Loga o erro e retorna status 500
    console.error("Erro ao processar consulta de comentários:", error);
    res.status(500).json({ error: "Erro ao consultar comentários." });
  }
});

// Rota para excluir um comentário
app.post("/api/excluircomentario", async (req, res) => {
  // Extrai dados do corpo da requisição
  const { id_comentario, id_usuario } = req.body;
  console.log("Recebido para exclusão:", { id_comentario, id_usuario });

  // Valida campos obrigatórios
  if (!id_comentario || !id_usuario) {
    return res.status(400).json({ error: "ID do comentário e usuário são obrigatórios." });
  }

  try {
    // Chama a função do db.js para excluir comentário (Number para garantir que os IDs sejam números)
    const result = await db.excluirComentario(Number(id_comentario), Number(id_usuario));
    // Retorna o resultado
    res.json(result);
  } catch (error) {
    console.error("Erro ao excluir comentário:", error);
    res.status(500).json({ error: error.message || "Erro ao excluir comentário." });
  }
});

// Rota para editar um comentário
app.post("/api/editarcomentario", async (req, res) => {
  // Extrai dados do corpo da requisição
  const { id_comentario, id_usuario, comentario } = req.body;
  console.log("Recebido para edição:", { id_comentario, id_usuario, comentario });

  // Valida campos obrigatórios e comentário
  if (!id_comentario || !id_usuario || !comentario) {
    return res.status(400).json({ error: "ID do comentário, usuário e texto são obrigatórios." });
  }
  if (comentario.trim().length === 0) {
    return res.status(400).json({ error: "O comentário não pode estar vazio." });
  }
  if (comentario.length > 500) {
    return res.status(400).json({ error: "O comentário deve ter no máximo 500 caracteres." });
  }

  try {
    // Chama a função do db.js para editar comentário
    const result = await db.editarComentario(Number(id_comentario), Number(id_usuario), comentario);
    // Retorna o resultado
    res.json(result);
  } catch (error) {
    console.error("Erro ao editar comentário:", error);
    res.status(500).json({ error: error.message || "Erro ao editar comentário." });
  }
});

// Rota para consultar inscritos
app.get("/api/consultarinscritos", async (req, res) => {
  // Extrai ID do evento dos parâmetros de query
  const { evento_id } = req.query;

  // Valida campo obrigatório
  if (!evento_id) {
    return res.status(400).json({ error: "evento_id é obrigatório" });
  }

  try {
    // Chama a função do db.js para buscar inscritos
    const inscritos = await db.consultarInscritos(evento_id);
    // Retorna a lista de inscritos
    res.json(inscritos);
  } catch (error) {
    console.error("Erro ao consultar inscritos:", error);
    res.status(500).json({ error: "Erro ao consultar inscritos" });
  }
});


// ****************************** MODO ADMIN ****************************** //
/*app.get("/api/consultausuarios", async (req, res) => {
  try {
    console.log('Recebida requisição para /api/consultausuarios');
    const usuarios = await db.consultaUsuarios();
    res.json(usuarios);
  } catch (error) {
    console.error('Erro na rota /api/consultausuarios:', error.message, error.stack);
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
});*/

// Rota para consultar usuários (atualizada para suportar filtro)
app.get("/api/consultausuarios", async (req, res) => {
  try {
    const filtroDenunciados = req.query.filtro === 'denunciados';
    const usuarios = await db.consultaUsuarios(filtroDenunciados);
    res.json(usuarios);
  } catch (error) {
    console.error('Erro na rota /consultausuarios:', error);
    res.status(500).json({ error: 'Erro ao consultar usuários' });
  }
});

app.post("/api/cadastraradmin", async (req, res) => {
  const { nome_completo, email, senha } = req.body;

  if (!nome_completo || !email || !senha) {
    return res.status(400).json({ error: "Todos os campos são obrigatórios" });
  }

  try {
    await db.cadastrarAdmin(nome_completo, email, senha);
    res.json({ message: `Administrador "${nome_completo}" cadastrado com sucesso!` });
  } catch (error) {
    console.error("Erro ao cadastrar administrador:", error);
    res.status(400).json({ error: error.message || "Erro ao cadastrar administrador" });
  }
});

// Rota para consultar administradores
app.get("/api/consultaradmins", async (req, res) => {
  try {
    const admins = await db.consultarAdmins();
    console.log("Requisição para consultar administradores");
    res.json(admins);
  } catch (error) {
    console.error("Erro ao consultar administradores:", error);
    res.status(500).json({ error: "Erro ao consultar administradores" });
  }
});

// Rota para excluir administrador
app.post("/api/excluiradmin", async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ error: "ID do administrador é obrigatório" });
  }

  try {
    await db.excluirAdmin(id);
    res.json({ message: "Administrador excluído com sucesso!" });
  } catch (error) {
    console.error("Erro ao excluir administrador:", error);
    res.status(500).json({ error: "Erro ao excluir administrador" });
  }
});

// Rota para atualizar um administrador
app.post("/api/alteraradmin", async (req, res) => {
  const { id, nome_completo, email } = req.body;

  if (!id || !nome_completo || !email) {
    return res.status(400).json({ error: "ID, nome completo e email são obrigatórios" });
  }

  try {
    await db.alterarAdmin(id, nome_completo, email);
    res.json({ message: `Administrador "${nome_completo}" atualizado com sucesso!` });
  } catch (error) {
    console.error("Erro ao atualizar administrador:", error);
    res.status(400).json({ error: error.message || "Erro ao atualizar administrador" });
  }
});

// Endpoint para excluir um usuário
app.post("/api/excluirusuario", async (req, res) => {
  const { id } = req.body;

  // Validação do ID
  if (!id) {
    return res.status(400).json({ error: "ID do usuário é obrigatório." });
  }

  try {
    await db.excluirUsuario(id);
    res.status(200).json({ message: "Usuário excluído com sucesso." });
  } catch (error) {
    if (error.message === "Usuário não encontrado") {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: "Erro interno no servidor." });
  }
});

app.post("/api/excluireventoadm", async (req, res) => {
  console.log("Requisição recebida em /api/excluireventoadm:", req.body);
  const { evento_id } = req.body;

  if (!evento_id) {
    console.log("ID inválido:", evento_id);
    return res.status(400).json({ error: "evento_id é obrigatório e deve ser um número." });
  }

  try {
    const deleted = await db.excluirEventoAdm(evento_id);
    if (deleted) {
      res.status(200).json({ message: "Evento excluído com sucesso." });
    } else {
      res.status(404).json({ error: "Evento não encontrado." });
    }
  } catch (error) {
    console.error("Erro ao excluir evento:", error);
    if (error.message === "Evento não encontrado") {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: "Erro interno no servidor." });
  }
});

app.post("/api/excluircomentarioadm", async (req, res) => {
  console.log("Requisição recebida em /api/excluircomentarioadm:", req.body);
  const { id_comentario } = req.body;

  if (!id_comentario) {
    console.log("ID inválido:", id_comentario);
    return res.status(400).json({ error: "id_comentario é obrigatório e deve ser um número." });
  }

  try {
    const result = await db.excluirComentarioAdm(id_comentario);
    res.status(200).json({ message: result.message });
  } catch (error) {
    console.error("Erro ao excluir comentário:", error);
    if (error.message === "Comentário não encontrado.") {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: "Erro interno no servidor." });
  }
});

// ********* DENUNCIAS ********* //
// Rota para registrar denúncia
app.post("/api/denunciar", async (req, res) => {
  const { tipo, evento_id, usuario_denunciado_id, usuario_denunciador_id, motivo } = req.body;

  // Validações do corpo da requisição
  if (!tipo || !["EVENTO", "USUARIO"].includes(tipo)) {
    return res.status(400).json({ error: "Tipo de denúncia inválido" });
  }
  if (tipo === "EVENTO" && !evento_id) {
    return res.status(400).json({ error: "ID do evento é obrigatório" });
  }
  if (tipo === "USUARIO" && !usuario_denunciado_id) {
    return res.status(400).json({ error: "ID do usuário denunciado é obrigatório" });
  }
  if (!usuario_denunciador_id) {
    return res.status(400).json({ error: "ID do usuário denunciador é obrigatório" });
  }

  try {
    await db.registrarDenuncia(tipo, evento_id, usuario_denunciado_id, usuario_denunciador_id, motivo);
    res.json({ message: "Denúncia registrada com sucesso!" });
  } catch (error) {
    console.error("Erro ao registrar denúncia:", error);
    res.status(error.message.includes("não encontrado") || error.message.includes("inválido") ? 400 : 500).json({
      error: error.message || "Erro ao registrar denúncia",
    });
  }
});

// Rota para consultar denúncias de um usuário
app.get("/api/consultardenunciasusuario", async (req, res) => {
  try {
    const usuarioId = req.query.usuario_id;
    if (!usuarioId) {
      return res.status(400).json({ error: 'ID do usuário é obrigatório' });
    }
    const denuncias = await db.consultaDenunciasUsuario(usuarioId);
    res.json(denuncias);
  } catch (error) {
    console.error('Erro na rota /consultardenunciasusuario:', error);
    res.status(500).json({ error: 'Erro ao consultar denúncias' });
  }
});

// Rota para consultar denúncias de um evento
app.get("/api/consultardenunciasevento", async (req, res) => {
  try {
    const eventoId = req.query.evento_id;
    if (!eventoId) {
      return res.status(400).json({ error: 'ID do evento é obrigatório' });
    }
    const denuncias = await db.consultaDenunciasEvento(eventoId);
    res.json(denuncias);
  } catch (error) {
    console.error('Erro na rota /consultardenunciasevento:', error);
    res.status(500).json({ error: 'Erro ao consultar denúncias' });
  }
});

// Rota para consultar eventos denunciados
app.get("/api/consultareventosdenunciados", async (req, res) => {
  try {
    const eventos = await db.consultarEventosDenunciados();
    res.json(eventos);
  } catch (error) {
    console.error('Erro na rota /consultareventosdenunciados:', error);
    res.status(500).json({ error: 'Erro ao consultar eventos denunciados' });
  }
});

// Rota para ignorar usuários denunciados
app.post("/api/ignorardenunciasusuario", async (req, res) => {
  try {
    const { usuario_id } = req.body;
    if (!usuario_id) {
      return res.status(400).json({ error: "ID do usuário é obrigatório" });
    }
    const affectedRows = await db.ignorarDenunciasUsuario(usuario_id);
    if (affectedRows === 0) {
      return res.status(200).json({ message: "Nenhuma denúncia pendente encontrada para rejeitar" });
    }
    res.status(200).json({ message: "Denúncias rejeitadas com sucesso" });
  } catch (error) {
    console.error("Erro na rota /ignorardenunciasusuario:", error);
    res.status(500).json({ error: "Erro ao rejeitar denúncias" });
  }
});

// Rota para ignorar eventos denunciados
app.post("/api/ignorardenunciasevento", async (req, res) => {
  try {
    const { evento_id } = req.body;
    if (!evento_id) {
      return res.status(400).json({ error: "ID do evento é obrigatório" });
    }
    const affectedRows = await db.ignorarDenunciasEvento(evento_id);
    if (affectedRows === 0) {
      return res.status(200).json({ message: "Nenhuma denúncia pendente encontrada para rejeitar" });
    }
    res.status(200).json({ message: "Denúncias rejeitadas com sucesso" });
  } catch (error) {
    console.error("Erro na rota /ignorardenunciasevento:", error);
    res.status(500).json({ error: "Erro ao rejeitar denúncias" });
  }
});

// Configura o body-parser para processar JSON e formulários com limite de 10MB
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor a correr em http://localhost:${port}`);
});