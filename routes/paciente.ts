import { Router } from 'express';
import {
  criarPaciente,
  listarPacientes,
  obterPacientePorID,
  listarPacientesPorIDAluno,
  atualizarPaciente,
  deletePaciente,
  obterUltimoPacienteCriado,
  listarPacientePaginados,
  deletarPacienteSelecionados,
} from '../controllers/paciente';

const router = Router();

// Rotas para Pacientes
router.post('/', criarPaciente);
router.get('/', listarPacientes);
router.get("/paginado", listarPacientePaginados);
router.get('/:id', obterPacientePorID);
router.get('/aluno/:id', listarPacientesPorIDAluno);
router.get('/select', listarPacientes);
router.patch('/:id', atualizarPaciente);
router.get('/ultimo/criado', obterUltimoPacienteCriado);
router.delete('/:id', deletePaciente);
router.delete('/', deletarPacienteSelecionados);

export default router;
