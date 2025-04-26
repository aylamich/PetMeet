const bcrypt = require('bcrypt'); // Importando a biblioteca bcrypt para criptografar senhas
// O bcrypt é uma biblioteca que gera um hash seguro para senhas, tornando-as praticamente impossíveis de serem revertidas para o texto original

// Conexão com o banco de dados MySQL
async function connect(){

    if(global.connection && global.connection.state != 'disconnected' ){
        return global.connection;
    }

    const mysql = require('mysql2/promise');
    const connection =  await mysql.createConnection("mysql://root:admin@localhost:3306/bdpetmeet");
 

    console.log("Conectou no MYSQL!");
    global.connection = connection;
    
 
    // Retorna a conexão estabelecida
    return connection;

}

connect(); // Inicia a conexão com o banco de dados ao carregar o módulo

// Função para autenticar o usuário (email e senha)/ não estou usando essa função, mas vou deixar aqui para o caso de precisar depois
async function login(usuario, senha) {
    const conn = await connect();
    // Query SQL para buscar usuário por email e senha
    const sql = "SELECT email, senha FROM usuario WHERE email = ? AND senha = ?";
    const values = [usuario, senha]; // Parâmetros da query
    const [rows] = await conn.query(sql, values); // Executa a query
    return rows; // Retorna resultados (array de objetos)
}

// Função para buscar usuário por email, estou usando esse para autenticação
async function buscarUsuarioPorEmail(email) {
    const conn = await connect();
    try {
      // Query SQL para buscar detalhes do usuário por email
      const [rows] = await conn.query(
        "SELECT id, nome_completo, email, senha FROM usuario WHERE email = ?", 
        [email]
      );
      // Retorna o primeiro usuário encontrado ou null se não houver
      return rows[0] || null;
    } catch (error) {
      console.error('Erro ao buscar usuário por email:', error);
      throw error; // Lança o erro para ser tratado na rota
    }
  } 


// Função para cadastrar um novo usuário
async function cadastrarUsuario(nome_completo, email, genero, data_nascimento, uf, id_cidade, senha) {    
    const conn = await connect();

    // Normalizar nome_completo (ex.: Camila de Araujo Machado)
  let nomeNormalizado = '';
  if (nome_completo && typeof nome_completo === 'string') {
    // Remover espaços extras e converter para minúsculas
    let nome = nome_completo.trim().replace(/\s+/g, ' ').toLowerCase();
    // Dividir em palavras
    let palavras = nome.split(' ');
    // Lista de preposições que ficam em minúscula
    const preposicoes = ['de', 'da', 'dos', 'das'];
    // Capitalizar palavras, exceto preposições
    palavras = palavras.map((palavra, index) => {
      // Manter preposições em minúscula, exceto se forem a primeira ou última palavra
      if (preposicoes.includes(palavra) && index !== 0 && index !== palavras.length - 1) {
        return palavra;
      }
      // Capitalizar a primeira letra
      return palavra.charAt(0).toUpperCase() + palavra.slice(1);
    });
    // Juntar palavras
    nomeNormalizado = palavras.join(' ');
  } else {
    throw new Error('Nome completo é obrigatório e deve ser uma string válida.');
  }

    // Query SQL para inserir um novo usuário
    const sql = "INSERT INTO usuario (nome_completo, email, genero, data_nascimento, uf, id_cidade, senha) VALUES (?, ?, ?, ?, ?, ?, ?)";
    // Criptografa a senha com bcrypt (10 rounds de salt)
    // Salt: Sequência aleatória que torna cada hash único, cada iteração (10 aqui) mistura a senha e o salt de forma complexa
    const senhaHash = await bcrypt.hash(senha, 10);
    const values = [nomeNormalizado, email, genero, data_nascimento, uf, id_cidade, senhaHash]; // Parâmetros da query
    
    try {
      // Executa a query e desestrutura o resultado
      const [result] = await conn.query(sql, values);
      console.log('Usuário cadastrado com sucesso! ID:', result.insertId);
      // Retorna o ID do usuário recém-criado
      return result.insertId;
    } catch (error) {
      // Verifica se o erro é devido a email duplicado
      if (error.code === 'ER_DUP_ENTRY') { // ER_DUP_ENTRY é o código de erro para entrada duplicada
        console.log('Erro: Email já cadastrado:', email);
        throw new Error('Este email já está cadastrado.');
      }
      console.error('Erro ao cadastrar usuário:', error);
      throw error; // Propaga o erro
    }
  }

// Função para consultar usuário por ID
  async function consultaUsuarioPorId(id) {
    const conn = await connect();
    try {
      // Query SQL para buscar detalhes do usuário, incluindo nome da cidade
        const [rows] = await conn.query(`
            SELECT 
                u.id, 
                u.nome_completo, 
                u.email, 
                u.genero, 
                DATE_FORMAT(u.data_nascimento, '%Y-%m-%d') as data_nascimento, 
                u.uf, 
                u.id_cidade,
                c.nomeCidade as cidade_nome
            FROM usuario u
            INNER JOIN cidade c ON u.id_cidade = c.id
            WHERE u.id = ?`, 
            [id]
        );
        
        // Retorna null se nenhum usuário for encontrado
        if (rows.length === 0) return null;
        
        // Retorna o primeiro usuário encontrado
        return rows[0];
    } catch (error) {
        console.error('Erro ao buscar usuário por ID:', error);
        throw error;
    }
}

