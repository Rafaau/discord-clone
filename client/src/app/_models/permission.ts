import { Role } from "./role"

export interface Permission {
    id: number
    name: string
    description: string
    roles: Role[]
}