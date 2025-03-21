import React, { useState } from 'react';
import logo from '/logo.png'; // Importação da logo

function Cadastro() {
  const [senhaErro, setSenhaErro] = useState(''); // Inicializa o estado senhaErro com um valor inicial de '' (string vazia). o SET atualiza o valor do estado.
  const [mostrarRequisitosSenha, setMostrarRequisitosSenha] = useState(false); // Initializa o estado mostrarRequisitosSenha com um valor inicial de false (não aparece)
  const [carregando, setCarregando] = useState(false); // Estado para controlar o spinner de carregamento
  const [dataNascimentoErro, setDataNascimentoErro] = useState(''); // Inicializa o estado dataNascimentoErro com um valor inicial de '' (string vazia). o SET atualiza o valor do estado.

  const handleNomeCompletoChange = (event) => { 
    // Impede que o usuário digite números no campo de nome completo
    event.target.value = event.target.value.replace(/\d/g, ''); // Não deixa digitar números substituindo por string vazia
  };

  const handleSenhaFocus = () => { // Quando o usuário clica no campo de senha
    setMostrarRequisitosSenha(true); // Aparece os requisitos
  };

  const handleSenhaBlur = () => { // Quando o usuário sai do campo de senha
    if (!senhaErro) { // Se a senha não estiver errada
      setMostrarRequisitosSenha(false); // Os requisitos somem
    }
  };

  const validarDataNascimento = (dataNascimento) => {
    const dataAtual = new Date(); // Cria uma nova data com o momento atual
    const dataNasc = new Date(dataNascimento);  // Converte a string de data de nascimento em um objeto Date

    /*const idade = dataAtual.getFullYear() - dataNasc.getFullYear(); // // Calcula a idade subtraindo os anos*/

    // Verifica se o ano de nascimento é posterior a 2025
    if (dataNasc.getFullYear() > 2025) {
      setDataNascimentoErro('O ano de nascimento não pode ser posterior a 2025.');
      return false;
    }

     // Calcula a idade subtraindo os anos
    let idade = dataAtual.getFullYear() - dataNasc.getFullYear();
    // Verifica se o aniversário já ocorreu este ano
    const mesAtual = dataAtual.getMonth(); // Mês atual (0-11)
    const diaAtual = dataAtual.getDate(); // Dia atual
    const mesNasc = dataNasc.getMonth(); // Mês de nascimento
    const diaNasc = dataNasc.getDate(); // Dia de nascimento

  if (mesAtual < mesNasc || (mesAtual === mesNasc && diaAtual < diaNasc)) {
    idade--; // Ainda não fez aniversário este ano
  }
  
    // Verifica se o usuário tem pelo menos 18 anos
    if (idade < 18) {
      setDataNascimentoErro('Você deve ter pelo menos 18 anos para se cadastrar.');
      return false;
    }
  
    // Limpa a mensagem de erro se a data for válida
    setDataNascimentoErro('');
    return true;
  };

  const handleSubmit = (event) => {
    event.preventDefault(); // Evite que a página seja recarregada ao enviar o formulário, para processar dados de formulários sem recarregar a página

    // Limpar mensagens de erro anteriores
    setSenhaErro('');
    setDataNascimentoErro(''); // Limpa a mensagem de erro da data de nascimento

    // Validar data de nascimento
    const dataNascimento = event.target.dataNascimento.value;
    if (!validarDataNascimento(dataNascimento)) {
      return; // Impede o envio do formulário se a data for inválida
    }



    // Validar senha
    const senha = event.target.senha.value;
    const regexSenha = /^(?=.*[A-Z])(?=.*\d).{6,}$/; // Requisitos da senha: 1 letra maiúscula, 1 número e no mínimo 6 caracteres
    if (!regexSenha.test(senha)) { // Se a senha não atender aos requisitos
      setSenhaErro('A senha não atende aos requisitos.'); // Mensagem de erro setada
      return;
    }

    // Ativar o spinner e o fundo azulado
    setCarregando(true);
    // Se tudo estiver válido, redireciona para o usuário realizar o login
    setTimeout(() => {
      window.location.href = '/cadastropet'; // Redireciona para a tela de cadastro de pet
    }, 3000); // 3 segundos de espera
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row"> {/* Responsividade */}
      {/* Lado esquerdo: Imagem */}
      <div
        className="hidden md:block md:w-3/5 bg-cover bg-center" // Oculta em telas pequenas, exibe em telas médias/grandes 3 de 5 blocos
        style={{ backgroundImage: `url(${logo})` }} // Logo PetMeet
      ></div>

      {/* Lado direito: Formulário de Cadastro */}
      <div className="w-full md:w-2/5 flex items-center justify-center bg-white"> {/* Ocupa 2 de 5 blocos na tela em telas médias e grandes e em pequenas toda a largura */}
        <div className="w-full max-w-md p-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Cadastro</h2>

          {/* Formulário */}
          <form id="cadastroForm" onSubmit={handleSubmit}>
            {/* Campo de Nome Completo */}
            <div className="mb-4">
              <label htmlFor="nomeCompleto" className="block text-sm font-medium text-gray-700">
                Nome Completo<span className="text-red-500">*</span>
              </label>
              <input type="text" id="nomeCompleto" name="nomeCompleto" placeholder="Digite seu nome completo" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-200" 
                onChange={handleNomeCompletoChange}
                required/>
            </div>

            {/* Campo de Email */}
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email<span className="text-red-500">*</span>
              </label>
              <input type="email" id="email" name="email" placeholder="seuemail@exemplo.com" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                required/> {/* O type EMAIL já tem a validação junto caso a pessoa não coloque um @ */}
            </div>

            {/* Campo de selecionar gênero */}
            <div className="mb-4">
              <label htmlFor="genero" className="block text-sm font-medium text-gray-700">
                Gênero<span className="text-red-500">*</span>
              </label> 
              <select id="genero" name="genero" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                required>

                <option value="" disabled selected>
                  Selecione seu gênero
                </option>
                <option value="feminino">Feminino</option>
                <option value="masculino">Masculino</option>
              </select>
            </div>

            {/* Campo de Data de Nascimento */}
            <div className="mb-4">
                <label htmlFor="dataNascimento" className="block text-sm font-medium text-gray-700">
                  Data de Nascimento<span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="dataNascimento"
                  name="dataNascimento"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                  required
                />
                {dataNascimentoErro && (
                  <p className="text-sm text-red-500 mt-2">{dataNascimentoErro}</p>
                )}
            </div>

            {/* Campo de Estado */}
            <div className="mb-4">
              <label htmlFor="estado" className="block text-sm font-medium text-gray-700">
                Estado<span className="text-red-500">*</span>
              </label>
              <select id="estado" name="estado" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                required>

                <option value="" disabled selected>
                  Selecione seu estado
                </option>
                {/* Opções de estado vou adicionar pelo BD, por enquanto vou por so algumas*/}
                <option value="RS">RS</option>
                <option value="SC">SC</option>
                <option value="PR">PR</option>
              </select>
            </div>

             {/* Campo de Cidade */}
             <div className="mb-4">
              <label htmlFor="cidade" className="block text-sm font-medium text-gray-700">
                Cidade<span className="text-red-500">*</span>
              </label>
              <select id="cidade" name="cidade" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                required>

                <option value="" disabled selected>
                  Selecione sua cidade
                </option>
                {/* Opções de cidade vou adicionar pelo BD filtrando por ESTADO */}
                <option value="Porto Alegre">Porto Alegre</option>
                <option value="Florianópolis">Florianópolis</option>
                <option value="Curitiba">Curitiba</option>
              </select>
            </div>

            {/* Campo de Senha, chama as funções pra esconder os requisitos */}
            <div className="mb-6">
              <label htmlFor="senha" className="block text-sm font-medium text-gray-700">
                Senha<span className="text-red-500">*</span>
              </label>
              <input type="password" id="senha" name="senha" placeholder="Digite sua senha" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                onFocus={handleSenhaFocus} 
                onBlur={handleSenhaBlur}
                required 
              />

              {/* Mensagem de erro da senha */}
              {senhaErro && <p className="text-sm text-red-500 mt-2">{senhaErro}</p>}

              {/* Requisitos da senha */}
              {mostrarRequisitosSenha && (
                <div id="senhaRequisitos" className="text-sm text-red-500 mt-2">
                  <p>A senha deve ter:</p>
                  <ul className="list-disc list-inside">
                    <li>No mínimo 6 caracteres</li>
                    <li>Pelo menos 1 letra maiúscula</li>
                    <li>Pelo menos 1 número</li>
                  </ul>
                </div>
              )}
            </div>

            {/* Botão de Próximo */}
            <button
              type="submit"
              className="w-full bg-red-400 text-white py-2 px-4 rounded-md hover:bg-red-300 focus:outline-none focus:ring-2 focus:ring-red-300"
            >
              Próximo
            </button>
          </form>
        </div>

        {/* Spinner e fundo com opacidade */}
        {carregando && (
  <div className="absolute inset-0 flex items-center justify-center">
    <button
      disabled
      type="button"
      className="py-2.5 px-5 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 inline-flex items-center"
    >
      <svg
        aria-hidden="true"
        role="status"
        className="inline w-4 h-4 me-3 text-gray-200 animate-spin"
        viewBox="0 0 100 101"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
          fill="currentColor"
        />
        <path
          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
          fill="#1C64F2"
        />
      </svg>
      Carregando...
    </button>
  </div>
)}
      </div>
    </div>
  );
}

export default Cadastro;