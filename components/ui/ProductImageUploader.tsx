// === components/ui/ProductImageUploader.tsx ===

'use client'

import { useState } from 'react'
import { UploadDropzone } from '@/utils/uploadthing'
import { X } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface ProductImageUploaderProps {
  value: string[]
  onChange: (urls: string[]) => void
  disabled?: boolean
}

export default function ProductImageUploader({
  value = [],
  onChange,
  disabled,
}: ProductImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)

  const handleRemove = (urlToRemove: string) => {
    onChange(value.filter((url) => url !== urlToRemove))
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {value.map((url, index) => (
          <div
            key={url}
            className={cn(
              "relative group aspect-square bg-white p-2 shadow-sm transition-all duration-300 hover:shadow-md",
              // Asymmetrical rotation for organic "Polaroid" feel
              index % 2 === 0 ? "rotate-1" : "-rotate-1",
              index % 3 === 0 && "rotate-2"
            )}
          >
            <div className="relative w-full h-full overflow-hidden bg-stone-100">
              <Image
                fill
                src={url}
                alt="Product image"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            {!disabled && (
              <button
                onClick={() => handleRemove(url)}
                type="button"
                className="absolute -top-2 -right-2 z-10 p-1.5 bg-destructive rounded-full text-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/90"
              >
                <X className="w-4 h-4" />
                <span className="sr-only">Remove image</span>
              </button>
            )}
          </div>
        ))}

        {/* Placeholder for when no images are uploaded to guide user visually, 
            or just keep the list clean. If desired we could enable a placeholder. */}
      </div>

      <div className={cn(
        "p-1 bg-[#fbfbf6] rounded-xl border-2 border-dashed border-[#d4c5a9] transition-colors",
        isUploading && "opacity-50 pointer-events-none cursor-not-allowed"
      )}>
        <UploadDropzone
          endpoint="productImages"
          onUploadBegin={() => setIsUploading(true)}
          onClientUploadComplete={(res) => {
            setIsUploading(false)
            if (res) {
              const newUrls = res.map((r) => r.url)
              onChange([...value, ...newUrls])
              toast.success('Images uploaded successfully')
            }
          }}
          onUploadError={(error: Error) => {
            setIsUploading(false)
            toast.error(`Upload failed: ${error.message}`)
          }}
          appearance={{
            container: "bg-transparent border-none",
            label: "text-stone-600 hover:text-stone-800",
            button: "bg-[#8da399] hover:bg-[#7a8f85] text-[#fbfbf6] font-medium px-4 py-2 rounded-md transition-colors",
            allowedContent: "text-stone-400 text-xs"
          }}
          config={{
            mode: "auto"
          }}
        />
      </div>

      <p className="text-xs text-muted-foreground text-center italic">
        Supported formats: JPEG, PNG, WEBP. Max 4MB per file.
      </p>
    </div>
  )
}
