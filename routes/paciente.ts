import { Router } from "express";
import {
  criarPaciente,
  listarPacientes,
  obterPacientePorID,
  listarPacientesPorAlunoId,
  atualizarPaciente,
  arquivarPaciente,
  obterUltimoPacienteCriado,
  deletarPacienteSelecionados,
} from "../controllers/paciente";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// Rotas para Pacientes
router.post("/", authMiddleware([0, 1]), criarPaciente);
router.get("/", authMiddleware([0, 1, 2]), listarPacientes);
router.get("/:id", authMiddleware([0, 1, 2]), obterPacientePorID);
router.get("/aluno/:id", authMiddleware([0, 1, 2]), listarPacientesPorAlunoId);
router.get("/ultimo/criado", authMiddleware([0, 1]), obterUltimoPacienteCriado);
router.patch("/:id", authMiddleware([0, 1]), atualizarPaciente);
router.patch("/arquivar/:id", authMiddleware([0, 1]), arquivarPaciente);
router.delete("/", authMiddleware([0, 1]), deletarPacienteSelecionados);

export default router;
