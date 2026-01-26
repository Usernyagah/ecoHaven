import { test, expect } from '@playwright/test';

test('homepage has title and links', async ({ page }) => {
    await page.goto('/');

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/ecoHaven/i);

    // Check for navigation links
    await expect(page.getByRole('link', { name: /home/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /products/i })).toBeVisible();
});

test('navigation to products page works', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /products/i }).click();

    // Expect the URL to contain "products"
    await expect(page).toHaveURL(/.*products/);

    // Check for products heading
    const heading = page.getByRole('heading', { name: /products/i });
    await expect(heading).toBeVisible();
});
