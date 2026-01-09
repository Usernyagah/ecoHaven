// === app/api/uploadthing/core.ts ===

import { createUploadthing, type FileRouter } from 'uploadthing/next'
import { UploadThingError } from 'uploadthing/server'
import { cookies } from 'next/headers'
import { lucia } from '@/lib/auth/lucia'

const f = createUploadthing()

export const ourFileRouter = {
  productImages: f({
    image: {
      maxFileSize: '4MB',
      maxFileCount: 6,
    },
  })
    .middleware(async () => {
      // Check for session cookie
      const cookieStore = await cookies()
      const sessionId = cookieStore.get(lucia.sessionCookieName)?.value

      if (!sessionId) {
        throw new UploadThingError('Unauthorized')
      }

      // Validate session and check role
      const { user } = await lucia.validateSession(sessionId)

      if (!user) {
        throw new UploadThingError('Unauthorized')
      }

      if (user.role !== 'ADMIN') {
        throw new UploadThingError('Forbidden: Admin access required')
      }

      // Return metadata for onUploadComplete
      return { userId: user.id }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('Upload complete for userId:', metadata.userId)
      console.log('File URL:', file.url)

      // Return data to client
      return { uploadedBy: metadata.userId }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
