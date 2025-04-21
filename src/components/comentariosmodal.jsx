import { useState, useEffect, useRef } from "react";

const ComentariosModal = ({ idEvento, idUsuario, isOpen, onClose }) => { // props para carregar comentários especificos e controlar o modal
  const [comentarios, setComentarios] = useState([]); // Armazena a lista de comentários recebida da API
  const [novoComentario, setNovoComentario] = useState(""); // Guarda o novo comentário a ser enviado pelo usuário
  const [mensagem, setMensagem] = useState(""); // Mensagem de sucesso 
  const [erro, setErro] = useState("");
  const [editandoId, setEditandoId] = useState(null); // ID do comentário que está sendo editado
  const [textoEditado, setTextoEditado] = useState(""); // Guarda o texto do comentário em edição.
  const [mostrarModalConfirmacao, setMostrarModalConfirmacao] = useState(false); // Estado para o modal de confirmação
  const [idComentarioParaExcluir, setIdComentarioParaExcluir] = useState(null); // Estado para armazenar o ID do comentário a excluir
  const comentariosRef = useRef(null); // Referência ao elemento <div> que contém a lista de comentários, usada para rolar automaticamente até o final quando novos comentários são carregados.

  // Logar idUsuario para depuração
  console.log("idUsuario recebido:", idUsuario);

  // Busca a lista de comentários associados ao evento da API
  const fetchComentarios = async () => {
    try {
      console.log("Enviando idEvento:", idEvento);
      const response = await fetch("/api/consultarcomentarios", {
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
      data.forEach((c) => console.log(`Comentário ID ${c.id}: id_usuario=${c.id_usuario}`));
      setComentarios(data); // Atualiza o estado com os comentários recebidos
    } catch (error) {
      console.error("Erro ao buscar comentários:", error);
      setErro(error.message || "Erro ao carregar comentários.");
      setTimeout(() => setErro(""), 3000); // Limpa a mensagem de erro após 3 segundos
    }
  };

  // Envia o novo comentário para a API
  const handleEnviarComentario = async () => {
    if (!idUsuario) { // Verifica se o usuário está logado
      setErro("Você precisa estar logado para comentar.");
      setTimeout(() => setErro(""), 3000);
      return;
    }
    if (!novoComentario.trim()) { // Verifica se o comentário não está vazio
      setErro("O comentário não pode estar vazio.");
      setTimeout(() => setErro(""), 3000);
      return;
    }

    try {
      // Envia o novo comentário para a API
      const response = await fetch("/api/comentarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_evento: idEvento,
          id_usuario: idUsuario,
          comentario: novoComentario,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setNovoComentario(""); // Limpa o campo de comentário após o envio
        await fetchComentarios(); // Atualiza a lista de comentários após o envio
        setMensagem("Comentário enviado com sucesso!");
        setTimeout(() => setMensagem(""), 3000);
      } else {
        setErro(data.error || "Erro ao enviar comentário.");
        setTimeout(() => setErro(""), 3000);
      }
    } catch (error) {
      console.error("Erro ao enviar comentário:", error);
      setErro("Erro ao enviar comentário. Tente novamente.");
      setTimeout(() => setErro(""), 3000);
    }
  };

  // Função para a exclusão de um comentário
  const handleExcluirComentario = async (id_comentario) => {
    setIdComentarioParaExcluir(id_comentario); // Armazena o ID do comentário
    setMostrarModalConfirmacao(true); // Mostra o modal de confirmação
  };

  // Função para confirmar a exclusão do comentário
  const confirmarExclusao = async () => {
    try {
      const response = await fetch("/api/excluircomentario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_comentario: idComentarioParaExcluir,
          id_usuario: idUsuario,
        }),
      });
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
      setErro("Erro ao excluir comentário. Tente novamente.");
      setTimeout(() => setErro(""), 3000);
    } finally {
      setMostrarModalConfirmacao(false); // Fecha o modal
      setIdComentarioParaExcluir(null); // Limpa o ID
    }
  };

  // Função para cancelar a exclusão do comentário
  const cancelarExclusao = () => {
    setMostrarModalConfirmacao(false); // Fecha o modal
    setIdComentarioParaExcluir(null); // Limpa o ID
  };

  // Função para iniciar a edição de um comentário
  const handleEditarComentario = (id_comentario, comentario) => {
    setEditandoId(id_comentario);
    setTextoEditado(comentario);
  };

  // Função para salvar a edição do comentário
  const handleSalvarEdicao = async (id_comentario) => {
    if (!textoEditado.trim()) {
      setErro("O comentário não pode estar vazio.");
      setTimeout(() => setErro(""), 3000);
      return;
    }

    try {
      // Envia o comentário editado para a API
      const response = await fetch("/api/editarcomentario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_comentario,
          id_usuario: idUsuario,
          comentario: textoEditado,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        // Sai do modo de edição, recarrega os comentários e exibe mensagem de sucesso
        setEditandoId(null);
        setTextoEditado("");
        await fetchComentarios();
        setMensagem("Comentário editado com sucesso!");
        setTimeout(() => setMensagem(""), 3000);
      } else {
        setErro(data.error || "Erro ao editar comentário.");
        setTimeout(() => setErro(""), 3000);
      }
    } catch (error) {
      console.error("Erro ao editar comentário:", error);
      setErro("Erro ao editar comentário. Tente novamente.");
      setTimeout(() => setErro(""), 3000);
    }
  };

  // Função para cancelar a edição de um comentário
  const handleCancelarEdicao = () => {
    setEditandoId(null);
    setTextoEditado("");
  };

  // Efeito para carregar comentários quando o modal é aberto
  useEffect(() => {
    if (isOpen && idEvento) {
      fetchComentarios();
    }
  }, [isOpen, idEvento]);

  // Efeito para rolar a lista de comentários até o final quando ela é atualizada
  useEffect(() => {
    if (comentariosRef.current) {
      comentariosRef.current.scrollTop = comentariosRef.current.scrollHeight; // Rola para o final da lista de comentários sempre que ela for atualizada
    }
  }, [comentarios]);

  if (!isOpen) return null; // Não renderiza nada se o modal não estiver aberto.

  // ****** Renderiza o modal de comentários ******
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full relative flex flex-col h-[80vh]">
        {/* Botão para fechar o modal */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 z-10"
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
        <h2 className="text-xl font-bold text-blue-900 mb-4">Comentários</h2>
        {/* Mensagens de sucesso ou erro */}
        {mensagem && (
          <div className="mb-4 p-2 bg-green-100 text-green-700 rounded-md text-sm">
            {mensagem}
          </div>
        )}
        {erro && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-md text-sm">
            {erro}
          </div>
        )}
        <div
          ref={comentariosRef} // Referência para rolar automaticamente
          className="flex-1 overflow-y-auto mb-4 space-y-3 max-h-[60vh]"
        >
          {comentarios.length > 0 ? (
            comentarios.map((comentario) => (
              // Renderiza cada comentário com estilo condicional (azul para o usuário logado)
              <div
                key={comentario.id}
                className={`p-3 rounded-2xl max-w-[80%] ${
                  comentario.id_usuario == idUsuario
                    ? "bg-blue-100 ml-auto"
                    : "bg-gray-100"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">
                      <strong>{comentario.nome_usuario}</strong> ·{" "}
                      {new Date(comentario.data_criacao).toLocaleString("pt-BR", { // Formata a data
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </p>
                    { /*Exibe textarea para edição ou o texto do comentário. */}
                    {editandoId === comentario.id ? (
                      <div>
                        <textarea
                          value={textoEditado}
                          onChange={(e) => setTextoEditado(e.target.value)}
                          className="w-full p-2 border rounded-md text-sm resize-none"
                          rows="2"
                          maxLength={500}
                        />
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => handleSalvarEdicao(comentario.id)}
                            className="bg-blue-900 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-800"
                          >
                            Salvar
                          </button>
                          <button
                            onClick={handleCancelarEdicao}
                            className="bg-gray-300 text-gray-700 px-3 py-1 rounded-md text-sm hover:bg-gray-400"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-700 text-sm">{comentario.comentario}</p>
                    )}
                  </div>
                  {/* Botões de editar/excluir aparecem apenas para comentários do usuário logado. */}
                  {Number(comentario.id_usuario) === Number(idUsuario) && // NUMBER é pra converter o idUsuario para número, já que ele vem como string da api
                    editandoId !== comentario.id && (
                      <div className="flex gap-2 ml-2">
                        <button
                          onClick={() =>
                            handleEditarComentario(comentario.id, comentario.comentario)
                          }
                          className="text-gray-600 hover:text-blue-900"
                          title="Editar comentário"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="icon icon-tabler icons-tabler-outline icon-tabler-pencil"
                          >
                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                            <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                            <path d="M13.5 6.5l4 4" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleExcluirComentario(comentario.id)}
                          className="text-gray-600 hover:text-red-600"
                          title="Excluir comentário"
                        >                
                        <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="icon icon-tabler icons-tabler-outline icon-tabler-trash"
                        >
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                        <path d="M4 7l16 0" />
                        <path d="M10 11l0 6" />
                        <path d="M14 11l0 6" />
                        <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
                        <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
                        </svg>
                        </button>
                      </div>
                    )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm">Nenhum comentário ainda.</p>
          )}
        </div>
        {/* Exibe campo de novo comentário se o usuário estiver logado, ou mensagem de login. */}
        {idUsuario ? (
          <div className="flex items-center gap-2 sticky bottom-0 bg-white pt-2">
            <textarea
              value={novoComentario}
              onChange={(e) => setNovoComentario(e.target.value)}
              placeholder="Escreva seu comentário..."
              className="flex-1 p-2 border rounded-full text-sm resize-none h-10"
              rows="1"
              maxLength={500}
            />
            <button
              onClick={handleEnviarComentario}
              className="bg-blue-900 text-white p-2 rounded-full hover:bg-blue-800 disabled:bg-gray-400"
              disabled={!novoComentario.trim()}
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
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </div>
        ) : (
          <p className="text-gray-500 text-sm">Faça login para comentar.</p>
        )}
        {/* Modal de confirmação de exclusão */}
        {mostrarModalConfirmacao && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full border border-red-300">
              <h3 className="text-lg font-medium text-red-800 mb-4">Confirmar Exclusão</h3>
              <p className="text-sm text-gray-700 mb-6">
                Tem certeza que deseja excluir este comentário?
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={cancelarExclusao}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarExclusao}
                  className="bg-red-400 text-white px-4 py-2 rounded-md hover:bg-red-300 focus:outline-none focus:ring-2 focus:ring-red-300"
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

export default ComentariosModal;