export interface User {
  id: number
  firstname: string
  lastname: string
  email: string
  phone: string
  emergencyContact: string
  emergencyContactNumber: string
  role: string //'Volunteer' | 'Admin' | 'Staff' | 'TeamLead' 
  synced?: boolean
}
