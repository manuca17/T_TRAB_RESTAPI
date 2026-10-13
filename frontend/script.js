/* ==========================================================================
   CRUD de alunos com a Fetch API
   Consome a API simulada (json-server) e, na Parte 5, a API real em Express.
   ========================================================================== */

/**
 * URL base da API.
 * - Vazio ('') significa "a mesma origem desta página": funciona tanto quando
 *   é o json-server a servir o frontend (porta 3000) como quando é a API
 *   Express (porta 4000), e também depois do deploy.
 * - Para apontar para uma API noutro domínio, escrever aqui o endereço
 *   completo, por exemplo 'https://trab1-api.onrender.com'.
 */
const API_URL = '';

// Estado em memória, para filtrar e mostrar o nome do curso sem repetir pedidos
let alunos = [];
let cursos = [];

// ===== Referências aos elementos =====

const formAluno = document.querySelector('#formAluno');
const tituloFormulario = document.querySelector('#tituloFormulario');
const inputId = document.querySelector('#alunoId');
const inputNome = document.querySelector('#nome');
const inputApelido = document.querySelector('#apelido');
const selectCurso = document.querySelector('#idCurso');
const selectAno = document.querySelector('#anoCurricular');
const btnGuardar = document.querySelector('#btnGuardar');
const btnCancelar = document.querySelector('#btnCancelar');

const corpoTabela = document.querySelector('#corpoTabela');
const contador = document.querySelector('#contador');
const pesquisa = document.querySelector('#pesquisa');
const filtroCurso = document.querySelector('#filtroCurso');
const btnRecarregar = document.querySelector('#btnRecarregar');

const formCurso = document.querySelector('#formCurso');
const inputNomeCurso = document.querySelector('#nomeDoCurso');
const listaCursos = document.querySelector('#listaCursos');

const caixaMensagem = document.querySelector('#mensagem');

/* ==========================================================================
   Camada de acesso à API
   ========================================================================== */

/**
 * Envolve o fetch para centralizar cabeçalhos, tratamento de erros e JSON.
 * Lança um Error com mensagem legível sempre que a resposta não for 2xx.
 */
async function pedido(caminho, opcoes = {}) {
  const config = { headers: {}, ...opcoes };

  // Só faz sentido anunciar JSON quando existe corpo para enviar
  if (config.body !== undefined) {
    config.headers['Content-Type'] = 'application/json';
    config.body = JSON.stringify(config.body);
  }

  let resposta;
  try {
    resposta = await fetch(`${API_URL}${caminho}`, config);
  } catch (erro) {
    // Falha de rede: servidor em baixo, CORS, DNS...
    const onde = API_URL || window.location.origin;
    throw new Error(`Não foi possível contactar a API em ${onde}. O servidor está a correr?`);
  }

  if (!resposta.ok) {
    throw new Error(`Pedido falhou (${resposta.status} ${resposta.statusText})`);
  }

  // O DELETE do json-server devolve {} e um 204 não traz corpo nenhum
  if (resposta.status === 204) return null;
  return resposta.json();
}

const api = {
  listarAlunos: () => pedido('/alunos'),
  obterAluno: (id) => pedido(`/alunos/${id}`),
  criarAluno: (aluno) => pedido('/alunos', { method: 'POST', body: aluno }),
  atualizarAluno: (id, aluno) => pedido(`/alunos/${id}`, { method: 'PUT', body: aluno }),
  apagarAluno: (id) => pedido(`/alunos/${id}`, { method: 'DELETE' }),

  listarCursos: () => pedido('/cursos'),
  criarCurso: (curso) => pedido('/cursos', { method: 'POST', body: curso }),
  apagarCurso: (id) => pedido(`/cursos/${id}`, { method: 'DELETE' }),
};

/* ==========================================================================
   Mensagens
   ========================================================================== */

let temporizadorMensagem;

function mostrarMensagem(texto, tipo = 'sucesso') {
  clearTimeout(temporizadorMensagem);
  caixaMensagem.textContent = texto;
  caixaMensagem.className = `mensagem ${tipo}`;
  caixaMensagem.hidden = false;

  // Os erros ficam visíveis até à ação seguinte; as confirmações desaparecem
  if (tipo === 'sucesso') {
    temporizadorMensagem = setTimeout(() => { caixaMensagem.hidden = true; }, 4000);
  }
}

