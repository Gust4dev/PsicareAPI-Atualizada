import express from "express";
import * as pacienteController from "../controllers/paciente";

const router = express.Router();

router.post("/", pacienteController.criarPaciente);
router.get("/", pacienteController.listarPacientes);
router.get("/:id", pacienteController.obterPacientePorID);
router.get("/aluno/:id", pacienteController.listarPacientesPorIDAluno);
router.get("/select", pacienteController.listarPacientes);
router.patch("/:id", pacienteController.atualizarPaciente);
router.patch("/:id/arquivar", pacienteController.atualizarStatusArquivado);
router.delete("/:id", pacienteController.deletePaciente);

export default router;
