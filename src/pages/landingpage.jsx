import React from 'react';
import logo from '/logoredonda.png';
import dogImage from '/dogImage.png';

function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-red-50">
      {/* Navbar */}
      <nav className="bg-white shadow fixed w-full z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <img src={logo} alt="PetMeet Logo" className="w-12 h-12 mr-3" />
            <span className="text-2xl font-bold text-blue-900">PetMeet</span>
          </div>
          <div className="space-x-6 hidden md:flex">
            <a href="#features" className="text-gray-700 hover:text-red-400">Benefícios</a>
            <a href="#testimonials" className="text-gray-700 hover:text-red-400">Depoimentos</a>
            <a href="#cta" className="text-gray-700 hover:text-red-400">Comece Agora</a>
          </div>
          <a
            href="/login"
            className="bg-red-400 text-white py-2 px-4 rounded-md hover:bg-red-300"
          >
            Login
          </a>
        </div>
      </nav>

      {/* Hero */}
      <div className="pt-28 md:pt-36 flex flex-col md:flex-row">
        <div className="w-full md:w-1/2 flex flex-col p-6 md:p-12">
          <div className="flex items-center mb-8">
            <h1 className="font-acme text-7xl font-bold text-blue-900">PetMeet</h1>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 24 24"
              className="w-14 h-14 ml-4 text-blue-900"
            >
              {/* Ícone patinha */}
              <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <path d="M12 10c-1.32 0 -1.983 .421 -2.931 1.924l-.244 .398l-.395 .688a50.89 50.89 0 0 0 -.141 .254c-.24 .434 -.571 .753 -1.139 1.142l-.55 .365c-.94 .627 -1.432 1.118 -1.707 1.955c-.124 .338 -.196 .853 -.193 1.28c0 1.687 1.198 2.994 2.8 2.994l.242 -.006c.119 -.006 .234 -.017 .354 -.034l.248 -.043l.132 -.028l.291 -.073l.162 -.045l.57 -.17l.763 -.243l.455 -.136c.53 -.15 .94 -.222 1.283 -.222c.344 0 .753 .073 1.283 .222l.455 .136l.764 .242l.569 .171l.312 .084c.097 .024 .187 .045 .273 .062l.248 .043c.12 .017 .235 .028 .354 .034l.242 .006c1.602 0 2.8 -1.307 2.8 -3c0 -.427 -.073 -.939 -.207 -1.306c-.236 -.724 -.677 -1.223 -1.48 -1.83l-.257 -.19l-.528 -.38c-.642 -.47 -1.003 -.826 -1.253 -1.278l-.27 -.485l-.252 -.432c-1.011 -1.696 -1.618 -2.099 -3.053 -2.099z" />
            <path d="M19.78 7h-.03c-1.219 .02 -2.35 1.066 -2.908 2.504c-.69 1.775 -.348 3.72 1.075 4.333c.256 .109 .527 .163 .801 .163c1.231 0 2.38 -1.053 2.943 -2.504c.686 -1.774 .34 -3.72 -1.076 -4.332a2.05 2.05 0 0 0 -.804 -.164z" />
            <path d="M9.025 3c-.112 0 -.185 .002 -.27 .015l-.093 .016c-1.532 .206 -2.397 1.989 -2.108 3.855c.272 1.725 1.462 3.114 2.92 3.114l.187 -.005a1.26 1.26 0 0 0 .084 -.01l.092 -.016c1.533 -.206 2.397 -1.989 2.108 -3.855c-.27 -1.727 -1.46 -3.114 -2.92 -3.114z" />
            <path d="M14.972 3c-1.459 0 -2.647 1.388 -2.916 3.113c-.29 1.867 .574 3.65 2.174 3.867c.103 .013 .2 .02 .296 .02c1.39 0 2.543 -1.265 2.877 -2.883l.041 -.23c.29 -1.867 -.574 -3.65 -2.174 -3.867a2.154 2.154 0 0 0 -.298 -.02z" />
            <path d="M4.217 7c-.274 0 -.544 .054 -.797 .161c-1.426 .615 -1.767 2.562 -1.078 4.335c.563 1.451 1.71 2.504 2.941 2.504c.274 0 .544 -.054 .797 -.161c1.426 -.615 1.767 -2.562 1.078 -4.335c-.563 -1.451 -1.71 -2.504 -2.941 -2.504z" />
          </svg>

          </div>
          <h2 className="text-4xl font-bold text-red-400 mb-6">
            Socialização e Diversão para Cães e Donos
          </h2>
          <p className="text-lg text-gray-600 mb-8">
          Dê ao seu cãozinho a oportunidade de socializar, exercitar-se e se divertir! 
          Com o PetMeet, criar ou encontrar eventos perfeitos para o seu pet fica fácil: 
          Seja um passeio matinal no parque, uma festa de aniversário canina ou um 
          encontro entre raças similares - tudo para enriquecer a vida do seu melhor amigo!
          </p>
          <a
            href="/login"
            className="w-1/3 bg-red-400 text-white py-3 px-6 rounded-md text-center hover:bg-red-300"
          >
            Login
          </a>
        </div>
        <div className="w-full md:w-1/2 flex items-center justify-center">
          <img src={dogImage} alt="Cãozinho" className="w-96 h-auto object-cover" />
        </div>
      </div>

      {/* Features Section */}
      <section id="features" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h3 className="text-3xl font-bold text-blue-900 mb-10">Por que usar o PetMeet?</h3>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="bg-red-50 p-6 rounded-lg shadow hover:shadow-lg transition">
              <h4 className="text-xl font-semibold text-red-400 mb-4">Eventos Personalizados</h4>
              <p>Crie encontros com base na raça, porte e idade do seu cãozinho.</p>
            </div>
            <div className="bg-red-50 p-6 rounded-lg shadow hover:shadow-lg transition">
              <h4 className="text-xl font-semibold text-red-400 mb-4">Comunidade Canina</h4>
              <p>Conecte-se com outros donos e descubra eventos na sua região.</p>
            </div>
            <div className="bg-red-50 p-6 rounded-lg shadow hover:shadow-lg transition">
              <h4 className="text-xl font-semibold text-red-400 mb-4">Exclusivo para Cães</h4>
              <p>Um espaço onde os dogs são as verdadeiras estrelas - e os humanos garantem os petiscos</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-16 bg-red-100">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h3 className="text-3xl font-bold text-blue-900 mb-10">O que dizem os donos?</h3>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-gray-600 italic">"Encontrei amigos para mim e para minha cachorrinha! Recomendo demais!"</p>
              <span className="block mt-4 font-semibold text-blue-900">— Ana, humana da Meg - SP</span>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-gray-600 italic">"Aos 12 anos, meu vira-lata achou sua turma no evento 'Cães Sênior'. Eles não correm muito, mas fazem a melhor fofoca do parque!"</p>
              <span className="block mt-4 font-semibold text-blue-900">— Marcos, dono do Tob - RJ</span>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-gray-600 italic">"Meu golden ama! Toda semana um passeio novo."</p>
              <span className="block mt-4 font-semibold text-blue-900">— Tatiane, mãe do Bolt - MG</span>
            </div>
          </div>
        </div>
      </section>

      {/* Call To Action Section */}
      <section id="cta" className="py-16 bg-blue-900 text-white text-center">
        <h3 className="text-4xl font-bold mb-4">Junte-se à matilha!</h3>
        <p className="mb-8 text-lg">Comece a socializar seu cão hoje mesmo. Crie um perfil grátis e participe de eventos.</p>
        <a
          href="/register"
          className="bg-red-400 hover:bg-red-300 py-3 px-8 rounded-md text-white font-semibold text-lg"
        >
          Criar Conta
        </a>
      </section>

      {/* Footer */}
      <footer className="bg-white py-8 border-t">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between">
          <div>
            <img src={logo} alt="PetMeet Logo" className="w-14 mb-4" />
            <p className="text-gray-600 mb-2">PetMeet — Conectando cães e donos.</p>
            <p className="text-gray-500 text-sm">© 2025 PetMeet. Todos os direitos reservados.</p>
          </div>
          <div className="mt-6 md:mt-0 space-y-2">
            <a href="#features" className="text-gray-700 hover:text-red-400">Benefícios</a><br/>
            <a href="#testimonials" className="text-gray-700 hover:text-red-400">Depoimentos</a><br/>
            <a href="/contato" className="text-gray-700 hover:text-red-400">Contato</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
