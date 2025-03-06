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
        return res.status(401).json({ message: "Usuário não autenticado." });
      }
      alunoIdToUse = req.user.alunoId;
    } else if (!alunoId && !nome_funcionario) {
      return res
        .status(400)
        .json({ message: "Aluno ou funcionário deve ser vinculado." });
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
      prontuario: prontuarioFiles.map((file) => file.id),
      assinatura: assinaturaFiles.map((file) => file.id),
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
      .sort({ dataCriacao: -1 })
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
  try {
    const { id } = req.params;
    if (!id) {
      return res
        .status(400)
        .json({ message: "ID do relatório não fornecido." });
    }
    const relatorioExistente = await Relatorio.findById(id).session(session);
    if (!relatorioExistente) {
      return res.status(404).json({ message: "Relatório não encontrado." });
    }
    const {
      pacienteId,
      dataNascimentoPaciente,
      dataInicioTratamento,
      dataTerminoTratamento,
      tipoTratamento,
      alunoUnieva,
      alunoId,
      funcionarioUnieva,
      nome_funcionario,
      conteudo,
      ativoRelatorio,
      ...rest
    } = req.body;
    const dadosAtualizados: any = {
      ...rest,
      ...(pacienteId && { pacienteId }),
      ...(dataNascimentoPaciente && { dataNascimentoPaciente }),
      ...(dataInicioTratamento && { dataInicioTratamento }),
      ...(dataTerminoTratamento && { dataTerminoTratamento }),
      ...(tipoTratamento && { tipoTratamento }),
      ...(alunoUnieva !== undefined && { alunoUnieva }),
      ...(alunoId !== undefined && { alunoId }),
      ...(funcionarioUnieva !== undefined && { funcionarioUnieva }),
      ...(nome_funcionario && { nome_funcionario }),
      ...(conteudo && { conteudo }),
      ...(ativoRelatorio !== undefined && { ativoRelatorio }),
    };
    if (pacienteId) {
      const paciente = await Paciente.findById(pacienteId);
      if (paciente) {
        dadosAtualizados.nomePaciente = paciente.nome;
      } else {
        return res.status(400).json({ message: "Paciente não encontrado." });
      }
    }
    if (alunoId) {
      const aluno = await Aluno.findById(alunoId);
      if (aluno) {
        dadosAtualizados.nomeAluno = aluno.nome;
      } else {
        dadosAtualizados.encaminhador = req.body.encaminhador;
        dadosAtualizados.alunoId = null;
      }
    }
    const existingFilesProntuario = relatorioExistente.prontuario || [];
    const newUploadedFilesProntuario = req.fileIds?.prontuario || [];
    const mergedFilesProntuario = [...existingFilesProntuario];
    for (const newFile of newUploadedFilesProntuario) {
      const duplicate = mergedFilesProntuario.find(
        (file) => file.nome === newFile.nome
      );
      if (!duplicate) {
        mergedFilesProntuario.push(newFile);
      }
    }
    dadosAtualizados.prontuario = mergedFilesProntuario;
    const existingFilesAssinatura = relatorioExistente.assinatura || [];
    const newUploadedFilesAssinatura = req.fileIds?.assinatura || [];
    const mergedFilesAssinatura = [...existingFilesAssinatura];
    for (const newFile of newUploadedFilesAssinatura) {
      const duplicate = mergedFilesAssinatura.find(
        (file) => file.nome === newFile.nome
      );
      if (!duplicate) {
        mergedFilesAssinatura.push(newFile);
      }
    }
    dadosAtualizados.assinatura = mergedFilesAssinatura;
    if (dadosAtualizados.assinatura && dadosAtualizados.assinatura.length > 0) {
      relatorioExistente.assinado = true;
    }
    Object.assign(relatorioExistente, dadosAtualizados);
    relatorioExistente.ultimaAtualizacao = new Date();
    await relatorioExistente.save({ session });
    await session.commitTransaction();
    session.endSession();
    return res.status(200).json({
      message: "Relatório atualizado com sucesso.",
      relatorio: relatorioExistente,
    });
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({
      message: error.message || "Erro interno ao atualizar o relatório.",
    });
  }
}

//atualizar assinatura do professor
export async function atualizarAssinaturaProfessor(
  req: Request,
  res: Response
) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json({ message: "ID do relatório não fornecido." });
    }

    const relatorioExistente = await Relatorio.findById(id).session(session);

    if (!relatorioExistente) {
      return res.status(404).json({ message: "Relatório não encontrado." });
    }

    // Garantindo que req.files seja tratado como um objeto mapeado
    const filesMap = req.files as
      | { [fieldname: string]: Express.Multer.File[] }
      | undefined;
    const assinaturaFiles = filesMap?.assinatura;

    if (assinaturaFiles && assinaturaFiles.length > 0) {
      // Atualiza apenas o campo assinatura
      relatorioExistente.assinatura = assinaturaFiles.map((file) => ({
        id: new mongoose.Types.ObjectId(),
        nome: file.originalname,
      }));
    } else {
      console.log("Nenhum arquivo de assinatura foi enviado.");
    }

    relatorioExistente.ultimaAtualizacao = new Date();
    await relatorioExistente.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      message: "Assinatura atualizada com sucesso.",
      assinatura: relatorioExistente.assinatura,
    });
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    console.error("Erro ao atualizar assinatura:", error);

    return res.status(500).json({
      message: error.message || "Erro interno ao atualizar a assinatura.",
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

      res.set("Content-Type", file.contentType || "application/octet-stream");
      res.set("Content-Disposition", `attachment; filename="${file.filename}"`);
    });

    readstream.pipe(res);
  } catch (err) {
    console.error("Erro ao baixar o arquivo:", err);
    res.status(500).json({ message: "Erro ao baixar o arquivo.", error: err });
  }
}

//deletar arquivo dentro do relatorio
export async function deletarArquivo(req: Request, res: Response) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "ID do arquivo não fornecido." });
    }

    const objectId = new mongoose.Types.ObjectId(id);
    const bucket = getGridFSBucket();

    const relatorio = await Relatorio.findOne({
      $or: [{ "prontuario.id": objectId }, { "assinatura.id": objectId }],
    }).session(session);

    if (!relatorio) {
      return res
        .status(404)
        .json({ message: "Relatório com o arquivo não encontrado." });
    }

    if (relatorio.prontuario?.some((file) => file.id.equals(objectId))) {
      relatorio.prontuario = relatorio.prontuario.filter(
        (file) => !file.id.equals(objectId)
      );
    } else if (relatorio.assinatura?.some((file) => file.id.equals(objectId))) {
      relatorio.assinatura = relatorio.assinatura.filter(
        (file) => !file.id.equals(objectId)
      );
    } else {
      return res
        .status(400)
        .json({ message: "Arquivo não encontrado no relatório." });
    }

    await bucket.delete(objectId);

    await relatorio.save({ session });
    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({ message: "Arquivo deletado com sucesso." });
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({
      message: error.message || "Erro ao deletar arquivo.",
    });
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
