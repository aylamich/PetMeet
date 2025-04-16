const bcrypt = require('bcrypt');

async function connect(){

    if(global.connection && global.connection.state != 'disconnected' ){
        return global.connection;
    }

    const mysql = require('mysql2/promise');
    const connection =  await mysql.createConnection("mysql://root:admin@localhost:3306/bdpetmeet");
 

    console.log("Conectou no MYSQL!");
    global.connection = connection;
    
 
    return connection;

}

connect();

async function login(usuario, senha) {
    const conn = await connect();
    const sql = "SELECT email, senha FROM usuario WHERE email = ? AND senha = ?";
    const values = [usuario, senha];
    const [rows] = await conn.query(sql, values);
    return rows;
}


async function buscarUsuarioPorEmail(email) {
    const conn = await connect();
    try {
      const [rows] = await conn.query(
        "SELECT id, nome_completo, email, senha FROM usuario WHERE email = ?", 
        [email]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('Erro ao buscar usuário por email:', error);
      throw error; // Lança o erro para ser tratado na rota
    }
  } 

/*async function cadastrarUsuario(nome_completo, email, genero, data_nascimento, uf, id_cidade, senha) {    
    const conn = await connect();
    const sql = "INSERT INTO usuario (nome_completo, email, genero, data_nascimento, uf, id_cidade, senha) VALUES (?, ?, ?, ?, ?, ?, ?)";
    
    const senhaHash = await bcrypt.hash(senha, 10); // criptografando a senha com bcrypt
    console.log(senhaHash);
    const values = [nome_completo, email, genero, data_nascimento, uf, id_cidade, senhaHash];
    
    await conn.query(sql, values)
        .then(() => {
            console.log('Usuário cadastrado com sucesso!');
        })
        .catch((error) => {
            console.error('Erro ao cadastrar usuário:', error);
        })

    const [result] = await conn.query(sql, values); // Desestrutura para pegar o resultado
    console.log('Usuário cadastrado com sucesso! ID:', result.insertId);
    return result.insertId; // Retorna o ID do usuário recém-criado    
}*/

async function cadastrarUsuario(nome_completo, email, genero, data_nascimento, uf, id_cidade, senha) {    
    const conn = await connect();
    const sql = "INSERT INTO usuario (nome_completo, email, genero, data_nascimento, uf, id_cidade, senha) VALUES (?, ?, ?, ?, ?, ?, ?)";
    const senhaHash = await bcrypt.hash(senha, 10);
    const values = [nome_completo, email, genero, data_nascimento, uf, id_cidade, senhaHash];
    
    try {
      const [result] = await conn.query(sql, values);
      console.log('Usuário cadastrado com sucesso! ID:', result.insertId);
      return result.insertId;
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        console.log('Erro: Email já cadastrado:', email);
        throw new Error('Este email já está cadastrado.');
      }
      console.error('Erro ao cadastrar usuário:', error);
      throw error; // Propaga o erro com detalhes
    //} finally {
     // await conn.end();
    }
  }


  async function consultaUsuarioPorId(id) {
    const conn = await connect();
    try {
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
        
        if (rows.length === 0) return null;
        
        return rows[0];
    } catch (error) {
        console.error('Erro ao buscar usuário por ID:', error);
        throw error;
    }
}


