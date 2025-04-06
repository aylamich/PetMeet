import React, { useState } from 'react';
import { useEffect } from 'react'; // Importa o hook useEffect do React
import logo from '/logo.png'; // Importação da logo

function Cadastro() {
  // Declarações de estados para os campos do formulário
  const [senhaErro, setSenhaErro] = useState(''); // Inicializa o estado senhaErro com um valor inicial de '' (string vazia). o SET atualiza o valor do estado.
  const [emailErro, setEmailErro] = useState(''); // Inicializa o estado emailErro com um valor inicial de '' (string vazia). o SET atualiza o valor do estado.
  const [mostrarRequisitosSenha, setMostrarRequisitosSenha] = useState(false); // Initializa o estado mostrarRequisitosSenha com um valor inicial de false (não aparece)
  const [carregando, setCarregando] = useState(false); // Estado para controlar o spinner de carregamento
  const [dataNascimentoErro, setDataNascimentoErro] = useState(''); // Inicializa o estado dataNascimentoErro com um valor inicial de '' (string vazia). o SET atualiza o valor do estado.
  const [mostrarSenha, setMostrarSenha] = useState(false); // Estado para mostrar/esconder a senha


   // Estados para os requisitos da senha
   const [temMinimoCaracteres, setTemMinimoCaracteres] = useState(false); // Todos inicializam falsos
   const [temMaiuscula, setTemMaiuscula] = useState(false);
   const [temNumero, setTemNumero] = useState(false);
   const [temCaractereEspecial, setTemCaractereEspecial] = useState(false);


  const handleNomeCompletoChange = (event) => { 
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

  const validarEmail = (email) => { // Apesar de ter o type EMAIL no input, fiz uma validação extra
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Regex básico para email
    if (!regexEmail.test(email)) { // Se o email não atender ao regex
      setEmailErro('Por favor, insira um email válido.'); // Mensagem de erro
      return false;
    } else {
      setEmailErro(''); // Limpa a mensagem de erro se o email for válido
      return true;
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
    const mesAtual = dataAtual.getMonth(); // Mês atual 
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
    setDataNascimentoErro(''); // Limpa a mensagem de erro se a data for válida
    return true;
  };

  /*const validarSenha = (senha) => {
    const regexSenha = /^(?=.*[A-Z])(?=.*\d).{6,}$/; // Requisitos da senha: 1 letra maiúscula, 1 número e no mínimo 6 caracteres
    if (!regexSenha.test(senha)) { // Se a senha não atender aos requisitos (! é negação)
      setSenhaErro('A senha não atende aos requisitos.'); // Mensagem de erro
      return false;
    } else {
      setSenhaErro(''); // Limpa a mensagem de erro se a senha for válida
      return true;
    }
  };*/

  const validarSenha = (senha) => {
    // Verifica cada requisito da senha
    const temMinimo = senha.length >= 6; // Pelo menos 6 caracteres
    const temMaiuscula = /[A-Z]/.test(senha); // Pelo menos 1 letra maiúscula
    const temNumero = /\d/.test(senha); // Pelo menos 1 número
    const temEspecial = /[!@#$%^&*(),.?":{}|<>]/.test(senha); // Verifica se há pelo menos 1 caractere especial

    // Atualiza os estados dos requisitos
    setTemMinimoCaracteres(temMinimo);
    setTemMaiuscula(temMaiuscula);
    setTemNumero(temNumero);
    setTemCaractereEspecial(temEspecial);

    // Verifica se todos os requisitos foram atendidos
    if (temMinimo && temMaiuscula && temNumero && temEspecial) {
      setSenhaErro(''); // Limpa a mensagem de erro se a senha for válida
      return true;
    } else {
      setSenhaErro('A senha não atende aos requisitos.');
      return false;
    }
  };


// ---------------------------------------------------- //-------------------------------------------------- //
// Script 
// Campo cidade e estado
const [ufSelecionado, setUfSelecionado] = useState('');
const [cidades, setCidades] = useState([]);
const [cidadeSelecionada, setCidadeSelecionada] = useState('');

      const carregarCidadesPorUF = async (ufSelecionado) => {
        console.log("carregamento de cidades para UF:", ufSelecionado);
        try {
          const response = await fetch('/api/consultacidadeporUF', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ufSelecionado }) // ← Enviando no body
          });
          
          const data = await response.json();
          setCidades(data);
          setCidadeSelecionada('');
        } catch (error) {
          console.error('Erro:', error);
        }
      };

        // Efeito para carregar cidades quando UF muda
        useEffect(() => {
          if (ufSelecionado) {
            carregarCidadesPorUF(ufSelecionado);
          } else {
            setCidades([]);
            setCidadeSelecionada('');
          }
        }, [ufSelecionado]);

        const handleCidadeChange = (e) => {
          const cidadeId = e.target.value;
          setCidadeSelecionada(cidadeId);

        };


// ---------------------------------------------------- //-------------------------------------------------- //
// Função para enviar o formulário        
      const handleSubmit = async (event) => {
        event.preventDefault();

        // Limpar mensagens de erro anteriores
        setSenhaErro('');
        setDataNascimentoErro('');
        setEmailErro('');

        // Pegar os valores do formulário
        const formData = new FormData(event.target);
        const dadosUsuario = {
          nome_completo: formData.get('nome_completo'),
          email: formData.get('email'),
          genero: formData.get('genero'),
          data_nascimento: formData.get('data_nascimento'),
          uf: formData.get('uf'),
          id_cidade: formData.get('cbcidade'), // Note que o name no HTML é "cbcidade"
          senha: formData.get('senha')
        };

        // Validar os campos
        if (!validarDataNascimento(dadosUsuario.data_nascimento)) {
          return;
        }

        if (!validarSenha(dadosUsuario.senha)) {
          return;
        }

        if (!validarEmail(dadosUsuario.email)) {
          return;
        }

        // Ativar o spinner
        setCarregando(true);

        try {
          // Fazer a requisição POST para o backend
          const response = await fetch('/api/cadastrousuario', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(dadosUsuario)
          });

          if (!response.ok) {
            throw new Error('Erro ao cadastrar usuário');
          }

          //const data = await response.text();
          const data = await response.json(); // Pega a resposta do servidor em JSON
          console.log('Resposta do servidor:', data);

          localStorage.setItem('usuario_id', data.usuario_id);
          localStorage.setItem('usuarioNome', dadosUsuario.nome_completo);

          // Se sucesso, redirecionar
          setTimeout(() => {
            window.location.href = '/cadastropet';
          }, 2000); // 2 segundos de espera

        } catch (error) {
          console.error('Erro na requisição:', error);
          setCarregando(false);
          setEmailErro(error.message);
          // Aqui você pode adicionar uma mensagem de erro para o usuário
          setEmailErro('Erro ao cadastrar. Tente novamente.');
        }
      };
