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

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

if (!JWT_SECRET) {
  console.error("JWT_SECRET não definido no arquivo .env");
  process.exit(1);
}

// Criar usuário
export async function createUser(req: Request, res: Response) {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { nome, cpf, telefone, email, senha, cargo } = req.body;

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
    if (!cargo) {
      throw new Error("Por favor, informe o cargo.");
    }

    const cpfFormatado = cpf.replace(/\D/g, "");

    const usuarioExistenteCPF = await User.exists({
      cpf: cpfFormatado,
    }).session(session);
    if (usuarioExistenteCPF) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).send("Este CPF já está registrado.");
    }

    const usuarioExistenteEmail = await User.exists({ email }).session(session);
    if (usuarioExistenteEmail) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).send("Este email já está registrado.");
    }

    const senhaPadrao = senha || cpfFormatado.slice(0, -2);
    const senhaCriptografada = await bcrypt.hash(senhaPadrao, 10);

    const newUser = new User({
      nome,
      cpf: cpfFormatado,
      telefone,
      email,
      senha: senhaCriptografada,
      cargo,
    });

    await newUser.save({ session });
    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ message: "Usuário criado com sucesso." });
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();

    console.error("Erro ao criar usuário:", error);
    res
      .status(500)
      .json({ error: "Erro ao criar usuário. Por favor, tente novamente." });
  }
}

// Login de usuário
export async function loginUser(req: Request, res: Response) {
  const { cpf, email, senha } = req.body;

  try {
    const userInDatabase = await User.findOne({ email }).exec();
    if (!userInDatabase) {
      return res.status(400).send("Usuário não encontrado.");
    }
    const isSenhaValida = await bcrypt.compare(senha, userInDatabase.senha);
    if (!isSenhaValida) {
      return res.status(400).send("Senha incorreta.");
    }

    const tokenPayload: any = {
      cpf,
      email: userInDatabase.email,
      cargo: userInDatabase.cargo,
    };

    if (userInDatabase.cargo === 3) {
      const aluno = await Aluno.findOne({ email: userInDatabase.email }).exec();
      tokenPayload.termo = aluno?.termo || false;
    }

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: "12h" });

    return res
      .status(200)
      .json({
        token,
        userLevelAccess: userInDatabase.cargo,
        ...(userInDatabase.cargo === 3 && { termo: tokenPayload.termo }),
      });
  } catch (error: any) {
    console.error("Erro ao realizar login:", error);
    return res.status(500).send("Erro ao realizar login.");
  }
}


// Listar todos os usuários
export async function listarUsers(req: Request, res: Response) {
  const { q, nome, cpf, telefone, email } = req.query;
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
        ],
      }),
      ...(nome && { nome: { $regex: nome, $options: "i" } }),
      ...(cpf && { cpf: { $regex: cpf, $options: "i" } }),
      ...(telefone && { telefone: { $regex: telefone, $options: "i" } }),
      ...(email && { email: { $regex: email, $options: "i" } }),
    };

    const users = await User.find(searchQuery)
      .skip((page - 1) * limit)
      .limit(limit)
      .select("-senha")
      .lean();

    const totalItems = await User.countDocuments(searchQuery);
    const totalPages = Math.ceil(totalItems / limit);

    res.json({
      users,
      totalPages,
      currentPage: page,
      totalItems,
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: "Erro ao listar usuários.", error });
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

    if (req.body.senha) {
      const salt = await bcrypt.genSalt(10);
      req.body.senha = await bcrypt.hash(req.body.senha, salt);
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

//Atualizar informacoes pessoais
export async function updateSelfUser(req: Request, res: Response) {
  try {
    const email = req.user?.email;
    if (!email) {
      return res.status(400).send("Usuário não autenticado.");
    }
    const updateData = { ...req.body };
    if (updateData.senha) {
      const salt = await bcrypt.genSalt(10);
      updateData.senha = await bcrypt.hash(updateData.senha, salt);
    }
    const updatedUser = await User.findOneAndUpdate({ email }, updateData, { new: true });
    if (!updatedUser) {
      return res.status(404).send("Usuário não encontrado.");
    }
    res.json(updatedUser);
  } catch (error: any) {
    res.status(500).json({ message: "Erro ao atualizar informações.", error: error.message });
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

    const alunoExistenteCPF = await Aluno.exists({ cpf });
    if (alunoExistenteCPF) {
      return res.status(400).send("Já existe um aluno com este CPF.");
    }

    const alunoExistenteMatricula = await Aluno.exists({ matricula });
    if (alunoExistenteMatricula) {
      return res.status(400).send("Já existe um aluno com esta matrícula.");
    }

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

    const senhaPadrao = cpf.slice(0, -2);
    const newUser = new User({
      email,
      senha: await bcrypt.hash(senhaPadrao, 10),
      cargo: 3,
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

    const professorExistenteCPF = await Professor.exists({ cpf });
    if (professorExistenteCPF) {
      return res.status(400).send("Já existe um professor com este CPF.");
    }

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

    const senhaPadrao = cpf.slice(0, -2);
    const newUser = new User({
      email,
      senha: await bcrypt.hash(senhaPadrao, 10),
      cargo: 2,
    });

    await newUser.save();

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

    const secretarioExistenteCPF = await Secretario.exists({ cpf });
    if (secretarioExistenteCPF) {
      return res
        .status(400)
        .json({ message: "Já existe um secretário com este CPF." });
    }

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

    const senhaPadrao = cpf.slice(0, -2);
    const senhaHash = await bcrypt.hash(senhaPadrao, 10);
    const newUser = new User({
      email,
      senha: senhaHash,
      cargo: 1,
    });

    await newUser.save();

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

    const pacienteExistenteCPF = await Paciente.exists({ cpf });
    if (pacienteExistenteCPF) {
      return res
        .status(400)
        .json({ message: "Já existe um paciente com este CPF." });
    }

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

    const senhaPadrao = cpf.slice(0, -2);
    const senhaHash = await bcrypt.hash(senhaPadrao, 10);
    const newUser = new User({
      email,
      senha: senhaHash,
      cargo: 4,
    });

    await newUser.save();

    res
      .status(201)
      .json({ message: "Cadastro de paciente e usuário criado com sucesso." });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: "Erro ao criar paciente e usuário." });
  }
}
