import { Router } from "express";
import {
  createUser,
  loginUser,
  listarUsers,
  obterUserPorID,
  patchUser,
  atualizarStatusArquivado,
  deleteUser,
} from "../controllers/user";
import { authMiddleware } from '../middleware/auth_midd';


const router = Router();
router.use(authMiddleware);

// Rotas usuários
router.post("/", createUser);
router.post("/login", loginUser);
router.get("/", listarUsers);
router.get("/:id", obterUserPorID);
router.patch("/:id", patchUser);
router.patch("/:id/arquivado", atualizarStatusArquivado);
router.delete("/:id", deleteUser);

export { router as userRouter };
