import { Request, Response } from "express";
import Secretario from "../models/secretario";
import mongoose from "mongoose";

// Funções Secretario
// Método POST
export async function createSecretario(req: Request, res: Response) {
  const { id, nome, cpf, telefone, email, turno } = req.body;

  try {
    // Verificar se o cpf já existe no banco de dados
    const secretarioExistente = await Secretario.findOne({ cpf });
    if (secretarioExistente) {
      return res.status(400).send("Já existe um secretário com este CPF.");
    }

    // Criar novo secretário
    const novoSecretario = new Secretario({
      id,
      nome,
      cpf,
      telefone,
      email,
      turno,
    });

    await novoSecretario.save();
    return res.status(201).send("Secretário cadastrado com sucesso.");
  } catch (error: any) {
    console.error(error);
    return res.status(500).send("Erro ao cadastrar o secretário.");
  }
}

// Método GET
export async function listSecretarios(req: Request, res: Response) {
  try {
    const secretarios = await Secretario.find({});
    res.json(secretarios);
  } catch (error: any) {
    res.status(500).json({ message: "Erro ao buscar secretários." });
  }
}

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

// Método PATCH
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

// Método DELETE
export async function deleteSecretario(req: Request, res: Response) {
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

// Metodo para receber ultimo secretario criado
export const obterUltimoSecretarioCriado = async (req: Request, res: Response) => {
  try {
    const ultimoSecretario = await Secretario.findOne().sort({ createdAt: -1 });
    res.json(ultimoSecretario);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar o último secretario criado' });
  }
}

export const listarSecretarioPaginados = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string, 10) || 1;
  const limit = parseInt(req.query.limit as string, 10) || 10;

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
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar pacientes paginados', error });
  }
};