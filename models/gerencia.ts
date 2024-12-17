import mongoose, { Schema, Document } from "mongoose";

export interface IGerencia extends Document {
  aluno: number;
  professor: number;
  paciente: number;
  relatorio: number;
  relatorio_assinado: number;
  consulta: {
    pendente: number;
    aluno_faltou: number;
    paciente_faltou: number;
    cancelada: number;
    concluida: number;
    andamento: number;
  };
  tratamento: {
    iniciaram: {
      psicoterapia: number;
      plantao: number;
      psicodiagnostico: number;
      avaliacao_diagnostica: number;
    };
    terminaram: {
      psicoterapia: number;
      plantao: number;
      psicodiagnostico: number;
      avaliacao_diagnostica: number;
    };
    acontecem: {
      psicoterapia: number;
      plantao: number;
      psicodiagnostico: number;
      avaliacao_diagnostica: number;
    };
  };
}

const GerenciaSchema: Schema = new Schema({
  aluno: { type: Number, required: true },
  professor: { type: Number, required: true },
  paciente: { type: Number, required: true },
  relatorio: { type: Number, required: true },
  relatorio_assinado: { type: Number, required: true },
  consulta: {
    pendente: { type: Number, required: true },
    aluno_faltou: { type: Number, required: true },
    paciente_faltou: { type: Number, required: true },
    cancelada: { type: Number, required: true },
    concluida: { type: Number, required: true },
    andamento: { type: Number, required: true },
  },
  tratamento: {
    iniciaram: {
      psicoterapia: { type: Number, required: true },
      plantao: { type: Number, required: true },
      psicodiagnostico: { type: Number, required: true },
      avaliacao_diagnostica: { type: Number, required: true },
    },
    terminaram: {
      psicoterapia: { type: Number, required: true },
      plantao: { type: Number, required: true },
      psicodiagnostico: { type: Number, required: true },
      avaliacao_diagnostica: { type: Number, required: true },
    },
    acontecem: {
      psicoterapia: { type: Number, required: true },
      plantao: { type: Number, required: true },
      psicodiagnostico: { type: Number, required: true },
      avaliacao_diagnostica: { type: Number, required: true },
    },
  },
});

export default mongoose.model<IGerencia>("Gerencia", GerenciaSchema);
