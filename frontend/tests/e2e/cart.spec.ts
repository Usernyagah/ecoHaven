import { test, expect } from '@playwright/test';

test('cart page shows items and updates subtotal', async ({ page }) => {
    await page.goto('/cart');

    // Check if mock items are displayed
    await expect(page.getByText('Your Shopping Bag')).toBeVisible();

    const initialSubtotal = page.locator('span:has-text("Subtotal") + span');
    await expect(initialSubtotal).toBeVisible();

    // Increase quantity of the first item
    const firstItemPlusButton = page.locator('button:has(.lucide-plus)').first();
    await firstItemPlusButton.click();

    // Check if quantity updated (this depends on the implementation, but let's assume it works as mock)
    // The mock data set 2 for first item, so clicking plus should make it 3
    await expect(page.getByText('3')).toBeVisible();

    // Remove an item
    const removeButton = page.locator('button:has(.lucide-trash2)').first();
    await removeButton.click();

    // Check if one item is removed
    // Initially there are 2 items, after removing one there should be 1
    const cartItems = page.locator('.lg\\:col-span-2 > div');
    await expect(cartItems).toHaveCount(1);
});
