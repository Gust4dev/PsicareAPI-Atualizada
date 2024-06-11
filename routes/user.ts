import { Router } from "express";
import {
  createUser,
  loginUser,
  listarUsers,
  obterUserPorID,
  patchUser,
  deleteUser,
  obterUltimoUserCriado,
} from "../controllers/user";

const router = Router();

// Rota de login não protegida
router.post("/login", loginUser);
router.post("/", createUser);

// Rotas protegidas
router.get("/", listarUsers);
router.get("/:id", obterUserPorID);
router.patch("/:id", patchUser);
router.delete("/:id", deleteUser);
router.get('/ultimo', obterUltimoUserCriado);

export default router;
