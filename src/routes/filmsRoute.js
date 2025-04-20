import { Router } from 'express';
import { createGenre, createFilm, addFilmToList, makeReview, rateReview, getFilms, getFilm } from '../controller/filmsController.js'
import { authenticateToken } from '../middleware/auth.js';

const router = Router()

router.post('/genre', authenticateToken, createGenre)
router.post('/', authenticateToken, createFilm)
router.post('/:id', authenticateToken, addFilmToList)
router.post('/:id/review', authenticateToken, makeReview)
router.patch('/:id/review', authenticateToken, rateReview)
router.get('/', getFilms)
router.get('/:id', getFilm)

export default router