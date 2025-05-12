import { useState, useEffect, useRef, useContext } from "react";
import { AuthContext } from '../context/AuthContext'; // Para o logout

const ComentariosAdmModal = ({ idEvento, isOpen, onClose }) => {
  const [comentarios, setComentarios] = useState([]);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [mostrarModalConfirmacao, setMostrarModalConfirmacao] = useState(false);
  const [idComentarioParaExcluir, setIdComentarioParaExcluir] = useState(null);
  const comentariosRef = useRef(null);
  const { authFetch } = useContext(AuthContext); // Obter authFetch do AuthContext

  // Busca a lista de comentários associados ao evento
  const fetchComentarios = async () => {
    try {
      console.log("Enviando idEvento:", idEvento);
      const response = await authFetch("/api/consultarcomentarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_evento: idEvento }),
      });
      console.log("Resposta recebida, status:", response.status);
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
          console.log("Erro da API:", errorData, "Status:", response.status);
        } catch (jsonError) {
          console.log("Falha ao parsear JSON de erro:", jsonError);
          errorData = { error: `Erro ${response.status}` };
        }
        throw new Error(errorData.error || `Erro ${response.status}`);
      }
      const data = await response.json();
      console.log("Comentários recebidos:", data);
      setComentarios(data);
    } catch (error) {
      console.error("Erro ao buscar comentários:", error);
      setErro(error.message || "Erro ao carregar comentários.");
      setTimeout(() => setErro(""), 3000);
    }
  };

  // Exclui um comentário
  const handleExcluirComentario = (id_comentario) => {
    setIdComentarioParaExcluir(id_comentario);
    setMostrarModalConfirmacao(true);
  };

  // Confirma a exclusão do comentário
  const confirmarExclusao = async () => {
    try {
      const response = await authFetch("/api/excluircomentarioadm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_comentario: idComentarioParaExcluir }),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Resposta do servidor não é JSON");
      }

      const data = await response.json();
      if (response.ok) {
        await fetchComentarios();
        setMensagem("Comentário excluído com sucesso!");
        setTimeout(() => setMensagem(""), 3000);
      } else {
        setErro(data.error || "Erro ao excluir comentário.");
        setTimeout(() => setErro(""), 3000);
      }
    } catch (error) {
      console.error("Erro ao excluir comentário:", error);
      setErro(`Erro ao excluir comentário: ${error.message}`);
      setTimeout(() => setErro(""), 3000);
    } finally {
      setMostrarModalConfirmacao(false);
      setIdComentarioParaExcluir(null);
    }
  };

  // Cancela a exclusão
  const cancelarExclusao = () => {
    setMostrarModalConfirmacao(false);
    setIdComentarioParaExcluir(null);
  };

  // Carrega comentários quando o modal é aberto
  useEffect(() => {
    if (isOpen && idEvento) {
      fetchComentarios();
    }
  }, [isOpen, idEvento]);

  // Rola para o final da lista de comentários quando atualizada
  useEffect(() => {
    if (comentariosRef.current) {
      comentariosRef.current.scrollTop = comentariosRef.current.scrollHeight;
    }
  }, [comentarios]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full relative flex flex-col h-[80vh]">
        {/* Botão de fechar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-black hover:text-gray-600 z-10"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <h2 className="text-xl font-bold text-black mb-4">Comentários</h2>
        {/* Mensagens */}
        {mensagem && (
          <div className="mb-4 p-3 bg-gray-100 text-black rounded-md text-sm">
            {mensagem}
          </div>
        )}
        {erro && (
          <div className="mb-4 p-3 bg-gray-100 text-black rounded-md text-sm">
            {erro}
          </div>
        )}
        {/* Lista de comentários */}
        <div
          ref={comentariosRef}
          className="flex-1 overflow-y-auto mb-4 space-y-3 max-h-[60vh]"
        >
          {comentarios.length > 0 ? (
            comentarios.map((comentario) => (
              <div
                key={comentario.id}
                className="p-3 bg-gray-100 rounded-lg flex justify-between items-start"
              >
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">
                    <strong>{comentario.nome_usuario}</strong> ·{" "}
                    {new Date(comentario.data_criacao).toLocaleDateString("pt-BR",)}
                  </p>
                  <p className="text-gray-700 text-sm">{comentario.comentario}</p>
                </div>
                <button
                  onClick={() => handleExcluirComentario(comentario.id)}
                  className="text-black hover:text-gray-600 ml-2"
                  title="Excluir comentário"
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
            ))
          ) : (
            <p className="text-gray-500 text-sm">Nenhum comentário ainda.</p>
          )}
        </div>
        {/* Modal de confirmação */}
        {mostrarModalConfirmacao && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full">
              <h3 className="text-lg font-bold text-black mb-4">Confirmar Exclusão</h3>
              <p className="text-sm text-gray-700 mb-6">
                Tem certeza que deseja excluir este comentário?
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={cancelarExclusao}
                  className="bg-gray-200 text-black px-4 py-2 rounded-md hover:bg-gray-300"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarExclusao}
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

export default ComentariosAdmModal;