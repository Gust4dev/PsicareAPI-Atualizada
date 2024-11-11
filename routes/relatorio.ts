import { Router } from "express";
import {
  criarRelatorio,
  listarRelatorios,
  atualizarRelatorio,
  deletarRelatorio,
  baixarArquivo,
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
  authMiddleware([0, 1, 3]),
  upload.fields([{ name: "prontuario" }, { name: "assinatura" }]),
  uploadFilesToGridFS,
  criarRelatorio
);

router.patch(
  "/:id",
  authMiddleware([0, 2, 3]),
  upload.fields([{ name: "prontuario" }, { name: "assinatura" }]),
  uploadFilesToGridFS,
  atualizarRelatorio
);

router.get("/", authMiddleware([0, 2, 3]), listarRelatorios);
router.delete("/:id", authMiddleware([0]), deletarRelatorio);
router.patch(
  "/:id",
  authMiddleware([0, 2, 3]),
  uploadFilesToGridFS,
  atualizarRelatorio
);
router.get("/download/:fileId", baixarArquivo);

export default router;
