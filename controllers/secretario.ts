import { Request, Response } from "express";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import Secretario from "../models/secretario";
import User, { UserInterface } from "../models/user";

// criar secretario
export async function criarSecretario(req: Request, res: Response) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { nome, cpf, telefone, email, turno } = req.body;

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
    if (!turno) {
      throw new Error("Por favor, informe o turno de trabalho.");
    }

    const cpfFormatado = cpf.replace(/\D/g, '');

    const secretarioExistenteEmail = await Secretario.exists({ email }).session(
      session
    );

    const usuarioExistenteEmail = await User.exists({ email }).session(session);

    if (secretarioExistenteEmail || usuarioExistenteEmail) {
      throw new Error("Já existe um secretário ou usuário com este email.");
    }

    const secretarioExistenteCPF = await Secretario.exists({ cpf: cpfFormatado }).session(
      session
    );
    if (secretarioExistenteCPF) {
      throw new Error("Já existe um secretário com este CPF.");
    }

    const newSecretario = new Secretario({
      nome,
      cpf: cpfFormatado,
      telefone,
      email,
      turno,
    });

    const senha = cpfFormatado.slice(0, -2);
    const senhaCriptografada = await bcrypt.hash(senha, 10);

    const novoUser: UserInterface = new User({
      nome,
      cpf: cpfFormatado,
      email,
      senha: senhaCriptografada,
      cargo: 1,
    });

    await newSecretario.save({ session });
    await novoUser.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: "Cadastro de secretário e usuário criado com sucesso.",
    });
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();

    res.status(400).json({
      error:
        error.message ||
        "Não foi possível criar o cadastro de secretário e usuário.",
    });
  }
}

// listar secretários
export const listarSecretarios = async (req: Request, res: Response) => {
  const { q, nome, cpf, email, telefone, turno } = req.query;
  const page = parseInt(req.query.page as string, 10) || 1;
  const limit = 15;

  try {
    const searchQuery = {
      ...(q && {
        $or: [
          { nome: { $regex: q, $options: "i" } },
          { cpf: { $regex: q, $options: "i" } },
          { email: { $regex: q, $options: "i" } },
          { telefone: { $regex: q, $options: "i" } },
          { turno: { $regex: q, $options: "i" } },
        ],
      }),
      ...(nome && { nome: { $regex: nome, $options: "i" } }),
      ...(cpf && { cpf: { $regex: cpf, $options: "i" } }),
      ...(email && { email: { $regex: email, $options: "i" } }),
      ...(telefone && { telefone: { $regex: telefone, $options: "i" } }),
      ...(turno && { turno: { $regex: turno, $options: "i" } }),
    };

    const secretarios = await Secretario.find(searchQuery)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const totalItems = await Secretario.countDocuments(searchQuery);

    res.json({
      secretarios,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
      totalItems,
    });
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar secretários", error });
  }
};

// obter secretário por ID
export async function getSecretarioByID(req: Request, res: Response) {
  try {
    const secretarioID = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(secretarioID)) {
      return res.status(400).send("ID de secretário inválido.");
    }
    const secretario = await Secretario.findById(secretarioID);
    if (!secretario) {
      return res.status(404).send("Secretário não encontrado.");
    }
    res.json(secretario);
  } catch (error: any) {
    res.status(500).json({ message: "Erro ao buscar secretário." });
  }
}

// atualizar secretário
export async function atualizarSecretario(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { cpf, email, ...updateData } = req.body;

    const secretarioExistente = await Secretario.findOne({
      _id: { $ne: id },
      $or: [{ email }, { cpf }],
    });

    const usuarioExistenteEmail = await User.findOne({ email });

    if (secretarioExistente || usuarioExistenteEmail) {
      if (secretarioExistente?.email === email || usuarioExistenteEmail) {
        return res
          .status(400)
          .send("Já existe um secretário ou usuário com este email.");
      }
      if (secretarioExistente?.cpf === cpf) {
        return res.status(400).send("Já existe um secretário com este CPF.");
      }
    }

    const secretarioAtualizado = await Secretario.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
      }
    );

    if (!secretarioAtualizado) {
      return res.status(404).send("Secretário não encontrado");
    }

    res.json(secretarioAtualizado);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

// deletar secretário
export async function deletarSecretario(req: Request, res: Response) {
  try {
    const secretarioID = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(secretarioID)) {
      return res.status(400).send("ID de secretário inválido.");
    }

    const secretarioEncontrado = await Secretario.findById(secretarioID);
    if (!secretarioEncontrado) {
      return res.status(404).json({ error: "Secretário não encontrado." });
    }

    await Secretario.findByIdAndDelete(secretarioID);

    return res.json({
      message: "Secretário excluído com sucesso.",
      secretario: secretarioEncontrado,
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: "Erro interno do servidor." });
  }
}

// obter o último secretário criado
export const obterUltimoSecretarioCriado = async (
  req: Request,
  res: Response
) => {
  try {
    const ultimoSecretario = await Secretario.findOne().sort({ createdAt: -1 });
    res.json(ultimoSecretario);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erro ao buscar o último secretario criado" });
  }
};

// listar secretários paginados
export const listarSecretarioPaginados = async (
  req: Request,
  res: Response
) => {
  const page = parseInt(req.query.page as string, 10) || 1;
  const limit: number = 15;

  try {
    const secretarios = await Secretario.find()
      .skip((page - 1) * limit)
      .limit(limit);

    const totalItems = await Secretario.countDocuments();
    const totalPages = Math.ceil(totalItems / limit);

    res.json({
      secretarios,
      totalPages,
      currentPage: page,
      totalItems,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erro ao buscar secretarios paginados", error });
  }
};

// deletar secretários selecionados
export const deletarSecretariosSelecionados = async (
  req: Request,
  res: Response
) => {
  const ids = req.params.ids.split(",");

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: "IDs inválidos fornecidos" });
  }

  try {
    const result = await Secretario.deleteMany({ _id: { $in: ids } });
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
