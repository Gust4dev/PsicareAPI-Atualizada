import { Router } from "express";
import {
  criarRelatorio,
  listarRelatorios,
  atualizarRelatorio,
  deletarRelatorio,
  baixarArquivo,
  arquivarRelatorio,
  atualizarAssinaturaProfessor,
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

router.get("/download/:fileId", baixarArquivo);

router.get("/", authMiddleware([0, 2, 3]), listarRelatorios);

router.delete("/:id", authMiddleware([0]), deletarRelatorio);

router.patch("/arquivar/:id", authMiddleware([0, 3]), arquivarRelatorio);

router.patch(
  "/assinatura/:id",
  upload.fields([{ name: "prontuario" }, { name: "assinatura" }]),
  uploadFilesToGridFS,
  atualizarAssinaturaProfessor
);


router.patch(
  "/:id",
  authMiddleware([0, 2, 3]),
  upload.fields([{ name: "prontuario" }, { name: "assinatura" }]),
  uploadFilesToGridFS,
  atualizarRelatorio
);

export default router;
