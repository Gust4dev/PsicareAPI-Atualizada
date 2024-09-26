import { Router } from "express";
import {
  criarSecretario,
  listarSecretarios,
  getSecretarioByID,
  updateSecretario,
  deletarSecretario,
  obterUltimoSecretarioCriado,
  deletarSecretariosSelecionados,
} from "../controllers/secretario";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// Rotas secretários
router.post("/", authMiddleware([0]), criarSecretario);
router.get("/", authMiddleware([0, 1]), listarSecretarios);
router.get("/:id", authMiddleware([0, 1]), getSecretarioByID);
router.get("/ultimo/criado", authMiddleware([0, 1]), obterUltimoSecretarioCriado);
router.patch("/:id", authMiddleware([0]), updateSecretario);
router.delete("/:id", authMiddleware([0]), deletarSecretario);
router.delete("/", authMiddleware([0]), deletarSecretariosSelecionados);

export default router;