// Função para atualizar dados de um usuário
async function alterarUsuario(usuario_id, nome_completo, email, genero, data_nascimento, uf, id_cidade, senha) {
    const conn = await connect();
    try {
      // Recuperar o nome_completo atual do banco se não fornecido
      let nomeNormalizado = nome_completo;
      if (nome_completo && typeof nome_completo === 'string' && nome_completo.trim() !== '') {
        // Normalizar nome_completo (ex.: Camila de Araujo Machado)
        let nome = nome_completo.trim().replace(/\s+/g, ' ').toLowerCase();
        let palavras = nome.split(' ');
        const preposicoes = ['de', 'da', 'dos', 'das'];
        palavras = palavras.map((palavra, index) => {
          if (preposicoes.includes(palavra) && index !== 0 && index !== palavras.length - 1) {
            return palavra;
          }
          return palavra.charAt(0).toUpperCase() + palavra.slice(1);
        });
        nomeNormalizado = palavras.join(' ');
      } else {
        // Buscar o nome atual no banco
        const [rows] = await conn.query('SELECT nome_completo FROM usuario WHERE id = ?', [usuario_id]);
        if (rows.length === 0) {
          throw new Error('Usuário não encontrado.');
        }
        nomeNormalizado = rows[0].nome_completo;
      }
   
      // Query SQL dinâmica para atualizar usuário, incluindo senha apenas se fornecida
      const sql = `
        UPDATE usuario 
        SET nome_completo = ?, email = ?, genero = ?, data_nascimento = ?, uf = ?, id_cidade = ?
        ${senha ? ', senha = ?' : ''} 
        WHERE id = ?
      `;
      // Criptografa a senha se fornecida
      const hashedSenha = senha ? await bcrypt.hash(senha, 10) : undefined;
      const values = senha
        ? [nomeNormalizado, email, genero, data_nascimento, uf, id_cidade, hashedSenha, usuario_id]
        : [nomeNormalizado, email, genero, data_nascimento, uf, id_cidade, usuario_id];
  
      //console.log(sql, values);
      // Executa a query
      await conn.execute(sql, values);
      console.log('Usuário atualizado com sucesso!');
      return { nomeNormalizado }; // Retorna o nome normalizado do usuário
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw error;
    } 
  }
  
// Função para cadastrar um novo pet
async function cadastrarPet(usuario_id, foto, nome, sexo, data_nascimento, porte, raca = null) {
    const conn = await connect();
    // Query SQL para inserir um novo pet
    const sql = "INSERT INTO pet (usuario_id, foto, nome, sexo, data_nascimento, porte, raca) VALUES (?, ?, ?, ?, ?, ?, ?)";
    const values = [usuario_id, foto, nome, sexo, data_nascimento, porte, raca]; // Parâmetros da query

    try {
        const [result] = await conn.query(sql, values); // Desestrutura o resultado
        // Loga sucesso com o ID do pet cadastrado
        console.log('Pet cadastrado com sucesso! ID:', result.insertId);
        return result.insertId; // Retorna o ID gerado pelo banco
    } catch (error) {
        console.error('Erro ao cadastrar pet:', error);
        throw error; // Lança o erro para ser tratado na rota
    }
}

// Função para consultar pet por ID
async function consultaPetPorId(id) {
    const conn = await connect();
    // Query SQL para buscar detalhes do pet e do dono
    const sql = "SELECT p.id, p.foto, p.nome, p.sexo, p.idade, p.porte, p.raca, u.id AS usuario_id, u.nome_completo AS dono_nome FROM pet p JOIN usuario u ON p.usuario_id = u.id WHERE p.id = ?";
    const [rows] = await conn.query(sql, [id]); // Executa a query com o ID do pet
    // Retorna o primeiro pet encontrado
    return rows[0];
}

// Não estou usando essa função, mas vou deixar aqui para o caso de precisar depois
async function consultaPetPorDono(id) {
    const conn = await connect();
    const sql = "SELECT * FROM pet WHERE usuario_id = ?";
    const [rows] = await conn.query(sql, [id]);
    return rows;
}

// Consulta pet por usuário (retorna todos os pets do usuário)
async function consultaPetsPorUsuario(usuario_id) {
    const conn = await connect();
    try {
      // Query SQL para buscar pets com formatação de data e tratamento de foto
        const [rows] = await conn.query(
            `SELECT id, 
                   CASE WHEN foto IS NOT NULL THEN foto ELSE NULL END as foto,
                    nome, sexo, DATE_FORMAT(data_nascimento, '%Y-%m-%d') as data_nascimento, porte, raca 
             FROM pet 
             WHERE usuario_id = ?`,
            [usuario_id]
          );
          // Retorna a lista de pets
        return rows;
    } catch (error) {
        console.error('Erro ao buscar pets por usuário:', error);
        throw error;
    }
}

// Função para alterar dados de um pet
async function alterarPet(pet_id, nome, sexo, data_nascimento, porte, raca, foto) {
    const conn = await connect();
    try { 
      // Query SQL para atualizar pet, incluindo foto apenas se fornecida
      const sql = `
        UPDATE pet 
        SET nome = ?, sexo = ?, data_nascimento = ?, porte = ?, raca = ?, foto = ? 
        WHERE id = ?
      `;
      // Query SQL para atualizar pet
      const values = [
        nome !== undefined ? nome : null,
        sexo !== undefined ? sexo : null,
        data_nascimento !== undefined ? data_nascimento : null,
        porte !== undefined ? porte : null,
        raca !== undefined ? raca : null,
        foto !== undefined ? foto : null,
        pet_id !== undefined ? pet_id : null,
      ];
      console.log(sql, values);
      await conn.execute(sql, values);
      console.log('Pet atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar pet:', error);
      throw error;
    }
}    

// Função para deletar um pet
async function deletarPet(petId) {
    const conn = await connect();
    const sql = "DELETE FROM pet WHERE id = ?";
    const values = [petId];
  
    try {
      // Executa a query e desestrutura o resultado
      const [result] = await conn.query(sql, values);
      // Verifica se algum pet foi excluído
      if (result.affectedRows === 0) {
        throw new Error('Pet não encontrado');
      }
      console.log('Pet excluído com sucesso!');
      // Retorna objeto indicando sucesso
      return { success: true };
    } catch (error) {
      console.error('Erro ao excluir pet:', error);
      throw error;
    } 
}

