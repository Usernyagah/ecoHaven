'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db } from '@/lib/db'

// Zod schema for product validation
const productSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
  description: z.string().min(1, 'Description is required'),
  price: z.coerce.number().positive('Price must be positive'),
  stock: z.coerce.number().int().min(0, 'Stock must be non-negative'),
  categoryId: z.string().min(1, 'Category ID is required'),
  images: z.array(z.string().url('Invalid image URL')).min(1, 'At least one image is required'),
})

export async function createProduct(formData: FormData) {
  try {
    // Extract and parse form data
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const price = formData.get('price') as string
    const stock = formData.get('stock') as string
    const categoryId = formData.get('categoryId') as string
    
    // Parse images array - handle multiple formats
    let images: string[] = []
    const imagesInput = formData.get('images')
    const imagesAll = formData.getAll('images')
    
    if (imagesAll.length > 1) {
      // Multiple form fields with same name
      images = imagesAll.map((url) => String(url).trim()).filter(Boolean)
    } else if (imagesInput) {
      const imagesStr = String(imagesInput)
      try {
        // Try parsing as JSON array
        images = JSON.parse(imagesStr)
        if (!Array.isArray(images)) {
          images = [imagesStr]
        }
      } catch {
        // If not JSON, try comma-separated
        images = imagesStr.split(',').map((url) => url.trim()).filter(Boolean)
      }
    }

    // Validate data
    const validatedData = productSchema.parse({
      name,
      description,
      price,
      stock,
      categoryId,
      images,
    })

    // Convert price to cents
    const priceInCents = Math.round(validatedData.price * 100)

    // Check if category exists
    const category = await db.category.findUnique({
      where: { id: validatedData.categoryId },
    })

    if (!category) {
      return {
        success: false,
        error: 'Category not found',
      }
    }

    // Create product
    const product = await db.product.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        priceInCents,
        stock: validatedData.stock,
        categoryId: validatedData.categoryId,
        images: validatedData.images,
      },
    })

    // Revalidate relevant paths
    revalidatePath('/products')
    revalidatePath(`/products/${product.id}`)
    revalidatePath('/')

    return {
      success: true,
      data: product,
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors.map((e) => e.message).join(', '),
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create product',
    }
  }
}

export async function updateProduct(id: string, formData: FormData) {
  try {
    // Check if product exists
    const existingProduct = await db.product.findUnique({
      where: { id },
    })

    if (!existingProduct) {
      return {
        success: false,
        error: 'Product not found',
      }
    }

    // Extract and parse form data
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const price = formData.get('price') as string
    const stock = formData.get('stock') as string
    const categoryId = formData.get('categoryId') as string
    
    // Parse images array - handle multiple formats
    let images: string[] = []
    const imagesInput = formData.get('images')
    const imagesAll = formData.getAll('images')
    
    if (imagesAll.length > 1) {
      // Multiple form fields with same name
      images = imagesAll.map((url) => String(url).trim()).filter(Boolean)
    } else if (imagesInput) {
      const imagesStr = String(imagesInput)
      try {
        // Try parsing as JSON array
        images = JSON.parse(imagesStr)
        if (!Array.isArray(images)) {
          images = [imagesStr]
        }
      } catch {
        // If not JSON, try comma-separated
        images = imagesStr.split(',').map((url) => url.trim()).filter(Boolean)
      }
    }

    // Validate data
    const validatedData = productSchema.parse({
      name,
      description,
      price,
      stock,
      categoryId,
      images,
    })

    // Convert price to cents
    const priceInCents = Math.round(validatedData.price * 100)

    // Check if category exists
    const category = await db.category.findUnique({
      where: { id: validatedData.categoryId },
    })

    if (!category) {
      return {
        success: false,
        error: 'Category not found',
      }
    }

    // Update product
    const product = await db.product.update({
      where: { id },
      data: {
        name: validatedData.name,
        description: validatedData.description,
        priceInCents,
        stock: validatedData.stock,
        categoryId: validatedData.categoryId,
        images: validatedData.images,
      },
    })

    // Revalidate relevant paths
    revalidatePath('/products')
    revalidatePath(`/products/${product.id}`)
    revalidatePath('/')

    return {
      success: true,
      data: product,
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors.map((e) => e.message).join(', '),
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update product',
    }
  }
}

export async function deleteProduct(id: string) {
  try {
    // Check if product exists
    const existingProduct = await db.product.findUnique({
      where: { id },
    })

    if (!existingProduct) {
      return {
        success: false,
        error: 'Product not found',
      }
    }

    // Delete product
    await db.product.delete({
      where: { id },
    })

    // Revalidate relevant paths
    revalidatePath('/products')
    revalidatePath(`/products/${id}`)
    revalidatePath('/')

    return {
      success: true,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete product',
    }
  }
}

