import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { Db, GridFSBucket } from "mongodb";
import { getGridFSBucket } from "../config/gridfs";
import multer from "multer";
import Professor from "../models/professor";
import { Aluno } from "../models/aluno";

dotenv.config();

declare module "express-serve-static-core" {
  interface Request {
    user?: {
      cargo: number;
      professorId?: string;
      alunoId?: string;
      [key: string]: any;
    };
    fileIds?: { prontuario?: any; assinatura?: any };
  }
}

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

const storage = multer.memoryStorage();
export const upload = multer({ storage });

export async function getFilesWithNames(ids: mongoose.Types.ObjectId[]) {
  const bucket: GridFSBucket = getGridFSBucket();

  const filesWithNames = await Promise.all(
    ids.map(async (id) => {
      try {
        const files = await bucket
          .find({ _id: new mongoose.Types.ObjectId(id) })
          .toArray();

        if (files.length > 0) {
          return { id: files[0]._id, nome: files[0].filename };
        }

        return { id, nome: "Nome do arquivo não encontrado" };
      } catch {
        return { id, nome: "Erro ao buscar o nome do arquivo" };
      }
    })
  );
  return filesWithNames;
}

export async function uploadFilesToGridFS(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const db: Db | undefined = mongoose.connection.db;

    if (!db) {
      return res
        .status(500)
        .json({ error: "Database connection not available" });
    }

    const bucket = new GridFSBucket(db, { bucketName: "uploads" });
    const fileIds: { prontuario: any[]; assinatura: any[] } = {
      prontuario: [],
      assinatura: [],
    };

    if (req.files) {
      const files = req.files as {
        prontuario?: Express.Multer.File[];
        assinatura?: Express.Multer.File[];
      };

      for (const [key, fileGroup] of Object.entries(files)) {
        if (fileGroup) {
          for (const file of fileGroup) {
            const uploadStream = bucket.openUploadStream(file.originalname);
            uploadStream.end(file.buffer);

            fileIds[key as keyof typeof fileIds].push({
              id: uploadStream.id,
              nome: file.originalname,
            });
          }
        }
      }
    }

    req.fileIds = fileIds;
    next();
  } catch (error) {
    console.error("Error in uploadFilesToGridFS:", error);
    return res.status(500).json({ error: "Failed to upload files to GridFS" });
  }
}

export const authMiddleware = (requiredRoles: number[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(403).json({ message: "Token não fornecido" });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        cargo: number;
        email: string;
        [key: string]: any;
      };

      req.user = decoded;

      if (decoded.cargo === 2) {
        const professor = await Professor.findOne({ email: decoded.email });
        if (professor && professor._id) {
          req.user.professorId = professor._id.toString();
        } else {
          console.error("Professor não encontrado com o email fornecido.");
        }
      } else if (decoded.cargo === 3) {
        const aluno = await Aluno.findOne({ email: decoded.email });
        if (aluno && aluno._id) {
          req.user.alunoId = aluno._id.toString();
        } else {
          console.error("Aluno não encontrado com o email fornecido.");
        }
      }

      if (requiredRoles.includes(decoded.cargo)) {
        return next();
      }

      return res.status(403).json({ message: "Acesso negado" });
    } catch (error) {
      return res.status(401).json({ message: "Token inválido" });
    }
  };
};
