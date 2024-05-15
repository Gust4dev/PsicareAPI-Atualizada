import express from "express";
const router = express.Router();
import {
  createPaciente,
  getPaciente,
  getPacienteById,
  getPacientesByIdAluno,
  patchPaciente,
  patchPacienteArquivo,
  deletePaciente,
  getPacientesSelect,
} from "../controllers/paciente";

// Rotas Paciente
router.post("/registroPaciente", createPaciente);
router.get("/getPacientes", getPaciente);
router.get("/getPacienteById/:id", getPacienteById);
router.get("/getPacientesByIdAluno/:id", getPacientesByIdAluno);
router.get("/getPacientesSelect", getPacientesSelect);
router.patch("/attPaciente/:id", patchPaciente);
router.patch("/arquivarPacientes", patchPacienteArquivo);
router.delete("/deletePaciente/:id", deletePaciente);

export { router };