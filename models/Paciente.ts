import mongoose from "mongoose";

const pacienteSchema = new mongoose.Schema(
    {
      createdAt: {
        type: Date,
        default: Date.now(),
      },
      // Informações pessoais:
      nome: {
        type: String,
        required: true,
        trim: true,
      },
      cpf: {
        type: String,
        required: true,
        trim: true
      },
      dataDeNascimento: {
        type: String,   
        required: true,
      },
      email: {
        type: String,
        required: true, 
      },
      telefoneContato: {
        type: String,
        required: true, 
      },
      sexo: {
        type: String,
        required: true, 
      },
      estadoCivil: {
        type: String,
        required: true, 
      },
      religiao: {
        type: String,
        required: true, 
      },
      rendaFamiliar:{
        type: String,
        required: true,
      },
      profissao: {
        type: String,
        required: true, 
      },
      outroContato: {
        type: String,
        required: false, 
      },
      nomeDoContatoResponsavel: {
        type: String,
        required: false, 
      },
      menorDeIdade: {
        type: Boolean,
        required: false,  
      },
      naturalidade: {
        type: String,
        required: true, 
      },
      nacionalidade: {
        type: String,
        required: true, 
      },
      // Endereço:
      enderecoCep: {
        type: String,
        required: true, 
      },
      enderecoLogradouro: {
        type: String,
        required: true, 
      },
      enderecoBairro: {
        type: String,
        required: true, 
      },
      enderecoComplemento: {
        type: String, 
        required: false, 
      },
      enderecoCidade: {
        type: String,
        required: true, 
      },
      enderecoUF: {
        type: String,
        required: true, 
      },
      // Informação de tratamento:
      dataInicioTratamento: {
        type: String,
        required: true, 
      },
      dataTerminoTratamento: {
        type: String,
        required: true, 
      },
      quemEncaminhouID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true, 
      },
      quemEncaminhouNome: {
        type: String,
        required: true, 
      },
      tipoDeTratamento: {
        type: String,
        required: true, 
      },
      alunoUnieva: {
        type: Boolean,
        required: false, 
      },
      funcionarioUnieva: {
        type: Boolean,
        required: false, 
      },
      arquivado: {
        type: Boolean,
        default: false,
        required:false,
      },
    },
    { timestamps: true }
  );

export default mongoose.model("Paciente", pacienteSchema);
