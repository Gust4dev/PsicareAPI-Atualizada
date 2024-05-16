import aluno from "../models/aluno";
import { Request, response, Response } from "express";
import consulta from "../models/consulta";
import Paciente from "../models/Paciente";
import professor from "../models/professor";
import secretario from "../models/secretario";

// Metodo delete ALUNO:
export async function deleteAluno(request: Request, response: Response) {
  try {
    const id = request.params.id;

    const alunoEncontrado = await aluno.findById(id);

    if (!alunoEncontrado) {
      return response.status(404).json({ error: "Aluno não encontrado" });
    }

    const alunoExcluido = await aluno.findByIdAndDelete(id);

    return response.json({
      message: "Aluno excluído com sucesso",
      aluno: alunoExcluido,
    });
  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: "Erro interno do servidor" });
  }
}

// Metodo delete CONSULTA
export async function deleteConsulta(request: Request, response: Response) {
  try {
    const _id = request.params.id;

    const consultaEncontrada = await consulta.findById(_id);

    if (!consultaEncontrada) {
      return response.status(404).json({ error: "Consulta não encontrada" });
    }

    const consultaExcluida = await consulta.findByIdAndDelete(_id);

    return response.json({
      message: "Consulta excluída com sucesso",
      consulta: consultaExcluida,
    });
  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: "Erro interno do servidor" });
  }
}

// Metodo delete Paciente:
export async function deletePaciente(request: Request, response: Response) {
  try {
    const id = request.params.id;

    const pacienteEncontrado = await Paciente.findById(id);

    if (!pacienteEncontrado) {
      return response.status(404).json({ error: "Paciente não encontrado" });
    }

    const pacienteExcluido = await Paciente.findByIdAndDelete(id);

    return response.json({
      message: "Paciente excluído com sucesso",
      Paciente: pacienteExcluido,
    });
  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: "Erro interno do servidor" });
  }
}

//   Metodo delete SECRETARIO:
export async function deleteSecretario(request: Request, response: Response) {
  try {
    const id = request.params.id;

    const secretarioEncontrado = await secretario.findById(id);

    if (!secretarioEncontrado) {
      return response.status(404).json({ error: "Secretario não encontrado" });
    }

    const secretarioExcluido = await secretario.findByIdAndDelete(id);

    return response.json({
      message: "Secretario excluído com sucesso",
      secretario: secretarioExcluido,
    });
  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: "Erro interno do servidor" });
  }
}

// Metodo delete PROFESSOR:
export async function deleteProfessor(request: Request, response: Response) {
  try {
    const id = request.params.id;

    const professorEncontrado = await professor.findById(id);

    if (!professorEncontrado) {
      return response.status(404).json({ error: "Professor não encontrado" });
    }

    const professorExcluido = await professor.findByIdAndDelete(id);

    return response.json({
      message: "Professor excluído com sucesso",
      professor: professorExcluido,
    });
  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: "Erro interno do servidor" });
  }
}
