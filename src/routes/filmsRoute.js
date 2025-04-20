import { Router } from 'express';
import { createGenre, createFilm, addFilmToList, makeReview, updateReview, rateReview, getFilm, searchFilms } from '../controller/filmsController.js'
import { authenticateToken } from '../middleware/auth.js';

const router = Router()

router.post('/genre', authenticateToken, createGenre)
router.post('/', authenticateToken, createFilm)
router.post('/:id', authenticateToken, addFilmToList)
router.post('/:id/review', authenticateToken, makeReview)
router.patch('/:id/review', authenticateToken, updateReview)
router.post('/:id/review/:rid', authenticateToken, rateReview)
router.get('/:id', getFilm)
router.get('/', searchFilms)

export default router