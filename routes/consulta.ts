import { Router } from 'express';
import {
  criarConsulta,
  listarConsultas,
  obterConsultaPorID,
  atualizarConsulta,
  deletarConsulta,
  obterUltimaConsultaCriada,
} from '../controllers/consulta';


const router = Router();

// Rotas consulta
router.post('/', criarConsulta);
router.get('/', listarConsultas);
router.get('/:id', obterConsultaPorID);
router.patch('/:id', atualizarConsulta);
router.delete('/:id', deletarConsulta);
router.get('/ultima/criada', obterUltimaConsultaCriada);

export default router;
