import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { GridFSBucket } from "mongodb";
import { getGridFSBucket } from "../config/gridfs";
import multer from "multer";
import { ObjectId } from "mongodb";

dotenv.config();

declare module "express-serve-static-core" {
  interface Request {
    user?: {
      cargo: number;
      [key: string]: any;
    };
    fileIds?: { prontuario?: ObjectId, assinatura?: ObjectId };
  }
}

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

const storage = multer.memoryStorage();
export const upload = multer({ storage });

const uploadToGridFS = (bucket: GridFSBucket, file: Express.Multer.File): Promise<ObjectId> => {
  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(file.originalname);
    uploadStream.end(file.buffer);
    uploadStream.on("finish", () => resolve(uploadStream.id));
    uploadStream.on("error", (err) => reject(err));
  });
};

export const uploadFilesToGridFS = async (req: Request, res: Response, next: NextFunction) => {
  const bucket = getGridFSBucket();

  if (!bucket) {
    return res.status(500).json({ message: "Erro ao obter GridFSBucket" });
  }

  const { prontuario, assinatura } = req.fileIds as any;
  req.fileIds = {};

  try {
    if (prontuario) {
      req.fileIds!.prontuario = await uploadToGridFS(bucket, prontuario[0]);
    }

    if (assinatura) {
      req.fileIds!.assinatura = await uploadToGridFS(bucket, assinatura[0]);
    }

    next();
  } catch (error) {
    return res.status(500).json({ message: "Erro ao fazer upload dos arquivos", error });
  }
};
/**
 * Middleware de autenticação e autorização.
 * @param requiredRoles - cargos permitidos para acessar a rota.
 */
export const authMiddleware = (requiredRoles: number[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(403).json({ message: "Token não fornecido" });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        cargo: number;
        [key: string]: any;
      };

      req.user = decoded;

      if (requiredRoles.includes(decoded.cargo)) {
        return next();
      }

      return res.status(403).json({ message: "Acesso negado" });
    } catch (error) {
      return res.status(401).json({ message: "Token inválido" });
    }
  };
};
