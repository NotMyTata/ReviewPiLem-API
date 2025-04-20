import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import pool from "../server.js"
import config from "../config/config.js"

export async function register(username, display_name, password){
    const user = await pool.query(`SELECT * FROM users WHERE username LIKE ?`, [username])
    if(user[0][0] == undefined){
        const hashedPassword = await bcrypt.hash(password, 10)
        const [rows] = await pool.query(`INSERT INTO users (username, display_name, password) VALUES (?, ?, ?)`, [username, display_name, hashedPassword])
        return {
            "code": 201,
            "message": `user baru berhasil dibuat`
        }
    } else {
        return {
            "code": 409,
            "message": `username sudah dipakai`
        }
    }
}

export async function login(username, password){
    const user = await pool.query(`SELECT * FROM users WHERE username LIKE ? LIMIT 1`, [username])
    if(user[0][0] != undefined){
        const isValidPassword = await bcrypt.compare(password, user[0][0].password)
        if(isValidPassword){
            const token = jwt.sign({
                id: user[0][0].id,
                username: user[0][0].username,
                is_admin: user[0][0].is_admin
            }, config.jwt_secret_key, { expiresIn: '1h', })
            return {
                "code": 200,
                "token": token,
                "message": `berhasil login`
            }
        } else {
            return {
                "code": 400,
                "message": `password tidak sesuai`
            }
        }
    } else {
        return {
            "code": 400,
            "message": `user tidak ada`
        }
    }
}

export async function updateProfile(){

}

export async function getUser(id){
    //TODO: add the list and reviews
    const [rows] = await pool.query(`SELECT username, display_name, bio FROM users WHERE id = ?`, [id])
    return rows[0]
}