// ---------------------------------------------------- //-------------------------------------------------- //
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
              <input type="text" id="nomeCompleto" name="nome_completo" placeholder="Digite seu nome completo" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-200" 
                onChange={handleNomeCompletoChange} // Chama a função para não deixar digitar números
                required/>
            </div>

            {/* Campo de Email */}
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email<span className="text-red-500">*</span>
              </label>
              <input type="email" id="email" name="email" placeholder="seuemail@exemplo.com" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-200"
               onChange={(e) => validarEmail(e.target.value)} // Validação
               required/> 
               {emailErro && <p className="text-sm text-red-500 mt-2">{emailErro}</p>}
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
                <input type="date" id="dataNascimento" name="data_nascimento" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                  required
                  onChange={(e) => validarDataNascimento(e.target.value)} // Validação 
                />
                {dataNascimentoErro && ( // se der erro renderiza a mensagem
                  <p className="text-sm text-red-500 mt-2">{dataNascimentoErro}</p>
                )}
            </div>

            {/* Campo de Estado */}
            <div className="mb-4">
              <label htmlFor="uf" className="block text-sm font-medium text-gray-700">
                Estado<span className="text-red-500">*</span>
              </label>
              <select id="uf" name="uf" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                required
                value={ufSelecionado}
                onChange={(e) => setUfSelecionado(e.target.value)}>

                <option value="" disabled selected>
                  Selecione seu estado
                </option>
                    <option value="RO">Rondônia</option>
                    <option value="AC">Acre</option>
                    <option value="AM">Amazonas</option>
                    <option value="RR">Roraima</option>
                    <option value="AP">Amapá</option>
                    <option value="PA">Pará</option>
                    <option value="TO">Tocantins</option>
                    <option value="MA">Maranhão</option>
                    <option value="PI">Piauí</option>
                    <option value="CE">Ceará</option>
                    <option value="RN">Rio Grande do Norte</option>
                    <option value="PB">Paraíba</option>
                    <option value="PE">Pernambuco</option>
                    <option value="AL">Alagoas</option>
                    <option value="SE">Sergipe</option>
                    <option value="BA">Bahia</option>
                    <option value="MG">Minas Gerais</option>
                    <option value="ES">Espírito Santo</option>
                    <option value="RJ">Rio de Janeiro</option>
                    <option value="SP">São Paulo</option>
                    <option value="PR">Paraná</option>
                    <option value="SC">Santa Catarina</option>
                    <option value="RS">Rio Grande do Sul</option>
                    <option value="MS">Mato Grosso do Sul</option>
                    <option value="MT">Mato Grosso</option>
                    <option value="GO">Goiás</option>
                    <option value="DF">Distrito Federal</option>
                    
              </select>
            </div>

             {/* Campo de Cidade */}
             <div className="mb-4">
              <label htmlFor="cidade" className="block text-sm font-medium text-gray-700">
                Cidade<span className="text-red-500">*</span>
              </label>
              <select id="cidade" name="cbcidade" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                  value={cidadeSelecionada}
                  onChange={handleCidadeChange}
                  disabled={!ufSelecionado}
                  required 
                >
              <option value="">
              {cidades.length === 0 && ufSelecionado 
                ? 'Nenhuma cidade encontrada' 
                : !ufSelecionado 
                  ? 'Selecione um estado primeiro' 
                  : 'Selecione uma cidade'}
              </option>
              {cidades.map((cidade) => (
                <option key={cidade.id} value={cidade.id}>
                  {cidade.nomeCidade}
                </option>
             ))}
              </select>
            </div>

            {/* Campo de Senha, chama as funções pra esconder os requisitos */}
            <div className="mb-6">
              <label htmlFor="senha" className="block text-sm font-medium text-gray-700">
                Senha<span className="text-red-500">*</span>
              </label>
              <div className="relative">
              <input type={mostrarSenha ? "text" : "password"} id="senha" name="senha" placeholder="Digite sua senha" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                onChange={(e) => validarSenha(e.target.value)}
                onFocus={handleSenhaFocus} // Quando o usuário clica no campo de senha
                onBlur={handleSenhaBlur} // Quando o usuário sai do campo de senha
                required
              /> 
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5" // pr (padding direito), leading (altura da linha) e absolute em relação ao pai (campo de senha)
                onClick={() => setMostrarSenha(!mostrarSenha)} // Inverte o valor atual de mostrarSenha (se era true, vira false e vice-versa), então começa false, quando eu clico vira true e assim segue, para mudar o estado
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

              {senhaErro && <p className="text-sm text-red-500 mt-2">{senhaErro}</p>}

              {mostrarRequisitosSenha && (
                <div id="senhaRequisitos" className="text-sm mt-2">
                  <p>A senha deve ter:</p>
                  <ul className="list-disc list-inside">
                    <li className={temMinimoCaracteres ? 'text-green-500' : 'text-red-500'}> {/* Se temMinimoCaracteres for verdadeiro, a cor é verde, senão (:), vermelho, mesma lógica pro resto */}
                      No mínimo 6 caracteres
                    </li>
                    <li className={temMaiuscula ? 'text-green-500' : 'text-red-500'}>
                      Pelo menos 1 letra maiúscula
                    </li>
                    <li className={temNumero ? 'text-green-500' : 'text-red-500'}>
                      Pelo menos 1 número
                    </li>
                    <li className={temCaractereEspecial ? 'text-green-500' : 'text-red-500'}>
                      Pelo menos 1 caractere especial
                    </li>
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

        {/* Spinner de carregamento */}
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