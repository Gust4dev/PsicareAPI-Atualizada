import { Router } from "express";
import {
  criarSecretario,
  listSecretarios,
  getSecretarioByID,
  updateSecretario,
  deleteSecretario,
  obterUltimoSecretarioCriado,
  listarSecretarioPaginados,
  deletarSecretariosSelecionados,
} from "../controllers/secretario";

const router = Router();

// Rotas secretários
router.post("/", criarSecretario);
router.get("/", listSecretarios);
router.get("/paginado", listarSecretarioPaginados);
router.get("/:id", getSecretarioByID);
router.get("/ultimo/criado", obterUltimoSecretarioCriado);
router.patch("/:id", updateSecretario);
router.delete("/:id", deleteSecretario);
router.delete("/", deletarSecretariosSelecionados );

export default router;
