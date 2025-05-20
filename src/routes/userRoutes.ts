import { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} from '../controllers/userController';

const router = Router();

// GET all users
router.get('/', getAllUsers);

// GET single user by ID
router.get('/:id', getUserById);

// POST create new user
router.post('/', createUser);

// PUT update user
router.put('/:id', updateUser);

// DELETE user
router.delete('/:id', deleteUser);

export default router; 