function limparMensagem() {
  clearTimeout(temporizadorMensagem);
  caixaMensagem.hidden = true;
}

/* ==========================================================================
   Desenho da tabela de alunos
   ========================================================================== */

/** Evita que dados vindos da API sejam interpretados como HTML. */
function escapar(valor) {
  return String(valor ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[c]);
}

function nomeDoCurso(idCurso) {
  const curso = cursos.find((c) => String(c.id) === String(idCurso));
  return curso ? curso.nomeDoCurso : '(curso desconhecido)';
}

/** Aplica os filtros de pesquisa e de curso ao array em memória. */
function alunosFiltrados() {
  const termo = pesquisa.value.trim().toLowerCase();
  const curso = filtroCurso.value;

  return alunos.filter((aluno) => {
    const nomeCompleto = `${aluno.nome ?? ''} ${aluno.apelido ?? ''}`.toLowerCase();
    const correspondeTermo = !termo || nomeCompleto.includes(termo);
    const correspondeCurso = !curso || String(aluno.idCurso) === curso;
    return correspondeTermo && correspondeCurso;
  });
}

function desenharAlunos() {
  const lista = alunosFiltrados();

  if (lista.length === 0) {
    const texto = alunos.length === 0
      ? 'Ainda não há alunos. Usa o formulário acima para adicionar o primeiro.'
      : 'Nenhum aluno corresponde aos filtros.';
    corpoTabela.innerHTML = `<tr><td colspan="6" class="vazio">${texto}</td></tr>`;
  } else {
    corpoTabela.innerHTML = lista.map((aluno, indice) => `
      <tr data-id="${escapar(aluno.id)}">
        <!-- Número de linha: o id do MongoDB é um ObjectId longo de mais
             para a tabela, por isso fica só no title e no atributo data-id -->
        <td title="id: ${escapar(aluno.id)}">${indice + 1}</td>
        <td>${escapar(aluno.nome)}</td>
        <td>${escapar(aluno.apelido)}</td>
        <td>${escapar(nomeDoCurso(aluno.idCurso))}</td>
        <td>${escapar(aluno.anoCurricular)}.º</td>
        <td class="acoes">
          <button type="button" class="btn btn-secundario btn-pequeno" data-acao="editar">Editar</button>
          <button type="button" class="btn btn-perigo btn-pequeno" data-acao="apagar">Apagar</button>
        </td>
      </tr>
    `).join('');
  }

  contador.textContent = lista.length === alunos.length
    ? `${alunos.length} aluno(s)`
    : `${lista.length} de ${alunos.length} aluno(s)`;
}

/** Realça brevemente a linha de um aluno acabado de criar ou editar. */
function destacarLinha(id) {
  const linha = corpoTabela.querySelector(`tr[data-id="${id}"]`);
  if (!linha) return;
  linha.classList.add('destacada');
  linha.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  setTimeout(() => linha.classList.remove('destacada'), 1800);
}

/* ==========================================================================
   Desenho dos cursos (select do formulário, filtro e lista)
   ========================================================================== */

function desenharCursos() {
  const opcoes = cursos
    .map((c) => `<option value="${escapar(c.id)}">${escapar(c.nomeDoCurso)}</option>`)
    .join('');

  // Preserva a escolha atual de cada select ao redesenhar
  const cursoEscolhido = selectCurso.value;
  const filtroEscolhido = filtroCurso.value;

  selectCurso.innerHTML = `<option value="">-- escolher curso --</option>${opcoes}`;
  filtroCurso.innerHTML = `<option value="">Todos os cursos</option>${opcoes}`;

  selectCurso.value = cursoEscolhido;
  filtroCurso.value = filtroEscolhido;

  if (cursos.length === 0) {
    listaCursos.innerHTML = '<li class="vazio">Ainda não há cursos.</li>';
    return;
  }

  listaCursos.innerHTML = cursos.map((curso) => {
    const inscritos = alunos.filter((a) => String(a.idCurso) === String(curso.id)).length;
    return `
      <li data-id="${escapar(curso.id)}">
        <span>
          ${escapar(curso.nomeDoCurso)}
          <span class="etiqueta-contagem">&middot; ${inscritos} aluno(s)</span>
        </span>
        <button type="button" class="btn btn-perigo btn-pequeno" data-acao="apagar-curso">Apagar</button>
      </li>
    `;
  }).join('');
}

