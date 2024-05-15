import { Request, response, Response } from "express";
import Paciente from "../models/Paciente";

// Funçoes Paciente:
// Metodo POST:
export async function createPaciente(request: Request, response: Response) {
  const {
    // Informações pessoais:
    nome,
    cpf,
    dataDeNascimento,
    email,
    telefoneContato,
    sexo,
    estadoCivil,
    religiao,
    rendaFamiliar,
    profissao,
    outroContato,
    nomeDoContatoResponsavel,
    menorDeIdade,
    naturalidade,
    nacionalidade,
    // Endereço:
    enderecoCep,
    enderecoLogradouro,
    enderecoBairro,
    enderecoComplemento,
    enderecoCidade,
    enderecoUF,
    // Informação de tratamento:
    dataInicioTratamento,
    dataTerminoTratamento,
    quemEncaminhouID,
    quemEncaminhouNome,
    tipoDeTratamento,
    alunoUnieva,
    funcionarioUnieva,
    // Arquivado:
    arquivado,
  } = request.body;

  // Informaçoes Pessoais:
  if (!nome) {
    return response.status(203).send("Insira seu nome.");
  }

  if (!cpf) {
    return response.status(203).send("CPF inválido.");
  }

  if (!dataDeNascimento) {
    return response.status(203).send("Insira a sua data de nascimento.");
  }

  if (!email) {
    return response.status(203).send("E-mail inválido.");
  }

  if (!telefoneContato) {
    return response.status(203).send("Insira seu numero de contato.");
  }

  if (!sexo) {
    return response.status(203).send("Selecione o seu sexo.");
  }

  if (!estadoCivil) {
    return response.status(203).send("selecione um estado civil.");
  }

  if (!religiao) {
    return response.status(203).send("Insira sua religao.");
  }

  if (!rendaFamiliar) {
    return response.status(203).send("Insira Sua Renda familiar.");
  }

  if (!profissao) {
    return response.status(203).send("Insira a sua Profissão.");
  }

  if (!naturalidade) {
    return response.status(203).send("Insira a sua naturalidade.");
  }

  if (!nacionalidade) {
    return response.status(203).send("Insira a sua nacionalidade.");
  }

  // Informaçoes Pessoais:
  if (!enderecoCep) {
    return response.status(203).send("Insira o seu CEP.");
  }

  if (!enderecoLogradouro) {
    return response.status(203).send("Insira o seu endereço.");
  }

  if (!enderecoBairro) {
    return response.status(203).send("Insira o nome do seu bairro.");
  }

  if (!enderecoCidade) {
    return response.status(203).send("Insira o nome da sua Cidade.");
  }

  if (!enderecoUF) {
    return response.status(203).send("Insira qual a sua regiao");
  }

  // Informaçoes Pessoais:
  if (!dataInicioTratamento) {
    return response.status(203).send("Insira a data de incio do tratamento.");
  }

  if (!dataTerminoTratamento) {
    return response.status(203).send("Insira a data do termino do tratamento.");
  }

  if (!quemEncaminhouNome) {
    return response
      .status(203)
      .send("Insira o nome do que encaminhou esse paciente.");
  }

  if (!tipoDeTratamento) {
    return response.status(203).send("Insira o tipo de tratamento.");
  }

  // Criação de um novo Paciente:
  const createPaciente = new Paciente({
    // Informações pessoais:
    nome,
    cpf,
    dataDeNascimento,
    email,
    telefoneContato,
    sexo,
    estadoCivil,
    religiao,
    rendaFamiliar,
    profissao,
    outroContato,
    nomeDoContatoResponsavel,
    menorDeIdade,
    naturalidade,
    nacionalidade,
    // Endereço:
    enderecoCep,
    enderecoLogradouro,
    enderecoBairro,
    enderecoComplemento,
    enderecoCidade,
    enderecoUF,
    // Informação de tratamento:
    dataInicioTratamento,
    dataTerminoTratamento,
    quemEncaminhouID,
    quemEncaminhouNome,
    tipoDeTratamento,
    alunoUnieva,
    funcionarioUnieva,
  });

  // Se já existe um usuário no BD, o sistema para antes de tentar salvar.
  const PacienteInDatabaseByCpf = await Paciente.findOne({ cpf }).lean();
  if (PacienteInDatabaseByCpf?.cpf) {
    return response
      .status(203)
      .send("Já existe um Paciente no BD com esse cpf.");
  }

  // Salvamento do novo usuário no banco de dados:
  try {
    await createPaciente.save();
    return response
      .status(200)
      .send("Cadastro de pacinete criado com sucesso.");
  } catch (e) {
    console.error(e);
    return response
      .status(203)
      .send("Não foi possivel criar Cadastro de pacinete.");
  }
}

