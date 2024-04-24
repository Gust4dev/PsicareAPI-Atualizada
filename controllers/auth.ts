import { Request, response, Response } from "express";
import User from "../models/user";
import Aluno from "../models/aluno";
import Paciente from "../models/Paciente";
import Professor from "../models/professor";
import Secretario from "../models/secretario";
import consulta from "../models/consulta";
import jwt from "jsonwebtoken";

const JWT_SECRET =
  "URWzLAYqnM63NDxcGnskMDnT1GanhVcAJpp6ylI5xio5otZMp2zLQ4ddYjOaT9F3";

import bcrypt from "bcrypt";
import aluno from "../models/aluno";
import professor from "../models/professor";
import secretario from "../models/secretario";

// Funçoes User:
// Metodo POST:
export async function createUser(request: Request, response: Response) {
  const {
    nome,
    cpf,
    role,
    matricula,
    periodoCursado,
    disciplina,
    idOrientador,
    disciplinaMinistrada,
    idSecretaria,
    senha,
  } = request.body;

  if (!nome) {
    return response.status(203).send("Insira seu nome.");
  }

  if (!cpf) {
    return response.status(203).send("CPF inválido.");
  }

  if (!role) {
    return response.status(203).send("Insira sua função.");
  }

  if (!matricula) {
    return response.status(203).send("Insira sua matrícula.");
  }

  if (!periodoCursado) {
    return response.status(203).send("Insira o periodo sendo cursado.");
  }

  if (!disciplina) {
    return response.status(203).send("Insira a disciplina.");
  }

  if (!idOrientador) {
    return response.status(203).send("Insira o id do orientador.");
  }

  if (!disciplinaMinistrada) {
    return response.status(203).send("Insira a disciplina ministrada.");
  }

  if (!idSecretaria) {
    return response.status(203).send("Insira a id da secretária.");
  }

  if (!senha) {
    return response.status(203).send("Senha inválida.");
  }

  if (senha.lenght < 8) {
    return response
      .status(203)
      .send("Senha inválida. Deve possuir mais de 8 caracteres.");
  }

  // Verificando se a segunda parte do nome existe:
  if (!nome.split(" ")[1]) {
    return response.status(203).send("Insira seu nome completo.");
  }

  // Criptografia da senha:
  const senhaCriptografada = await bcrypt.hash(senha, 10);

  // Criação de um novo usuário:
  const user = await new User({
    nome,
    cpf,
    role,
    matricula,
    periodoCursado,
    disciplina,
    idOrientador,
    disciplinaMinistrada,
    idSecretaria,
    senha: senhaCriptografada,
  });

  // Se já existe um usuário no BD, o sistema para antes de tentar salvar.
  const userInDatabaseByCpf = await User.findOne({ cpf }).lean();
  if (userInDatabaseByCpf?.cpf) {
    return response
      .status(203)
      .send("Já existe um usuário no BD com esse cpf.");
  }

  // Salvamento do novo usuário no banco de dados:
  try {
    await user.save();
    return response.status(200).send("Usuário criado com sucesso.");
  } catch (e) {
    console.error(e);
    return response.status(203).send("Não foi possivel criar usuário.");
  }
}

// Funçoes User:
// Metodo POST:
export async function loginUser(request: Request, response: Response) {
  const { cpf, password } = request.body;
  if (!cpf) {
    return response.status(203).send("CPF inválido.");
  }

  if (!password) {
    return response.status(203).send("Senha inválida.");
  }

  if (password.lenght < 8) {
    return response
      .status(203)
      .send("Senha inválida. Deve possuir mais de 8 caracteres.");
  }

  const userInDatabaseByCpf = await User.findOne({ cpf }).lean();

  // Vendo se usuário existe no DB:
  if (!userInDatabaseByCpf) {
    return response
      .status(203)
      .send("Não foi possivel encontrar um usuário com esse CPF.");
  }

  // Vendo se senha existe no DB:
  if (!userInDatabaseByCpf.senha) {
    return response.status(203).send("erro");
  }

  const databaseSenhaCriptografada = userInDatabaseByCpf.senha;
  const booleanReqSenhaCriptografada = await bcrypt.compare(
    password,
    databaseSenhaCriptografada
  ); // 'senha' aqui, é a que vem no request.

  // Se a comparação for 'false', retorna senha incorreta.
  if (!booleanReqSenhaCriptografada) {
    return response.status(203).send("Senha incorreta.");
  }
  const token = jwt.sign({ email: cpf }, JWT_SECRET, {
    expiresIn: "1h",
  });
  console.log("Fez login e gerou token.");
  if (response.status(201)) {
    return response.status(200).send({
      auth: true,
      token: token,
      user: userInDatabaseByCpf,
    });
  }
  // Se comparação for 'true', retorna que pode acessar o sistema.
  return response
    .status(200)
    .send("Login feito com sucesso. Usuário pode acessar o sistema.");
}

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
