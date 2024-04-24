import mongoose from "mongoose";

const alunoSchema = new mongoose.Schema (
    {
        createdAt: {
            type: Date,
            default: Date.now(),    
          },
          matricula: {
            type: String,
            required: true,
          },
          periodo: {
            type: String,
            require: true,  
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
          professorID: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
          },
          professorNome: {
            type: String,
            required: true,
          },
          professorDisciplina: {
            type: String,
            ref:"Professor",
            required: true,
          },
          email: {
            type: String,
            required: true,
          },
          arquivado: {
            type: Boolean,
            default: false,
            required:false,
          },
          
    },
    { timestamps: true }
);

export default mongoose.model("Aluno", alunoSchema);