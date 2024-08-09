import { Request, Response } from "express";
import bcrypt from "bcrypt";
import Paciente from "../models/Paciente";
import User, { UserInterface } from "../models/user";
import mongoose from "mongoose";

// Criar um novo paciente
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
      senha, // Adicionando senha para o paciente
    } = req.body;

    // Verificar duplicidade de email e CPF
    const pacienteExistenteEmail = await Paciente.exists({ email });
    const pacienteExistenteCPF = await Paciente.exists({ cpf });

    if (pacienteExistenteEmail) {
      return res.status(400).send("Já existe um paciente com este email.");
    }
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

    // Criptografar a senha e criar um novo usuário
    const senhaCriptografada = await bcrypt.hash(senha, 10);
    const novoUser: UserInterface = new User({
      nome,
      cpf,
      email,
      senha: senhaCriptografada,
    });

    // Salvar paciente e usuário no banco
    await newPaciente.save();
    await novoUser.save();

    res.status(201).json({ message: "Cadastro de paciente e usuário criado com sucesso." });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Não foi possível criar o cadastro de paciente." });
  }
}

// Listar pacientes com paginação
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

// Obter dados de um paciente por ID
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

// Listar pacientes por ID do aluno associado
export async function listarPacientesPorIDAluno(req: Request, res: Response) {
  try {
    const alunoID = req.params.id;
    const pacientes = await Paciente.find({ quemEncaminhouID: alunoID });
    res.json(pacientes);
  } catch (error: any) {
    res.status(500).json({ message: "Erro ao buscar pacientes por ID do aluno." });
  }
}

// Atualizar dados de um paciente
export async function atualizarPaciente(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { cpf, email, ...updateData } = req.body;

    // Verificar duplicidade de email e CPF
    const pacienteExistenteEmail = await Paciente.exists({
      email,
      _id: { $ne: id },
    });
    const pacienteExistenteCPF = await Paciente.exists({
      cpf,
      _id: { $ne: id },
    });

    if (pacienteExistenteEmail) {
      return res.status(400).send("Já existe um paciente com este email.");
    }
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

// Excluir um paciente
export async function deletarPaciente(req: Request, res: Response) {
  try {
    const pacienteID = req.params.id;
    const pacienteEncontrado = await Paciente.findById(pacienteID);

    if (!pacienteEncontrado) {
      return res.status(404).json({ error: "Paciente não encontrado" });
    }

    await Paciente.findByIdAndDelete(pacienteID);

    return res.json({
      message: "Paciente excluído com sucesso",
      paciente: pacienteEncontrado,
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
}

// Obter o último paciente criado
export const obterUltimoPacienteCriado = async (req: Request, res: Response) => {
  try {
    const ultimoPaciente = await Paciente.findOne().sort({ createdAt: -1 });
    res.json(ultimoPaciente);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar o último paciente criado" });
  }
};

// Listar pacientes paginados
export const listarPacientesPaginados = async (req: Request, res: Response) => {
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
      totalItems,
    });
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar pacientes paginados", error });
  }
};

// Deletar pacientes selecionados
export const deletarPacienteSelecionados = async (req: Request, res: Response) => {
  const ids = req.params.ids.split(",");

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: "IDs inválidos fornecidos" });
  }

  try {
    const result = await Paciente.deleteMany({ _id: { $in: ids } });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Nenhum paciente encontrado para deletar" });
    }
    res.status(200).json({
      message: `${result.deletedCount} pacientes deletados com sucesso`,
    });
  } catch (error) {
    res.status(500).json({ message: "Erro ao deletar pacientes", error });
  }
};

