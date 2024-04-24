import express from "express";
const router = express.Router();
import { 
    createUser,

    loginUser,

    createAluno,
    getAluno,
    getAlunoById,
    getAlunosSelect,
    getAlunosByIdProfessor,
    patchAluno,
    PatchAlunoArquivo,
    deleteAluno,

    createPaciente,
    getPaciente,
    getPacienteById,
    getPacientesByIdAluno,
    patchPaciente,
    patchPacienteArquivo,
    deletePaciente,

    createProfessor,
    getProfessores,
    getProfessorById,
    patchProfessor,
    patchProfessorArquivo,
    deleteProfessor,
    getProfessoresSelect,
    
    createSecretario,
    getSecretarioById,
    getSecretarios,
    patchSecretario,
    patchSecretarioArquivo,
    deleteSecretario,

    createConsulta,
    getConsultas,
    patchConsulta,
    deleteConsulta,
    getPacientesSelect,
    

} from "../controllers/auth"    ;

// Rota User:
router.post("/register", createUser);

// Rota Login:
router.post("/login", loginUser);

// Rotas Aluno 
router.post("/registroAluno", createAluno);
router.get("/getAlunos", getAluno);
router.get("/getAlunoById/:id", getAlunoById)
router.get("/getAlunosSelect", getAlunosSelect)
router.get("/getAlunosByIdProfessor/:id", getAlunosByIdProfessor)
router.patch("/attAluno/:id", patchAluno);
router.patch("/arquivarAluno/:id", PatchAlunoArquivo);
router.delete("/deleteAluno/:id", deleteAluno);

// Rotas Paciente
router.post("/registroPaciente", createPaciente);
router.get("/getPacientes", getPaciente);
router.get("/getPacienteById/:id", getPacienteById);
router.get("/getPacientesByIdAluno/:id", getPacientesByIdAluno)
router.get("/getPacientesSelect", getPacientesSelect)
router.patch("/attPaciente/:id", patchPaciente);
router.patch("/arquivarPacientes", patchPacienteArquivo);
router.delete("/deletePaciente/:id", deletePaciente);

// Rotas Professor 
router.post("/registroProfessor", createProfessor);
router.get("/getProfessores", getProfessores);
router.get("/getProfessorById/:id", getProfessorById)
router.get("/getProfessoresSelect", getProfessoresSelect);
router.patch("/attProfessor/:id", patchProfessor);
router.patch("/arquivarProfessor", patchProfessorArquivo);
router.delete("/deleteProfessor/:id", deleteProfessor);


// Rotas Secretario
router.post("/registroSecretario", createSecretario);
router.get("/getSecretarios", getSecretarios);
router.get("/getSecretarioById/:id", getSecretarioById);
router.patch("/attSecretario/:id", patchSecretario);
router.patch("/arquivarSecretario", patchSecretarioArquivo);
router.delete("/deleteSecretario/:id", deleteSecretario);

// Rotas Consulta
router.post("/registrarConsulta", createConsulta);
router.get("/getConsulta", getConsultas);
router.patch("/attConsulta/:id", patchConsulta);
router.delete("/deleteConsulta/:id", deleteConsulta )
// obs. da errqo se tentar utilizar export default
module.exports = router
