import { Request, Response } from "express";
import { Aluno } from "../models/aluno";
import Professor from "../models/professor";
import Paciente from "../models/Paciente";
import Relatorio from "../models/relatorio";
import Consulta from "../models/consulta";

export const getGerencia = async (req: Request, res: Response) => {
  try {
    const { start, end } = req.query;

    const startDate = new Date(start as string);
    const endDate = new Date(end as string);

    // Contagem simples
    const alunoCount = await Aluno.countDocuments();
    const professorCount = await Professor.countDocuments();
    const pacienteCount = await Paciente.countDocuments();
    const relatorioCount = await Relatorio.countDocuments();
    const relatorioAssinadoCount = await Relatorio.countDocuments({
      assinado: true,
    });

    // Consultas filtradas pelo intervalo
    const consultas = await Consulta.find({
      start: { $gte: startDate },
      end: { $lte: endDate },
    });

    const consultaStats = {
      pendente: consultas.filter((c) => c.statusDaConsulta === "Pendente").length,
      aluno_faltou: consultas.filter((c) => c.statusDaConsulta === "Aluno Faltou").length,
      paciente_faltou: consultas.filter((c) => c.statusDaConsulta === "Paciente Faltou").length,
      cancelada: consultas.filter((c) => c.statusDaConsulta === "Cancelada").length,
      concluida: consultas.filter((c) => c.statusDaConsulta === "Concluída").length,
      andamento: consultas.filter((c) => c.statusDaConsulta === "Em Andamento").length,
    };

    const tratamentoStats = {
      iniciaram: {
        psicoterapia: consultas.filter((c) => c.TipoDeConsulta === "Psicoterapia" && c.statusDaConsulta === "Iniciada").length,
        plantao: consultas.filter((c) => c.TipoDeConsulta === "Plantão" && c.statusDaConsulta === "Iniciada").length,
        psicodiagnostico: consultas.filter((c) => c.TipoDeConsulta === "Psicodiagnóstico" && c.statusDaConsulta === "Iniciada").length,
        avaliacao_diagnostica: consultas.filter((c) => c.TipoDeConsulta === "Avaliação Diagnóstica" && c.statusDaConsulta === "Iniciada").length,
      },
      terminaram: {
        psicoterapia: consultas.filter((c) => c.TipoDeConsulta === "Psicoterapia" && c.statusDaConsulta === "Terminada").length,
        plantao: consultas.filter((c) => c.TipoDeConsulta === "Plantão" && c.statusDaConsulta === "Terminada").length,
        psicodiagnostico: consultas.filter((c) => c.TipoDeConsulta === "Psicodiagnóstico" && c.statusDaConsulta === "Terminada").length,
        avaliacao_diagnostica: consultas.filter((c) => c.TipoDeConsulta === "Avaliação Diagnóstica" && c.statusDaConsulta === "Terminada").length,
      },
      acontecem: {
        psicoterapia: consultas.filter((c) => c.TipoDeConsulta === "Psicoterapia" && c.statusDaConsulta === "Em Andamento").length,
        plantao: consultas.filter((c) => c.TipoDeConsulta === "Plantão" && c.statusDaConsulta === "Em Andamento").length,
        psicodiagnostico: consultas.filter((c) => c.TipoDeConsulta === "Psicodiagnóstico" && c.statusDaConsulta === "Em Andamento").length,
        avaliacao_diagnostica: consultas.filter((c) => c.TipoDeConsulta === "Avaliação Diagnóstica" && c.statusDaConsulta === "Em Andamento").length,
      },
    };

    res.status(200).json({
      aluno: alunoCount,
      professor: professorCount,
      paciente: pacienteCount,
      relatorio: relatorioCount,
      relatorio_assinado: relatorioAssinadoCount,
      consulta: consultaStats,
      tratamento: tratamentoStats,
    });
  } catch (error: any) {
    res.status(500).json({ message: `Erro ao buscar dados de gerência: ${error.message}` });
  }
};
