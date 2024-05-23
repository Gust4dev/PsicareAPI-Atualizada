import { Request, Response } from "express";
import Aluno from "../models/aluno";

// Função auxiliar para validar campos obrigatórios
function validarCamposObrigatorios(campos: { field: any, message: string }[], res: Response) {
  for (const { field, message } of campos) {
    if (!field) {
      res.status(400).send(message);
      return false;
    }
  }
  return true;
}

// Método para criar aluno
export async function criarAluno(req: Request, res: Response) {
  const {
    matricula,
    periodo,
    nome,
    cpf,
    telefoneContato,
    professorID,
    professorNome,
    professorDisciplina,
    email,
    arquivado,
  } = req.body;

  // Validação de Campos Obrigatórios
  const camposObrigatorios = [
    { field: matricula, message: "Insira sua matrícula." },
    { field: periodo, message: "Insira o período de aulas." },
    { field: nome, message: "Insira seu nome." },
    { field: cpf, message: "CPF inválido." },
    { field: telefoneContato, message: "Insira seu número de contato." },
    { field: professorID, message: "Insira o ID do professor." },
    { field: email, message: "E-mail inválido." }
  ];

  if (!validarCamposObrigatorios(camposObrigatorios, res)) return;
  if (!nome.split(" ")[1]) {
    return res.status(400).send("Insira seu nome completo.");
  }

  // Verificação se o aluno já existe no banco de dados
  const existingAluno = await Aluno.findOne({ cpf }).lean();
  if (existingAluno) {
    return res.status(400).send("Já existe um aluno no BD com esse CPF.");
  }

  // Criação de um novo aluno
  const newAluno = new Aluno({
    matricula,
    periodo,
    nome,
    cpf,
    telefoneContato,
    professorID,
    professorNome,
    professorDisciplina,
    email,
    arquivado,
    role: "Estudante",
  });

  try {
    await newAluno.save();
    return res.status(201).send("Cadastro do aluno criado com sucesso.");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Não foi possível realizar o cadastro do aluno.");
  }
}

// Método para listar todos os alunos
export async function listarAlunos(req: Request, res: Response) {
  try {
    const alunos = await Aluno.find({});
    res.json(alunos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Método para obter aluno por ID
export async function obterAlunoPorID(req: Request, res: Response) {
  try {
    const alunoData = await Aluno.findById(req.params.id);
    if (!alunoData) {
      return res.status(404).send("Aluno não encontrado");
    }
    res.json(alunoData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Método para listar nomes dos alunos
export async function listarNomesAlunos(req: Request, res: Response) {
  try {
    const alunos = await Aluno.find({}, "nome");
    res.json(alunos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Método para listar alunos por ID do professor
export async function listarAlunosPorProfessorID(req: Request, res: Response) {
  try {
    const professorID = req.params.id;
    const alunos = await Aluno.find({ professorID });
    res.json(alunos);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar alunos por ID do professor." });
  }
}

// Método para atualizar aluno
export async function atualizarAluno(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const alunoAtualizado = await Aluno.findByIdAndUpdate(id, req.body, { new: true });

    if (!alunoAtualizado) {
      return res.status(404).send("Aluno não encontrado");
    }

    res.json(alunoAtualizado);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Método para arquivar aluno
export async function arquivarAluno(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const { arquivado } = req.body;

    const alunoAtualizado = await Aluno.findByIdAndUpdate(id, { arquivado }, { new: true });

    if (!alunoAtualizado) {
      return res.status(404).send("Aluno não encontrado");
    }

    res.json(alunoAtualizado);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Método para deletar aluno
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
  } catch (error) {
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}
