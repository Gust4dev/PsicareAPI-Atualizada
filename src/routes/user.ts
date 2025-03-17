import { Router } from "express";
import {
  createUser,
  loginUser,
  listarUsers,
  obterUserPorID,
  patchUser,
  deleteUser,
  obterUltimoUserCriado,
  updateSelfUser,
} from "../controllers/user";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.post("/login", loginUser);
router.post("/", authMiddleware([0]), createUser);
router.get("/", authMiddleware([0]), listarUsers);
router.get("/:id", authMiddleware([0]), obterUserPorID);
router.get("/ultimo/criado", authMiddleware([0]), obterUltimoUserCriado);
router.patch("/:id", authMiddleware([0]), patchUser);
router.patch("/alterar/me", authMiddleware([0, 1, 2, 3, 4]), updateSelfUser);
router.delete("/:id", authMiddleware([0]), deleteUser);

export default router;
