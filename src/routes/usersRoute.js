import { Router } from 'express';
import { register, login, updateProfile, getUser } from '../controller/usersController.js'
import { authenticateToken } from '../middleware/auth.js';

const router = Router()

router.post('/register', register)
router.post('/login', login)
router.get('/:id', getUser)
router.patch('/:id', authenticateToken, updateProfile)

export default router