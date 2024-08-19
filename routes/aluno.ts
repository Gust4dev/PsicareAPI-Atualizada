import { Router } from "express";
import {
  criarAluno,
  listarAlunos,
  obterAlunoPorID,
  listarAlunosPorProfessorId,
  atualizarAluno,
  deletarAluno,
  obterUltimoAlunoCriado,
  deletarAlunoSelecionados,
} from "../controllers/aluno";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// Rotas alunos
router.post("/", criarAluno);
router.get("/", authMiddleware(2), listarAlunos);
router.get("/:id", authMiddleware(2), obterAlunoPorID);
router.get("/professor/:id", authMiddleware(2), listarAlunosPorProfessorId);
router.get("/ultimo/criado", authMiddleware(1), obterUltimoAlunoCriado);
router.patch("/:id", authMiddleware(1), atualizarAluno);
router.delete("/:id", authMiddleware(1), deletarAluno);
router.delete("/", authMiddleware(1), deletarAlunoSelecionados);

export default router;
