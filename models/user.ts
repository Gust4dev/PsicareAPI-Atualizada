import mongoose, { Document, Schema } from "mongoose";

export interface UserInterface extends Document {
  nome: string;
  cpf: string;
  email: string;
  senha: string;
  token?: string;
}

const UserSchema: Schema = new Schema(
  {
    nome: { type: String, required: true },
    cpf: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    senha: { type: String, required: true, minlength: 6, maxlength: 64 },
    token: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<UserInterface>("User", UserSchema);
