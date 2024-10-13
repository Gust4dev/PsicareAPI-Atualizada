import { Router } from "express";
import {
  criarConsulta,
  listarConsultas,
  obterConsultaPorID,
  atualizarConsulta,
  deletarConsulta,
  obterUltimaConsultaCriada,
  deletarConsultas,
} from "../controllers/consulta";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// Rotas consulta
router.post("/", authMiddleware([0, 1, 2]), criarConsulta);
router.get("/", authMiddleware([0, 1, 2]), listarConsultas);
router.get("/:id", authMiddleware([0, 1, 2]), obterConsultaPorID);
router.get("/ultima/criada", authMiddleware([0, 1]), obterUltimaConsultaCriada);
router.patch("/:id", authMiddleware([0, 1]), atualizarConsulta);
router.delete("/:id", authMiddleware([0, 1]), deletarConsulta);
router.delete("/delete-serie", authMiddleware([0, 1]), deletarConsultas)

export default router;
