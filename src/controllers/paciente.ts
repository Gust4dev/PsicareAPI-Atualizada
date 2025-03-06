import { Request, Response } from "express";
import Paciente from "../models/Paciente";
import mongoose from "mongoose";
import User from "../models/user";
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
      telefone,
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
      tipoDeTratamento,
      alunoUnieva,
      funcionarioUnieva,
      alunoId,
    } = req.body;

    const cpfFormatado = cpf.replace(/\D/g, "");

    const pacienteExistenteCPF = await Paciente.exists({
      cpf: cpfFormatado,
    }).session(session);
    const usuarioExistenteCPF = await User.exists({
      cpf: cpfFormatado,
    }).session(session);

    const pacienteExistenteEmail = await Paciente.exists({
      email,
    }).session(session);
    const usuarioExistenteEmail = await User.exists({
      email,
    }).session(session);

    if (pacienteExistenteCPF || usuarioExistenteCPF) {
      throw new Error("Já existe um usuário com este CPF.");
    }

    if (pacienteExistenteEmail || usuarioExistenteEmail) {
      throw new Error("Já existe um usuário com este email.");
    }

    let encaminhador: string = "";

    if (alunoId && !funcionarioUnieva) {
      const aluno = await Aluno.findById(alunoId).session(session);
      if (!aluno) {
        throw new Error("Aluno não encontrado.");
      }
      encaminhador = aluno.nome;
    } else if (funcionarioUnieva) {
      encaminhador = "Funcionário da Unieva";
    } else {
      throw new Error(
        "O paciente deve ser vinculado a um aluno ou a um funcionário."
      );
    }

    const newPaciente = new Paciente({
      nome,
      cpf: cpfFormatado,
      email,
      telefone,
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
      ativoPaciente: true,
      alunoId: alunoId || undefined,
    });

    await newPaciente.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: "Cadastro de paciente criado com sucesso.",
      paciente: newPaciente,
    });
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({
      error: error.message || "Não foi possível criar o cadastro de paciente.",
    });
  }
}

// Listar pacientes
export const listarPacientes = async (req: Request, res: Response) => {
  const { q, nome, telefone, email, tipoDeTratamento, dataNascimento, ativo } =
    req.query;
  const page: number = parseInt(req.query.page as string, 10) || 1;
  const limit: number = 15;
  try {
    const searchQuery: any = {
      ...(q && {
        $or: [
          { nome: { $regex: q, $options: "i" } },
          { telefone: { $regex: q, $options: "i" } },
          { email: { $regex: q, $options: "i" } },
          { tipoDeTratamento: { $regex: q, $options: "i" } },
        ],
      }),
      ...(nome && { nome: { $regex: nome, $options: "i" } }),
      ...(telefone && {
        telefone: {
          $regex: new RegExp(
            telefone.toString().replace(/\D/g, "").split("").join("\\D*"),
            "i"
          ),
        },
      }),
      ...(email && { email: { $regex: email, $options: "i" } }),
      ...(tipoDeTratamento && {
        tipoDeTratamento: { $regex: tipoDeTratamento, $options: "i" },
      }),
      ...(dataNascimento && {
        dataNascimento: {
          $gte: new Date(dataNascimento as string),
          $lt: new Date(
            new Date(dataNascimento as string).getTime() + 24 * 60 * 60 * 1000
          ),
        },
      }),
      ativoPaciente: ativo === undefined ? true : ativo === "true",
    };
    if (req.user && req.user.cargo === 3 && req.user.alunoId) {
      searchQuery.alunoId = req.user.alunoId;
    }
    if (req.user && req.user.cargo === 2 && req.user.professorId) {
      const alunos = await Aluno.find({
        professorId: req.user.professorId,
      }).select("_id");
      const alunoIds = alunos.map((aluno) => aluno._id);
      searchQuery.alunoId = { $in: alunoIds };
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
export async function listarPacientesPorAlunoId(req: Request, res: Response) {
  try {
    const alunoId = req.params.id;
    const page: number = parseInt(req.query.page as string, 10) || 1;
    const limit: number = 10;

    const aluno = await Aluno.findById(alunoId);
    if (!aluno) {
      return res.status(404).json({ error: "Aluno não encontrado." });
    }

    const ativo = req.query.ativo;
    const query = {
      alunoId,
      ativoPaciente: ativo === undefined ? true : ativo === "true",
    };

    const totalItems = await Paciente.countDocuments(query);

    const pacientes = await Paciente.find(query)
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
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const {
      cpf,
      email,
      alunoId,
      alunoUnieva,
      funcionarioUnieva,
      ...updateData
    } = req.body;
    const pacienteExistente = await Paciente.findById(id).session(session);
    if (!pacienteExistente) {
      throw new Error("Paciente não encontrado.");
    }
    const cpfFormatado = cpf?.replace(/\D/g, "");
    if (email && email !== pacienteExistente.email) {
      const pacienteExistenteEmail = await Paciente.findOne({ email }).session(
        session
      );
      const usuarioExistenteEmail = await User.findOne({ email }).session(
        session
      );
      if (pacienteExistenteEmail || usuarioExistenteEmail) {
        return res.status(400).send("Já existe um usuário com este email.");
      }
      updateData.email = email;
    }
    if (cpfFormatado && cpfFormatado !== pacienteExistente.cpf) {
      const pacienteExistenteCPF = await Paciente.findOne({
        cpf: cpfFormatado,
      }).session(session);
      const usuarioExistenteCPF = await User.findOne({
        cpf: cpfFormatado,
      }).session(session);
      if (pacienteExistenteCPF || usuarioExistenteCPF) {
        return res.status(400).send("Já existe um usuário com este CPF.");
      }
      updateData.cpf = cpfFormatado;
    }
    if (alunoUnieva && !funcionarioUnieva) {
      if (alunoId) {
        updateData.alunoId = alunoId;
      } else {
        updateData.encaminhador = req.body.encaminhador;
      }
      updateData.alunoUnieva = true;
      updateData.funcionarioUnieva = false;
    } else if (!alunoUnieva && funcionarioUnieva) {
      updateData.funcionarioUnieva = true;
      updateData.alunoUnieva = false;
      await Paciente.updateOne({ _id: id }, { $unset: { alunoId: 1 } }).session(
        session
      );
    }
    const pacienteAtualizado = await Paciente.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).session(session);
    await session.commitTransaction();
    session.endSession();
    res.json({
      message: "Paciente atualizado com sucesso.",
      paciente: pacienteAtualizado,
    });
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: error.message });
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

//RESOLVER PROBLEMA COM FORMATACAO DO CPF
