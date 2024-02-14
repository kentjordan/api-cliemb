export default interface UserEntity {
    id: string,
    role: UserRole
}

export type UserRole = 'STUDENT' | 'PROFESSOR' | 'STAFF'