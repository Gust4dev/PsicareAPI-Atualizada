import mongoose, { Schema, Document } from "mongoose";

interface IRelatorio extends Document {
  pacienteId: mongoose.Types.ObjectId;
  nomePaciente: string;
  dataNascimentoPaciente: Date;
  dataInicioTratamento: Date;
  dataTerminoTratamento: Date;
  tipoTratamento: string;
  alunoUnieva: boolean;
  alunoId: mongoose.Types.ObjectId;
  nomeAluno: string;
  funcionarioUnieva: boolean;
  nome_funcionario: string;
  dataCriacao: Date;
  ultimaAtualizacao: Date;
  conteudo: string;
  ativoRelatorio: boolean;
  prontuario?: { id: mongoose.Types.ObjectId; nome: string }[];
  assinatura?: { id: mongoose.Types.ObjectId; nome: string }[];
}

const RelatorioSchema: Schema = new Schema({
  pacienteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Paciente",
    required: true,
  },
  nomePaciente: { type: String, required: true },
  dataNascimentoPaciente: { type: Date, required: true },
  dataInicioTratamento: { type: Date, required: true },
  dataTerminoTratamento: { type: Date },
  tipoTratamento: { type: String, required: true },
  alunoUnieva: { type: Boolean, default: false },
  alunoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Aluno",
  },
  nomeAluno: { type: String },
  funcionarioUnieva: { type: Boolean, default: false },
  nome_funcionario: { type: String, required: false },
  dataCriacao: { type: Date, default: Date.now },
  ultimaAtualizacao: { type: Date, default: Date.now },
  conteudo: { type: String, required: true },
  ativoRelatorio: { type: Boolean, default: true },
  prontuario: [
    {
      id: { type: mongoose.Schema.Types.ObjectId, required: true },
      nome: { type: String, required: true },
    },
  ],
  assinatura: [
    {
      id: { type: mongoose.Schema.Types.ObjectId, required: true },
      nome: { type: String, required: true },
    },
  ],
});

export default mongoose.model<IRelatorio>("Relatorio", RelatorioSchema);
