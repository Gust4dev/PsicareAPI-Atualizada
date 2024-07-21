import { Router } from "express";
import {
  criarSecretario,
  listSecretarios,
  getSecretarioByID,
  updateSecretario,
  deletarSecretario,
  obterUltimoSecretarioCriado,
  listarSecretarioPaginados,
  deletarSecretariosSelecionados,
} from "../controllers/secretario";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// Rotas secretários
router.post("/", authMiddleware(0), criarSecretario);
router.get("/", authMiddleware(1), listSecretarios);
router.get("/paginado", authMiddleware(1), listarSecretarioPaginados);
router.get("/:id", authMiddleware(1), getSecretarioByID);
router.get("/ultimo/criado", authMiddleware(1), obterUltimoSecretarioCriado);
router.patch("/:id", authMiddleware(0), updateSecretario);
router.delete("/:id", authMiddleware(0), deletarSecretario);
router.delete("/", authMiddleware(0), deletarSecretariosSelecionados);

export default router;
