const Aluno = require('../models/Aluno');

/**
 * Os controladores nao usam try/catch: os erros sao passados ao middleware
 * de erros do server.js atraves do next(), que decide o codigo de estado.
 */

// GET /alunos  (aceita ?idCurso=... e ?anoCurricular=... como filtros)
async function listar(req, res, next) {
  try {
    const filtro = {};
    if (req.query.idCurso) filtro.idCurso = req.query.idCurso;
    if (req.query.anoCurricular) filtro.anoCurricular = req.query.anoCurricular;

    const alunos = await Aluno.find(filtro).sort({ apelido: 1, nome: 1 });
    res.json(alunos);
  } catch (erro) {
    next(erro);
  }
}

// GET /alunos/:id
async function obter(req, res, next) {
  try {
    const aluno = await Aluno.findById(req.params.id);
    if (!aluno) return res.status(404).json({ erro: 'Aluno nao encontrado' });
    res.json(aluno);
  } catch (erro) {
    next(erro);
  }
}

// POST /alunos
async function criar(req, res, next) {
  try {
    const aluno = await Aluno.create(req.body);
    res.status(201).json(aluno);
  } catch (erro) {
    next(erro);
  }
}

// PUT /alunos/:id  - substitui o documento todo
async function substituir(req, res, next) {
  try {
    const aluno = await Aluno.findOneAndReplace(
      { _id: req.params.id },
      req.body,
      { new: true, runValidators: true },
    );
    if (!aluno) return res.status(404).json({ erro: 'Aluno nao encontrado' });
    res.json(aluno);
  } catch (erro) {
    next(erro);
  }
}

// PATCH /alunos/:id - altera apenas os campos enviados
async function atualizar(req, res, next) {
  try {
    const aluno = await Aluno.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true },
    );
    if (!aluno) return res.status(404).json({ erro: 'Aluno nao encontrado' });
    res.json(aluno);
  } catch (erro) {
    next(erro);
  }
}

// DELETE /alunos/:id
async function apagar(req, res, next) {
  try {
    const aluno = await Aluno.findByIdAndDelete(req.params.id);
    if (!aluno) return res.status(404).json({ erro: 'Aluno nao encontrado' });
    res.json(aluno);
  } catch (erro) {
    next(erro);
  }
}

module.exports = { listar, obter, criar, substituir, atualizar, apagar };
