import { Request, response, Response } from "express";
import Aluno from "../models/aluno";
import aluno from "../models/aluno";

// Funçoes Aluno:
// Metodo POST:
export async function createAluno(request: Request, response: Response) {
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
  } = request.body;

  if (!matricula) {
    return response.status(203).send("Insira sua matrícula.");
  }

  if (!periodo) {
    return response.status(203).send("Insira o periodo de aulas.");
  }

  if (!nome) {
    return response.status(203).send("Insira seu nome.");
  }

  if (!cpf) {
    return response.status(203).send("CPF inválido.");
  }

  if (!telefoneContato) {
    return response.status(203).send("Insira seu numero de contato.");
  }

  if (!professorID) {
    return response.status(203).send("Insira o ID do professor.");
  }

  if (!email) {
    return response.status(203).send("E-mail inválido.");
  }

  // Verificando se a segunda parte do nome existe:
  if (!nome.split(" ")[1]) {
    return response.status(203).send("Insira seu nome completo.");
  }

  // Criação de um novo aluno:
  const createAluno = new Aluno({
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

  // Se já existe um usuário no BD, o sistema para antes de tentar salvar.
  const AlunoInDatabaseByCpf = await Aluno.findOne({ cpf }).lean();
  if (AlunoInDatabaseByCpf?.cpf) {
    return response.status(203).send("Já existe um aluno no BD com esse cpf.");
  }

  // Salvamento do novo usuário no banco de dados:
  try {
    await createAluno.save();
    return response.status(200).send("Cadastro do aluno criado com sucesso.");
  } catch (e) {
    console.error(e);
    return response
      .status(203)
      .send("Não foi possivel realizar o Cadastro do aluno.");
  }
}
// Metodo GET:
export async function getAluno(req: Request, res: Response) {
  try {
    aluno
      .find({})
      .then((data) => {
        res.json(data);
      })
      .catch((error) => {
        res.json({ message: error });
      });
  } catch (error) {
    res.json({ message: error });
  }
}

export async function getAlunoById(req: Request, res: Response) {
  try {
    if (!aluno) {
      throw new Error("secretario object is undefined");
    }
    const alunoData = await aluno.findById(req.params.id);

    if (!alunoData) {
      throw new Error("Aluno não encontrado");
    }

    res.json(alunoData);
  } catch (error: any) {
    res.json({ message: error.message });
  }
}

export async function getAlunosSelect(req: Request, res: Response) {
  try {
    if (!aluno) {
      throw new Error("Aluno não existe");
    }
    const alunoData = await aluno.find({}, "nome");

    if (!alunoData) {
      throw new Error("Alunos não encontrados");
    }

    res.json(alunoData);
  } catch (error: any) {
    res.json({ message: error.message });
  }
}

export const getAlunosByIdProfessor = async (req: Request, res: Response) => {
  try {
    const professorID = req.params.id;
    const alunos = await Aluno.find({ professorID });
    res.json(alunos);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erro ao buscar alunos por ID do professor." });
  }
};

// Metodo PATCH:
export async function patchAluno(request: Request, response: Response) {
  try {
    const id = request.params.id;
    const {
      matricula,
      periodo,
      nome,
      cpf,
      telefoneContato,
      professorNome,
      email,
    } = request.body;

    const res = await aluno.findByIdAndUpdate(id, {
      matricula,
      periodo,
      nome,
      cpf,
      telefoneContato,
      professorNome,
      email,
    });
    response.send({ status: "ok", ocorrencias: res });
  } catch (error) {
    console.error(error);
  }
}

export async function PatchAlunoArquivo(request: Request, response: Response) {
  try {
    const id = request.params.id;
    const { arquivado } = request.body;

    const res = await aluno.findByIdAndUpdate(id, {
      arquivado,
    });
    response.send({ status: "ok", ocorrencias: res });
  } catch (error) {
    console.error(error);
  }
}

// Metodo DELETE:
export async function deleteAluno(request: Request, response: Response) {
  try {
    const id = request.params.id;

    const alunoEncontrado = await aluno.findById(id);

    if (!alunoEncontrado) {
      return response.status(404).json({ error: "Aluno não encontrado" });
    }

    const alunoExcluido = await aluno.findByIdAndDelete(id);

    return response.json({
      message: "Aluno excluído com sucesso",
      aluno: alunoExcluido,
    });
  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: "Erro interno do servidor" });
  }
}
