export interface Account {
    identifier: string
    user_id: string
    name: string
    role: string
}

export interface ChangePassword {
    newPassword: string
    newPasswordConfirmation: string
}