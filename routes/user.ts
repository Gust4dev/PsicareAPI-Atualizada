import express from "express";
const router = express.Router();
import { createUser, loginUser } from "../controllers/user";

// Rota User:
router.post("/register", createUser);

// Rota Login:
router.post("/login", loginUser);

export { router };
