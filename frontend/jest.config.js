const nextJest = require('next/jest')

const createJestConfig = nextJest({
    // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
    dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
    coverageProvider: 'v8',
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
    },
    testMatch: [
        '**/tests/**/*.(test|spec).(ts|tsx)',
        '**/__tests__/**/*.(test|spec).(ts|tsx)',
    ],
    testPathIgnorePatterns: ['/node_modules/', '/.next/', '/tests/e2e/'],
    collectCoverageFrom: [
        'app/**/*.{ts,tsx}',
        'lib/**/*.{ts,tsx}',
        'components/**/*.{ts,tsx}',
        '!app/layout.tsx',
        '!components/ui/**/*',
        '!lib/db.ts',
    ],
    // transform is handled by next/jest
    transformIgnorePatterns: [
        '/node_modules/(?!(lucia|oslo|@lucia-auth)/)',
    ],
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)