// Função para criar um novo evento
async function criarEvento( id_usuario, foto, nome_evento, inicio, fim, uf, id_cidade, bairro, rua, numero, descricao, porte = "Geral", sexo = "Geral", complemento = null, raca = null ) { // Alguns parâmetros têm valores padrão
    const conn = await connect();
    const sql =
      "INSERT INTO evento (id_usuario, foto, nome, inicio, fim, uf, id_cidade, bairro, rua, numero, descricao, porte, sexo, complemento, raca) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    const values = [ id_usuario, foto, nome_evento, inicio, fim, uf, id_cidade, bairro, rua, numero, descricao, porte, sexo, complemento, raca, ];
  
    try {
      await conn.query(sql, values);
      console.log("Evento criado!");
    } catch (error) {
      console.error("Erro ao criar evento:", error);
      throw error;
    } 
  }
  
// Função para consultar eventos com filtros
async function consultarEventos(filtro = {}) {
  const conn = await connect();
  // Query SQL base para buscar eventos, com joins para usuário e cidade
  // COUNT conta a quantidade de inscrições para cada evento
  let sql = "SELECT e.*, u.nome_completo AS nome_usuario, c.nomeCidade AS nome_cidade, TIME_FORMAT(e.inicio, '%H:%i') AS inicio_formatado,       TIME_FORMAT(e.fim, '%H:%i') AS fim_formatado, (SELECT COUNT(*) FROM inscricao i WHERE i.evento_id = e.id) AS total_inscritos FROM evento e JOIN usuario u ON e.id_usuario = u.id  JOIN cidade c ON e.id_cidade = c.id WHERE e.fim >= NOW()"; // Filtra eventos futuros
  const values = []; // Array para parâmetros da query

  // Adiciona condições dinâmicas com base nos filtros (adiciona la na query SQL)
  if (filtro.id) {
    sql += " AND e.id = ?";
    values.push(filtro.id);
  }
  if (filtro.uf) {
    sql += " AND e.uf = ?";
    values.push(filtro.uf);
  }
  if (filtro.id_cidade) {
    sql += " AND e.id_cidade = ?";
    values.push(filtro.id_cidade); 
  }
  if (filtro.porte) {
    sql += " AND e.porte = ?";
    values.push(filtro.porte);
  }
  if (filtro.sexo) {
    sql += " AND e.sexo = ?";
    values.push(filtro.sexo);
  }
  if (filtro.data_inicio) {
    sql += " AND e.inicio >= ?";
    values.push(filtro.data_inicio);
  }
  if (filtro.raca) {
    sql += " AND LOWER(e.raca) LIKE LOWER(?)";
    values.push(`%${filtro.raca}%`);
  }
  
  // Ordena eventos por data de início
  sql += " ORDER BY e.inicio ASC";

  try {
    const [rows] = await conn.query(sql, values);
    // Retorna lista de eventos
    return rows;
  } catch (error) {
    console.error("Erro ao consultar eventos:", error);
    throw error;
  }
}

async function consultarEventosCriados(id_usuario) {
  const conn = await connect();
  // Query SQL para buscar eventos criados pelo usuário, incluindo total_inscritos
  // COUNT conta a quantidade de inscrições para cada evento
  const sql = `
      SELECT 
        e.*, 
        u.nome_completo AS nome_usuario, 
        c.nomeCidade AS nome_cidade,
        TIME_FORMAT(e.inicio, '%H:%i') AS inicio_formatado,     
        TIME_FORMAT(e.fim, '%H:%i') AS fim_formatado,
        (SELECT COUNT(*) FROM inscricao i WHERE i.evento_id = e.id) AS total_inscritos
      FROM evento e
      JOIN usuario u ON e.id_usuario = u.id
      JOIN cidade c ON e.id_cidade = c.id
      WHERE e.id_usuario = ?
  `;
  const values = [id_usuario];

  try {
      const [rows] = await conn.query(sql, values);
      console.log("Eventos consultados com sucesso! Dados:", rows);
      return rows;
  } catch (error) {
      console.error('Erro ao consultar eventos:', error);
      throw error;
  }
}

// Função para inscrever um usuário em um evento
async function inscreverUsuario(usuario_id, evento_id) {
  const conn = await connect();
  // Query SQL para inserir inscrição
  const sql = "INSERT INTO inscricao (usuario_id, evento_id) VALUES (?, ?)";
  const values = [usuario_id, evento_id];

  try {
    const [result] = await conn.query(sql, values);
    console.log("Inscrição realizada com sucesso! ID:", result.insertId);
    return result.insertId; // Retorna o ID da inscrição
  } catch (error) {
    console.error("Erro ao inscrever usuário:", error);
    throw error; // Lança o erro para ser tratado na rota
  }
}

