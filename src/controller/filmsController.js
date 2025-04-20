import pool from "../server.js"

export const createGenre = async (req, res) => {
    if(!req.user.is_admin){
        return res.status(403).send({
            "status": "gagal",
            "message": "otoritas tidak cukup"
        })
    }
    
    const { nama } = req.body
    const [result] = await pool.query(`
        SELECT * 
        FROM genre 
        WHERE nama LIKE ?`, [nama])
    if(result[0] == undefined){
        const [result] = await pool.query(`
            INSERT INTO genre 
            VALUES (?)`, [nama])
        return res.status(201).send({
            "status": "sukses",
            "message": `Genre ${nama} berhasil dibuat`
        })
    } else {
        return res.status(409).send({
            "status": "gagal",
            "message": `Genre ${nama} sudah terbuat`
        })
    }
}

export const createFilm = async (req, res) => {
    if(!req.user.is_admin){
        return res.status(403).send({
            "status": "gagal",
            "message": "otoritas tidak cukup"
        })
    }

    const { judul, sinopsis, status_penayangan, total_episode, tanggal_rilis } = req.body
    await pool.query(`
        INSERT INTO film (judul, sinopsis, status_penayangan, total_episode, tanggal_rilis) 
        VALUES (?, ?, ?, ?, ?)`, [judul, sinopsis, status_penayangan, total_episode, tanggal_rilis])
    return res.status(201).send({
        "status": "sukses",
        "message": "film berhasil dibuat"
    })
}

export const addFilmToList = async (req, res) => {
    const film_id = parseInt(req.params.id)
    const user_id = req.used.id

    const [result] = await pool.query(`
        SELECT * 
        FROM list_film 
        WHERE users_id = ? AND film_id = ? 
        LIMIT 1`, [user_id, film_id])

    if(result[0] == undefined){
        await pool.query(`
            INSERT INTO list_film 
            VALUES (?, ?, \'plan_to_watch\')`, [user_id, film_id])
        return res.status(201).send({
            "status": "sukses",
            "message": "film berhasil ditambahkan ke dalam list"
        })
    }
    return res.status(409).send({
        "status": "gagal",
        "message": "film sudah ada di list"
    })
    
}
export const makeReview = async (req, res) => {
    const film_id = parseInt(req.params.id)
    const user_id = req.user.id

    const [result] = await pool.query(`
        SELECT * 
        FROM review 
        WHERE users_id = ? and film_id = ? 
        LIMIT 1`, [user_id, film_id])

    if(result[0] == undefined){
        const { rating, komentar } = req.body

        if(rating < 0 || rating > 10){
            return res.status(400).send({
                "status": "gagal",
                "message": "nilai rating tidak bisa kurang dari 0 atau lebih dari 10"
            })
        }
        
        await pool.query(`
            INSERT INTO review (users_id, film_id, rating, komentar) 
            VALUES (?, ?, ?, ?)`, 
            [user_id, film_id, rating, komentar])

        await pool.query(`
            UPDATE film 
            SET rating_mean = ((rating_mean * total_review) + ?) / (total_review + 1), total_review = total_review + 1
            WHERE id = ?`, [rating, film_id])

        return res.status(201).send({
            "status": "sukses",
            "message": "review berhasil terbuat"
        })
    }
    return res.status(409).send({
        "status": "gagal",
        "message": "review sudah terbuat, tidak bisa membuat lebih dari satu"
    })
}

export const updateReview = async (req, res) => {
    const user_id = req.user.id
    const film_id = parseInt(req.params.id)

    const [result] = await pool.query(`
        SELECT * 
        FROM review 
        WHERE users_id = ? and film_id = ? 
        LIMIT 1`, [user_id, film_id])

    if(result[0] != undefined){
        const review = result[0]
        const initial_rating = result[0].rating
        Object.assign(review, req.body)

        await pool.query(`
            UPDATE review
            SET rating = ?, komentar = ?
            WHERE users_id = ? AND film_id = ?`, [review.rating, review.komentar, user_id, film_id])

        await pool.query(`
            UPDATE film 
            SET rating_mean = ((rating_mean * total_review) - ? + ?) / total_review
            WHERE id = ?`, [initial_rating, review.rating, film_id])

        return res.status(200).send({
            "status": "sukses",
            "message": "review berhasil diperbarui"
        })
    }
    return res.status(400).send({
        "status": "gagal",
        "message": "tidak ada review yang bisa diperbarui"
    })
}

