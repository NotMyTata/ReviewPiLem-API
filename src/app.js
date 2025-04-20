import express from 'express'
import usersRoute from './routes/usersRoute.js'
import filmsRoute from './routes/filmsRoute.js'

const app = express()
app.use(express.json())
app.use('/users', usersRoute)
app.use('/films', filmsRoute)

app.use((err, req, res, next) => {
    console.log(err)
    res.status(500).send('Something went wrong')
})

app.listen(1234, () => {
    console.log('Server running at http://localhost:1234')
})

export default app

// /* Admin Requests */

// // Menambah genre baru
// app.post('/films/genre', async (req, res) => {
//     //TODO check role, admin atau nggak
//     const { nama } = req.body
//     const result = await createGenre(nama)
//     res.status(result.code).send({
//         "message": `${result.message}`
//     })
// })

// // Menambah film baru
// app.post('/films', async (req, res) => {
//     //TODO check role, admin atau nggak
//     const { judul, sinopsis, status_penayangan, total_episode, tanggal_rilis } = req.body
//     const result = await createFilm(judul, sinopsis, status_penayangan, total_episode, tanggal_rilis)
//     res.status(201).send(result)
// })

// /* User Requests */

// // Register
// app.post('/users/register', async (req, res) => {
//     const { username, display_name, password } = req.body
//     const result = await register(username, display_name, password)
//     res.status(result.code).send(result.message)
// })

// // Login
// app.post('/users/login', async (req, res) => {
//     const { username, password } = req.body
//     const result = await login(username, password)
//     res.status(result.code).send(result)
// })

// // Menambah film ke list
// app.post('/films/:id', async (req, res) => {
//     const id = req.params.id
//     console.log(req.user)
//     res.status(200).send()
// })

// // Update profile
// app.patch('/users', async (req, res) => {

// })

// // Membuat review
// app.post('/films/:id/review', async (req, res) => {

// })

// // Rating review
// app.patch('/films/:id/review', async (req, res) => {

// })

// /* Guest Requests */

// // Melihat daftar film
// app.get('/films', async (req, res) => {
//     const films = await getFilms()
//     res.status(200).send(films)
// })

// // Melihat detail film
// app.get('/films/:id', async (req, res) => {
//     const id = req.params.id
//     const film = await getFilm(id)
//     res.status(200).send(film)
// })

// // Melakukan pencarian film berdasarkan judul
// app.get('/search', async (req, res) => {
//     const judul = req.query.judul
//     const films = await searchFilms(judul)
//     res.status(200).send(films)
// })

// // Melihat profil, list_film, dan review user
// app.get('/users/:id', async (req, res) => {
//     const id = req.params.id
//     const user = await getUser(id)
//     res.status(200).send(user)
// })