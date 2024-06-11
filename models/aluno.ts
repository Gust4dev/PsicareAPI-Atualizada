import mongoose, { Document, Schema } from "mongoose";

interface AlunoInterface extends Document {
  id: number;
  nome: string;
  email: string;
  matricula: string;
  semestre: number;
  dataIngresso: Date;
  telefone: string;
  endereco?: string;
  cpf: string;
  role: string;
  cargo: number;
}

const AlunoSchema: Schema = new Schema(
  {
    id: { type: Number, unique: true },
    nome: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    matricula: { type: String, required: true, unique: true },
    semestre: { type: Number, required: true },
    dataIngresso: { type: Date, required: true },
    telefone: { type: String, required: true },
    endereco: { type: String },
    cpf: { type: String, required: true, unique: true },
    role: { type: String, default: "Estudante" },
    cargo: { type: Number, default: 4 },
  },
  { timestamps: true }
);

export default mongoose.model<AlunoInterface>("Aluno", AlunoSchema);
