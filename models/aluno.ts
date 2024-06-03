import mongoose, { Document, Schema } from "mongoose";

interface AlunoInterface extends Document {
  nome: string;
  email: string;
  dataNascimento: Date;
  matricula: string;
  curso: string;
  semestre: number;
  dataIngresso: Date;
  telefone: string;
  endereco?: string;
  cpf: string;
  arquivado: boolean;
  role: string;
  cargo: number;
}

const AlunoSchema: Schema = new Schema(
  {
    nome: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    dataNascimento: { type: Date, required: true },
    matricula: { type: String, required: true, unique: true },
    curso: { type: String, required: true },
    semestre: { type: Number, required: true },
    dataIngresso: { type: Date, required: true },
    telefone: { type: String, required: true },
    endereco: { type: String },
    cpf: { type: String, required: true, unique: true },
    arquivado: { type: Boolean, default: false },
    role: { type: String, default: "Estudante" },
    cargo: { type: Number, required: true},
  },
  { timestamps: true }
);

export default mongoose.model<AlunoInterface>("Aluno", AlunoSchema);
