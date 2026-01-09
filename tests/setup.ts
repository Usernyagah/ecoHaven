// === tests/setup.ts ===

import { PrismaClient } from '@prisma/client'
import { db } from '@/lib/db'

// Helper to reliably access the mocked Prisma client in tests
export const testPrisma = db as unknown as PrismaClient

// Helper to reset database between tests if running against a real test DB container
// Note: In many integration setups, we truncate tables.
// Since we are using Jest mocks for unit tests in previous requests, this might be optional.
// However, for true e2e/integration tests described in CI, we want a clean slate.

const tableNames = ['User', 'Session', 'Account', 'Product', 'Order', 'OrderItem', 'Category']

export async function resetDatabase() {
    try {
        for (const tableName of tableNames) {
            // Use deleteMany for safety if cascade isn't perfect, or raw query TRUNCATE if prefer speed
            // @ts-ignore
            await db[tableName.toLowerCase()].deleteMany()
        }
    } catch (error) {
        console.warn('DB Reset failed (clean up might not be necessary if mocking):', error)
    }
}

// Optional: Global teardown if using a singleton connection
export async function closeDatabase() {
    await db.$disconnect()
}
