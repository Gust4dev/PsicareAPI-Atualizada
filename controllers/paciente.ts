import { Request, Response } from "express";
import Paciente from "../models/Paciente";
import mongoose from "mongoose";

export async function criarPaciente(req: Request, res: Response) {
  const {
    nome,
    cpf,
    dataDeNascimento,
    email,
    telefoneContato,
    sexo,
    estadoCivil,
    religiao,
    rendaFamiliar,
    profissao,
    outroContato,
    nomeDoContatoResponsavel,
    menorDeIdade,
    naturalidade,
    nacionalidade,
    enderecoCep,
    enderecoLogradouro,
    enderecoBairro,
    enderecoComplemento,
    enderecoCidade,
    enderecoUF,
    dataInicioTratamento,
    dataTerminoTratamento,
    quemEncaminhouID,
    quemEncaminhouNome,
    tipoDeTratamento,
    alunoUnieva,
    funcionarioUnieva,
  } = req.body;

  // Verificar se o cpf já existe no bd
  const pacienteExistente = await Paciente.findOne({ cpf });
  if (pacienteExistente) {
    return res.status(400).send("Já existe um paciente com este CPF.");
  }

  const alunoOcupado = await Paciente.findOne({ alunoUnieva });
  if (alunoOcupado) {
    return res
      .status(400)
      .send("Esse aluno já está trabalhando com um paciente");
  }

  // criar paciente
  const novoPaciente = new Paciente({
    nome,
    cpf,
    dataDeNascimento,
    email,
    telefoneContato,
    sexo,
    estadoCivil,
    religiao,
    rendaFamiliar,
    profissao,
    outroContato,
    nomeDoContatoResponsavel,
    menorDeIdade,
    naturalidade,
    nacionalidade,
    enderecoCep,
    enderecoLogradouro,
    enderecoBairro,
    enderecoComplemento,
    enderecoCidade,
    enderecoUF,
    dataInicioTratamento,
    dataTerminoTratamento,
    quemEncaminhouID,
    quemEncaminhouNome,
    tipoDeTratamento,
    alunoUnieva,
    funcionarioUnieva,
  });

  try {
    await novoPaciente.save();
    return res.status(201).send("Paciente cadastrado com sucesso.");
  } catch (error: any) {
    console.error(error);
    return res.status(500).send("Erro ao cadastrar o paciente.");
  }
}

// Funções paciente
export async function listarPacientes(req: Request, res: Response) {
  try {
    const pacientes = await Paciente.find({});
    res.json(pacientes);
  } catch (error: any) {
    res.status(500).json({ message: "Erro ao buscar pacientes." });
  }
}

export async function obterPacientePorID(req: Request, res: Response) {
  try {
    const pacienteID = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(pacienteID)) {
      return res.status(400).send("ID de paciente inválido.");
    }
    const paciente = await Paciente.findById(pacienteID);
    if (!paciente) {
      return res.status(404).send("Paciente não encontrado.");
    }
    res.json(paciente);
  } catch (error: any) {
    res.status(500).json({ message: "Erro ao buscar paciente." });
  }
}
export async function listarPacientesPorIDAluno(req: Request, res: Response) {
  try {
    const alunoID = req.params.id;
    const pacientes = await Paciente.find({ quemEncaminhouID: alunoID });
    res.json(pacientes);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Erro ao buscar pacientes por ID do aluno." });
  }
}

export async function atualizarPaciente(req: Request, res: Response) {
  try {
    const pacienteID = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(pacienteID)) {
      return res.status(400).send("ID de paciente inválido.");
    }
    const pacienteAtualizado = await Paciente.findByIdAndUpdate(
      pacienteID,
      req.body,
      { new: true }
    );
    if (!pacienteAtualizado) {
      return res.status(404).send("Paciente não encontrado.");
    }
    res.json(pacienteAtualizado);
  } catch (error: any) {
    res.status(500).json({ message: "Erro ao atualizar paciente." });
  }
}

export async function deletePaciente(request: Request, response: Response) {
  try {
    const pacienteID = request.params.id;
    const pacienteEncontrado = await Paciente.findById(pacienteID);

    if (!pacienteEncontrado) {
      return response.status(404).json({ error: "Paciente não encontrado" });
    }

    await Paciente.findByIdAndDelete(pacienteID);

    return response.json({
      message: "Paciente excluído com sucesso",
      paciente: pacienteEncontrado,
    });
  } catch (error: any) {
    console.error(error);
    return response.status(500).json({ error: "Erro interno do servidor" });
  }
}

// Metodo para receber ultimo paciente criado
export const obterUltimoPacienteCriado = async (
  req: Request,
  res: Response
) => {
  try {
    const ultimoPaciente = await Paciente.findOne().sort({ createdAt: -1 });
    res.json(ultimoPaciente);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erro ao buscar o último paciente criado" });
  }
}

export const listarPacientePaginados = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string, 10) || 1;
  const limit = parseInt(req.query.limit as string, 10) || 10;

  try {
    const pacientes = await Paciente.find()
      .skip((page - 1) * limit)
      .limit(limit);

    const totalItems = await Paciente.countDocuments();
    const totalPages = Math.ceil(totalItems / limit);

    res.json({
      pacientes,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar pacientes paginados', error });
  }
};