import mongoose, { Schema, Document } from "mongoose";

interface IRelatorio extends Document {
  id_paciente: mongoose.Types.ObjectId;
  nomePaciente: string;
  dataNascimentoPaciente: Date;
  dataInicioTratamento: Date;
  dataTerminoTratamento: Date;
  tipoTratamento: string;
  alunoUnieva: boolean;
  id_aluno: mongoose.Types.ObjectId;
  nomeAluno: string;
  funcionarioUnieva: boolean;
  nome_funcionario: string;
  dataCriacao: Date;
  ultimaAtualizacao: Date;
  conteudo: string;
  ativoRelatorio: boolean;
  prontuario?: Schema.Types.ObjectId;
  assinatura?: Schema.Types.ObjectId;
}

const RelatorioSchema: Schema = new Schema({
  id_paciente: { type: mongoose.Schema.Types.ObjectId, ref: "Paciente", required: true },
  nomePaciente: { type: String, required: true },
  dataNascimentoPaciente: { type: Date, required: true },
  dataInicioTratamento: { type: Date, required: true },
  dataTerminoTratamento: { type: Date },
  tipoTratamento: { type: String, required: true },
  alunoUnieva: { type: Boolean, default: false },
  id_aluno: { type: mongoose.Schema.Types.ObjectId, ref: "Aluno", required: true },
  nomeAluno: { type: String, required: true },
  funcionarioUnieva: { type: Boolean, default: false },
  nome_funcionario: { type: String, required: false },
  dataCriacao: { type: Date, default: Date.now },
  ultimaAtualizacao: { type: Date },
  conteudo: { type: String, required: true },
  ativoRelatorio: { type: Boolean, default: true },
  prontuario: { type: Schema.Types.ObjectId, ref: "fs.files" },
  assinatura: { type: Schema.Types.ObjectId, ref: "fs.files" },
});

export default mongoose.model<IRelatorio>("Relatorio", RelatorioSchema);
