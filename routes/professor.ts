import { Router } from "express";
import {
  criarProfessor,
  listarProfessores,
  getProfessorById,
  getProfessoresSelect,
  atualizarProfessor,
  deletarProfessor,
  obterUltimoProfessorCriado,
  deletarProfessorSelecionados,
} from "../controllers/professor";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// Rotas para Professores
router.post("/", authMiddleware([0]), criarProfessor);
router.get("/", authMiddleware([0, 1]), listarProfessores);
router.get("/:id", authMiddleware([0, 1]), getProfessorById);
router.get("/select", authMiddleware([0, 1]), getProfessoresSelect);
router.get("/ultimo/criado", authMiddleware([0, 1]), obterUltimoProfessorCriado);
router.patch("/:id", authMiddleware([0]), atualizarProfessor);
router.delete("/:id", authMiddleware([0]), deletarProfessor);
router.delete("/", authMiddleware([0]), deletarProfessorSelecionados);

export default router;
