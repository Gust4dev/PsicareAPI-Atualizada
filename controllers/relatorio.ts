import { Request, Response } from "express";
import mongoose from "mongoose";
import Relatorio from "../models/relatorio";
import Paciente from "../models/Paciente";
import { Aluno } from "../models/aluno";
import { getGridFSBucket } from "../config/gridfs";
import { getFilesWithNames } from "../middleware/auth";

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
      dataCriacao,
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

    const prontuarioIds = req.fileIds?.prontuario || [];
    const assinaturaIds = req.fileIds?.assinatura || [];

    const prontuarioFiles = await getFilesWithNames(prontuarioIds);
    const assinaturaFiles = await getFilesWithNames(assinaturaIds);

    const novoRelatorio = new Relatorio({
      pacienteId,
      dataCriacao,
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
      ultimaAtualizacao: ultimaAtualizacao || new Date(),
      conteudo,
      ativoRelatorio: ativoRelatorio ?? true,
      prontuario: prontuarioFiles,
      assinatura: assinaturaFiles,
    });

    await novoRelatorio.save({ session });
    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      message: "Relatório criado com sucesso.",
      relatorio: novoRelatorio,
    });
  } catch (error: any) {
    console.error("Erro ao criar relatório:", error.message);

    await session.abortTransaction();
    session.endSession();
    return res.status(400).json({
      message: error.message || "Erro ao criar o relatório.",
    });
  }
}

//Listar relatorios
export async function listarRelatorios(req: Request, res: Response) {
  const {
    q,
    nomeAluno,
    nomePaciente,
    tipoTratamento,
    nome_funcionario,
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
          { nome_funcionario: { $regex: q, $options: "i" } },
        ],
      }),
      ...(nomeAluno && { nomeAluno: { $regex: nomeAluno, $options: "i" } }),
      ...(nomePaciente && {
        nomePaciente: { $regex: nomePaciente, $options: "i" },
      }),
      ...(tipoTratamento && {
        tipoTratamento: { $regex: tipoTratamento, $options: "i" },
      }),
      ...(nome_funcionario && {
        nome_funcionario: { $regex: nome_funcionario, $options: "i" },
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
          ? relatorio.prontuario.map((item) => ({
              nome: item.nome,
              id: `/relatorio/download/${item.id}`,
            }))
          : [],
        assinatura: relatorio.assinatura
          ? relatorio.assinatura.map((item) => ({
              nome: item.nome,
              id: `/relatorio/download/${item.id}`,
            }))
          : [],
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
  const session = await mongoose.startSession();
  session.startTransaction();

  if (!req.params.id) {
    return res.status(400).json({ message: "ID do relatório não fornecido." });
  }

  const relatorioId = new mongoose.Types.ObjectId(req.params.id);
  const relatorio = await Relatorio.findById(relatorioId);
  if (!relatorio) {
    return res.status(404).json({ message: "Relatório não encontrado." });
  }

  try {
    const prontuarioIds = req.fileIds?.prontuario || [];
    const assinaturaIds = req.fileIds?.assinatura || [];

    const prontuarioFiles = await getFilesWithNames(prontuarioIds);
    const assinaturaFiles = await getFilesWithNames(assinaturaIds);

    if (req.user && req.user.cargo === 2) {
      if (assinaturaFiles.length > 0) {
        relatorio.assinatura =
          relatorio.assinatura?.filter(
            (file) =>
              !assinaturaFiles.some((newFile) => newFile.id.equals(file.id))
          ) || [];

        relatorio.assinatura.push(...assinaturaFiles);
      }
    } else {
      relatorio.prontuario =
        relatorio.prontuario?.filter((file) =>
          prontuarioFiles.some((newFile) => newFile.id.equals(file.id))
        ) || [];

      const novosProntuarios = prontuarioFiles.filter(
        (newFile) =>
          !relatorio.prontuario?.some((file) => file.id.equals(newFile.id))
      );
      relatorio.prontuario.push(...novosProntuarios);

      if (assinaturaFiles.length > 0) {
        relatorio.assinatura =
          relatorio.assinatura?.filter(
            (file) =>
              !assinaturaFiles.some((newFile) => newFile.id.equals(file.id))
          ) || [];
        relatorio.assinatura.push(...assinaturaFiles);
      }
    }

    if (typeof req.body.ativoRelatorio !== "undefined") {
      relatorio.ativoRelatorio = req.body.ativoRelatorio;
    }

    const relatorioAtualizado = await Relatorio.findByIdAndUpdate(
      relatorioId,
      relatorio,
      { new: true, session }
    );

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      message: "Relatório atualizado com sucesso.",
      relatorio: relatorioAtualizado,
    });
  } catch (error: any) {
    console.error("Erro ao atualizar relatório:", error);

    await session.abortTransaction();
    session.endSession();
    return res.status(400).json({
      message: error.message || "Erro ao atualizar o relatório.",
    });
  }
}

//Download arquivo
export async function baixarArquivo(req: Request, res: Response) {
  const fileId = req.params.fileId;

  const gfs = getGridFSBucket();

  try {
    const readstream = gfs.openDownloadStream(
      new mongoose.Types.ObjectId(fileId)
    );

    readstream.on("error", (err) => {
      console.error("Erro ao abrir o stream de download:", err);
      return res.status(404).json({ message: "Arquivo não encontrado." });
    });

    readstream.on("file", (file) => {
      if (!file || file.length === 0) {
        return res.status(404).json({ message: "Arquivo não encontrado." });
      }

      res.set("Content-Type", file.contentType);
      res.set("Content-Disposition", `attachment; filename=${file.filename}`);
    });

    readstream.pipe(res);
  } catch (err) {
    console.error("Erro ao baixar o arquivo:", err);
    res.status(500).json({ message: "Erro ao baixar o arquivo.", error: err });
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

//Deletar relatorio
export async function deletarRelatorio(req: Request, res: Response) {
  const { id } = req.params;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const relatorio = await Relatorio.findById(id).lean();

    if (!relatorio) {
      return res.status(404).json({ message: "Relatório não encontrado" });
    }

    const relatorioDeletado = await Relatorio.findByIdAndDelete(id).session(
      session
    );

    const bucket = getGridFSBucket();

    const arquivosParaDeletar = [
      ...(relatorio.prontuario || []),
      ...(relatorio.assinatura || []),
    ];

    for (const file of arquivosParaDeletar) {
      if (file && file.id) {
        try {
          await bucket.delete(new mongoose.Types.ObjectId(file.id));
        } catch (deleteError) {
          console.error(
            `Erro ao deletar o arquivo com ID ${file.id}:`,
            deleteError
          );
        }
      } else {
      }
    }

    await session.commitTransaction();
    session.endSession();

    res.json({
      message: "Relatório e arquivos deletados com sucesso",
      relatorio: relatorioDeletado,
    });
  } catch (error) {
    console.error("Erro ao tentar deletar relatório e arquivos:", error);
    await session.abortTransaction();
    session.endSession();
    res
      .status(500)
      .json({ message: "Erro ao deletar relatório e arquivos", error });
  }
}
