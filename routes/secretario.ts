import { Router } from "express";
import {
  createSecretario,
  listSecretarios,
  getSecretarioByID,
  updateSecretario,
  deleteSecretario,
  obterUltimoSecretarioCriado,
} from "../controllers/secretario";


const router = Router();

// Rotas secretários
router.post("/", createSecretario);
router.get("/", listSecretarios);
router.get("/:id", getSecretarioByID);
router.patch("/:id", updateSecretario);
router.delete("/:id", deleteSecretario);
router.get('/ultimo', obterUltimoSecretarioCriado);

export default router;

