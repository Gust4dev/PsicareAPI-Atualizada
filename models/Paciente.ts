import mongoose, { Document, Schema } from "mongoose";

interface PacienteInterface extends Document {
  nome: string;
  endereco: string;
  idade: number;
  cpf: string;
  religiao: string;
  profissao: string;
  estadoCivil: string;
  sexo: string;
  naturalidade: string;
  nacionalidade: string;
  rendaFamiliar: string;
  contato: string;
  contatoResponsavel?: { nome: string; telefone: string };
  instituicaoDeEnsino?: string;
  dataInicioTratamento: Date;
  dataTerminoTratamento: Date;
  nomeAlunoEncaminhador: string;
  funcionarioOuAlunoUniEvangélica: boolean;
  tipoDeTratamento: string;
  email: string;
}

const PacienteSchema: Schema = new Schema(
  {
    nome: { type: String, required: true },
    endereco: { type: String, required: true },
    idade: { type: Number, required: true },
    cpf: { type: String, required: true, unique: true },
    religiao: { type: String, required: true },
    profissao: { type: String, required: true },
    estadoCivil: { type: String, required: true },
    sexo: { type: String, required: true },
    naturalidade: { type: String, required: true },
    nacionalidade: { type: String, required: true },
    rendaFamiliar: { type: String, required: true },
    contato: { type: String, required: true },
    contatoResponsavel: {
      nome: { type: String },
      telefone: { type: String },
    },
    instituicaoDeEnsino: { type: String },
    dataInicioTratamento: { type: Date, required: true },
    dataTerminoTratamento: { type: Date, required: true },
    nomeAlunoEncaminhador: { type: String, required: true },
    funcionarioOuAlunoUniEvangélica: { type: Boolean, required: true },
    tipoDeTratamento: { type: String, required: true },
    email: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

export default mongoose.model<PacienteInterface>("Paciente", PacienteSchema);
