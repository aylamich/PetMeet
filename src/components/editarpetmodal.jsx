import React, { useState, useEffect } from 'react';

function EditarPetModal({ pets, onClose, onSave }) {
  // Estados para o fluxo de edição
  const [modoSelecao, setModoSelecao] = useState(true);
  const [petSelecionado, setPetSelecionado] = useState(null);
  
  // Estados para os campos do pet
  const [idade, setIdade] = useState('');
  const [unidadeIdade, setUnidadeIdade] = useState('anos');
  const [nome, setNome] = useState('');
  const [sexo, setSexo] = useState('');
  const [porte, setPorte] = useState('');
  const [raca, setRaca] = useState('');
  const [foto, setFoto] = useState(null);
  const [fotoPreview, setFotoPreview] = useState('');
  const [carregando, setCarregando] = useState(false);

  // URL base para as imagens (ajuste conforme o domínio da sua API)
  const BASE_URL = 'http://localhost:3000';

  // Preencher os campos quando um pet é selecionado
  useEffect(() => {
    if (petSelecionado) {
      setNome(petSelecionado.nome || '');
      setSexo(petSelecionado.sexo || '');
      setPorte(petSelecionado.porte || '');
      setRaca(petSelecionado.raca || '');
      
      if (petSelecionado.idade) {
        const idadeParts = petSelecionado.idade.split(' ');
        if (idadeParts.length === 2) {
          setIdade(idadeParts[0]);
          setUnidadeIdade(idadeParts[1]);
        }
      }
      
      if (petSelecionado.foto) {
        // Adiciona o domínio base ao caminho da foto
        setFotoPreview(`${BASE_URL}${petSelecionado.foto}`);
      } else {
        setFotoPreview(''); // Limpa o preview se não houver foto
      }
    }
  }, [petSelecionado]);

  const handleIdadeChange = (event) => {
    const valor = event.target.value.replace(/\D/g, '');
    if (valor.length <= 2 && valor !== '0' && valor !== '00') {
      setIdade(valor);
    }
  };

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFoto(file);
      setFotoPreview(URL.createObjectURL(file)); // Usa URL temporário para preview de nova foto
    }
  };

  const handleSelecionarPet = (pet) => {
    setPetSelecionado(pet);
    setModoSelecao(false);
  };

  const handleVoltarParaSelecao = () => {
    setModoSelecao(true);
    setPetSelecionado(null);
    setFoto(null); // Reseta a foto ao voltar
    setFotoPreview(''); // Reseta o preview
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCarregando(true);

    try {
      const formData = new FormData();
      
      formData.append('pet_id', petSelecionado.id);
      if (foto) formData.append('fotoPet', foto);
      formData.append('nome', nome);
      formData.append('sexo', sexo);
      formData.append('idade', `${idade} ${unidadeIdade}`);
      formData.append('porte', porte);
      formData.append('raca', raca || '');

      const response = await fetch('/api/alterarpet', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar pet');
      }

      const data = await response.json();
      onSave(data);
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar pet:', error);
      alert('Erro ao atualizar pet. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <div className="bg-red-400 text-white p-4 rounded-t-lg flex justify-between items-center">
        <h3 className="text-xl font-bold">
          {modoSelecao ? 'Selecionar Pet para Editar' : 'Editar Pet'}
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
                    className="p-4 border border-gray-200 rounded-lg hover:bg-red-50 cursor-pointer transition-colors"
                    onClick={() => handleSelecionarPet(pet)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-red-200 bg-gray-100 flex items-center justify-center">
                        {pet.foto ? (
                          <img 
                            src={`${BASE_URL}${pet.foto}`} // Adiciona o domínio base
                            alt={pet.nome} 
                            className="w-full h-full object-cover" 
                            onError={(e) => console.log(`Erro ao carregar imagem de ${pet.nome}: ${e.target.src}`)} // Log para depuração
                          />
                        ) : (
                          <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 12c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm6-1.8C18 6.57 15.35 4 12 4s-6 2.57-6 6.2c0 2.34 1.95 5.44 6 9.14 4.05-3.7 6-6.8 6-9.14zM12 2c4.2 0 8 3.22 8 8.2 0 3.32-2.67 7.25-8 11.8-5.33-4.55-8-8.48-8-11.8C4 5.22 7.8 2 12 2z" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <h5 className="font-medium">{pet.nome}</h5>
                        <p className="text-sm text-gray-600">{pet.porte} • {pet.idade}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">Nenhum pet cadastrado.</p>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Botão voltar */}
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

            {/* Foto do Pet */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Foto do Pet</label>
              <div className="flex items-center gap-4">
                {fotoPreview && (
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-red-200">
                    <img 
                      src={fotoPreview} 
                      alt="Preview da foto do pet" 
                      className="w-full h-full object-cover"
                      onError={(e) => console.log(`Erro ao carregar preview: ${e.target.src}`)} // Log para depuração
                    />
                  </div>
                )}
                <input 
                  type="file" 
                  onChange={handleFotoChange}
                  accept="image/*"
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-red-50 file:text-red-600
                    hover:file:bg-red-100"
                />
              </div>
            </div>

            {/* Nome */}
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

            {/* Gênero */}
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
                <option value="macho">Macho</option>
                <option value="femea">Fêmea</option>
              </select>
            </div>

            {/* Idade */}
            <div className="mb-4">
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
            </div>

            {/* Porte */}
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
                <option value="pequeno">Pequeno</option>
                <option value="medio">Médio</option>
                <option value="grande">Grande</option>
              </select>
            </div>

            {/* Raça */}
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
                {carregando ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </form>
        )}
      </div>

      {carregando && (
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