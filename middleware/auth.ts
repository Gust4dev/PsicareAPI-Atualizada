import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

declare module "express-serve-static-core" {
  interface Request {
    user?: {
      cargo: number;
      [key: string]: any;
    };
  }
}

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

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
