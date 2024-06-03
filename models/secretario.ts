import mongoose, { Document, Schema } from "mongoose";

interface SecretarioInterface extends Document {
  nome: string;
  email: string;
  dataNascimento: Date;
  cpf: string;
  telefone: string;
  endereco?: string;
  arquivado: boolean;
  role: string;
  cargo: number;
}

const SecretarioSchema: Schema = new Schema(
  {
    nome: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    dataNascimento: { type: Date, required: true },
    cpf: { type: String, required: true, unique: true },
    telefone: { type: String, required: true },
    endereco: { type: String },
    arquivado: { type: Boolean, default: false },
    role: { type: String, default: "Secretário" },
    cargo: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<SecretarioInterface>(
  "Secretario",
  SecretarioSchema
);
