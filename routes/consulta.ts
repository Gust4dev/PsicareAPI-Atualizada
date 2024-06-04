import { Router } from 'express';
import {
  criarConsulta,
  listarConsultas,
  obterConsultaPorID,
  atualizarConsulta,
  deletarConsulta,
} from '../controllers/consulta';
import { authMiddleware } from '../middleware/auth_midd';


const router = Router();
router.use(authMiddleware);

// Rotas consulta
router.post('/', criarConsulta);
router.get('/', listarConsultas);
router.get('/:id', obterConsultaPorID);
router.patch('/:id', atualizarConsulta);
router.delete('/:id', deletarConsulta);

export default router;
