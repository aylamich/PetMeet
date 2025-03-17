import React, { useState } from 'react';
import logo from '/logo.png'; // Importe a imagem

function Cadastro() {
  const [senhaErro, setSenhaErro] = useState('');
  const [mostrarRequisitosSenha, setMostrarRequisitosSenha] = useState(false);
  const [mostrarModalSucesso, setMostrarModalSucesso] = useState(false);

  const handleNomeCompletoChange = (event) => {
    // Impede que o usuário digite números no campo de nome completo
    event.target.value = event.target.value.replace(/\d/g, '');
  };

  const handleSenhaFocus = () => {
    setMostrarRequisitosSenha(true);
  };

  const handleSenhaBlur = () => {
    if (!senhaErro) {
      setMostrarRequisitosSenha(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    // Limpar mensagens de erro anteriores
    setSenhaErro('');

    // Validar senha
    const senha = event.target.senha.value;
    const regexSenha = /^(?=.*[A-Z])(?=.*\d).{6,}$/; // Requisitos da senha: 1 letra maiúscula, 1 número e no mínimo 6 caracteres
    if (!regexSenha.test(senha)) {
      setSenhaErro('A senha não atende aos requisitos.');
      return;
    }

    // Se tudo estiver válido, mostra o modal e redireciona para o usuário realizar o login
    setMostrarModalSucesso(true);
    setTimeout(() => {
      window.location.href = '/cadastropet'; // Redireciona para a tela de cadastro de pet
    }, 3000); // 3 segundos de espera
  };

  return (
    <div className="min-h-screen flex">
      {/* Lado esquerdo: Imagem */}
      <div
        className="w-3/5 bg-cover bg-center"
        style={{ backgroundImage: `url(${logo})` }} // Use a imagem importada
      ></div>

      {/* Lado direito: Formulário de Cadastro */}
      <div className="w-2/5 flex items-center justify-center bg-white">
        <div className="w-full max-w-md p-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Cadastro</h2>

          {/* Formulário */}
          <form id="cadastroForm" onSubmit={handleSubmit}>
            {/* Campo de Nome Completo */}
            <div className="mb-4">
              <label htmlFor="nomeCompleto" className="block text-sm font-medium text-gray-700">
                Nome Completo
              </label>
              <input
                type="text"
                id="nomeCompleto"
                name="nomeCompleto"
                placeholder="Digite seu nome completo"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                onChange={handleNomeCompletoChange}
                required
              />
            </div>

            {/* Campo de Email */}
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Digite seu email"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                required
              />
            </div>

            {/* Campo de Gênero */}
            <div className="mb-4">
              <label htmlFor="genero" className="block text-sm font-medium text-gray-700">
                Gênero
              </label>
              <select
                id="genero"
                name="genero"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                required
              >
                <option value="" disabled selected>
                  Selecione seu gênero
                </option>
                <option value="feminino">Feminino</option>
                <option value="masculino">Masculino</option>
              </select>
            </div>

            {/* Campo de Data de Nascimento */}
            <div className="mb-4">
              <label htmlFor="dataNascimento" className="block text-sm font-medium text-gray-700">
                Data de Nascimento
              </label>
              <input
                type="date"
                id="dataNascimento"
                name="dataNascimento"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                required
              />
            </div>

            {/* Campo de Cidade */}
            <div className="mb-4">
              <label htmlFor="cidade" className="block text-sm font-medium text-gray-700">
                Cidade
              </label>
              <select
                id="cidade"
                name="cidade"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                required
              >
                <option value="" disabled selected>
                  Selecione sua cidade
                </option>
                {/* Opções de cidade podem ser adicionadas dinamicamente */}
              </select>
            </div>

            {/* Campo de Estado */}
            <div className="mb-4">
              <label htmlFor="estado" className="block text-sm font-medium text-gray-700">
                Estado
              </label>
              <select
                id="estado"
                name="estado"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                required
              >
                <option value="" disabled selected>
                  Selecione seu estado
                </option>
                {/* Opções de estado podem ser adicionadas dinamicamente */}
              </select>
            </div>

            {/* Campo de Senha */}
            <div className="mb-6">
              <label htmlFor="senha" className="block text-sm font-medium text-gray-700">
                Senha
              </label>
              <input
                type="password"
                id="senha"
                name="senha"
                placeholder="Digite sua senha"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                onFocus={handleSenhaFocus}
                onBlur={handleSenhaBlur}
                required
              />

              {/* Mensagem de erro da senha */}
              {senhaErro && <p className="text-sm text-red-500 mt-2">{senhaErro}</p>}

              {/* Requisitos da senha */}
              {mostrarRequisitosSenha && (
                <div id="senhaRequisitos" className="text-sm text-red-500 mt-2">
                  <p>A senha deve ter:</p>
                  <ul className="list-disc list-inside">
                    <li>No mínimo 6 caracteres</li>
                    <li>Pelo menos 1 letra maiúscula</li>
                    <li>Pelo menos 1 número</li>
                  </ul>
                </div>
              )}
            </div>

            {/* Botão de Próximo */}
            <button
              type="submit"
              className="w-full bg-red-400 text-white py-2 px-4 rounded-md hover:bg-red-300 focus:outline-none focus:ring-2 focus:ring-red-300"
            >
              Próximo
            </button>
          </form>
        </div>
      </div>

      {/* Modal de Sucesso */}
      {mostrarModalSucesso && (
        <div id="modalSucesso" className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <h3 className="text-2xl font-bold text-green-600 mb-4">Salvo com sucesso!</h3>
            <p className="text-gray-700">Você será redirecionado para a tela de login.</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cadastro;