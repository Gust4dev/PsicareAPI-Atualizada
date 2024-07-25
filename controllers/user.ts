import { Request, Response } from "express";
import User, { UserInterface } from "../models/user";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Aluno from "../models/aluno";
import Professor from "../models/professor";
import Secretario from "../models/secretario";

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
  const { nome, cpf, email, senha } = req.body;

  try {
    // Verificar se o cpf já existe no banco de dados
    const userExistente = await User.findOne({ cpf });
    if (userExistente) {
      return res.status(400).send("Já existe um usuário com este CPF.");
    }

    // Criptografia da senha
    const senhaCriptografada = await bcrypt.hash(senha, 10);

    // Criar novo usuário
    const novoUser: UserInterface = new User({
      nome,
      cpf,
      email,
      senha: senhaCriptografada,
    });

    // Gerar token JWT
    const token = jwt.sign({ cpf, email }, JWT_SECRET!, { expiresIn: "12h" });
    novoUser.token = token;

    await novoUser.save();
    return res
      .status(201)
      .send({ message: "Usuário criado com sucesso.", token });
  } catch (error: any) {
    console.error(error);
    return res.status(500).send("Erro ao criar o usuário.");
  }
}

// Método POST: login de usuário
export async function loginUser(req: Request, res: Response) {
  const { cpf, senha } = req.body;

  try {
    const userInDatabase = await User.findOne({ cpf }).exec();

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
    const token = jwt.sign({ cpf, email: userInDatabase.email }, JWT_SECRET!, {
      expiresIn: "12h",
    });
    userInDatabase.token = token;
    await userInDatabase.save();

    return res.status(200).json({ token });
  } catch (error: any) {
    console.error(error);
    return res.status(500).send("Erro ao realizar login.");
  }
}

// Método GET: listar todos os usuários
export async function listarUsers(req: Request, res: Response) {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: "Erro ao listar usuários." });
  }
}

// Método GET: obter usuário por ID
export const obterUserPorID = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar usuário.' });
  }
};

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

// Método DELETE: deletar usuário
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    res.status(200).json({ message: 'Usuário deletado com sucesso.' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar usuário.' });
  }
}

// Metodo para receber ultimo usuario criado
export const obterUltimoUserCriado = async (req: Request, res: Response) => {
  try {
    const ultimoUser = await User.findOne().sort({ createdAt: -1 });
    res.json(ultimoUser);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar o último usuário criado" });
  }
};

// Função para criar usuário ao criar aluno
export async function criarAlunoComUsuario(req: Request, res: Response) {
  try {
    const { matricula, periodo, nome, cpf, telefone, email } = req.body;

    // Verificar se o CPF já existe
    const alunoExistenteCPF = await Aluno.exists({ cpf });
    if (alunoExistenteCPF) {
      return res.status(400).send("Já existe um aluno com este CPF.");
    }

    // Verificar se a matrícula já existe
    const alunoExistenteMatricula = await Aluno.exists({ matricula });
    if (alunoExistenteMatricula) {
      return res.status(400).send("Já existe um aluno com esta matrícula.");
    }

    // Verificar se o email já existe
    const alunoExistenteEmail = await Aluno.exists({ email });
    if (alunoExistenteEmail) {
      return res.status(400).send("Já existe um aluno com este email.");
    }

    const newAluno = new Aluno({
      matricula,
      periodo,
      nome,
      cpf,
      telefone,
      email,
    });

    await newAluno.save();

    // Criar um usuário associado ao aluno
    const senhaPadrao = cpf.slice(0, -2); // Senha padrão: CPF menos os últimos 2 dígitos
    const newUser = new User({
      email,
      senha: await bcrypt.hash(senhaPadrao, 10),
      cargo: 1, // Definir o cargo como 1 para aluno
    });

    await newUser.save();

    res
      .status(201)
      .json({ message: "Cadastro de aluno e usuário criado com sucesso." });
  } catch (error: any) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Não foi possível criar o cadastro de aluno e usuário." });
  }
}

// Função para criar usuário ao criar professor
export async function criarProfessorComUsuario(req: Request, res: Response) {
  try {
    const { nome, cpf, telefone, email, departamento } = req.body;

    // Verificar se o CPF já existe
    const professorExistenteCPF = await Professor.exists({ cpf });
    if (professorExistenteCPF) {
      return res.status(400).send("Já existe um professor com este CPF.");
    }

    // Verificar se o email já existe
    const professorExistenteEmail = await Professor.exists({ email });
    if (professorExistenteEmail) {
      return res.status(400).send("Já existe um professor com este email.");
    }

    const newProfessor = new Professor({
      nome,
      cpf,
      telefone,
      email,
      departamento,
    });

    await newProfessor.save();

    // Criar um usuário associado ao professor
    const senhaPadrao = cpf.slice(0, -2); // Senha padrão: CPF menos os últimos 2 dígitos
    const newUser = new User({
      email,
      senha: await bcrypt.hash(senhaPadrao, 10),
      cargo: 2, // Definir o cargo como 2 para professor
    });

    await newUser.save();

    res
      .status(201)
      .json({ message: "Cadastro de professor e usuário criado com sucesso." });
  } catch (error: any) {
    console.error(error);
    res
      .status(500)
      .json({
        error: "Não foi possível criar o cadastro de professor e usuário.",
      });
  }
}
// Função para criar secretário com usuário
export async function criarSecretarioComUsuario(req: Request, res: Response) {
  try {
    const { nome, cpf, telefone, email } = req.body;

    // Verificar se o CPF já existe
    const secretarioExistenteCPF = await Secretario.exists({ cpf });
    if (secretarioExistenteCPF) {
      return res.status(400).send("Já existe um secretário com este CPF.");
    }

    // Verificar se o email já existe
    const secretarioExistenteEmail = await Secretario.exists({ email });
    if (secretarioExistenteEmail) {
      return res.status(400).send("Já existe um secretário com este email.");
    }

    const newSecretario = new Secretario({
      nome,
      cpf,
      telefone,
      email,
    });

    await newSecretario.save();

    // Criar um usuário associado ao secretário
    const senhaPadrao = cpf.slice(0, -2); // Senha padrão: CPF menos os últimos 2 dígitos
    const newUser = new User({
      email,
      senha: await bcrypt.hash(senhaPadrao, 10),
      token: jwt.sign({ cpf, email }, JWT_SECRET!, { expiresIn: "12h" }),
    });

    await newUser.save();

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
