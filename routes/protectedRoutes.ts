// routes/protectedRoutes.ts
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Rota para admin (nível 1)
router.get('/admin', authMiddleware(1), (req, res) => {
  res.status(200).json({ message: 'Rota de administrador', user: req.user });
});

// Rota para manager (nível 2)
router.get('/manager', authMiddleware(2), (req, res) => {
  res.status(200).json({ message: 'Rota de gerente', user: req.user });
});

// Rota para user (nível 3)
router.get('/user', authMiddleware(3), (req, res) => {
  res.status(200).json({ message: 'Rota de usuário', user: req.user });
});

// Rota para guest (nível 4)
router.get('/guest', authMiddleware(4), (req, res) => {
  res.status(200).json({ message: 'Rota de convidado', user: req.user });
});

export default router;