async function alterarUsuario(usuario_id, nome_completo, email, genero, data_nascimento, uf, id_cidade, senha) {
    const conn = await connect();
    try {
      const sql = `
        UPDATE usuario 
        SET nome_completo = ?, email = ?, genero = ?, data_nascimento = ?, uf = ?, id_cidade = ?
        ${senha ? ', senha = ?' : ''} 
        WHERE id = ?
      `;
      const hashedSenha = senha ? await bcrypt.hash(senha, 10) : undefined;
      const values = senha
        ? [nome_completo, email, genero, data_nascimento, uf, id_cidade, hashedSenha, usuario_id]
        : [nome_completo, email, genero, data_nascimento, uf, id_cidade, usuario_id];
  
      console.log(sql, values);
      await conn.execute(sql, values);
      console.log('Usuário atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw error;
    } 
  }
  

/*async function cadastrarPet(usuario_id, foto, nome, sexo, idade, porte, raca = null) {
    const conn = await connect();
    const sql = "INSERT INTO pet (usuario_id, foto, nome, sexo, idade, porte, raca)  VALUES (?, ?, ?, ?, ?, ?, ?)";
    
    const values = [usuario_id, foto, nome, sexo, idade, porte, raca];
    
    await conn.query(sql, values)
        .then(() => {
            console.log('Pet cadastrado com sucesso!');
        })
        .catch((error) => {
            console.error('Erro ao cadastrar pet:', error);
            throw error; // Lança o erro para ser tratado na rota
        })
       
}*/

async function cadastrarPet(usuario_id, foto, nome, sexo, data_nascimento, porte, raca = null) {
    const conn = await connect();
    const sql = "INSERT INTO pet (usuario_id, foto, nome, sexo, data_nascimento, porte, raca) VALUES (?, ?, ?, ?, ?, ?, ?)";
    const values = [usuario_id, foto, nome, sexo, data_nascimento, porte, raca];

    try {
        const [result] = await conn.query(sql, values); // Desestrutura o resultado
        console.log('Pet cadastrado com sucesso! ID:', result.insertId);
        return result.insertId; // Retorna o ID gerado pelo banco
    } catch (error) {
        console.error('Erro ao cadastrar pet:', error);
        throw error; // Lança o erro para ser tratado na rota
    }
}


async function consultaPetPorId(id) {
    const conn = await connect();
    const sql = "SELECT p.id, p.foto, p.nome, p.sexo, p.idade, p.porte, p.raca, u.id AS usuario_id, u.nome_completo AS dono_nome FROM pet p JOIN usuario u ON p.usuario_id = u.id WHERE p.id = ?";
    const [rows] = await conn.query(sql, [id]);
    return rows[0];
}

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
        const [rows] = await conn.query(
            `SELECT id, 
                   CASE WHEN foto IS NOT NULL THEN foto ELSE NULL END as foto,
                    nome, sexo, DATE_FORMAT(data_nascimento, '%Y-%m-%d') as data_nascimento, porte, raca 
             FROM pet 
             WHERE usuario_id = ?`,
            [usuario_id]
          );
        return rows;
    } catch (error) {
        console.error('Erro ao buscar pets por usuário:', error);
        throw error;
    }
}


