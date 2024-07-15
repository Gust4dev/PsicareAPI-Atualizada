import mongoose, { Document, Schema } from "mongoose";

interface ConsultaInterface extends Document {
  Nome: string;
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
}

const RecorrenciaSchema: Schema = new Schema({
  frequency: { type: String },
  interval: { type: String },
});

const ConsultaSchema: Schema = new Schema({
  Nome: { type: String, required: true },
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
},
  { timestamps: true }
);

export default mongoose.model<ConsultaInterface>("Consulta", ConsultaSchema);
