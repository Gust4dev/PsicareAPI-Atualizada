import { Request, Response } from "express";
import Aluno from "../models/aluno";

export async function criarAluno(req: Request, res: Response) {
  const {
    matricula,
    periodo,
    nome,
    cpf,
    telefone,
    professorID,
    professorNome,
    professorDisciplina,
    email,
  } = req.body;

  // funções aluno
  const newAluno = new Aluno({
    matricula,
    periodo,
    nome,
    cpf,
    telefone,
    professorID,
    professorNome,
    professorDisciplina,
    email,
    role: "Estudante",
  });

  try {
    await newAluno.save();
    return res.status(201).send("Cadastro do aluno criado com sucesso.");
  } catch (error: any) {
    console.error(error);
    return res
      .status(500)
      .send("Não foi possível realizar o cadastro do aluno.");
  }
}

export async function listarAlunos(req: Request, res: Response) {
  try {
    const alunos = await Aluno.find({});
    res.json(alunos);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export async function obterAlunoPorID(req: Request, res: Response) {
  try {
    const alunoData = await Aluno.findById(req.params.id);
    if (!alunoData) {
      return res.status(404).send("Aluno não encontrado");
    }
    res.json(alunoData);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export async function listarNomesAlunos(req: Request, res: Response) {
  try {
    const alunos = await Aluno.find({}, "nome");
    res.json(alunos);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export async function listarAlunosPorProfessorID(req: Request, res: Response) {
  try {
    const professorID = req.params.id;
    const alunos = await Aluno.find({ professorID });
    res.json(alunos);
  } catch (error: any) {
    res
      .status(500)
      .json({ error: "Erro ao buscar alunos por ID do professor." });
  }
}

export async function atualizarAluno(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const alunoAtualizado = await Aluno.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!alunoAtualizado) {
      return res.status(404).send("Aluno não encontrado");
    }

    res.json(alunoAtualizado);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export async function deletarAluno(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const alunoEncontrado = await Aluno.findById(id);

    if (!alunoEncontrado) {
      return res.status(404).json({ error: "Aluno não encontrado" });
    }

    const alunoExcluido = await Aluno.findByIdAndDelete(id);
    return res.json({
      message: "Aluno excluído com sucesso",
      aluno: alunoExcluido,
    });
  } catch (error: any) {
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

// Metodo para receber ultimo aluno criado
export const obterUltimoAlunoCriado = async (req: Request, res: Response) => {
  try {
    const ultimoAluno = await Aluno.findOne().sort({ createdAt: -1 });
    res.json(ultimoAluno);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar o último aluno criado' });
  }
}

export const listarAlunosPaginados = async (req: Request, res: Response): Promise<void> => {
  const page: number = parseInt(req.query.page as string, 10) || 1;
  const limit: number = parseInt(req.query.limit as string, 10) || 10;

  try {
    const [alunos, total] = await Promise.all([
      Aluno.find().skip((page - 1) * limit).limit(limit),
      Aluno.countDocuments()
    ]);

    res.json({
      alunos,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar alunos paginados' });
  }
};