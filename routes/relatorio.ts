import { Router } from "express";
import {
  criarRelatorio,
  listarRelatorios,
  atualizarRelatorio,
  arquivarRelatorio,
  deletarRelatorio,
} from "../controllers/relatorio";
import {
  authMiddleware,
  upload,
  uploadFilesToGridFS,
} from "../middleware/auth";

const router = Router();

// Rotas Relatorio
router.post(
  "/",
  authMiddleware([0, 3]),
  upload.fields([{ name: "prontuario" }, { name: "assinatura" }]),
  uploadFilesToGridFS,
  criarRelatorio
);

router.patch(
  "/:id",
  authMiddleware([0, 2]),
  upload.fields([{ name: "prontuario" }, { name: "assinatura" }]),
  uploadFilesToGridFS,
  atualizarRelatorio
);

router.get("/", authMiddleware([0, 2, 3]), listarRelatorios);
router.delete("/:id", authMiddleware([0]), deletarRelatorio);
router.patch("/arquivar/:id", authMiddleware([0]), arquivarRelatorio);

export default router;