// Função para consultar eventos inscritos por um usuário, com filtro
async function consultarEventosInscritos(usuario_id, filtro) {
  const conn = await connect();
  let sql;
  const values = [usuario_id];

  // Query SQL para eventos futuros
  if (filtro === "em_breve") {
    sql = `
      SELECT 
      e.*, 
      u.nome_completo AS nome_usuario,
      c.nomeCidade AS nome_cidade,
      TIME_FORMAT(e.inicio, '%H:%i') AS inicio_formatado,       
      TIME_FORMAT(e.fim, '%H:%i') AS fim_formatado,
      (SELECT COUNT(*) FROM inscricao i2 WHERE i2.evento_id = e.id) AS total_inscritos
      FROM evento e
      JOIN usuario u ON e.id_usuario = u.id
      JOIN inscricao i ON i.evento_id = e.id
      JOIN cidade c ON e.id_cidade = c.id
      WHERE i.usuario_id = ?
      AND e.fim >= NOW()
      ORDER BY e.inicio ASC
    `;
  // Query SQL para eventos passados
  } else if (filtro === "ja_aconteceu") {
    sql = `
      SELECT 
      e.*, 
      u.nome_completo AS nome_usuario,
      c.nomeCidade AS nome_cidade,
      TIME_FORMAT(e.inicio, '%H:%i') AS inicio_formatado,       
      TIME_FORMAT(e.fim, '%H:%i') AS fim_formatado,
      (SELECT COUNT(*) FROM inscricao i2 WHERE i2.evento_id = e.id) AS total_inscritos
      FROM evento e
      JOIN usuario u ON e.id_usuario = u.id
      JOIN inscricao i ON i.evento_id = e.id
      JOIN cidade c ON e.id_cidade = c.id
      WHERE i.usuario_id = ?
      AND e.fim < NOW()
      ORDER BY e.inicio ASC
    `;
  } else {
    throw new Error("Filtro inválido");
  }

  try {
    const [rows] = await conn.query(sql, values);
    // Loga quantidade de eventos retornados
    console.log("Eventos inscritos retornados:", rows.length);
    return rows; // Retorna a lista de eventos
  } catch (error) {
    console.error("Erro ao consultar eventos inscritos:", error);
    throw error; // Lança o erro para ser tratado na rota
  } 
} 

// Função para remover inscrição do usuário em um evento
async function removerInscricao(usuario_id, evento_id) {
  const conn = await connect();
  // Query SQL para excluir inscriçã
  const sql = "DELETE FROM inscricao WHERE usuario_id = ? AND evento_id = ?";
  const values = [usuario_id, evento_id];

  try {
    const [result] = await conn.query(sql, values);
    console.log("Inscrição removida:", result.affectedRows);
    return result;
  } catch (error) {
    console.error("Erro ao remover inscrição:", error);
    throw error;
  } 
}

// Função para alterar dados de um evento
async function alterarEvento( evento_id, id_usuario, foto, nome_evento, inicio,  fim, uf, id_cidade, bairro, rua, numero, descricao, porte = "Geral", sexo = "Geral",   complemento = null, raca = null ) { // Alguns parâmetros têm valores padrão
  const conn = await connect();
  let sql = `
    UPDATE evento 
    SET nome = ?, inicio = ?, fim = ?, uf = ?, id_cidade = ?, 
        bairro = ?, rua = ?, numero = ?, descricao = ?, porte = ?, 
        sexo = ?, complemento = ?, raca = ?
  `;
  const values = [ nome_evento, inicio, fim, uf, id_cidade, bairro, rua, numero, descricao, porte, sexo, complemento, raca,  ];

  // Adiciona foto à query se fornecida
  if (foto) {
    sql += ", foto = ?";
    values.push(foto);
  }

  // Adiciona condições de ID do evento e usuário
  sql += " WHERE id = ? AND id_usuario = ?";
  values.push(evento_id, id_usuario);

  try {
    const [result] = await conn.query(sql, values);
    // Verifica se a atualização foi bem-sucedida
    if (result.affectedRows > 0) {
      console.log("Evento atualizado!");
      return true;
    }
    return false;
  } catch (error) {
    console.error("Erro ao alterar evento:", error);
    throw error;
  }
}

// Função para excluir um evento
async function excluirEvento(evento_id, id_usuario) {
  const conn = await connect();
  const sql = "DELETE FROM evento WHERE id = ? AND id_usuario = ?";
  const values = [evento_id, id_usuario];

  try {
    const [result] = await conn.query(sql, values);
    // Verifica se a exclusão foi bem-sucedida
    if (result.affectedRows > 0) {
      console.log("Evento excluído!");
      return true;
    }
    return false;
  } catch (error) {
    console.error("Erro ao excluir evento:", error);
    throw error;
  } 
}

// Adicionar um comentário
async function adicionarComentario(id_evento, id_usuario, comentario) {
  const conn = await connect();
  const sql = "INSERT INTO comentarios (id_evento, id_usuario, comentario) VALUES (?, ?, ?)";
  const values = [id_evento, id_usuario, comentario];

  try {
    const [result] = await conn.query(sql, values);
    // Verifica se o comentário foi adicionado com sucesso
    if (result.affectedRows > 0) {
      console.log("Comentário adicionado!");
      return true;
    }
    return false;
  } catch (error) {
    console.error("Erro ao adicionar comentário:", error);
    throw error;
  }
}

// Consultar comentários de um evento
async function consultarComentarios(id_evento) {
  console.log("Consultando comentários para id_evento:", id_evento);
  const conn = await connect();
  const sql = `
    SELECT c.id, c.comentario, c.data_criacao, u.nome_completo AS nome_usuario, c.id_usuario
    FROM comentarios c
    JOIN usuario u ON c.id_usuario = u.id
    WHERE c.id_evento = ?
    ORDER BY c.data_criacao ASC
  `;
  const values = [id_evento];

  try {
    //Executa a query 
    const [comentarios] = await conn.query(sql, values);
    // Retorna lista de comentários
    return comentarios;
  } catch (error) {
    console.error("Erro ao consultar comentários:", error);
    throw error;
  }
}

// Excluir um comentário
async function excluirComentario(id_comentario, id_usuario) {
  console.log("Excluindo comentário:", id_comentario, "para usuário:", id_usuario);
  const conn = await connect();
  const sql = "DELETE FROM comentarios WHERE id = ? AND id_usuario = ?";
  try {
    // Executa a query e desestrutura o resultado
    const [result] = await conn.query(sql, [id_comentario, id_usuario]);
    console.log("Resultado da exclusão:", result);
    if (result.affectedRows === 0) {
      // Verifica se o comentário foi exluído com sucesso
      throw new Error("Comentário não encontrado ou não pertence ao usuário.");
    }
    // Retorna mensagem de sucesso
    return { message: "Comentário excluído com sucesso." };
  } catch (error) {
    console.error("Erro ao excluir comentário:", error);
    throw error;
  } 
}

