
import { useEffect, useState } from 'react';
export default function Home() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api')
      .then((res) => res.json())
      .then((data) => setMessage(data.message));
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Home</h1>
      <p>Welcome to the Home page!</p>
      <p>Message from backend: {message}</p>
    </div>
  );
}








/* 
SHOW CREATE TABLE nome_tabela 

SELECT * FROM nome_tabela

ALTER TABLE nome_da_tabela
ADD nome_da_coluna tipo_de_dado [restrições];
ex:
ALTER TABLE usuario
ADD telefone VARCHAR(15) NOT NULL DEFAULT '';

ALTER TABLE nome_da_tabela
ADD nome_da_coluna tipo_de_dado [restrições] AFTER coluna_existente;
ex:
ALTER TABLE usuario
ADD telefone VARCHAR(15) NULL AFTER email;

ALTER TABLE usuario
ADD cpf VARCHAR(14) NOT NULL DEFAULT '000.000.000-00' AFTER nome_completo;

async function cadastrarUsuario(nome_completo, email, genero, data_nascimento, uf, id_cidade, senha, telefone, cpf) {
    const conn = await connect();
    const sql = "INSERT INTO usuario (nome_completo, cpf, email, genero, data_nascimento, uf, id_cidade, senha, telefone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
    const senhaHash = await bcrypt.hash(senha, 10);
    const values = [nome_completo, cpf || '000.000.000-00', email, genero, data_nascimento, uf, id_cidade, senhaHash, telefone || null];
    try {
        const [result] = await conn.query(sql, values);
        return result.insertId;
    } catch (error) {
        throw error;
    }
}

<div className="mb-4">
    <label className="block text-gray-700">CPF</label>
    <input
        type="text"
        name="cpf"
        value={formData.cpf}
        onChange={handleChange}
        className="w-full p-2 border rounded"
        placeholder="000.000.000-00"
        required
    />
</div>


import InputMask from 'react-input-mask';

<div className="mb-4">
    <label className="block text-gray-700">CPF</label>
    <InputMask
        mask="999.999.999-99"
        name="cpf"
        value={formData.cpf}
        onChange={handleChange}
        className="w-full p-2 border rounded"
        placeholder="000.000.000-00"
        required
    />
</div>


ALTER TABLE evento
ADD cep VARCHAR(9) NULL AFTER numero;

<div>
                  <label className="block text-gray-700 mb-2">
                    CEP
                  </label>
                  <input
                    type="text"
                    name="cep"
                    value={formData.cep}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md"
                    placeholder="12345-678"
                    maxLength="9"
                  />
                </div>

                const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem("");
    setErro("");

    if (
      !formData.nome ||
      !formData.data_inicio ||
      !formData.hora_inicio ||
      !formData.data_fim ||
      !formData.hora_fim ||
      !formData.uf ||
      !formData.id_cidade ||
      !formData.bairro ||
      !formData.rua ||
      !formData.numero ||
      !formData.descricao ||
      (formData.cep && !/^\d{5}-\d{3}$/.test(formData.cep)) // NOVO: Validação do formato do CEP
    ) {
      setErro("Por favor, preencha todos os campos obrigatórios corretamente.");
      return;
    }

    <strong>Local:</strong> {eventoSelecionado.rua}, {eventoSelecionado.numero}
                  {eventoSelecionado.cep ? `, CEP: ${eventoSelecionado.cep}` : ""} // NOVO: Exibe o CEP
                  {eventoSelecionado.complemento
                    ? `, ${eventoSelecionado.complemento}`
                    : ""}{" "}
                  - {eventoSelecionado.bairro}, {eventoSelecionado.nome_cidade},{" "}
                  {eventoSelecionado.uf}
*/


