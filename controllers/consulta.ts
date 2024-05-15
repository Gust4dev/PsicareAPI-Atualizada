import { Request, response, Response } from "express";
import consulta from "../models/consulta";

// Funçoes Consulta
// Metodo POST:
export async function createConsulta(request: Request, response: Response) {
  const {
    pacienteID,
    pacienteNome,
    title,
    start,
    end,
    resourceId,
    recorrencia,
    tipoDeConsulta,
    consultaRecorrenteID,
    observacao,
    statusDaConsulta,
    alunoID,
  } = request.body;

  if (!pacienteNome) {
    return response.status(203).send("Insira o nome do paciente.");
  }
  if (!pacienteID) {
    return response.status(203).send("Insira o ID do paciente");
  }
  if (!title) {
    return response.status(203).send("Insira o tipo de tratamento.");
  }

  if (!start) {
    return response.status(203).send("Insira o horairo inicial.");
  }

  if (!end) {
    return response.status(203).send("Insira o horairo que termino.");
  }

  if (!resourceId) {
    return response.status(203).send("Insira o local da consulta.");
  }

  if (!recorrencia) {
    return response.status(203).send("Insira qual a frequencia da consulta.");
  }

  if (!tipoDeConsulta) {
    return response.status(203).send("Insira o tipo de consulta.");
  }

  if (!observacao) {
    return response.status(203).send("Insira a sua observação.");
  }

  if (!statusDaConsulta) {
    return response.status(203).send("Insira o status da consulta.");
  }

  // Criação de um novo Consulta:
  const createConsulta = new consulta({
    pacienteID,
    pacienteNome,
    title,
    start,
    end,
    resourceId,
    recorrencia,
    tipoDeConsulta,
    consultaRecorrenteID,
    observacao,
    statusDaConsulta,
    alunoID,
  });

  // Salvamento do novo usuário no banco de dados:
  try {
    await createConsulta.save();
    return response.status(200).send("Consulta criada com sucesso.");
  } catch (e) {
    console.error(e);
    return response.status(203).send("Não foi possivel criar Consulta.");
  }
}

// Metodo GET:
export async function getConsultas(req: Request, res: Response) {
  try {
    consulta
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

// Metodo PATCH:
export async function patchConsulta(request: Request, response: Response) {
  try {
    const id = request.params.id;
    const {
      title,
      start,
      end,
      resourceId,
      dataDaConsulta,
      frequencia,
      tipoDeConsulta,
      consultaRecorrenteID,
      observacao,
      statusDaConsulta,
    } = request.body;

    const res = await consulta.findByIdAndUpdate(id, {
      title,
      start,
      end,
      resourceId,
      dataDaConsulta,
      frequencia,
      tipoDeConsulta,
      consultaRecorrenteID,
      observacao,
      statusDaConsulta,
    });
    response.send({ status: "ok", ocorrencias: res });
  } catch (error) {
    console.error(error);
  }
}

export async function deleteConsulta(request: Request, response: Response) {
  try {
    const _id = request.params.id;

    const consultaEncontrada = await consulta.findById(_id);

    if (!consultaEncontrada) {
      return response.status(404).json({ error: "Consulta não encontrada" });
    }

    const consultaExcluida = await consulta.findByIdAndDelete(_id);

    return response.json({
      message: "Consulta excluída com sucesso",
      consulta: consultaExcluida,
    });
  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: "Erro interno do servidor" });
  }
}
