import { Request, Response } from "express";
import User from "../models/user";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { Aluno } from "../models/aluno";
import Professor from "../models/professor";
import Secretario from "../models/secretario";
import Paciente from "../models/Paciente";

// Carregar as variáveis de ambiente do arquivo .env

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

if (!JWT_SECRET) {
  console.error("JWT_SECRET não definido no arquivo .env");
  process.exit(1);
}

// Criar usuário
export async function createUser(req: Request, res: Response) {
  const { nome, cpf, telefone, email, senha, cargo } = req.body;

  try {
    // Gerar senha padrão usando o CPF menos os últimos dois dígitos se a senha não for fornecida
    const senhaPadrao = senha || cpf.slice(0, -2);

    // Criptografar a senha
    const senhaCriptografada = await bcrypt.hash(senhaPadrao, 10);

    // Criar novo usuário
    const newUser = new User({
      nome,
      cpf,
      telefone,
      email,
      senha: senhaCriptografada,
      cargo,
    });

    // Salvar no banco de dados
    await newUser.save();

    // Retornar resposta de sucesso
    res.status(201).json(newUser);
  } catch (error: any) {
    console.error("Erro ao criar usuário:", error);
    res.status(500).send("Erro ao criar usuário.");
  }
}

// Login de usuário
export async function loginUser(req: Request, res: Response) {
  const { cpf, email, senha } = req.body;

  try {
    // Buscar usuário por email
    const userInDatabase = await User.findOne({ email }).exec();
    if (!userInDatabase) {
      return res.status(400).send("Usuário não encontrado.");
    }

    const isSenhaValida = await bcrypt.compare(senha, userInDatabase.senha);
    if (!isSenhaValida) {
      return res.status(400).send("Senha incorreta.");
    }

    // Gerar token JWT incluindo a cargo
    const token = jwt.sign(
      { cpf, email: userInDatabase.email, cargo: userInDatabase.cargo },
      JWT_SECRET,
      {
        expiresIn: "12h",
      }
    );
    userInDatabase.token = token;
    await userInDatabase.save();

    // Enviar token
    return res.status(200).json({ token });
  } catch (error: any) {
    console.error("Erro ao realizar login:", error);
    return res.status(500).send("Erro ao realizar login.");
  }
}

// Listar todos os usuários
export async function listarUsers(req: Request, res: Response) {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: "Erro ao listar usuários." });
  }
}

// Obter usuário por ID
export const obterUserPorID = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar usuário." });
  }
};

// Atualizar usuário
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

// Deletar usuário
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    res.status(200).json({ message: "Usuário deletado com sucesso." });
  } catch (error) {
    res.status(500).json({ error: "Erro ao deletar usuário." });
  }
};

// Obter último usuário criado
export const obterUltimoUserCriado = async (req: Request, res: Response) => {
  try {
    const ultimoUser = await User.findOne().sort({ createdAt: -1 });
    res.json(ultimoUser);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar o último usuário criado" });
  }
};

// Criar aluno com usuário
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

    // Criar usuário associado ao aluno
    const senhaPadrao = cpf.slice(0, -2); // Senha padrão: CPF menos os últimos 2 dígitos
    const newUser = new User({
      email,
      senha: await bcrypt.hash(senhaPadrao, 10),
      cargo: 3, // Definir o cargo como 3 para aluno
    });

    await newUser.save();

    res
      .status(201)
      .json({ message: "Cadastro de aluno e usuário criado com sucesso." });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: "Erro ao criar aluno e usuário." });
  }
}

// Criar professor com usuário
export async function criarProfessorComUsuario(req: Request, res: Response) {
  try {
    const { nome, cpf, email, telefone, especialidade } = req.body;

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
      especialidade,
    });

    await newProfessor.save();

    // Criar usuário associado ao professor
    const senhaPadrao = cpf.slice(0, -2); // Senha padrão: CPF menos os últimos 2 dígitos
    const newUser = new User({
      email,
      senha: await bcrypt.hash(senhaPadrao, 10),
      cargo: 2, // Definir o cargo como 2 para professor
    });

    // Salvar o novo usuário
    await newUser.save();

    // Retornar resposta de sucesso
    res
      .status(201)
      .json({ message: "Cadastro de professor e usuário criado com sucesso." });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({
      error: "Não foi possível criar o cadastro de professor e usuário.",
    });
  }
}
// Criar secretário com usuário
export async function criarSecretarioComUsuario(req: Request, res: Response) {
  try {
    const { nome, cpf, email, telefone } = req.body;

    // Verificar se o CPF já existe
    const secretarioExistenteCPF = await Secretario.exists({ cpf });
    if (secretarioExistenteCPF) {
      return res
        .status(400)
        .json({ message: "Já existe um secretário com este CPF." });
    }

    // Verificar se o email já existe
    const secretarioExistenteEmail = await Secretario.exists({ email });
    if (secretarioExistenteEmail) {
      return res
        .status(400)
        .json({ message: "Já existe um secretário com este email." });
    }

    const newSecretario = new Secretario({
      nome,
      cpf,
      telefone,
      email,
    });

    await newSecretario.save();

    // Criar usuário associado ao secretário
    const senhaPadrao = cpf.slice(0, -2); // Senha padrão: CPF menos os últimos 2 dígitos
    const senhaHash = await bcrypt.hash(senhaPadrao, 10);
    const newUser = new User({
      email,
      senha: senhaHash,
      cargo: 1, // Definir o cargo como 1 para secretário
    });

    // Salvar o novo usuário
    await newUser.save();

    // Retornar resposta de sucesso
    res.status(201).json({
      message: "Cadastro de secretário e usuário criado com sucesso.",
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: "Erro ao criar secretário e usuário." });
  }
}
// Criar paciente com usuário
export async function criarPacienteComUsuario(req: Request, res: Response) {
  try {
    const { nome, cpf, email, telefone } = req.body;

    // Verificar se o CPF já existe
    const pacienteExistenteCPF = await Paciente.exists({ cpf });
    if (pacienteExistenteCPF) {
      return res
        .status(400)
        .json({ message: "Já existe um paciente com este CPF." });
    }

    // Verificar se o email já existe
    const pacienteExistenteEmail = await Paciente.exists({ email });
    if (pacienteExistenteEmail) {
      return res
        .status(400)
        .json({ message: "Já existe um paciente com este email." });
    }

    const newPaciente = new Paciente({
      nome,
      cpf,
      telefone,
      email,
    });

    await newPaciente.save();

    // Criar usuário associado ao paciente
    const senhaPadrao = cpf.slice(0, -2); // Senha padrão: CPF menos os últimos 2 dígitos
    const senhaHash = await bcrypt.hash(senhaPadrao, 10);
    const newUser = new User({
      email,
      senha: senhaHash,
      cargo: 4, // Definir o cargo como 4 para paciente
    });

    // Salvar o novo usuário
    await newUser.save();

    // Retornar resposta de sucesso
    res
      .status(201)
      .json({ message: "Cadastro de paciente e usuário criado com sucesso." });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: "Erro ao criar paciente e usuário." });
  }
}