// Editar um comentário
async function editarComentario(id_comentario, id_usuario, comentario) {
  console.log("Editando comentário:", id_comentario, "para usuário:", id_usuario);
  const conn = await connect();
  const sql = "UPDATE comentarios SET comentario = ? WHERE id = ? AND id_usuario = ? ";
  try {
    const [result] = await conn.query(sql, [comentario, id_comentario, id_usuario]);
    console.log("Resultado da edição:", result);
    // Verifica se o comentário foi editado com sucesso
    if (result.affectedRows === 0) {
      throw new Error("Comentário não encontrado ou não pertence ao usuário.");
    }
    // Retorna mensagem de sucesso
    return { message: "Comentário editado com sucesso." };
  } catch (error) {
    console.error("Erro ao editar comentário:", error);
    throw error;
  }
}

// Consultar inscritos em um evento
async function consultarInscritos(evento_id) {
  console.log("Consultando inscritos para evento_id:", evento_id);
  const conn = await connect();
  // Query SQL para buscar inscritos com nome completo, em ordem alfabética
  const sql = "SELECT u.id, u.nome_completo, (SELECT COUNT(*) FROM inscricao i WHERE i.evento_id = ?) AS total_inscritos FROM inscricao i JOIN usuario u ON i.usuario_id = u.id WHERE i.evento_id = ? ORDER BY u.nome_completo ASC ";
  try {
    const [rows] = await conn.query(sql, [evento_id, evento_id]);
    // Loga inscritos encontrados
    console.log("Inscritos encontrados:", rows);
    // Retorna lista de inscritos
    return rows;
  } catch (error) {
    console.error("Erro ao consultar inscritos:", error);
    throw error;
  }
}

// Função para consultar cidades por UF
async function consultaCidadeporUF(ufSelecionado){
    console.log(`Consultando cidades para UF: ${ufSelecionado}`);
    const conn = await connect();
    // Query SQL para buscar cidades por UF
    const sql = "SELECT * FROM cidade WHERE uf = ?";
    const values = [ufSelecionado];

    // Executa a query 
    let [rows] = await conn.query(sql, values);
    // Retorna lista de cidades
    return rows;
}    

// Não estou usando essa função, mas vou deixar aqui para o caso de precisar depois
async function consultaCidade() {    
    const conn = await connect();
    const sql = "SELECT * FROM cidade";
    const [rows] = await conn.query(sql, []);
    return rows;
}

// **************************************** MODO ADM ****************************************** //

// Função para buscar admin por email
async function buscarAdminPorEmail(email) {
  const conn = await connect();
  try {
    const [rows] = await conn.query(
      'SELECT id, nome_completo, email, senha FROM adm WHERE email = ?',
      [email]
    );
    return rows[0] || null;
  } catch (error) {
    console.error('Erro ao buscar admin por email:', error);
    throw error;
  }
}

// Função para consultar todos os usuários ou usuários DENUNCIADOS
async function consultaUsuarios(filtroDenunciados = false) {
  const conn = await connect();
  try {
    console.log('Executando consulta de usuários...');
    let query = `
      SELECT u.id, u.nome_completo
      FROM usuario u
    `;
    if (filtroDenunciados) {
      query += `
        INNER JOIN denuncias d ON u.id = d.usuario_denunciado_id
        WHERE d.tipo = 'USUARIO' AND d.status = 'PENDENTE'
      `;
    }
    query += ' ORDER BY u.nome_completo ASC';

    const [rows] = await conn.query(query);
    console.log('Usuários encontrados:', rows);
    return rows;
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    throw error;
  } 
}

// Função para cadastrar um novo administrador
async function cadastrarAdmin(nome_completo, email, senha) {
  const conn = await connect();

  // Normalizar nome_completo (ex.: Camila de Araujo Machado)
  let nomeNormalizado = '';
  if (nome_completo && typeof nome_completo === 'string') {
    // Remover espaços extras e converter para minúsculas
    let nome = nome_completo.trim().replace(/\s+/g, ' ').toLowerCase();
    // Dividir em palavras
    let palavras = nome.split(' ');
    // Lista de preposições que ficam em minúscula
    const preposicoes = ['de', 'da', 'dos', 'das'];
    // Capitalizar palavras, exceto preposições
    palavras = palavras.map((palavra, index) => {
      // Manter preposições em minúscula, exceto se forem a primeira ou última palavra
      if (preposicoes.includes(palavra) && index !== 0 && index !== palavras.length - 1) {
        return palavra;
      }
      // Capitalizar a primeira letra
      return palavra.charAt(0).toUpperCase() + palavra.slice(1);
    });
    // Juntar palavras
    nomeNormalizado = palavras.join(' ');
  } else {
    throw new Error('Nome completo é obrigatório e deve ser uma string válida.');
  }

  const sql = "INSERT INTO adm (nome_completo, email, senha) VALUES (?, ?, ?)";
  const senhaHash = await bcrypt.hash(senha, 10);
  const values = [nomeNormalizado, email, senhaHash];

  try {
    const [result] = await conn.query(sql, values);
    console.log('Administrador cadastrado com sucesso! ID:', result.insertId);
    return result.insertId;
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      console.log('Erro: Email já cadastrado:', email);
      throw new Error('Este email já está cadastrado.');
    }
    console.error('Erro ao cadastrar administrador:', error);
    throw error;
  } 
}

// Função para consultar todos os administradores
async function consultarAdmins() {
  const conn = await connect();
  const sql = "SELECT id, nome_completo, email FROM adm ORDER BY nome_completo ASC";

  try {
    const [rows] = await conn.query(sql);
    return rows;
  } catch (error) {
    console.error("Erro ao consultar administradores:", error);
    throw error;
  } 
}

