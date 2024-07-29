import { Request, Response } from "express";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Secretario from "../models/secretario";
import User, { UserInterface } from "../models/user";

// Carregar as variáveis de ambiente do arquivo .env
dotenv.config();

// Obter o valor de JWT_SECRET do arquivo .env
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("JWT_SECRET não definido no arquivo .env");
  process.exit(1);
}

// Funções Secretario
// Método POST
export async function criarSecretario(req: Request, res: Response) {
  try {
    const { nome, cpf, telefone, email, turno, senha } = req.body;

    // Verificar se o email já existe
    const secretarioExistenteEmail = await Secretario.exists({ email });
    if (secretarioExistenteEmail) {
      return res.status(400).send("Já existe um secretário com este email.");
    }

    // Verificar se o CPF já existe
    const secretarioExistenteCPF = await Secretario.exists({ cpf });
    if (secretarioExistenteCPF) {
      return res.status(400).send("Já existe um secretário com este CPF.");
    }

    const newSecretario = new Secretario({
      nome,
      cpf,
      telefone,
      email,
      turno,
    });

    // Criptografia da senha
    const senhaCriptografada = await bcrypt.hash(senha, 10);

    // Criar novo usuário
    const novoUser: UserInterface = new User({
      nome,
      cpf,
      email,
      senha: senhaCriptografada,
    });

    await newSecretario.save();
    await novoUser.save();

    res
      .status(201)
      .json({
        message: "Cadastro de secretário e usuário criado com sucesso.",
      });
  } catch (error: any) {
    console.error(error);
    res
      .status(500)
      .json({
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
  const { ids } = req.body; // array enviado pelo front

  if (!ids || !Array.isArray(ids)) {
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
