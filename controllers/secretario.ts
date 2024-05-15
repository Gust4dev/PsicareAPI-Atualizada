import { Request, response, Response } from "express";
import Secretario from "../models/secretario";
import secretario from "../models/secretario";

// Funçoes Secretario:
// Metodo POST:
export async function createSecretario(request: Request, response: Response) {
    const { nome, cpf, telefoneContato, email, turno, arquivado } = request.body;
  
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
  
    if (!turno) {
      return response.status(203).send("Selecione  seu turno.");
    }
  
    // Verificando se a segunda parte do nome existe:
    if (!nome.split(" ")[1]) {
      return response.status(203).send("Insira seu nome completo.");
    }
  
    // Criação de um novo Secretario:
    const createSecretario = new Secretario({
      nome,
      cpf,
      telefoneContato,
      email,
      turno,
    });
  
    // Se já existe um usuário no BD, o sistema para antes de tentar salvar.
    const SecretarioInDatabaseByCpf = await Secretario.findOne({ cpf }).lean();
    if (SecretarioInDatabaseByCpf?.cpf) {
      return response
        .status(203)
        .send("Já existe um usuário no BD com esse cpf.");
    }
  
    // Salvamento do novo usuário no banco de dados:
    try {
      await createSecretario.save();
      return response
        .status(200)
        .send("Cadastro de secretario criado com sucesso.");
    } catch (e) {
      console.error(e);
      return response
        .status(203)
        .send("Não foi possivel criar Cadastro de secretario.");
    }
  }
  
  // Metodo GET:
  export async function getSecretarios(req: Request, res: Response) {
    try {
      secretario
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
  
  export async function getSecretarioById(req: Request, res: Response) {
    try {
      if (!secretario) {
        throw new Error("secretario object is undefined");
      }
  
      const secretarioData = await secretario.findById(req.params.id);
  
      if (!secretarioData) {
        throw new Error("secretario not found");
      }
  
      res.json(secretarioData);
    } catch (error: any) {
      res.json({ message: error.message });
    }
  }
  
  // Metodo PATCH:
  export async function patchSecretario(request: Request, response: Response) {
    try {
      const id = request.params.id;
      const { nome, cpf, telefoneContato, email, turno } = request.body;
  
      const res = await secretario.findByIdAndUpdate(id, {
        nome,
        cpf,
        telefoneContato,
        email,
        turno,
      });
      response.send({ status: "ok", ocorrencias: res });
    } catch (error) {
      console.error(error);
    }
  }
  
  export async function patchSecretarioArquivo(
    request: Request,
    response: Response
  ) {
    try {
      const id = request.params.id;
      const { arquivado } = request.body;
  
      const res = await secretario.findByIdAndUpdate(id, {
        arquivado,
      });
      response.send({ status: "ok", ocorrencias: res });
    } catch (error) {
      console.error(error);
    }
  }
  
  // Metodo DELETE:
  export async function deleteSecretario(request: Request, response: Response) {
    try {
      const id = request.params.id;
  
      const secretarioEncontrado = await secretario.findById(id);
  
      if (!secretarioEncontrado) {
        return response.status(404).json({ error: "Secretario não encontrado" });
      }
  
      const secretarioExcluido = await secretario.findByIdAndDelete(id);
  
      return response.json({
        message: "Secretario excluído com sucesso",
        secretario: secretarioExcluido,
      });
    } catch (error) {
      console.error(error);
      return response.status(500).json({ error: "Erro interno do servidor" });
    }
  }