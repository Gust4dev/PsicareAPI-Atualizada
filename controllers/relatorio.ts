import { Request, Response } from "express";
import mongoose from "mongoose";
import Relatorio from "../models/relatorio";
import Paciente from "../models/Paciente";
import { Aluno } from "../models/aluno";

// Criar relatório
export async function criarRelatorio(req: Request, res: Response) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      pacienteId,
      nome_funcionario,
      ultimaAtualizacao,
      conteudo,
      ativoRelatorio,
      alunoId,
    } = req.body;

    let alunoIdToUse = alunoId;

    if (req.user?.cargo === 3) {
      if (!req.user.alunoId) {
        return res.status(401).json({
          message: "Usuário não autenticado.",
        });
      }
      alunoIdToUse = req.user.alunoId;
    } else if (!alunoId && !nome_funcionario) {
      return res.status(400).json({
        message: "Aluno ou funcionário deve ser vinculado.",
      });
    }

    const paciente = await Paciente.findById(pacienteId)
      .populate("nome", "dataNascimento")
      .session(session);

    if (!paciente) {
      throw new Error("Paciente não encontrado.");
    }

    let aluno = null;
    let nomeAluno = null;

    if (alunoIdToUse) {
      aluno = await Aluno.findById(alunoIdToUse)
        .populate("nome")
        .session(session);

      if (!aluno) {
        throw new Error("Aluno não encontrado.");
      }
      nomeAluno = aluno.nome;
    }

    const novoRelatorio = new Relatorio({
      pacienteId,
      nomePaciente: paciente.nome,
      dataNascimentoPaciente: paciente.dataNascimento,
      dataInicioTratamento: paciente.dataInicioTratamento,
      dataTerminoTratamento: paciente.dataTerminoTratamento,
      tipoTratamento: paciente.tipoDeTratamento,
      alunoUnieva: !!alunoIdToUse,
      alunoId: alunoIdToUse || null,
      nomeAluno: nomeAluno || null,
      funcionarioUnieva: !alunoIdToUse,
      nome_funcionario: nomeAluno ? null : nome_funcionario,
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

    if (req.user && req.user.cargo === 3 && req.user.alunoId) {
      searchQuery.alunoId = req.user.alunoId;
    } else if (req.user && req.user.cargo === 2 && req.user.professorId) {
      const alunos = await Aluno.find({
        professorId: req.user.professorId,
      }).select("_id");
      const alunoIds = alunos.map((aluno) => aluno._id);
      searchQuery.alunoId = { $in: alunoIds };
    }

    if (dataCriacao) {
      const dateStr = dataCriacao as string;
      const date = new Date(dateStr);
      searchQuery.dataCriacao = {
        $gte: date,
        $lt: new Date(date.getTime() + 24 * 60 * 60 * 1000),
      };
    }

    const relatorios = await Relatorio.find(searchQuery)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const totalItems = await Relatorio.countDocuments(searchQuery);
    const totalPages = Math.ceil(totalItems / limit);

    const relatoriosComCamposFiltrados = relatorios.map((relatorio) => {
      const camposFiltrados: any = {
        ...relatorio,
        prontuario: relatorio.prontuario
          ? `/relatorio/download/${relatorio.prontuario}`
          : null,
        assinatura: relatorio.assinatura
          ? `/relatorio/download/${relatorio.assinatura}`
          : null,
      };

      if (relatorio.alunoUnieva) {
        delete camposFiltrados.nome_funcionario;
      } else if (relatorio.funcionarioUnieva) {
        delete camposFiltrados.alunoId;
        delete camposFiltrados.nomeAluno;
      }

      return camposFiltrados;
    });

    res.json({
      relatorios: relatoriosComCamposFiltrados,
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
  let dadosAtualizados = req.body;
  const { prontuario, assinatura } = req.fileIds || {};

  try {
    if (req.user) {
      if (req.user.cargo === 3) {
        dadosAtualizados = {
          ...dadosAtualizados,
          alunoId: req.user.alunoId,
          nome_funcionario: null,
        };
      } else if (req.user.cargo === 2) {
        dadosAtualizados = {
          assinatura: assinatura ? assinatura : undefined,
        };
      } else if (req.user.cargo === 3 && dadosAtualizados.funcionarioUnieva) {
        dadosAtualizados.nome_funcionario = null;
      }
    }

    await Relatorio.findByIdAndUpdate(
      id,
      {
        $set: {
          ...dadosAtualizados,
          prontuario: prontuario ? prontuario : undefined,
          assinatura: assinatura ? assinatura : undefined,
        },
      },
      { new: true, runValidators: true }
    );

    const relatorioAtualizado = await Relatorio.findById(id)
      .populate<{ alunoId: { nome: string } }>("alunoId", "nome")
      .populate<{ pacienteId: { nome: string } }>("pacienteId", "nome")
      .lean();

    if (!relatorioAtualizado) {
      return res.status(404).json({ message: "Relatório não encontrado" });
    }

    const nomeAluno = relatorioAtualizado.alunoId?.nome || null;
    const nomePaciente = relatorioAtualizado.pacienteId?.nome || null;

    await Relatorio.findByIdAndUpdate(id, {
      $set: {
        nomeAluno,
        nomePaciente,
      },
    });

    res.json({
      message: "Relatório atualizado com sucesso",
      relatorio: {
        ...relatorioAtualizado,
        nomeAluno,
        nomePaciente,
      },
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
