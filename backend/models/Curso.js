const mongoose = require('mongoose');

const cursoSchema = new mongoose.Schema(
  {
    nomeDoCurso: {
      type: String,
      required: [true, 'O nome do curso e obrigatorio'],
      trim: true,
      unique: true,
      maxlength: [120, 'O nome do curso nao pode ter mais de 120 caracteres'],
    },
  },
  { timestamps: true },
);

// O Mongo guarda o identificador em _id; o front-end espera id.
cursoSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (documento, objeto) => {
    delete objeto._id;
    return objeto;
  },
});

module.exports = mongoose.model('Curso', cursoSchema);
