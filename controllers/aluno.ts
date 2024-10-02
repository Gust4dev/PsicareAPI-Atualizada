import { Request, Response } from "express";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { Aluno } from "../models/aluno";
import User, { UserInterface } from "../models/user";
import Professor from "../models/professor";

// Criar um novo aluno
export async function criarAluno(req: Request, res: Response) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { matricula, periodo, nome, cpf, telefone, email, professorId } =
      req.body;

    if (
      !matricula ||
      !periodo ||
      !nome ||
      !cpf ||
      !telefone ||
      !email ||
      !professorId
    ) {
      throw new Error(
        "Todos os campos obrigatórios devem ser preenchidos: matrícula, período, nome, CPF, telefone, email e professorId."
      );
    }

    const alunoExistenteCPF = await Aluno.exists({ cpf }).session(session);
    const alunoExistenteMatricula = await Aluno.exists({ matricula }).session(
      session
    );
    const alunoExistenteEmail = await Aluno.exists({ email }).session(session);
    const usuarioExistenteEmail = await User.exists({ email }).session(session);

    if (alunoExistenteCPF) {
      throw new Error("Já existe um aluno com este CPF.");
    }

    if (alunoExistenteMatricula) {
      throw new Error("Já existe um aluno com esta matrícula.");
    }

    if (alunoExistenteEmail || usuarioExistenteEmail) {
      throw new Error("Já existe um aluno ou usuário com este email.");
    }

    const professor = await Professor.findById(professorId).session(session);
    if (!professor) {
      throw new Error("Professor não encontrado.");
    }

    const senha = cpf.slice(0, -2);
    const senhaCriptografada = await bcrypt.hash(senha, 10);

    const periodoFormatado = `${periodo}º`;

    const newAluno = new Aluno({
      matricula,
      periodo: periodoFormatado,
      nome,
      cpf,
      telefone,
      email,
      nomeProfessor: professor.nome,
      professorId: professor._id,
    });

    const novoUser = new User({
      nome,
      cpf,
      email,
      senha: senhaCriptografada,
      cargo: 3,
    });

    await newAluno.save({ session });
    await novoUser.save({ session });

    await session.commitTransaction();
    session.endSession();

    res
      .status(201)
      .json({ message: "Cadastro de aluno e usuário criado com sucesso." });
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();

    res.status(400).json({
      error:
        error.message ||
        "Não foi possível criar o cadastro de aluno e usuário.",
    });
  }
}

// Listar alunos
export const listarAlunos = async (req: Request, res: Response) => {
  const { q, nome, cpf, email, matricula, telefone, periodo, nomeProfessor } =
    req.query;
  const page = parseInt(req.query.page as string, 10) || 1;
  const limit = 15;

  try {
    const searchQuery = {
      ...(q && {
        $or: [
          { nome: { $regex: q, $options: "i" } },
          { cpf: { $regex: q, $options: "i" } },
          { email: { $regex: q, $options: "i" } },
          { matricula: { $regex: q, $options: "i" } },
          { telefone: { $regex: q, $options: "i" } },
          { periodo: { $regex: q, $options: "i" } },
          { nomeProfessor: { $regex: q, $options: "i" } },
        ],
      }),
      ...(nome && { nome: { $regex: nome, $options: "i" } }),
      ...(cpf && { cpf: { $regex: cpf, $options: "i" } }),
      ...(email && { email: { $regex: email, $options: "i" } }),
      ...(matricula && { matricula: { $regex: matricula, $options: "i" } }),
      ...(telefone && { telefone: { $regex: telefone, $options: "i" } }),
      ...(periodo && { periodo: { $regex: periodo, $options: "i" } }),
      ...(nomeProfessor && {
        nomeProfessor: { $regex: nomeProfessor, $options: "i" },
      }),
    };

    const alunos = await Aluno.find(searchQuery)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const totalItems = await Aluno.countDocuments(searchQuery);

    res.json({
      alunos,
      totalPages: Math.ceil(totalItems / limit),
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

// Listar alunos por ID do professor
export async function listarAlunosPorProfessorId(req: Request, res: Response) {
  try {
    const professorId = req.params.id;
    const page: number = parseInt(req.query.page as string, 10) || 1;
    const limit: number = 10;

    const professor = await Professor.findById(professorId);
    if (!professor) {
      return res.status(404).json({ error: "Professor não encontrado." });
    }

    const totalItems = await Aluno.countDocuments({ professorId });
    const alunos = await Aluno.find({ professorId })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    if (!alunos || alunos.length === 0) {
      return res
        .status(404)
        .json({ error: "Nenhum aluno encontrado para este professor." });
    }

    res.json({
      alunos,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
    });
  } catch (error: any) {
    res.status(500).json({
      error: "Erro ao buscar alunos por ID do professor.",
      details: error.message,
    });
  }
}

// Atualizar dados de um aluno
export async function atualizarAluno(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { cpf, email, matricula, ...updateData } = req.body;

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
