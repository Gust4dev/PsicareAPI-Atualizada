import mongoose, { Document, Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";

interface UserInterface extends Document {
  id: string;
  nome: string;
  cpf: string;
  email: string;
  senha: string;
  role: "admin" | "student" | "secretary" | "professor";
  cargo: number;
  matricula?: string;
  periodoCursado?: number;
  disciplina?: string;
  idOrientador?: mongoose.Types.ObjectId;
  disciplinaMinistrada?: string;
  idSecretaria?: mongoose.Types.ObjectId;
  arquivado: boolean;
}

const UserSchema: Schema = new Schema(
  {
    id: { type: String, default: uuidv4, unique: true },
    nome: { type: String, required: true },
    cpf: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    senha: { type: String, required: true, minlength: 6, maxlength: 64 },
    role: {
      type: String,
      enum: ["admin", "student", "secretary", "professor"],
      required: true,
    },
    cargo: { type: Number, required: true },
    matricula: { type: String },
    periodoCursado: { type: Number },
    disciplina: { type: String },
    idOrientador: { type: mongoose.Types.ObjectId, ref: "User" },
    disciplinaMinistrada: { type: String },
    idSecretaria: { type: mongoose.Types.ObjectId, ref: "User" },
    arquivado: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<UserInterface>("User", UserSchema);
