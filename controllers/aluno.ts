import { Request, Response } from "express";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { Aluno } from "../models/aluno";
import User, { UserInterface } from "../models/user";
import Professor from "../models/professor";

// Criar um novo aluno
export async function criarAluno(req: Request, res: Response) {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { matricula, periodo, nome, cpf, telefone, email, professorId } =
      req.body;

    // Verificações de existência
    const alunoExistenteCPF = await Aluno.exists({ cpf }).session(session);
    const alunoExistenteMatricula = await Aluno.exists({ matricula }).session(
      session
    );
    const alunoExistenteEmail = await Aluno.exists({ email }).session(session);

    if (alunoExistenteCPF) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).send("Já existe um aluno com este CPF.");
    }
    if (alunoExistenteMatricula) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).send("Já existe um aluno com esta matrícula.");
    }
    if (alunoExistenteEmail) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).send("Já existe um aluno com este email.");
    }

    // Buscar nome do professor usando o professorId
    const professor = await Professor.findById(professorId).session(session);
    if (!professor) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).send("Professor não encontrado.");
    }
    const nomeProfessor = professor.nome;

    // Geração da senha a partir do CPF
    const senha = cpf.slice(0, -2);
    const senhaCriptografada = await bcrypt.hash(senha, 10);

    // Formatação do período para exibir "1º, 2º, 3º, etc."
    const periodoFormatado = `${periodo}º`;

    const newAluno = new Aluno({
      matricula,
      periodo: periodoFormatado,
      nome,
      cpf,
      telefone,
      email,
      nomeProfessor,
    });

    const novoUser: UserInterface = new User({
      nome,
      cpf,
      email,
      senha: senhaCriptografada,
      cargo: 3,
    });

    // Salvar aluno e usuário no banco dentro da transação
    await newAluno.save({ session });
    await novoUser.save({ session });

    // Commit da transação
    await session.commitTransaction();
    session.endSession();

    res
      .status(201)
      .json({ message: "Cadastro de aluno e usuário criado com sucesso." });
  } catch (error: any) {
    // Se qualquer erro ocorrer, abortar a transação
    await session.abortTransaction();
    session.endSession();
    console.error(error);
    res
      .status(500)
      .json({ error: "Não foi possível criar o cadastro de aluno e usuário." });
  }
}

// Listar alunos com paginação
export const listarAlunos = async (req: Request, res: Response) => {
  const { q } = req.query;
  const page: number = parseInt(req.query.page as string, 10) || 1;
  const limit: number = 15;

  try {
    const searchQuery = q
      ? {
          $or: [
            { nome: { $regex: new RegExp(q as string, "i") } },
            { cpf: { $regex: new RegExp(q as string, "i") } },
            { email: { $regex: new RegExp(q as string, "i") } },
            { matricula: { $regex: new RegExp(q as string, "i") } },
            { telefone: { $regex: new RegExp(q as string, "i") } },
            { periodo: { $regex: new RegExp(q as string, "i") } },
            { nomeProfessor: { $regex: new RegExp(q as string, "i") } }
          ],
        }
      : {};

    const alunos = await Aluno.find(searchQuery)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(); 

    const totalItems = await Aluno.countDocuments(searchQuery);
    const totalPages = Math.ceil(totalItems / limit);

    res.json({
      alunos,
      totalPages,
      currentPage: page,
      totalItems,
    });
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar alunos", error });
  }
};

// Obter dados de um aluno por ID
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

// Listar nomes de todos os alunos
export async function listarNomesAlunos(req: Request, res: Response) {
  try {
    const { q } = req.query;
    const searchQuery = q
      ? {
          $or: [
            { nome: { $regex: q, $options: "i" } },
            { cpf: { $regex: q, $options: "i" } },
            { email: { $regex: q, $options: "i" } },
            { matricula: { $regex: q, $options: "i" } },
            { telefone: { $regex: q, $options: "i" } },
            { periodo: { $regex: q, $options: "i" } },
          ],
        }
      : {};

    const allAlunos = await Aluno.find(searchQuery);
    const alunos = allAlunos.map((aluno) => ({
      nome: aluno.nome,
      cpf: aluno.cpf,
      email: aluno.email,
      matricula: aluno.matricula,
      telefone: aluno.telefone,
      periodo: aluno.periodo,
    }));

    res.json({
      alunos,
      totalPages: alunos.length > 0 ? 1 : 0,
      totalItems: alunos.length,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

// Listar alunos por nome do professor associado
export async function listarAlunosPorProfessorId(req: Request, res: Response) {
  try {
    const professorId = req.params.id;

    const professor = await Professor.findById(professorId);
    if (!professor) {
      return res.status(404).json({ error: "Professor não encontrado." });
    }

    const alunos = await Aluno.find({ professor: professor.nome });
    res.json(alunos);
  } catch (error: any) {
    res
      .status(500)
      .json({ error: "Erro ao buscar alunos por ID do professor." });
  }
}

// Atualizar dados de um aluno
export async function atualizarAluno(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { cpf, email, matricula, ...updateData } = req.body;

    // Verificar duplicidade de email, CPF e matrícula
    const alunoExistente = await Aluno.findOne({
      _id: { $ne: id },
      $or: [{ email }, { cpf }, { matricula }],
    });

    if (alunoExistente) {
      if (alunoExistente.email === email) {
        return res.status(400).send("Já existe um aluno com este email.");
      }
      if (alunoExistente.cpf === cpf) {
        return res.status(400).send("Já existe um aluno com este CPF.");
      }
      if (alunoExistente.matricula === matricula) {
        return res.status(400).send("Já existe um aluno com esta matrícula.");
      }
    }

    const alunoAtualizado = await Aluno.findByIdAndUpdate(id, updateData, {
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

// Excluir um aluno
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

// Obter o último aluno criado
export const obterUltimoAlunoCriado = async (req: Request, res: Response) => {
  try {
    const ultimoAluno = await Aluno.findOne().sort({ createdAt: -1 });
    res.json(ultimoAluno);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar o último aluno criado" });
  }
};

// Listar alunos paginados
export const listarAlunosPaginados = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string, 10) || 1;
  const limit: number = 15;

  try {
    const alunos = await Aluno.find()
      .skip((page - 1) * limit)
      .limit(limit);

    const totalItems = await Aluno.countDocuments();
    const totalPages = Math.ceil(totalItems / limit);

    res.json({
      alunos,
      totalPages,
      currentPage: page,
      totalItems,
    });
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar alunos paginados", error });
  }
};

// Deletar alunos selecionados
export const deletarAlunoSelecionados = async (req: Request, res: Response) => {
  const ids = req.params.ids.split(",");

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: "IDs inválidos fornecidos" });
  }

  try {
    const result = await Aluno.deleteMany({ _id: { $in: ids } });
    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({ message: "Nenhum aluno encontrado para deletar" });
    }
    res.status(200).json({
      message: `${result.deletedCount} alunos deletados com sucesso`,
    });
  } catch (error) {
    res.status(500).json({ message: "Erro ao deletar alunos", error });
  }
};
