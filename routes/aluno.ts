import express from "express";
import {
    createAluno,
    getAluno,
    getAlunoById,
    getAlunosSelect,
    getAlunosByIdProfessor,
    patchAluno,
  PatchAlunoArquivo,
  deleteAluno,
} from "../controllers/aluno";

const router = express.Router();

// Rotas Aluno
router.post("/registroAluno", createAluno);
router.get("/getAlunos", getAluno);
router.get("/getAlunoById/:id", getAlunoById);
router.get("/getAlunosSelect", getAlunosSelect);
router.get("/getAlunosByIdProfessor/:id", getAlunosByIdProfessor);
router.patch("/attAluno/:id", patchAluno);
router.patch("/arquivarAluno/:id", PatchAlunoArquivo);
router.delete("/deleteAluno/:id", deleteAluno);

export { router };