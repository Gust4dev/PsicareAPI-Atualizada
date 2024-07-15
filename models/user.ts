import mongoose, { Document, Schema } from "mongoose";

interface UserInterface extends Document {
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
}

const UserSchema: Schema = new Schema(
  {
    nome: { type: String, required: true },
    cpf: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    senha: { type: String, required: true, minlength: 6, maxlength: 64 },
    role: {
      type: String,
      enum: ["admin", "student", "secretary", "professor"],
      required: true,
    },
    cargo: { type: Number, default: 1 },
    matricula: { type: String },
    periodoCursado: { type: Number },
    disciplina: { type: String },
    idOrientador: { type: mongoose.Types.ObjectId, ref: "User" },
    disciplinaMinistrada: { type: String },
    idSecretaria: { type: mongoose.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model<UserInterface>("User", UserSchema);
