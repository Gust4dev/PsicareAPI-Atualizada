import mongoose, { Document, Schema } from "mongoose";

interface IProfessor extends Document {
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  disciplina: string;
}

const ProfessorSchema: Schema = new Schema(
  {
    nome: { type: String, required: true },
    cpf: { type: String, required: true },
    telefone: { type: String, required: true },
    email: { type: String, required: true },
    disciplina: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IProfessor>("Professor", ProfessorSchema);
