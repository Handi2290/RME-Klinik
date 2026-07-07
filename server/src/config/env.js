import dotenv from 'dotenv'
dotenv.config()

export const config = {
  port: process.env.PORT || 3000,
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET || 'default-secret-change-me',
  nodeEnv: process.env.NODE_ENV || 'development',
  uploadDir: 'uploads',
  maxFileSize: 5 * 1024 * 1024, // 5MB
}
