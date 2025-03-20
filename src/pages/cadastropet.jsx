import React, { useState } from 'react';
import logo from '/logo.png'; // Importação da logo
function CadastroPet() {
  // Declarações de estados para os campos do formulário
  const [idade, setIdade] = useState(''); // Idade do pet, inicia vazia
  const [unidadeIdade, setUnidadeIdade] = useState('anos'); // Valor padrão: Anos
  const [mostrarModalSucesso, setMostrarModalSucesso] = useState(false); // Modal de Sucesso: Oculto, só mostra quando bem sucedido

  // Atualizar a unidade de idade (Ano/Anos ou Mês/Meses) conforme o valor digitado
  const handleIdadeChange = (event) => {
    const valor = event.target.value.replace(/\D/g, ''); // ReGex que remove tudo que não é número
    if (valor.length <= 2 && valor !== '0' && valor !== '00') { // No máximo 2 números e não pode ser 0 ou 00 !== é diferente de
      setIdade(valor); // Atualiza o estado com o valor filtrado se atendeu aos requisitos, não deixa digitar 0 ou 00 e nem mais de 2 números
    } 
  };

  const handleUnidadeIdadeChange = (event) => {
    setUnidadeIdade(event.target.value); //Para atualizar a unidade de idade (Ano/Anos ou Mês/Meses) conforme o valor digitado
  };

  // Validar formulário ao enviar
  const handleSubmit = (event) => {
    event.preventDefault();  // Evite que a página seja recarregada ao enviar o formulário, para processar dados de formulários sem recarregar a página

    // Validar idade (deve ter exatamente 1 ou 2 números)
    if (!/^\d{1,2}$/.test(idade)) { // RegEx que valida se tem 1 ou 2 números, se não tiver, retorna o alerta
      alert('A idade deve conter no máximo 2 números.'); // Alerta se a idade não for válida
      return;
    }

    // Validar idade (não pode ser 0 ou 00)
    if (idade === '0' || idade === '00') {
      alert('A idade do pet não pode ser 0 ou 00.');
      return;
    }

    // Se tudo estiver válido, mostra o modal de sucesso
    setMostrarModalSucesso(true);
    setTimeout(() => {
      window.location.href = '/login'; // Redireciona para a tela de login
    }, 3000); // 3 segundos de espera
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row"> {/* Responsividade */}
      {/* Lado esquerdo: Imagem */}
      <div
        className="hidden md:block md:w-3/5 bg-cover bg-center" // Oculta em telas pequenas, exibe em telas médias/grandes 3 de 5 blocos
        style={{ backgroundImage: `url(${logo})` }} // Logo PetMeet
      ></div>

      {/* Lado direito: Formulário de Cadastro Pet */}
      <div className="w-full md:w-2/5 flex items-center justify-center bg-white"> {/* Formulário ocupa 2 blocos de 5 em telas grandes e médias (ocupa toda a largura em telas pequenas)*/}
        <div className="w-full max-w-md p-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Cadastro Pet</h2>

          {/* Formulário */}
          <form id="cadastroPetForm" onSubmit={handleSubmit}>
            {/* Campo de Foto do Pet */}
            <div className="mb-4">
              <label htmlFor="fotoPet" className="block text-sm font-medium text-gray-700">
                Foto do Pet<span className="text-red-500">*</span>
              </label>
              <input type="file" id="fotoPet" name="fotoPet" accept="image/*" className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-600 hover:file:bg-red-100"
                required/>
            </div>

            {/* Campo de Gênero do Pet */}
            <div className="mb-4">
              <label htmlFor="generoPet" className="block text-sm font-medium text-gray-700">
                Gênero<span className="text-red-500">*</span>
              </label>
              <select id="generoPet" name="generoPet" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                required>
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
                Idade<span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                {/* Campo de Idade (input) */}
                <div>
                  <input type="text" id="idade" name="idade" placeholder="Digite a idade" value={idade}
                    onChange={handleIdadeChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                    required/>
                </div>
                {/* Campo de Seleção (Ano/Anos ou Mês/Meses) */}
                <div>
                  <select id="unidadeIdade" name="unidadeIdade" value={unidadeIdade}
                    onChange={handleUnidadeIdadeChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                    required>

                    <option value="anos">{idade === '1' ? 'Ano' : 'Anos'}</option> {/* Se a idade for 1, exibe Ano, senão, Anos  verdadeiro : falso*/}
                    <option value="meses">{idade === '1' ? 'Mês' : 'Meses'}</option> {/* Se a idade for 1, exibe Mês, senão, Meses */}
                  </select>
                </div>
              </div>
            </div>

            {/* Campo de Porte do Pet */}
            <div className="mb-4">
              <label htmlFor="portePet" className="block text-sm font-medium text-gray-700">
                Porte<span className="text-red-500">*</span>
              </label>
              <select id="portePet" name="portePet" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                required>

                <option value="" disabled selected>
                  Selecione o porte
                </option>
                <option value="pequeno">Pequeno</option>
                <option value="medio">Médio</option>
                <option value="grande">Grande</option>
              </select>
            </div>

            {/* Campo de Raça do Pet, não obrigatório */}
            <div className="mb-6">
              <label htmlFor="racaPet" className="block text-sm font-medium text-gray-700">
                Raça
              </label>
              <input type="text" id="racaPet" name="racaPet" placeholder="Ex: Labrador, Golden Retriever, SRD" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-200"/>
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
            <p className="text-gray-700">O cadastro do pet foi concluído. Você será redirecionado a página de Login</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default CadastroPet;