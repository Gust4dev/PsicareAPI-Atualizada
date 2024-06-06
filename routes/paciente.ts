import { Router } from 'express';
import {
  criarPaciente,
  listarPacientes,
  obterPacientePorID,
  listarPacientesPorIDAluno,
  atualizarPaciente,
  atualizarStatusArquivado,
  deletePaciente
} from '../controllers/paciente';

const router = Router();

// Rotas para Pacientes
router.post('/', criarPaciente);
router.get('/', listarPacientes);
router.get('/:id', obterPacientePorID);
router.get('/aluno/:id', listarPacientesPorIDAluno);
router.get('/select', listarPacientes);
router.patch('/:id', atualizarPaciente);
router.patch('/:id/arquivar', atualizarStatusArquivado);
router.delete('/:id', deletePaciente);

export default router;
