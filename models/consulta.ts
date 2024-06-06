import mongoose, { Document, Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";

interface ConsultaInterface extends Document {
  id: string;
  pacienteID: string;
  pacienteNome: string;
  title: string;
  start: Date;
  end: Date;
  resourceID: string;
  recorrencia?: {
    frequency?: string;
    interval?: string;
  };
  consultaRecorrenteID: string;
  TipoDeConsulta: string;
  observacao: string;
  statusDaConsulta?: string;
  createAt: Date;
  AlunoID: string;
  sala: string;
  cargo: number;
}

const RecorrenciaSchema: Schema = new Schema({
  frequency: { type: String },
  interval: { type: String },
});

const ConsultaSchema: Schema = new Schema({
  id: { type: String, default: uuidv4, unique: true},
  pacienteNome: { type: String, required: true },
  title: { type: String, required: true },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  resourceID: { type: String, required: true },
  recorrencia: RecorrenciaSchema,
  consultaRecorrenteID: { type: String, required: true },
  TipoDeConsulta: { type: String, required: true },
  observacao: { type: String, required: true },
  statusDaConsulta: { type: String },
  createAt: { type: Date, default: Date.now },
  AlunoID: { type: String, required: true },
  sala: { type: String, required: true },
  cargp: {type: Number, required: true },
});

export default mongoose.model<ConsultaInterface>("Consulta", ConsultaSchema);
