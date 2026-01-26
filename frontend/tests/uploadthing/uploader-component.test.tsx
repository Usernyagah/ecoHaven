// === tests/uploadthing/uploader-component.test.tsx ===

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import ProductImageUploader from '@/components/ui/ProductImageUploader'

// Mock UploadThing components
jest.mock('@/utils/uploadthing', () => ({
  UploadDropzone: ({ onClientUploadComplete, onUploadError, onUploadBegin }: any) => (
    <div data-testid="upload-dropzone">
      <button
        onClick={() => {
          onUploadBegin()
          // Simulate async upload
          setTimeout(() => {
            onClientUploadComplete([{ url: 'https://example.com/new-image.jpg' }])
          }, 10)
        }}
      >
        Simulate Upload
      </button>
      <button onClick={() => onUploadError(new Error('File too large'))}>
        Simulate Error
      </button>
    </div>
  ),
}))

// Mock Next/Image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} alt={props.alt} />,
}))

// Mock Sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

describe('ProductImageUploader', () => {
  const mockOnChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders correctly with existing images', () => {
    const images = ['https://example.com/1.jpg', 'https://example.com/2.jpg']
    render(<ProductImageUploader value={images} onChange={mockOnChange} />)

    const imgs = screen.getAllByRole('img')
    expect(imgs).toHaveLength(2)
    expect(imgs[0]).toHaveAttribute('src', 'https://example.com/1.jpg')
  })

  it('handles image removal', () => {
    const images = ['https://example.com/1.jpg']
    render(<ProductImageUploader value={images} onChange={mockOnChange} />)

    const removeBtn = screen.getByRole('button', { name: /remove image/i })
    fireEvent.click(removeBtn)

    expect(mockOnChange).toHaveBeenCalledWith([])
  })

  it('handles successful upload', async () => {
    render(<ProductImageUploader value={[]} onChange={mockOnChange} />)

    const uploadBtn = screen.getByText('Simulate Upload')
    fireEvent.click(uploadBtn)

    // Wait for timeout in mock
    await screen.findByText('Simulate Upload')

    // Since we are mocking the component internals, we just assume the callback fires.
    // In the real component, onClientUploadComplete calls onChange.
    // We put a small delay in the mock, so we wait.

    // Use a real waitFor
    await new Promise(r => setTimeout(r, 20))

    expect(mockOnChange).toHaveBeenCalledWith(['https://example.com/new-image.jpg'])
  })
})
