import pool from "../server.js"

export async function createGenre(nama){
    const [rows] = await pool.query(`SELECT * FROM genre WHERE nama LIKE ?`, [nama])
    if(rows[0] == undefined){
        const [rows] = await pool.query(`INSERT INTO genre VALUES (?)`, [nama])
        return {
            "code": 201,
            "message": `Genre ${nama} berhasil dibuat`
        }
    } else {
        return {
            "code": 409,
            "message": `Genre ${nama} sudah terbuat`
        }
    }
}

export async function createFilm(judul, sinopsis, status_penayangan, total_episode, tanggal_rilis){
    //TODO auth if its admin or not
    const [result] = await pool.query(`
        INSERT INTO film (judul, sinopsis, status_penayangan, total_episode, tanggal_rilis) 
        VALUES (?, ?, ?, ?, ?)`, [judul, sinopsis, status_penayangan, total_episode, tanggal_rilis])
    return getFilm(result.insertId)
}

export async function addFilmToList(id){
    
}
export async function makeReview(){

}

export async function rateReview(){

}

export async function getFilms(){
    const [rows] = await pool.query(`SELECT judul, status_penayangan, total_episode, tanggal_rilis, rating_mean FROM film`)
    return rows
}

export async function getFilm(id){
    const [rows] = await pool.query(`SELECT * FROM film WHERE id = ? LIMIT 1`, [id])
    return rows[0]
}

export async function searchFilms(judul){
    const [rows] = await pool.query(`SELECT * FROM film WHERE judul LIKE ?`, ['%' + judul + '%'])
    return rows
}