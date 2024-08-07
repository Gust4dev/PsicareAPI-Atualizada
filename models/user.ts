import mongoose, { Document, Schema } from "mongoose";
import { cargo } from "../constants/roles"; // Certifique-se de que este caminho está correto

export interface UserInterface extends Document {
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  senha: string;
  cargo: number; // 0=Admin, 1=Secretario, 2=Professor, 3=Aluno
  token?: string;
}

const UserSchema: Schema = new Schema(
  {
    nome: { type: String, required: true },
    cpf: { type: String, required: true, unique: true },
    telefone: { type: String, required: false },
    email: { type: String, required: true, unique: true },
    senha: { type: String, required: true },
    cargo: {
      type: Number,
      required: true,
      enum: [cargo.admin, cargo.secretario, cargo.professor, cargo.aluno],
    },
    token: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<UserInterface>("User", UserSchema);
