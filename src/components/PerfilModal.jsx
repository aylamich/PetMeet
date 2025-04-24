import { useState, useEffect } from "react";

const PerfilModal = ({ usuarioId, isOpen, onClose }) => {
  const [dadosUsuario, setDadosUsuario] = useState(null);
  const [dadosPets, setDadosPets] = useState(null);
  const [loading, setLoading] = useState(true);

  // Buscar dados do usuário
  const buscarDadosUsuario = async (id) => {
    try {
      const response = await fetch(`/api/consultausuario?id=${id}`, {
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
  const buscarDadosPets = async (id) => {
    try {
      const response = await fetch(`/api/consultapets?usuario_id=${id}`, {
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

  // Carregar dados quando o modal abrir
  useEffect(() => {
    if (isOpen && usuarioId) {
      setLoading(true);
      Promise.all([buscarDadosUsuario(usuarioId), buscarDadosPets(usuarioId)]).then(() => {
        setLoading(false);
      });
    }
  }, [isOpen, usuarioId]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 transition-opacity overflow-auto"
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100"
      >
        <div className="bg-gray-900 text-white p-4 rounded-t-lg flex justify-between items-center">
          <h3 className="text-xl font-bold">Perfil do Usuário</h3>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300"
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
            <h4 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
              Informações Pessoais
            </h4>
            {loading ? (
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ) : dadosUsuario ? (
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
                      ? new Date(dadosUsuario.data_nascimento).toLocaleDateString("pt-BR")
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
              <p className="text-gray-600">Não foi possível carregar as informações do usuário.</p>
            )}
          </div>

          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
              Informações do Pet
            </h4>
            {loading ? (
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ) : dadosPets && dadosPets.length > 0 ? (
              dadosPets.map((pet, index) => (
                <div
                  key={index}
                  className="flex flex-col md:flex-row gap-6 items-start mb-6"
                >
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 shadow-md bg-gray-100 flex items-center justify-center">
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
            onClick={onClose}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default PerfilModal;