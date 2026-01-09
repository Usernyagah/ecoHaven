// === app/admin/products/new/page.tsx ===

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createProductAction } from '@/lib/actions/products' // Assumed existing or will create in future steps, but for now I'll stub the fetch/action logic here as requested by "integration example"
import ProductImageUploader from '@/components/ui/ProductImageUploader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { toast } from 'sonner'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function NewProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<string[]>([])

  async function handleSubmit(formData: FormData) {
    setLoading(true)

    // In a real app, you would pass formData to a Server Action.
    // Here we need to append the images array which isn't in the native form inputs.
    // If using a server action that takes FormData, create a hidden input or handle it differently.
    // For this example, we'll demonstrate a hybrid approach or simple API call.

    // Simulating Server Action call:
    try {
      const data = {
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        price: parseFloat(formData.get('price') as string),
        stock: parseInt(formData.get('stock') as string),
        categoryId: formData.get('category') as string,
        images: images
      }

      // Normally: await createProduct(data)
      // For demonstration, we'll just log and mock success
      console.log('Submitting product:', data)

      // Simulating network request
      await new Promise(resolve => setTimeout(resolve, 1000))

      toast.success("Product created successfully")
      router.push('/admin/products')
      router.refresh()
    } catch (error) {
      toast.error("Failed to create product")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/admin/products">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-serif text-foreground">Add New Product</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
              <CardDescription>Basic information about the product.</CardDescription>
            </CardHeader>
            <CardContent>
              <form id="product-form" action={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input id="name" name="name" required placeholder="e.g. Bamboo Toothbrush" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" required placeholder="Describe the product..." className="min-h-[120px]" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price ($)</Label>
                    <Input id="price" name="price" type="number" step="0.01" min="0" required placeholder="0.00" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stock">Stock</Label>
                    <Input id="stock" name="stock" type="number" min="0" required placeholder="0" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  {/* Ideally a Select component populated from DB */}
                  <Input id="category" name="category" placeholder="Category ID (placeholder)" required />
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="bg-[#fbfbf6]/50 border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Product Images</CardTitle>
              <CardDescription>
                Upload up to 6 images.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProductImageUploader
                value={images}
                onChange={setImages}
              />
            </CardContent>
          </Card>

          <div className="sticky top-8">
            <Button
              type="submit"
              form="product-form"
              className="w-full bg-[#8da399] hover:bg-[#7a8f85] text-white"
              disabled={loading || images.length === 0}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Product
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-2">
              {images.length === 0 ? "Upload at least one image to continue" : "Ready to publish"}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
