import React, { useState } from 'react';
import logo from '/logo.png'; // Importe a imagem

function CadastroPet() {
  const [idade, setIdade] = useState('');
  const [unidadeIdade, setUnidadeIdade] = useState('anos');
  const [mostrarModalSucesso, setMostrarModalSucesso] = useState(false);

  // Atualizar a unidade de idade (Ano/Anos ou Mês/Meses) conforme o valor digitado
  const handleIdadeChange = (event) => {
    const valor = event.target.value.replace(/\D/g, ''); // Remove tudo que não é número
    if (valor.length <= 2) {
      setIdade(valor);
    }
  };

  const handleUnidadeIdadeChange = (event) => {
    setUnidadeIdade(event.target.value);
  };

  // Validar formulário ao enviar
  const handleSubmit = (event) => {
    event.preventDefault();

    // Validar idade (deve ter exatamente 1 ou 2 números)
    if (!/^\d{1,2}$/.test(idade)) {
      alert('A idade deve conter no máximo 2 números.'); // Alerta se a idade não for válida
      return;
    }

    // Se tudo estiver válido, mostra o modal de sucesso
    setMostrarModalSucesso(true);
    setTimeout(() => {
      window.location.href = '/login'; // Redireciona para a tela de login
    }, 3000); // 3 segundos de espera
  };

  return (
    <div className="min-h-screen flex">
      {/* Lado esquerdo: Imagem */}
      <div
        className="w-3/5 bg-cover bg-center"
        style={{ backgroundImage: `url(${logo})` }} // Use a imagem importada
      ></div>

      {/* Lado direito: Formulário de Cadastro Pet */}
      <div className="w-2/5 flex items-center justify-center bg-white">
        <div className="w-full max-w-md p-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Cadastro Pet</h2>

          {/* Formulário */}
          <form id="cadastroPetForm" onSubmit={handleSubmit}>
            {/* Campo de Foto do Pet */}
            <div className="mb-4">
              <label htmlFor="fotoPet" className="block text-sm font-medium text-gray-700">
                Foto do Pet
              </label>
              <input
                type="file"
                id="fotoPet"
                name="fotoPet"
                accept="image/*"
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-600 hover:file:bg-red-100"
                required
              />
            </div>

            {/* Campo de Gênero do Pet */}
            <div className="mb-4">
              <label htmlFor="generoPet" className="block text-sm font-medium text-gray-700">
                Gênero
              </label>
              <select
                id="generoPet"
                name="generoPet"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                required
              >
                <option value="" disabled selected>
                  Selecione o gênero
                </option>
                <option value="macho">Macho</option>
                <option value="femea">Fêmea</option>
              </select>
            </div>

            {/* Campo de Idade do Pet com Seleção de Ano/Anos ou Mês/Meses */}
            <div className="mb-4">
              <label htmlFor="idade" className="block text-sm font-medium text-gray-700">
                Idade
              </label>
              <div className="grid grid-cols-2 gap-4">
                {/* Campo de Idade (input) */}
                <div>
                  <input
                    type="text"
                    id="idade"
                    name="idade"
                    placeholder="Digite a idade"
                    value={idade}
                    onChange={handleIdadeChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                    required
                  />
                </div>
                {/* Campo de Seleção (Ano/Anos ou Mês/Meses) */}
                <div>
                  <select
                    id="unidadeIdade"
                    name="unidadeIdade"
                    value={unidadeIdade}
                    onChange={handleUnidadeIdadeChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                    required
                  >
                    <option value="anos">{idade === '1' ? 'Ano' : 'Anos'}</option>
                    <option value="meses">{idade === '1' ? 'Mês' : 'Meses'}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Campo de Porte do Pet */}
            <div className="mb-4">
              <label htmlFor="portePet" className="block text-sm font-medium text-gray-700">
                Porte
              </label>
              <select
                id="portePet"
                name="portePet"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                required
              >
                <option value="" disabled selected>
                  Selecione o porte
                </option>
                <option value="pequeno">Pequeno</option>
                <option value="medio">Médio</option>
                <option value="grande">Grande</option>
              </select>
            </div>

            {/* Campo de Raça do Pet */}
            <div className="mb-6">
              <label htmlFor="racaPet" className="block text-sm font-medium text-gray-700">
                Raça
              </label>
              <input
                type="text"
                id="racaPet"
                name="racaPet"
                placeholder="Digite a raça"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                required
              />
            </div>

            {/* Botão de Salvar */}
            <button
              type="submit"
              className="w-full bg-red-400 text-white py-2 px-4 rounded-md hover:bg-red-300 focus:outline-none focus:ring-2 focus:ring-red-300"
            >
              Salvar
            </button>
          </form>
        </div>
      </div>

      {/* Modal de Sucesso */}
      {mostrarModalSucesso && (
        <div id="modalSucessoPet" className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <h3 className="text-2xl font-bold text-green-600 mb-4">Salvo com sucesso!</h3>
            <p className="text-gray-700">O cadastro do pet foi concluído.</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default CadastroPet;