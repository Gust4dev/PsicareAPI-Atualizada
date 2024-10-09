import { Request, Response } from "express";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import Professor from "../models/professor";
import User, { UserInterface } from "../models/user";

// criar professor
export async function criarProfessor(req: Request, res: Response) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { nome, cpf, telefone, email, disciplina } = req.body;

    if (!nome) {
      throw new Error("Por favor, informe o nome completo.");
    }
    if (!cpf) {
      throw new Error("Por favor, informe o CPF.");
    }
    if (!telefone) {
      throw new Error("Por favor, informe o telefone.");
    }
    if (!email) {
      throw new Error("Por favor, informe o email.");
    }
    if (!disciplina) {
      throw new Error("Por favor, informe a disciplina.");
    }

    const cpfFormatado = cpf.replace(/\D/g, "");

    const professorExistenteEmail = await Professor.exists({ email }).session(
      session
    );
    const usuarioExistenteEmail = await User.exists({ email }).session(session);

    if (professorExistenteEmail || usuarioExistenteEmail) {
      throw new Error("Já existe um professor ou usuário com este email.");
    }

    const professorExistenteCPF = await Professor.exists({
      cpf: cpfFormatado,
    }).session(session);
    if (professorExistenteCPF) {
      throw new Error("Já existe um professor com este CPF.");
    }

    const newProfessor = new Professor({
      nome,
      cpf: cpfFormatado,
      telefone,
      email,
      disciplina,
    });

    const senha = cpfFormatado.slice(0, -2);
    const senhaCriptografada = await bcrypt.hash(senha, 10);

    const novoUser = new User({
      nome,
      cpf: cpfFormatado,
      email,
      senha: senhaCriptografada,
      cargo: 2,
    });

    await newProfessor.save({ session });
    await novoUser.save({ session });

    await session.commitTransaction();
    session.endSession();

    res
      .status(201)
      .json({ message: "Cadastro de professor e usuário criado com sucesso." });
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
  try {
    const { id } = req.params;
    const { cpf, email, ...updateData } = req.body;

    const professorExistente = await Professor.findOne({
      _id: { $ne: id },
      $or: [{ email }, { cpf }],
    });

    const usuarioExistenteEmail = await User.findOne({ email });

    if (professorExistente || usuarioExistenteEmail) {
      if (professorExistente?.email === email || usuarioExistenteEmail) {
        return res
          .status(400)
          .send("Já existe um professor ou usuário com este email.");
      }
      if (professorExistente?.cpf === cpf) {
        return res.status(400).send("Já existe um professor com este CPF.");
      }
    }

    const professorAtualizado = await Professor.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
      }
    );

    if (!professorAtualizado) {
      return res.status(404).send("Professor não encontrado");
    }

    res.json(professorAtualizado);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
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
