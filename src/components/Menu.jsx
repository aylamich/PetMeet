import { Link } from "react-router-dom";
import { useState } from "react";

const Menu = ({ usuario = "Usuário" }) => {
  const [showConfUsuario, setShowConfUsuario] = useState(false);

  const handleLogout = () => {
    window.location.href = "/login";
  };

  const exibeConfUsuario = () => {
    setShowConfUsuario(!showConfUsuario);
  };

  return (
    <>
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
          <div className="items-center ms-3">
            <div>   
              <button 
                type="button" 
                onClick={exibeConfUsuario} 
                className="flex text-sm bg-red-400 rounded-full focus:ring-4 focus:ring-red-300" 
                aria-expanded="false" 
              >
                <div className="relative w-10 h-10 overflow-hidden bg-red-100 rounded-full">
                  <svg 
                    className="absolute w-12 h-12 text-red-500 -left-1" 
                    fill="currentColor" 
                    viewBox="0 0 20 20" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" 
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </div>                
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Drawer de configurações do usuário - ESTILO ATUALIZADO */}
      <div 
        id="drawer-contact" 
        className={`fixed top-0 right-0 z-40 h-screen p-6 bg-red-50 w-[600px] transition-transform ${
          showConfUsuario ? "translate-x-0" : "translate-x-full"
        } flex flex-col items-center justify-start overflow-y-auto border-l border-red-200 shadow-lg`}
      >
        {/* Botão de Fechar */}
        <button 
          onClick={exibeConfUsuario} 
          type="button" 
          className="text-red-500 bg-transparent hover:bg-red-100 rounded-lg text-sm w-8 h-8 absolute top-2.5 right-2.5 flex items-center justify-center"
        >                                
          <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
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

        {/* Conteúdo do drawer - ESTILO ATUALIZADO */}
        <div className="w-full max-w-md mt-16">
          <h2 className="text-2xl font-bold mb-6 text-red-600">Configurações</h2>
          
          <div className="space-y-4">
            {/* Seção 1 */}
            <div className="p-4 border border-red-200 rounded-lg bg-white hover:bg-red-50 transition-colors">
              <h3 className="font-medium text-red-700">Meu Perfil</h3>
              <p className="text-red-500">Editar informações pessoais</p>
            </div>
            
            {/* Seção 2 */}
            <div className="p-4 border border-red-200 rounded-lg bg-white hover:bg-red-50 transition-colors">
              <h3 className="font-medium text-red-700">Segurança</h3>
              <p className="text-red-500">Alterar senha</p>
            </div>
            
            {/* Seção 3 */}
            <div className="p-4 border border-red-200 rounded-lg bg-white hover:bg-red-50 transition-colors">
              <h3 className="font-medium text-red-700">Notificações</h3>
              <p className="text-red-500">Preferências de comunicação</p>
            </div>

            {/* Botão de Sair */}
            <button 
              onClick={handleLogout}
              className="w-full mt-8 p-3 bg-red-400 text-white rounded-lg hover:bg-red-500 transition-colors flex items-center justify-center gap-2"
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
    </>
  );
};

export default Menu;