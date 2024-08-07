import mongoose, { Document, Schema } from "mongoose";

interface SecretarioInterface extends Document {
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  turno: string;
}

const SecretarioSchema: Schema = new Schema(
  {
    nome: { type: String, required: true },
    cpf: { type: String, required: true, unique: true },
    telefone: { type: String, required: false },
    email: { type: String, required: true, unique: true },
    turno: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<SecretarioInterface>(
  "Secretario",
  SecretarioSchema
);
