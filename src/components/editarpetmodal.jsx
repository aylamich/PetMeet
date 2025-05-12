import React, { useState, useEffect, useRef, useContext } from 'react';
import { AuthContext } from '../context/AuthContext'; // Para o logout

function EditarPetModal({ pets, onClose, onSave, onDelete, modoInicial = 'selecao' }) {
  const [modoSelecao, setModoSelecao] = useState(modoInicial === 'selecao'); // Modo de seleção ou cadastro
  const [petSelecionado, setPetSelecionado] = useState(null); // Pet selecionado para edição
  const [modoCadastro, setModoCadastro] = useState(modoInicial === 'cadastro');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); // Estado para controle do modal de confirmação de exclusão
  const [petToDelete, setPetToDelete] = useState(null); // Pet a ser excluído
  const [localPets, setLocalPets] = useState(pets); // Estado local para gerenciar pets

  const [nome, setNome] = useState('');
  const [sexo, setSexo] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [porte, setPorte] = useState('');
  const [raca, setRaca] = useState('');
  const [foto, setFoto] = useState(null);
  const [fotoAtual, setFotoAtual] = useState('');
  const [fotoPreview, setFotoPreview] = useState('');
  const [carregando, setCarregando] = useState(false); // Estado para controle do carregamento

  const { authFetch } = useContext(AuthContext); // Obter authFetch do AuthContext
  

  const fileInputRef = useRef(null); // Referência para o input de arquivo, usada para limpar o campo

  const BASE_URL = 'http://localhost:3000'; // URL base para carregar imagens

  // Sincroniza localPets com a prop pets
  useEffect(() => {
    setLocalPets(pets);
  }, [pets]);
  
  useEffect(() => {
    // Executa toda vez que o modal é aberto ou modoInicial muda
    if (modoInicial === 'cadastro') {
      setModoCadastro(true); // Ativa modo de cadastro
      setModoSelecao(false); // Desativa modo de seleção
      setPetSelecionado(null);
      setNome('');
      setSexo('');
      setDataNascimento('');
      setPorte('');
      setRaca('');
      setFoto(null);
      setFotoAtual(''); // Já está aqui, mas confirmando
      setFotoAtual('');
      setFotoPreview('');
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Limpa o valor do input
      }
    } else if (modoInicial === 'selecao') {
      setModoCadastro(false); // Desativa modo de cadastro
      setModoSelecao(true); // Ativa modo de seleção
      setPetSelecionado(null);
      setNome('');
      setSexo('');
      setDataNascimento('');
      setPorte('');
      setRaca('');
      setFoto(null);
      setFotoAtual(''); // Já está aqui, mas confirmando
      setFotoAtual('');
      setFotoPreview('');
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Limpa o valor do input
      }
    }
  }, [modoInicial, onClose]); // / Executa quando modoInicial ou onClose muda

  // Efeito para carregar dados do pet selecionado
  useEffect(() => {
    if (petSelecionado && !modoCadastro) { // Se um pet for selecionado e não estiver no modo de cadastro
      console.log('Pet Selecionado:', petSelecionado); // Depuração
      setNome(petSelecionado.nome || '');
      setSexo(petSelecionado.sexo || '');
      setDataNascimento(petSelecionado.data_nascimento || '');
      setPorte(petSelecionado.porte || '');
      setRaca(petSelecionado.raca || '');
      setFoto(null);
      setFotoPreview(`${BASE_URL}/api/pet/foto/${petSelecionado.id}`); // Carrega a foto via API
    } else if (modoCadastro) {
      // Limpa o formulário no modo de cadastro
      setNome('');
      setSexo('');
      setDataNascimento('');
      setPorte('');
      setRaca('');
      setFoto(null);
      setFotoAtual('');
      setFotoPreview('');
    }
  }, [petSelecionado, modoCadastro]);

  // Função para gerenciar upload de foto
  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo e tamanho do arquivo
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        alert('Apenas imagens JPEG, PNG ou GIF são permitidas.');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert('A imagem deve ter no máximo 10 MB.');
        return;
      }
      setFoto(file); // Armazena o arquivo
      setFotoPreview(URL.createObjectURL(file)); // Cria URL para o preview
    }
  };

  // Função para selecionar um pet da lista
  const handleSelecionarPet = (pet) => {
    setPetSelecionado(pet);
    setModoSelecao(false); // Desativa o modo de seleção
    setModoCadastro(false); // Desativa o modo de cadastro, entra no edição do pet que foi selecionado
  };

  // Função para voltar à tela de seleção
  const handleVoltarParaSelecao = () => {
    setModoSelecao(true); // Ativa o modo de seleção
    setPetSelecionado(null);
    setModoCadastro(false);
    setFoto(null);
    setFotoPreview('');
  };

  // Função para iniciar o cadastro de um novo pet
  const handleNovoPet = () => {
    setModoSelecao(false);
    setModoCadastro(true);
    setPetSelecionado(null);
  };

  // Função para abrir o modal de confirmação de exclusão
  const handleDeletePet = (pet) => {
    console.log('Pet para exclusão:', pet); // Verifica se o pet tem ID
    setPetToDelete(pet);
    setShowDeleteConfirm(true); // Abre o modal de confirmação
  };

  // Função para confirmar a exclusão do pet
  const confirmDeletePet = async () => {
    setCarregando(true);
    try {
      console.log('Tentando excluir pet com ID:', petToDelete.id); // Log para depuração
      const response = await authFetch(`/api/deletarpet?pet_id=${petToDelete.id}`, { // Manda pro backend o ID do pet a ser excluído e deleta
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erro retornado pela API:', errorData); // Log do erro da API
        throw new Error(errorData.error || 'Erro ao excluir pet');
      }
  
      // Remove o pet de localPets
      setLocalPets((prev) => prev.filter((p) => p.id !== petToDelete.id));
      // Notifica o componente pai
      onDelete(petToDelete.id);
      setShowDeleteConfirm(false);
      setPetToDelete(null);
      setModoSelecao(true);
    } catch (error) {
      console.error('Erro ao excluir pet:', error);
      alert(`Erro ao excluir pet: ${error.message}`);
    } finally {
      setCarregando(false);
    }
  };

  // Função para enviar o formulário (cadastro ou edição)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setCarregando(true);
    await new Promise(resolve => setTimeout(resolve, 300)); // Pequeno atraso para feedback visual

    try {
      const formData = new FormData();
      formData.append('nome', nome);
      formData.append('sexo', sexo);
      formData.append('data_nascimento', dataNascimento);
      formData.append('porte', porte);
      formData.append('raca', raca || '');
      if (foto) {
        formData.append('fotoPet', foto);
      }

      let url = '';
      //let method = 'POST';
      let updatedPet = {};

      if (modoCadastro) {
        // Modo cadastro: inclui usuario_id do localStorag
        formData.append('usuario_id', localStorage.getItem('usuario_id'));
        url = '/api/cadastropet'; // URL para cadastro de pet
      } else {
        // Modo edição: inclui pet_id e foto atual (se não houver nova foto)
        formData.append('pet_id', petSelecionado.id);
        if (!foto) formData.append('fotoAtual', fotoAtual);
        url = '/api/alterarpet';
      }

      const response = await authFetch(url, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao processar pet');
      }

      const data = await response.json();
      console.log('Resposta da API de cadastro:', data); // Log para verificar o que o backend retorna

        if (modoCadastro) {
          // Cria objeto para o novo pet
          updatedPet = {
            id: data.petId,
            nome,
            sexo,
            data_nascimento: dataNascimento,
            porte,
            raca: raca || null,
            foto: foto ? `/api/pet/foto/${data.petId || data.pet.id}` : null, // Usa a rota da foto
          };
          setLocalPets((prev) => [...prev, updatedPet]); // Adiciona o novo pet
          console.log('updatedPet após cadastro:', updatedPet); // Verifica se o id está presente
          setFotoPreview(data.foto ? `${BASE_URL}${data.foto}` : ''); // Preview com BASE_URL para o modal
          //setFotoAtual(''); // Limpa fotoAtual após cadastrar
          setFoto(null); // Limpa o estado da foto
          if (fileInputRef.current) {
            fileInputRef.current.value = ''; // Limpa o valor do input
          }
        } else {
          updatedPet = {
            id: petSelecionado.id,
            nome,
            sexo,
            data_nascimento: dataNascimento,
            porte,
            raca: raca || null,
            foto: foto ? `/api/pet/foto/${petSelecionado.id}` : petSelecionado.foto, // Mantém ou atualiza a foto
          };
          setLocalPets((prev) =>
            prev.map((p) => (p.id === updatedPet.id ? updatedPet : p))
          ); // Atualiza o pet existente
          setModoSelecao(true); // Volta para seleção no modo de edição
        }

      console.log('Pet processado:', updatedPet);
      onSave(updatedPet); // Notifica o componente pai com o pet atualizado
      onClose(); // Fecha o modal após salvar

    } catch (error) {
      console.error('Erro ao processar pet:', error);
      alert(`Erro ao processar pet: ${error.message}`);
    } finally {
      setCarregando(false);
    }
  };

  // Função para calcular a idade, mesma coisa do cadastro pet
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
    if (dias < 0 && meses > 0) meses--;

    if (nascimento > hoje) return "Inválida (data futura)";
    if (anos === 0 && meses === 0 && dias < 30) return "Inválida (menos de 1 mês)";
    if (anos > 30) return "Inválida (mais de 30 anos)";
    return anos > 0 ? `${anos} ${anos === 1 ? 'ano' : 'anos'}` : `${meses} ${meses === 1 ? 'mês' : 'meses'}`;
  };