// Metodo GET:
export async function getPaciente(req: Request, res: Response) {
  try {
    Paciente.find({})
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

export async function getPacienteById(req: Request, res: Response) {
  try {
    if (!Paciente) {
      throw new Error("paciente object is undefined");
    }

    const pacienteData = await Paciente.findById(req.params.id);

    if (!pacienteData) {
      throw new Error("paciente not found");
    }

    res.json(pacienteData);
  } catch (error: any) {
    res.json({ message: error.message });
  }
}

export const getPacientesByIdAluno = async (req: Request, res: Response) => {
  try {
    const quemEncaminhouID = req.params.id;
    const pacientesByAluno = await Paciente.find({ quemEncaminhouID });
    res.json(pacientesByAluno);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erro ao buscar pacientes por ID do Aluno." });
  }
};

export async function getPacientesSelect(req: Request, res: Response) {
  try {
    if (!Paciente) {
      throw new Error("Não tem paciente");
    }

    const pacienteData = await Paciente.find({}, "nome");

    if (!pacienteData) {
      throw new Error("Pacientes não encontrados");
    }

    res.json(pacienteData);
  } catch (error: any) {
    res.json({ message: error.message });
  }
}

// Metodo PATCH:
export async function patchPaciente(request: Request, response: Response) {
  try {
    const id = request.params.id;
    const {
      // Informações pessoais:
      nome,
      cpf,
      dataDeNascimento,
      email,
      telefoneContato,
      sexo,
      estadoCivil,
      religiao,
      rendaFamiliar,
      profissao,
      outroContato,
      nomeDoContatoResponsavel,
      menorDeIdade,
      naturalidade,
      nacionalidade,
      // Endereço:
      enderecoCep,
      enderecoLogradouro,
      enderecoBairro,
      enderecoComplemento,
      enderecoCidade,
      enderecoUF,
      // Informação de tratamento:
      dataInicioTratamento,
      dataTerminoTratamento,
      quemEncaminhou,
      tipoDeTratamento,
      alunoUnieva,
      funcionarioUnieva,
    } = request.body;

    const res = await Paciente.findByIdAndUpdate(id, {
      // Informações pessoais:
      nome,
      cpf,
      dataDeNascimento,
      email,
      telefoneContato,
      sexo,
      estadoCivil,
      religiao,
      rendaFamiliar,
      profissao,
      outroContato,
      nomeDoContatoResponsavel,
      menorDeIdade,
      naturalidade,
      nacionalidade,
      // Endereço:
      enderecoCep,
      enderecoLogradouro,
      enderecoBairro,
      enderecoComplemento,
      enderecoCidade,
      enderecoUF,
      // Informação de tratamento:
      dataInicioTratamento,
      dataTerminoTratamento,
      quemEncaminhou,
      tipoDeTratamento,
      alunoUnieva,
      funcionarioUnieva,
    });
    response.send({ status: "ok", ocorrencias: res });
  } catch (error) {
    console.error(error);
  }
}

export async function patchPacienteArquivo(
  request: Request,
  response: Response
) {
  try {
    const id = request.params.id;
    const { arquivado } = request.body;

    const res = await Paciente.findByIdAndUpdate(id, {
      arquivado,
    });
    response.send({ status: "ok", ocorrencias: res });
  } catch (error) {
    console.error(error);
  }
}

// Metodo DELETE:
export async function deletePaciente(request: Request, response: Response) {
  try {
    const id = request.params.id;

    const pacienteEncontrado = await Paciente.findById(id);

    if (!pacienteEncontrado) {
      return response.status(404).json({ error: "Paciente não encontrado" });
    }

    const pacienteExcluido = await Paciente.findByIdAndDelete(id);

    return response.json({
      message: "Paciente excluído com sucesso",
      Paciente: pacienteExcluido,
    });
  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: "Erro interno do servidor" });
  }
}
