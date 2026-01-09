// === jest.setup.ts ===

import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'

// Polyfill for environments missing TextEncoder (like some jsdom versions)
if (typeof global.TextEncoder === 'undefined') {
    global.TextEncoder = TextEncoder
}
if (typeof global.TextDecoder === 'undefined') {
    global.TextDecoder = TextDecoder as any
}

// Global mocks
global.fetch = jest.fn(() =>
    Promise.resolve({
        json: () => Promise.resolve({}),
        ok: true,
        status: 200,
        headers: new Headers(),
    } as Response)
)

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
    observe() { }
    unobserve() { }
    disconnect() { }
}
