import { Link } from "react-router-dom";

const Menu = ({ usuario = "Usuário" }) => {
  const handleLogout = () => {
    // Redireciona para a página de login
    window.location.href = "/login";
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow-md py-4 px-6 flex items-center justify-between z-50">
      {/* Botão Sair no canto esquerdo */}
      <div>
        <button onClick={handleLogout} className="flex items-center gap-2 text-red-500 hover:text-red-600 font-medium">
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

      {/* Menu central */}
      <ul className="hidden md:flex space-x-8 text-gray-700 font-medium">
        <li>
          <Link to="/eventosinscritos" className="hover:text-red-400 transition">
            Eventos Inscritos
          </Link>
        </li>
        <li>
          <Link to="/explorar" className="hover:text-red-400 transition">
            Explorar
          </Link>
        </li>
        <li>
          <Link to="/eventoscriados" className="hover:text-red-400 transition">
            Eventos Criados
          </Link>
        </li>
      </ul>

      {/* Perfil no canto direito */}
      <div className="flex items-center space-x-3">
        <span className="text-gray-700 font-medium">Olá, {usuario}</span>
        <div className="w-10 h-10 bg-gray-200 flex items-center justify-center rounded-full text-gray-600">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 7.5a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM6 21a6 6 0 1112 0H6z"
            ></path>
          </svg>
        </div>
      </div>
    </nav>
  );
};

export default Menu;
