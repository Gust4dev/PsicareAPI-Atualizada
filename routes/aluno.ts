import { Router } from 'express';
import {
  criarAluno,
  listarAlunos,
  obterAlunoPorID,
  listarNomesAlunos,
  listarAlunosPorProfessorID,
  atualizarAluno,
  arquivarAluno,
  deletarAluno,
} from '../controllers/aluno';
import { authMiddleware } from '../middleware/auth_midd';


const router = Router();
router.use(authMiddleware);

// Rotas alunos
router.post('/', criarAluno);
router.get('/', listarAlunos);
router.get('/:id', obterAlunoPorID);
router.get('/select', listarNomesAlunos);
router.get('/professor/:id', listarAlunosPorProfessorID);
router.patch('/:id', atualizarAluno);
router.patch('/:id/archive', arquivarAluno);
router.delete('/:id', deletarAluno);

export default router;
