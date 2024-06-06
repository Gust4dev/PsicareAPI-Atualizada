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

const router = Router();

// Rota de login não protegida
router.post("/login", loginUser);
router.post("/", createUser);

// Rotas protegidas
router.get("/", listarUsers);
router.get("/:id", obterUserPorID);
router.patch("/:id", patchUser);
router.patch("/:id/arquivado", atualizarStatusArquivado);
router.delete("/:id", deleteUser);

export { router as userRouter };
