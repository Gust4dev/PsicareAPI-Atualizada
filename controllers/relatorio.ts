import { Request, Response } from "express";
import mongoose from "mongoose";
import Relatorio from "../models/relatorio";
import Paciente from "../models/Paciente";
import { Aluno } from "../models/aluno";

// Criar relatorio
export async function criarRelatorio(req: Request, res: Response) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      id_paciente,
      id_aluno,
      nome_funcionario,
      ultimaAtualizacao,
      conteudo,
      ativoRelatorio,
    } = req.body;

    if (!id_paciente) {
      throw new Error("ID do paciente é obrigatório.");
    }

    if (!id_aluno) {
      throw new Error("ID do aluno é obrigatório.");
    }

    if (!nome_funcionario) {
      throw new Error("Nome do funcionário é obrigatório.");
    }

    if (!conteudo) {
      throw new Error("Conteúdo do relatório é obrigatório.");
    }

    const paciente = await Paciente.findById(id_paciente)
      .populate("nome", "dataNascimento")
      .session(session);

    if (!paciente) {
      throw new Error("Paciente não encontrado.");
    }

    const aluno = await Aluno.findById(id_aluno)
      .populate("nome")
      .session(session);

    if (!aluno) {
      throw new Error("Aluno não encontrado.");
    }

    const novoRelatorio = new Relatorio({
      id_paciente,
      nomePaciente: paciente.nome,
      dataNascimentoPaciente: paciente.dataNascimento,
      dataInicioTratamento: paciente.dataInicioTratamento,
      dataTerminoTratamento: paciente.dataTerminoTratamento,
      tipoTratamento: paciente.tipoDeTratamento,
      alunoUnieva: aluno.alunoUnieva,
      id_aluno: aluno._id,
      funcionarioUnieva: aluno.funcionarioUnieva,
      nome_funcionario,
      dataCriacao: new Date(),
      ultimaAtualizacao: ultimaAtualizacao || new Date(),
      conteudo,
      ativoRelatorio: ativoRelatorio ?? true,
    });

    await novoRelatorio.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      message: "Relatório criado com sucesso.",
      relatorio: novoRelatorio,
    });
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    return res
      .status(400)
      .json({ message: error.message || "Erro ao criar o relatório." });
  }
}
//Listar relatorios
export async function listarRelatorios(req: Request, res: Response) {
  const {
    q,
    nomeAluno,
    nomePaciente,
    tipoTratamento,
    dataCriacao,
    ativoRelatorio,
  } = req.query;
  const page: number = parseInt(req.query.page as string, 10) || 1;
  const limit: number = 15;

  try {
    const searchQuery: any = {
      ativoRelatorio: ativoRelatorio === "false" ? false : true,
      ...(q && {
        $or: [
          { nomeAluno: { $regex: q, $options: "i" } },
          { nomePaciente: { $regex: q, $options: "i" } },
          { tipoTratamento: { $regex: q, $options: "i" } },
        ],
      }),
      ...(nomeAluno && { nomeAluno: { $regex: nomeAluno, $options: "i" } }),
      ...(nomePaciente && {
        nomePaciente: { $regex: nomePaciente, $options: "i" },
      }),
      ...(tipoTratamento && {
        tipoTratamento: { $regex: tipoTratamento, $options: "i" },
      }),
    };

    if (dataCriacao) {
      const [day, month] = (dataCriacao as string).split("-");
      if (day && month) {
        const currentYear = new Date().getFullYear();
        const date = new Date(`${currentYear}-${month}-${day}`);
        date.setHours(0, 0, 0, 0);
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

        searchQuery.dataCriacao = {
          $gte: date,
          $lt: nextDate,
        };
      }
    }

    const relatorios = await Relatorio.find(searchQuery)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const totalItems = await Relatorio.countDocuments(searchQuery);
    const totalPages = Math.ceil(totalItems / limit);

    res.json({
      relatorios,
      totalItems,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar relatórios", error });
  }
}

//atualizar relatorio
export async function atualizarRelatorio(req: Request, res: Response) {
  const { id } = req.params;
  const dadosAtualizados = req.body;

  try {
    const relatorioAtualizado = await Relatorio.findByIdAndUpdate(
      id,
      { $set: dadosAtualizados },
      { new: true, runValidators: true }
    ).lean();

    if (!relatorioAtualizado) {
      return res.status(404).json({ message: "Relatório não encontrado" });
    }

    res.json({
      message: "Relatório atualizado com sucesso",
      relatorio: relatorioAtualizado,
    });
  } catch (error) {
    res.status(500).json({ message: "Erro ao atualizar relatório", error });
  }
}

//Deletar relatorio
export async function deletarRelatorio(req: Request, res: Response) {
  const { id } = req.params;

  try {
    const relatorioDeletado = await Relatorio.findByIdAndDelete(id).lean();

    if (!relatorioDeletado) {
      return res.status(404).json({ message: "Relatório não encontrado" });
    }

    res.json({
      message: "Relatório deletado com sucesso",
      relatorio: relatorioDeletado,
    });
  } catch (error) {
    res.status(500).json({ message: "Erro ao deletar relatório", error });
  }
}

//Arquivar relatorio
export async function arquivarRelatorio(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const relatorio = await Relatorio.findById(id);

    if (!relatorio) {
      return res.status(404).json({ error: "Relatório não encontrado." });
    }

    if (!relatorio.ativoRelatorio) {
      return res.status(400).json({ error: "Relatório já está arquivado." });
    }

    relatorio.ativoRelatorio = false;

    await relatorio.save();

    res.status(200).json({ message: "Relatório arquivado com sucesso." });
  } catch (error: any) {
    res.status(500).json({ error: "Erro ao arquivar relatório." });
  }
}