// Função para excluir um administrador
async function excluirAdmin(id) {
  const conn = await connect();
  const sql = "DELETE FROM adm WHERE id = ?";
  const values = [id];

  try {
    const [result] = await conn.query(sql, values);
    if (result.affectedRows === 0) {
      throw new Error("Administrador não encontrado");
    }
    console.log("Administrador excluído!");
  } catch (error) {
    console.error("Erro ao excluir administrador:", error);
    throw error;
  } 
}

// Função para alterar dados de um administrador
async function alterarAdmin(id, nome_completo, email) {
  const conn = await connect();

  // Normalizar nome_completo
  let nomeNormalizado = '';
  if (nome_completo && typeof nome_completo === 'string') {
    // Verificar se contém números
    if (/\d/.test(nome_completo)) {
      throw new Error('O nome completo não pode conter números.');
    }
    // Remover espaços extras e converter para minúsculas
    let nome = nome_completo.trim().replace(/\s+/g, ' ').toLowerCase();
    // Dividir em palavras
    let palavras = nome.split(' ');
    // Lista de preposições que ficam em minúscula
    const preposicoes = ['de', 'da', 'dos', 'das'];
    // Capitalizar palavras, exceto preposições
    palavras = palavras.map((palavra, index) => {
      // Manter preposições em minúscula, exceto se forem a primeira ou última palavra
      if (preposicoes.includes(palavra) && index !== 0 && index !== palavras.length - 1) {
        return palavra;
      }
      // Capitalizar a primeira letra
      return palavra.charAt(0).toUpperCase() + palavra.slice(1);
    });
    // Juntar palavras
    nomeNormalizado = palavras.join(' ');
  } else {
    throw new Error('Nome completo é obrigatório e deve ser uma string válida.');
  }

  const sql = "UPDATE adm SET nome_completo = ?, email = ? WHERE id = ?";
  const values = [nomeNormalizado, email, id];

  try {
    const [result] = await conn.query(sql, values);
    if (result.affectedRows === 0) {
      throw new Error("Administrador não encontrado.");
    }
    console.log('Administrador atualizado com sucesso! ID:', id);
    return id;
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      console.log('Erro: Email já cadastrado:', email);
      throw new Error('Este email já está cadastrado.');
    }
    console.error('Erro ao atualizar administrador:', error);
    throw error;
  }
}

// Função para excluir um usuário
async function excluirUsuario(id) {
  const conn = await connect();
  // Obter denúncias pendentes (para auditoria)
  const [denuncias] = await conn.query(`
    SELECT id, tipo, usuario_denunciado_id, usuario_denunciador_id, motivo, data_denuncia
    FROM denuncias
    WHERE tipo = 'USUARIO' AND usuario_denunciado_id = ? AND status = 'PENDENTE'
  `, [id]);
  // Registrar na auditoria
  for (const denuncia of denuncias) {
    await conn.query(`
      INSERT INTO auditoria_denuncias (denuncia_id, tipo, usuario_denunciado_id, usuario_denunciador_id, motivo, data_denuncia, status, acao)
      VALUES (?, ?, ?, ?, ?, ?, 'RESOLVIDO', 'RESOLVIDA_POR_EXCLUSAO')
    `, [denuncia.id, denuncia.tipo, denuncia.usuario_denunciado_id, denuncia.usuario_denunciador_id, denuncia.motivo, denuncia.data_denuncia]);
  }

  // Excluir o usuário
  const sql = "DELETE FROM usuario WHERE id = ?";
  const values = [id];

  try {
    const [result] = await conn.query(sql, values);
    if (result.affectedRows === 0) {
      throw new Error("Usuário não encontrado");
    }
    console.log("Usuário excluído!");
  } catch (error) {
    console.error("Erro ao excluir usuário:", error);
    throw error;
  }
}

// Função para excluir um evento 
async function excluirEventoAdm(evento_id) {
  const conn = await connect();
  // Obter denúncias pendentes(para auditoria)  
  const [denuncias] = await conn.query(`
    SELECT id, tipo, evento_id, usuario_denunciador_id, motivo, data_denuncia
    FROM denuncias
    WHERE tipo = 'EVENTO' AND evento_id = ? AND status = 'PENDENTE'
  `, [evento_id]);
  // Registrar na auditoria
  for (const denuncia of denuncias) {
    await conn.query(`
      INSERT INTO auditoria_denuncias (denuncia_id, tipo, evento_id, usuario_denunciador_id, motivo, data_denuncia, status, acao)
      VALUES (?, ?, ?, ?, ?, ?, 'RESOLVIDO', 'RESOLVIDA_POR_EXCLUSAO')
    `, [denuncia.id, denuncia.tipo, denuncia.evento_id, denuncia.usuario_denunciador_id, denuncia.motivo, denuncia.data_denuncia]);
  }

  // Excluir o evento
  const sql = "DELETE FROM evento WHERE id = ?";
  const values = [evento_id];

  try {
    const [result] = await conn.query(sql, values);
    if (result.affectedRows === 0) {
      throw new Error("Evento não encontrado");
    }
    console.log("Evento excluído!");
    return true;
  } catch (error) {
    console.error("Erro ao excluir evento:", error);
    throw error;
  } 
}

// Função para excluir um comentário 
async function excluirComentarioAdm(id_comentario) {
  console.log("Excluindo comentário:", id_comentario);
  const conn = await connect();
  const sql = "DELETE FROM comentarios WHERE id = ?";
  try {
    const [result] = await conn.query(sql, [id_comentario]);
    console.log("Resultado da exclusão:", result);
    if (result.affectedRows === 0) {
      throw new Error("Comentário não encontrado.");
    }
    return { message: "Comentário excluído com sucesso." };
  } catch (error) {
    console.error("Erro ao excluir comentário:", error);
    throw error;
  } 
}


