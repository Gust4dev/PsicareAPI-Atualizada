import mongoose, { Document, Schema } from "mongoose";
import { cargo } from "../constants/roles";
import {Aluno} from "./aluno";
import Professor from "./professor";
import Secretario from "./secretario";

export interface UserInterface extends Document {
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  senha: string;
  cargo: number;
  token?: string;
}

const UserSchema: Schema = new Schema(
  {
    nome: { type: String, required: true },
    cpf: { type: String, required: true, unique: true },
    telefone: { type: String },
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

UserSchema.post("save", async function (doc) {
  try {
    if (doc.cargo === cargo.aluno) {
      await Aluno.findOneAndUpdate(
        { cpf: doc.cpf },
        { nome: doc.nome, email: doc.email, telefone: doc.telefone }
      );
    } else if (doc.cargo === cargo.professor) {
      await Professor.findOneAndUpdate(
        { cpf: doc.cpf },
        { nome: doc.nome, email: doc.email, telefone: doc.telefone }
      );
    } else if (doc.cargo === cargo.secretario) {
      await Secretario.findOneAndUpdate(
        { cpf: doc.cpf },
        { nome: doc.nome, email: doc.email, telefone: doc.telefone }
      );
    }
  } catch (error) {}
});

export default mongoose.model<UserInterface>("User", UserSchema);
