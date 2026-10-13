/**
 * Migracao dos dados de /mock-data/bd.json para o MongoDB Atlas.
 *
 *   npm run migrar
 *
 * ATENCAO: apaga o conteudo actual das coleccoes antes de inserir.
 *
 * No bd.json os cursos tem ids numericos (1, 2, 3) e cada aluno guarda esse
 * numero em idCurso. No Mongo os identificadores sao ObjectId, por isso o
 * script insere primeiro os cursos, guarda a correspondencia
 * id-antigo -> ObjectId-novo, e so depois insere os alunos ja com a referencia
 * correcta.
 */

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const { ligarBaseDeDados } = require('../config/db');
const Aluno = require('../models/Aluno');
const Curso = require('../models/Curso');

const CAMINHO_BD = path.join(__dirname, '..', '..', 'mock-data', 'bd.json');

async function migrar() {
  const dados = JSON.parse(fs.readFileSync(CAMINHO_BD, 'utf8'));

  await ligarBaseDeDados();

  console.log('A limpar as coleccoes existentes...');
  await Promise.all([Aluno.deleteMany({}), Curso.deleteMany({})]);

  // --- Cursos ---
  const cursosInseridos = await Curso.insertMany(
    dados.cursos.map((curso) => ({ nomeDoCurso: curso.nomeDoCurso })),
  );
  console.log(`${cursosInseridos.length} curso(s) inserido(s).`);

  // Mapa id-antigo (numero do bd.json) -> _id novo (ObjectId do Mongo)
  const mapaCursos = new Map();
  dados.cursos.forEach((cursoAntigo, indice) => {
    mapaCursos.set(String(cursoAntigo.id), cursosInseridos[indice]._id);
  });

  // --- Alunos ---
  const alunosParaInserir = [];
  const ignorados = [];

  for (const aluno of dados.alunos) {
    const novoIdCurso = mapaCursos.get(String(aluno.idCurso));

    if (!novoIdCurso) {
      ignorados.push(`${aluno.nome} ${aluno.apelido} (idCurso ${aluno.idCurso} nao existe)`);
      continue;
    }

    alunosParaInserir.push({
      nome: aluno.nome,
      apelido: aluno.apelido,
      idCurso: novoIdCurso,
      anoCurricular: aluno.anoCurricular,
    });
  }

  const alunosInseridos = await Aluno.insertMany(alunosParaInserir);
  console.log(`${alunosInseridos.length} aluno(s) inserido(s).`);

  if (ignorados.length > 0) {
    console.log('Ignorados por referenciarem um curso inexistente:');
    ignorados.forEach((linha) => console.log(`  - ${linha}`));
  }

  console.log('\nCorrespondencia de cursos:');
  for (const [idAntigo, idNovo] of mapaCursos) {
    console.log(`  ${idAntigo} -> ${idNovo}`);
  }

  await mongoose.disconnect();
  console.log('\nMigracao concluida.');
}

migrar().catch((erro) => {
  console.error('A migracao falhou:', erro.message);
  process.exit(1);
});