// -------------------------------------- // -------------------------------------- //  
  return (
    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      {/* Cabeçalho do modal */}
      <div className="bg-red-400 text-white p-4 rounded-t-lg flex justify-between items-center">
        <h3 className="text-xl font-bold">
          {modoSelecao ? 'Selecionar Pet para Editar' : modoCadastro ? 'Cadastrar Novo Pet' : 'Editar Pet'}
        </h3>
        <button onClick={onClose} className="text-white hover:text-red-100">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="p-6">
      {modoSelecao ? ( // Se estiver no modo de seleção, exibe a lista de pets
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-800">Selecione o pet que deseja editar:</h4>
              {localPets && localPets.length > 0 ? (
                <div className="space-y-3">
                 {localPets.map(pet => (
                    <div
                      key={pet.id} // Usa o ID do pet como chave
                      className="p-4 border border-gray-200 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-between"
                    >
                      <div
                        className="flex items-center gap-4 cursor-pointer"
                        onClick={() => handleSelecionarPet(pet)} // Seleciona o pet ao clicar
                      >
                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-red-200 bg-gray-100 flex items-center justify-center">
                          {/* Exibe a foto do pet ou um ícone padrão se não houver foto */}
                          <img
                            src={`${BASE_URL}/api/pet/foto/${pet.id}?t=${Date.now()}`} //O ?t=${Date.now()} força o navegador a buscar a imagem atualizada
                            alt={pet.nome}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.log(`Erro ao carregar imagem de ${pet.nome}: ${e.target.src}`);
                              e.target.src = '/placeholder.jpg'; // Imagem padrão
                            }}
                          />
                        </div>
                        <div>
                          <h5 className="font-medium">{pet.nome}</h5> {/* Nome do pet */}
                          <p className="text-sm text-gray-600">{pet.porte} • {pet.data_nascimento ? calcularIdade(pet.data_nascimento) : 'Não informado'}</p> {/* Idade do pet */}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Evita selecionar o pet ao clicar em excluir
                          handleDeletePet(pet); // Abre o modal de confirmação de exclusão
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="icon icon-tabler icons-tabler-outline icon-tabler-trash"
                        >
                          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                          <path d="M4 7l16 0" />
                          <path d="M10 11l0 6" />
                          <path d="M14 11l0 6" />
                          <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
                          <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
                        </svg>
                      </button>
                    </div>
                  ))}
                
              </div>
            ) : (
              <p className="text-gray-600">Nenhum pet cadastrado.</p>
            )}
            
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {modoInicial === 'edicao' && ( // Se estiver no modo de edição, exibe o botão para voltar
              <button
                type="button"
                onClick={handleVoltarParaSelecao} // Volta para seleção de pets
                className="mb-4 flex items-center text-red-500 hover:text-red-600"
              >
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Voltar para seleção
              </button>
            )}
   
            {/* Campo de upload de foto */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Foto do Pet</label>
              <div className="flex items-center gap-4">
                {fotoPreview && (
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-red-200">
                    <img
                      src={fotoPreview}
                      alt="Preview da foto do pet"
                      className="w-full h-full object-cover"
                      onError={(e) => console.log(`Erro ao carregar preview: ${e.target.src}`)}
                      //required
                    />
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef} // Adiciona a referência
                  onChange={handleFotoChange}
                  accept="image/*"
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-600 hover:file:bg-red-100"
                />
              </div>
              {fotoAtual && !foto && !modoCadastro && !modoSelecao && (
                <p className="text-sm text-gray-600 mt-2">Foto atual: {fotoAtual}</p>
              )}
            </div>

            {/* Campo de nome */}
            <div className="mb-4">
              <label htmlFor="nomePet" className="block text-sm font-medium text-gray-700">
                Nome<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="nomePet"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Digite o nome do pet"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                required
              />
            </div>

            {/* Campo de genero */}
            <div className="mb-4">
              <label htmlFor="sexoPet" className="block text-sm font-medium text-gray-700">
                Gênero<span className="text-red-500">*</span>
              </label>
              <select
                id="sexoPet"
                value={sexo}
                onChange={(e) => setSexo(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                required
              >
                <option value="" disabled>Selecione o gênero</option>
                <option value="Macho">Macho</option>
                <option value="Fêmea">Fêmea</option>
              </select>
            </div>

            {/* Campo de data de nascimento */}
            <div className="mb-4">
              <label htmlFor="dataNascimento" className="block text-sm font-medium text-gray-700">
                Data de Nascimento<span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="dataNascimento"
                value={dataNascimento}
                onChange={(e) => setDataNascimento(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                required
              />
              {dataNascimento && ( // Se a data de nascimento estiver preenchida, exibe a idade calculada
                <p className={`text-sm mb-2 ${calcularIdade(dataNascimento).includes('Inválida') ? 'text-red-500' : 'text-gray-600'}`}>
                  {calcularIdade(dataNascimento)}
                </p>
              )}
            </div>

            {/* Campo de porte */}
            <div className="mb-4">
              <label htmlFor="portePet" className="block text-sm font-medium text-gray-700">
                Porte<span className="text-red-500">*</span>
              </label>
              <select
                id="portePet"
                value={porte}
                onChange={(e) => setPorte(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                required
              >
                <option value="" disabled>Selecione o porte</option>
                <option value="Pequeno">Pequeno</option>
                <option value="Médio">Médio</option>
                <option value="Grande">Grande</option>
              </select>
            </div>

            {/* Campo de raça */}
            <div className="mb-6">
              <label htmlFor="racaPet" className="block text-sm font-medium text-gray-700">
                Raça
              </label>
              <input
                type="text"
                id="racaPet"
                value={raca}
                onChange={(e) => setRaca(e.target.value)}
                placeholder="Ex: Labrador, SRD"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-200"
              />
            </div>

            {/* Botões de ação */}
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-red-400 text-white rounded-lg hover:bg-red-500"
                disabled={carregando}
              >
                {carregando ? 'Salvando...' : modoCadastro ? 'Cadastrar Pet' : 'Salvar Alterações'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Tem certeza que deseja excluir?
            </h3>
            <p className="text-gray-600 mb-6">
              Você está prestes a excluir o pet <span className="font-medium">{petToDelete?.nome}</span>. Essa ação não pode ser desfeita.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeletePet}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                disabled={carregando}
              >
                {carregando ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}

      {carregando && !showDeleteConfirm && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="py-2.5 px-5 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 inline-flex items-center">
            <svg
              aria-hidden="true"
              role="status"
              className="inline w-4 h-4 me-3 text-gray-200 animate-spin"
              viewBox="0 0 100 101"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                fill="currentColor"
              />
              <path
                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                fill="#1C64F2"
              />
            </svg>
            Carregando...
          </div>
        </div>
      )}
    </div>
  );
}

export default EditarPetModal;