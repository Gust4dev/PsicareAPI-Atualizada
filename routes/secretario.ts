import { Router } from "express";
import {
  createSecretario,
  listSecretarios,
  getSecretarioByID,
  updateSecretario,
  updateStatusArquivadoSecretario,
  deleteSecretario,
} from "../controllers/secretario";
import { authMiddleware } from '../middleware/auth_midd';


const router = Router();
router.use(authMiddleware);

// Rotas secretários
router.post("/", createSecretario);
router.get("/", listSecretarios);
router.get("/:id", getSecretarioByID);
router.patch("/:id", updateSecretario);
router.patch("/:id/arquivado", updateStatusArquivadoSecretario);
router.delete("/:id", deleteSecretario);

export { router as secretarioRouter };
