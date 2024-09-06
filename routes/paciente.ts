import { Router } from "express";
import {
  criarPaciente,
  listarPacientes,
  obterPacientePorID,
  listarPacientesPoralunoId,
  atualizarPaciente,
  arquivarPaciente,
  obterUltimoPacienteCriado,
  deletarPacienteSelecionados,
} from "../controllers/paciente";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// Rotas para Pacientes
router.post("/", authMiddleware(1), criarPaciente);
router.get("/", authMiddleware(2), listarPacientes);
router.get("/:id", authMiddleware(2), obterPacientePorID);
router.get("/aluno/:id", authMiddleware(2), listarPacientesPoralunoId);
router.get("/ultimo/criado", authMiddleware(1), obterUltimoPacienteCriado);
router.patch("/:id", authMiddleware(1), atualizarPaciente);
router.patch("/arquivar/:id", authMiddleware(1), arquivarPaciente);
router.delete("/", authMiddleware(1), deletarPacienteSelecionados);

export default router;