/* ==========================================================================
   Carregamento inicial
   ========================================================================== */

async function carregarDados() {
  corpoTabela.innerHTML = '<tr><td colspan="6" class="vazio">A carregar alunos...</td></tr>';
  btnRecarregar.disabled = true;

  try {
    // Os dois recursos são independentes, por isso vão em paralelo
    [alunos, cursos] = await Promise.all([api.listarAlunos(), api.listarCursos()]);
    desenharCursos();
    desenharAlunos();
    limparMensagem();
  } catch (erro) {
    corpoTabela.innerHTML = `<tr><td colspan="6" class="vazio">${escapar(erro.message)}</td></tr>`;
    mostrarMensagem(erro.message, 'erro');
  } finally {
    btnRecarregar.disabled = false;
  }
}

/* ==========================================================================
   Formulário de alunos: criar e editar
   ========================================================================== */

function modoCriacao() {
  formAluno.reset();
  inputId.value = '';
  tituloFormulario.textContent = 'Adicionar aluno';
  btnGuardar.textContent = 'Adicionar';
  btnCancelar.hidden = true;
  [inputNome, inputApelido, selectCurso, selectAno].forEach((c) => c.classList.remove('invalido'));
}

function modoEdicao(aluno) {
  inputId.value = aluno.id;
  inputNome.value = aluno.nome ?? '';
  inputApelido.value = aluno.apelido ?? '';
  selectCurso.value = aluno.idCurso ?? '';
  selectAno.value = aluno.anoCurricular ?? '';

  tituloFormulario.textContent = `Editar aluno: ${aluno.nome} ${aluno.apelido}`;
  btnGuardar.textContent = 'Guardar alterações';
  btnCancelar.hidden = false;

  formAluno.scrollIntoView({ behavior: 'smooth', block: 'center' });
  inputNome.focus();
}

/**
 * Valida os campos e devolve o objeto a enviar, ou null se houver erros.
 * O id fica de fora: na criação é o servidor que o atribui.
 */
function lerFormulario() {
  const campos = [
    { elemento: inputNome, valido: inputNome.value.trim().length > 0 },
    { elemento: inputApelido, valido: inputApelido.value.trim().length > 0 },
    { elemento: selectCurso, valido: selectCurso.value !== '' },
    { elemento: selectAno, valido: selectAno.value !== '' },
  ];

  campos.forEach(({ elemento, valido }) => elemento.classList.toggle('invalido', !valido));

  const invalido = campos.find((c) => !c.valido);
  if (invalido) {
    mostrarMensagem('Preenche todos os campos antes de guardar.', 'erro');
    invalido.elemento.focus();
    return null;
  }

  return {
    nome: inputNome.value.trim(),
    apelido: inputApelido.value.trim(),
    // O json-server usa ids numéricos; o MongoDB usa ObjectId (texto).
    // Só convertemos para número quando o id é mesmo numérico.
    idCurso: /^\d+$/.test(selectCurso.value) ? Number(selectCurso.value) : selectCurso.value,
    anoCurricular: Number(selectAno.value),
  };
}

formAluno.addEventListener('submit', async (evento) => {
  evento.preventDefault();

  const dados = lerFormulario();
  if (!dados) return;

  const id = inputId.value;
  btnGuardar.disabled = true;

  try {
    if (id) {
      const atualizado = await api.atualizarAluno(id, dados);
      // Substitui no array local em vez de recarregar tudo da API
      alunos = alunos.map((a) => (String(a.id) === String(id) ? atualizado : a));
      mostrarMensagem(`Aluno ${atualizado.nome} ${atualizado.apelido} atualizado.`);
    } else {
      const criado = await api.criarAluno(dados);
      alunos.push(criado);
      mostrarMensagem(`Aluno ${criado.nome} ${criado.apelido} adicionado.`);
    }

    const idAfetado = id || alunos[alunos.length - 1].id;
    modoCriacao();
    desenharCursos();
    desenharAlunos();
    destacarLinha(idAfetado);
  } catch (erro) {
    mostrarMensagem(erro.message, 'erro');
  } finally {
    btnGuardar.disabled = false;
  }
});

