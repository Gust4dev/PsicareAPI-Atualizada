import mongoose from "mongoose";

const consultaSchema = new mongoose.Schema(
  {
    pacienteID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Paciente',
      required: true,
    },
    pacienteNome:{
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    start: {
      type: Date,
      required: true,
    },
    end: {
      type: Date,
      required: true,
    },
    resourceId: {
      type: String,
      required: true,
    },
    recorrencia: {
      frequency: {
        type: String,
        required: false, 
      },
      interval: {
        type: Number,
        required: false, 
      },
    },
    consultaRecorrenteID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Consulta',
      required: true,
    },
    tipoDeConsulta: {
      type: String,
      required: true,
    },
    observacao: {
      type: String,
      required: true,
    },
    statusDaConsulta: {
      type: String,
      required: false,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    alunoID:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Aluno',
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Consulta", consultaSchema);
