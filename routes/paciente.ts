import { Router } from "express";
import {
  criarPaciente,
  listarPacientes,
  obterPacientePorID,
  listarPacientesPorEncaminhador,
  atualizarPaciente,
  arquivarPaciente,
  obterUltimoPacienteCriado,
  listarPacientesPaginados,
  deletarPacienteSelecionados,
} from "../controllers/paciente";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// Rotas para Pacientes
router.post("/", authMiddleware(1), criarPaciente);
router.get("/", authMiddleware(2), listarPacientes);
router.get("/paginado", authMiddleware(2), listarPacientesPaginados);
router.get("/:id", authMiddleware(2), obterPacientePorID);
router.get("/encaminhador/:nome", authMiddleware(2), listarPacientesPorEncaminhador);
router.get("/ultimo/criado", authMiddleware(1), obterUltimoPacienteCriado);
router.patch("/:id", authMiddleware(1), atualizarPaciente);
router.patch("/paciente/arquivar/:id", authMiddleware(1), arquivarPaciente);
router.delete("/", authMiddleware(1), deletarPacienteSelecionados);

export default router;
