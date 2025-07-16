export type Role = 'Volunteer'

export interface User {
  id: number
  email: string
  firstname: string
  lastname: string
  phone: string
  emergencyContact: string
  emergencyContactNumber: string
  role: Role
}
