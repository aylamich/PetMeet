import { useState, useContext } from "react";
import { AuthContext } from '../context/AuthContext'; // Para o logout

const DenunciaModal = ({ isOpen, onClose, tipo, eventoId, usuarioDenunciadoId, usuarioDenunciadorId }) => {
  const [motivo, setMotivo] = useState("");
  const [motivoPersonalizado, setMotivoPersonalizado] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const { authFetch } = useContext(AuthContext); // Obter authFetch do AuthContext

  // Opções predefinidas de motivo
  const motivosPredefinidos = [
    "Conteúdo impróprio",
    "Comportamento inadequado",
    "Spam ou propaganda",
    "Outro",
  ];

  // Envia a denúncia para a API
  const handleEnviarDenuncia = async () => {
    if (!motivo && !motivoPersonalizado.trim()) {
      setErro("Selecione ou digite um motivo para a denúncia.");
      setTimeout(() => setErro(""), 3000);
      return;
    }

    setLoading(true);
    try {
      const motivoFinal = motivo === "Outro" ? motivoPersonalizado : motivo;
      const body = {
        tipo,
        ...(tipo === "EVENTO" ? { evento_id: eventoId } : { usuario_denunciado_id: usuarioDenunciadoId }),
        usuario_denunciador_id: usuarioDenunciadorId,
        motivo: motivoFinal || null,
      };

      const response = await authFetch("/api/denunciar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (response.ok) {
        setMensagem("Denúncia enviada com sucesso!");
        setTimeout(() => {
          setMensagem("");
          onClose();
        }, 2000);
      } else {
        setErro(data.error || "Erro ao enviar denúncia.");
        setTimeout(() => setErro(""), 3000);
      }
    } catch (error) {
      console.error("Erro ao enviar denúncia:", error);
      setErro("Erro ao enviar denúncia. Tente novamente.");
      setTimeout(() => setErro(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-red-600">Denunciar {tipo === "EVENTO" ? "Evento" : "Usuário"}</h3>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900"
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
        </div>

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

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Motivo da denúncia
          </label>
          <select
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            className="w-full p-2 border rounded-md text-sm"
          >
            <option value="">Selecione um motivo</option>
            {motivosPredefinidos.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {motivo === "Outro" && (
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Descreva o motivo
            </label>
            <textarea
              value={motivoPersonalizado}
              onChange={(e) => setMotivoPersonalizado(e.target.value)}
              className="w-full p-2 border rounded-md text-sm resize-none"
              rows="3"
              maxLength={500}
              placeholder="Explique o motivo da denúncia..."
            />
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            onClick={handleEnviarDenuncia}
            className="px-4 py-2 bg-red-400 text-white rounded-md hover:bg-red-500 disabled:bg-gray-400"
            disabled={loading || (!motivo && !motivoPersonalizado.trim())}
          >
            {loading ? "Enviando..." : "Enviar Denúncia"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DenunciaModal;