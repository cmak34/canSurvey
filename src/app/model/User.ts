import { Timestamp } from "firebase/firestore"

export interface User {
    id: string
    email: string
    role: ("user" | "admin")
    userName?: string
    firstName?: string
    lastName?: string
    dob?: Timestamp
    province?:string
    updatedTime?: Timestamp
}