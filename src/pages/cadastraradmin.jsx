import { useState, useEffect, useContext } from "react";
import Menu from "../components/MenuAdm";
import { AuthContext } from '../context/AuthContext'; // Para o logout

const CadastrarAdmin = () => {
  const [admins, setAdmins] = useState([]);
  const [modalFormAberto, setModalFormAberto] = useState(false);
  const [modalConfirmacaoAberto, setModalConfirmacaoAberto] = useState(false);
  const [adminParaExcluir, setAdminParaExcluir] = useState(null);
  const [editandoAdmin, setEditandoAdmin] = useState(null);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const { authFetch } = useContext(AuthContext); // Obter authFetch do AuthContext

  const [formData, setFormData] = useState({
    nome_completo: "",
    email: "",
    senha: "",
  });

  const [senhaErro, setSenhaErro] = useState("");
  const [mostrarRequisitosSenha, setMostrarRequisitosSenha] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [temMinimoCaracteres, setTemMinimoCaracteres] = useState(false);
  const [temMaiuscula, setTemMaiuscula] = useState(false);
  const [temNumero, setTemNumero] = useState(false);
  const [temCaractereEspecial, setTemCaractereEspecial] = useState(false);
  const [nomeErro, setNomeErro] = useState("");

  const idUsuario = localStorage.getItem("usuario_id");

  const fetchAdmins = async () => {
    if (!idUsuario) {
      setErro("Você precisa estar logado para ver administradores.");
      return;
    }
    try {
      const response = await authFetch("/api/consultaradmins", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${await response.text()}`);
      }
      const data = await response.json();
      console.log("Administradores recebidos:", data);
      setAdmins(data);
      setErro("");
    } catch (error) {
      console.error("Erro ao buscar administradores:", error);
      setErro("Não foi possível carregar os administradores. Tente novamente.");
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const validarNome = (nome) => {
    const temNumeros = /\d/.test(nome);
    if (temNumeros) {
      setNomeErro("O nome não pode conter números.");
      return false;
    }
    if (!nome.trim()) {
      setNomeErro("O nome completo é obrigatório.");
      return false;
    }
    setNomeErro("");
    return true;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "senha") {
      validarSenha(value);
    }
    if (name === "nome_completo") {
      validarNome(value);
    }
  };

  const validarEmail = (email) => {
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexEmail.test(email)) {
      setErro("Por favor, insira um email válido.");
      return false;
    }
    return true;
  };

  const validarSenha = (senha) => {
    const temMinimo = senha.length >= 6;
    const temMaiuscula = /[A-Z]/.test(senha);
    const temNumero = /\d/.test(senha);
    const temEspecial = /[!@#$%^&*(),.?":{}|<>]/.test(senha);

    setTemMinimoCaracteres(temMinimo);
    setTemMaiuscula(temMaiuscula);
    setTemNumero(temNumero);
    setTemCaractereEspecial(temEspecial);

    if (temMinimo && temMaiuscula && temNumero && temEspecial) {
      setSenhaErro("");
      return true;
    } else {
      setSenhaErro("A senha não atende aos requisitos.");
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem("");
    setErro("");

    if (!formData.nome_completo || !formData.email) {
      setErro("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    if (!validarNome(formData.nome_completo)) {
      return;
    }

    if (!validarEmail(formData.email)) {
      return;
    }

    if (!editandoAdmin && !validarSenha(formData.senha)) {
      return;
    }

    try {
      const url = editandoAdmin ? "/api/alteraradmin" : "/api/cadastraradmin";
      const body = editandoAdmin
        ? { id: editandoAdmin.id, nome_completo: formData.nome_completo, email: formData.email }
        : formData;

      const response = await authFetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (response.ok) {
        fecharModalForm();
        setMensagem(
          editandoAdmin
            ? "Administrador atualizado com sucesso!"
            : "Administrador cadastrado com sucesso!"
        );
        fetchAdmins();
        setTimeout(() => setMensagem(""), 3000);
      } else {
        setErro(data.error || "Erro ao processar a solicitação.");
      }
    } catch (error) {
      console.error("Erro ao processar a solicitação:", error);
      setErro("Erro ao processar a solicitação. Tente novamente.");
    }
  };

  const handleEditar = (admin) => {
    setEditandoAdmin(admin);
    setFormData({
      nome_completo: admin.nome_completo,
      email: admin.email,
      senha: "",
    });
    setModalFormAberto(true);
  };

  const handleExcluir = (admin) => {
    setAdminParaExcluir(admin);
    setModalConfirmacaoAberto(true);
  };

  const confirmarExclusao = async () => {
    try {
      const response = await authFetch("/api/excluiradmin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: adminParaExcluir.id }),
      });

      const data = await response.json();
      if (response.ok) {
        fecharModalConfirmacao();
        setMensagem("Administrador excluído com sucesso!");
        fetchAdmins();
        setTimeout(() => setMensagem(""), 3000);
      } else {
        setErro(data.error || "Erro ao excluir administrador.");
      }
    } catch (error) {
      console.error("Erro ao excluir administrador:", error);
      setErro("Erro ao excluir administrador. Tente novamente.");
    }
  };

  const abrirModalCriar = () => {
    if (!idUsuario) {
      setErro("Você precisa estar logado para cadastrar um administrador.");
      return;
    }
    setEditandoAdmin(null);
    setFormData({
      nome_completo: "",
      email: "",
      senha: "",
    });
    setModalFormAberto(true);
  };

  const fecharModalForm = () => {
    setModalFormAberto(false);
    setEditandoAdmin(null);
    setFormData({
      nome_completo: "",
      email: "",
      senha: "",
    });
    setSenhaErro("");
    setNomeErro("");
    setMostrarRequisitosSenha(false);
    setErro("");
  };

  const fecharModalConfirmacao = () => {
    setModalConfirmacaoAberto(false);
    setAdminParaExcluir(null);
  };

  const handleSenhaFocus = () => {
    setMostrarRequisitosSenha(true);
  };

  const handleSenhaBlur = () => {
    if (!senhaErro) {
      setMostrarRequisitosSenha(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Menu />
      <div className="pt-24 px-6 pb-8 max-w-5xl mx-auto">
        <div className="flex items-center gap-2 mb-10">
          <h1 className="text-4xl font-bold text-black">Administradores</h1>
          <svg
            className="w-8 h-8 text-black"
            fill="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-4">
          {admins.length > 0 ? (
            admins.map((admin) => (
              <div
                key={admin.id}
                className="bg-white p-6 rounded-lg shadow-md"
              >
                <h2 className="text-xl font-semibold text-black">
                  {admin.nome_completo}
                </h2>
                <p className="text-gray-600">{admin.email}</p>
                <button
                  onClick={() => handleEditar(admin)}
                  className="mt-4 bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 w-full"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleExcluir(admin)}
                  className="mt-2 bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 w-full"
                >
                  Excluir
                </button>
              </div>
            ))
          ) : (
            <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-500 col-span-full">
              {idUsuario
                ? "Nenhum administrador cadastrado ainda."
                : "Você precisa estar logado para ver administradores."}
            </div>
          )}
        </div>
      </div>

      <button
        onClick={abrirModalCriar}
        className="fixed bottom-8 right-8 bg-black text-white py-3 px-6 rounded-full shadow-lg hover:bg-gray-800 transition flex items-center gap-2 z-50"
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
        Cadastrar Administrador
      </button>

      {modalFormAberto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full relative">
            <button
              onClick={fecharModalForm}
              className="absolute top-4 right-4 text-black hover:text-gray-600"
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
            <h2 className="text-2xl font-bold text-black mb-6">
              {editandoAdmin ? "Editar Administrador" : "Cadastrar Administrador"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2">
                    Nome Completo<span className="text-black">*</span>
                  </label>
                  <input
                    type="text"
                    name="nome_completo"
                    value={formData.nome_completo}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                  {nomeErro && (
                    <p className="text-sm text-black mt-2">{nomeErro}</p>
                  )}
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">
                    Email<span className="text-black">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>
                {!editandoAdmin && (
                  <div>
                    <label className="block text-gray-700 mb-2">
                      Senha<span className="text-black">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={mostrarSenha ? "text" : "password"}
                        name="senha"
                        value={formData.senha}
                        onChange={handleChange}
                        onFocus={handleSenhaFocus}
                        onBlur={handleSenhaBlur}
                        className="w-full p-2 border rounded-md"
                        required
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                        onClick={() => setMostrarSenha(!mostrarSenha)}
                      >
                        {mostrarSenha ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="icon icon-tabler icons-tabler-outline icon-tabler-eye"
                          >
                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                            <path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
                            <path d="M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6" />
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="icon icon-tabler icons-tabler-outline icon-tabler-eye-closed"
                          >
                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                            <path d="M21 9c-2.4 2.667 -5.4 4 -9 4c-3.6 0 -6.6 -1.333 -9 -4" />
                            <path d="M3 15l2.5 -3.8" />
                            <path d="M21 14.976l-2.492 -3.776" />
                            <path d="M9 17l.5 -4" />
                            <path d="M15 17l-.5 -4" />
                          </svg>
                        )}
                      </button>
                    </div>
                    {senhaErro && (
                      <p className="text-sm text-black mt-2">{senhaErro}</p>
                    )}
                    {mostrarRequisitosSenha && (
                      <div className="text-sm mt-2">
                        <p className="text-gray-700">A senha deve ter:</p>
                        <ul className="list-disc list-inside">
                          <li
                            className={
                              temMinimoCaracteres ? "text-gray-600" : "text-black"
                            }
                          >
                            No mínimo 6 caracteres
                          </li>
                          <li
                            className={
                              temMaiuscula ? "text-gray-600" : "text-black"
                            }
                          >
                            Pelo menos 1 letra maiúscula
                          </li>
                          <li
                            className={temNumero ? "text-gray-600" : "text-black"}
                          >
                            Pelo menos 1 número
                          </li>
                          <li
                            className={
                              temCaractereEspecial ? "text-gray-600" : "text-black"
                            }
                          >
                            Pelo menos 1 caractere especial
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="mt-6 flex gap-4">
                <button
                  type="submit"
                  className="bg-black text-white py-2 px-6 rounded-md hover:bg-gray-800"
                >
                  {editandoAdmin ? "Salvar" : "Cadastrar"}
                </button>
                <button
                  type="button"
                  onClick={fecharModalForm}
                  className="bg-gray-200 text-black py-2 px-6 rounded-md hover:bg-gray-300"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalConfirmacaoAberto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-black mb-4">
              Confirmar Exclusão
            </h2>
            <p className="text-gray-700 mb-6">
              Tem certeza que deseja excluir o administrador{" "}
              {adminParaExcluir?.nome_completo}?
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
    </div>
  );
};

export default CadastrarAdmin;