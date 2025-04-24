import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

const MenuAdm = () => {
  const [showConfUsuario, setShowConfUsuario] = useState(false); // Estado para o painel lateral
  const [showProfileModal, setShowProfileModal] = useState(false); // Estado para o modal de visualização do perfil
  const [showNavMenu, setShowNavMenu] = useState(false); // Estado para o menu hamburger
  const [usuario, setUsuario] = useState("Administrador"); // Nome do admin

  useEffect(() => {
    const nomeUsuario = localStorage.getItem("usuarioNome");
    const tipo = localStorage.getItem("tipo");

    // Verifica se é admin; se não, redireciona para login
    if (tipo !== "adm") {
      window.location.href = "/login";
      return;
    }

    if (nomeUsuario) {
      setUsuario(nomeUsuario); // Atualiza o nome do admin
    }
  }, []);

  // Função para logout
  const handleLogout = () => {
    localStorage.removeItem("usuario_id");
    localStorage.removeItem("usuarioNome");
    localStorage.removeItem("email");
    localStorage.removeItem("tipo");
    window.location.href = "/login";
  };

  // Função para alternar o painel lateral
  const exibeConfUsuario = () => {
    setShowConfUsuario(!showConfUsuario);
  };

  // Função para abrir/fechar o modal de perfil
  const openProfileModal = () => {
    setShowProfileModal(true);
  };

  // Função para alternar o menu hamburger
  const toggleNavMenu = () => {
    setShowNavMenu(!showNavMenu);
  };

  return (
    <>
      {/* Barra de navegação fixa no topo */}
      <nav className="fixed top-0 left-0 w-full bg-white shadow-md py-4 px-6 flex items-center justify-between z-50">
        <div className="flex items-center gap-4">
          {/* Botão de menu hamburger (visível apenas em telas pequenas) */}
          <button
            type="button"
            onClick={toggleNavMenu}
            className="md:hidden text-black hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
            aria-label={showNavMenu ? "Fechar menu de navegação" : "Abrir menu de navegação"}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              {showNavMenu ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
          {/* Botão sair */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-black hover:text-gray-600 font-medium"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m-3-3h10.5m0 0l-3-3m3 3l-3 3"
              ></path>
            </svg>
            Sair
          </button>
        </div>

        {/* Links de navegação (visíveis em telas grandes) */}
        <ul className="hidden md:flex space-x-8 text-black font-medium">
          <li>
            <Link to="/gerenciareventos" className="hover:text-gray-600 transition">
              Eventos
            </Link>
          </li>
          <li>
            <Link to="/gerenciarusuarios" className="hover:text-gray-600 transition">
              Usuários
            </Link>
          </li>
          <li>
            <Link to="/cadastraradmin" className="hover:text-gray-600 transition">
              Cadastro de Admin
            </Link>
          </li>
        </ul>

        {/* Drawer de navegação para telas pequenas */}
        <div
          id="nav-drawer"
          className={`fixed top-0 left-0 z-50 h-screen w-64 bg-white shadow-lg transform transition-transform duration-300 ${
            showNavMenu ? "translate-x-0" : "-translate-x-full"
          } flex flex-col p-6`}
        >
          {/* Botão de fechar o drawer */}
          <button
            onClick={toggleNavMenu}
            type="button"
            className="self-end text-black hover:bg-gray-100 rounded-lg text-sm w-8 h-8 flex items-center justify-center"
            aria-label="Fechar menu de navegação"
          >
            <svg
              className="w-5 h-5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 14 14"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
              />
            </svg>
            <span className="sr-only">Fechar</span>
          </button>

          {/* Links de navegação no drawer */}
          <ul className="flex flex-col space-y-4 mt-8 text-black font-medium">
            <li>
              <Link
                to="/gerenciar-eventos"
                className="block py-2 px-4 hover:bg-gray-100 hover:text-gray-600 transition rounded"
                onClick={toggleNavMenu}
              >
                Eventos
              </Link>
            </li>
            <li>
              <Link
                to="/gerenciar-usuarios"
                className="block py-2 px-4 hover:bg-gray-100 hover:text-gray-600 transition rounded"
                onClick={toggleNavMenu}
              >
                Usuários
              </Link>
            </li>
            <li>
              <Link
                to="/cadastrar-admin"
                className="block py-2 px-4 hover:bg-gray-100 hover:text-gray-600 transition rounded"
                onClick={toggleNavMenu}
              >
                Cadastro de Admin
              </Link>
            </li>
          </ul>
        </div>

        {/* Nome do admin e ícone de perfil */}
        <div className="flex items-center space-x-3">
          <span className="text-black font-medium">Olá, {usuario}</span>
          <div className="items-center ms-3">
            <button
              type="button"
              onClick={exibeConfUsuario}
              className="flex text-sm bg-black rounded-full focus:ring-4 focus:ring-gray-300"
            >
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="text-black"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M12 10c-1.32 0 -1.983 .421 -2.931 1.924l-.244 .398l-.395 .688a50.89 50.89 0 0 0 -.141 .254c-.24 .434 -.571 .753 -1.139 1.142l-.55 .365c-.94 .627 -1.432 1.118 -1.707 1.955c-.124 .338 -.196 .853 -.193 1.28c0 1.687 1.198 2.994 2.8 2.994l.242 -.006c.119 -.006 .234 -.017 .354 -.034l.248 -.043l.132 -.028l.291 -.073l.162 -.045l.57 -.17l.763 -.243l.455 -.136c.53 -.15 .94 -.222 1.283 -.222c.344 0 .753 .073 1.283 .222l.455 .136l.764 .242l.569 .171l.312 .084c.097 .024 .187 .045 .273 .062l.248 .043c.12 .017 .235 .028 .354 .034l.242 .006c1.602 0 2.8 -1.307 2.8 -3c0 -.427 -.073 -.939 -.207 -1.306c-.236 -.724 -.657 -1.223 -1.48 -1.83l-.257 -.19l-.528 -.38c-.642 -.47 -1.003 -.826 -1.253 -1.278l-.27 -.485l-.252 -.432c-1.011 -1.696 -1.618 -2.099 -3.053 -2.099z" />
                  <path d="M19.78 7h-.03c-1.219 .02 -2.35 1.066 -2.908 2.504c-.69 1.775 -.348 3.72 1.075 4.333c.256 .109 .527 .163 .801 .163c1.231 0 2.38 -1.053 2.943 -2.504c.686 -1.774 .34 -3.72 -1.076 -4.332a2.05 2.05 0 0 0 -.804 -.164z" />
                  <path d="M9.025 3c-.112 0 -.185 .002 -.27 .015l-.093 .016c-1.532 .206 -2.397 1.989 -2.108 3.855c.272 1.725 1.462 3.114 2.92 3.114l.187 -.005a1.26 1.26 0 0 0 .084 -.01l.092 -.016c1.533 -.206 2.397 -1.989 2.108 -3.855c-.27 -1.727 -1.46 -3.114 -2.92 -3.114z" />
                  <path d="M14.972 3c-1.459 0 -2.647 1.388 -2.916 3.113c-.29 1.867 .574 3.65 2.174 3.867c.103 .013 .2 .02 .296 .02c1.39 0 2.543 -1.265 2.877 -2.883l.041 -.23c.29 -1.867 -.574 -3.65 -2.174 -3.867a2.154 2.154 0 0 0 -.298 -.020z" />
                  <path d="M4.217 7c-.274 0 -.544 .054 -.797 .161c-1.426 .615 -1.767 2.562 -1.078 4.335c.563 1.451 1.71 2.504 2.941 2.504c.274 0 .544 -.054 .797 -.161c-1.426 -.615 1.767 -2.562 1.078 -4.335c-.563 -1.451 -1.71 -2.504 -2.941 -2.504z" />
                </svg>
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Painel lateral de configurações */}
      <div
        id="drawer-contact"
        className={`fixed top-0 right-0 z-40 h-screen p-6 bg-white w-[400px] transition-transform ${
          showConfUsuario ? "translate-x-0" : "translate-x-full"
        } flex flex-col items-center justify-start overflow-y-auto border-l border-gray-200 shadow-lg`}
      >
        <button
          onClick={exibeConfUsuario}
          type="button"
          className="text-black bg-transparent hover:bg-gray-100 rounded-lg text-sm w-8 h-8 absolute top-2.5 right-2.5 flex items-center justify-center"
        >
          <svg
            className="w-5 h-5"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 14 14"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
            />
          </svg>
          <span className="sr-only">Fechar</span>
        </button>

        <div className="w-full max-w-md mt-16">
          <h2 className="text-2xl font-bold mb-6 text-black">Configurações</h2>
          {/* Botões do painel lateral */}
          <div className="space-y-4 w-full">
            <button
              onClick={openProfileModal}
              className="p-4 border border-gray-200 rounded-lg bg-white hover:bg-gray-100 transition-colors w-full"
            >
              <h3 className="font-medium text-black">Ver Perfil</h3>
            </button>
            <button
              onClick={handleLogout}
              className="w-full mt-8 p-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m-3-3h10.5m0 0l-3-3m3 3l-3 3"
                ></path>
              </svg>
              Sair da conta
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Visualização do Perfil */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity ${
          showProfileModal ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className={`bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto transform transition-all duration-300 ${
            showProfileModal ? "scale-100" : "scale-95"
          }`}
        >
          <div className="bg-black text-white p-4 rounded-t-lg flex justify-between items-center">
            <h3 className="text-xl font-bold">Meu Perfil</h3>
            <button
              onClick={() => setShowProfileModal(false)}
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
            {/* Informações do admin */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-black mb-4 border-b border-gray-200 pb-2">
                Informações Pessoais
              </h4>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <p className="text-gray-600">Nome Completo</p>
                  <p className="font-medium">{localStorage.getItem("usuarioNome") || "Não informado"}</p>
                </div>
                <div>
                  <p className="text-gray-600">Email</p>
                  <p className="font-medium">{localStorage.getItem("email") || "Não informado"}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-6 py-3 rounded-b-lg flex justify-end">
            <button
              onClick={() => setShowProfileModal(false)}
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MenuAdm;