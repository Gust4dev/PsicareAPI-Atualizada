import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Aluno from "../models/aluno";
import User, { UserInterface } from "../models/user";
import Professor from "../models/professor";

// Carregar as variáveis de ambiente do arquivo .env
dotenv.config();

// Obter o valor de JWT_SECRET do arquivo .env
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("JWT_SECRET não definido no arquivo .env");
  process.exit(1);
}

export async function criarAluno(req: Request, res: Response) {
  try {
    const {
      matricula,
      periodo,
      nome,
      cpf,
      telefone,
      email,
      senha,
    } = req.body;

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

    await newAluno.save();
    await novoUser.save();

    res.status(201).json({ message: "Cadastro de aluno e usuário criado com sucesso." });
  } catch (error: any) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Não foi possível criar o cadastro de aluno e usuário." });
  }
}

export const listarAlunos = async (req: Request, res: Response) => {
  const { q } = req.query;
  const page: number = parseInt(req.query.page as string, 10) || 1;
  const limit: number = 15;

  try {
    const searchQuery = q ? { nome: { $regex: q, $options: "i" } } : {};
    const alunos = await Aluno.find(searchQuery)
      .skip((page - 1) * limit)
      .limit(limit);

    const totalItems = await Aluno.countDocuments(searchQuery);
    const totalPages = Math.ceil(totalItems / limit);

    res.json({
      alunos,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar alunos", error });
  }
};

export async function obterAlunoPorID(req: Request, res: Response) {
  try {
    const alunoData = await Aluno.findById(req.params.id);
    if (!alunoData) {
      return res.status(404).send("Aluno não encontrado");
    }
    res.json(alunoData);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export async function listarNomesAlunos(req: Request, res: Response) {
  try {
    const alunos = await Aluno.find({}, "nome");
    res.json(alunos);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export async function listarAlunosPorProfessorNome(req: Request, res: Response) {
  try {
    const professorNome = req.params.professorNome;

    const professor = await Professor.findOne({ nome: professorNome });
    
    if (!professor) {
      return res.status(404).json({ error: "Professor não encontrado." });
    }
    
    const alunos = await Aluno.find({ professorID: professor._id });
    res.json(alunos);
  } catch (error: any) {
    res
      .status(500)
      .json({ error: "Erro ao buscar alunos por nome do professor." });
  }
}

export async function atualizarAluno(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { cpf, email, matricula, ...updateData } = req.body;

    // Verificar duplicidade de email e matrícula
    const alunoExistente = await Aluno.findOne({
      _id: { $ne: id },
      $or: [{ email }, { cpf }, { matricula }],
    });

    if (alunoExistente) {
      if (alunoExistente.email === email) {
        return res.status(400).send("Já existe um aluno com este email.");
      }
      if (alunoExistente.cpf === cpf) {
        return res.status(400).send("Já existe um aluno com este CPF.");
      }
      if (alunoExistente.matricula === matricula) {
        return res.status(400).send("Já existe um aluno com esta matrícula.");
      }
    }

    const alunoAtualizado = await Aluno.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!alunoAtualizado) {
      return res.status(404).send("Aluno não encontrado");
    }

    res.json(alunoAtualizado);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export async function deletarAluno(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const alunoEncontrado = await Aluno.findById(id);

    if (!alunoEncontrado) {
      return res.status(404).json({ error: "Aluno não encontrado" });
    }

    const alunoExcluido = await Aluno.findByIdAndDelete(id);
    return res.json({
      message: "Aluno excluído com sucesso",
      aluno: alunoExcluido,
    });
  } catch (error: any) {
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

// Metodo para receber ultimo aluno criado
export const obterUltimoAlunoCriado = async (req: Request, res: Response) => {
  try {
    const ultimoAluno = await Aluno.findOne().sort({ createdAt: -1 });
    res.json(ultimoAluno);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar o último aluno criado" });
  }
};

export const listarAlunosPaginados = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string, 10) || 1;
  const limit: number = 15;

  try {
    const alunos = await Aluno.find()
      .skip((page - 1) * limit)
      .limit(limit);

    const totalItems = await Aluno.countDocuments();
    const totalPages = Math.ceil(totalItems / limit);

    res.json({
      alunos,
      totalPages,
      currentPage: page,
      totalItems,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erro ao buscar alunos paginados", error });
  }
};


export const deletarAlunoSelecionados = async (req: Request, res: Response) => {
  const { ids } = req.body;

  if (!ids || !Array.isArray(ids)) {
    return res.status(400).json({ message: "IDs inválidos fornecidos" });
  }
  try {
    const result = await Aluno.deleteMany({ _id: { $in: ids } });
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
