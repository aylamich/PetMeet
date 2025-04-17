import React from 'react';
import { useState } from 'react';
import logo from '/logo.png'; // Importação da logo

function Login() {
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false); // Estado para mostrar/esconder a senha
  const [erro, setErro] = useState(''); // Estado para controlar a mensagem de erro

  const handleSubmit = async (e) => { // Função para lidar com o envio do formulário
    e.preventDefault();

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          senha: password, 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Salva o token ou dados do usuário no localStorage
        localStorage.setItem('usuario_id', data.usuario_id);
        localStorage.setItem('email', email);
        localStorage.setItem('usuarioNome', data.nome);

        // Redireciona para a página de eventos se der tudo certo
        window.location.href = '/eventosinscritos';
      } else {
        setErro(data.error || 'Erro ao fazer login. Email ou senha inválidos.');
      }
    } catch (error) {
      console.error('Erro:', error);
      setErro('Erro ao conectar com o servidor');
    }
  };

  const fecharModalErro = () => {
    setErro(''); // Limpa a mensagem de erro e fecha o modal
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Lado esquerdo: Logo */}
      <div
        className="hidden md:block md:w-3/5 bg-cover bg-center"
        style={{ backgroundImage: `url(${logo})` }}
      ></div>

      {/* Lado direito: Formulário de Login */}
      <div className="w-full md:w-2/5 flex items-center justify-center bg-white">
        <div className="w-full max-w-md p-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Login</h2>

          {/* Formulário */}
          <form onSubmit={handleSubmit}>
            {/* Campo de Email */}
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input type="email" id="email" name="email" placeholder="Digite seu email" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-200" value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Campo de Senha */}
            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Senha
              </label>
              <div className="relative">
                <input type={mostrarSenha ? 'text' : 'password'} id="password" name="password" placeholder="Digite sua senha" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-200" value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />  {/* muda o estado do olhinho para mostrar a senha "text" ou esconder "password" */}
                <button
                  type="button" 
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                >
                  {mostrarSenha ? (
                    // Ícone de olho aberto
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
                    // Ícone de olho fechado
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
              <a href="/cadastro" className="text-red-400 hover:text-red-300">
                Crie uma conta
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Modal de Erro */}
      {erro && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Erro</h3>
            <p className="text-sm text-gray-600 mb-4">{erro}</p> {/* Mensagem de erro exibida no modal, vem do BACKEND */}
            <button
              onClick={fecharModalErro}
              className="w-full bg-red-400 text-white py-2 px-4 rounded-md hover:bg-red-300 focus:outline-none focus:ring-2 focus:ring-red-400"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;