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
  });

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
