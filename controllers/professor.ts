import { Request, Response } from "express";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import Professor from "../models/professor";
import User from "../models/user";
import Paciente from "../models/Paciente";

// criar professor
export async function criarProfessor(req: Request, res: Response) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { nome, cpf, telefone, email, disciplina } = req.body;

    if (!nome || !cpf || !telefone || !email || !disciplina) {
      throw new Error("Por favor, preencha todos os campos obrigatórios.");
    }

    const cpfFormatado = cpf.replace(/\D/g, "");

    const [
      professorExistenteCPF,
      usuarioExistenteCPF,
      pacienteExistenteCPF,
      professorExistenteEmail,
      usuarioExistenteEmail,
      pacienteExistenteEmail,
    ] = await Promise.all([
      Professor.exists({ cpf: cpfFormatado }).session(session),
      User.exists({ cpf: cpfFormatado }).session(session),
      Paciente.exists({ cpf: cpfFormatado }).session(session),
      Professor.exists({ email }).session(session),
      User.exists({ email }).session(session),
      Paciente.exists({ email }).session(session),
    ]);

    if (
      professorExistenteEmail ||
      usuarioExistenteEmail ||
      pacienteExistenteEmail
    ) {
      throw new Error("Já existe um usuário com este email cadastrado.");
    }

    if (professorExistenteCPF || usuarioExistenteCPF || pacienteExistenteCPF) {
      throw new Error("Já existe um usuário com este CPF cadastrado.");
    }

    const novoProfessor = new Professor({
      nome,
      cpf: cpfFormatado,
      telefone,
      email,
      disciplina,
    });

    const senha = cpfFormatado.slice(0, -2);
    const senhaCriptografada = await bcrypt.hash(senha, 10);

    const novoUsuario = new User({
      nome,
      cpf: cpfFormatado,
      email,
      senha: senhaCriptografada,
      cargo: 2,
    });

    await novoProfessor.save({ session });
    await novoUsuario.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: "Cadastro de professor e usuário criado com sucesso.",
    });
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();

    res.status(400).json({
      error:
        error.message ||
        "Não foi possível criar o cadastro de professor e usuário.",
    });
  }
}

//listar todos os professores
export const listarProfessores = async (req: Request, res: Response) => {
  const { q, nome, cpf, telefone, email, disciplina } = req.query;
  const page: number = parseInt(req.query.page as string, 10) || 1;
  const limit: number = 15;

  try {
    const searchQuery = {
      ...(q && {
        $or: [
          { nome: { $regex: q, $options: "i" } },
          { cpf: { $regex: q, $options: "i" } },
          { telefone: { $regex: q, $options: "i" } },
          { email: { $regex: q, $options: "i" } },
          { disciplina: { $regex: q, $options: "i" } },
        ],
      }),
      ...(nome && { nome: { $regex: nome, $options: "i" } }),
      ...(cpf && { cpf: { $regex: cpf, $options: "i" } }),
      ...(telefone && { telefone: { $regex: telefone, $options: "i" } }),
      ...(email && { email: { $regex: email, $options: "i" } }),
      ...(disciplina && { disciplina: { $regex: disciplina, $options: "i" } }),
    };

    const professores = await Professor.find(searchQuery)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const totalItems = await Professor.countDocuments(searchQuery);
    const totalPages = Math.ceil(totalItems / limit);

    res.json({
      professores,
      totalPages,
      currentPage: page,
      totalItems,
    });
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar professores", error });
  }
};

// buscar um professor pelo ID
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

