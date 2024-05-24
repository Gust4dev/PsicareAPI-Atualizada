import { Request, Response } from "express";
import Aluno from "../models/aluno";

export async function criarAluno(req: Request, res: Response) {
  const {
    matricula,
    periodo,
    nome,
    cpf,
    telefoneContato,
    professorID,
    professorNome,
    professorDisciplina,
    email,
    arquivado,
  } = req.body;

  // funções aluno
  const newAluno = new Aluno({
    matricula,
    periodo,
    nome,
    cpf,
    telefoneContato,
    professorID,
    professorNome,
    professorDisciplina,
    email,
    arquivado,
    role: "Estudante",
  });

  try {
    await newAluno.save();
    return res.status(201).send("Cadastro do aluno criado com sucesso.");
  } catch (error) {
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
  } catch (error) {
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
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function listarNomesAlunos(req: Request, res: Response) {
  try {
    const alunos = await Aluno.find({}, "nome");
    res.json(alunos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function listarAlunosPorProfessorID(req: Request, res: Response) {
  try {
    const professorID = req.params.id;
    const alunos = await Aluno.find({ professorID });
    res.json(alunos);
  } catch (error) {
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
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function arquivarAluno(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const { arquivado } = req.body;

    const alunoAtualizado = await Aluno.findByIdAndUpdate(
      id,
      { arquivado },
      { new: true }
    );

    if (!alunoAtualizado) {
      return res.status(404).send("Aluno não encontrado");
    }

    res.json(alunoAtualizado);
  } catch (error) {
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
  } catch (error) {
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}
