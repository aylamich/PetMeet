import { useState, useEffect } from "react";
import MenuAdm from "../components/MenuAdm";
import ModalInscritos from "../components/modalinscritosadm";
import ComentariosAdmModal from "../components/comentariosadmmodal";

const GerenciarEventos = () => {
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
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [modalInscritosAberto, setModalInscritosAberto] = useState(false);
  const [idEventoInscritos, setIdEventoInscritos] = useState(null);
  const [modalConfirmacaoAberto, setModalConfirmacaoAberto] = useState(false);
  const [eventoParaExcluir, setEventoParaExcluir] = useState(null);
  const [modalComentariosAberto, setModalComentariosAberto] = useState(false);
  const [idEventoComentarios, setIdEventoComentarios] = useState(null);

  const [filtroDenunciados, setFiltroDenunciados] = useState(false);
  const [modalDenunciasAberto, setModalDenunciasAberto] = useState(false);
  const [denuncias, setDenuncias] = useState([]);
  const [eventoDenunciadoNome, setEventoDenunciadoNome] = useState("");

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
      console.log("Buscando eventos com filtros:", filtro, "Denunciados:", filtroDenunciados);
      const url = filtroDenunciados ? "/api/consultareventosdenunciados" : "/api/consultareventos";
      const options = filtroDenunciados
        ? { method: "GET", headers: { "Content-Type": "application/json" } }
        : {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(filtro),
          };
      const response = await fetch(url, options);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }
      const data = await response.json();
      console.log("Eventos recebidos:", data);
      setEventos(data);
      setErro("");
    } catch (error) {
      console.error("Erro ao buscar eventos:", error);
      setErro("Não foi possível carregar os eventos. Tente novamente.");
    }
  };

  const fetchDenunciasEvento = async (eventoId, nomeEvento) => {
    try {
      const response = await fetch(`/api/consultardenunciasevento?evento_id=${eventoId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }
      const data = await response.json();
      console.log("Denúncias recebidas para evento", eventoId, ":", data);
      setDenuncias(data);
      setEventoDenunciadoNome(nomeEvento);
      setModalDenunciasAberto(true);
    } catch (error) {
      console.error("Erro ao buscar denúncias:", error);
      setErro("Não foi possível carregar as denúncias. Tente novamente.");
      setTimeout(() => setErro(""), 3000);
    }
  };

  useEffect(() => {
    setEventos([]);
    fetchEventos(filtros);
   }, [filtros, filtroDenunciados]);


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
    setFiltroDenunciados(false);
  };

  const abrirModal = (evento) => {
    setEventoSelecionado(evento);
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setEventoSelecionado(null);
  };

  const abrirModalInscritos = (idEvento) => {
    if (!idEvento) {
      console.error("idEvento está indefinido ou null");
      setErro("Erro: Nenhum evento selecionado.");
      return;
    }
    setIdEventoInscritos(idEvento);
    setModalInscritosAberto(true);
  };

  const fecharModalInscritos = () => {
    setModalInscritosAberto(false);
    setIdEventoInscritos(null);
  };

  const handleExcluir = (evento) => {
    setEventoParaExcluir(evento);
    setModalConfirmacaoAberto(true);
  };

  const abrirModalComentarios = (idEvento) => {
    if (!idEvento) {
      console.error("idEvento está indefinido ou null");
      setErro("Erro: Nenhum evento selecionado.");
      return;
    }
    setIdEventoComentarios(idEvento);
    setModalComentariosAberto(true);
  };

  const fecharModalComentarios = () => {
    setModalComentariosAberto(false);
    setIdEventoComentarios(null);
  };

  const confirmarExclusao = async () => {
    try {
      const response = await fetch("/api/excluireventoadm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ evento_id: eventoParaExcluir.id }),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Resposta do servidor não é JSON");
      }

      const data = await response.json();
      if (response.ok) {
        setMensagem("Evento excluído com sucesso!");
        setModalConfirmacaoAberto(false);
        setEventoParaExcluir(null);
        fetchEventos(filtros);
        setTimeout(() => setMensagem(""), 3000);
      } else {
        setErro(data.error || "Erro ao excluir evento.");
      }
    } catch (error) {
      console.error("Erro ao excluir evento:", error);
      setErro(`Erro ao excluir evento: ${error.message}`);
    }
  };

  const fecharModalConfirmacao = () => {
    setModalConfirmacaoAberto(false);
    setEventoParaExcluir(null);
  };

  // Callback para atualizar eventos após desinscrição
  const handleDesinscrever = () => {
    console.log("Callback onDesinscrever chamada");
    fetchEventos(filtros);
  };

  return (
    <div className="min-h-screen bg-white">
      <MenuAdm />
      <div className="pt-24 px-6 max-w-5xl mx-auto">
        <div className="flex items-center gap-2 mb-10">
          <h1 className="text-4xl font-bold text-black">Gerenciar Eventos</h1>
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
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
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
              onClick={() => setMostrarFiltroLocalizacao(!mostrarFiltroLocalizacao)}
              className="flex items-center gap-2 bg-gray-200 text-black py-2 px-4 rounded-md hover:bg-gray-300"
            >
              <svg
                className="w-5 h-5 text-black"
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
                  <label className="block text-black mb-2">Estado</label>
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
                    <label className="block text-black mb-2">Cidade (opcional)</label>
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
                    className="bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800"
                  >
                    Aplicar
                  </button>
                  <button
                    onClick={limparFiltroLocalizacao}
                    className="bg-gray-200 text-black py-2 px-4 rounded-md hover:bg-gray-300"
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
              className="flex items-center gap-2 bg-gray-200 text-black py-2 px-4 rounded-md hover:bg-gray-300"
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
                  className="bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800"
                >
                  Filtrar
                </button>
              </div>
            ) : (
              <button
                onClick={() => setMostrarFiltroRaca(true)}
                className="flex items-center gap-2 bg-gray-200 text-black py-2 px-4 rounded-md hover:bg-gray-300"
              >
                🐾 Raça
              </button>
            )}
          </div>

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

          <button
            onClick={limparTodosFiltros}
            className="bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800"
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
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-black">
                    {evento.nome}
                  </h2>
                  {filtroDenunciados && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      fetchDenunciasEvento(evento.id, evento.nome);
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
                      handleExcluir(evento);
                    }}
                    className="text-black hover:text-gray-600"
                    title="Excluir evento"
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
                <p className="text-gray-600 text-sm">
                  Criado por: {evento.nome_usuario || "Desconhecido"}
                </p>
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <p>Inscritos: {evento.total_inscritos || 0}</p>
                  <button
                    onClick={() => abrirModalInscritos(evento.id)}
                    className="text-black hover:text-gray-600 text-sm underline"
                    title="Ver inscritos"
                  >
                    Ver Inscritos
                  </button>
                </div>
                <p className="text-gray-600">
                  {new Date(evento.inicio).toLocaleDateString("pt-BR")} -{" "}
                  {new Date(evento.fim).toLocaleDateString("pt-BR")}
                </p>
                <p className="text-gray-600">
                  {evento.nome_cidade}, {evento.uf}
                </p>
                <div className="mt-4">
                  <button
                    onClick={() => abrirModal(evento)}
                    className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800"
                  >
                    Ver Detalhes
                  </button>
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
              className="fixed top-6 right-6 text-black hover:text-gray-600 z-10 md:static md:top-4 md:right-4"
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
            <h2 className="text-2xl font-bold text-black mb-4">
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
                  <button
                    onClick={() => abrirModalComentarios(eventoSelecionado.id)}
                    className="w-full bg-gray-200 text-black py-2 px-4 rounded-md hover:bg-gray-300 mt-4"
                  >
                    Ver Comentários
                  </button>
                </div>
              </div>
              <div className="flex-1 space-y-2 text-gray-700">
                <p>
                  <strong>Criado por:</strong>{" "}
                  {eventoSelecionado.nome_usuario || "Desconhecido"}
                </p>
                <div className="flex items-center gap-2">
                  <p>
                    <strong>Inscritos:</strong> {eventoSelecionado.total_inscritos || 0}
                  </p>
                  <button
                    onClick={() => abrirModalInscritos(eventoSelecionado.id)}
                    className="text-black hover:text-gray-600 text-sm underline"
                    title="Ver inscritos"
                  >
                    Ver Inscritos
                  </button>
                </div>
                <p>
                  <strong>Data de Início:</strong>{" "}
                  {new Date(eventoSelecionado.inicio).toLocaleDateString("pt-BR")} às{" "}
                  {eventoSelecionado.inicio_formatado}
                </p>
                <p>
                  <strong>Data de Fim:</strong>{" "}
                  {new Date(eventoSelecionado.fim).toLocaleDateString("pt-BR")} às{" "}
                  {eventoSelecionado.fim_formatado}
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
            <div className="mt-6">
              <button
                onClick={fecharModal}
                className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {modalInscritosAberto && idEventoInscritos && (
        <ModalInscritos
          eventoId={idEventoInscritos}
          onClose={fecharModalInscritos}
          onDesinscrever={handleDesinscrever}
        />
      )}

      {modalComentariosAberto && idEventoComentarios && (
        <ComentariosAdmModal
          idEvento={idEventoComentarios}
          isOpen={modalComentariosAberto}
          onClose={fecharModalComentarios}
        />
      )}

      {modalConfirmacaoAberto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-black mb-4">
              Confirmar Exclusão
            </h2>
            <p className="text-gray-700 mb-6">
              Tem certeza que deseja excluir o evento{" "}
              {eventoParaExcluir?.nome || "Evento sem nome"}?
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
              Denúncias contra {eventoDenunciadoNome || "Evento"}
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
                onClick={() => {
                  setModalDenunciasAberto(false);
                  setDenuncias([]);
                  setEventoDenunciadoNome("");
                }}
                className="bg-gray-200 text-black py-2 px-4 rounded-md hover:bg-gray-300"
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

export default GerenciarEventos;