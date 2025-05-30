import { useState, useEffect, useContext } from "react";
import Menu from "../components/Menu"; // Importando o componente Menu
import ComentariosModal from "../components/comentariosmodal"; // Importando o componente ComentariosModal 
import ModalInscritos from "../components/modalinscritos"; // Importando o componente ModalInscritos
import { AuthContext } from "../context/AuthContext"; // Importar AuthContext

const EventosCriados = () => {
  const { authFetch } = useContext(AuthContext); // Obter authFetch do AuthContext
  const [eventos, setEventos] = useState([]); // Lista de eventos criados
  const [modalAberto, setModalAberto] = useState(false); // Modal de detalhes do evento
  const [modalFormAberto, setModalFormAberto] = useState(false); // Modal de criação/edição de evento
  const [modalConfirmacaoAberto, setModalConfirmacaoAberto] = useState(false); // Modal de confirmação de exclusão
  const [modalComentariosAberto, setModalComentariosAberto] = useState(false); // Modal de comentários
  const [modalInscritosAberto, setModalInscritosAberto] = useState(false); // Modal de inscritos
  const [idEventoInscritos, setIdEventoInscritos] = useState(null); // ID do evento para inscritos
  const [eventoSelecionado, setEventoSelecionado] = useState(null); // Evento selecionado para edição ou detalhes
  const [eventoParaExcluir, setEventoParaExcluir] = useState(null); // Evento selecionado para exclusão
  const [idEventoComentarios, setIdEventoComentarios] = useState(null); // ID do evento para comentários
  const [isEdicao, setIsEdicao] = useState(false); // Modo de edição
  const [imageErrors, setImageErrors] = useState({}); // Erros de imagem

  const idUsuario = localStorage.getItem("usuario_id"); // ID do usuário logado

  // Estado inicial do formulário
  const [formData, setFormData] = useState({
    nome: "",
    data_inicio: "",
    hora_inicio: "",
    data_fim: "",
    hora_fim: "",
    uf: "",
    id_cidade: "",
    bairro: "",
    rua: "",
    numero: "",
    complemento: "",
    descricao: "",
    raca: "",
    porte: "Geral",
    sexo: "Geral",
  });
  const [foto, setFoto] = useState(null); // Foto do evento
  const [fotoPreview, setFotoPreview] = useState("");
  const [cidades, setCidades] = useState([]);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  // Lista de estados brasileiros
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

  // Função para buscar eventos criados pelo usuário
  const fetchEventos = async () => {
    if (!idUsuario) {
      setErro("Você precisa estar logado para ver seus eventos.");
      return;
    }
    try {
      const response = await authFetch("/api/consultareventoscriados", { // API para buscar eventos criados
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_usuario: idUsuario }), // Enviando ID do usuário
      });
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${await response.text()}`);
      }
      const data = await response.json(); // Convertendo resposta para JSON
      console.log("Eventos recebidos:", data);
      setEventos(data);
      setErro("");
      setImageErrors({});
    } catch (error) {
      console.error("Erro ao buscar eventos criados:", error);
      setErro("Não foi possível carregar seus eventos. Tente novamente.");
    }
  };

  // Função para buscar cidades com base na UF selecionada
  const fetchCidades = async (uf) => {
    try {
      console.log("Consultando cidades para UF:", uf);
      const response = await fetch("/api/consultacidadeporUF", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ufSelecionado: uf }),
      });
      if (!response.ok) throw new Error("Erro ao buscar cidades");
      const data = await response.json();
      const cidadesNormalizadas = Array.isArray(data) // Normaliza os dados de cidades
        ? data.map((cidade) => ({ // Cria um novo array com os dados normalizados
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

  // Efeito para buscar eventos ao carregar o componente
  useEffect(() => {
    fetchEventos();
  }, []);

  // Efeito para buscar cidades quando a UF muda
  const handleChange = (e) => {
    const { name, value } = e.target; // Obtendo o nome e valor do campo
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Se o campo alterado for o estado (uf), reseta a cidade e busca novas cidades
    if (name === "uf") {
      setFormData((prev) => ({ ...prev, id_cidade: "" })); // prev é o estado anterior
      if (value) {
        fetchCidades(value);
      } else {
        setCidades([]); // Se não houver UF, reseta as cidades
      }
    }
  };

  // Função para lidar com a mudança/selção de foto
  const handleFotoChange = (e) => {
    const file = e.target.files[0]; // Obtendo o arquivo selecionado
    if (file) {
      setFoto(file);
      setFotoPreview(URL.createObjectURL(file)); // Cria um URL temporário para a imagem
    }
  };

  // Função para lidar com erros de imagem
  const handleImageError = (eventoId, foto) => {
    console.error("Erro ao carregar imagem:", foto);
    setImageErrors((prev) => ({ ...prev, [eventoId]: true }));
  };

  // Função para lidar com o envio do formulário
  const handleSubmit = async (e) => {
    e.preventDefault(); // Previne o recarregamento da página
    setMensagem("");
    setErro("");

    if ( // Verifica se todos os campos obrigatórios estão preenchidos
      !formData.nome ||
      !formData.data_inicio ||
      !formData.hora_inicio ||
      !formData.data_fim ||
      !formData.hora_fim ||
      !formData.uf ||
      !formData.id_cidade ||
      !formData.bairro ||
      !formData.rua ||
      !formData.numero ||
      !formData.descricao
    ) {
      setErro("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    // Verifica se a data de início NÃO É ANTERIOR AO DIA DE HOJE
    const hoje = new Date(); // Cria um objeto Date com a data atual
    hoje.setHours(0, 0, 0, 0); // Zera as horas, minutos, segundos e milissegundos
    const dataInicio = new Date(`${formData.data_inicio}T${formData.hora_inicio}`); // Cria um objeto Date com a data e hora de início
    if (dataInicio < hoje) { // Verifica se a data de início é anterior ao dia atual
      setErro("A data de início não pode ser anterior ao dia atual.");
      return;
    }

    const dataFim = new Date(`${formData.data_fim}T${formData.hora_fim}`); // Cria um objeto Date com a data e hora de fim
    if (dataFim < dataInicio) { // Verifica se a data de fim é anterior à data de início
      setErro("A data de fim não pode ser anterior à data de início.");
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("id_usuario", idUsuario);
      if (!isEdicao && !foto) {
        setErro("A foto é obrigatória para criar um evento.");
        return;
      }
      if (foto) {
        formDataToSend.append("fotoPet", foto); // Ajustado para corresponder ao multer
        console.log("Enviando nova foto:", foto.name);
      }
      formDataToSend.append("nome_evento", formData.nome);
      formDataToSend.append("inicio", `${formData.data_inicio}T${formData.hora_inicio}`);
      formDataToSend.append("fim", `${formData.data_fim}T${formData.hora_fim}`);
      formDataToSend.append("uf", formData.uf);
      formDataToSend.append("id_cidade", formData.id_cidade);
      formDataToSend.append("bairro", formData.bairro);
      formDataToSend.append("rua", formData.rua);
      formDataToSend.append("numero", formData.numero);
      formDataToSend.append("complemento", formData.complemento || "");
      formDataToSend.append("descricao", formData.descricao);
      formDataToSend.append("raca", formData.raca || "");
      formDataToSend.append("porte", formData.porte);
      formDataToSend.append("sexo", formData.sexo);
      if (isEdicao) formDataToSend.append("evento_id", eventoSelecionado.id);

      // Envia os dados para a API de criação ou edição de evento com uma condicional de se está editando ou criando um novo evento
      const url = isEdicao ? "/api/alterarevento" : "/api/criarevento";
      const response = await authFetch(url, { // Aqui completa com o endpoint correto
        method: "POST",
        body: formDataToSend,
      });

      const data = await response.json();
      if (response.ok) {
        console.log("Resposta da API:", data);
        fecharModalForm(); // Fecha o modal de criação/edição
        fecharModal(); // Fecha o modal de detalhes
        setMensagem(isEdicao ? "Alterações salvas com sucesso!" : "Evento criado com sucesso!");
        fetchEventos();
        setTimeout(() => setMensagem(""), 3000); // Atraso de 3 segundos para limpar a mensagem
      } else {
        setErro(data.error || `Erro ao ${isEdicao ? "atualizar" : "criar"} evento.`); // Mensagem de erro dependendo se é edição ou criação
      }
    } catch (error) {
      console.error(`Erro ao ${isEdicao ? "atualizar" : "criar"} evento:`, error);
      setErro(`Erro ao ${isEdicao ? "atualizar" : "criar"} evento. Tente novamente.`);
    }
  };

  // Função para lidar com a exclusão de eventos
  const handleExcluir = (evento) => {
    setEventoParaExcluir(evento);
    setModalConfirmacaoAberto(true);
  };

  // Função para confirmar a exclusão do evento
  const confirmarExclusao = async () => {
    try {
      const response = await authFetch("/api/excluirevento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ evento_id: eventoParaExcluir.id, id_usuario: idUsuario }), // Enviando ID do evento e do usuário
      });

      const data = await response.json();
      if (response.ok) {
        fecharModalConfirmacao();
        fecharModal();
        setMensagem("Evento excluído com sucesso!");
        fetchEventos();
        setTimeout(() => setMensagem(""), 3000); // Atraso de 3 segundos para limpar a mensagem
      } else {
        setErro(data.error || "Erro ao excluir evento.");
      }
    } catch (error) {
      console.error("Erro ao excluir evento:", error);
      setErro("Erro ao excluir evento. Tente novamente.");
    }
  };

  // Função para fechar o modal de confirmação de exclusão
  const fecharModalConfirmacao = () => {
    setModalConfirmacaoAberto(false);
    setEventoParaExcluir(null);
  };

  // Função para abrir o modal de detalhes do evento
  const abrirModal = (evento) => {
    setEventoSelecionado(evento);
    setModalAberto(true);
  };

  // Função para fechar o modal de detalhes do evento
  const fecharModal = () => {
    setModalAberto(false);
    setEventoSelecionado(null);
  };

  // Função para abrir o modal de criação de evento
  const abrirModalCriar = () => {
    if (!idUsuario) {
      setErro("Você precisa estar logado para criar um evento.");
      return;
    }
    setIsEdicao(false); // Define que não está em modo de edição
    setModalFormAberto(true); // Abre o modal de criação
  };

  // Função para abrir o modal de edição de evento
  const abrirModalEditar = () => {
    if (!idUsuario) { // Verifica se o usuário está logado
      setErro("Você precisa estar logado para editar um evento.");
      return;
    }
    const inicio = new Date(eventoSelecionado.inicio);
    const fim = new Date(eventoSelecionado.fim);
    setFormData({
      nome: eventoSelecionado.nome,
      data_inicio: inicio.toISOString().split("T")[0], // Formato YYYY-MM-DD
      hora_inicio: inicio.toTimeString().slice(0, 5), // Formato HH:MM
      data_fim: fim.toISOString().split("T")[0], // Formato YYYY-MM-DD
      hora_fim: fim.toTimeString().slice(0, 5), // Formato HH:MM
      uf: eventoSelecionado.uf,
      id_cidade: eventoSelecionado.id_cidade,
      bairro: eventoSelecionado.bairro,
      rua: eventoSelecionado.rua,
      numero: eventoSelecionado.numero,
      complemento: eventoSelecionado.complemento || "",
      descricao: eventoSelecionado.descricao,
      raca: eventoSelecionado.raca || "",
      porte: eventoSelecionado.porte,
      sexo: eventoSelecionado.sexo,
    });
    setFotoPreview(`/api/evento/foto/${eventoSelecionado.id}?t=${Date.now()}`);
    setFoto(null);
    fetchCidades(eventoSelecionado.uf);
    setIsEdicao(true); // Define que está em modo de edição
    setModalAberto(false); // Fecha o modal de detalhes
    setModalFormAberto(true);
  };

  // Função para fechar o modal de criação/edição de evento
  const fecharModalForm = () => {
    setModalFormAberto(false); // Fecha o modal de criação/edição
    setFormData({
      nome: "",
      data_inicio: "",
      hora_inicio: "",
      data_fim: "",
      hora_fim: "",
      uf: "",
      id_cidade: "",
      bairro: "",
      rua: "",
      numero: "",
      complemento: "",
      descricao: "",
      raca: "",
      porte: "Geral",
      sexo: "Geral",
    });
    setFoto(null);
    setFotoPreview("");
    setCidades([]);
    setErro("");
    setIsEdicao(false);
  };

  // Função para abrir o modal de comentários
  const abrirModalComentarios = (idEvento) => {
    console.log("Abrindo modal para idEvento:", idEvento);
    setIdEventoComentarios(idEvento); // Define o ID do evento para comentários
    setModalComentariosAberto(true); // Abre o modal de comentários
  };

  // Função para fechar o modal de comentários
  const fecharModalComentarios = () => {
    setModalComentariosAberto(false);
    setIdEventoComentarios(null);
  };

  // Função para abrir o modal de inscritos
  const abrirModalInscritos = (idEvento) => {
    console.log("Abrindo ModalInscritos com idEvento:", idEvento);
    if (!idEvento) {
      console.error("idEvento está indefinido ou null");
      setErro("Erro: Nenhum evento selecionado.");
      return;
    }
    setIdEventoInscritos(idEvento);
    setModalInscritosAberto(true);
  };

  // Função para fechar o modal de inscritos
  const fecharModalInscritos = () => {
    setModalInscritosAberto(false);
    setIdEventoInscritos(null);
  };

  const hoje = new Date().toISOString().split("T")[0]; // Data atual no formato YYYY-MM-DD

  // ********* Renderização do componente ********* //
  return (
    <div className="min-h-screen">
      <Menu /> {/* Componente de menu superior importado */}
      <div className="pt-24 px-6 pb-8 max-w-5xl mx-auto">
        <div className="flex items-center gap-2 mb-10">
          <h1 className="text-4xl font-bold text-blue-900">Eventos Criados</h1>
          {/* Ícone SVG para decoração */}
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

        {/* Exibe mensagens de sucesso */}
        {mensagem && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
            {mensagem}
          </div>
        )}
        {/* Exibe mensagens de erro */}
        {erro && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {erro}
          </div>
        )}

        {/* Exibe eventos criados */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-4">
          {eventos.length > 0 ? (
            eventos.map((evento) => ( // Mapeia os eventos criados
              <div
                key={evento.id}
                className="bg-white p-6 rounded-lg shadow-md"
              >
                <img
                  src={imageErrors[evento.id] ? "https://via.placeholder.com/150" : `/api/evento/foto/${evento.id}?t=${Date.now()}`}
                  alt={evento.nome}
                  className="w-full h-40 object-cover rounded-md mb-4"
                  onError={() => handleImageError(evento.id, `/api/evento/foto/${evento.id}`)}
                />
                <h2 className="text-xl font-semibold text-blue-900">
                  {evento.nome}
                </h2>
                <p className="text-gray-600 text-sm">
                  Inscritos: {evento.total_inscritos || 0}
                </p>
                <p className="text-gray-600">
                  {/* Formata a data de início e fim do evento */}
                  {new Date(evento.inicio).toLocaleDateString("pt-BR")} -{" "} 
                  {new Date(evento.fim).toLocaleDateString("pt-BR")}
                </p>
                <p className="text-gray-600">
                  {evento.nome_cidade}, {evento.uf}
                </p>
                <button
                  onClick={() => abrirModal(evento)}
                  className="mt-4 bg-blue-900 text-white py-2 px-4 rounded-md hover:bg-blue-800 w-full"
                >
                  Ver Detalhes
                </button>
              </div>
            ))
          ) : (
            <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-500 col-span-full">
              {idUsuario
                ? "Nenhum evento criado ainda."
                : "Você precisa estar logado para ver seus eventos."}
            </div>
          )}
        </div>
      </div>

      {/* Botão para criar novo evento */}
      <button
        onClick={abrirModalCriar}
        className="fixed bottom-8 right-8 bg-red-500 text-white py-3 px-6 rounded-full shadow-lg hover:bg-red-600 transition flex items-center gap-2 z-50"
        disabled={!idUsuario}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Criar Evento
      </button>

      {/* Modal para exibir detalhes do evento */}
      {modalAberto && eventoSelecionado && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 overflow-y-auto"
          onClick={fecharModal}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[calc(100vh-2rem)] overflow-y-auto relative my-4"
            onClick={(e) => e.stopPropagation()} // Previne o fechamento do modal ao clicar dentro dele
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
                src={imageErrors[eventoSelecionado.id] ? "https://via.placeholder.com/150" : `/api/evento/foto/${eventoSelecionado.id}?t=${Date.now()}`}
                alt={eventoSelecionado.nome}
                className="w-full h-40 object-cover rounded-md mb-4"
                onError={() => handleImageError(eventoSelecionado.id, `/api/evento/foto/${eventoSelecionado.id}`)}
              />
                <div className="space-y-2 text-gray-700">
                  <p className="text-sm break-words">
                    <strong>Descrição:</strong> {eventoSelecionado.descricao}
                  </p>
                  <button
                    onClick={() => abrirModalComentarios(eventoSelecionado.id)}
                    className="inline-flex items-center gap-2 text-blue-900 hover:text-blue-700"
                    title="Ver comentários"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="icon icon-tabler icons-tabler-filled icon-tabler-message"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M18 3a4 4 0 0 1 4 4v8a4 4 0 0 1 -4 4h-4.724l-4.762 2.857a1 1 0 0 1 -1.508 -.743l-.006 -.114v-2h-1a4 4 0 0 1 -3.995 -3.8l-.005 -.2v-8a4 4 0 0 1 4 -4zm-4 9h-6a1 1 0 0 0 0 2h6a1 1 0 0 0 0 -2m2 -4h-8a1 1 0 1 0 0 2h8a1 1 0 0 0 0 -2" />
                    </svg>
                    <span className="text-sm font-medium">Chat</span>
                  </button>
                </div>
              </div>
              <div className="flex-1 space-y-2 text-gray-700">
                <div className="flex items-center gap-2">
                <p>
                  <strong>Inscritos:</strong> {eventoSelecionado.total_inscritos || 0}
                </p>
                <button
                    onClick={() => abrirModalInscritos(eventoSelecionado.id)}
                    className="text-blue-900 hover:text-blue-700 text-sm underline"
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
                  {/* Formata a data de início e fim do evento */}
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
              <button
                onClick={abrirModalEditar}
                className="flex-1 bg-yellow-500 text-white py-2 px-4 rounded-md hover:bg-yellow-600"
              >
                Editar
              </button>
              <button
                onClick={() => handleExcluir(eventoSelecionado)}
                className="flex-1 bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600"
              >
                Excluir
              </button>
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

      {/* Modal de confirmação de exclusão */}
      {modalConfirmacaoAberto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-blue-900 mb-4">
              Confirmar Exclusão
            </h2>
            <p className="text-gray-700 mb-6">
              Tem certeza que deseja excluir este evento?
            </p>
            <div className="flex gap-4">
              <button
                onClick={confirmarExclusao}
                className="flex-1 bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600"
              >
                Confirmar
              </button>
              <button
                onClick={fecharModalConfirmacao}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {modalFormAberto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full relative overflow-y-auto max-h-[90vh]">
            <button
              onClick={fecharModalForm}
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
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
            <h2 className="text-2xl font-bold text-blue-900 mb-6">
              {isEdicao ? "Editar Evento" : "Criar Novo Evento"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-gray-700 mb-2">
                    Foto do Evento{!isEdicao && <span className="text-red-500">*</span>}
                  </label>
                  {fotoPreview && (
                    <div className="mb-4 mt-6 w-24 h-24 rounded-full overflow-hidden border-2 border-red-200">
                      <img
                        src={fotoPreview}
                        alt="Preview do evento"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    id="fotoPet"
                    name="fotoPet"
                    accept="image/*"
                    onChange={handleFotoChange}
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-600 hover:file:bg-red-100"
                    required={!isEdicao}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-gray-700 mb-2">
                    Nome do Evento<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">
                    Data de Início<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="data_inicio"
                    value={formData.data_inicio}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md"
                    min={hoje}
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">
                    Hora de Início<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    name="hora_inicio"
                    value={formData.hora_inicio}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">
                    Data de Fim<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="data_fim"
                    value={formData.data_fim}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md"
                    min={formData.data_inicio || hoje}
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">
                    Hora de Fim<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    name="hora_fim"
                    value={formData.hora_fim}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">
                    Estado<span className="text-red-500">*</span>
                  </label>
                  <select
                    name="uf"
                    value={formData.uf}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="">Selecione um estado</option>
                    {estados.map((estado) => (
                      <option key={estado.uf} value={estado.uf}>
                        {estado.nome}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">
                    Cidade<span className="text-red-500">*</span>
                  </label>
                  <select
                    name="id_cidade"
                    value={formData.id_cidade}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md"
                    required
                    disabled={!formData.uf}
                  >
                    <option value="">Selecione uma cidade</option>
                    {cidades.map((cidade) => (
                      <option key={cidade.id} value={cidade.id}>
                        {cidade.nome}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">
                    Bairro<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="bairro"
                    value={formData.bairro}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">
                    Rua<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="rua"
                    value={formData.rua}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">
                    Número<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="numero"
                    value={formData.numero}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Complemento</label>
                  <input
                    type="text"
                    name="complemento"
                    value={formData.complemento}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-gray-700 mb-2">
                    Descrição<span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="descricao"
                    value={formData.descricao}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md"
                    rows="4"
                    required
                  ></textarea>
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Raça</label>
                  <input
                    type="text"
                    name="raca"
                    value={formData.raca}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">
                    Porte<span className="text-red-500">*</span>
                  </label>
                  <select
                    name="porte"
                    value={formData.porte}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="Geral">Geral</option>
                    <option value="Pequeno">Pequeno</option>
                    <option value="Médio">Médio</option>
                    <option value="Grande">Grande</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">
                    Sexo<span className="text-red-500">*</span>
                  </label>
                  <select
                    name="sexo"
                    value={formData.sexo}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="Geral">Geral</option>
                    <option value="Macho">Macho</option>
                    <option value="Fêmea">Fêmea</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex gap-4">
                <button
                  type="submit"
                  className="bg-blue-900 text-white py-2 px-6 rounded-md hover:bg-blue-800"
                >
                  {isEdicao ? "Salvar Alterações" : "Criar Evento"}
                </button>
                <button
                  type="button"
                  onClick={fecharModalForm}
                  className="bg-gray-200 text-gray-700 py-2 px-6 rounded-md hover:bg-gray-300"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ComentariosModal
        idEvento={idEventoComentarios}
        idUsuario={idUsuario}
        isOpen={modalComentariosAberto}
        onClose={fecharModalComentarios}
      />

      {modalInscritosAberto && idEventoInscritos && (
      <ModalInscritos
        eventoId={idEventoInscritos}
        onClose={fecharModalInscritos}
      />
      )}

    </div>
  );
};

export default EventosCriados;