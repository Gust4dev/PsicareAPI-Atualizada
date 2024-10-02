import { Schema, model, Document } from 'mongoose';

interface IPaciente extends Document {
  nome: string;
  cpf: string;
  dataNascimento: Date;
  email: string;
  telefone: string;
  sexo: string;
  estadoCivil: string;
  religiao: string;
  rendaFamiliar: string;
  profissao: string;
  outroContato?: string;
  nomeDoContatoResponsavel?: string;
  naturalidade: string;
  nacionalidade: string;
  enderecoCep: string;
  enderecoLogradouro: string;
  enderecoBairro: string;
  enderecoComplemento?: string;
  enderecoCidade: string;
  enderecoUF: string;
  dataInicioTratamento: Date;
  dataTerminoTratamento?: Date;
  encaminhador: string;
  tipoDeTratamento?: string;
  alunoUnieva: boolean;
  funcionarioUnieva: boolean;
  ativoPaciente: boolean;
  alunoId: Schema.Types.ObjectId;
}

const PacienteSchema = new Schema<IPaciente>({
  nome: { type: String, required: true },
  cpf: { type: String, required: true, unique: true },
  dataNascimento: { type: Date, required: true },
  email: { type: String, required: true, unique: true },
  telefone: { type: String, required: false },
  sexo: { type: String, required: true },
  estadoCivil: { type: String, required: true },
  religiao: { type: String, required: true },
  rendaFamiliar: { type: String, required: true },
  profissao: { type: String, required: true },
  outroContato: { type: String },
  nomeDoContatoResponsavel: { type: String },
  naturalidade: { type: String, required: true },
  nacionalidade: { type: String, required: true },
  enderecoCep: { type: String, required: true },
  enderecoLogradouro: { type: String, required: true },
  enderecoBairro: { type: String, required: true },
  enderecoComplemento: { type: String },
  enderecoCidade: { type: String, required: true },
  enderecoUF: { type: String, required: true },
  dataInicioTratamento: { type: Date, required: true },
  dataTerminoTratamento: { type: Date },
  encaminhador: { type: String },
  tipoDeTratamento: { type: String },
  alunoUnieva: { type: Boolean, required: true },
  funcionarioUnieva: { type: Boolean, required: true },
  ativoPaciente: { type: Boolean, required: true, default: true },
  alunoId:{ type: Schema.Types.ObjectId, ref: "Aluno", required: true},
});

PacienteSchema.index({ AlunoId: 1});
const Paciente = model<IPaciente>('Paciente', PacienteSchema);

export default Paciente;
