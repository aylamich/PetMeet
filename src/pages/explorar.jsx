import { useState, useEffect } from "react";
import Menu from "../components/Menu";

const Explorar = () => {
  const [eventos, setEventos] = useState([]);
  const [filtros, setFiltros] = useState({});
  const [modalAberto, setModalAberto] = useState(false);
  const [eventoSelecionado, setEventoSelecionado] = useState(null);
  const [mostrarFiltroLocalizacao, setMostrarFiltroLocalizacao] = useState(false);
  const [mostrarFiltroPorte, setMostrarFiltroPorte] = useState(false);
  const [mostrarFiltroRaca, setMostrarFiltroRaca] = useState(false);
  const [estadoSelecionado, setEstadoSelecionado] = useState("");
  const [cidadeSelecionada, setCidadeSelecionada] = useState("");
  const [cidades, setCidades] = useState([]);
  const [racaDigitada, setRacaDigitada] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [inscricoes, setInscricoes] = useState({});
  const idUsuario = localStorage.getItem("usuario_id");

  const estados = [
    { uf: "AC", nome: "Acre" },
    { uf: "AL", nome: "Alagoas" },
    { uf: "AP", nome: "Amapá" },
    { uf: "AM", nome: "Amazonas" },
    { uf: "BA", nome: "Bahia" },
    { uf: "CE", nome: "Ceará" },
    { uf: "DF", nome: "Distrito Federal" },
    { uf: "ES", nome: "Espírito Santo" },
    { uf: "GO", nome: "Goiás" },
    { uf: "MA", nome: "Maranhão" },
    { uf: "MT", nome: "Mato Grosso" },
    { uf: "MS", nome: "Mato Grosso do Sul" },
    { uf: "MG", nome: "Minas Gerais" },
    { uf: "PA", nome: "Pará" },
    { uf: "PB", nome: "Paraíba" },
    { uf: "PR", nome: "Paraná" },
    { uf: "PE", nome: "Pernambuco" },
    { uf: "PI", nome: "Piauí" },
    { uf: "RJ", nome: "Rio de Janeiro" },
    { uf: "RN", nome: "Rio Grande do Norte" },
    { uf: "RS", nome: "Rio Grande do Sul" },
    { uf: "RO", nome: "Rondônia" },
    { uf: "RR", nome: "Roraima" },
    { uf: "SC", nome: "Santa Catarina" },
    { uf: "SP", nome: "São Paulo" },
    { uf: "SE", nome: "Sergipe" },
    { uf: "TO", nome: "Tocantins" },
  ];

  const fetchCidades = async (uf) => {
    try {
      const response = await fetch("/api/consultacidadeporUF", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ufSelecionado: uf }),
      });
      if (!response.ok) throw new Error("Erro ao buscar cidades");
      const data = await response.json();
      const cidadesNormalizadas = Array.isArray(data)
        ? data.map((cidade) => ({
            id: cidade.id || cidade.idCidade || cidade.ID,
            nome: cidade.nome || cidade.nomeCidade || cidade.Nome || "",
          }))
        : [];
      setCidades(cidadesNormalizadas);
    } catch (error) {
      console.error("Erro ao buscar cidades:", error);
      setCidades([]);
    }
  };

  const fetchEventos = async (filtro = {}) => {
    try {
      // Buscar eventos
      const response = await fetch("/api/consultareventos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(filtro),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }
      const data = await response.json();
      setEventos(data);
      setErro("");

      // Buscar inscrições do usuário
      if (idUsuario) {
        try {
          const responseInscritos = await fetch("/api/eventosInscritos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ usuario_id: idUsuario, filtro: "em_breve" }),
          });
          if (responseInscritos.ok) {
            const eventosInscritos = await responseInscritos.json();
            const novasInscricoes = {};
            data.forEach((evento) => {
              novasInscricoes[evento.id] = eventosInscritos.some(
                (inscrito) => inscrito.id === evento.id
              );
            });
            setInscricoes(novasInscricoes);
          } else {
            console.warn("Falha ao buscar eventos inscritos:", responseInscritos.status);
            const novasInscricoes = {};
            data.forEach((evento) => {
              novasInscricoes[evento.id] = false;
            });
            setInscricoes(novasInscricoes);
          }
        } catch (error) {
          console.error("Erro ao buscar eventos inscritos:", error);
          const novasInscricoes = {};
          data.forEach((evento) => {
            novasInscricoes[evento.id] = false;
          });
          setInscricoes(novasInscricoes);
        }
      }
    } catch (error) {
      console.error("Erro ao buscar eventos:", error);
      if (!eventos.length) {
        setErro("Não foi possível carregar os eventos. Tente novamente.");
      }
    }
  };

  const handleInscrever = async (evento_id) => {
    if (!idUsuario) {
      setErro("Você precisa estar logado para se inscrever.");
      setTimeout(() => setErro(""), 3000);
      return;
    }

    try {
      const response = await fetch("/api/inscrever", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario_id: idUsuario, evento_id }),
      });

      const data = await response.json();
      if (response.ok) {
        setMensagem("Inscrição realizada com sucesso!");
        setInscricoes((prev) => ({ ...prev, [evento_id]: true }));
        setTimeout(() => setMensagem(""), 3000);
      } else {
        setErro(data.error || "Erro ao realizar inscrição.");
        setTimeout(() => setErro(""), 3000);
      }
    } catch (error) {
      console.error("Erro ao inscrever:", error);
      setErro("Erro ao realizar inscrição. Tente novamente.");
      setTimeout(() => setErro(""), 3000);
    }
  };

  useEffect(() => {
    fetchEventos(filtros);

    const handleFocus = () => {
      fetchEventos(filtros);
    };

    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [filtros]);

  const handleFiltroLocalizacao = () => {
    const novosFiltros = { ...filtros };
    if (estadoSelecionado) {
      novosFiltros.uf = estadoSelecionado;
      if (cidadeSelecionada) {
        novosFiltros.id_cidade = cidadeSelecionada;
      } else {
        delete novosFiltros.id_cidade;
      }
    } else {
      delete novosFiltros.uf;
      delete novosFiltros.id_cidade;
    }
    setFiltros(novosFiltros);
    setMostrarFiltroLocalizacao(false);
  };

  const limparFiltroLocalizacao = () => {
    setEstadoSelecionado("");
    setCidadeSelecionada("");
    setCidades([]);
    setMostrarFiltroLocalizacao(false);
    const novosFiltros = { ...filtros };
    delete novosFiltros.uf;
    delete novosFiltros.id_cidade;
    setFiltros(novosFiltros);
  };

  const handleFiltroPorte = (porte) => {
    const novosFiltros = { ...filtros };
    if (porte) {
      novosFiltros.porte = porte;
    } else {
      delete novosFiltros.porte;
    }
    setFiltros(novosFiltros);
    setMostrarFiltroPorte(false);
  };

  const handleFiltroRaca = () => {
    const novosFiltros = { ...filtros };
    if (racaDigitada) {
      novosFiltros.raca = racaDigitada;
    } else {
      delete novosFiltros.raca;
    }
    setFiltros(novosFiltros);
    setMostrarFiltroRaca(false);
    setRacaDigitada("");
  };

  const limparTodosFiltros = () => {
    setFiltros({});
    setEstadoSelecionado("");
    setCidadeSelecionada("");
    setCidades([]);
    setRacaDigitada("");
    setMostrarFiltroLocalizacao(false);
    setMostrarFiltroPorte(false);
    setMostrarFiltroRaca(false);
  };

  const abrirModal = (evento) => {
    setEventoSelecionado(evento);
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setEventoSelecionado(null);
  };

  return (
    <div className="min-h-screen">
      <Menu />
      <div className="pt-24 px-6 max-w-5xl mx-auto">
        <div className="flex items-center gap-2 mb-10">
          <h1 className="text-4xl font-bold text-blue-900">Explorar</h1>
          <svg
            className="w-8 h-8 text-blue-900"
            fill="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 10c-1.32 0-1.983.421-2.931 1.924l-.244.398-.395.688a50.89 50.89 0 0 0-.141.254c-.24.434-.571.753-1.139 1.142l-.55.365c-.94.627-1.432 1.118-1.707 1.955-.124.338-.196.853-.193 1.28 0 1.687 1.198 2.994 2.8 2.994l.242-.006c.119-.006.234-.017.354-.034l.248-.043.132-.028.291-.073.162-.045.57-.17.763-.243.455-.136c.53-.15.94-.222 1.283-.222.344 0 .753.073 1.283.222l.455.136.764.242.569.171.312.084c.097.024.187.045.273.062l.248.043c.12.017.235.028.354.034l.242.006c1.602 0 2.8-1.307 2.8-3 0-.427-.073-.939-.207-1.306-.236-.724-.677-1.223-1.48-1.83l-.257-.19-.528-.38c-.642-.47-1.003-.826-1.253-1.278l-.27-.485-.252-.432C13.042 10.421 12.435 10 12 10z" />
            <path d="M19.78 7h-.03c-1.219.02-2.35 1.066-2.908 2.504-.69 1.775-.348 3.72 1.075 4.333.256.109.527.163.801.163 1.231 0 2.38-1.053 2.943-2.504.686-1.774.34-3.72-1.076-4.332a2.05 2.05 0 0 0-.804-.164zM9.025 3c-.112 0-.185.002-.27.015l-.093.016c-1.532.206-2.397 1.989-2.108 3.855.272 1.725 1.462 3.114 2.92 3.114l.187-.005a1.26 1.26 0 0 0 .084-.01l.092-.016c1.533-.206 2.397-1.989 2.108-3.855-.27-1.727-1.46-3.114-2.92-3.114zM14.972 3c-1.459 0-2.647 1.388-2.916 3.113-.29 1.867.574 3.65 2.174 3.867.103.013.2.02.296.02 1.39 0 2.543-1.265 2.877-2.883l.041-.23c.29-1.867-.574-3.65-2.174-3.867a2.154 2.154 0 0 0-.298-.020zM4.217 7c-.274 0-.544.054-.797.161-1.426.615-1.767 2.562-1.078 4.335.563 1.451 1.71 2.504 2.941 2.504.274 0 .544-.054.797-.161 1.426-.615 1.767-2.562 1.078-4.335C6.595 8.053 5.448 7 4.217 7z" />
          </svg>
        </div>

        {mensagem && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
            {mensagem}
          </div>
        )}
        {erro && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {erro}
          </div>
        )}

        <div className="flex space-x-6 mb-8 relative items-center">
          <div className="relative">
            <button
              onClick={() => setMostrarFiltroLocalizacao(!mostrarFiltroLocalizacao)}
              className="flex items-center gap-2 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300"
            >
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 2c3.866 0 7 3.134 7 7 0 4.418-7 13-7 13S5 13.418 5 9c0-3.866 3.134-7 7-7z"
                />
                <circle cx="12" cy="9" r="2.5" />
              </svg>
              Localização
            </button>
            {mostrarFiltroLocalizacao && (
              <div className="absolute top-12 left-0 bg-white p-4 rounded-md shadow-md z-10 w-64">
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Estado</label>
                  <select
                    value={estadoSelecionado}
                    onChange={(e) => {
                      const uf = e.target.value;
                      setEstadoSelecionado(uf);
                      setCidadeSelecionada("");
                      if (uf) {
                        fetchCidades(uf);
                      } else {
                        setCidades([]);
                        setFiltros({ ...filtros, uf: undefined, id_cidade: undefined });
                      }
                    }}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Selecione um estado</option>
                    {estados.map((estado) => (
                      <option key={estado.uf} value={estado.uf}>
                        {estado.nome}
                      </option>
                    ))}
                  </select>
                </div>
                {estadoSelecionado && (
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Cidade (opcional)</label>
                    <select
                      value={cidadeSelecionada}
                      onChange={(e) => setCidadeSelecionada(e.target.value)}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="">Todas as cidades</option>
                      {cidades.length > 0 ? (
                        cidades.map((cidade, index) => (
                          <option key={cidade.id || index} value={cidade.id}>
                            {cidade.nome || "Nome indisponível"}
                          </option>
                        ))
                      ) : (
                        <option disabled>Nenhuma cidade disponível</option>
                      )}
                    </select>
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={handleFiltroLocalizacao}
                    className="bg-blue-900 text-white py-2 px-4 rounded-md hover:bg-blue-800"
                  >
                    Aplicar
                  </button>
                  <button
                    onClick={limparFiltroLocalizacao}
                    className="bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300"
                  >
                    Limpar
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setMostrarFiltroPorte(!mostrarFiltroPorte)}
              className="flex items-center gap-2 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300"
            >
              🐕 Porte
            </button>
            {mostrarFiltroPorte && (
              <div className="absolute top-12 left-0 bg-white p-4 rounded-md shadow-md z-10 w-48">
                <select
                  onChange={(e) => handleFiltroPorte(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Todos os portes</option>
                  <option value="Pequeno">Pequeno</option>
                  <option value="Médio">Médio</option>
                  <option value="Grande">Grande</option>
                </select>
              </div>
            )}
          </div>

          <div className="relative">
            {mostrarFiltroRaca ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={racaDigitada}
                  onChange={(e) => setRacaDigitada(e.target.value)}
                  placeholder="Digite a raça"
                  className="p-2 border rounded-md w-48"
                />
                <button
                  onClick={handleFiltroRaca}
                  className="bg-blue-900 text-white py-2 px-4 rounded-md hover:bg-blue-800"
                >
                  Filtrar
                </button>
              </div>
            ) : (
              <button
                onClick={() => setMostrarFiltroRaca(true)}
                className="flex items-center gap-2 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300"
              >
                🐾 Raça
              </button>
            )}
          </div>

          <button
            onClick={limparTodosFiltros}
            className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600"
          >
            Limpar Filtros
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {eventos.length > 0 ? (
            eventos.map((evento) => (
              <div
                key={evento.id}
                className="bg-white p-6 rounded-lg shadow-md"
              >
                <img
                  src={evento.foto || "https://via.placeholder.com/150"}
                  alt={evento.nome}
                  className="w-full h-40 object-cover rounded-md mb-4"
                />
                <h2 className="text-xl font-semibold text-blue-900">
                  {evento.nome}
                </h2>
                <p className="text-gray-600 text-sm">
                  Criado por: {evento.nome_usuario || "Desconhecido"}
                </p>
                <p className="text-gray-600 text-sm">
                  Inscritos: {evento.total_inscritos || 0}
                </p>
                <p className="text-gray-600">
                  {new Date(evento.inicio).toLocaleDateString("pt-BR")} -{" "}
                  {new Date(evento.fim).toLocaleDateString("pt-BR")}
                </p>
                <p className="text-gray-600">
                  {evento.nome_cidade}, {evento.uf}
                </p>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => abrirModal(evento)}
                    className="flex-1 bg-blue-900 text-white py-2 px-4 rounded-md hover:bg-blue-800"
                  >
                    Ver Detalhes
                  </button>
                  {idUsuario && evento.id_usuario != idUsuario && (
                    <button
                      onClick={() => handleInscrever(evento.id)}
                      className={`flex-1 ${
                        inscricoes[evento.id]
                          ? "bg-red-400 text-white cursor-default"
                          : "bg-red-400 text-white hover:bg-red-500"
                      } py-2 px-4 rounded-md`}
                      disabled={inscricoes[evento.id] || new Date(evento.inicio) < new Date()}
                    >
                      {inscricoes[evento.id]
                        ? "Inscrito"
                        : new Date(evento.inicio) < new Date()
                        ? "Encerrado"
                        : "Inscrever-se"}
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-500 col-span-full">
              Nenhum evento encontrado.
            </div>
          )}
        </div>
      </div>

      {modalAberto && eventoSelecionado && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 overflow-y-auto"
          onClick={fecharModal}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[calc(100vh-2rem)] overflow-y-auto relative my-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={fecharModal}
              className="fixed top-6 right-6 text-gray-600 hover:text-gray-900 z-10 md:static md:top-4 md:right-4"
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
            <h2 className="text-2xl font-bold text-blue-900 mb-4">
              {eventoSelecionado.nome}
            </h2>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-64">
                <img
                  src={eventoSelecionado.foto || "https://via.placeholder.com/150"}
                  alt={eventoSelecionado.nome}
                  className="w-full h-40 object-cover rounded-md mb-4"
                />
                <div className="space-y-2 text-gray-700">
                  <p className="text-sm break-words">
                    <strong>Descrição:</strong> {eventoSelecionado.descricao}
                  </p>
                </div>
              </div>
              <div className="flex-1 space-y-2 text-gray-700">
                <p>
                  <strong>Criado por:</strong>{" "}
                  {eventoSelecionado.nome_usuario || "Desconhecido"}
                </p>
                <p>
                  <strong>Inscritos:</strong> {eventoSelecionado.total_inscritos || 0}
                </p>
                <p>
                  <strong>Data de Início:</strong>{" "}
                  {new Date(eventoSelecionado.inicio).toLocaleDateString("pt-BR")}{" "}
                  {new Date(eventoSelecionado.inicio).toLocaleTimeString("pt-BR")}
                </p>
                <p>
                  <strong>Data de Fim:</strong>{" "}
                  {new Date(eventoSelecionado.fim).toLocaleDateString("pt-BR")}{" "}
                  {new Date(eventoSelecionado.fim).toLocaleTimeString("pt-BR")}
                </p>
                <p>
                  <strong>Local:</strong> {eventoSelecionado.rua}, {eventoSelecionado.numero}
                  {eventoSelecionado.complemento
                    ? `, ${eventoSelecionado.complemento}`
                    : ""}{" "}
                  - {eventoSelecionado.bairro}, {eventoSelecionado.nome_cidade},{" "}
                  {eventoSelecionado.uf}
                </p>
                <p>
                  <strong>Porte:</strong> {eventoSelecionado.porte}
                </p>
                <p>
                  <strong>Sexo:</strong> {eventoSelecionado.sexo}
                </p>
                {eventoSelecionado.raca && (
                  <p>
                    <strong>Raça:</strong> {eventoSelecionado.raca}
                  </p>
                )}
              </div>
            </div>
            <div className="mt-6 flex gap-2">
              {idUsuario && eventoSelecionado.id_usuario != idUsuario && (
                <button
                  onClick={() => handleInscrever(eventoSelecionado.id)}
                  className={`flex-1 ${
                    inscricoes[eventoSelecionado.id]
                      ? "bg-red-400 text-white cursor-default"
                      : "bg-red-400 text-white hover:bg-red-500"
                  } py-2 px-4 rounded-md`}
                  disabled={inscricoes[eventoSelecionado.id] || new Date(eventoSelecionado.inicio) < new Date()}
                >
                  {inscricoes[eventoSelecionado.id]
                    ? "Inscrito"
                    : new Date(eventoSelecionado.inicio) < new Date()
                    ? "Encerrado"
                    : "Inscrever-se"}
                </button>
              )}
              <button
                onClick={fecharModal}
                className="flex-1 bg-blue-900 text-white py-2 px-4 rounded-md hover:bg-blue-800"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Explorar;