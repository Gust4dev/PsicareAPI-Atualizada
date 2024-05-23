import express from "express";
import * as consultaController from "../controllers/consulta";

const router = express.Router();

// Rotas para consultas
router.post("/consulta", consultaController.criarConsulta);
router.post("/consulta/:id", consultaController.atualizarConsulta);
router.delete("/consulta/:id", consultaController.deletarConsulta);
router.get("/consulta/:id", consultaController.obterConsultaPorID);
router.get("/consultas", consultaController.listarConsultas);

export default router;
