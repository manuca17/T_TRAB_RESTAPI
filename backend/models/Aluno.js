const mongoose = require('mongoose');

const alunoSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: [true, 'O nome e obrigatorio'],
      trim: true,
      maxlength: [50, 'O nome nao pode ter mais de 50 caracteres'],
    },
    apelido: {
      type: String,
      required: [true, 'O apelido e obrigatorio'],
      trim: true,
      maxlength: [50, 'O apelido nao pode ter mais de 50 caracteres'],
    },
    // Referencia para a coleccao de cursos (equivalente a uma chave estrangeira)
    idCurso: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Curso',
      required: [true, 'O curso e obrigatorio'],
    },
    anoCurricular: {
      type: Number,
      required: [true, 'O ano curricular e obrigatorio'],
      min: [1, 'O ano curricular tem de estar entre 1 e 3'],
      max: [3, 'O ano curricular tem de estar entre 1 e 3'],
    },
  },
  { timestamps: true },
);

alunoSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (documento, objeto) => {
    delete objeto._id;
    return objeto;
  },
});

module.exports = mongoose.model('Aluno', alunoSchema);
