import { Request, Response } from "express";
import Consulta from "../models/consulta";
import mongoose from "mongoose";
import Paciente from "../models/Paciente";
import { Aluno } from "../models/aluno";

//Criar consulta
export async function criarConsulta(req: Request, res: Response) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      Nome,
      TipoDeConsulta,
      allDay,
      alunoId,
      createAt,
      start,
      end,
      frequenciaIntervalo,
      intervalo,
      observacao,
      pacienteld,
      sala,
      statusDaConsulta,
    } = req.body;

    const aluno = await Aluno.findById(alunoId)
      .populate("nome")
      .session(session);
    const paciente = await Paciente.findById(pacienteld)
      .populate("nome")
      .session(session);

    if (!aluno) throw new Error("O aluno informado não existe.");
    if (!paciente) throw new Error("O paciente informado não existe.");

    const createdAt = createAt ? new Date(createAt) : new Date();
    const startDate = new Date(start);
    const endDate = new Date(end);

    startDate.setHours(
      startDate.getHours(),
      startDate.getMinutes(),
      startDate.getSeconds()
    );
    endDate.setHours(
      endDate.getHours(),
      endDate.getMinutes(),
      endDate.getSeconds()
    );

    const consultasNaSala = await Consulta.find({
      sala,
      start: { $lte: endDate },
      end: { $gte: startDate },
    });

    if (consultasNaSala.length >= 10) {
      await session.abortTransaction();
      return res
        .status(400)
        .json({ error: "Sala ocupada. Escolha outra sala." });
    }

    const novasConsultas: any[] = [];

    const createConsulta = (startDate: Date, endDate: Date) => ({
      Nome,
      TipoDeConsulta,
      allDay,
      alunoId,
      nomeAluno: aluno.nome,
      createdAt,
      start: startDate,
      end: endDate,
      observacao,
      pacienteld,
      intervalo,
      nomePaciente: paciente.nome,
      sala,
      statusDaConsulta,
    });

    const intervaloDias =
      intervalo === "Semanal" ? 7 : intervalo === "Mensal" ? 30 : 0;
    if (intervaloDias === 0 || !frequenciaIntervalo) {
      throw new Error("Intervalo ou frequência inválidos.");
    }

    for (let i = 0; i < parseInt(frequenciaIntervalo); i++) {
      const novaStartDate = new Date(startDate);
      novaStartDate.setDate(novaStartDate.getDate() + intervaloDias * i);
      const novaEndDate = new Date(endDate);
      novaEndDate.setDate(novaEndDate.getDate() + intervaloDias * i);
      novasConsultas.push(createConsulta(novaStartDate, novaEndDate));
    }

    await Consulta.insertMany(novasConsultas, { session });
    await session.commitTransaction();

    res.status(201).json({
      message: "Consulta(s) criada(s) com sucesso.",
      consultas: novasConsultas,
    });
  } catch (error: any) {
    await session.abortTransaction();
    res
      .status(500)
      .json({ message: `Erro ao criar consulta(s): ${error.message}` });
  } finally {
    session.endSession();
  }
}

//listar consultas
export const listarConsultas = async (req: Request, res: Response) => {
  const {
    q,
    Nome,
    nomeAluno,
    nomePaciente,
    sala,
    statusDaConsulta,
    createdAt,
    start,
    end,
  } = req.query;

  const page: number = parseInt(req.query.page as string, 10) || 1;
  const limit: number = 15;

  try {
    const searchQuery: any = {
      ...(q && {
        $or: [
          { Nome: { $regex: q, $options: "i" } },
          { TipoDeConsulta: { $regex: q, $options: "i" } },
        ],
      }),
      ...(Nome && { Nome: { $regex: Nome, $options: "i" } }),
      ...(nomeAluno && { nomeAluno: { $regex: nomeAluno, $options: "i" } }),
      ...(nomePaciente && {
        nomePaciente: { $regex: nomePaciente, $options: "i" },
      }),
      ...(sala && { sala: { $regex: sala, $options: "i" } }),
      ...(statusDaConsulta && {
        statusDaConsulta: { $regex: statusDaConsulta, $options: "i" },
      }),
      ...(statusDaConsulta === undefined && { statusDaConsulta: "Pendente" }),
    };

    if (createdAt) {
      const date = new Date(createdAt as string);
      searchQuery.createdAt = {
        $gte: date,
        $lt: new Date(date.getTime() + 24 * 60 * 60 * 1000),
      };
    }

    if (start) {
      const startDate = new Date(start as string);
      searchQuery.start = { $gte: startDate };
    }

    if (end) {
      const endDate = new Date(end as string);
      searchQuery.end = { $lte: endDate };
    }

    const consultas = await Consulta.find(searchQuery)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const consultasFormatadas = consultas.map((consulta) => ({
      ...consulta,
      intervalo: consulta.intervalo || "Não especificado",
    }));

    const totalItems = await Consulta.countDocuments(searchQuery);
    const totalPages = Math.ceil(totalItems / limit);

    res.json({
      consultas: consultasFormatadas,
      totalItems,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ message: "Erro ao listar consultas", error });
  }
};

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

//atualizar consulta
export async function atualizarConsulta(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const {
      Nome,
      TipoDeConsulta,
      alunoId,
      pacienteld,
      sala,
      start,
      end,
      ...updateData
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send("ID de consulta inválido.");
    }

    const alunoExistente = await Aluno.findById(alunoId);
    const pacienteExistente = await Paciente.findById(pacienteld);
    if (!alunoExistente || !pacienteExistente) {
      return res.status(400).send("Aluno ou paciente informado não existe.");
    }

    if (start && end && sala) {
      const consultasNaSala = await Consulta.find({
        _id: { $ne: id },
        sala,
        start: { $lte: end },
        end: { $gte: start },
      });
      if (consultasNaSala.length > 0) {
        return res
          .status(400)
          .send("Conflito de horário na sala. Escolha outro horário ou sala.");
      }
    }

    const consultaAtualizada = await Consulta.findByIdAndUpdate(
      id,
      {
        Nome,
        TipoDeConsulta,
        alunoId,
        pacienteld,
        sala,
        start,
        end,
        ...updateData,
      },
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

//deletar consulta
export async function deletarConsulta(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send("ID de consulta inválido.");
    }

    const consultaExcluida = await Consulta.findByIdAndDelete(id);

    if (!consultaExcluida) {
      return res.status(404).json({ message: "Consulta não encontrada." });
    }

    res.json({
      message: "Consulta excluída com sucesso.",
      consulta: consultaExcluida,
    });
  } catch (error: any) {
    console.error("Erro ao excluir consulta:", error);
    res.status(500).json({ error: "Erro ao excluir consulta." });
  }
}

//ultima consulta criada
export const obterUltimaConsultaCriada = async (
  req: Request,
  res: Response
) => {
  try {
    const ultimaConsulta = await Consulta.findOne().sort({ createdAt: -1 });
    res.json(ultimaConsulta);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erro ao buscar a última consulta criada" });
  }
};
