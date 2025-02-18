import { Request, Response } from "express";
import { Aluno } from "../models/aluno";
import Professor from "../models/professor";
import Paciente from "../models/Paciente";
import Relatorio from "../models/relatorio";
import Consulta from "../models/consulta";

//Listar dados de toda a API
export async function getGerencia(req: Request, res: Response) {
  try {
    const { start, end } = req.query;

    const startDate = start ? new Date(start as string) : null;
    const endDate = end ? new Date(end as string) : null;

    const filter: any = {};
    if (startDate) filter.start = { $gte: startDate };
    if (endDate) filter.end = { ...filter.end, $lte: endDate };

    const alunoCount = await Aluno.countDocuments();
    const professorCount = await Professor.countDocuments();
    const pacienteCount = await Paciente.countDocuments({ ativoPaciente: true });
    const relatorioCount = await Relatorio.countDocuments({ ativoRelatorio: true });
    const relatorioAssinadoCount = await Relatorio.countDocuments({
      ativoRelatorio: true,
      "assinatura.0": { $exists: true },
    });

    const consultas = await Consulta.find(filter);

    const consultaStats = {
      pendente: consultas.filter((c) => c.statusDaConsulta === "Pendente").length,
      aluno_faltou: consultas.filter((c) => c.statusDaConsulta === "Aluno Faltou").length,
      paciente_faltou: consultas.filter((c) => c.statusDaConsulta === "Paciente Faltou").length,
      cancelada: consultas.filter((c) => c.statusDaConsulta === "Cancelada").length,
      concluida: consultas.filter((c) => c.statusDaConsulta === "Concluída").length,
      andamento: consultas.filter((c) => c.statusDaConsulta === "Em andamento").length,
    };

    const pacientes = await Paciente.find({ ativoPaciente: true });

    const tratamentoStats = {
      iniciaram: {
        psicoterapia: pacientes.filter((p) => p.tipoDeTratamento === "Psicoterapia" && p.dataInicioTratamento).length,
        plantao: pacientes.filter((p) => p.tipoDeTratamento === "Plantão" && p.dataInicioTratamento).length,
        psicodiagnostico: pacientes.filter((p) => p.tipoDeTratamento === "Psicodiagnóstico" && p.dataInicioTratamento).length,
        avaliacao_diagnostica: pacientes.filter((p) => p.tipoDeTratamento === "Avaliação Diagnóstica" && p.dataInicioTratamento).length,
      },
      terminaram: {
        psicoterapia: pacientes.filter((p) => p.tipoDeTratamento === "Psicoterapia" && p.dataTerminoTratamento).length,
        plantao: pacientes.filter((p) => p.tipoDeTratamento === "Plantão" && p.dataTerminoTratamento).length,
        psicodiagnostico: pacientes.filter((p) => p.tipoDeTratamento === "Psicodiagnóstico" && p.dataTerminoTratamento).length,
        avaliacao_diagnostica: pacientes.filter((p) => p.tipoDeTratamento === "Avaliação Diagnóstica" && p.dataTerminoTratamento).length,
      },
      acontecem: {
        psicoterapia: pacientes.filter((p) => p.tipoDeTratamento === "Psicoterapia" && !p.dataTerminoTratamento && p.dataInicioTratamento).length,
        plantao: pacientes.filter((p) => p.tipoDeTratamento === "Plantão" && !p.dataTerminoTratamento && p.dataInicioTratamento).length,
        psicodiagnostico: pacientes.filter((p) => p.tipoDeTratamento === "Psicodiagnóstico" && !p.dataTerminoTratamento && p.dataInicioTratamento).length,
        avaliacao_diagnostica: pacientes.filter((p) => p.tipoDeTratamento === "Avaliação Diagnóstica" && !p.dataTerminoTratamento && p.dataInicioTratamento).length,
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
}

