import express from "express";
const router = express.Router();
import {
  createProfessor,
  getProfessores,
  getProfessorById,
  patchProfessor,
  patchProfessorArquivo,
  deleteProfessor,
  getProfessoresSelect,
} from "../controllers/professor";

// Rotas Professor
router.post("/registroProfessor", createProfessor);
router.get("/getProfessores", getProfessores);
router.get("/getProfessorById/:id", getProfessorById);
router.get("/getProfessoresSelect", getProfessoresSelect);
router.patch("/attProfessor/:id", patchProfessor);
router.patch("/arquivarProfessor", patchProfessorArquivo);
router.delete("/deleteProfessor/:id", deleteProfessor);

export { router };