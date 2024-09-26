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
router.post("/", authMiddleware([0]), criarAluno);
router.get("/", authMiddleware([0, 1, 2]), listarAlunos);
router.get("/:id", authMiddleware([0, 1, 2]), obterAlunoPorID);
router.get("/professor/:id", authMiddleware([0, 1, 2]), listarAlunosPorProfessorId);
router.get("/ultimo/criado", authMiddleware([0, 1]), obterUltimoAlunoCriado);
router.patch("/:id", authMiddleware([0]), atualizarAluno);
router.delete("/:id", authMiddleware([0]), deletarAluno);
router.delete("/", authMiddleware([0]), deletarAlunoSelecionados);

export default router;
