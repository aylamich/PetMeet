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
    let sql = "SELECT e.*, u.nome_completo AS nome_usuario FROM evento e JOIN usuario u ON e.id_usuario = u.id WHERE 1=1";
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
      sql += " AND e.raca = ?";
      values.push(filtro.raca);
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
        SELECT e.*, u.nome_completo AS nome_usuario
        FROM evento e
        JOIN usuario u ON e.id_usuario = u.id
        WHERE e.id_usuario = ?
    `;
    const values = [id_usuario];

    try {
        const [rows] = await conn.query(sql, values);
        console.log('Eventos consultados com sucesso!');
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
  } finally {
    await conn.end();
  }
}

async function consultarEventosInscritos(usuario_id, filtro) {
  const conn = await connect();
  let sql;
  const values = [usuario_id];

  if (filtro === "em_breve") {
    sql = `
      SELECT e.*, u.nome_completo AS nome_usuario
      FROM evento e
      JOIN inscricao i ON e.id = i.evento_id
      JOIN usuario u ON e.id_usuario = u.id
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


async function alterarEvento(id_evento, foto, nome, inicio, fim, uf, id_cidade, bairro, rua, numero, descricao, complemento = null, raca = null, porte = 'Geral', sexo = 'Geral') {
    const conn = await connect();
    const sql ="UPDATE evento SET foto = ?, nome = ?, inicio = ?, fim = ?, uf = ?, id_cidade = ?, bairro = ?, rua = ?, numero = ?, descricao = ?, complemento = ?, raca = ?, porte = ?, sexo = ? WHERE  id = ? ";
    
    const values = [ foto, nome, inicio, fim, uf, id_cidade, bairro, rua, numero, descricao, complemento, raca, porte, sexo, id_evento ];

    await conn.query(sql, values)
        .then(() => console.log('Evento atualizado com sucesso!'))
        .catch(error => console.error('Erro ao atualizar evento:', error))
}

async function excluirEvento(id) {
    const conn = await connect();
    const sql = "DELETE FROM evento WHERE id = ?";
    
    await conn.query(sql, [id])
        .then(([result]) => {
            if (result.affectedRows > 0) {
                console.log('Evento excluído com sucesso!');
            } else {
                console.log('Nenhum evento encontrado com esse ID.');
            }
        })
        .catch(error => console.error('Erro ao excluir evento:', error))
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
                  inscreverUsuario,
                  alterarEvento,
                  excluirEvento,
                  buscarUsuarioPorEmail,
                  deletarPet,
                  consultaUsuarioPorId,
                  consultaPetsPorUsuario,
                  

                  
                
};