export const rateReview = async (req, res) => {
    const curr_user_id = req.user.id
    const reviewer_id = parseInt(req.params.rid)
    const film_id = parseInt(req.params.id)
    const { is_liked } = req.body

    const [result] = await pool.query(`
        SELECT * 
        FROM like_review
        WHERE users_id = ? AND review_users_id = ? AND review_film_id = ?
        LIMIT 1`, [curr_user_id, reviewer_id, film_id])

    if(result[0] == undefined){
        await pool.query(`
            INSERT INTO like_review 
            VALUES (?, ?, ?, ?)`, [curr_user_id, reviewer_id, film_id, is_liked])

        if(is_liked){
            await pool.query(`
                UPDATE review 
                SET total_like = total_like + 1
                WHERE users_id = ? AND film_id = ?`, [reviewer_id, film_id])
        } else if (is_liked == false) {
            await pool.query(`
                UPDATE review 
                SET total_dislike = total_dislike + 1
                WHERE users_id = ? AND film_id = ?`, [reviewer_id, film_id])
        }
        
        return res.status(201).send({
            "status": "sukses",
            "message": "aksi rate review berhasil"
        })
    }

    if(is_liked == result[0].is_liked){
        return res.status(400).send({
            "status": "gagal",
            "message": "tidak ada yang diubah"
        })
    }

    if(is_liked){
        if(result[0].is_liked == false){
            await pool.query(`
                UPDATE review 
                SET total_dislike = total_dislike - 1
                WHERE users_id = ? AND film_id = ?`, [reviewer_id, film_id])
        }
        if(result[0].is_liked != true){
            await pool.query(`
                UPDATE review 
                SET total_like = total_like + 1
                WHERE users_id = ? AND film_id = ?`, [reviewer_id, film_id])
        }
    } else if(is_liked == false){
        if(result[0].is_liked == true){
            await pool.query(`
                UPDATE review 
                SET total_like = total_like - 1
                WHERE users_id = ? AND film_id = ?`, [reviewer_id, film_id])
        }
        if(result[0].is_liked != false){
            await pool.query(`
                UPDATE review 
                SET total_dislike = total_dislike + 1
                WHERE users_id = ? AND film_id = ?`, [reviewer_id, film_id])
        }
    } else {
        if(result[0].is_liked == true){
            await pool.query(`
                UPDATE review 
                SET total_like = total_like - 1
                WHERE users_id = ? AND film_id = ?`, [reviewer_id, film_id])
        }
        if(result[0].is_liked == false){
            await pool.query(`
                UPDATE review 
                SET total_dislike = total_dislike - 1
                WHERE users_id = ? AND film_id = ?`, [reviewer_id, film_id])
        }
    }

    await pool.query(`
        UPDATE like_review
        SET is_liked = ?
        WHERE users_id = ? AND review_users_id = ? AND review_film_id = ?`, [is_liked, curr_user_id, reviewer_id, film_id])
    return res.status(200).send({
        "status": "sukses",
        "message": "rate review berhasil diubah"
    })

}

export const getFilm = async (req, res) => {
    const id = req.params.id
    const [result] = await pool.query(`
        SELECT * 
        FROM film 
        WHERE id = ? 
            LIMIT 1`, [id])
    return res.status(200).send(result[0])
}

export const searchFilms = async (req, res) => {
    // TODO advanced search
    const judul = req.query.judul == undefined? '' : req.query.judul
    const [result] = await pool.query(`
        SELECT judul, status_penayangan, total_episode, tanggal_rilis, rating_mean, total_review
        FROM film 
        WHERE judul LIKE ?`, ['%' + judul + '%'])
    return res.status(200).send({
        "status": "sukses",
        "films": result
    })
}