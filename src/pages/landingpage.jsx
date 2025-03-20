import React from 'react';
import logo from '/logoredonda.png'; // Importação da logo
import dogImage from '/dogImage.png'; // Importação da imagem do lado direito

function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row"> {/* Responsividade */}
      {/* Lado esquerdo: Conteúdo */}
      <div className="w-full md:w-1/2 flex flex-col p-6 md:p-12 bg-red-50">
        {/* Título "PetMeet" no topo com a patinha */}
        <div className="flex items-center mt-10 md:mt-20 mb-6 md:mb-8">
          <h1 className="font-acme text-8xl font-bold text-blue-900">
            PetMeet
          </h1>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-16 h-16 mt-4 ml-4 text-blue-900" // Tamanho aumentado para 64px
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <path d="M12 10c-1.32 0 -1.983 .421 -2.931 1.924l-.244 .398l-.395 .688a50.89 50.89 0 0 0 -.141 .254c-.24 .434 -.571 .753 -1.139 1.142l-.55 .365c-.94 .627 -1.432 1.118 -1.707 1.955c-.124 .338 -.196 .853 -.193 1.28c0 1.687 1.198 2.994 2.8 2.994l.242 -.006c.119 -.006 .234 -.017 .354 -.034l.248 -.043l.132 -.028l.291 -.073l.162 -.045l.57 -.17l.763 -.243l.455 -.136c.53 -.15 .94 -.222 1.283 -.222c.344 0 .753 .073 1.283 .222l.455 .136l.764 .242l.569 .171l.312 .084c.097 .024 .187 .045 .273 .062l.248 .043c.12 .017 .235 .028 .354 .034l.242 .006c1.602 0 2.8 -1.307 2.8 -3c0 -.427 -.073 -.939 -.207 -1.306c-.236 -.724 -.677 -1.223 -1.48 -1.83l-.257 -.19l-.528 -.38c-.642 -.47 -1.003 -.826 -1.253 -1.278l-.27 -.485l-.252 -.432c-1.011 -1.696 -1.618 -2.099 -3.053 -2.099z" />
            <path d="M19.78 7h-.03c-1.219 .02 -2.35 1.066 -2.908 2.504c-.69 1.775 -.348 3.72 1.075 4.333c.256 .109 .527 .163 .801 .163c1.231 0 2.38 -1.053 2.943 -2.504c.686 -1.774 .34 -3.72 -1.076 -4.332a2.05 2.05 0 0 0 -.804 -.164z" />
            <path d="M9.025 3c-.112 0 -.185 .002 -.27 .015l-.093 .016c-1.532 .206 -2.397 1.989 -2.108 3.855c.272 1.725 1.462 3.114 2.92 3.114l.187 -.005a1.26 1.26 0 0 0 .084 -.01l.092 -.016c1.533 -.206 2.397 -1.989 2.108 -3.855c-.27 -1.727 -1.46 -3.114 -2.92 -3.114z" />
            <path d="M14.972 3c-1.459 0 -2.647 1.388 -2.916 3.113c-.29 1.867 .574 3.65 2.174 3.867c.103 .013 .2 .02 .296 .02c1.39 0 2.543 -1.265 2.877 -2.883l.041 -.23c.29 -1.867 -.574 -3.65 -2.174 -3.867a2.154 2.154 0 0 0 -.298 -.02z" />
            <path d="M4.217 7c-.274 0 -.544 .054 -.797 .161c-1.426 .615 -1.767 2.562 -1.078 4.335c.563 1.451 1.71 2.504 2.941 2.504c.274 0 .544 -.054 .797 -.161c1.426 -.615 1.767 -2.562 1.078 -4.335c-.563 -1.451 -1.71 -2.504 -2.941 -2.504z" />
          </svg>
        </div>

        {/* Restante do conteúdo */}
        <div className="flex flex-col justify-center">
          {/* Título grande */}
          <h1 className="text-5xl font-bold text-red-400 mb-6">
          Socialização e Diversão para Cães e Donos
          </h1>

          {/* Descrição */}
          <p className="text-lg text-gray-600 mb-8">
          Crie e participe de eventos personalizados para o seu cãozinho, com filtros por raça, porte e localização. Uma plataforma exclusiva para donos de cães que valorizam a socialização e a diversão.
          </p>

          {/* Botão de Login */}
          <a
            href="/login"
            className="w-1/3 bg-red-400 text-white py-3 px-6 rounded-md text-center hover:bg-red-300 focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            Login
          </a>
        </div>
      </div>

      {/* Lado direito: Imagem */}
      <div className="w-1/2 flex items-center justify-center bg-red-50">
        <img
          src={dogImage}
          alt="Cãozinho"
          className="w-96 md:w-96 h-auto object-cover" // Ajusta a imagem para caber no espaço sem distorcer, tem responsividade pra telas medias
        />
      </div>
    </div>
  );
}

export default LandingPage;