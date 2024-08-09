import mongoose, { Schema, Document } from 'mongoose';

export interface AlunoInterface extends Document {
  matricula: string;
  periodo: string;
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  professor: mongoose.Schema.Types.ObjectId; // Referência ao Professor
}

const AlunoSchema: Schema = new Schema({
  matricula: { type: String, required: true, unique: true },
  periodo: { type: String, required: true },
  nome: { type: String, required: true },
  cpf: { type: String, required: true, unique: false },
  telefone: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  professor: { type: mongoose.Schema.Types.ObjectId, ref: 'Professor', required: true }, // Campo de referência ao Professor
});

export const Aluno = mongoose.model<AlunoInterface>('Aluno', AlunoSchema);
