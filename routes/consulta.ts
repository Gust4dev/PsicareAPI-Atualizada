import express from "express";
const router = express.Router();
import {
  createConsulta,
  getConsultas,
  patchConsulta,
  deleteConsulta,
} from "../controllers/consulta";

// Rotas Consulta
router.post("/registrarConsulta", createConsulta);
router.get("/getConsulta", getConsultas);
router.patch("/attConsulta/:id", patchConsulta);
router.delete("/deleteConsulta/:id", deleteConsulta);

export { router };