btnCancelar.addEventListener('click', () => {
  modoCriacao();
  limparMensagem();
});

/* ==========================================================================
   Ações da tabela: editar e apagar
   ========================================================================== */

// Delegação de eventos: um único listener serve todas as linhas, incluindo
// as que ainda não existem quando a tabela é desenhada.
corpoTabela.addEventListener('click', async (evento) => {
  const botao = evento.target.closest('button[data-acao]');
  if (!botao) return;

  const id = botao.closest('tr').dataset.id;

  if (botao.dataset.acao === 'editar') {
    try {
      // Vai buscar a versão mais recente à API, caso tenha mudado entretanto
      const aluno = await api.obterAluno(id);
      modoEdicao(aluno);
    } catch (erro) {
      mostrarMensagem(erro.message, 'erro');
    }
    return;
  }

  if (botao.dataset.acao === 'apagar') {
    const aluno = alunos.find((a) => String(a.id) === String(id));
    const nome = aluno ? `${aluno.nome} ${aluno.apelido}` : `aluno #${id}`;
    if (!confirm(`Apagar ${nome}? Esta ação não pode ser anulada.`)) return;

    botao.disabled = true;
    try {
      await api.apagarAluno(id);
      alunos = alunos.filter((a) => String(a.id) !== String(id));

      // Se estávamos a editar este aluno, o formulário deixa de fazer sentido
      if (inputId.value === String(id)) modoCriacao();

      desenharCursos();
      desenharAlunos();
      mostrarMensagem(`${nome} foi apagado.`);
    } catch (erro) {
      botao.disabled = false;
      mostrarMensagem(erro.message, 'erro');
    }
  }
});

/* ==========================================================================
   Cursos: criar e apagar
   ========================================================================== */

formCurso.addEventListener('submit', async (evento) => {
  evento.preventDefault();

  const nome = inputNomeCurso.value.trim();
  if (!nome) {
    mostrarMensagem('Indica o nome do curso.', 'erro');
    inputNomeCurso.focus();
    return;
  }

  try {
    const criado = await api.criarCurso({ nomeDoCurso: nome });
    cursos.push(criado);
    inputNomeCurso.value = '';
    desenharCursos();
    desenharAlunos();
    mostrarMensagem(`Curso "${criado.nomeDoCurso}" adicionado.`);
  } catch (erro) {
    mostrarMensagem(erro.message, 'erro');
  }
});

listaCursos.addEventListener('click', async (evento) => {
  const botao = evento.target.closest('button[data-acao="apagar-curso"]');
  if (!botao) return;

  const id = botao.closest('li').dataset.id;
  const curso = cursos.find((c) => String(c.id) === String(id));
  const inscritos = alunos.filter((a) => String(a.idCurso) === String(id)).length;

  // Apagar um curso com alunos deixaria esses alunos a apontar para nada
  if (inscritos > 0) {
    mostrarMensagem(
      `Não é possível apagar "${curso.nomeDoCurso}": ainda tem ${inscritos} aluno(s) inscrito(s).`,
      'erro',
    );
    return;
  }

  if (!confirm(`Apagar o curso "${curso.nomeDoCurso}"?`)) return;

  try {
    await api.apagarCurso(id);
    cursos = cursos.filter((c) => String(c.id) !== String(id));
    desenharCursos();
    mostrarMensagem('Curso apagado.');
  } catch (erro) {
    mostrarMensagem(erro.message, 'erro');
  }
});

/* ==========================================================================
   Filtros e arranque
   ========================================================================== */

pesquisa.addEventListener('input', desenharAlunos);
filtroCurso.addEventListener('change', desenharAlunos);
btnRecarregar.addEventListener('click', carregarDados);

document.querySelector('#apiUrl').textContent = API_URL || window.location.origin;
carregarDados();
