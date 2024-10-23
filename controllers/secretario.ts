import { Request, Response } from "express";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import Secretario from "../models/secretario";
import User from "../models/user";
import Paciente from "../models/Paciente";

// criar secretario
export async function criarSecretario(req: Request, res: Response) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { nome, cpf, telefone, email, turno } = req.body;

    if (!nome || !cpf || !telefone || !email || !turno) {
      throw new Error("Preencha todos os campos.");
    }

    const cpfFormatado = cpf.replace(/\D/g, "");

    const [
      secretarioExistenteCPF,
      usuarioExistenteCPF,
      pacienteExistenteCPF,
      secretarioExistenteEmail,
      usuarioExistenteEmail,
      pacienteExistenteEmail,
    ] = await Promise.all([
      Secretario.exists({ cpf: cpfFormatado }).session(session),
      User.exists({ cpf: cpfFormatado }).session(session),
      Paciente.exists({ cpf: cpfFormatado }).session(session),
      Secretario.exists({ email }).session(session),
      User.exists({ email }).session(session),
      Paciente.exists({ email }).session(session),
    ]);

    if (
      secretarioExistenteEmail ||
      usuarioExistenteEmail ||
      pacienteExistenteEmail
    ) {
      throw new Error("Já existe um usuário com este email.");
    }

    if (secretarioExistenteCPF || pacienteExistenteCPF || usuarioExistenteCPF) {
      throw new Error("Já existe um usuário com este CPF.");
    }

    const newSecretario = new Secretario({
      nome,
      cpf: cpfFormatado,
      telefone,
      email,
      turno,
    });

    const senha = cpfFormatado.slice(0, -2);
    const senhaCriptografada = await bcrypt.hash(senha, 10);

    const novoUser = new User({
      nome,
      cpf: cpfFormatado,
      email,
      senha: senhaCriptografada,
      cargo: 1,
    });

    await newSecretario.save({ session });
    await novoUser.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: "Cadastro de usuário criado com sucesso.",
    });
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();

    res.status(400).json({
      error: error.message || "Não foi possível criar o cadastro do usuário.",
    });
  }
}

// listar secretários
export const listarSecretarios = async (req: Request, res: Response) => {
  const { q, nome, cpf, email, telefone, turno } = req.query;
  const page = parseInt(req.query.page as string, 10) || 1;
  const limit = 15;

  try {
    const searchQuery = {
      ...(q && {
        $or: [
          { nome: { $regex: q, $options: "i" } },
          { cpf: { $regex: q, $options: "i" } },
          { email: { $regex: q, $options: "i" } },
          { telefone: { $regex: q, $options: "i" } },
          { turno: { $regex: q, $options: "i" } },
        ],
      }),
      ...(nome && { nome: { $regex: nome, $options: "i" } }),
      ...(cpf && { cpf: { $regex: cpf, $options: "i" } }),
      ...(email && { email: { $regex: email, $options: "i" } }),
      ...(telefone && { telefone: { $regex: telefone, $options: "i" } }),
      ...(turno && { turno: { $regex: turno, $options: "i" } }),
    };

    const secretarios = await Secretario.find(searchQuery)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const totalItems = await Secretario.countDocuments(searchQuery);

    res.json({
      secretarios,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
      totalItems,
    });
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar secretários", error });
  }
};

// obter secretário por ID
export async function getSecretarioByID(req: Request, res: Response) {
  try {
    const secretarioID = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(secretarioID)) {
      return res.status(400).send("ID de secretário inválido.");
    }
    const secretario = await Secretario.findById(secretarioID);
    if (!secretario) {
      return res.status(404).send("Secretário não encontrado.");
    }
    res.json(secretario);
  } catch (error: any) {
    res.status(500).json({ message: "Erro ao buscar secretário." });
  }
}

