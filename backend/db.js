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

async function cadastrarUsuario(nome_completo, email, genero, data_nascimento, uf, id_cidade, senha) {    
    const conn = await connect();
    const sql = "INSERT INTO usuario (nome_completo, email, genero, data_nascimento, uf, id_cidade, senha) VALUES (?, ?, ?, ?, ?, ?)";
    
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
}

async function alterarUsuario(usuario_id, nome_completo, email, genero, data_nascimento, uf, id_cidade) {
    const conn = await connect();
    const sql = "UPDATE usuario SET nome_completo = ?, email = ?, genero = ?, data_nascimento = ?, uf = ?, id_cidade = ? WHERE id = ?";
    
    const values = [usuario_id, nome_completo, email, genero, data_nascimento, uf, id_cidade];
    console.log(sql, values);
    await conn.execute(sql, values)
        .then(() => console.log('Usuário atualizado com sucesso!'))
        .catch(error => console.error('Erro ao atualizar usuário:', error))
}

/*async function consultaUsuarioPorId(id) {
    const conn = await connect();
    const sql = "SELECT * FROM usuario WHERE id = ?";
    let resultado = await conn.query(sql, [id]);
    return resultado[0]; // Retorna apenas o primeiro registro (o usuário específico)
}*/

/*async function consultaCliente(paginaAtual, registrosPorPagina){    

    const conn = await connect();
    let sql = `
                SELECT 
                    c.id AS id, 
                    c.nomeCompleto AS nomeCompleto, 
                    c.contato AS contato, 
                    c.email AS email, 
                    c.rua AS rua, 
                    c.numero AS numero, 
                    c.bairro AS bairro, 
                    c.cep AS cep, 
                    c.uf AS uf, 
                    ci.id AS idCidade, 
                    ci.nomeCidade AS nomeCidade 
                FROM 
                    Cliente c, 
                    cidade ci 
                WHERE 
                    c.idCidade = ci.id 
                    
                ORDER BY 
                    TRIM(c.nomeCompleto) ASC`;    ;

        let values = [];            
        if (paginaAtual != null && registrosPorPagina != null) {
            sql += ' LIMIT ? OFFSET ?';
            values = [registrosPorPagina, paginaAtual];
        }        

    let resultado = await conn.query(sql, values);
    //console.log(paginaAtual);''
    //console.log(registrosPorPagina);
    return resultado;
}
*/


async function cadastrarPet(usuario_id, foto, nome, sexo, idade, porte, raca = null) {
    const conn = await connect();
    const sql = "INSERT INTO pet (usuario_id, foto, nome, sexo, idade, porte, raca)  VALUES (?, ?, ?, ?, ?, ?, ?)";
    
    const values = [usuario_id, foto, nome, sexo, idade, porte, raca];
    
    await conn.query(sql, values)
        .then(() => {
            console.log('Pet cadastrado com sucesso!');
        })
        .catch((error) => {
            console.error('Erro ao cadastrar pet:', error);
        })
       
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


/*async function excluirAnimal(id){    
   
    try {
        const conn = await connect();
        const sql = "DELETE FROM Animal WHERE id = ?"; 

        const values = [id];
        //console.log(sql, values);
        await conn.execute(sql, values);                    
    } catch (error) {
        console.log('ERRO DO SQL####:', error.errno);
        throw error;
    }
}*/

async function alterarPet(id_pet, usuario_id, foto, nome, sexo, idade, porte, raca) {
    const conn = await connect();
    const sql = "UPDATE pet SET usuario_id = ?, foto = ?, nome = ?, sexo = ?, idade = ?, porte = ?, raca = ? WHERE id = ?";
    
   
    const values = [usuario_id, foto, nome, sexo, idade, porte, raca, id_pet];
    
    await conn.execute(sql, values)
        .then(() => console.log('Pet atualizado com sucesso!'))
        .catch(error => {
            console.error('Erro ao atualizar pet:', error);
            throw error; 
        })
}



async function criarEvento(foto, nome_evento, inicio, fim, uf, id_cidade, bairro, rua, numero, descricao, porte = 'Geral', sexo = 'Geral', complemento =  null, raca = null) {
    const conn = await connect();
    const sql ="INSERT INTO evento (foto, nome, inicio, fim, uf, id_cidade, bairro, rua, numero, descricao, porte, sexo, complemento, raca)    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    const values = [foto, nome_evento, inicio, fim, uf, id_cidade, bairro, rua, numero, descricao, porte, sexo, complemento, raca ];
    
    await conn.query(sql, values)
        .then(() => console.log('Evento criado!'))
        .catch(error => console.error('Erro:', error))
}

/*async function consultarEventoPorId(id) {
    const conn = await connect();
    const [rows] = await conn.query("SELECT * FROM evento WHERE id = ?", [id]);
    conn.end();
    return rows[0] || null; // Retorna o evento ou null se não existir

async function consultarEventosComCidade(filtro = {}) {
    const conn = await connect();
    const [rows] = await conn.query(`
        SELECT 
            e.*, 
            c.nome AS cidade_nome 
        FROM 
            evento e
        JOIN 
            cidade c ON e.id_cidade = c.id
        WHERE
            ${filtro.id ? 'e.id = ?' : '1=1'}
        ORDER BY e.inicio ASC
    `, filtro.id ? [filtro.id] : []);
    
    conn.end();
    return rows;
}    
}*/


async function consultarEventos(filtro = {}) {
    const conn = await connect();
    
    // Monta a query dinamicamente baseada nos filtros
    let sql = "SELECT * FROM evento WHERE 1=1";
    const values = [];
    
    // Filtros opcionais
    if (filtro.id) {
        sql += " AND id = ?";
        values.push(filtro.id);
    }
    if (filtro.uf) {
        sql += " AND uf = ?";
        values.push(filtro.uf);
    }
    if (filtro.id_cidade) {
        sql += " AND id_cidade = ?";
        values.push(filtro.id_cidade);
    }
    if (filtro.porte) {
        sql += " AND porte = ?";
        values.push(filtro.porte);
    }
    if (filtro.sexo) {
        sql += " AND sexo = ?";
        values.push(filtro.sexo);
    }
    if (filtro.data_inicio) {
        sql += " AND inicio >= ?";
        values.push(filtro.data_inicio);
    }

    // Ordenação padrão por data de início
    sql += " ORDER BY inicio ASC";

    try {
        const [rows] = await conn.query(sql, values);
        return rows;
    } catch (error) {
        console.error('Erro ao consultar eventos:', error);
        throw error;
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
                  alterarEvento,
                  excluirEvento,

                  
                
};