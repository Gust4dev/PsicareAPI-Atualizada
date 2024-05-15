import express from "express";
const router = express.Router();
import {
  createSecretario,
  getSecretarioById,
  getSecretarios,
  patchSecretario,
  patchSecretarioArquivo,
  deleteSecretario,
} from "../controllers/secretario";

// Rotas Secretario
router.post("/registroSecretario", createSecretario);
router.get("/getSecretarios", getSecretarios);
router.get("/getSecretarioById/:id", getSecretarioById);
router.patch("/attSecretario/:id", patchSecretario);
router.patch("/arquivarSecretario", patchSecretarioArquivo);
router.delete("/deleteSecretario/:id", deleteSecretario);

export { router };