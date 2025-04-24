import { useState, useEffect } from "react";
import MenuAdm from "../components/MenuAdm";
import ProfileModal from "../components/PerfilModal";

const GerenciarUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedUsuarioId, setSelectedUsuarioId] = useState(null);
  const [modalConfirmacaoAberto, setModalConfirmacaoAberto] = useState(false);
  const [usuarioParaExcluir, setUsuarioParaExcluir] = useState(null);
  const [filtroDenunciados, setFiltroDenunciados] = useState(false);
  const [modalDenunciasAberto, setModalDenunciasAberto] = useState(false); // Novo estado para modal de denúncias
  const [denuncias, setDenuncias] = useState([]); // Novo estado para denúncias
  const [usuarioDenunciadoNome, setUsuarioDenunciadoNome] = useState(""); // Nome do usuário denunciado

  // Buscar todos os usuários ou usuários denunciados
  const fetchUsuarios = async (filtro = '') => {
    try {
      setLoading(true);
      const url = filtro ? `/api/consultausuarios?filtro=${filtro}` : '/api/consultausuarios';
      const response = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }
      const data = await response.json();
      setUsuarios(data);
      setErro("");
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      setErro("Não foi possível carregar os usuários. Verifique a conexão ou tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // Buscar denúncias de um usuário
  const fetchDenunciasUsuario = async (usuarioId, nomeCompleto) => {
    try {
      const response = await fetch(`/api/consultardenunciasusuario?usuario_id=${usuarioId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }
      const data = await response.json();
      setDenuncias(data);
      setUsuarioDenunciadoNome(nomeCompleto);
      setModalDenunciasAberto(true);
    } catch (error) {
      console.error("Erro ao buscar denúncias:", error);
      setErro("Não foi possível carregar as denúncias. Tente novamente.");
      setTimeout(() => setErro(""), 3000);
    }
  };

  // Abrir modal de perfil
  const openProfileModal = (usuario) => {
    setSelectedUsuarioId(usuario.id);
    setShowProfileModal(true);
  };

  // Abrir modal de confirmação de exclusão
  const handleExcluir = (usuario) => {
    setUsuarioParaExcluir(usuario);
    setModalConfirmacaoAberto(true);
  };

  // Confirmar exclusão do usuário
  const confirmarExclusao = async () => {
    try {
      const response = await fetch("/api/excluirusuario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: usuarioParaExcluir.id }),
      });

      const data = await response.json();
      if (response.ok) {
        setMensagem("Usuário excluído com sucesso!");
        setModalConfirmacaoAberto(false);
        setUsuarioParaExcluir(null);
        fetchUsuarios(filtroDenunciados ? 'denunciados' : '');
        setTimeout(() => setMensagem(""), 3000);
      } else {
        setErro(data.error || "Erro ao excluir usuário.");
      }
    } catch (error) {
      console.error("Erro ao excluir usuário:", error);
      setErro("Erro ao excluir usuário. Tente novamente.");
    }
  };

  // Fechar modal de confirmação
  const fecharModalConfirmacao = () => {
    setModalConfirmacaoAberto(false);
    setUsuarioParaExcluir(null);
  };

  // Fechar modal de denúncias
  const fecharModalDenuncias = () => {
    setModalDenunciasAberto(false);
    setDenuncias([]);
    setUsuarioDenunciadoNome("");
  };

  // Carregar usuários ao montar o componente ou mudar o filtro
  useEffect(() => {
    fetchUsuarios(filtroDenunciados ? 'denunciados' : '');
  }, [filtroDenunciados]);

  return (
    <div className="min-h-screen bg-white">
      <MenuAdm />
      <div className="pt-24 px-6 max-w-5xl mx-auto">
        <div className="flex items-center gap-2 mb-10">
          <h1 className="text-4xl font-bold text-black">Gerenciar Usuários</h1>
          <svg
            className="w-8 h-8 text-black"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 4a4 4 0 100 8 4 4 0 000-8zm0 10c-4.418 0-8 1.79-8 4v2h16v-2c0-2.21-3.582-4-8-4z"
            />
          </svg>
        </div>

        {mensagem && (
          <div className="mb-4 p-3 bg-gray-100 text-black rounded-md">
            {mensagem}
          </div>
        )}
        {erro && (
          <div className="mb-4 p-3 bg-gray-100 text-black rounded-md">
            {erro}
          </div>
        )}

        <div className="flex space-x-6 mb-8 relative items-center">
          <div className="relative">
            <button
              onClick={() => setFiltroDenunciados(!filtroDenunciados)}
              className={`flex items-center gap-2 py-2 px-4 rounded-md hover:bg-gray-300 ${
                filtroDenunciados ? 'bg-red-600 text-white' : 'bg-gray-200 text-black'
              }`}
            >
              🚨 {filtroDenunciados ? 'Mostrar Todos' : 'Denunciados'}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        ) : usuarios.length > 0 ? (
          <div className="space-y-4">
            {usuarios.map((usuario) => (
              <div
                key={usuario.id}
                className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors flex items-center justify-between"
                onClick={() => openProfileModal(usuario)}
              >
                <p className="font-medium text-gray-700">
                  {usuario.nome_completo || "Usuário sem nome"}
                </p>
                <div className="flex items-center gap-2">
                  {filtroDenunciados && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        fetchDenunciasUsuario(usuario.id, usuario.nome_completo);
                      }}
                      className="text-red-600 hover:text-red-900"
                      title="Ver denúncias"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExcluir(usuario);
                    }}
                    className="text-black hover:text-gray-600"
                    title="Excluir usuário"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4M3 7h18"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-500">
            Nenhum usuário encontrado.
          </div>
        )}

        <ProfileModal
          usuarioId={selectedUsuarioId}
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
        />

        {modalConfirmacaoAberto && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-xl font-bold text-black mb-4">
                Confirmar Exclusão
              </h2>
              <p className="text-gray-700 mb-6">
                Tem certeza que deseja excluir o usuário{" "}
                {usuarioParaExcluir?.nome_completo || "Usuário sem nome"}?
              </p>
              <div className="flex gap-4">
                <button
                  onClick={confirmarExclusao}
                  className="flex-1 bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800"
                >
                  Confirmar
                </button>
                <button
                  onClick={fecharModalConfirmacao}
                  className="flex-1 bg-gray-200 text-black py-2 px-4 rounded-md hover:bg-gray-300"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {modalDenunciasAberto && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-xl font-bold text-black mb-4">
                Denúncias contra {usuarioDenunciadoNome || "Usuário"}
              </h2>
              {denuncias.length > 0 ? (
                <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                  {denuncias.map((denuncia, index) => (
                    <div key={index} className="p-4 bg-gray-100 rounded-md">
                      <p className="text-sm text-gray-600">
                        <strong>Motivo:</strong> {denuncia.motivo || "Não informado"}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Denunciador:</strong> {denuncia.denunciador || "Anônimo"}
                      </p>
                      <p className="text-sm text-gray-600">
                      <strong>Data:</strong>{" "}
                      {new Date(denuncia.data_denuncia).toLocaleString("pt-BR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-700 mb-6">Nenhuma denúncia encontrada.</p>
              )}
              <div className="flex justify-end mt-4">
                <button
                  onClick={fecharModalDenuncias}
                  className="bg-gray-200 text-black py-2 px-4 rounded-md hover:bg-gray-300"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GerenciarUsuarios;