import { Request, Response } from "express";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import Professor from "../models/professor";
import User, { UserInterface } from "../models/user";

// Carregar as variáveis de ambiente do arquivo .env
dotenv.config();

// Obter o valor de JWT_SECRET do arquivo .env
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("JWT_SECRET não definido no arquivo .env");
  process.exit(1);
}

export async function criarProfessor(req: Request, res: Response) {
  try {
    const { nome, cpf, telefone, email, disciplina, senha } = req.body;

    // Verificar se o email já existe
    const professorExistenteEmail = await Professor.exists({ email });
    if (professorExistenteEmail) {
      return res.status(400).send("Já existe um professor com este email.");
    }

    // Verificar se o CPF já existe
    const professorExistenteCPF = await Professor.exists({ cpf });
    if (professorExistenteCPF) {
      return res.status(400).send("Já existe um professor com este CPF.");
    }

    const newProfessor = new Professor({
      nome,
      cpf,
      telefone,
      email,
      disciplina,
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

    await newProfessor.save();
    await novoUser.save();

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

export const listarProfessores = async (req: Request, res: Response) => {
  const { q } = req.query;
  const page: number = parseInt(req.query.page as string, 10) || 1;
  const limit: number = 15;

  try {
    const searchQuery = q ? { nome: { $regex: q, $options: "i" } } : {};
    const professores = await Professor.find(searchQuery)
      .skip((page - 1) * limit)
      .limit(limit);

    const totalItems = await Professor.countDocuments(searchQuery);
    const totalPages = Math.ceil(totalItems / limit);

    res.json({
      professores,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar professores", error });
  }
};

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

export async function atualizarProfessor(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { cpf, email, ...updateData } = req.body;

    // Verificar se o email já existe
    const professorExistenteEmail = await Professor.exists({
      email,
      _id: { $ne: id },
    });
    if (professorExistenteEmail) {
      return res.status(400).send("Já existe um professor com este email.");
    }

    // Verificar se o CPF já existe
    const professorExistenteCPF = await Professor.exists({
      cpf,
      _id: { $ne: id },
    });
    if (professorExistenteCPF) {
      return res.status(400).send("Já existe um professor com este CPF.");
    }

    const professorAtualizado = await Professor.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!professorAtualizado) {
      return res.status(404).send("Professor não encontrado");
    }

    res.json(professorAtualizado);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export async function getProfessoresSelect(req: Request, res: Response) {
  try {
    const professores = await Professor.find({}, "nome disciplina");
    res.json(professores);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar professores." });
  }
}

export async function patchProfessor(req: Request, res: Response) {
  try {
    const { nome, cpf, telefoneContato, email, disciplina } = req.body;
    const updatedProfessor = await Professor.findByIdAndUpdate(
      req.params.id,
      { nome, cpf, telefoneContato, email, disciplina },
      { new: true }
    );
    if (!updatedProfessor) {
      return res.status(404).json({ message: "Professor não encontrado." });
    }
    res.json({
      message: "Professor atualizado com sucesso.",
      professor: updatedProfessor,
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Erro ao atualizar professor." });
  }
}

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

// Metodo para receber ultimo professor criado
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

export const listarProfessorPaginados = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string, 10) || 1;
  const limit: number = 15;

  try {
    const professores = await Professor.find()
      .skip((page - 1) * limit)
      .limit(limit);

    const totalItems = await Professor.countDocuments();
    const totalPages = Math.ceil(totalItems / limit);

    res.json({
      professores,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erro ao buscar professores paginados", error });
  }
};

export const deletarProfessorSelecionados = async (
  req: Request,
  res: Response
) => {
  const { ids } = req.body;

  if (!ids || !Array.isArray(ids)) {
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
