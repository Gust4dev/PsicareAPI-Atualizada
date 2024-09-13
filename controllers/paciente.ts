import { Request, Response } from "express";
import Paciente from "../models/Paciente";
import mongoose from "mongoose";
import { Aluno } from "../models/aluno";

// criar paciente
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
      alunoId,
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

    const aluno = await Aluno.findById(alunoId).session(session);
    if (!aluno) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).send("Aluno não encontrado.");
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
      alunoId: aluno._id,
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

// Listar pacientes com filtros adicionais (arquivados e data de nascimento)
export const listarPacientes = async (req: Request, res: Response) => {
  const {
    q,
    nome,
    cpf,
    email,
    sexo,
    tipoDeTratamento,
    encaminhador,
    dataInicioTratamento,
    dataTerminoTratamento,
    dataNascimento, // Novo filtro de data de nascimento
    ativo, // Novo filtro para paciente arquivado
  } = req.query;

  const page: number = parseInt(req.query.page as string, 10) || 1;
  const limit: number = 15;

  try {
    const searchQuery: any = {
      ativoPaciente: ativo !== undefined ? ativo === "true" : true, // Se o parâmetro "ativo" for passado, usá-lo, senão, listar apenas os ativos
      ...(q && {
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
      }),
      ...(nome && { nome: { $regex: nome, $options: "i" } }),
      ...(cpf && { cpf: { $regex: cpf, $options: "i" } }),
      ...(email && { email: { $regex: email, $options: "i" } }),
      ...(sexo && { sexo: { $regex: sexo, $options: "i" } }),
      ...(tipoDeTratamento && {
        tipoDeTratamento: { $regex: tipoDeTratamento, $options: "i" },
      }),
      ...(encaminhador && {
        encaminhador: { $regex: encaminhador, $options: "i" },
      }),
    };

    if (dataInicioTratamento) {
      const dateStr = dataInicioTratamento as string;
      const date = new Date(dateStr);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      searchQuery.dataInicioTratamento = {
        $gte: date,
        $lt: nextDate,
      };
    }

    if (dataTerminoTratamento) {
      const dateStr = dataTerminoTratamento as string;
      const date = new Date(dateStr);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      searchQuery.dataTerminoTratamento = {
        $gte: date,
        $lt: nextDate,
      };
    }

    if (dataNascimento) {
      const dateStr = dataNascimento as string;
      const date = new Date(dateStr);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      searchQuery.dataNascimento = {
        $gte: date,
        $lt: nextDate,
      };
    }

    const pacientes = await Paciente.find(searchQuery)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const totalItems = await Paciente.countDocuments(searchQuery);
    const totalPages = Math.ceil(totalItems / limit);

    res.json({
      pacientes,
      totalItems,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar pacientes", error });
  }
};

// Obter dados do paciente
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

// Listar pacientes por ID do aluno
export async function listarPacientesPoralunoId(req: Request, res: Response) {
  try {
    const alunoId = req.params.id;
    const page: number = parseInt(req.query.page as string, 10) || 1;
    const limit: number = 10;

    const aluno = await Aluno.findById(alunoId);
    if (!aluno) {
      return res.status(404).json({ error: "Aluno não encontrado." });
    }

    const totalItems = await Paciente.countDocuments({ alunoId });
    const pacientes = await Paciente.find({ alunoId })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    if (!pacientes || pacientes.length === 0) {
      return res
        .status(404)
        .json({ error: "Nenhum paciente encontrado para este aluno." });
    }

    res.json({
      pacientes,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
    });
  } catch (error: any) {
    res.status(500).json({
      error: "Erro ao buscar pacientes por ID do aluno.",
      details: error.message,
    });
  }
}

// Atualizar dados de um paciente
export async function atualizarPaciente(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { cpf, email, ...updateData } = req.body;

    const pacienteExistenteEmail = await Paciente.exists({
      email,
      _id: { $ne: id },
    });
    const pacienteExistenteCPF = await Paciente.exists({
      cpf,
      _id: { $ne: id },
    });

    if (pacienteExistenteEmail) {
      return res
        .status(400)
        .json({ message: "Já existe um paciente com este email." });
    }
    if (pacienteExistenteCPF) {
      return res
        .status(400)
        .json({ message: "Já existe um paciente com este CPF." });
    }

    const pacienteAtualizado = await Paciente.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!pacienteAtualizado) {
      return res.status(404).json({ message: "Paciente não encontrado." });
    }

    res.json({
      message: "Paciente atualizado com sucesso.",
      paciente: pacienteAtualizado,
    });
  } catch (error: any) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erro ao atualizar paciente.", details: error.message });
  }
}

// Arquivar paciente
export async function arquivarPaciente(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const paciente = await Paciente.findById(id);

    if (!paciente) {
      return res.status(404).json({ error: "Paciente não encontrado." });
    }

    if (!paciente.ativoPaciente) {
      return res.status(400).json({ error: "Paciente já está arquivado." });
    }

    paciente.ativoPaciente = false;

    await paciente.save();

    res.status(200).json({ message: "Paciente arquivado com sucesso." });
  } catch (error: any) {
    res.status(500).json({ error: "Erro ao arquivar paciente." });
  }
}

// Obter o último paciente
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
