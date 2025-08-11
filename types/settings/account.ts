export interface Account {
    name: string
    email: string
    phone: string
    company: string
}

export interface ChangePassword {
    newPassword: string
    newPasswordConfirmation: string
}