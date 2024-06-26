import { Request, Response } from "express";
import Professor from "../models/professor";

export async function createProfessor(req: Request, res: Response) {
  try {
    const { id, nome, cpf, telefone, email, disciplina } = req.body;
    const newProfessor = new Professor({
      id,
      nome,
      cpf,
      telefone,
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


export const listarProfessores = async (req: Request, res: Response) => {
  const { q } = req.query;
  const page: number = parseInt(req.query.page as string, 10) || 1;
  const limit: number = 15;

  try {
    const searchQuery = q ? { nome: { $regex: q, $options: 'i' } } : {};
    const professores = await Professor.find(searchQuery)
      .skip((page - 1) * limit)
      .limit(limit);

    const totalItems = await Professor.countDocuments(searchQuery);
    const totalPages = Math.ceil(totalItems / limit);

    res.json({
      professores,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar professores', error });
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

// Metodo para receber ultimo professor criado
export const obterUltimoProfessorCriado = async (
  req: Request,
  res: Response
) => {
  try {
    const ultimoProfessor = await Professor.findOne().sort({ createdAt: -1 });
    res.json(ultimoProfessor);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erro ao buscar o último professor criado" });
  }
};

export const listarProfessorPaginados = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string, 10) || 1;
  const limit: number = 15;

  try {
    const professores = await Professor.find()
      .skip((page - 1) * limit)
      .limit(limit);

    const totalItems = await Professor.countDocuments();
    const totalPages = Math.ceil(totalItems / limit);

    res.json({
      professores,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erro ao buscar pacientes paginados", error });
  }
}

export const deletarProfessorSelecionados = async (
  req: Request,
  res: Response
) => {
  const { ids } = req.body;

  if (!ids || !Array.isArray(ids)) {
    return res.status(400).json({ message: "IDs inválidos fornecidos" });
  }
  try {
    const result = await Professor.deleteMany({ _id: { $in: ids } });
    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({ message: "Nenhum secretário encontrado para deletar" });
    }
    res.status(200).json({
      message: `${result.deletedCount} secretários deletados com sucesso`,
    });
  } catch (error) {
    res.status(500).json({ message: "Erro ao deletar secretários", error });
  }
};
