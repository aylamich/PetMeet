import { useState, useEffect, useContext } from "react";
import { AuthContext } from '../context/AuthContext'; // Para o logout

const InscritosAdmModal = ({ eventoId, onClose, onDesinscrever }) => {
  const [inscritos, setInscritos] = useState([]);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [dadosUsuario, setDadosUsuario] = useState(null);
  const [dadosPets, setDadosPets] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [mostrarModalConfirmacao, setMostrarModalConfirmacao] = useState(false);
  const [usuarioParaDesinscrever, setUsuarioParaDesinscrever] = useState(null);
  const { authFetch } = useContext(AuthContext); // Obter authFetch do AuthContext

  // Buscar inscritos do evento
  const fetchInscritos = async () => {
    if (!eventoId) {
      setErro("Evento inválido. Selecione um evento válido.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await authFetch(`/api/consultarinscritos?evento_id=${eventoId}`, {
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

  // Buscar dados do usuário inscrito
  const buscarDadosUsuario = async (usuarioId) => {
    try {
      const response = await authFetch(`/api/consultausuario?id=${usuarioId}`, {
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

  // Buscar dados dos pets do usuário
  const buscarDadosPets = async (usuarioId) => {
    try {
      const response = await authFetch(`/api/consultapets?usuario_id=${usuarioId}`, {
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

  // Abrir modal de perfil com dados do usuário e pets
  const openProfileModal = async (usuario) => {
    await Promise.all([
      buscarDadosUsuario(usuario.id),
      buscarDadosPets(usuario.id),
    ]);
    setShowProfileModal(true);
  };

  // Abrir modal de confirmação para desinscrever
  const handleDesinscrever = (usuario) => {
    setUsuarioParaDesinscrever(usuario);
    setMostrarModalConfirmacao(true);
  };

  // Confirmar desinscrição
  const confirmarDesinscricao = async () => {
    try {
      const response = await authFetch("/api/desinscrever", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuario_id: usuarioParaDesinscrever.id,
          evento_id: eventoId,
        }),
      });

      if (!response.ok) {
        let errorData = {};
        try {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            errorData = await response.json();
          } else {
            errorData = { error: `Erro ${response.status}: Resposta do servidor não é JSON` };
          }
        } catch (jsonError) {
          console.error("Falha ao parsear JSON de erro:", jsonError);
          errorData = { error: `Erro ${response.status}` };
        }
        throw new Error(errorData.error || "Erro ao desinscrever.");
      }

      const data = await response.json();
      await fetchInscritos(); // Atualiza a lista de inscritos
      setMensagem(data.message || "Desinscrição realizada com sucesso!");
      setTimeout(() => setMensagem(""), 3000);
      // Chama a callback para notificar GerenciarEventos
      if (onDesinscrever) {
        console.log("Chamando onDesinscrever no InscritosAdmModal");
        onDesinscrever();
      }
    } catch (error) {
      console.error("Erro ao desinscrever:", error);
      setErro(error.message || "Erro ao desinscrever.");
      setTimeout(() => setErro(""), 3000);
    } finally {
      setMostrarModalConfirmacao(false);
      setUsuarioParaDesinscrever(null);
    }
  };

  // Cancelar desinscrição
  const cancelarDesinscricao = () => {
    setMostrarModalConfirmacao(false);
    setUsuarioParaDesinscrever(null);
  };

  // Efeito que carrega os inscritos quando o eventoId muda
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
        {/* Cabeçalho do modal */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-black">Inscritos</h2>
          <button
            onClick={onClose}
            className="text-black hover:text-gray-600"
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

        {/* Mensagem de sucesso */}
        {mensagem && (
          <div className="mb-4 p-3 bg-gray-100 text-black rounded-md">
            {mensagem}
          </div>
        )}

        {/* Mensagem de erro */}
        {erro && (
          <div className="mb-4 p-3 bg-gray-100 text-black rounded-md">
            {erro}
          </div>
        )}

        {/* Lista de inscritos ou carregamento */}
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
                className="p-4 bg-gray-100 rounded-lg flex justify-between items-center hover:bg-gray-200 cursor-pointer transition-colors"
              >
                <div
                  className="flex-1"
                  onClick={() => openProfileModal(inscrito)}
                >
                  <p className="font-medium text-gray-700">
                    {inscrito.nome_completo || "Usuário sem nome"}
                  </p>
                </div>
                <button
                  onClick={() => handleDesinscrever(inscrito)}
                  className="text-black hover:text-gray-600 ml-2"
                  title="Desinscrever usuário"
                >
                  <svg
                    className="w-5 h-5"
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
            <div className="bg-gray-200 text-black p-4 rounded-t-lg flex justify-between items-center">
              <h3 className="text-xl font-bold">Perfil do Usuário</h3>
              <button
                onClick={() => setShowProfileModal(false)}
                className="text-black hover:text-gray-600"
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
                <h4 className="text-lg font-semibold text-black mb-4 border-b border-gray-200 pb-2">
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
                <h4 className="text-lg font-semibold text-black mb-4 border-b border-gray-200 pb-2">
                  Informações do Pet
                </h4>
                {dadosPets && dadosPets.length > 0 ? (
                  dadosPets.map((pet, index) => (
                    <div
                      key={index}
                      className="flex flex-col md:flex-row gap-6 items-start mb-6"
                    >
                      <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 shadow-md bg-gray-100 flex items-center justify-center">
                        <img
                        src={`/api/pet/foto/${pet.id}`}
                        alt={`Foto de ${pet.nome}`}
                        className="w-full h-full object-cover"
                        onError={(e) => (e.target.src = '/placeholder.jpg')} // Imagem padrão se falhar
                       />
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
                className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>

        {/* Modal de Confirmação de Desinscrição */}
        {mostrarModalConfirmacao && usuarioParaDesinscrever && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full">
              <h3 className="text-lg font-bold text-black mb-4">Confirmar Desinscrição</h3>
              <p className="text-sm text-gray-700 mb-6">
                Tem certeza que deseja desinscrever {usuarioParaDesinscrever.nome_completo || "este usuário"} deste evento?
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={cancelarDesinscricao}
                  className="bg-gray-200 text-black px-4 py-2 rounded-md hover:bg-gray-300"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarDesinscricao}
                  className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InscritosAdmModal;