// ********************* DENUNCIAS ********************* //
async function registrarDenuncia(tipo, evento_id, usuario_denunciado_id, usuario_denunciador_id, motivo) {
  const conn = await connect(); // Sua função de conexão com o MySQL
  let sql, values;

  try {
    // Verificar se já existe denúncia para o mesmo evento ou usuário com o mesmo denunciador
    if (tipo === "EVENTO") {
      const [existing] = await conn.query(`
        SELECT 1
        FROM denuncias
        WHERE tipo = 'EVENTO' AND evento_id = ? AND usuario_denunciador_id = ?
      `, [evento_id, usuario_denunciador_id]);
      if (existing.length > 0) {
        throw new Error('Você já denunciou este evento.');
      }
    } else if (tipo === "USUARIO") {
      const [existing] = await conn.query(`
        SELECT 1
        FROM denuncias
        WHERE tipo = 'USUARIO' AND usuario_denunciado_id = ? AND usuario_denunciador_id = ?
      `, [usuario_denunciado_id, usuario_denunciador_id]);
      if (existing.length > 0) {
        throw new Error('Você já denunciou este usuário.');
      }
    }
    // Validações iniciais
    if (!["EVENTO", "USUARIO"].includes(tipo)) {
      throw new Error("Tipo de denúncia inválido");
    }
    if (tipo === "EVENTO" && !evento_id) {
      throw new Error("ID do evento é obrigatório para denúncias de evento");
    }
    if (tipo === "USUARIO" && !usuario_denunciado_id) {
      throw new Error("ID do usuário denunciado é obrigatório para denúncias de usuário");
    }
    if (!usuario_denunciador_id) {
      throw new Error("ID do usuário denunciador é obrigatório");
    }
    if (tipo === "USUARIO" && usuario_denunciador_id === usuario_denunciado_id) {
      throw new Error("Você não pode denunciar a si mesmo");
    }

    // Verifica se o evento ou usuário denunciado existe
    if (tipo === "EVENTO") {
      const [evento] = await conn.query("SELECT id FROM evento WHERE id = ?", [evento_id]);
      if (evento.length === 0) {
        throw new Error("Evento não encontrado");
      }
    } else {
      const [usuario] = await conn.query("SELECT id FROM usuario WHERE id = ?", [usuario_denunciado_id]);
      if (usuario.length === 0) {
        throw new Error("Usuário denunciado não encontrado");
      }
    }

    // Verifica se o denunciador existe
    const [denunciador] = await conn.query("SELECT id FROM usuario WHERE id = ?", [usuario_denunciador_id]);
    if (denunciador.length === 0) {
      throw new Error("Usuário denunciador não encontrado");
    }

    // Monta a query de inserção
    sql = "INSERT INTO denuncias (tipo, evento_id, usuario_denunciado_id, usuario_denunciador_id, motivo, data_denuncia) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)";
    values = [
      tipo,
      tipo === "EVENTO" ? evento_id : null,
      tipo === "USUARIO" ? usuario_denunciado_id : null,
      usuario_denunciador_id,
      motivo || null,
    ];

    // Executa a inserção
    const [result] = await conn.query(sql, values);
    if (result.affectedRows === 0) {
      throw new Error("Falha ao registrar denúncia");
    }

    // Registrar na auditoria
    await conn.query(`
      INSERT INTO auditoria_denuncias (denuncia_id, tipo, evento_id, usuario_denunciado_id, usuario_denunciador_id, motivo, data_denuncia, status, acao)
      VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, 'PENDENTE', 'CRIADA')
    `, [result.insertId, tipo, tipo === "EVENTO" ? evento_id : null, tipo === "USUARIO" ? usuario_denunciado_id : null, usuario_denunciador_id, motivo || null]);

    console.log("Denúncia registrada com sucesso!");
  } catch (error) {
    console.log("Erro ao registrar denúncia:", error);
    throw error;
  } 
}

// Função para consultar denúncias de um usuário específico (para especificar o motivo etc)
async function consultaDenunciasUsuario(usuarioId) {
  const conn = await connect();
  try {
    console.log(`Consultando denúncias para usuário ID ${usuarioId}...`);
    const [rows] = await conn.query(`
      SELECT DISTINCT d.motivo, d.data_denuncia, d.usuario_denunciado_id, u.nome_completo AS denunciador
      FROM denuncias d
      LEFT JOIN usuario u ON d.usuario_denunciador_id = u.id
      WHERE d.tipo = 'USUARIO' AND d.usuario_denunciado_id = ?
      AND d.status = 'PENDENTE'
      ORDER BY d.data_denuncia DESC
    `, [usuarioId]);
    console.log('Denúncias encontradas:', rows);
    return rows;
  } catch (error) {
    console.error('Erro ao buscar denúncias:', error);
    throw error;
  }
}

// Função para consultar denúncias de um evento específico
async function consultaDenunciasEvento(eventoId) {
  const conn = await connect();
  try {
    console.log(`Consultando denúncias para evento ID ${eventoId}...`);
    // DISTINC para evitar duplicadas
    const [rows] = await conn.query(`
      SELECT DISTINCT d.motivo, d.data_denuncia, d.evento_id, u.nome_completo AS denunciador
      FROM denuncias d
      LEFT JOIN usuario u ON d.usuario_denunciador_id = u.id
      WHERE d.tipo = 'EVENTO' AND d.evento_id = ? AND d.status = 'PENDENTE'
      ORDER BY d.data_denuncia DESC
    `, [eventoId]);
    console.log('Denúncias encontradas:', rows);
    return rows;
  } catch (error) {
    console.error('Erro ao buscar denúncias:', error);
    throw error;
  }
}

