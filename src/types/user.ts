export type Role = 'Volunteer'
export type User = {
  id: number
  firstname: string
  lastname: string
  email: string
  phone: string
  emergencyContact: string
  emergencyContactNumber: string
  role: Role
}
