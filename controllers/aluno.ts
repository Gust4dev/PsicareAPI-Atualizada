import { Request, Response } from "express";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { Aluno } from "../models/aluno";
import User from "../models/user";
import Professor from "../models/professor";
import Paciente from "../models/Paciente";

// Criar um novo aluno
export async function criarAluno(req: Request, res: Response) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { matricula, periodo, nome, cpf, telefone, email, professorId } =
      req.body;

    const cpfFormatado = cpf.replace(/\D/g, "");

    const alunoExistenteCPF = await Aluno.exists({ cpf: cpfFormatado }).session(
      session
    );
    const usuarioExistenteCPF = await User.exists({
      cpf: cpfFormatado,
    }).session(session);
    const pacienteExistenteCPF = await Paciente.exists({
      cpf: cpfFormatado,
    }).session(session);
    const alunoExistenteEmail = await Aluno.exists({ email }).session(session);
    const usuarioExistenteEmail = await User.exists({ email }).session(session);
    const pacienteExistenteEmail = await Paciente.exists({ email }).session(
      session
    );

    if (alunoExistenteCPF || usuarioExistenteCPF || pacienteExistenteCPF) {
      throw new Error("Já existe um usuário com este CPF cadastrado.");
    }

    if (
      alunoExistenteEmail ||
      usuarioExistenteEmail ||
      pacienteExistenteEmail
    ) {
      throw new Error("Já existe um usuário com este email cadastrado.");
    }

    const professor = await Professor.findById(professorId).session(session);
    if (!professor) {
      throw new Error("Professor não encontrado.");
    }

    const senha = cpfFormatado.slice(0, -2);
    const senhaCriptografada = await bcrypt.hash(senha, 10);
    const periodoFormatado = `${periodo}º`;

    const novoAluno = new Aluno({
      matricula,
      periodo: periodoFormatado,
      nome,
      cpf: cpfFormatado,
      telefone,
      email,
      nomeProfessor: professor.nome,
      professorId: professor._id,
    });

    const novoUsuario = new User({
      nome,
      cpf: cpfFormatado,
      email,
      senha: senhaCriptografada,
      cargo: 3,
    });

    await novoAluno.save({ session });
    await novoUsuario.save({ session });

    await session.commitTransaction();
    session.endSession();

    res
      .status(201)
      .json({ message: "Cadastro de usuário criado com sucesso." });
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();

    if (error.code === 11000) {
      if (error.keyPattern?.matricula) {
        return res.status(400).json({
          error: "Já existe um aluno cadastrado com esta matrícula.",
        });
      }
    }

    res.status(400).json({
      error: error.message || "Não foi possível criar o cadastro de usuário.",
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
    const searchQuery: any = {
      ...(q && {
        $or: [
          { nome: { $regex: q, $options: "i" } },
          { cpf: { $regex: q, $options: "i" } },
          { email: { $regex: q, $options: "i" } },
          { matricula: { $regex: q, $options: "i" } },
          { telefone: { $regex: q, $options: "i" } },
          { periodo: { $regex: q, $options: "i" } },
          { nomeProfessor: { $regex: nomeProfessor, $options: "i" } },
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

    if (req.user && req.user.cargo === 2 && req.user.professorId) {
      searchQuery.professorId = req.user.professorId;
    }

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

// Atualizar aluno
export async function atualizarAluno(req: Request, res: Response) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { cpf, email, matricula, nome, ...updateData } = req.body;

    const cpfFormatado = cpf?.replace(/\D/g, "");

    const alunoExistente = await Aluno.findById(id).session(session);
    if (!alunoExistente) {
      throw new Error("Aluno não encontrado.");
    }

    if (email) {
      if (email !== alunoExistente.email) {
        const alunoExistenteEmail = await Aluno.findOne({ email }).session(
          session
        );
        const pacienteExistenteEmail = await Paciente.findOne({
          email,
        }).session(session);
        const usuarioExistenteEmail = await User.findOne({ email }).session(
          session
        );

        if (
          alunoExistenteEmail ||
          pacienteExistenteEmail ||
          usuarioExistenteEmail
        ) {
          return res.status(400).send("Já existe um usuário com este email.");
        }
      }
    }

    let senhaGerada;
    if (cpfFormatado && cpfFormatado !== alunoExistente.cpf) {
      const alunoExistenteCPF = await Aluno.findOne({
        cpf: cpfFormatado,
      }).session(session);
      const pacienteExistenteCPF = await Paciente.findOne({
        cpf: cpfFormatado,
      }).session(session);
      const usuarioExistenteCPF = await User.findOne({
        cpf: cpfFormatado,
      }).session(session);

      if (alunoExistenteCPF || pacienteExistenteCPF || usuarioExistenteCPF) {
        return res.status(400).send("Já existe um usuário com este CPF.");
      }

      senhaGerada = cpfFormatado.slice(0, -2);
    }

    const alunoAtualizado = await Aluno.findByIdAndUpdate(
      id,
      { ...updateData, email, cpf: cpfFormatado, nome },
      { new: true }
    ).session(session);

    const usuario = await User.findOne({ cpf: alunoExistente.cpf }).session(
      session
    );
    if (!usuario) {
      throw new Error("Usuário relacionado não encontrado.");
    }

    usuario.nome = nome || alunoExistente.nome;
    usuario.cpf = cpfFormatado || alunoExistente.cpf;
    usuario.email = email || alunoExistente.email;

    const novaSenha = senhaGerada || cpfFormatado?.slice(0, -2);
    if (novaSenha) {
      usuario.senha = await bcrypt.hash(novaSenha, 10);
    }

    await usuario.save({ session });
    await session.commitTransaction();
    session.endSession();

    res.json({
      message: "Aluno atualizado com sucesso.",
      aluno: alunoAtualizado,
    });
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: error.message });
  }
}

// Excluir um aluno
export async function deletarAluno(req: Request, res: Response) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;

    const aluno = await Aluno.findById(id).session(session);
    if (!aluno) {
      return res.status(404).json({ error: "Aluno não encontrado." });
    }

    const usuario = await User.findOne({ cpf: aluno.cpf }).session(session);
    if (!usuario) {
      throw new Error("Usuário associado não encontrado.");
    }

    await aluno.deleteOne({ session });
    await usuario.deleteOne({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({ message: "Usuário excluído com sucesso." });
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: "Erro ao excluir o usuário." });
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
