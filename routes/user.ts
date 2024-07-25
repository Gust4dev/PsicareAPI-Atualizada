import { Router } from "express";
import {
  createUser,
  loginUser,
  listarUsers,
  obterUserPorID,
  patchUser,
  deleteUser,
  obterUltimoUserCriado,
} from "../controllers/user";

const router = Router();

router.post("/login", loginUser);
router.post("/", createUser);
router.get("/", listarUsers);
router.get("/:id", obterUserPorID);
router.get('/ultimo/criado', obterUltimoUserCriado);
router.patch("/:id", patchUser);
router.delete("/:id", deleteUser);

export default router;
