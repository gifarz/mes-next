import bcrypt from 'bcrypt';

export async function comparePassword(
    plainTextPassword: string,
    hashedPassword: string
): Promise<boolean> {
    return await bcrypt.compare(plainTextPassword, hashedPassword);
}
