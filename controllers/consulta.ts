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

    console.log("Dados recebidos no body:", req.body);

    if (!Nome) {
      throw new Error("O nome da consulta deve ser informado.");
    }
    if (!TipoDeConsulta) {
      throw new Error("O tipo de consulta deve ser informado.");
    }
    if (!alunoId) {
      throw new Error("O ID do aluno é obrigatório.");
    }
    if (!pacienteld) {
      throw new Error("O ID do paciente é obrigatório.");
    }
    if (
      !start ||
      !end ||
      isNaN(new Date(start).getTime()) ||
      isNaN(new Date(end).getTime())
    ) {
      throw new Error("Datas de início ou término inválidas.");
    }
    if (!sala) {
      throw new Error("A sala deve ser informada.");
    }
    if (!intervalo) {
      throw new Error("O intervalo de repetição deve ser informado.");
    }

    const aluno = await Aluno.findById(alunoId)
      .populate("nome")
      .session(session);

    const paciente = await Paciente.findById(pacienteld)
      .populate("nome")
      .session(session);

    if (!aluno) {
      throw new Error("O aluno informado não existe.");
    }
    if (!paciente) {
      throw new Error("O paciente informado não existe.");
    }

    const createdAt = createAt || new Date();

    const consultasNaSala = await Consulta.find({
      sala,
      start: { $lte: end },
      end: { $gte: start },
    });

    if (consultasNaSala.length >= 10) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ error: "Sala ocupada. Escolha outra sala." });
    }

    const novasConsultas: any[] = [];

    console.log("Intervalo recebido:", intervalo);
    const createConsulta = (startDate: Date, endDate: Date) => {
      return {
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
        nomePaciente: paciente.nome,
        sala,
        statusDaConsulta,
      };
    };

    if (intervalo === "Sessão Única") {
      novasConsultas.push(createConsulta(start, end));
    } else if (intervalo === "Semanal" || intervalo === "Mensal") {
      const intervaloDias = intervalo === "Semanal" ? 7 : 30;

      console.log("Frequência de intervalo recebida:", frequenciaIntervalo);

      for (let i = 0; i < parseInt(frequenciaIntervalo); i++) {
        const novaDataStart = new Date(start);
        novaDataStart.setDate(novaDataStart.getDate() + intervaloDias * i);

        const novaDataEnd = new Date(end);
        novaDataEnd.setDate(novaDataEnd.getDate() + intervaloDias * i);

        console.log(
          "Criando consulta com start:",
          novaDataStart,
          "e end:",
          novaDataEnd
        );
        novasConsultas.push(createConsulta(novaDataStart, novaDataEnd));
      }
    }

    console.log("Consultas a serem inseridas:", novasConsultas);

    await Consulta.insertMany(novasConsultas, { session })
      .then(() => console.log("Consultas inseridas com sucesso"))
      .catch((err) => {
        console.error("Erro ao inserir consultas:", err);
        throw new Error("Erro ao inserir consultas.");
      });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: "Consulta(s) criada(s) com sucesso.",
      consultas: novasConsultas,
    });
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    console.error("Erro ao criar consulta(s):", error);
    res.status(500).json({ message: "Erro ao criar consulta(s)." });
  } finally {
    session.endSession();
  }
}


//listar consultas
export const listarConsultas = async (req: Request, res: Response) => {
  const { q, nome, tipoDeConsulta, start, end, sala } = req.query;
  const page: number = parseInt(req.query.page as string, 10) || 1;
  const limit: number = 15;

  try {
    const searchQuery: any = {
      ...(q && { descricao: { $regex: q, $options: "i" } }),
      ...(nome && { Nome: { $regex: nome, $options: "i" } }),
      ...(tipoDeConsulta && {
        TipoDeConsulta: { $regex: tipoDeConsulta, $options: "i" },
      }),
      ...(sala && { sala: { $regex: sala, $options: "i" } }),
    };

    if (start && end) {
      searchQuery.start = { $gte: new Date(start as string) };
      searchQuery.end = { $lte: new Date(end as string) };
    }

    const consultas = await Consulta.find(searchQuery)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const totalItems = await Consulta.countDocuments(searchQuery);
    const totalPages = Math.ceil(totalItems / limit);

    res.json({
      consultas,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar consultas", error });
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

export const listarConsultaPaginadas = async (
  req: Request,
  res: Response
): Promise<void> => {
  const page: number = parseInt(req.query.page as string, 10) || 1;
  const limit: number = 15;

  try {
    const [consulta, total] = await Promise.all([
      Consulta.find()
        .skip((page - 1) * limit)
        .limit(limit),
      Consulta.countDocuments(),
    ]);

    res.json({
      consulta,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar consulta paginados" });
  }
};
