import { Router } from "express";
import {
  criarPaciente,
  listarPacientes,
  obterPacientePorID,
  listarPacientesPorIDAluno,
  atualizarPaciente,
  deletarPaciente,
  obterUltimoPacienteCriado,
  listarPacientePaginados,
  deletarPacienteSelecionados,
} from "../controllers/paciente";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// Rotas para Pacientes
router.post("/", authMiddleware(1), criarPaciente);
router.get("/", authMiddleware(2), listarPacientes);
router.get("/paginado", authMiddleware(2), listarPacientePaginados);
router.get("/:id", authMiddleware(2), obterPacientePorID);
router.get("/aluno/:id", authMiddleware(2), listarPacientesPorIDAluno);
router.get("/select", authMiddleware(2), listarPacientes);
router.get("/ultimo/criado", authMiddleware(1), obterUltimoPacienteCriado);
router.patch("/:id", authMiddleware(1), atualizarPaciente);
router.delete("/:id", authMiddleware(1), deletarPaciente);
router.delete("/", authMiddleware(1), deletarPacienteSelecionados);

export default router;
