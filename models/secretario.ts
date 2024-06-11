import mongoose, { Document, Schema } from "mongoose";

interface SecretarioInterface extends Document {
  id: number;
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  role: string;
  cargo: number;
  turno: string;
}

const SecretarioSchema: Schema = new Schema(
  {
    id: {type: Number, unique: true, required: true },
    nome: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    cpf: { type: String, required: true, unique: true },
    telefone: { type: String, required: true },
    turno: { type: String, required: true },
    role: { type: String, default: "Secretário" },
    cargo: { type: Number, default: 1 },
  },
  { timestamps: true }
);

export default mongoose.model<SecretarioInterface>(
  "Secretario",
  SecretarioSchema
);
