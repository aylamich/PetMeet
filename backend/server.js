const express = require('express');
const path = require('path');
const app = express();
const port = 3000;
const db = require('./db.js');
const cors = require('cors');
const multer = require('multer');
const bodyParser = require('body-parser');
const fileURLToPath = require('url');


console.log('Tentando importar db...');
console.log('db importado com sucesso:', db ? 'Sim' : 'Não');

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type'], // Permite o cabeçalho necessário para multipart/form-data
}));

app.use('/uploads', express.static('uploads'));
// Servir ficheiros estáticos (como o HTML)
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());


// Configuração do multer para salvar arquivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Pasta onde as fotos serão salvas
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // Nome único para o arquivo
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB em bytes
});

const bcrypt = require('bcrypt'); // Importando bcrypt para hash de senhas


// Definir uma rota GET
app.get('/api/mensagem', (req, res) => {
  res.json({ mensagem: 'Olá, esta é a resposta da rota!' });
});

app.get('/api/consultacidade', async (req, res) => {
  try {
    const resultado = await db.consultaCidade();
    res.json(resultado);
  } catch (error) {
    console.error('Erro ao consultar cidades:', error);
    res.status(500).json({ error: 'Erro ao consultar cidades' });
  }// acho q nao to usando essa funcao
});


app.post('/api/consultacidadeporUF', async (req, res) => {
 // console.log("Corpo recebido:", req.body); // Debug
  
  const { ufSelecionado } = req.body; // ← Corrigido para req.body
  
  if (!ufSelecionado) {
    return res.status(400).json({ error: "UF não fornecida" });
  }

  try {
    const resultado = await db.consultaCidadeporUF(ufSelecionado);
    //console.log("Resultado do banco:", resultado); // Debug
    
    // Garante que sempre retorne um array
    res.json(Array.isArray(resultado) ? resultado : []);

  } catch (error) {
    console.error("Erro na consulta:", error);
    res.status(500).json({ error: "Erro no servidor" });
  }
});


/*app.post('/api/login', async (req, res) => {
 
  const {email, senha} = req.body;
  console.log(email);
  console.log(senha);
 let resultado = await db.login(email, senha);
 console.log(resultado); 
  res.send(resultado)
});*/

app.post('/api/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    console.log("Tentativa de login:", email);

    // 2. Busca o usuário (agora dentro de try-catch)
    const usuario = await db.buscarUsuarioPorEmail(email);
    
    if (!usuario) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // 3. Verificação do hash
    if (!usuario.senha?.startsWith('$2')) {
      console.error("Hash inválido para:", email);
      return res.status(500).json({ error: 'Erro na configuração do servidor' });
    }

    // 4. Comparação de senha digitada com a criptografada
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    
    if (!senhaValida) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // 5. Resposta de sucesso
    res.json({ usuario_id: usuario.id, nome: usuario.nome_completo });
    console.log("Login bem-sucedido:", email);

  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

/*app.post('/api/cadastrousuario', async (req, res) => {
  console.log("Chegou no cadastro usuário");
  const { nome_completo, email, genero, data_nascimento, uf, id_cidade, senha } = req.body;

  try {
    await db.cadastrarUsuario(nome_completo, email, genero, data_nascimento, uf, id_cidade, senha);
    res.status(200).send('Usuário cadastrado com sucesso!', usuario_id);
  } catch (error) {
    console.error('Erro no servidor:', error);
    res.status(500).send('Erro ao cadastrar usuário');
  }
  
});*/

app.post('/api/cadastrousuario', async (req, res) => {
  console.log("Chegou no cadastro usuário");
  const { nome_completo, email, genero, data_nascimento, uf, id_cidade, senha } = req.body;

  try {
    const usuario_id = await db.cadastrarUsuario(nome_completo, email, genero, data_nascimento, uf, id_cidade, senha);
    res.status(200).json({ message: 'Usuário cadastrado com sucesso!', usuario_id });
  } catch (error) {
    console.error('Erro no servidor:', error);
    if (error.message === 'Este email já está cadastrado.') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).send('Erro ao cadastrar usuário');
  }
});

