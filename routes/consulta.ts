import { Router } from 'express';
import {
  criarConsulta,
  listarConsultas,
  obterConsultaPorID,
  atualizarConsulta,
  deletarConsulta,
  obterUltimaConsultaCriada,
  listarConsultaPaginadas,
} from '../controllers/consulta';


const router = Router();

// Rotas consulta
router.post('/', criarConsulta);
router.get('/', listarConsultas);
router.get('/paginado', listarConsultaPaginadas);
router.get('/:id', obterConsultaPorID);
router.get('/ultima/criada', obterUltimaConsultaCriada);
router.patch('/:id', atualizarConsulta);
router.delete('/:id', deletarConsulta);

export default router;
