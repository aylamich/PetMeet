import React, { useState } from 'react';
import logo from '/logo.png'; // Importação da logo

function CadastroPet() {
  // **** Declarações de estados para os campos do formulário ****
  const [mostrarModalSucesso, setMostrarModalSucesso] = useState(false); // Modal de Sucesso: Oculto, só mostra quando bem sucedido
  const [dataNascimento, setDataNascimento] = useState(''); // Armazena a data de nascimento do pet - inicia como STRING VAZIA -
  const [nome, setNome] = useState(''); // Armazena o nome do pet
  const [sexo, setSexo] = useState(''); // Armazena o genero do pet 
  const [porte, setPorte] = useState(''); // Armazena o porte do pet
  const [raca, setRaca] = useState(''); // Armazena a raça do pet
  const [foto, setFoto] = useState(null); // Armazena a foto do pet, inicia null
  const [fotoPreview, setFotoPreview] = useState(''); // Armazena o preview da foto do pet
  const [erroGeral, setErroGeral] = useState(''); // Armazena mensagens de erros
  const [mostrarModalSucessoAdicionar, setMostrarModalSucessoAdicionar] = useState(false); // Estado para modal de sucesso após clicar em "Adicionar mais um pet"

  // Função para calcular a idade do PET com validação
  const calcularIdade = (dataNascimento) => {
    const hoje = new Date(); // cria um objeto de data com a data atual
    const nascimento = new Date(dataNascimento); // converte a string da data de nascimento para um objeto de data
    let anos = hoje.getFullYear() - nascimento.getFullYear(); // calcula a diferença de anos entre a data atual e a data de nascimento
    let meses = hoje.getMonth() - nascimento.getMonth(); // calcula a diferença de meses entre a data atual e a data de nascimento (para validar se o aniversário já passou ou não)
    const dias = hoje.getDate() - nascimento.getDate(); // calcula a diferença de dias entre a data atual e a data de nascimento

    if (meses < 0 || (meses === 0 && dias < 0)) { // verifica se o pet já fez aniversário este ano ou não
        anos--; // se não fez aniversário, diminui 1 ano
        meses += 12; // ajusta os meses
    }
    if (dias < 0 && meses > 0) { // verifica se os dias são negativos e os meses são positivos
        // se sim, diminui 1 mês
        meses--;
    }

    if (nascimento > hoje) { // verifica se a data de nascimento é futura
        //return "Inválida (data futura)";
        return { isValid: false, error: 'A data de nascimento não pode ser no futuro.', idade: '' };
    }
    if (anos === 0 && meses === 0 && dias < 30) { // verifica se a idade é menor que 1 mês
        // se sim, retorna inválida
       // return "Inválida (menos de 1 mês)";
       return { isValid: false, error: 'A idade do pet não pode ser inferior a 1 mês.', idade: '' };
    }
    if (anos > 40) { // verifica se a idade é maior que 40 anos
        // se sim, retorna inválida
        return { isValid: false, error: 'A data de nascimento indica que o pet teria mais de 40 anos. Verifique se está correta.', idade: '' };
        //return "Inválida (mais de 40 anos)";
    }

    // Formatar a idade
    let idade;
    if (anos > 0) { // se a idade for maior que 0 anos, retorna a idade em anos
        idade = `${anos} ${anos === 1 ? 'ano' : 'anos'}`;  // se for 1 ano, retorna "ano", senão "anos"
    } else {  // se a idade for menor que 1 ano, retorna a idade em meses
        idade = `${meses} ${meses === 1 ? 'mês' : 'meses'}`;  // se for 1 mês, retorna "mês", senão "meses"
    }

    return { isValid: true, error: '', idade };
};

    const limparFormulario = () => { // Função para limpar o formulário após o envio
      //setIdade('');
      //setUnidadeIdade('anos');
      setNome('');
      setSexo('');
      setDataNascimento('');
      setPorte('');
      setRaca('');
      setFoto(null);
      setFotoPreview(''); // Reseta o preview
      document.getElementById('fotoPet').value = '';
    };
  
    // Função para salvar o pet, chamada ao clicar no botão "Adicionar mais um pet"
    const salvarPet = (redirecionar) => { // **** Ao clicar no botão "ADICIONAR MAIS UM PET", salva o ANTERIOR ****
      if (!nome || !sexo || !dataNascimento || !porte || !foto) { // Verifica se todos os campos obrigatórios estão preenchidos
        setErroGeral('Preencha todos os campos obrigatórios.');
        return; 
      }
      // Validar data de nascimento
    const resultadoIdade = calcularIdade(dataNascimento);
      if (!resultadoIdade.isValid) {
          setErroGeral(resultadoIdade.error);
          return;
      }
  
      const formData = new FormData(); // Cria um novo objeto FormData para enviar os dados do formulário ao backend
      formData.append('usuario_id', localStorage.getItem('usuario_id') || '1');
      formData.append('fotoPet', foto);
      formData.append('nome', nome);
      formData.append('sexo', sexo);
      formData.append('data_nascimento', dataNascimento);
     // formData.append('idade', `${idade} ${unidadeIdade}`);
      formData.append('porte', porte);
      formData.append('raca', raca || ''); // Adiciona a raça como string vazia se não for preenchida
  
      fetch('/api/cadastropet', { // ****** Requisição para o backend para cadastrar o pet ******
        method: 'POST',
        body: formData // Envia o FormData com os dados do pet
      })
        .then(response => {
          if (!response.ok) throw new Error('Erro ao cadastrar pet');
          return response.json();
        })
        .then(data => {
          if (redirecionar) {
            setMostrarModalSucesso(true); // Mostra o modal de sucesso se o redirecionamento for verdadeiro
            setTimeout(() => {
              window.location.href = '/login'; // Redireciona para a página de login após 3 segundos
            }, 3000);
          } else {
            setMostrarModalSucessoAdicionar(true); // Mostra o modal de sucesso se o redirecionamento for falso
            limparFormulario();
            setTimeout(() => {
              setMostrarModalSucessoAdicionar(false); // Fecha o modal após 3 segundos
            }, 3000);
          }
        })
        .catch(error => {
          console.error('Erro:', error);
          setErroGeral('Deu ruim, tenta de novo.');
        });
    }; 

    const handleFotoChange = (e) => { // Função para lidar com a mudança de foto
      const file = e.target.files[0];
      if (file) {
        setFoto(file);
        setFotoPreview(URL.createObjectURL(file)); // Gera o preview
      }
    };

 // ---------------------------------------------------- //-------------------------------------------------- //
  // Validar formulário ao enviar
  const handleSubmit = async (event) => { // Ao clicar no botão "Salvar"
    event.preventDefault();  // Evite que a página seja recarregada ao enviar o formulário, para processar dados de formulários sem recarregar a página

    if (!nome || !sexo || !dataNascimento || !porte || !foto) { // Verifica se todos os campos obrigatórios estão preenchidos
      setErroGeral('Preencha todos os campos obrigatórios.');
      return;
  }

  // Validar data de nascimento
  const resultadoIdade = calcularIdade(dataNascimento);
    if (!resultadoIdade.isValid) { // Verifica se a data de nascimento é válida
        setErroGeral(resultadoIdade.error); // Se não for válida, exibe mensagem de erro de acordo com o resultado da validação
        return;
    }

    try {
      const formData = new FormData(); // Cria um novo objeto FormData para enviar os dados do formulário ao backend
      
      // Adiciona a foto
      if (event.target.fotoPet.files[0]) { // refere-se ao primeiro arquivo selecionado em um input de tipo file
        formData.append('fotoPet', event.target.fotoPet.files[0]);
      }
  
      // Adiciona os demais campos como strings
      formData.append('usuario_id', localStorage.getItem('usuario_id')); // ID do usuário, obtido do localStorage
      formData.append('nome', event.target.nomePet.value); // Obtido do formulário
      formData.append('sexo', event.target.generoPet.value);
      formData.append('data_nascimento', dataNascimento);
      formData.append('porte', event.target.portePet.value);
      formData.append('raca', event.target.racaPet.value || '');
  
      const response = await fetch('/api/cadastropet', { // Requisição para o backend para cadastrar o pet ao clicar no botão "Salvar"
        method: 'POST',
        body: formData  // Envia apenas o FormData
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao cadastrar pet');
      }
  
      const data = await response.json();
      setMostrarModalSucesso(true);
      
      setTimeout(() => {
        window.location.href = '/login';
      }, 3000);
    } catch (error) {
      console.error('Erro na requisição:', error);
      setErroGeral('Erro ao cadastrar pet. Tente novamente.');
    }
  };

  // Função para fechar o modal de erro
  const fecharModal = () => {
    setErroGeral(''); // Limpa o erro geral para fechar o modal
    setMostrarModalSucessoAdicionar(false); // Fecha o modal de sucesso
  };

 // ---------------------------------------------------- //-------------------------------------------------- //  
  return (
    <div className="min-h-screen flex flex-col md:flex-row"> {/* Responsividade */}
      {/* Lado esquerdo: Imagem */}
      <div
        className="hidden md:block md:w-3/5 bg-cover bg-center fixed top-0 left-0 h-full" // Oculta em telas pequenas, exibe em telas médias/grandes 3 de 5 blocos, fixa a imagem na tela do lado esquerdo
        style={{ backgroundImage: `url(${logo})` }} // Logo PetMeet
      ></div>

      {/* Lado direito: Formulário de Cadastro Pet */}
      <div className="w-full md:w-2/5 md:ml-[60%] flex items-start justify-center bg-white overflow-y-auto h-screen"> {/* Formulário ocupa 2 blocos de 5 em telas grandes e médias (ocupa toda a largura em telas pequenas)*/}
        <div className="w-full max-w-md p-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Cadastro Pet</h2>

          {/* Formulário */}
          <form id="cadastroPetForm" onSubmit={handleSubmit}>
            {/* Campo de Foto do Pet */}
            <div className="mb-4">
              <label htmlFor="fotoPet" className="block text-sm font-medium text-gray-700 ">
                Foto do Pet<span className="text-red-500">*</span>
              </label>
              {/* Preview da foto, renderiza quando você adiciona uma foto */}
              {fotoPreview && (
                <div className="mb-4 mt-6  w-24 h-24 rounded-full overflow-hidden border-2 border-red-200">
                  <img src={fotoPreview} alt="Preview do pet" className="w-full h-full object-cover" />
                </div>
              )}
              <input type="file" id="fotoPet" name="fotoPet" accept="image/*"  className="hidden mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-600 hover:file:bg-red-100"
                onChange={handleFotoChange}
                required/>
              {/* Botão personalizado */}
              <label
                htmlFor="fotoPet"
                className="mt-1 inline-block px-4 py-2 bg-red-50 text-red-600 text-sm font-semibold rounded-md cursor-pointer hover:bg-red-100"
              >
                Escolher arquivo
              </label>
            </div>  

            {/* Campo de Nome */}
            <div className="mb-4">
              <label htmlFor="nomePet" className="block text-sm font-medium text-gray-700">
                Nome<span className="text-red-500">*</span>
              </label>
              <input type="text" id="nomePet" name="nomePet" placeholder="Digite o nome do seu cãozinho" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                value={nome} 
                onChange={(e) => setNome(e.target.value)}
                required/>
            </div>

            {/* Campo de Gênero do Pet */}
            <div className="mb-4">
              <label htmlFor="generoPet" className="block text-sm font-medium text-gray-700">
                Gênero<span className="text-red-500">*</span>
              </label>
              <select id="generoPet" name="generoPet" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-200"
              value={sexo}
                onChange={(e) => setSexo(e.target.value)}
                required>
                <option value="" disabled selected>
                  Selecione o gênero
                </option>
                <option value="macho">Macho</option>
                <option value="femea">Fêmea</option>
              </select>
            </div>

            <div className="mb-4">
                <label htmlFor="dataNascimento" className="block text-sm font-medium text-gray-700">
                    Data de Nascimento<span className="text-red-500">*</span>
                </label>
                <input
                    type="date"
                    id="dataNascimento"
                    name="dataNascimento"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                    value={dataNascimento}
                    onChange={(e) => setDataNascimento(e.target.value)}
                    required
                />
            </div>

            {/* Exibe a idade calculada, se válida */}
            {dataNascimento && (
              <p className="text-sm mb-2">
                  Idade:{' '}
                  <span className={!calcularIdade(dataNascimento).isValid ? 'text-red-500' : 'text-gray-600'}>
                      {calcularIdade(dataNascimento).idade || calcularIdade(dataNascimento).error}
                  </span>
              </p>
              )}

            {/* Campo de Porte do Pet */}
            <div className="mb-4">
              <label htmlFor="portePet" className="block text-sm font-medium text-gray-700">
                Porte<span className="text-red-500">*</span>
              </label>
              <select id="portePet" name="portePet" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                value={porte}
                onChange={(e) => setPorte(e.target.value)}
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
              <input type="text" id="racaPet" name="racaPet" placeholder="Ex: Labrador, Golden Retriever, SRD" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-200"
              value={raca}
              onChange={(e) => setRaca(e.target.value)}
              />
            </div>

            {/* Botão de Adicionar outro pet */}
            <button
              type="button"
              onClick={() => salvarPet(false)}
              className="w-full bg-red-400 text-white py-2 px-4 rounded-md hover:bg-red-300 focus:outline-none focus:ring-2 focus:ring-red-300 mb-4"
            >
              Adicionar mais um pet
            </button>

            {/* Botão de Salvar */}
            <button
              type="submit"
              className="w-full bg-red-400 text-white py-2 px-4 rounded-md hover:bg-red-300 focus:outline-none focus:ring-2 focus:ring-red-300"
            >
              Salvar
            </button>
          </form>
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

        {/* Modal de Sucesso (sem redirecionamento, para "Adicionar mais um pet") */}
        {mostrarModalSucessoAdicionar && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full border border-green-300">
              <h3 className="text-lg font-medium text-green-600 mb-4">Sucesso</h3>
              <p className="text-sm text-gray-700 mb-6">Pet adicionado com sucesso!</p>
              <div className="flex justify-end">
                <button
                  onClick={fecharModal}
                  className="bg-red-400 text-white px-4 py-2 rounded-md hover:bg-red-300 focus:outline-none focus:ring-2 focus:ring-red-300"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de erro geral, como idade inválida */}
        {erroGeral && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full border border-red-300">
              <h3 className="text-lg font-medium text-red-800 mb-4">Erro</h3>
              <p className="text-sm text-red-800 mb-6">{erroGeral}</p>
              <div className="flex justify-end">
                <button
                  onClick={fecharModal}
                  className="bg-red-400 text-white px-4 py-2 rounded-md hover:bg-red-300 focus:outline-none focus:ring-2 focus:ring-red-300"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CadastroPet;