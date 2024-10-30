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
    fileIds?: { prontuario?: any, assinatura?: any };
  }
}

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

const storage = multer.memoryStorage();
export const upload = multer({ storage });

export const uploadFilesToGridFS = (req: Request, res: Response, next: NextFunction) => {
  next(); // removido temporariamente 
};


export const downloadFileFromGridFS = (req: Request, res: Response) => {
  const bucket: GridFSBucket = getGridFSBucket();
  const { fileId } = req.params;

  if (!fileId) {
    return res.status(400).send("File ID não fornecido.");
  }

  let fileObjectId: ObjectId;
  try {
    fileObjectId = new ObjectId(fileId);
  } catch (error) {
    return res.status(400).send("ID de arquivo inválido.");
  }

  const downloadStream = bucket.openDownloadStream(fileObjectId);

  downloadStream.on("file", (file) => {
    res.set({
      'Content-Type': file.contentType,
      'Content-Disposition': `attachment; filename="${file.filename}"`
    });
  });

  downloadStream.on("error", () => {
    res.status(404).send("Arquivo não encontrado.");
  });

  downloadStream.pipe(res);
};

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
