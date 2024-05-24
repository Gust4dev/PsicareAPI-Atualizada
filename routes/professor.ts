import { Router } from 'express';
import {
  createProfessor,
  getProfessores,
  getProfessorById,
  getProfessoresSelect,
  patchProfessor,
  patchProfessorArquivo,
  deleteProfessor,
} from '../controllers/professor';

const router = Router();

// Routes for Professors
router.post('/', createProfessor);
router.get('/', getProfessores);
router.get('/:id', getProfessorById);
router.get('/select', getProfessoresSelect);
router.patch('/:id', patchProfessor);
router.patch('/:id/archive', patchProfessorArquivo);
router.delete('/:id', deleteProfessor);

export default router;