// Função para consultar eventos denunciados geral
async function consultarEventosDenunciados() {
  const conn = await connect();
  try {
    const sql = `
      SELECT e.*, u.nome_completo AS nome_usuario, c.nomeCidade AS nome_cidade,
             TIME_FORMAT(e.inicio, '%H:%i') AS inicio_formatado,
             TIME_FORMAT(e.fim, '%H:%i') AS fim_formatado,
             (SELECT COUNT(*) FROM inscricao i WHERE i.evento_id = e.id) AS total_inscritos
      FROM evento e
      JOIN usuario u ON e.id_usuario = u.id
      JOIN cidade c ON e.id_cidade = c.id
      INNER JOIN denuncias d ON e.id = d.evento_id AND d.tipo = 'EVENTO' AND d.status = 'PENDENTE'
      WHERE e.fim >= NOW()
      ORDER BY e.inicio ASC
    `; // Só consulta os com o status PENDENTE
    console.log("Executando consulta de eventos denunciados:", sql);
    const [rows] = await conn.query(sql);
    console.log("Eventos denunciados encontrados:", rows);
    return rows;
  } catch (error) {
    console.error("Erro ao consultar eventos denunciados:", error);
    throw error;
  } 
}

// A consulta de usuários denunciados é a mesma que a de usuários, mas com o filtro de denúncias pendentes, lá em cima antes do separador de denuncias

// Função para ignorar denúncias de um usuário específico
// Atualiza o status das denúncias para 'IGNORADO'
async function ignorarDenunciasUsuario(usuarioId) {
  const conn = await connect();
  try {
    // Obter denúncias pendentes
    const [denuncias] = await conn.query(`
      SELECT id, tipo, usuario_denunciado_id, usuario_denunciador_id, motivo, data_denuncia
      FROM denuncias
      WHERE tipo = 'USUARIO' AND usuario_denunciado_id = ? AND status = 'PENDENTE'
    `, [usuarioId]);

    if (denuncias.length === 0) {
      console.log(`Nenhuma denúncia pendente encontrada para usuário ID ${usuarioId}`);
      return 0; // Nenhuma denúncia para ignorar
    }

    console.log(`Ignorando denúncias para usuário ID ${usuarioId}...`);
    const [result] = await conn.query(`
      UPDATE denuncias
      SET status = 'IGNORADO'
      WHERE tipo = 'USUARIO'
        AND usuario_denunciado_id = ?
        AND status = 'PENDENTE'
    `, [usuarioId]);
    console.log('Denúncias ignoradas:', result.affectedRows);

    // Registrar na auditoria
    for (const denuncia of denuncias) {
      await conn.query(`
        INSERT INTO auditoria_denuncias (denuncia_id, tipo, usuario_denunciado_id, usuario_denunciador_id, motivo, data_denuncia, status, acao)
        VALUES (?, ?, ?, ?, ?, ?, 'IGNORADO', 'IGNORADA')
      `, [denuncia.id, denuncia.tipo, denuncia.usuario_denunciado_id, denuncia.usuario_denunciador_id, denuncia.motivo, denuncia.data_denuncia]);
    }

    return result.affectedRows;
  } catch (error) {
    console.error('Erro ao ignorar denúncias:', error);
    throw error;
  } 
}

// Função para ignorar denuncias de um evento específico
async function ignorarDenunciasEvento(eventoId) {
  const conn = await connect();
  try {
    // Obter denúncias pendentes
    const [denuncias] = await conn.query(`
      SELECT id, tipo, usuario_denunciado_id, usuario_denunciador_id, motivo, data_denuncia
      FROM denuncias
      WHERE tipo = 'USUARIO' AND usuario_denunciado_id = ? AND status = 'PENDENTE'
    `, [usuarioId]);

    if (denuncias.length === 0) {
      console.log(`Nenhuma denúncia pendente encontrada para usuário ID ${usuarioId}`);
      return 0; // Nenhuma denúncia para ignorar
    }

    console.log(`Ignorando denúncias para evento ID ${eventoId}...`);
    const [result] = await conn.query(`
      UPDATE denuncias
      SET status = 'IGNORADO'
      WHERE tipo = 'EVENTO'
        AND evento_id = ?
        AND status = 'PENDENTE'
    `, [eventoId]);
    console.log('Denúncias ignoradas:', result.affectedRows);

    // Registrar na auditoria
    for (const denuncia of denuncias) {
      await conn.query(`
        INSERT INTO auditoria_denuncias (denuncia_id, tipo, evento_id, usuario_denunciador_id, motivo, data_denuncia, status, acao)
        VALUES (?, ?, ?, ?, ?, ?, 'IGNORADO', 'IGNORADA')
      `, [denuncia.id, denuncia.tipo, denuncia.evento_id, denuncia.usuario_denunciador_id, denuncia.motivo, denuncia.data_denuncia]);
    }

    return result.affectedRows;
  } catch (error) {
    console.error('Erro ao ignorar denúncias:', error);
    throw error;
  } 
}

// Exporta todas as funções como um módulo
module.exports = {consultaCidadeporUF,
                  consultaCidade,
                  login,
                  cadastrarUsuario,        
                  alterarUsuario,
                  cadastrarPet,
                  consultaPetPorId,
                  consultaPetPorDono,
                  alterarPet,
                  criarEvento,
                  consultarEventos,
                  consultarEventosCriados,
                  consultarEventosInscritos,
                  removerInscricao,
                  inscreverUsuario,
                  alterarEvento,
                  excluirEvento,
                  buscarUsuarioPorEmail,
                  deletarPet,
                  consultaUsuarioPorId,
                  consultaPetsPorUsuario,
                  adicionarComentario,
                  consultarComentarios,
                  excluirComentario,
                  editarComentario,
                  consultarInscritos, 
                  buscarAdminPorEmail,
                  consultaUsuarios,
                  cadastrarAdmin,
                  consultarAdmins,
                  excluirAdmin,
                  alterarAdmin,
                  excluirUsuario,
                  excluirEventoAdm,
                  excluirComentarioAdm,
                  registrarDenuncia,
                  consultaDenunciasUsuario,
                  consultaDenunciasEvento,
                  consultarEventosDenunciados,
                  ignorarDenunciasUsuario,
                  ignorarDenunciasEvento,
                                
};