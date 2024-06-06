import mongoose, { Document, Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";

interface PacienteInterface extends Document {
  id: string;
  nome: string;
  cpf: string;
  dataDeNascimento: Date;
  email: string;
  telefoneContato: string;
  sexo: string;
  estadoCivil: string;
  religiao: string;
  rendaFamiliar: string;
  profissao: string;
  outroContato?: string;
  nomeDoContatoResponsavel?: string;
  menorDeIdade?: boolean;
  naturalidade: string;
  nacionalidade: string;
  enderecoCep: string;
  enderecoLogradouro: string;
  enderecoBairro: string;
  enderecoComplemento?: string;
  enderecoCidade: string;
  enderecoUF: string;
  dataInicioTratamento: Date;
  dataTerminoTratamento: Date;
  quemEncaminhouID: string;
  quemEncaminhouNome: string;
  tipoDeTratamento: string;
  alunoUnieva?: boolean;
  funcionarioUnieva?: boolean;
  arquivado: boolean;
  cargo: number;
}

const PacienteSchema: Schema = new Schema(
  {
    id: {type: String, default: uuidv4, unique: true },
    nome: { type: String, required: true },
    cpf: { type: String, required: true, unique: true },
    dataDeNascimento: { type: Date, required: true },
    email: { type: String, required: true, unique: true },
    telefoneContato: { type: String, required: true },
    sexo: { type: String, required: true },
    estadoCivil: { type: String, required: true },
    religiao: { type: String, required: true },
    rendaFamiliar: { type: String, required: true },
    profissao: { type: String, required: true },
    outroContato: { type: String },
    nomeDoContatoResponsavel: { type: String },
    menorDeIdade: { type: Boolean },
    naturalidade: { type: String, required: true },
    nacionalidade: { type: String, required: true },
    enderecoCep: { type: String, required: true },
    enderecoLogradouro: { type: String, required: true },
    enderecoBairro: { type: String, required: true },
    enderecoComplemento: { type: String },
    enderecoCidade: { type: String, required: true },
    enderecoUF: { type: String, required: true },
    dataInicioTratamento: { type: Date, required: true },
    dataTerminoTratamento: { type: Date, required: true },
    quemEncaminhouID: { type: String, required: true },
    quemEncaminhouNome: { type: String, required: true },
    tipoDeTratamento: { type: String, required: true },
    alunoUnieva: { type: Boolean },
    funcionarioUnieva: { type: Boolean },
    arquivado: { type: Boolean, default: false },
    cargo: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<PacienteInterface>("Paciente", PacienteSchema);
