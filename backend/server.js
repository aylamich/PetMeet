const express = require('express');
const path = require('path');
const app = express();
const port = 3000;
const db = require('./db.js');
const cors = require('cors');


// No início do server.js
console.log('Tentando importar db...');
console.log('db importado com sucesso:', db ? 'Sim' : 'Não');

// Servir ficheiros estáticos (como o HTML)
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'] 
}));

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
  }
});

// Rota para consultar cidades por UF

/*app.post('/api/consultacidadeporUF', async (req, res) => { // ← Alterado para POST
  console.log("Chegou na consulta cidade por UF");
  const { ufSelecionado } = req.query;
  const resultado = await db.consultaCidadeporUF(ufSelecionado);
  res.json(resultado);
});*/

app.post('/api/consultacidadeporUF', async (req, res) => {
  console.log("Corpo recebido:", req.body); // Debug
  
  const { ufSelecionado } = req.body; // ← Corrigido para req.body
  
  if (!ufSelecionado) {
    return res.status(400).json({ error: "UF não fornecida" });
  }

  try {
    const resultado = await db.consultaCidadeporUF(ufSelecionado);
    console.log("Resultado do banco:", resultado); // Debug
    
    // Garante que sempre retorne um array
    res.json(Array.isArray(resultado) ? resultado : []);

  } catch (error) {
    console.error("Erro na consulta:", error);
    res.status(500).json({ error: "Erro no servidor" });
  }
});


app.post('/api/login', async (req, res) => {
  const {email, senha} = req.body;
  //console.log(email);
  //console.log(senha);
  let resultado = await db.login(email, senha);
 // console.log(resultado); 
  res.send(resultado)
});

app.post('/api/cadastrousuario', (req, res) => {
    console.log("Chegou no cadastro usuário");
    const {nome_completo, email, genero, data_nascimento, uf, id_cidade, senha} = req.body;

    db.cadastrarUsuario(nome_completo, email, genero, data_nascimento, uf, id_cidade, senha);
    
    res.send(`Nome: ${nome_completo}`);
  });

  app.post('/api/alterarusuario', (req, res) => {
    const {usuario_id, nome_completo, email, genero, data_nascimento, uf, id_cidade, senha} = req.body;
    
    db.alterarUsuario(usuario_id, nome_completo, email, genero, data_nascimento, uf, id_cidade, senha);
    console.log(id_cidade);
    
    res.send(`Nome: ${nome}`);

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


app.post('/api/cadastropet', (req, res) => {
    const {usuario_id, foto, nome, sexo, idade, porte, raca} = req.body;
    
    db.cadastrarPet(usuario_id, foto, nome, sexo, idade, porte, raca);

    res.send(`Nome: ${nome}`);
});



app.post('/api/consultapetpordono', async (req, res) =>  {
  const {usuarioSelecionado} = req.body;
  let resultado = await db.consultaPetPorDono(usuarioSelecionado);
  //console.log(resultado);
  res.send(resultado);
});

app.post('/api/alterarpet', (req, res) => {
  const {pet_id, usuario_id, foto, nome, sexo, idade, porte, raca} = req.body;
  
  db.alterarPet(pet_id, usuario_id, foto, nome, sexo, idade, porte, raca);
  
  res.send(`Nome: ${nome}`);
});

app.post('/api/editarpet', async (req, res) =>  {
  const {id} = req.body;

  let resultado = await db.consultaPetPorId(id); 
  //console.log(resultado);
  res.send(resultado);
});


app.post('/api/criarevento', (req, res) => {  
    const {foto, nome_evento, inicio, fim, uf, id_cidade, bairro, rua, numero, descricao, porte, sexo, complemento, raca } = req.body;      

    db.criarEvento(foto, nome_evento, inicio, fim, uf, id_cidade, bairro, rua, numero, descricao, porte, sexo, complemento, raca);

    res.send(`Nome: ${nome}`);

});    
 

app.post('/api/alterarevento', (req, res) => {
  const { foto, nome, inicio, fim, uf, id_cidade, bairro, rua, numero, descricao, complemento, raca, porte, sexo, id_evento } = req.body;
  
  db.alterarAgenda( foto, nome, inicio, fim, uf, id_cidade, bairro, rua, numero, descricao, complemento, raca, porte, sexo, id_evento);
  
  res.send('');
});

app.post('/api/editarevento', async (req, res) =>  {
  const {id} = req.body;

  let resultado = await db.consultaEventos(id); 
  //console.log(resultado);
  res.send(resultado);
});


app.post('/api/excluirevento', (req, res) => {
  const {id} = req.body;
  //console.log("Chegou no excluir agenda");
  //console.log(id);

  db.excluirEvento(id);
  
  res.send([]);
});  


// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor a correr em http://localhost:${port}`);
});