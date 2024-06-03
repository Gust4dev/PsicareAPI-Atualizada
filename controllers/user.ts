import { Request, Response } from "express";
import User from "../models/user";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import dotenv from "dotenv";

// Carregar as variáveis de ambiente do arquivo .env
dotenv.config();

// Obter o valor de JWT_SECRET do arquivo .env
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("JWT_SECRET não definido no arquivo .env");
  process.exit(1);
}

// Funções User
// Método POST: criar usuário
export async function createUser(req: Request, res: Response) {
  const {
    nome,
    cpf,
    role,
    matricula,
    periodoCursado,
    disciplina,
    idOrientador,
    disciplinaMinistrada,
    idSecretaria,
    senha,
    cargo,
    arquivado,
  } = req.body;

  try {
    // Verificar se o cpf já existe no banco de dados
    const userExistente = await User.findOne({ cpf });
    if (userExistente) {
      return res.status(400).send("Já existe um usuário com este CPF.");
    }

    // Criptografia da senha
    const senhaCriptografada = await bcrypt.hash(senha, 10);

    // Criar novo usuário
    const novoUser = new User({
      nome,
      cpf,
      role,
      matricula,
      periodoCursado,
      disciplina,
      idOrientador,
      disciplinaMinistrada,
      idSecretaria,
      senha: senhaCriptografada,
      cargo,
      arquivado,
    });

    await novoUser.save();
    return res.status(201).send("Usuário criado com sucesso.");
  } catch (error: any) {
    console.error(error);
    return res.status(500).send("Erro ao criar o usuário.");
  }
}

// Método POST: login de usuário
export async function loginUser(req: Request, res: Response) {
  const { cpf, senha } = req.body;

  try {
    const userInDatabase = await User.findOne({ cpf }).lean();

    // Verificar se o usuário existe no banco de dados
    if (!userInDatabase) {
      return res.status(400).send("Usuário não encontrado.");
    }

    // Comparar a senha fornecida com a senha criptografada armazenada no banco de dados
    const isSenhaValida = await bcrypt.compare(senha, userInDatabase.senha);
    if (!isSenhaValida) {
      return res.status(400).send("Senha incorreta.");
    }

    // Gerar token JWT
    const token = jwt.sign({ cpf }, JWT_SECRET!, { expiresIn: "1h" });
    return res.status(200).send({
      auth: true,
      token,
      user: userInDatabase,
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).send("Erro ao realizar login.");
  }
}

// Método GET: listar usuários
export async function listarUsers(req: Request, res: Response) {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ message: "Erro ao buscar usuários." });
  }
}

// Método GET: obter usuário por ID
export async function obterUserPorID(req: Request, res: Response) {
  try {
    const userID = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(userID)) {
      return res.status(400).send("ID de usuário inválido.");
    }
    const user = await User.findById(userID);
    if (!user) {
      return res.status(404).send("Usuário não encontrado.");
    }
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: "Erro ao buscar usuário." });
  }
}

// Método PATCH: atualizar usuário
export async function patchUser(req: Request, res: Response) {
  try {
    const userID = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(userID)) {
      return res.status(400).send("ID de usuário inválido.");
    }
    const userAtualizado = await User.findByIdAndUpdate(userID, req.body, {
      new: true,
    });
    if (!userAtualizado) {
      return res.status(404).send("Usuário não encontrado.");
    }
    res.json(userAtualizado);
  } catch (error: any) {
    res.status(500).json({ message: "Erro ao atualizar usuário." });
  }
}

// Método PATCH: atualizar status arquivado
export async function atualizarStatusArquivado(req: Request, res: Response) {
  try {
    const userID = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(userID)) {
      return res.status(400).send("ID de usuário inválido.");
    }
    const { arquivado } = req.body;
    const userAtualizado = await User.findByIdAndUpdate(userID, { arquivado }, { new: true });
    if (!userAtualizado) {
      return res.status(404).send("Usuário não encontrado.");
    }
    res.json(userAtualizado);
  } catch (error: any) {
    res.status(500).json({
      message: "Erro ao atualizar o status de arquivado do usuário.",
    });
  }
}

// Método DELETE: deletar usuário
export async function deleteUser(req: Request, res: Response) {
  try {
    const userID = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(userID)) {
      return res.status(400).send("ID de usuário inválido.");
    }

    const userEncontrado = await User.findById(userID);
    if (!userEncontrado) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    await User.findByIdAndDelete(userID);

    return res.json({
      message: "Usuário excluído com sucesso.",
      user: userEncontrado,
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: "Erro interno do servidor." });
  }
}
