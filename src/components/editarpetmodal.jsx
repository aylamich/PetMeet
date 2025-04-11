import React, { useState, useEffect, useRef } from 'react';

function EditarPetModal({ pets, onClose, onSave, onDelete, modoInicial = 'selecao' }) {
  const [modoSelecao, setModoSelecao] = useState(modoInicial === 'edicao');
  const [petSelecionado, setPetSelecionado] = useState(null);
  const [modoCadastro, setModoCadastro] = useState(modoInicial === 'cadastro');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [petToDelete, setPetToDelete] = useState(null);

  //const [idade, setIdade] = useState('');
  //const [unidadeIdade, setUnidadeIdade] = useState('anos');
  const [nome, setNome] = useState('');
  const [sexo, setSexo] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [porte, setPorte] = useState('');
  const [raca, setRaca] = useState('');
  const [foto, setFoto] = useState(null);
  const [fotoAtual, setFotoAtual] = useState('');
  const [fotoPreview, setFotoPreview] = useState('');
  const [carregando, setCarregando] = useState(false);

  const fileInputRef = useRef(null); // Adicione esta linha

  const BASE_URL = 'http://localhost:3000';
  
  useEffect(() => {
    // Executa toda vez que o modal é aberto ou modoInicial muda
    if (modoInicial === 'cadastro') {
      setModoCadastro(true);
      setModoSelecao(false);
      setPetSelecionado(null);
      setNome('');
      setSexo('');
      setDataNascimento('');
      //setIdade('');
      //setUnidadeIdade('anos');
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
      setModoCadastro(false);
      setModoSelecao(true);
      setPetSelecionado(null);
      setNome('');
      setSexo('');
      setDataNascimento('');
     // setIdade('');
      //setUnidadeIdade('anos');
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
  }, [modoInicial, onClose]); // Adiciona onClose como dependência para detectar reabertura

  useEffect(() => {
    if (petSelecionado && !modoCadastro) {
      console.log('Pet Selecionado:', petSelecionado); // Depuração
      setNome(petSelecionado.nome || '');
      setSexo(petSelecionado.sexo || '');
      setDataNascimento(petSelecionado.data_nascimento || '');
      setPorte(petSelecionado.porte || '');
      setRaca(petSelecionado.raca || '');
      /*if (petSelecionado.idade) {
        const idadeParts = petSelecionado.idade.split(' ');
        if (idadeParts.length === 2) {
          setIdade(idadeParts[0]);
          setUnidadeIdade(idadeParts[1]);
        }
      }*/

      if (petSelecionado.foto) {
        setFotoAtual(petSelecionado.foto);
        setFotoPreview(`${BASE_URL}${petSelecionado.foto}`);
      } else {
        setFotoAtual('');
        setFotoPreview('');
      }
    } else if (modoCadastro) {
      setNome('');
      setSexo('');
      setDataNascimento('');
      setPorte('');
      setRaca('');
      //setIdade('');
      //setUnidadeIdade('anos');
      setFoto(null);
      setFotoAtual('');
      setFotoPreview('');
    }
  }, [petSelecionado, modoCadastro]);

  /*const handleIdadeChange = (event) => {
    const valor = event.target.value.replace(/\D/g, '');
    if (valor.length <= 2 && valor !== '0' && valor !== '00') {
      setIdade(valor);
    }
  };*/

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFoto(file);
      setFotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSelecionarPet = (pet) => {
    setPetSelecionado(pet);
    setModoSelecao(false);
    setModoCadastro(false);
  };

  const handleVoltarParaSelecao = () => {
    setModoSelecao(true);
    setPetSelecionado(null);
    setModoCadastro(false);
    setFoto(null);
    setFotoPreview('');
  };

  const handleNovoPet = () => {
    setModoSelecao(false);
    setModoCadastro(true);
    setPetSelecionado(null);
  };

  const handleDeletePet = (pet) => {
    console.log('Pet para exclusão:', pet); // Verifique se o pet tem ID
    setPetToDelete(pet);
    setShowDeleteConfirm(true);
  };

  const confirmDeletePet = async () => {
    setCarregando(true);
   // setTimeout(async () => {
    try {
      console.log('Tentando excluir pet com ID:', petToDelete.id); // Log para depuração
      const response = await fetch(`/api/deletarpet?pet_id=${petToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erro retornado pela API:', errorData); // Log do erro da API
        throw new Error(errorData.error || 'Erro ao excluir pet');
      }
  
      // Se a exclusão for bem-sucedida, notifica o componente pai
      onDelete(petToDelete.id);
      setShowDeleteConfirm(false);
      setPetToDelete(null);
      setModoSelecao(true); // Volta para seleção após exclusão
    } catch (error) {
      console.error('Erro ao excluir pet:', error);
      alert(`Erro ao excluir pet: ${error.message}`);
    } finally {
      setCarregando(false);
    }
 // }, 1000); // <- atraso de 800ms
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCarregando(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    //const idadeFormatada = idade === '1' ? `${idade} ${unidadeIdade.replace(/s$/, '')}` : `${idade} ${unidadeIdade}`;

    try {
      const formData = new FormData();
      formData.append('nome', nome);
      formData.append('sexo', sexo);
      formData.append('data_nascimento', dataNascimento);
     // formData.append('idade', `${idade} ${unidadeIdade}`);
      //formData.append('idade', idadeFormatada);
      formData.append('porte', porte);
      formData.append('raca', raca || '');
      if (foto) {
        formData.append('fotoPet', foto);
      }

      let url = '';
      let updatedPet = {};

      if (modoCadastro) {
        formData.append('usuario_id', localStorage.getItem('usuario_id'));
        url = '/api/cadastropet';
      } else {
        formData.append('pet_id', petSelecionado.id);
        if (!foto) formData.append('fotoAtual', fotoAtual);
        url = '/api/alterarpet';
      }

      const response = await fetch(url, {
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
          updatedPet = {
            id: data.petId,
            nome,
            sexo,
            data_nascimento: dataNascimento,
           // idade: idadeFormatada,
            porte,
            raca: raca || null,
            foto: data.foto || null, // Mantém o caminho relativo (ex.: "/uploads/...")
          };
          console.log('updatedPet após cadastro:', updatedPet); // Verifica se o id está presente
          setFotoPreview(data.foto ? `${BASE_URL}${data.foto}` : ''); // Preview com BASE_URL para o modal
          setFotoAtual(''); // Limpa fotoAtual após cadastrar
          setFoto(null); // Limpa o estado da foto
          if (fileInputRef.current) {
            fileInputRef.current.value = ''; // Limpa o valor do input
          }
          //setPetSelecionado(updatedPet); // Mantém o pet no estado
          //setModoCadastro(false); // Sai do modo de cadastro
          //setModoSelecao(false);
        } else {
          updatedPet = {
            id: petSelecionado.id,
            nome,
            sexo,
            data_nascimento: dataNascimento,
            //idade: idadeFormatada,
            porte,
            raca: raca || null,
            foto: data.pet.foto || fotoAtual, // Mantém o caminho relativo
          };
          setModoSelecao(true); // Volta para seleção no modo de edição
        }

      console.log('Pet processado:', updatedPet);
      onSave(updatedPet);
      onClose();

        // Limpa o estado após salvar
     // setPetSelecionado(null);
      //setModoSelecao(true); // Volta para o modo de seleção
      //setModoCadastro(false);
      //onClose();
    } catch (error) {
      console.error('Erro ao processar pet:', error);
      alert(`Erro ao processar pet: ${error.message}`);
    } finally {
      setCarregando(false);
    }
  };

  // Função para calcular a idade
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

  return (
    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
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
      {modoSelecao ? (
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-800">Selecione o pet que deseja editar:</h4>
              {pets && pets.length > 0 ? (
                <div className="space-y-3">
                  {pets.map(pet => (
                    <div
                      key={pet.id}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-between"
                    >
                      <div
                        className="flex items-center gap-4 cursor-pointer"
                        onClick={() => handleSelecionarPet(pet)}
                      >
                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-red-200 bg-gray-100 flex items-center justify-center">
                          {pet.foto ? (
                            <img
                              src={`${BASE_URL}${pet.foto}`}
                              alt={pet.nome}
                              className="w-full h-full object-cover"
                              onError={(e) => console.log(`Erro ao carregar imagem de ${pet.nome}: ${e.target.src}`)}
                            />
                          ) : (
                            <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 12c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm6-1.8C18 6.57 15.35 4 12 4s-6 2.57-6 6.2c0 2.34 1.95 5.44 6 9.14 4.05-3.7 6-6.8 6-9.14zM12 2c4.2 0 8 3.22 8 8.2 0 3.32-2.67 7.25-8 11.8-5.33-4.55-8-8.48-8-11.8C4 5.22 7.8 2 12 2z" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <h5 className="font-medium">{pet.nome}</h5>
                          <p className="text-sm text-gray-600">{pet.porte} • {pet.data_nascimento ? calcularIdade(pet.data_nascimento) : 'Não informado'}</p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Impede que o clique no botão acione a seleção do pet
                          handleDeletePet(pet);
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
            {modoInicial === 'edicao' && (
              <button
                type="button"
                onClick={handleVoltarParaSelecao}
                className="mb-4 flex items-center text-red-500 hover:text-red-600"
              >
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Voltar para seleção
              </button>
            )}

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
                      required
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

            {/*<div className="mb-4">
              <label htmlFor="idadePet" className="block text-sm font-medium text-gray-700">
                Idade<span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    id="idadePet"
                    value={idade}
                    onChange={handleIdadeChange}
                    placeholder="Idade"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                    required
                  />
                </div>
                <div>
                  <select
                    value={unidadeIdade}
                    onChange={(e) => setUnidadeIdade(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                    required
                  >
                    <option value="anos">{idade === '1' ? 'Ano' : 'Anos'}</option>
                    <option value="meses">{idade === '1' ? 'Mês' : 'Meses'}</option>
                  </select>
                </div>
              </div>
            </div>*/}

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
              {dataNascimento && (
                <p className={`text-sm mb-2 ${calcularIdade(dataNascimento).includes('Inválida') ? 'text-red-500' : 'text-gray-600'}`}>
                  {calcularIdade(dataNascimento)}
                </p>
              )}
            </div>

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