import { Request, Response } from "express";
import Paciente from "../models/Paciente";
import mongoose from "mongoose";

// Criar um novo paciente
export async function criarPaciente(req: Request, res: Response) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      nome,
      cpf,
      email,
      telefoneContato,
      sexo,
      estadoCivil,
      religiao,
      rendaFamiliar,
      profissao,
      outroContato,
      nomeDoContatoResponsavel,
      dataNascimento,
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
      encaminhador,
      tipoDeTratamento,
      alunoUnieva,
      funcionarioUnieva,
    } = req.body;

    const idade = calcularIdade(dataNascimento);
    const menorDeIdade = idade < 18;

    if (menorDeIdade && (!nomeDoContatoResponsavel || !outroContato)) {
      throw new Error(
        "Contato responsável é obrigatório para menores de idade."
      );
    }

    const pacienteExistenteEmail = await Paciente.exists({ email }).session(
      session
    );
    const pacienteExistenteCPF = await Paciente.exists({ cpf }).session(
      session
    );

    if (pacienteExistenteEmail) {
      throw new Error("Já existe um paciente com este email.");
    }
    if (pacienteExistenteCPF) {
      throw new Error("Já existe um paciente com este CPF.");
    }

    const newPaciente = new Paciente({
      nome,
      cpf,
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
      dataNascimento,
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
      encaminhador,
      tipoDeTratamento,
      alunoUnieva,
      funcionarioUnieva,
      ativoPaciente: true,
    });

    await newPaciente.save({ session });

    await session.commitTransaction();
    session.endSession();

    res
      .status(201)
      .json({ message: "Cadastro de paciente criado com sucesso." });
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    res
      .status(500)
      .json({ error: "Não foi possível criar o cadastro de paciente." });
  }
}

function calcularIdade(dataNascimento: string): number {
  const nascimento = new Date(dataNascimento);
  const hoje = new Date();
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const mes = hoje.getMonth() - nascimento.getMonth();
  if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
    idade--;
  }
  return idade;
}

// Listar pacientes
export const listarPacientes = async (req: Request, res: Response) => {
  const { q } = req.query;
  const page: number = parseInt(req.query.page as string, 10) || 1;
  const limit: number = 15;

  try {
    const searchQuery = q
      ? {
          $or: [
            { nome: { $regex: q, $options: "i" } },
            { cpf: { $regex: q, $options: "i" } },
            { email: { $regex: q, $options: "i" } },
            { telefoneContato: { $regex: q, $options: "i" } },
            { sexo: { $regex: q, $options: "i" } },
            { estadoCivil: { $regex: q, $options: "i" } },
            { religiao: { $regex: q, $options: "i" } },
            { rendaFamiliar: { $regex: q, $options: "i" } },
            { profissao: { $regex: q, $options: "i" } },
            { outroContato: { $regex: q, $options: "i" } },
            { nomeDoContatoResponsavel: { $regex: q, $options: "i" } },
            { naturalidade: { $regex: q, $options: "i" } },
            { nacionalidade: { $regex: q, $options: "i" } },
            { enderecoCep: { $regex: q, $options: "i" } },
            { enderecoLogradouro: { $regex: q, $options: "i" } },
            { enderecoBairro: { $regex: q, $options: "i" } },
            { enderecoComplemento: { $regex: q, $options: "i" } },
            { enderecoCidade: { $regex: q, $options: "i" } },
            { enderecoUF: { $regex: q, $options: "i" } },
            { tipoDeTratamento: { $regex: q, $options: "i" } },
            { encaminhador: { $regex: q, $options: "i" } },
          ],
        }
      : {};

    const pacientes = await Paciente.find(searchQuery)
      .skip((page - 1) * limit)
      .limit(limit);

    const totalItems = await Paciente.countDocuments(searchQuery);

    res.json({
      pacientes,
      totalPages: Math.ceil(totalItems / limit),
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
export const listarPacientesPorEncaminhador = async (
  req: Request,
  res: Response
) => {
  try {
    const encaminhadorNome = req.params.nome;

    // Verifique se há pacientes com o nome do encaminhador fornecido
    const pacientes = await Paciente.find({
      encaminhador: encaminhadorNome,
    }).lean();

    if (!pacientes || pacientes.length === 0) {
      return res
        .status(404)
        .json({ error: "Nenhum paciente encontrado para este encaminhador." });
    }

    res.json(pacientes);
  } catch (error: any) {
    res.status(500).json({
      error: "Erro ao buscar pacientes por nome do encaminhador.",
      details: error.message,
    });
  }
};

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

// Arquivar um paciente
export async function arquivarPaciente(req: Request, res: Response) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;

    const paciente = await Paciente.findById(id).session(session);

    if (!paciente) {
      throw new Error("Paciente não encontrado.");
    }

    paciente.ativoPaciente = false;

    await paciente.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ message: "Paciente arquivado com sucesso." });
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ error: "Erro ao arquivar paciente." });
  }
}

// Obter o último paciente criado
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
    res
      .status(500)
      .json({ message: "Erro ao buscar pacientes paginados", error });
  }
};

// Deletar pacientes selecionados
export const deletarPacienteSelecionados = async (
  req: Request,
  res: Response
) => {
  const ids = req.params.ids.split(",");

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: "IDs inválidos fornecidos" });
  }

  try {
    const result = await Paciente.deleteMany({ _id: { $in: ids } });
    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({ message: "Nenhum paciente encontrado para deletar" });
    }
    res.status(200).json({
      message: `${result.deletedCount} pacientes deletados com sucesso`,
    });
  } catch (error) {
    res.status(500).json({ message: "Erro ao deletar pacientes", error });
  }
};