app.get('/api/consultausuario', async (req, res) => {
  try {
      const usuario_id = req.query.id;
      if (!usuario_id) {
          return res.status(400).json({ error: 'ID do usuário não fornecido' });
      }

      const usuario = await db.consultaUsuarioPorId(usuario_id);
      if (!usuario) {
          return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      res.status(200).json(usuario);
  } catch (error) {
      console.error('Erro ao consultar usuário:', error);
      res.status(500).json({ error: 'Erro ao buscar usuário' });
  }
});

/*app.post('/api/alterarusuario', async (req, res) => {
  const { usuario_id, nome_completo, email, genero, data_nascimento, uf, id_cidade } = req.body;

  try {
    await db.alterarUsuario(usuario_id, nome_completo, email, genero, data_nascimento, uf, id_cidade);
    res.send('Usuário atualizado com sucesso!');
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).send('Erro ao atualizar usuário');
  }
});*/

app.post('/api/alterarusuario', async (req, res) => {
  const { usuario_id, nome_completo, email, genero, data_nascimento, uf, id_cidade, senha } = req.body;

  try {
    await db.alterarUsuario(usuario_id, nome_completo, email, genero, data_nascimento, uf, id_cidade, senha);

    res.json({
      message: 'Usuário atualizado com sucesso!',
      usuario: {
        id: usuario_id,
        nome_completo,
        email,
        genero,
        data_nascimento,
        uf,
        id_cidade,
      },
    });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
});

  app.post('/api/editarusuario', async (req, res) =>  {  
    const {id} = req.body;

    let resultado = await db.consultaUsuarioPorId(id); 
    //console.log(resultado);
    res.send(resultado);
  }
  );                       

  /*app.post('/api/excluircliente', async (req, res) => {
    const {id} = req.body;
   ;

    try {
       await db.excluirCliente(id);
       res.status(200).json({ message: 'Cliente excluido com sucesso!' });
    } catch (error) {
        return res.status(400).send({ error: 'Erro ao excluir cliente' });
    } 
  });*/


/*app.post('/api/cadastropet', (req, res) => {
    const {usuario_id, foto, nome, sexo, idade, porte, raca} = req.body;
    
    db.cadastrarPet(usuario_id, foto, nome, sexo, idade, porte, raca);

    res.send(`Nome: ${nome}`);
});*/

/*app.post('/api/cadastropet', upload.single('fotoPet'), async (req, res) => {
  console.log('Arquivo recebido:', req.file);
  console.log('Corpo da requisição:', req.body);

  try {
    // Extrai os dados do formulário
    const { nome, sexo, idade, porte, raca } = req.body;
    const usuario_id = req.body.usuario_id;
    const foto = req.file ? `/uploads/${req.file.filename}` : null;

    // Validação básica
    if (!nome || !sexo || !idade || !porte) {
      return res.status(400).json({ error: 'Dados incompletos' });
    }

    // Chama a função do banco de dados
    const petId = await db.cadastrarPet(usuario_id, foto, nome, sexo, idade, porte, raca || null);

    res.status(200).json({
      success: true,
      message: 'Pet cadastrado com sucesso!',
      petId
    });

  } catch (error) {
    console.error('Erro no cadastro:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao cadastrar pet',
      details: error.message
    });
  }
});*/
app.post('/api/cadastropet', upload.single('fotoPet'), async (req, res) => {
  console.log('Arquivo recebido:', req.file);
  console.log('Corpo da requisição:', req.body);

  try {
    // Extrai os dados do formulário
    const { nome, sexo, data_nascimento, porte, raca } = req.body;
    const usuario_id = req.body.usuario_id;
    const foto = req.file ? `/uploads/${req.file.filename}` : null;

    // Validação básica
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
      //idade: calcularIdade(data_nascimento)
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


app.post('/api/consultapetpordono', async (req, res) =>  {
  const {usuarioSelecionado} = req.body;
  let resultado = await db.consultaPetPorDono(usuarioSelecionado);
  //console.log(resultado);
  res.send(resultado);
});

// Rota para buscar pets do usuário
app.get('/api/consultapets', async (req, res) => {
  try {
      const usuario_id = req.query.usuario_id;
      if (!usuario_id) {
          return res.status(400).json({ error: 'ID do usuário não fornecido' });
      }

      const pets = await db.consultaPetsPorUsuario(usuario_id);
      res.status(200).json(pets);
      
  } catch (error) {
      console.error('Erro ao consultar pets:', error);
      res.status(500).json({ error: 'Erro ao buscar pets' });
  }
});

app.post('/api/alterarpet', upload.single('fotoPet'), async (req, res) => {
  const { pet_id, nome, sexo, data_nascimento, porte, raca, fotoAtual } = req.body;
  const foto = req.file ? `/uploads/${req.file.filename}` : fotoAtual; // Caminho relativo da nova foto

  try {
    await db.alterarPet(pet_id, nome, sexo, data_nascimento, porte, raca, foto);
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
  const { pet_id } = req.query;
  console.log('Recebida requisição para excluir pet ID:', pet_id);

  if (!pet_id) {
    return res.status(400).json({ error: 'ID do pet é obrigatório' });
  }

  try {
    await db.deletarPet(pet_id);
    res.status(200).json({ message: 'Pet excluído com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.post('/api/criarevento', upload.single("fotoPet"), async (req, res) => {
  const {
    id_usuario,
    ///foto,
    nome_evento,
    inicio,
    fim,
    uf,
    id_cidade,
    bairro,
    rua,
    numero,
    descricao,
    porte,
    sexo,
    complemento,
    raca,
  } = req.body;
  const foto = req.file ? `/uploads/${req.file.filename}` : null;

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

  // Validação de data de fim (não pode ser antes da data de início)
  const dataFim = new Date(fim);
  if (dataFim < dataInicio) {
    return res.status(400).json({ error: "A data de fim não pode ser anterior à data de início." });
  }

  try {
    await db.criarEvento( id_usuario, foto, nome_evento, inicio, fim, uf, id_cidade, bairro, rua, numero, descricao, porte, sexo, complemento,  raca );
    res.json({ message: `Evento "${nome_evento}" criado com sucesso!` });
  } catch (error) {
    console.error("Erro ao criar evento:", error);
    res.status(500).json({ error: "Erro ao criar evento" });
  }
});

app.post('/api/consultareventos', async (req, res) => {
  const filtro = req.body;
  try {
    const eventos = await db.consultarEventos(filtro);
    console.log("Requisição para consultar eventos com filtros:", filtro);
    res.json(eventos);
  } catch (error) {
    console.error("Erro ao consultar eventos:", error);
    res.status(500).json({ error: "Erro ao consultar eventos" });
  }
});

app.post('/api/consultareventoscriados', async (req, res) => {
  const { id_usuario } = req.body;
  if (!id_usuario) {
      return res.status(400).json({ error: 'id_usuario é obrigatório' });
  }
  try {
      const eventos = await db.consultarEventosCriados(id_usuario);
      res.json(eventos);
  } catch (error) {
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

    // Validação básica
    if (!usuario_id || !evento_id) {
      return res.status(400).json({ error: "Usuário e evento são obrigatórios." });
    }

    // Chama a função do banco de dados
    const inscricaoId = await db.inscreverUsuario(usuario_id, evento_id);
    console.log("Inscrição ID retornado pelo banco:", inscricaoId);

    // Retorna a resposta
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

// Rota para buscar eventos inscritos
app.post("/api/eventosInscritos", async (req, res) => {
  console.log("Corpo da requisição:", req.body);

  try {
    // Extrai os dados do formulário
    const { usuario_id, filtro } = req.body;

    // Validação básica
    if (!usuario_id) {
      return res.status(400).json({ error: "Usuário é obrigatório." });
    }
    if (!["em_breve", "ja_aconteceu"].includes(filtro)) {
      return res.status(400).json({ error: "Filtro inválido." });
    }

    // Chama a função do banco de dados
    const eventos = await db.consultarEventosInscritos(usuario_id, filtro);
    console.log("Eventos retornados pelo banco:", eventos.length);

    // Retorna a resposta
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

app.post("/api/desinscrever", async (req, res) => {
  console.log("Corpo da requisição:", req.body);

  try {
    const { usuario_id, evento_id } = req.body;

    if (!usuario_id || !evento_id) {
      return res.status(400).json({ error: "Usuário e evento são obrigatórios." });
    }

    const result = await db.removerInscricao(usuario_id, evento_id);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Inscrição não encontrada." });
    }

    res.status(200).json({ success: true, message: "Desinscrição realizada com sucesso!" });
  } catch (error) {
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
  const {
    evento_id,
    id_usuario,
    nome_evento,
    inicio,
    fim,
    uf,
    id_cidade,
    bairro,
    rua,
    numero,
    descricao,
    porte,
    sexo,
    complemento,
    raca,
  } = req.body;
  const foto = req.file ? `/uploads/${req.file.filename}` : null;

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
    const updated = await db.alterarEvento(
      evento_id,
      id_usuario,
      foto,
      nome_evento,
      inicio,
      fim,
      uf,
      id_cidade,
      bairro,
      rua,
      numero,
      descricao,
      porte,
      sexo,
      complemento,
      raca
    );
    if (updated) {
      res.json({ message: `Evento "${nome_evento}" atualizado com sucesso!` });
    } else {
      res.status(403).json({ error: "Você não tem permissão para editar este evento ou evento não encontrado." });
    }
  } catch (error) {
    console.error("Erro ao alterar evento:", error);
    res.status(500).json({ error: "Erro ao alterar evento" });
  }
});

// Nova rota para excluir evento
app.post('/api/excluirevento', async (req, res) => {
  const { evento_id, id_usuario } = req.body;

  if (!evento_id || !id_usuario) {
    return res.status(400).json({ error: "evento_id e id_usuario são obrigatórios" });
  }

  try {
    const deleted = await db.excluirEvento(evento_id, id_usuario);
    if (deleted) {
      res.json({ message: "Evento excluído com sucesso!" });
    } else {
      res.status(403).json({ error: "Você não tem permissão para excluir este evento ou evento não encontrado." });
    }
  } catch (error) {
    console.error("Erro ao excluir evento:", error);
    res.status(500).json({ error: "Erro ao excluir evento" });
  }
}); 

// Criar um comentário
app.post("/api/comentarios", async (req, res) => {
  const { id_evento, id_usuario, comentario } = req.body;

  if (!id_evento || !id_usuario || !comentario || comentario.trim() === "") {
    return res.status(400).json({ error: "Campos obrigatórios faltando." });
  }
  if (comentario.length > 500) {
    return res.status(400).json({ error: "Comentário muito longo (máx. 500 caracteres)." });
  }

  try {
    const adicionado = await db.adicionarComentario(id_evento, id_usuario, comentario);
    if (adicionado) {
      res.json({ message: "Comentário adicionado com sucesso!" });
    } else {
      res.status(400).json({ error: "Não foi possível adicionar o comentário." });
    }
  } catch (error) {
    console.error("Erro ao processar comentário:", error);
    res.status(500).json({ error: "Erro ao adicionar comentário." });
  }
});

// Consultar comentários de um evento
app.post("/api/consultarcomentarios", async (req, res) => {
  const { id_evento } = req.body;
  console.log("Recebido id_evento:", id_evento);

  if (!id_evento) {
    return res.status(400).json({ error: "ID do evento é obrigatório." });
  }

  try {
    const comentarios = await db.consultarComentarios(Number(id_evento));
    res.json(comentarios);
    console.log("Comentários retornados:", comentarios);
  } catch (error) {
    console.error("Erro ao processar consulta de comentários:", error);
    res.status(500).json({ error: "Erro ao consultar comentários." });
  }
});

app.post("/api/excluircomentario", async (req, res) => {
  const { id_comentario, id_usuario } = req.body;
  console.log("Recebido para exclusão:", { id_comentario, id_usuario });

  if (!id_comentario || !id_usuario) {
    return res.status(400).json({ error: "ID do comentário e usuário são obrigatórios." });
  }

  try {
    const result = await db.excluirComentario(Number(id_comentario), Number(id_usuario));
    res.json(result);
  } catch (error) {
    console.error("Erro ao excluir comentário:", error);
    res.status(500).json({ error: error.message || "Erro ao excluir comentário." });
  }
});

app.post("/api/editarcomentario", async (req, res) => {
  const { id_comentario, id_usuario, comentario } = req.body;
  console.log("Recebido para edição:", { id_comentario, id_usuario, comentario });

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
    const result = await db.editarComentario(Number(id_comentario), Number(id_usuario), comentario);
    res.json(result);
  } catch (error) {
    console.error("Erro ao editar comentário:", error);
    res.status(500).json({ error: error.message || "Erro ao editar comentário." });
  }
});

// Rota para consultar inscritos
app.get("/api/consultarinscritos", async (req, res) => {
  const { evento_id } = req.query;

  if (!evento_id) {
    return res.status(400).json({ error: "evento_id é obrigatório" });
  }

  try {
    const inscritos = await db.consultarInscritos(evento_id);
    res.json(inscritos);
  } catch (error) {
    console.error("Erro ao consultar inscritos:", error);
    res.status(500).json({ error: "Erro ao consultar inscritos" });
  }
});


app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor a correr em http://localhost:${port}`);
});