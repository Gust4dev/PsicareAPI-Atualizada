import { Router } from 'express';
import {
  criarPaciente,
  listarPacientes,
  obterPacientePorID,
  listarPacientesPorIDAluno,
  atualizarPaciente,
  deletePaciente,
  obterUltimoPacienteCriado,
} from '../controllers/paciente';

const router = Router();

// Rotas para Pacientes
router.post('/', criarPaciente);
router.get('/', listarPacientes);
router.get('/:id', obterPacientePorID);
router.get('/aluno/:id', listarPacientesPorIDAluno);
router.get('/select', listarPacientes);
router.patch('/:id', atualizarPaciente);
router.delete('/:id', deletePaciente);
router.get('/ultimo/criado', obterUltimoPacienteCriado);

export default router;
