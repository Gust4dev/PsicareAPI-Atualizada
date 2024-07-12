import { Router } from 'express';
import {
  criarProfessor,
  listarProfessores,
  getProfessorById,
  getProfessoresSelect,
  patchProfessor,
  deleteProfessor,
  obterUltimoProfessorCriado,
  listarProfessorPaginados,
  deletarProfessorSelecionados,
} from '../controllers/professor';


const router = Router();

// Routes for Professors
router.post('/', criarProfessor);
router.get('/', listarProfessores);
router.get("/paginado", listarProfessorPaginados);
router.get('/:id', getProfessorById);
router.get('/select', getProfessoresSelect);
router.get('/ultimo/criado', obterUltimoProfessorCriado);
router.patch('/:id', patchProfessor);
router.delete('/:id', deleteProfessor);
router.delete('/', deletarProfessorSelecionados);

export default router;
