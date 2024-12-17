import { Router } from "express";
import { getGerencia } from "../controllers/gerencia";

const router = Router();

router.get("/", getGerencia);

export default router;
