const Curso = require('../models/Curso');
const Aluno = require('../models/Aluno');

// GET /cursos
async function listar(req, res, next) {
  try {
    const cursos = await Curso.find().sort({ nomeDoCurso: 1 });
    res.json(cursos);
  } catch (erro) {
    next(erro);
  }
}

// GET /cursos/:id
async function obter(req, res, next) {
  try {
    const curso = await Curso.findById(req.params.id);
    if (!curso) return res.status(404).json({ erro: 'Curso nao encontrado' });
    res.json(curso);
  } catch (erro) {
    next(erro);
  }
}

// POST /cursos
async function criar(req, res, next) {
  try {
    const curso = await Curso.create(req.body);
    res.status(201).json(curso);
  } catch (erro) {
    next(erro);
  }
}

// PUT /cursos/:id
async function substituir(req, res, next) {
  try {
    const curso = await Curso.findOneAndReplace(
      { _id: req.params.id },
      req.body,
      { new: true, runValidators: true },
    );
    if (!curso) return res.status(404).json({ erro: 'Curso nao encontrado' });
    res.json(curso);
  } catch (erro) {
    next(erro);
  }
}

// DELETE /cursos/:id
async function apagar(req, res, next) {
  try {
    // Apagar um curso com alunos deixaria esses alunos a apontar para nada
    const inscritos = await Aluno.countDocuments({ idCurso: req.params.id });
    if (inscritos > 0) {
      return res.status(409).json({
        erro: `Nao e possivel apagar o curso: tem ${inscritos} aluno(s) inscrito(s).`,
      });
    }

    const curso = await Curso.findByIdAndDelete(req.params.id);
    if (!curso) return res.status(404).json({ erro: 'Curso nao encontrado' });
    res.json(curso);
  } catch (erro) {
    next(erro);
  }
}

module.exports = { listar, obter, criar, substituir, apagar };
