import { Router } from "express";
import {
  criarAluno,
  listarAlunos,
  obterAlunoPorID,
  listarNomesAlunos,
  listarAlunosPorProfessorID,
  atualizarAluno,
  deletarAluno,
  obterUltimoAlunoCriado,
  listarAlunosPaginados,
} from "../controllers/aluno";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// Rotas alunos
router.post("/", authMiddleware(2), criarAluno);
router.get("/", listarAlunos);
router.get("/paginado", listarAlunosPaginados);
router.get("/:id", obterAlunoPorID);
router.get("/select", listarNomesAlunos);
router.get("/professor/:id", listarAlunosPorProfessorID);
router.patch("/:id", atualizarAluno);
router.delete("/:id", deletarAluno);
router.get("/ultimo/criado", obterUltimoAlunoCriado);

export default router;
