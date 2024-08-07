import { Request, Response } from "express";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import Secretario from "../models/secretario";
import User, { UserInterface } from "../models/user";

// Método POST
export async function criarSecretario(req: Request, res: Response) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { nome, cpf, telefone, email, turno } = req.body;

    // Verificar se o email já existe
    const secretarioExistenteEmail = await Secretario.exists({ email }).session(
      session
    );
    if (secretarioExistenteEmail) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).send("Já existe um secretário com este email.");
    }

    // Verificar se o CPF já existe
    const secretarioExistenteCPF = await Secretario.exists({ cpf }).session(
      session
    );
    if (secretarioExistenteCPF) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).send("Já existe um secretário com este CPF.");
    }

    // Criação do novo secretário
    const newSecretario = new Secretario({
      nome,
      cpf,
      telefone,
      email,
      turno,
    });

    // Geração automática da senha a partir do CPF
    const senha = cpf.slice(0, -2);
    const senhaCriptografada = await bcrypt.hash(senha, 10);

    // Criar novo usuário vinculado ao secretário
    const novoUser: UserInterface = new User({
      nome,
      cpf,
      email,
      senha: senhaCriptografada,
      cargo: 1, // Cargo de secretário
    });

    // Salvar secretário e usuário no banco de dados
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
    console.error(error);
    res.status(500).json({
      error: "Não foi possível criar o cadastro de secretário e usuário.",
    });
  }
}

// Método GET para listar secretários
export const listSecretarios = async (req: Request, res: Response) => {
  const { q } = req.query;
  const page: number = parseInt(req.query.page as string, 10) || 1;
  const limit: number = 15;

  try {
    const searchQuery = q ? { nome: { $regex: q, $options: "i" } } : {};

    const secretarios = await Secretario.find(searchQuery)
      .skip((page - 1) * limit)
      .limit(limit);

    const totalItems = await Secretario.countDocuments(searchQuery);
    const totalPages = Math.ceil(totalItems / limit);

    res.json({
      secretarios,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar secretários", error });
  }
};

// Método GET para obter secretário por ID
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

// Método PUT para atualizar secretário
export async function atualizarSecretario(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { cpf, email, ...updateData } = req.body;

    // Verificar se o email já existe
    const secretarioExistenteEmail = await Secretario.exists({
      email,
      _id: { $ne: id },
    });
    if (secretarioExistenteEmail) {
      return res.status(400).send("Já existe um secretário com este email.");
    }

    // Verificar se o CPF já existe
    const secretarioExistenteCPF = await Secretario.exists({
      cpf,
      _id: { $ne: id },
    });
    if (secretarioExistenteCPF) {
      return res.status(400).send("Já existe um secretário com este CPF.");
    }

    const secretarioAtualizado = await Secretario.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!secretarioAtualizado) {
      return res.status(404).send("Secretário não encontrado");
    }

    res.json(secretarioAtualizado);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

// Método PATCH para atualizar parcialmente um secretário
export async function updateSecretario(req: Request, res: Response) {
  try {
    const secretarioID = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(secretarioID)) {
      return res.status(400).send("ID de secretário inválido.");
    }
    const secretarioAtualizado = await Secretario.findByIdAndUpdate(
      secretarioID,
      req.body,
      { new: true }
    );
    if (!secretarioAtualizado) {
      return res.status(404).send("Secretário não encontrado.");
    }
    res.json(secretarioAtualizado);
  } catch (error: any) {
    res.status(500).json({ message: "Erro ao atualizar secretário." });
  }
}

// Método DELETE para deletar secretário
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

// Método para obter o último secretário criado
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

// Método para listar secretários paginados
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

// Método para deletar secretários selecionados
export const deletarSecretariosSelecionados = async (
  req: Request,
  res: Response
) => {
  const ids = req.params.ids.split(","); // IDs enviados via req.params como string, separados por vírgula

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
