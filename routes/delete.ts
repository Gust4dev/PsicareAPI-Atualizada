import express from "express";
import { deleteAluno } from "../controllers/aluno";
import { deleteConsulta } from "../controllers/consulta";
import { deletePaciente } from "../controllers/paciente";
import { deleteProfessor } from "../controllers/professor";
import { deleteSecretario } from "../controllers/secretario";

const router = express.Router();

// Delete aluno rota
router.delete("/deleteAluno/:id", deleteAluno);
// Delete consulta rota
router.delete("/deleteConsulta/:id", deleteConsulta);
// Delete paciente rota
router.delete("/deletePaciente/:id", deletePaciente);
// Delete professor rota
router.delete("/deleteProfessor/:id", deleteProfessor);
// Delete secretario rota
router.delete("/deleteSecretario/:id", deleteSecretario);

export { router };
