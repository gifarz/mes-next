import crypto from "crypto";

const SECRET_KEY = "my_secret_mes_123456789012345678"; // must be 32 chars for AES-256
const IV = crypto.randomBytes(16); // initialization vector

export function encrypt(text: string): { iv: string; content: string } {
    const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(SECRET_KEY), IV);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    return {
        iv: IV.toString("hex"),
        content: encrypted,
    };
}

export function decrypt(hash: { iv: string; content: string }): string {
    const decipher = crypto.createDecipheriv(
        "aes-256-cbc",
        Buffer.from(SECRET_KEY),
        Buffer.from(hash.iv, "hex")
    );
    let decrypted = decipher.update(hash.content, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
}