//atualizar um professor
export async function atualizarProfessor(req: Request, res: Response) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { nome, cpf, email, senha, ...updateData } = req.body;

    const professorExistente = await Professor.findById(id).session(session);
    if (!professorExistente) {
      throw new Error("Professor não encontrado.");
    }

    let cpfFormatado;
    if (cpf) {
      cpfFormatado = cpf.replace(/\D/g, "");

      const professorExistenteCPF = await Professor.findOne({
        _id: { $ne: id },
        cpf: cpfFormatado,
      }).session(session);

      const pacienteExistenteCPF = await Paciente.findOne({
        cpf: cpfFormatado,
      }).session(session);
      const usuarioExistenteCPF = await User.findOne({
        cpf: cpfFormatado,
      }).session(session);

      if (
        professorExistenteCPF ||
        pacienteExistenteCPF ||
        usuarioExistenteCPF
      ) {
        return res.status(400).send("Já existe um usuário com este CPF.");
      }

      updateData.cpf = cpfFormatado;
    }

    if (email) {
      const professorExistenteEmail = await Professor.findOne({
        _id: { $ne: id },
        email,
      }).session(session);

      const pacienteExistenteEmail = await Paciente.findOne({ email }).session(
        session
      );
      const usuarioExistenteEmail = await User.findOne({ email }).session(
        session
      );

      if (
        professorExistenteEmail ||
        pacienteExistenteEmail ||
        usuarioExistenteEmail
      ) {
        return res.status(400).send("Já existe um usuário com este email.");
      }

      updateData.email = email;
    }

    let senhaCriptografada;
    if (senha) {
      senhaCriptografada = await bcrypt.hash(senha, 10);
    }

    const professorAtualizado = await Professor.findByIdAndUpdate(
      id,
      { nome, ...updateData },
      { new: true }
    ).session(session);

    if (!professorAtualizado) {
      throw new Error("Erro ao atualizar professor.");
    }

    const usuarioExistente = await User.findOne({
      cpf: professorExistente.cpf,
    }).session(session);

    if (!usuarioExistente) {
      throw new Error("Usuário relacionado não encontrado.");
    }

    const dadosAtualizadosUsuario = {
      nome: nome || usuarioExistente.nome,
      cpf: cpfFormatado || usuarioExistente.cpf,
      email: email || usuarioExistente.email,
      ...(senha && { senha: senhaCriptografada }),
    };

    const usuarioAtualizado = await User.findByIdAndUpdate(
      usuarioExistente._id,
      dadosAtualizadosUsuario,
      { new: true }
    ).session(session);

    if (!usuarioAtualizado) {
      throw new Error("Erro ao atualizar usuário.");
    }

    await session.commitTransaction();
    session.endSession();

    res.json({
      message: "Professor atualizado com sucesso.",
      professor: professorAtualizado,
    });
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();

    if (error.code === 11000) {
      if (error.keyPattern?.cpf) {
        return res
          .status(400)
          .json({ message: "Já existe um usuário com este CPF." });
      }
      if (error.keyPattern?.email) {
        return res
          .status(400)
          .json({ message: "Já existe um usuário com este email." });
      }
    }

    res.status(400).json({
      error: error.message || "Erro ao atualizar professor e usuário.",
    });
  }
}

//listar professores para seleção
export async function getProfessoresSelect(req: Request, res: Response) {
  try {
    const professores = await Professor.find({}, "nome disciplina");
    res.json(professores);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar professores." });
  }
}

//deletar um professor
export async function deletarProfessor(req: Request, res: Response) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const professorID = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(professorID)) {
      throw new Error("ID de professor inválido.");
    }

    const professorDeletado = await Professor.findByIdAndDelete(
      professorID
    ).session(session);
    if (!professorDeletado) {
      throw new Error("Professor não encontrado.");
    }

    const usuarioDeletado = await User.findOneAndDelete({
      cpf: professorDeletado.cpf,
    }).session(session);
    if (!usuarioDeletado) {
      throw new Error("Usuário relacionado ao professor não encontrado.");
    }

    await session.commitTransaction();
    session.endSession();
    res.json({
      message: "Professor e usuário excluídos com sucesso.",
      professor: professorDeletado,
    });
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    res
      .status(400)
      .json({ error: error.message || "Erro ao excluir professor e usuário." });
  }
}

//obter o último professor criado
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

//deletar professores selecionados
export const deletarProfessorSelecionados = async (
  req: Request,
  res: Response
) => {
  const ids = req.params.ids.split(",");

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: "IDs inválidos fornecidos" });
  }

  try {
    const result = await Professor.deleteMany({ _id: { $in: ids } });
    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({ message: "Nenhum professor encontrado para deletar" });
    }
    res.status(200).json({
      message: `${result.deletedCount} professores deletados com sucesso`,
    });
  } catch (error) {
    res.status(500).json({ message: "Erro ao deletar professores", error });
  }
};
