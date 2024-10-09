import mongoose, { Document, Schema } from "mongoose";

interface ConsultaInterface extends Document {
  Nome: string;
  TipoDeConsulta: string;
  allDay: boolean;
  alunoId: string;
  nomeAluno: string;
  createAt: Date;
  start: Date;
  end: Date;
  frequenciaIntervalo?: string;
  intervalo?: string;
  observacao: string;
  pacienteld: string;
  nomePaciente: string;
  sala: string;
  statusDaConsulta?: string;
}

const ConsultaSchema: Schema = new Schema(
  {
    Nome: { type: String, required: true },
    TipoDeConsulta: { type: String, required: true },
    allDay: { type: Boolean },
    alunoId: { type: String, required: true },
    nomeAluno: { type: String, required: true },
    createAt: { type: Date, required: false },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    frequenciaIntervalo: { type: String },
    intervalo: { type: String },
    observacao: { type: String },
    pacienteld: { type: String, required: true },
    nomePaciente: { type: String, required: true },
    sala: { type: String, required: true },
    statusDaConsulta: { type: String, default: "Pendente" },
  },
  { timestamps: true, collection: "consulta" }
);

export default mongoose.model<ConsultaInterface>("Consulta", ConsultaSchema);