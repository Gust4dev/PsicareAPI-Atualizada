import mongoose, { Document, Schema } from "mongoose";

interface AlunoInterface extends Document {
  matricula: string;
  periodo: number;
  nome: string;
  cpf: string;
  telefone: string;
  professor: string;
  email: string;
}

const AlunoSchema: Schema = new Schema(
  {
    matricula: { type: String, required: true, unique: true },
    periodo: { type: Number, required: true },
    nome: { type: String, required: true },
    cpf: { type: String, required: true, unique: true },
    telefone: { type: String, required: true },
    professor: { type: String, required: true },
    email: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

export default mongoose.model<AlunoInterface>("Aluno", AlunoSchema);
