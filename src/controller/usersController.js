import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import pool from "../server.js"
import config from "../config/config.js"

export const register = async (req, res) => {
    const { username, display_name, password } = req.body
    const user = await pool.query(`
        SELECT * 
        FROM users 
        WHERE username LIKE ?`, [username])

    if(user[0][0] == undefined){
        const hashedPassword = await bcrypt.hash(password, 10)
        const [result] = await pool.query(`
            INSERT INTO users (username, display_name, password) 
            VALUES (?, ?, ?)`, [username, display_name, hashedPassword])
        return res.status(201).send({
            "status": "sukses",
            "message": `user baru berhasil dibuat`
        })
    } else {
        return res.status(409).send({
            "status": "gagal",
            "message": `username sudah dipakai`
        })
    }
}

export const login = async (req, res) => {
    const { username, password } = req.body
    const user = await pool.query(`
        SELECT * 
        FROM users 
        WHERE username LIKE ? 
        LIMIT 1`, [username])

    if(user[0][0] != undefined){
        const isValidPassword = await bcrypt.compare(password, user[0][0].password)
        if(isValidPassword){
            const token = jwt.sign({
                id: user[0][0].id,
                username: user[0][0].username,
                is_admin: user[0][0].is_admin
            }, config.jwt_secret_key, { expiresIn: '1h', })
            return res.status(200).send({
                "status": "sukses",
                "token": token,
                "message": `berhasil login`
            })
        } else {
            return res.status(400).send({
                "status": "gagal",
                "message": `password tidak sesuai`
            })
        }
    } else {
        return res.status(400).send({
            "status": "gagal",
            "message": `user tidak ada`
        })
    }
}

export const updateProfile = async (req, res) => {
    const id = req.params.id
    if(req.user.id != id){
        return res.status(403).send({
            "status": "gagal",
            "message": "tidak diperbolehkan mengubah profile user lain"
        })
    }

    const [result] = await pool.query(`
        SELECT * 
        FROM users 
        WHERE id = ? 
        LIMIT 1`, [id])
    if(result[0] != undefined){
        const profile = result[0]
        const currPass = result[0].password
        Object.assign(profile, req.body)

        const [q] = await pool.query(`
            SELECT *
            FROM users
            WHERE username LIKE ? AND id != ?`, [profile.username, id])

        if(q[0] != undefined){
            return res.status(400).send({
                "status": "gagal",
                "message": "username sudah digunakan"
            })
        }

        if(profile.password != currPass){
            profile.password = await bcrypt.hash(profile.password, 10)
        }

        await pool.query(`
            UPDATE users
            SET username = ?, display_name = ?, bio = ?, list_visible = ?, password = ?
            WHERE id = ?`, 
            [profile.username, profile.display_name, profile.bio, profile.list_visible, profile.password, id])

        return res.status(200).send({
            "status": "sukses",
            "message": "profile berhasil diperbarui"
        })
    }
    return res.status(400).send({
        "status": "gagal",
        "message": "tidak ada profile yang bisa diperbarui"
    })
}

export const getUser = async (req, res) => {
    const id = req.params.id
    const [result] = await pool.query(`
        SELECT username, display_name, bio, (
            SELECT GROUP_CONCAT(film.judul SEPARATOR ', ') AS list_film
            FROM list_film JOIN film ON (list_film.film_id = film.id)
            WHERE users_id = ?
            GROUP BY users_id
            ) AS list_film, (
            SELECT GROUP_CONCAT(CONCAT(f.judul, ' (', r.rating, ')', ' : ', r.komentar) SEPARATOR ', ') AS reviews
            FROM review r JOIN film f ON (r.film_id = f.id)
            WHERE users_id = ?
            GROUP BY users_id
            ) AS reviews
        FROM users 
        WHERE id = ? AND list_visible = 1`, [id, id, id])
    return res.status(200).send(result[0])
}