import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import EditarPerfil from './editarperfil'; // Importa o componente do modal
import EditarPetModal from './editarpetmodal';

const Menu = () => {
  const [showConfUsuario, setShowConfUsuario] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false); // Estado para o modal de edição
  const [showAddPetModal, setShowAddPetModal] = useState(false);
  const [usuario, setUsuario] = useState("Usuário");
  const [dadosUsuario, setDadosUsuario] = useState(null);
  const [dadosPets, setDadosPets] = useState(null);

  const [showEditPetModal, setShowEditPetModal] = useState(false);
  const [petSelecionado, setPetSelecionado] = useState(null);

  useEffect(() => {
    const nomeUsuario = localStorage.getItem('usuarioNome');
    const usuarioId = localStorage.getItem('usuario_id');

    console.log("Nome do usuário no localStorage:", nomeUsuario);
    console.log("ID do usuário no localStorage:", usuarioId);

    if (nomeUsuario) {
      setUsuario(nomeUsuario);
    }
    if (usuarioId) {
      buscarDadosUsuario(usuarioId);
      buscarDadosPets(usuarioId);
    } else {
      console.log("Nenhum usuarioId encontrado no localStorage.");
    }
  }, []);

  const buscarDadosUsuario = (usuarioId) => {
    fetch(`/api/consultausuario?id=${usuarioId}`, {
      method: 'GET', // Usando GET, pois estamos consultando por ID
      headers: { 'Content-Type': 'application/json' },
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Erro na resposta da API: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log("Dados do usuário recebidos:", data);
        setDadosUsuario(data); // Atualiza o estado com os dados do usuário
      })
      .catch(error => console.error("Erro ao buscar dados do usuário:", error));
  };

  const buscarDadosPets = (usuarioId) => {
    fetch(`/api/consultapets?usuario_id=${usuarioId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
      .then(response => {
        if (!response.ok) throw new Error(`Erro na resposta da API: ${response.status}`);
        return response.json();
      })
      .then(data => setDadosPets(data))
      .catch(error => console.error("Erro ao buscar dados dos pets:", error));
  };

  const handleLogout = () => {
    localStorage.removeItem('usuarioNome');
    localStorage.removeItem('usuario_id');
    window.location.href = "/login";
  };

  const handleSaveProfile = (updatedUsuario) => {
    setDadosUsuario(updatedUsuario);
    setUsuario(updatedUsuario.nome_completo || usuario); // Atualiza o nome exibido no menu
  };

  /*const handleSavePet = (petAtualizado) => {
    if (dadosPets && dadosPets.some(p => p.id === petAtualizado.id)) {
      // Atualiza um pet existente
      setDadosPets(dadosPets.map(p => p.id === petAtualizado.id ? petAtualizado : p));
    } else {
      // Adiciona um novo pet
      setDadosPets(prevPets => (prevPets ? [...prevPets, petAtualizado] : [petAtualizado]));
    }
    setShowEditPetModal(false);
    setShowAddPetModal(false);
  };*/

  const handleSavePet = (petAtualizado) => {
    setDadosPets((prevPets) => {
      if (!prevPets) return [petAtualizado]; // Caso inicial, quando prevPets é null
      const exists = prevPets.find(p => p.id === petAtualizado.id);
      if (exists) {
        // Atualiza um pet existente
        return prevPets.map(p => (p.id === petAtualizado.id ? petAtualizado : p));
      }
      // Adiciona um novo pet
      return [...prevPets, petAtualizado];
    });
    // Fecha os modais após salvar
    setShowEditPetModal(false);
    setShowAddPetModal(false);
  };

  /*const handleDeletePet = (petId) => {
    setDadosPets(dadosPets.filter(p => p.id !== petId));
  };*/

  const handleDeletePet = (petId) => {
    setDadosPets((prevPets) => {
      if (!prevPets) return null; // Evita erro se prevPets for null
      return prevPets.filter(p => p.id !== petId);
    });
  };

  const exibeConfUsuario = () => {
    setShowConfUsuario(!showConfUsuario);
  };

  const openProfileModal = () => {
    setShowProfileModal(true);
    //setShowConfUsuario(false);
  };

  const openEditProfileModal = () => {
    setShowEditProfileModal(true);
    };
    
  const closeEditProfileModal = () => {
  setShowEditProfileModal(false);
  };

  const openEditPetModal = (pet = null) => {
    setPetSelecionado(pet);
    setShowEditPetModal(true);
  };

  const openAddPetModal = () => {
    setPetSelecionado(null); // Reseta o pet selecionado no componente pai
    setShowAddPetModal(true);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 w-full bg-white shadow-md py-4 px-6 flex items-center justify-between z-50">
        <div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-red-500 hover:text-red-600 font-medium">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m-3-3h10.5m0 0l-3-3m3 3l-3 3"></path>
            </svg>
            Sair
          </button>
        </div>

        <ul className="hidden md:flex space-x-8 text-gray-700 font-medium">
          <li><Link to="/eventosinscritos" className="hover:text-red-400 transition">Eventos Inscritos</Link></li>
          <li><Link to="/explorar" className="hover:text-red-400 transition">Explorar</Link></li>
          <li><Link to="/eventoscriados" className="hover:text-red-400 transition">Eventos Criados</Link></li>
        </ul>

        <div className="flex items-center space-x-3">
          <span className="text-gray-700 font-medium">Olá, {usuario}</span>
          <div className="items-center ms-3">
            <button 
              type="button" 
              onClick={exibeConfUsuario} 
              className="flex text-sm bg-red-400 rounded-full focus:ring-4 focus:ring-red-300"
            >
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="text-red-500"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                  <path d="M12 10c-1.32 0 -1.983 .421 -2.931 1.924l-.244 .398l-.395 .688a50.89 50.89 0 0 0 -.141 .254c-.24 .434 -.571 .753 -1.139 1.142l-.55 .365c-.94 .627 -1.432 1.118 -1.707 1.955c-.124 .338 -.196 .853 -.193 1.28c0 1.687 1.198 2.994 2.8 2.994l.242 -.006c.119 -.006 .234 -.017 .354 -.034l.248 -.043l.132 -.028l.291 -.073l.162 -.045l.57 -.17l.763 -.243l.455 -.136c.53 -.15 .94 -.222 1.283 -.222c.344 0 .753 .073 1.283 .222l.455 .136l.764 .242l.569 .171l.312 .084c.097 .024 .187 .045 .273 .062l.248 .043c.12 .017 .235 .028 .354 .034l.242 .006c1.602 0 2.8 -1.307 2.8 -3c0 -.427 -.073 -.939 -.207 -1.306c-.236 -.724 -.657 -1.223 -1.48 -1.83l-.257 -.19l-.528 -.38c-.642 -.47 -1.003 -.826 -1.253 -1.278l-.27 -.485l-.252 -.432c-1.011 -1.696 -1.618 -2.099 -3.053 -2.099z" />
                  <path d="M19.78 7h-.03c-1.219 .02 -2.35 1.066 -2.908 2.504c-.69 1.775 -.348 3.72 1.075 4.333c.256 .109 .527 .163 .801 .163c1.231 0 2.38 -1.053 2.943 -2.504c.686 -1.774 .34 -3.72 -1.076 -4.332a2.05 2.05 0 0 0 -.804 -.164z" />
                  <path d="M9.025 3c-.112 0 -.185 .002 -.27 .015l-.093 .016c-1.532 .206 -2.397 1.989 -2.108 3.855c.272 1.725 1.462 3.114 2.92 3.114l.187 -.005a1.26 1.26 0 0 0 .084 -.01l.092 -.016c1.533 -.206 2.397 -1.989 2.108 -3.855c-.27 -1.727 -1.46 -3.114 -2.92 -3.114z" />
                  <path d="M14.972 3c-1.459 0 -2.647 1.388 -2.916 3.113c-.29 1.867 .574 3.65 2.174 3.867c.103 .013 .2 .02 .296 .02c1.39 0 2.543 -1.265 2.877 -2.883l.041 -.23c.29 -1.867 -.574 -3.65 -2.174 -3.867a2.154 2.154 0 0 0 -.298 -.020z" />
                  <path d="M4.217 7c-.274 0 -.544 .054 -.797 .161c-1.426 .615 -1.767 2.562 -1.078 4.335c.563 1.451 1.71 2.504 2.941 2.504c.274 0 .544 -.054 .797 -.161c-1.426 -.615 1.767 -2.562 1.078 -4.335c-.563 -1.451 -1.71 -2.504 -2.941 -2.504z" />
                </svg>
              </div>
            </button>
          </div>
        </div>
      </nav>

      <div 
        id="drawer-contact" 
        className={`fixed top-0 right-0 z-40 h-screen p-6 bg-red-50 w-[600px] transition-transform ${
          showConfUsuario ? "translate-x-0" : "translate-x-full"
        } flex flex-col items-center justify-start overflow-y-auto border-l border-red-200 shadow-lg`}
      >
        <button 
          onClick={exibeConfUsuario} 
          type="button" 
          className="text-red-500 bg-transparent hover:bg-red-100 rounded-lg text-sm w-8 h-8 absolute top-2.5 right-2.5 flex items-center justify-center"
        >
          <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
          </svg>
          <span className="sr-only">Fechar</span>
        </button>

        <div className="w-full max-w-md mt-16">
          <h2 className="text-2xl font-bold mb-6 text-red-600">Configurações</h2>
          <div className="space-y-4 w-full">
            <button onClick={openProfileModal} className="p-4 border border-red-200 rounded-lg bg-white hover:bg-red-50 transition-colors w-full">
              <h3 className="font-medium text-red-700">Ver Perfil</h3>
            </button>
            <button onClick={openEditProfileModal} className="p-4 border border-red-200 rounded-lg bg-white hover:bg-red-50 transition-colors w-full">
           <h3 className="font-medium text-red-700">Editar Perfil</h3>
            </button>
            <button onClick={() => openEditPetModal(null)}  className="p-4 border border-red-200 rounded-lg bg-white hover:bg-red-50 transition-colors w-full">
              <h3 className="text-center font-medium text-red-700">Editar Perfil Pet</h3>
            </button >
            <button onClick={openAddPetModal} className="p-4 border border-red-200 rounded-lg bg-white hover:bg-red-50 transition-colors w-full">
              <h3 className="font-medium text-red-700">Adicionar Pet</h3>
            </button>
            <button 
              onClick={handleLogout}
              className="w-full mt-8 p-3 bg-red-400 text-white rounded-lg hover:bg-red-500 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m-3-3h10.5m0 0l-3-3m3 3l-3 3"></path>
              </svg>
              Sair da conta
            </button>
          </div>
        </div>
      </div>

       {/* Modal de Visualização do Perfil */}
      <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity ${showProfileModal ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className={`bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 ${showProfileModal ? 'scale-100' : 'scale-95'}`}>
          <div className="bg-red-400 text-white p-4 rounded-t-lg flex justify-between items-center">
            <h3 className="text-xl font-bold">Meu Perfil</h3>
            <button onClick={() => setShowProfileModal(false)} className="text-white hover:text-red-100">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6">
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-red-600 mb-4 border-b border-red-200 pb-2">Informações Pessoais</h4>
              {dadosUsuario ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600">Nome Completo</p>
                    <p className="font-medium">{dadosUsuario.nome_completo || 'Não informado'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Email</p>
                    <p className="font-medium">{dadosUsuario.email || 'Não informado'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Gênero</p>
                    <p className="font-medium">{dadosUsuario.genero || 'Não informado'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Data de Nascimento</p>
                    <p className="font-medium">
                      {dadosUsuario.data_nascimento ? new Date(dadosUsuario.data_nascimento).toLocaleDateString('pt-BR') : 'Não informado'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Estado</p>
                    <p className="font-medium">{dadosUsuario.uf || 'Não informado'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Cidade</p>
                    <p className="font-medium">{dadosUsuario.cidade_nome || 'Não informado'}</p>
                  </div>
                </div>
              ) : (
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              )}
            </div>

            <div>
              <h4 className="text-lg font-semibold text-red-600 mb-4 border-b border-red-200 pb-2">Informações do Pet</h4>
              {dadosPets && dadosPets.length > 0 ? (
                dadosPets.map((pet, index) => (
                  <div key={index} className="flex flex-col md:flex-row gap-6 items-start mb-6">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-red-200 shadow-md bg-gray-100 flex items-center justify-center">
                      {pet.foto ? (
                        <img src={`http://localhost:3000${pet.foto}`} alt={`Foto de ${pet.nome}`} className="w-full h-full object-cover" />
                      ) : (
                        <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 12c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm6-1.8C18 6.57 15.35 4 12 4s-6 2.57-6 6.2c0 2.34 1.95 5.44 6 9.14 4.05-3.7 6-6.8 6-9.14zM12 2c4.2 0 8 3.22 8 8.2 0 3.32-2.67 7.25-8 11.8-5.33-4.55-8-8.48-8-11.8C4 5.22 7.8 2 12 2z" />
                        </svg>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow">
                      <div>
                        <p className="text-gray-600">Nome</p>
                        <p className="font-medium">{pet.nome || 'Não informado'}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Sexo</p>
                        <p className="font-medium">{pet.sexo || 'Não informado'}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Idade</p>
                        <p className="font-medium">{pet.idade ? `${pet.idade}` : 'Não informado'}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Porte</p>
                        <p className="font-medium">{pet.porte || 'Não informado'}</p>
                      </div>
                      {pet.raca && (
                        <div className="md:col-span-2">
                          <p className="text-gray-600">Raça</p>
                          <p className="font-medium">{pet.raca}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-600">Nenhum pet encontrado.</p>
              )}
            </div>
          </div>

          <div className="bg-gray-50 px-6 py-3 rounded-b-lg flex justify-end">
            <button
              onClick={() => setShowProfileModal(false)}
              className="px-4 py-2 bg-red-400 text-white rounded-lg hover:bg-red-500 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>

        {/* Modal de Edição do Perfil */}
        <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity ${showEditProfileModal ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className={`transform transition-all duration-300 w-full max-w-3xl ${showEditProfileModal ? 'scale-100' : 'scale-95'}`}>
            <EditarPerfil onClose={closeEditProfileModal} onSave={handleSaveProfile} />
          </div>
        </div>

      {/* Modal de Edição de Pet */}
      <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity ${showEditPetModal ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className={`transform transition-all duration-300 w-full max-w-3xl ${showEditPetModal ? 'scale-100' : 'scale-95'}`}>
          <EditarPetModal
            pets={dadosPets}
            onClose={() => setShowEditPetModal(false)}
            onSave={handleSavePet}
            onDelete={handleDeletePet}
            petInicial={petSelecionado} // Passa o pet selecionado, se houver
            modoInicial="selecao"
          />
        </div>
      </div>

       {/* Modal de Cadastro de Pet */}
      <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity ${showAddPetModal ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className={`transform transition-all duration-300 w-full max-w-3xl ${showAddPetModal ? 'scale-100' : 'scale-95'}`}>
          <EditarPetModal
            pets={dadosPets}
            onClose={() => setShowAddPetModal(false)}
            onSave={handleSavePet}
            onDelete={handleDeletePet}
            modoInicial="cadastro" // Força o modo de cadastro
          />
        </div>
      </div>

    </>
  );
};

export default Menu;