// atualizar secretário
export async function atualizarSecretario(req: Request, res: Response) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { cpf, email, senha, nome, ...updateData } = req.body;

    const secretarioExistente = await Secretario.findById(id).session(session);
    if (!secretarioExistente) {
      throw new Error("Secretário não encontrado.");
    }

    let cpfFormatado;
    if (cpf) {
      cpfFormatado = cpf.replace(/\D/g, "");

      const secretarioExistenteCPF = await Secretario.findOne({
        _id: { $ne: id },
        cpf: cpfFormatado,
      }).session(session);

      const pacienteExistenteCPF = await Paciente.findOne({
        cpf: cpfFormatado,
      }).session(session);

      const usuarioExistenteCPF = await User.findOne({
        cpf: cpfFormatado,
      }).session(session);

      if (
        secretarioExistenteCPF ||
        pacienteExistenteCPF ||
        usuarioExistenteCPF
      ) {
        return res.status(400).send("Já existe um usuário com este CPF.");
      }

      updateData.cpf = cpfFormatado;
    }

    if (email) {
      const secretarioExistenteEmail = await Secretario.findOne({
        _id: { $ne: id },
        email,
      }).session(session);

      const pacienteExistenteEmail = await Paciente.findOne({ email }).session(
        session
      );
      const usuarioExistenteEmail = await User.findOne({ email }).session(
        session
      );

      if (
        secretarioExistenteEmail ||
        pacienteExistenteEmail ||
        usuarioExistenteEmail
      ) {
        return res.status(400).send("Já existe um usuário com este email.");
      }

      updateData.email = email;
    }

    let senhaCriptografada;
    if (senha) {
      senhaCriptografada = await bcrypt.hash(senha, 10);
    }

    const secretarioAtualizado = await Secretario.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).session(session);

    if (cpf || email || senha || nome) {
      const updateUserData = {
        nome: nome || secretarioExistente.nome,
        cpf: cpfFormatado || secretarioExistente.cpf,
        email: email || secretarioExistente.email,
        ...(senha && { senha: senhaCriptografada }),
      };

      const usuarioAtualizado = await User.findOneAndUpdate(
        { cpf: secretarioExistente.cpf },
        updateUserData,
        { new: true }
      ).session(session);

      if (!usuarioAtualizado) {
        throw new Error("Usuário relacionado não encontrado.");
      }
    }

    await session.commitTransaction();
    session.endSession();

    res.json({
      message: "Secretário atualizado com sucesso.",
      secretario: secretarioAtualizado,
    });
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();

    if (error.code === 11000) {
      if (error.keyPattern?.cpf) {
        return res
          .status(400)
          .json({ message: "Já existe um usuário com este CPF." });
      }
      if (error.keyPattern?.email) {
        return res
          .status(400)
          .json({ message: "Já existe um usuário com este email." });
      }
    }

    res.status(500).json({ message: error.message });
  }
}

// deletar secretário
export async function deletarSecretario(req: Request, res: Response) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const secretarioID = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(secretarioID)) {
      return res.status(400).send("ID de secretário inválido.");
    }

    const secretarioEncontrado = await Secretario.findById(
      secretarioID
    ).session(session);

    if (!secretarioEncontrado) {
      return res.status(404).json({ error: "Secretário não encontrado." });
    }

    await Secretario.findByIdAndDelete(secretarioID).session(session);

    await User.findOneAndDelete({ email: secretarioEncontrado.email }).session(
      session
    );

    await session.commitTransaction();
    session.endSession();

    return res.json({
      message: "Secretário excluído com sucesso.",
      secretario: secretarioEncontrado,
    });
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    console.error(error);
    return res.status(500).json({ error: "Erro interno do servidor." });
  }
}

// obter o último secretário criado
export const obterUltimoSecretarioCriado = async (
  req: Request,
  res: Response
) => {
  try {
    const ultimoSecretario = await Secretario.findOne().sort({ createdAt: -1 });
    res.json(ultimoSecretario);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erro ao buscar o último secretario criado" });
  }
};

// listar secretários paginados
export const listarSecretarioPaginados = async (
  req: Request,
  res: Response
) => {
  const page = parseInt(req.query.page as string, 10) || 1;
  const limit: number = 15;

  try {
    const secretarios = await Secretario.find()
      .skip((page - 1) * limit)
      .limit(limit);

    const totalItems = await Secretario.countDocuments();
    const totalPages = Math.ceil(totalItems / limit);

    res.json({
      secretarios,
      totalPages,
      currentPage: page,
      totalItems,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erro ao buscar secretarios paginados", error });
  }
};

// deletar secretários selecionados
export const deletarSecretariosSelecionados = async (
  req: Request,
  res: Response
) => {
  const ids = req.params.ids.split(",");

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: "IDs inválidos fornecidos" });
  }

  try {
    const result = await Secretario.deleteMany({ _id: { $in: ids } });
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
