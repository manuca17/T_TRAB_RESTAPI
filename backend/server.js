require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const { ligarBaseDeDados } = require('./config/db');
const alunoRoutes = require('./routes/alunoRoutes');
const cursoRoutes = require('./routes/cursoRoutes');

const app = express();
const PORT = process.env.PORT || 4000;

// ===== Middleware =====
app.use(cors());                 // permite que o front-end noutro dominio consuma a API
app.use(express.json());         // interpreta corpos JSON nos POST/PUT/PATCH

// Serve a interface web da Parte 3 a partir da propria API
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// ===== Rotas =====
app.use('/alunos', alunoRoutes);
app.use('/cursos', cursoRoutes);

// Pequeno endpoint de diagnostico, util depois do deploy no Render
app.get('/estado', (req, res) => {
  res.json({ estado: 'ok', horas: new Date().toISOString() });
});

// ===== Rota inexistente =====
app.use((req, res) => {
  res.status(404).json({ erro: `Rota nao encontrada: ${req.method} ${req.originalUrl}` });
});

// ===== Tratamento central de erros =====
// Traduz os erros do Mongoose em codigos HTTP adequados.
app.use((erro, req, res, next) => {
  console.error(erro);

  if (erro.name === 'ValidationError') {
    const detalhes = Object.values(erro.errors).map((e) => e.message);
    return res.status(400).json({ erro: 'Dados invalidos', detalhes });
  }

  if (erro.name === 'CastError') {
    return res.status(400).json({ erro: `Identificador invalido: ${erro.value}` });
  }

  if (erro.code === 11000) {
    return res.status(409).json({ erro: 'Ja existe um registo com esse valor unico' });
  }

  res.status(500).json({ erro: 'Erro interno do servidor' });
});

// ===== Arranque =====
// So comeca a aceitar pedidos depois de a base de dados estar ligada.
ligarBaseDeDados()
  .then(() => {
    app.listen(PORT, () => console.log(`API a correr em http://localhost:${PORT}`));
  })
  .catch((erro) => {
    console.error('Nao foi possivel arrancar a API:', erro.message);
    process.exit(1);
  });
