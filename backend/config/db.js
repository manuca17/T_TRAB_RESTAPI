const mongoose = require('mongoose');

/**
 * Abre a ligacao ao MongoDB Atlas.
 * A aplicacao nao arranca sem base de dados, por isso falhar aqui e fatal.
 */
async function ligarBaseDeDados() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('Falta a variavel MONGODB_URI. Copia o .env.example para .env e preenche-a.');
  }

  await mongoose.connect(uri);
  console.log(`Ligado ao MongoDB (base de dados: ${mongoose.connection.name})`);
}

module.exports = { ligarBaseDeDados };
