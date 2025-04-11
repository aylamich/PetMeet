import React, { useState, useEffect } from 'react';
import logo from '/logo.png'; // Importação da logo

function EditarPerfil({ onClose, onSave }) {
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

  // Campo cidade e estado
  const [ufSelecionado, setUfSelecionado] = useState('');
  const [cidades, setCidades] = useState([]);
  const [cidadeSelecionada, setCidadeSelecionada] = useState('');

  // Estado para os dados do usuário
  const [dadosUsuario, setDadosUsuario] = useState(null);

  // Carregar os dados do usuário ao montar o componente
  useEffect(() => {
    const usuarioId = localStorage.getItem('usuario_id');
    if (usuarioId) {
      fetch(`/api/consultausuario?id=${usuarioId}`)
        .then(response => {
          if (!response.ok) throw new Error('Erro ao buscar usuário');
          return response.json();
        })
        .then(data => {
          setDadosUsuario(data);
          setUfSelecionado(data.uf || '');
          setCidadeSelecionada(data.id_cidade || '');
        })
        .catch(error => console.error('Erro ao buscar dados do usuário:', error));
    }
  }, []);

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

    if (dataNasc.getFullYear() > 2025) {
      setDataNascimentoErro('O ano de nascimento não pode ser posterior a 2025.');
      return false;
    }

    let idade = dataAtual.getFullYear() - dataNasc.getFullYear();
    const mesAtual = dataAtual.getMonth(); // Mês atual 
    const diaAtual = dataAtual.getDate(); // Dia atual
    const mesNasc = dataNasc.getMonth(); // Mês de nascimento
    const diaNasc = dataNasc.getDate(); // Dia de nascimento

    if (mesAtual < mesNasc || (mesAtual === mesNasc && diaAtual < diaNasc)) {
      idade--; // Ainda não fez aniversário este ano
    }
  
    if (idade < 18) {
      setDataNascimentoErro('Você deve ter pelo menos 18 anos para se cadastrar.');
      return false;
    }
    setDataNascimentoErro(''); // Limpa a mensagem de erro se a data for válida
    return true;
  };

  const validarSenha = (senha) => {
    const temMinimo = senha.length >= 6; // Pelo menos 6 caracteres
    const temMaiuscula = /[A-Z]/.test(senha); // Pelo menos 1 letra maiúscula
    const temNumero = /\d/.test(senha); // Pelo menos 1 número
    const temEspecial = /[!@#$%^&*(),.?":{}|<>]/.test(senha); // Verifica se há pelo menos 1 caractere especial

    setTemMinimoCaracteres(temMinimo);
    setTemMaiuscula(temMaiuscula);
    setTemNumero(temNumero);
    setTemCaractereEspecial(temEspecial);

    if (temMinimo && temMaiuscula && temNumero && temEspecial) {
      setSenhaErro(''); // Limpa a mensagem de erro se a senha for válida
      return true;
    } else {
      setSenhaErro('A senha não atende aos requisitos.');
      return false;
    }
  };

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
      if (dadosUsuario && dadosUsuario.id_cidade) {
        setCidadeSelecionada(dadosUsuario.id_cidade);
      } else {
        setCidadeSelecionada('');
      }
    } catch (error) {
      console.error('Erro:', error);
    }
  };

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

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSenhaErro('');
    setDataNascimentoErro('');
    setEmailErro('');

    const formData = new FormData(event.target);
    const dadosUsuarioAtualizados = {
      usuario_id: localStorage.getItem('usuario_id'),
      nome_completo: formData.get('nome_completo'),
      email: formData.get('email'),
      genero: formData.get('genero'),
      data_nascimento: formData.get('data_nascimento'),
      uf: formData.get('uf'),
      id_cidade: formData.get('cbcidade'),
      senha: formData.get('senha') || undefined, // Senha é opcional na edição
    };

    if (!validarDataNascimento(dadosUsuarioAtualizados.data_nascimento)) {
      return;
    }

    if (dadosUsuarioAtualizados.senha && !validarSenha(dadosUsuarioAtualizados.senha)) {
      return;
    }

    if (!validarEmail(dadosUsuarioAtualizados.email)) {
      return;
    }

    setCarregando(true);

    try {
      const response = await fetch('/api/alterarusuario', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dadosUsuarioAtualizados)
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar usuário');
      }

      const data = await response.json();
      console.log('Resposta do servidor:', data);

      localStorage.setItem('usuarioNome', dadosUsuarioAtualizados.nome_completo);
      // Chama onSave com os dados atualizados
      onSave({
        nome_completo: dadosUsuarioAtualizados.nome_completo,
        email: dadosUsuarioAtualizados.email,
        genero: dadosUsuarioAtualizados.genero,
        data_nascimento: dadosUsuarioAtualizados.data_nascimento,
        uf: dadosUsuarioAtualizados.uf,
        id_cidade: dadosUsuarioAtualizados.id_cidade,
        cidade_nome: cidades.find(c => c.id === dadosUsuarioAtualizados.id_cidade)?.nomeCidade || dadosUsuario.cidade_nome,
      });

      setTimeout(() => {
        setCarregando(false);
        onClose(); // Fecha o modal após salvar
      }, 2000);
    } catch (error) {
      console.error('Erro na requisição:', error);
      setCarregando(false);
      setEmailErro('Erro ao atualizar. Tente novamente.');
    }
  };

  if (!dadosUsuario) {
    return <div className="p-6">Carregando...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <div className="bg-red-400 text-white p-4 rounded-t-lg flex justify-between items-center">
        <h3 className="text-xl font-bold">Editar Perfil</h3>
        <button onClick={onClose} className="text-white hover:text-red-100">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="p-6">
        <form id="editarPerfilForm" onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="nomeCompleto" className="block text-sm font-medium text-gray-700">
              Nome Completo<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="nomeCompleto"
              name="nome_completo"
              placeholder="Digite seu nome completo"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-200"
              onChange={handleNomeCompletoChange}
              defaultValue={dadosUsuario.nome_completo}
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email<span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="seuemail@exemplo.com"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-200"
              onChange={(e) => validarEmail(e.target.value)}
              defaultValue={dadosUsuario.email}
              required
            />
            {emailErro && <p className="text-sm text-red-500 mt-2">{emailErro}</p>}
          </div>

          <div className="mb-4">
            <label htmlFor="genero" className="block text-sm font-medium text-gray-700">
              Gênero<span className="text-red-500">*</span>
            </label>
            <select
              id="genero"
              name="genero"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-200"
              defaultValue={dadosUsuario.genero}
              required
            >
              <option value="" disabled>
                Selecione seu gênero
              </option>
              <option value="feminino">Feminino</option>
              <option value="masculino">Masculino</option>
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="dataNascimento" className="block text-sm font-medium text-gray-700">
              Data de Nascimento<span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="dataNascimento"
              name="data_nascimento"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-200"
              defaultValue={dadosUsuario.data_nascimento || ''}
              required
              onChange={(e) => validarDataNascimento(e.target.value)}
            />
            {dataNascimentoErro && (
              <p className="text-sm text-red-500 mt-2">{dataNascimentoErro}</p>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="uf" className="block text-sm font-medium text-gray-700">
              Estado<span className="text-red-500">*</span>
            </label>
            <select
              id="uf"
              name="uf"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-200"
              required
              value={ufSelecionado}
              onChange={(e) => setUfSelecionado(e.target.value)}
            >
              <option value="" disabled>
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

          <div className="mb-4">
            <label htmlFor="cidade" className="block text-sm font-medium text-gray-700">
              Cidade<span className="text-red-500">*</span>
            </label>
            <select
              id="cidade"
              name="cbcidade"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-200"
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

          <div className="mb-6">
            <label htmlFor="senha" className="block text-sm font-medium text-gray-700">
              Senha (opcional)
            </label>
            <div className="relative">
              <input
                type={mostrarSenha ? "text" : "password"}
                id="senha"
                name="senha"
                placeholder="Digite sua nova senha"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                onChange={(e) => validarSenha(e.target.value)}
                onFocus={handleSenhaFocus}
                onBlur={handleSenhaBlur}
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
            {senhaErro && <p className="text-sm text-red-500 mt-2">{senhaErro}</p>}

            {mostrarRequisitosSenha && (
              <div id="senhaRequisitos" className="text-sm mt-2">
                <p>A senha deve ter:</p>
                <ul className="list-disc list-inside">
                  <li className={temMinimoCaracteres ? 'text-green-500' : 'text-red-500'}>
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

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-400 text-white rounded-lg hover:bg-red-500"
            >
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>

      {carregando && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <button
            disabled
            type="button"
            className="py-2.5 px-5 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 inline-flex items-center"
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
  );
}

export default EditarPerfil;