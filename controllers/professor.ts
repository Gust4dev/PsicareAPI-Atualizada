import { Request, Response } from "express";
import Professor from "../models/professor";
import aluno from "../models/aluno";

export async function createProfessor(req: Request, res: Response) {
  try {
    const { nome, cpf, telefoneContato, email, disciplina } = req.body;
    const newProfessor = new Professor({
      nome,
      cpf,
      telefoneContato,
      email,
      disciplina,
    });
    await newProfessor.save();
    res
      .status(201)
      .json({ message: "Cadastro de professor criado com sucesso." });
  } catch (error: any) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Não foi possível criar o cadastro de professor." });
  }
}

export async function getProfessores(req: Request, res: Response) {
  try {
    const professores = await Professor.find({});
    res.json(professores);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar professores." });
  }
}

export async function getProfessorById(req: Request, res: Response) {
  try {
    const professor = await Professor.findById(req.params.id);
    if (!professor) {
      return res.status(404).json({ message: "Professor não encontrado." });
    }
    res.json(professor);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar professor." });
  }
}

export async function getProfessoresSelect(req: Request, res: Response) {
  try {
    const professores = await Professor.find({}, "nome disciplina");
    res.json(professores);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar professores." });
  }
}

export async function patchProfessor(req: Request, res: Response) {
  try {
    const { nome, cpf, telefoneContato, email, disciplina } = req.body;
    const updatedProfessor = await Professor.findByIdAndUpdate(
      req.params.id,
      { nome, cpf, telefoneContato, email, disciplina },
      { new: true }
    );
    if (!updatedProfessor) {
      return res.status(404).json({ message: "Professor não encontrado." });
    }
    res.json({
      message: "Professor atualizado com sucesso.",
      professor: updatedProfessor,
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Erro ao atualizar professor." });
  }
}

export async function patchProfessorArquivo(req: Request, res: Response) {
  try {
    const { arquivado } = req.body;
    const updatedProfessor = await Professor.findByIdAndUpdate(
      req.params.id,
      { arquivado },
      { new: true }
    );
    if (!updatedProfessor) {
      return res.status(404).json({ message: "Professor não encontrado." });
    }
    res.json({
      message: "Professor arquivado com sucesso.",
      professor: updatedProfessor,
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Erro ao arquivar professor." });
  }
}

export async function deleteProfessor(req: Request, res: Response) {
  try {
    const deletedProfessor = await Professor.findByIdAndDelete(req.params.id);
    if (!deletedProfessor) {
      return res.status(404).json({ message: "Professor não encontrado." });
    }
    res.json({
      message: "Professor excluído com sucesso.",
      professor: deletedProfessor,
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Erro ao excluir professor." });
  }
}
