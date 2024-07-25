import mongoose, { Document, Schema } from 'mongoose';

interface ProfessorInterface extends Document {
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  disciplina: string;
  senha: string;
  token: string;
}

const ProfessorSchema: Schema = new Schema(
  {
    nome: { type: String, required: true },
    cpf: { type: String, required: true, unique: true },
    telefone: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    disciplina: { type: String, required: true },
    senha: { type: String },
    token: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<ProfessorInterface>('Professor', ProfessorSchema);
