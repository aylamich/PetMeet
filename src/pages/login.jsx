import React from 'react';
import logo from '/logo.png'; // Importação da logo

function Login() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row"> {/* Responsividade */}
      {/* Lado esquerdo: Logo */}
      <div
        className="hidden md:block md:w-3/5 bg-cover bg-center" // Oculta em telas pequenas, exibe em telas médias/grandes 3 de 5 blocos
        style={{ backgroundImage: `url(${logo})` }} // Logo de fundo
      ></div>

      {/* Lado direito: Formulário de Login */}
      <div className="w-full md:w-2/5 flex items-center justify-center bg-white"> {/* Formulário ocupada 2 blocos de 5 em telas grandes e médias (ocupa toda a largura em telas pequenas)*/}
        <div className="w-full max-w-md p-8"> {/* Ocupa 100% do container pai, tem padding de 32px e limita o tamanho máximo */}
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Login</h2>

          {/* Formulário */}
          <form>
            {/* Campo de Email */}
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700"> {/* htmlFor é equivalente ao for do HTML */}
                Email
              </label>
              <input type="email" id="email" name="email" placeholder="Digite seu email" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-200"
              required/>
            </div>

            {/* Campo de Senha */}
            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Senha
              </label>
              <input type="password" id="password" name="password" placeholder="Digite sua senha" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-200"
              required/>
            </div>

            {/* Botão de Entrar */}
            <button
              type="submit"
              className="w-full bg-red-400 text-white py-2 px-4 rounded-md hover:bg-red-300 focus:outline-none focus:ring-2 focus:ring-red-400"
            >
              Entrar
            </button>
          </form>

          {/* Link para Cadastro */}
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Não está registrado?
              <a href="/cadastro" className="text-red-400 hover:text-red-300"> {/* Redireciona a tela de cadastro */}
                Crie uma conta
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;