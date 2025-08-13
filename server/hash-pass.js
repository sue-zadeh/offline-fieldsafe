import bcrypt from 'bcrypt'
import mysql from 'mysql'
import dotenv from 'dotenv'
import { pool } from './db.js'
const password_1 = '1!2@3#Groupadmin'
const password_2 = 'Ausnew#2021!'
// const password_3 = '123Admincvnz'

bcrypt.hash(password_1, 10, (err, hash) => {
  if (err) {
    console.error('Error hashing password:', err)
  } else {
    console.log('Hashed password:', hash)
  }
})
