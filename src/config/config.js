import dotenv from 'dotenv'
dotenv.config()

export default {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    jwt_secret_key: process.env.JWT_SECRET_KEY,
    jwt_expires_in: process.env.JWT_EXPIRES_IN
}