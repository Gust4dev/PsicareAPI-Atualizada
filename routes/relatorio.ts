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
  downloadFileFromGridFS,
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
  authMiddleware([0, 1, 3]),
  upload.fields([{ name: "prontuario" }, { name: "assinatura" }]),
  uploadFilesToGridFS,
  atualizarRelatorio
);

router.get("/", authMiddleware([0, 2, 3]), listarRelatorios);
router.delete("/:id", authMiddleware([0]), deletarRelatorio);
router.patch("/arquivar/:id", authMiddleware([0]), arquivarRelatorio);
router.get("/download/:fileId", downloadFileFromGridFS);

export default router;
