import mongoose, { Document, Schema } from "mongoose";

interface ProfessorInterface extends Document {
  id: number;
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  disciplina: string;
  cargo: number;
}

const professorSchema: Schema = new Schema(
  {
    id: { type: Number, unique: true },
    nome: { type: String, required: true },
    cpf: { type: String, required: true, unique: true },
    telefone: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    disciplina: { type: String, required: true },
    cargo: { type: Number, default: 3 },
  },
  { timestamps: true }
);

export default mongoose.model<ProfessorInterface>("Professor", professorSchema);
