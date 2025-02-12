import { JwtPayload } from "jsonwebtoken";
import { Role } from "../constants/roles";

declare namespace Express {
  export interface Request {
    user?: {
      cargo: number;
      userId?: string;
      [key: string]: any;
    };
    fileIds?: { prontuario?: ObjectId[]; assinatura?: ObjectId[] };
  }
}

declare global {
  namespace Express {
    interface User {
      id: string;
      role: Role;
    }

    interface Request {
      user?: User;
    }
  }
}