async function alterarPet(pet_id, nome, sexo, data_nascimento, porte, raca, foto) {
    const conn = await connect();
    try {
      const sql = `
        UPDATE pet 
        SET nome = ?, sexo = ?, data_nascimento = ?, porte = ?, raca = ?, foto = ? 
        WHERE id = ?
      `;
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

async function deletarPet(petId) {
    const conn = await connect();
    const sql = "DELETE FROM pet WHERE id = ?";
    const values = [petId];
  
    try {
      const [result] = await conn.query(sql, values);
      if (result.affectedRows === 0) {
        throw new Error('Pet não encontrado');
      }
      console.log('Pet excluído com sucesso!');
      return { success: true };
    } catch (error) {
      console.error('Erro ao excluir pet:', error);
      throw error;
    } 
}


async function criarEvento( id_usuario, foto, nome_evento, inicio, fim, uf, id_cidade, bairro, rua, numero, descricao, porte = "Geral", sexo = "Geral", complemento = null, raca = null ) {
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
  
  async function consultarEventos(filtro = {}) {
    const conn = await connect();
    let sql = "SELECT e.*, u.nome_completo AS nome_usuario, c.nomeCidade AS nome_cidade, (SELECT COUNT(*) FROM inscricao i WHERE i.evento_id = e.id) AS total_inscritos FROM evento e JOIN usuario u ON e.id_usuario = u.id  JOIN cidade c ON e.id_cidade = c.id WHERE e.fim >= CURRENT_DATE";
    const values = [];
  
    // Filtros 
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
    
    sql += " ORDER BY e.inicio ASC";
  
    try {
      const [rows] = await conn.query(sql, values);
      return rows;
    } catch (error) {
      console.error("Erro ao consultar eventos:", error);
      throw error;
    }
  }

  async function consultarEventosCriados(id_usuario) {
    const conn = await connect();
    const sql = `
        SELECT e.*, u.nome_completo AS nome_usuario, c.nomeCidade AS nome_cidade
        FROM evento e
        JOIN usuario u ON e.id_usuario = u.id
        JOIN cidade c ON e.id_cidade = c.id
        WHERE e.id_usuario = ?
    `;
    const values = [id_usuario];

    try {
        const [rows] = await conn.query(sql, values);
        console.log("Eventos consultados com sucesso! Dados:", rows); // Lo
        //console.log('Eventos consultados com sucesso!');
        return rows;
    } catch (error) {
        console.error('Erro ao consultar eventos:', error);
        throw error;
    }
}

async function inscreverUsuario(usuario_id, evento_id) {
  const conn = await connect();
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

async function consultarEventosInscritos(usuario_id, filtro) {
  const conn = await connect();
  let sql;
  const values = [usuario_id];

  if (filtro === "em_breve") {
    sql = `
      SELECT 
      e.*, 
      u.nome_completo AS nome_usuario,
      c.nomeCidade AS nome_cidade,
      (SELECT COUNT(*) FROM inscricao i2 WHERE i2.evento_id = e.id) AS total_inscritos
      FROM evento e
      JOIN usuario u ON e.id_usuario = u.id
      JOIN inscricao i ON i.evento_id = e.id
      JOIN cidade c ON e.id_cidade = c.id
      WHERE i.usuario_id = ?
      AND e.inicio >= NOW()
      ORDER BY e.inicio ASC
    `;
  } else if (filtro === "ja_aconteceu") {
    sql = `
      SELECT e.*, u.nome_completo AS nome_usuario
      FROM evento e
      JOIN inscricao i ON e.id = i.evento_id
      JOIN usuario u ON e.id_usuario = u.id
      WHERE i.usuario_id = ?
      AND e.inicio < NOW()
      ORDER BY e.inicio DESC
    `;
  } else {
    throw new Error("Filtro inválido");
  }

  try {
    const [rows] = await conn.query(sql, values);
    console.log("Eventos inscritos retornados:", rows.length);
    return rows; // Retorna a lista de eventos
  } catch (error) {
    console.error("Erro ao consultar eventos inscritos:", error);
    throw error; // Lança o erro para ser tratado na rota
  } 
} 

async function removerInscricao(usuario_id, evento_id) {
  const conn = await connect();
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


async function alterarEvento(
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
  porte = "Geral",
  sexo = "Geral",
  complemento = null,
  raca = null
) {
  const conn = await connect();
  let sql = `
    UPDATE evento 
    SET nome = ?, inicio = ?, fim = ?, uf = ?, id_cidade = ?, 
        bairro = ?, rua = ?, numero = ?, descricao = ?, porte = ?, 
        sexo = ?, complemento = ?, raca = ?
  `;
  const values = [
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
  ];

  if (foto) {
    sql += ", foto = ?";
    values.push(foto);
  }

  sql += " WHERE id = ? AND id_usuario = ?";
  values.push(evento_id, id_usuario);

  try {
    const [result] = await conn.query(sql, values);
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

async function excluirEvento(evento_id, id_usuario) {
  const conn = await connect();
  const sql = "DELETE FROM evento WHERE id = ? AND id_usuario = ?";
  const values = [evento_id, id_usuario];

  try {
    const [result] = await conn.query(sql, values);
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
    const [comentarios] = await conn.query(sql, values);
    return comentarios;
  } catch (error) {
    console.error("Erro ao consultar comentários:", error);
    throw error;
  }
}

async function excluirComentario(id_comentario, id_usuario) {
  console.log("Excluindo comentário:", id_comentario, "para usuário:", id_usuario);
  const conn = await connect();
  const sql = `
    DELETE FROM comentarios
    WHERE id = ? AND id_usuario = ?
  `;
  try {
    const [result] = await conn.query(sql, [id_comentario, id_usuario]);
    console.log("Resultado da exclusão:", result);
    if (result.affectedRows === 0) {
      throw new Error("Comentário não encontrado ou não pertence ao usuário.");
    }
    return { message: "Comentário excluído com sucesso." };
  } catch (error) {
    console.error("Erro ao excluir comentário:", error);
    throw error;
  } 
}

async function editarComentario(id_comentario, id_usuario, comentario) {
  console.log("Editando comentário:", id_comentario, "para usuário:", id_usuario);
  const conn = await connect();
  const sql = `
    UPDATE comentarios
    SET comentario = ?
    WHERE id = ? AND id_usuario = ?
  `;
  try {
    const [result] = await conn.query(sql, [comentario, id_comentario, id_usuario]);
    console.log("Resultado da edição:", result);
    if (result.affectedRows === 0) {
      throw new Error("Comentário não encontrado ou não pertence ao usuário.");
    }
    return { message: "Comentário editado com sucesso." };
  } catch (error) {
    console.error("Erro ao editar comentário:", error);
    throw error;
  }
}

async function consultarInscritos(evento_id) {
  console.log("Consultando inscritos para evento_id:", evento_id);
  const conn = await connect();
  const sql = `
    SELECT u.id, u.nome_completo
    FROM inscricao i
    JOIN usuario u ON i.usuario_id = u.id
    WHERE i.evento_id = ?
  `;
  try {
    const [rows] = await conn.query(sql, [evento_id]);
    console.log("Inscritos encontrados:", rows);
    return rows;
  } catch (error) {
    console.error("Erro ao consultar inscritos:", error);
    throw error;
  }
}


async function consultaCidadeporUF(ufSelecionado){
    console.log(`Consultando cidades para UF: ${ufSelecionado}`);
    const conn = await connect();
    const sql = "SELECT * FROM cidade WHERE uf = ?";

    const values = [ufSelecionado];
   // let resultado = await conn.query(sql, values);
    let [rows] = await conn.query(sql, values);
    return rows;
}    


async function consultaCidade() {    
    const conn = await connect();
    const sql = "SELECT * FROM cidade";
    const [rows] = await conn.query(sql, []);
    return rows;
}



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
                  

                  
                
};