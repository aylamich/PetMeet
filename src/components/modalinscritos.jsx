import { useState, useEffect } from "react";

const ModalInscritos = ({ eventoId, onClose }) => {
  const [inscritos, setInscritos] = useState([]);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [dadosUsuario, setDadosUsuario] = useState(null);
  const [dadosPets, setDadosPets] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  // Buscar inscritos do evento
  const fetchInscritos = async () => {
    if (!eventoId) {
      setErro("Evento inválido. Selecione um evento válido.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/consultarinscritos?evento_id=${eventoId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }
      const data = await response.json();
      setInscritos(data);
      setErro("");
    } catch (error) {
      console.error("Erro ao buscar inscritos:", error);
      setErro("Não foi possível carregar os inscritos. Verifique a conexão ou tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // Buscar dados do usuário
  const buscarDadosUsuario = async (usuarioId) => {
    try {
      const response = await fetch(`/api/consultausuario?id=${usuarioId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        throw new Error(`Erro ${response.status}`);
      }
      const data = await response.json();
      setDadosUsuario(data);
    } catch (error) {
      console.error("Erro ao buscar dados do usuário:", error);
      setDadosUsuario(null);
    }
  };

  // Buscar dados dos pets
  const buscarDadosPets = async (usuarioId) => {
    try {
      const response = await fetch(`/api/consultapets?usuario_id=${usuarioId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        throw new Error(`Erro ${response.status}`);
      }
      const data = await response.json();
      setDadosPets(data);
    } catch (error) {
      console.error("Erro ao buscar dados dos pets:", error);
      setDadosPets([]);
    }
  };

  // Calcular idade
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
    return anos > 0 ? `${anos} ${anos === 1 ? "ano" : "anos"}` : `${meses} ${meses === 1 ? "mês" : "meses"}`;
  };

  // Abrir modal de perfil
  const openProfileModal = async (usuario) => {
    await Promise.all([
      buscarDadosUsuario(usuario.id),
      buscarDadosPets(usuario.id),
    ]);
    setShowProfileModal(true);
  };

  useEffect(() => {
    if (eventoId) {
      fetchInscritos();
    } else {
      setLoading(false);
      setErro("Nenhum evento selecionado.");
    }
  }, [eventoId]);

  // Não renderizar nada se eventoId for inválido
  if (!eventoId) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-red-600">Inscritos</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {erro && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {erro}
          </div>
        )}

        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        ) : inscritos.length > 0 ? (
          <div className="space-y-4">
            {inscritos.map((inscrito) => (
              <div
                key={inscrito.id}
                className="p-4 bg-red-50 rounded-lg hover:bg-red-100 cursor-pointer transition-colors"
                onClick={() => openProfileModal(inscrito)}
              >
                <p className="font-medium text-gray-700">
                  {inscrito.nome_completo || "Usuário sem nome"}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-center">Nenhum inscrito encontrado.</p>
        )}

        {/* Modal de Visualização do Perfil */}
        <div
          className={`fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-50 transition-opacity ${
            showProfileModal ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <div
            className={`bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 ${
              showProfileModal ? "scale-100" : "scale-95"
            }`}
          >
            <div className="bg-red-400 text-white p-4 rounded-t-lg flex justify-between items-center">
              <h3 className="text-xl font-bold">Perfil do Usuário</h3>
              <button
                onClick={() => setShowProfileModal(false)}
                className="text-white hover:text-red-100"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-6">
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-red-600 mb-4 border-b border-red-200 pb-2">
                  Informações Pessoais
                </h4>
                {dadosUsuario ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-600">Nome Completo</p>
                      <p className="font-medium">
                        {dadosUsuario.nome_completo || "Não informado"}
                      </p>
                    </div>
                   
                    <div>
                      <p className="text-gray-600">Gênero</p>
                      <p className="font-medium">
                        {dadosUsuario.genero || "Não informado"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Data de Nascimento</p>
                      <p className="font-medium">
                        {dadosUsuario.data_nascimento
                          ? new Date(
                              dadosUsuario.data_nascimento
                            ).toLocaleDateString("pt-BR")
                          : "Não informado"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Estado</p>
                      <p className="font-medium">
                        {dadosUsuario.uf || "Não informado"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Cidade</p>
                      <p className="font-medium">
                        {dadosUsuario.cidade_nome || "Não informado"}
                      </p>
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
                <h4 className="text-lg font-semibold text-red-600 mb-4 border-b border-red-200 pb-2">
                  Informações do Pet
                </h4>
                {dadosPets && dadosPets.length > 0 ? (
                  dadosPets.map((pet, index) => (
                    <div
                      key={index}
                      className="flex flex-col md:flex-row gap-6 items-start mb-6"
                    >
                      <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-red-200 shadow-md bg-gray-100 flex items-center justify-center">
                        {pet.foto ? (
                          <img
                            src={`http://localhost:3000${pet.foto}`}
                            alt={`Foto de ${pet.nome}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <svg
                            className="w-16 h-16 text-gray-400"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 12c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm6-1.8C18 6.57 15.35 4 12 4s-6 2.57-6 6.2c0 2.34 1.95 5.44 6 9.14 4.05-3.7 6-6.8 6-9.14zM12 2c4.2 0 8 3.22 8 8.2 0 3.32-2.67 7.25-8 11.8-5.33-4.55-8-8.48-8-11.8C4 5.22 7.8 2 12 2z" />
                          </svg>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow">
                        <div>
                          <p className="text-gray-600">Nome</p>
                          <p className="font-medium">
                            {pet.nome || "Não informado"}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Sexo</p>
                          <p className="font-medium">
                            {pet.sexo || "Não informado"}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Idade</p>
                          <p className="font-medium">
                            {pet.data_nascimento
                              ? calcularIdade(pet.data_nascimento)
                              : "Não informado"}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Porte</p>
                          <p className="font-medium">
                            {pet.porte || "Não informado"}
                          </p>
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
      </div>
    </div>
  );
};

export default ModalInscritos;