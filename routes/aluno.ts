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
  deletarAlunoSelecionados,
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
router.get("/ultimo/criado", obterUltimoAlunoCriado);
router.patch("/:id", atualizarAluno);
router.delete("/:id", deletarAluno);
router.delete('/', deletarAlunoSelecionados);

export default router;
