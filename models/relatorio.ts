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
  funcionarioUnieva: boolean;
  nome_funcionario: string;
  dataCriacao: Date;
  ultimaAtualizacao: Date;
  conteudo: string;
  ativoRelatorio: boolean;
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
  funcionarioUnieva: { type: Boolean, default: false },
  nome_funcionario: { type: String, required: false },
  dataCriacao: { type: Date, default: Date.now },
  ultimaAtualizacao: { type: Date },
  conteudo: { type: String, required: true },
  ativoRelatorio: { type: Boolean, default: true },
});

export default mongoose.model<IRelatorio>("Relatorio", RelatorioSchema);
