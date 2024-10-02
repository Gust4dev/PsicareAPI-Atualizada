import { Router } from "express";
import {
  criarRelatorio,
  listarRelatorios,
  atualizarRelatorio,
  deletarRelatorio,
  arquivarRelatorio,
} from "../controllers/relatorio";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// Rotas Relatorio
router.post("/", authMiddleware([0, 2, 3]), criarRelatorio);
router.get("/", authMiddleware([0, 2, 3]), listarRelatorios);
router.patch("/:id", authMiddleware([0, 3]), atualizarRelatorio);
router.delete("/:id", authMiddleware([0]), deletarRelatorio);
router.patch("/arquivar/:id", authMiddleware([0]), arquivarRelatorio);

export default router;
