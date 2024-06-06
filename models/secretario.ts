import mongoose, { Document, Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";

interface SecretarioInterface extends Document {
  id: string;
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  arquivado: boolean;
  role: string;
  cargo: number;
  turno: string;
}

const SecretarioSchema: Schema = new Schema(
  {
    id: { type: String, default: uuidv4, unique: true },
    nome: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    cpf: { type: String, required: true, unique: true },
    telefone: { type: String, required: true },
    turno: { type: String, required: true },
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
