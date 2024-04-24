import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
      createdAt: {
        type: Date,
        default: Date.now(),
      },
      nome: {
        type: String,
        trim: true,
      },
      cpf: {
        type: Number,
        unique: true
      },
      role: {
        type: String,
        enum: ["admin", "student", "secretary", "professor"],
      },
      matricula: {
        type: Number
      },
      periodoCursado: {
        type: Number
      },
      disciplina: {
        type: String
      },
      idOrientador: {
        type: Number
      },
      disciplinaMinistrada: {
        type: String
      },
      idSecretaria: {
        type: Number
      },
      senha: {
        type: String,
        min: 6,
        max: 64,
      },
    },
    { timestamps: true }
  );

export default mongoose.model("User", userSchema);