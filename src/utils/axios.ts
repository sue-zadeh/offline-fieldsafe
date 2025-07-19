// src/utils/axios.ts
import axios from 'axios'

const baseURL = import.meta.env.MODE === 'production'
  ? 'https://fieldsafe-https-env.eba-dzxthti9.ap-southeast-2.elasticbeanstalk.com/api'
  : '/api'

export const api = axios.create({ baseURL })
