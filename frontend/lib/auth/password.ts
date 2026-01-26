// === lib/auth/password.ts ===
import { hash, verify } from '@node-rs/argon2'

/**
 * Password hashing utility using Argon2
 * This file should ONLY be imported in Node.js environments (Server Actions, API Routes)
 * and NOT in Middleware/Edge Runtime.
 */
export async function hashPassword(password: string): Promise<string> {
    return await hash(password, {
        memoryCost: 19456,
        timeCost: 2,
        outputLen: 32,
        parallelism: 1,
    })
}

/**
 * Verify a password against a hash using Argon2
 */
export async function verifyPassword(hashedPassword: string, password: string): Promise<boolean> {
    try {
        return await verify(hashedPassword, password, {
            memoryCost: 19456,
            timeCost: 2,
            outputLen: 32,
            parallelism: 1,
        })
    } catch {
        return false
    }
}
