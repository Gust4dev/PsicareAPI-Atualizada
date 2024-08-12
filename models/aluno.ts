import mongoose, { Schema, Document } from 'mongoose';

export interface AlunoInterface extends Document {
  matricula: string;
  periodo: string;
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  nomeProfessor: string; 
}

const AlunoSchema: Schema = new Schema({
  matricula: { type: String, required: true, unique: true },
  periodo: { type: String, required: true },
  nome: { type: String, required: true },
  cpf: { type: String, required: true, unique: false },
  telefone: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  nomeProfessor: { type: String, required: true },
});

export const Aluno = mongoose.model<AlunoInterface>('Aluno', AlunoSchema);
