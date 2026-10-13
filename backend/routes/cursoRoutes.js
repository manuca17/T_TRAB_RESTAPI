const express = require('express');
const controlador = require('../controllers/cursoController');

const router = express.Router();

router.route('/')
  .get(controlador.listar)
  .post(controlador.criar);

router.route('/:id')
  .get(controlador.obter)
  .put(controlador.substituir)
  .delete(controlador.apagar);

module.exports = router;
