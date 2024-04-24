import mongoose from "mongoose";

const professorSchema = new mongoose.Schema (
    {
        createdAt: {
            type: Date,
            default: Date.now(),
          },
          nome: {
            type: String,
            required: true,
            trim: true,
          },
          cpf: {
            type: String,
            required: true,
          },
          telefoneContato: {
            type: String,
            required: true,
          },
          email: {
            type: String,
            required: true,
          },
          disciplina: {
            type: String,
            required: true,
            trim: true,
          },
          arquivado: {
            type: Boolean,
            default: false,
            required:false,
          },
    },
    { timestamps: true }
);

export default mongoose.model("Professor", professorSchema);