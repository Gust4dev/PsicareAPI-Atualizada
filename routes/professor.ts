import { Router } from "express";
import {
  criarProfessor,
  listarProfessores,
  getProfessorById,
  getProfessoresSelect,
  patchProfessor,
  deletarProfessor,
  obterUltimoProfessorCriado,
  deletarProfessorSelecionados,
} from "../controllers/professor";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// Rotas para Professores
router.post("/", authMiddleware(1), criarProfessor);
router.get("/", authMiddleware(1), listarProfessores);
router.get("/:id", authMiddleware(1), getProfessorById);
router.get("/select", authMiddleware(1), getProfessoresSelect);
router.get("/ultimo/criado", authMiddleware(1), obterUltimoProfessorCriado);
router.patch("/:id", authMiddleware(1), patchProfessor);
router.delete("/:id", authMiddleware(1), deletarProfessor);
router.delete("/", authMiddleware(1), deletarProfessorSelecionados);

export default router;
