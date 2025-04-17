import React, { useState } from 'react';
import logo from '/logo.png'; // Importação da logo
function CadastroPet() {
  // Declarações de estados para os campos do formulário
  //const [idade, setIdade] = useState(''); // Idade do pet, inicia vazia
 //const [unidadeIdade, setUnidadeIdade] = useState('anos'); // Valor padrão: Anos
  const [mostrarModalSucesso, setMostrarModalSucesso] = useState(false); // Modal de Sucesso: Oculto, só mostra quando bem sucedido
  const [dataNascimento, setDataNascimento] = useState('');
  const [nome, setNome] = useState('');
  const [sexo, setSexo] = useState('');
  const [porte, setPorte] = useState('');
  const [raca, setRaca] = useState('');
  const [foto, setFoto] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(''); // Novo estado para o preview
  const [erroGeral, setErroGeral] = useState(''); // Novo estado para erros gerais

  // Atualizar a unidade de idade (Ano/Anos ou Mês/Meses) conforme o valor digitado
 /* const handleIdadeChange = (event) => {
    const valor = event.target.value.replace(/\D/g, ''); // ReGex que remove tudo que não é número
    if (valor.length <= 2 && valor !== '0' && valor !== '00') { // No máximo 2 números e não pode ser 0 ou 00 !== é diferente de
      setIdade(valor); // Atualiza o estado com o valor filtrado se atendeu aos requisitos, não deixa digitar 0 ou 00 e nem mais de 2 números
    } 
  };

  const handleUnidadeIdadeChange = async (event) => {
    setUnidadeIdade(event.target.value); //Para atualizar a unidade de idade (Ano/Anos ou Mês/Meses) conforme o valor digitado
  };*/

  // Função para calcular a idade com validação
  const calcularIdade = (dataNascimento) => {
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let anos = hoje.getFullYear() - nascimento.getFullYear();
    let meses = hoje.getMonth() - nascimento.getMonth();
    const dias = hoje.getDate() - nascimento.getDate();

    if (meses < 0 || (meses === 0 && dias < 0)) {
        anos--;
        meses += 12;
    }
    if (dias < 0 && meses > 0) {
        meses--;
    }

    if (nascimento > hoje) {
        return "Inválida (data futura)";
    }
    if (anos === 0 && meses === 0 && dias < 30) {
        return "Inválida (menos de 1 mês)";
    }
    if (anos > 40) {
        return "Inválida (mais de 40 anos)";
    }

    if (anos > 0) {
        return `${anos} ${anos === 1 ? 'ano' : 'anos'}`;
    } else {
        return `${meses} ${meses === 1 ? 'mês' : 'meses'}`;
    }
};

  /*const handleAdicionarOutroPet = () => {
    window.location.reload(); // Recarrega a página para cadastrar novo pet
  }*/

    const limparFormulario = () => {
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
  
    const salvarPet = (redirecionar) => {
      if (!nome || !sexo || !dataNascimento || !porte || !foto) {
        setErroGeral('Preencha todos os campos obrigatórios.');
        return;
      }
  
      const formData = new FormData();
      formData.append('usuario_id', localStorage.getItem('usuario_id') || '1');
      formData.append('fotoPet', foto);
      formData.append('nome', nome);
      formData.append('sexo', sexo);
      formData.append('data_nascimento', dataNascimento);
     // formData.append('idade', `${idade} ${unidadeIdade}`);
      formData.append('porte', porte);
      formData.append('raca', raca || '');
  
      fetch('/api/cadastropet', {
        method: 'POST',
        body: formData
      })
        .then(response => {
          if (!response.ok) throw new Error('Erro ao cadastrar pet');
          return response.json();
        })
        .then(data => {
          if (redirecionar) {
            setMostrarModalSucesso(true);
            setTimeout(() => {
              window.location.href = '/login';
            }, 3000);
          } else {
            setErroGeral('Pet adicionado com sucesso!'); // Usando modal para sucesso também
            limparFormulario();
          }
        })
        .catch(error => {
          console.error('Erro:', error);
          setErroGeral('Deu ruim, tenta de novo.');
        });
    }; 

    const handleFotoChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        setFoto(file);
        setFotoPreview(URL.createObjectURL(file)); // Gera o preview
      }
    };

  // Validar formulário ao enviar
  const handleSubmit = async (event) => {
    event.preventDefault();  // Evite que a página seja recarregada ao enviar o formulário, para processar dados de formulários sem recarregar a página

    if (!nome || !sexo || !dataNascimento || !porte || !foto) {
      setErroGeral('Preencha todos os campos obrigatórios.');
      return;
  }

    const hoje = new Date();
    const nascimento = new Date(dataNascimento);

    // Validar se a data de nascimento não é futura
    if (nascimento > hoje) {
        setErroGeral('A data de nascimento não pode ser no futuro.');
        return;
    }

    // Calcular a diferença em anos e meses
    let anos = hoje.getFullYear() - nascimento.getFullYear();
    let meses = hoje.getMonth() - nascimento.getMonth();
    const dias = hoje.getDate() - nascimento.getDate();

    // Ajustar anos e meses se o aniversário ainda não aconteceu neste ano
    if (meses < 0 || (meses === 0 && dias < 0)) {
        anos--;
        meses += 12;
    }

    // Se ainda for negativo nos dias, ajustar os meses
    if (dias < 0 && meses > 0) {
        meses--;
    }

    // Bloquear envio se a idade for inválida
    if (nascimento > hoje) {
      setErroGeral('A data de nascimento não pode ser no futuro.');
      return;
  }
  if (anos === 0 && meses === 0 && dias < 30) {
      setErroGeral('A idade do pet não pode ser inferior a 1 mês.');
      return;
  }
  if (anos > 30) {
      setErroGeral('A data de nascimento indica que o pet teria mais de 30 anos. Verifique se está correta.');
      return;
  }

    /* Validar idade (deve ter exatamente 1 ou 2 números)
    if (!/^\d{1,2}$/.test(idade)) { // RegEx que valida se tem 1 ou 2 números, se não tiver, retorna o alerta
      alert('A idade deve conter no máximo 2 números.'); // Alerta se a idade não for válida
      return;
    }

    // Validar idade (não pode ser 0 ou 00)
    if (idade === '0' || idade === '00') {
      alert('A idade do pet não pode ser 0 ou 00.');
      return;
    }*/

    try {
      const formData = new FormData();
      
      // Adiciona a foto (importante que seja o primeiro append)
      if (event.target.fotoPet.files[0]) {
        formData.append('fotoPet', event.target.fotoPet.files[0]);
      }
  
      // Adiciona os demais campos como strings
      formData.append('usuario_id', localStorage.getItem('usuario_id'));
      formData.append('nome', event.target.nomePet.value);
      formData.append('sexo', event.target.generoPet.value);
      formData.append('data_nascimento', dataNascimento);
      //formData.append('idade', `${idade} ${unidadeIdade}`);
      formData.append('porte', event.target.portePet.value);
      formData.append('raca', event.target.racaPet.value || '');
  
      const response = await fetch('/api/cadastropet', {
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
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row"> {/* Responsividade */}
      {/* Lado esquerdo: Imagem */}
      <div
        className="hidden md:block md:w-3/5 bg-cover bg-center fixed top-0 left-0 h-full" // Oculta em telas pequenas, exibe em telas médias/grandes 3 de 5 blocos
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
              {/* Preview da foto */}
              {fotoPreview && (
                <div className="mb-4 mt-6  w-24 h-24 rounded-full overflow-hidden border-2 border-red-200">
                  <img src={fotoPreview} alt="Preview do pet" className="w-full h-full object-cover" />
                </div>
              )}
              <input type="file" id="fotoPet" name="fotoPet" accept="image/*" className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-600 hover:file:bg-red-100"
                //onChange={(e) => setFoto(e.target.files[0])}
                onChange={handleFotoChange}
                required/>
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

            {dataNascimento && (
                <p className="text-sm mb-2">
                    Idade:{' '}
                    <span className={calcularIdade(dataNascimento).includes('Inválida') ? 'text-red-500' : 'text-gray-600'}>
                        {calcularIdade(dataNascimento)}
                    </span>
                </p>
            )}

            {/* Campo de Idade do Pet com Seleção de Ano/Anos ou Mês/Meses 
            <div className="mb-4">
              <label htmlFor="idade" className="block text-sm font-medium text-gray-700">
                Idade<span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                {/* Campo de Idade (input) 
                <div>
                  <input type="text" id="idade" name="idade" placeholder="Digite a idade" value={idade}
                    onChange={handleIdadeChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                    required/>
                </div>
                {/* Campo de Seleção (Ano/Anos ou Mês/Meses) 
                <div>
                  <select id="unidadeIdade" name="unidadeIdade" value={unidadeIdade}
                    onChange={handleUnidadeIdadeChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                    required>

                    <option value="anos">{idade === '1' ? 'Ano' : 'Anos'}</option> {/* Se a idade for 1, exibe Ano, senão, Anos  verdadeiro : falso*
                    <option value="meses">{idade === '1' ? 'Mês' : 'Meses'}</option> {/* Se a idade for 1, exibe Mês, senão, Meses
                  </select>
                </div>
              </div>
            </div>*/}

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

        {/* Modal de erro geral */}
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