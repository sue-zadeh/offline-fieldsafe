import bcrypt from 'bcrypt'
import mysql from 'mysql'
import dotenv from 'dotenv'
import { pool } from './db.js'

// SECURITY: Never hardcode passwords in source code!
// Use environment variables or prompt for input instead.
console.error('❌ SECURITY WARNING: This file should not contain hardcoded passwords!')
console.error('🔒 Please use environment variables or command line arguments for passwords.')

// Example of secure password hashing:
const hashPassword = async (password) => {
  if (!password) {
    console.error('❌ No password provided')
    return
  }
  
  try {
    const hash = await bcrypt.hash(password, 10)
    console.log('✅ Password hashed successfully:', hash)
    return hash
  } catch (err) {
    console.error('❌ Error hashing password:', err)
  }
}

// Usage: node hash-pass.js "your-password-here"
const passwordFromArgs = process.argv[2]
if (passwordFromArgs) {
  hashPassword(passwordFromArgs)
} else {
  console.log('Usage: node hash-pass.js "password-to-hash"')
}
