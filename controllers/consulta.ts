import { Request, Response } from "express";
import Consulta from "../models/consulta";
import mongoose from "mongoose";

export async function criarConsulta(req: Request, res: Response) {
  const {
    pacienteID,
    pacienteNome,
    title,
    start,
    end,
    resourceID,
    recorrencia,
    consultaRecorrenteID,
    TipoDeConsulta,
    observacao,
    statusDaConsulta,
    AlunoID,
    sala,
  } = req.body;

  // Nova consulta
  const novaConsulta = new Consulta({
    pacienteID,
    pacienteNome,
    title,
    start,
    end,
    resourceID,
    recorrencia,
    consultaRecorrenteID,
    TipoDeConsulta,
    observacao,
    statusDaConsulta,
    AlunoID,
    sala,
  });

  // Verificar se a sala está disponível
  const consultasNaSala = await Consulta.find({ sala });
  if (consultasNaSala.length >= 10) {
    return res.status(400).json({ error: "Sala ocupada. Escolha outra sala." });
  }

  try {
    await novaConsulta.save();
    return res.status(201).send("Consulta criada com sucesso.");
  } catch (error: any) {
    console.error(error);
    return res.status(500).send("Não foi possível criar a consulta.");
  }
}

// Funcoes consulta
export async function listarConsultas(req: Request, res: Response) {
  try {
    const consultas = await Consulta.find({});
    res.json(consultas);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export async function obterConsultaPorID(req: Request, res: Response) {
  try {
    const consultaID = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(consultaID)) {
      return res.status(400).send("ID de consulta inválido.");
    }
    const consulta = await Consulta.findById(consultaID);
    if (!consulta) {
      return res.status(404).send("Consulta não encontrada.");
    }
    res.json(consulta);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export async function listarConsultasPorPacienteID(
  req: Request,
  res: Response
) {
  try {
    const pacienteID = req.params.id;
    const consultas = await Consulta.find({ pacienteID });
    res.json(consultas);
  } catch (error: any) {
    res
      .status(500)
      .json({ error: "Erro ao buscar consultas por ID do paciente." });
  }
}

export async function atualizarConsulta(req: Request, res: Response) {
  try {
    const consultaID = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(consultaID)) {
      return res.status(400).send("ID de consulta inválido.");
    }
    const consultaAtualizada = await Consulta.findByIdAndUpdate(
      consultaID,
      req.body,
      { new: true }
    );

    if (!consultaAtualizada) {
      return res.status(404).send("Consulta não encontrada.");
    }

    res.json(consultaAtualizada);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export async function deletarConsulta(req: Request, res: Response) {
  try {
    const consultaID = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(consultaID)) {
      return res.status(400).send("ID de consulta inválido.");
    }
    const consultaExcluida = await Consulta.findByIdAndDelete(consultaID);

    if (!consultaExcluida) {
      return res.status(404).send("Consulta não encontrada.");
    }

    res.json({
      message: "Consulta excluída com sucesso.",
      consulta: consultaExcluida,
    });
  } catch (error: any) {
    res.status(500).json({ error: "Erro interno do servidor." });
  }
}

// Metodo para receber ultima consulta criada
export const obterUltimaConsultaCriada = async (req: Request, res: Response) => {
  try {
    const ultimaConsulta = await Consulta.findOne().sort({ createdAt: -1 });
    res.json(ultimaConsulta);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar a última consulta criada' });
  }
}

export const listarConsultaPaginadas = async (req: Request, res: Response): Promise<void> => {
  const page: number = parseInt(req.query.page as string, 10) || 1;
  const limit: number = parseInt(req.query.limit as string, 10) || 10;

  try {
    const [consulta, total] = await Promise.all([
      Consulta.find().skip((page - 1) * limit).limit(limit),
      Consulta.countDocuments()
    ]);

    res.json({
      consulta,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar consulta paginados' });
  }
};