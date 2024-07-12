import { Request, Response } from "express";
import Paciente from "../models/Paciente";
import mongoose from "mongoose";

export async function criarPaciente(req: Request, res: Response) {
  try {
    const {
      nome,
      cpf,
      idade,
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

    // Verificar se o email já existe
    const pacienteExistenteEmail = await Paciente.exists({ email });
    if (pacienteExistenteEmail) {
      return res.status(400).send("Já existe um paciente com este email.");
    }

    // Verificar se o CPF já existe
    const pacienteExistenteCPF = await Paciente.exists({ cpf });
    if (pacienteExistenteCPF) {
      return res.status(400).send("Já existe um paciente com este CPF.");
    }

    const newPaciente = new Paciente({
      nome,
      cpf,
      idade,
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

    await newPaciente.save();
    res
      .status(201)
      .json({ message: "Cadastro de paciente criado com sucesso." });
  } catch (error: any) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Não foi possível criar o cadastro de paciente." });
  }
}

// Funções paciente
export const listarPacientes = async (req: Request, res: Response) => {
  const { q } = req.query;
  const page: number = parseInt(req.query.page as string, 10) || 1;
  const limit: number = 15;

  try {
    const searchQuery = q ? { nome: { $regex: q, $options: "i" } } : {};
    const pacientes = await Paciente.find(searchQuery)
      .skip((page - 1) * limit)
      .limit(limit);

    const totalItems = await Paciente.countDocuments(searchQuery);
    const totalPages = Math.ceil(totalItems / limit);

    res.json({
      pacientes,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar pacientes", error });
  }
};

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
    const { id } = req.params;
    const { cpf, email, ...updateData } = req.body;

    // Verificar se o email já existe
    const pacienteExistenteEmail = await Paciente.exists({
      email,
      _id: { $ne: id },
    });
    if (pacienteExistenteEmail) {
      return res.status(400).send("Já existe um paciente com este email.");
    }

    // Verificar se o CPF já existe
    const pacienteExistenteCPF = await Paciente.exists({
      cpf,
      _id: { $ne: id },
    });
    if (pacienteExistenteCPF) {
      return res.status(400).send("Já existe um paciente com este CPF.");
    }

    const pacienteAtualizado = await Paciente.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!pacienteAtualizado) {
      return res.status(404).send("Paciente não encontrado");
    }

    res.json(pacienteAtualizado);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
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
};

export const listarPacientePaginados = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string, 10) || 1;
  const limit: number = 15;

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
    res
      .status(500)
      .json({ message: "Erro ao buscar pacientes paginados", error });
  }
};

export const deletarPacienteSelecionados = async (
  req: Request,
  res: Response
) => {
  const { ids } = req.body;

  if (!ids || !Array.isArray(ids)) {
    return res.status(400).json({ message: "IDs inválidos fornecidos" });
  }
  try {
    const result = await Paciente.deleteMany({ _id: { $in: ids } });
    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({ message: "Nenhum secretário encontrado para deletar" });
    }
    res.status(200).json({
      message: `${result.deletedCount} secretários deletados com sucesso`,
    });
  } catch (error) {
    res.status(500).json({ message: "Erro ao deletar secretários", error });
  }
};
