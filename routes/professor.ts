import { Router } from 'express';
import {
  createProfessor,
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
router.post('/', createProfessor);
router.get('/', listarProfessores);
router.get("/paginado", listarProfessorPaginados);
router.get('/:id', getProfessorById);
router.get('/select', getProfessoresSelect);
router.patch('/:id', patchProfessor);
router.get('/ultimo/criado', obterUltimoProfessorCriado);
router.delete('/:id', deleteProfessor);
router.delete('/', deletarProfessorSelecionados);

export default router;
