import { Request, response, Response } from "express";
import Professor from "../models/professor";
import professor from "../models/professor";
import Aluno from "../models/aluno";

// Funçoes Professor:
// Metodo POST:
export async function createProfessor(request: Request, response: Response) {
    const { nome, cpf, telefoneContato, email, disciplina, arquivado } =
      request.body;
  
    if (!nome) {
      return response.status(203).send("Insira seu nome.");
    }
  
    if (!cpf) {
      return response.status(203).send("CPF inválido.");
    }
  
    if (!telefoneContato) {
      return response.status(203).send("Insira seu numero de contato.");
    }
  
    if (!email) {
      return response.status(203).send("E-mail inválido.");
    }
  
    if (!disciplina) {
      return response.status(203).send("Insira o nome da disciplina.");
    }
  
    // Verificando se a segunda parte do nome existe:
    if (!nome.split(" ")[1]) {
      return response.status(203).send("Insira seu nome completo.");
    }
  
    // Criação de um novo Professor:
    const createProfessor = new Professor({
      nome,
      cpf,
      telefoneContato,
      email,
      disciplina,
    });
  
    // Se já existe um usuário no BD, o sistema para antes de tentar salvar.
    const ProfessorInDatabaseByCpf = await Professor.findOne({ cpf }).lean();
    if (ProfessorInDatabaseByCpf?.cpf) {
      return response
        .status(203)
        .send("Já existe um usuário no BD com esse cpf.");
    }
  
    // Salvamento do novo usuário no banco de dados:
    try {
      await createProfessor.save();
      return response
        .status(200)
        .send("Cadastro de professor criado com sucesso.");
    } catch (e) {
      console.error(e);
      return response
        .status(203)
        .send("Não foi possivel criar Cadastro de professor.");
    }
  }
  
  // Metodo GET:
  export async function getProfessores(req: Request, res: Response) {
    try {
      professor
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
  
  export async function getProfessorById(req: Request, res: Response) {
    try {
      if (!professor) {
        throw new Error("professor object is undefined");
      }
  
      const professorData = await professor.findById(req.params.id);
  
      if (!professorData) {
        throw new Error("professor not found");
      }
  
      res.json(professorData);
    } catch (error: any) {
      res.json({ message: error.message });
    }
  }
  
  export async function getProfessoresSelect(req: Request, res: Response) {
    try {
      if (!professor) {
        throw new Error("professor object is undefined");
      }
  
      const professorData = await professor.find({}, "nome disciplina");
  
      if (!professorData) {
        throw new Error("Professores não encontrados");
      }
  
      res.json(professorData);
    } catch (error: any) {
      res.json({ message: error.message });
    }
  }
  
  // Metodo PATCH:
  export async function patchProfessor(request: Request, response: Response) {
    try {
      const id = request.params.id;
      const { nome, cpf, telefoneContato, email, disciplina } = request.body;
  
      const professor = await Professor.findById(id);
  
      if (!professor) {
        return response
          .status(404)
          .json({ status: "error", message: "Professor não encontrado." });
      }
  
      professor.nome = nome;
      professor.cpf = cpf;
      professor.telefoneContato = telefoneContato;
      professor.email = email;
      professor.disciplina = disciplina;
  
      await professor.save();
  
      const alunosAssociados = await Aluno.find({ professorID: id });
  
      await Promise.all(
        alunosAssociados.map(async (aluno) => {
          aluno.professorNome = nome;
          aluno.professorDisciplina = disciplina;
          await aluno.save();
        })
      );
  
      return response.json({
        status: "ok",
        message: "Professor e alunos associados atualizados com sucesso.",
      });
    } catch (error) {
      console.error(error);
      return response.status(500).json({
        status: "error",
        message: "Erro ao atualizar professor e alunos.",
      });
    }
  }
  
  export async function patchProfessorArquivo(
    request: Request,
    response: Response
  ) {
    try {
      const id = request.params.id;
      const { arquivado } = request.body;
  
      const res = await professor.findByIdAndUpdate(id, {
        arquivado,
      });
      response.send({ status: "ok", ocorrencias: res });
    } catch (error) {
      console.error(error);
    }
  }
  
  // Metodo DELETE:
  export async function deleteProfessor(request: Request, response: Response) {
    try {
      const id = request.params.id;
  
      const professorEncontrado = await professor.findById(id);
  
      if (!professorEncontrado) {
        return response.status(404).json({ error: "Professor não encontrado" });
      }
  
      const professorExcluido = await professor.findByIdAndDelete(id);
  
      return response.json({
        message: "Professor excluído com sucesso",
        professor: professorExcluido,
      });
    } catch (error) {
      console.error(error);
      return response.status(500).json({ error: "Erro interno do servidor" });
    }
  }
  