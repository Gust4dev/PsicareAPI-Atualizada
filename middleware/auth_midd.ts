import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from './models/User';

const SECRET = process.env.JWT_SECRET || 'defaultSecret';

interface AuthenticatedRequest extends Request {
  user?: string | object;
  cargo?: number; // Adicione esta propriedade
}

// Middleware de autenticação
export async function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const token = req.headers['x-access-token'] as string;

  if (!token) {
    return res.status(403).send('Token não fornecido.');
  }

  try {
    const decoded: any = jwt.verify(token, SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).send('Usuário não encontrado.');
    }

    req.user = user;
    req.cargo = user.cargo; // Adicione o cargo ao objeto req
    next();
  } catch (error) {
    return res.status(401).send('Token inválido.');
  }
}

// Middleware de autorização
export function authorize(requiredCargo: number) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (req.cargo === undefined || req.cargo > requiredCargo) {
      return res.status(403).send('Acesso negado.');
    }
    next();
  };
}
