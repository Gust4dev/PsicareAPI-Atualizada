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
} from '../controllers/professor';


const router = Router();

// Routes for Professors
router.post('/', createProfessor);
router.get('/', listarProfessores);
router.get("/paginado", listarProfessorPaginados);
router.get('/:id', getProfessorById);
router.get('/select', getProfessoresSelect);
router.patch('/:id', patchProfessor);
router.delete('/:id', deleteProfessor);
router.get('/ultimo/criado', obterUltimoProfessorCriado);

export default router;
