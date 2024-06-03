import mongoose, { Document, Schema } from "mongoose";

interface ProfessorInterface extends Document {
  nome: string;
  cpf: string;
  telefoneContato: string;
  email: string;
  disciplina: string;
  arquivado: boolean;
  cargo: number;
}

const professorSchema: Schema = new Schema(
  {
    nome: { type: String, required: true },
    cpf: { type: String, required: true, unique: true },
    telefoneContato: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    disciplina: { type: String, required: true },
    arquivado: { type: Boolean, default: false },
    cargo: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<ProfessorInterface>("Professor", professorSchema);
