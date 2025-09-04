/**
 * Page Object Model for the Demoblaze Catalog/Home page
 * 
 * This class handles all interactions with the main catalog page where
 * users can browse products by category and navigate to product details.
 * 
 * @example
 * const catalog = new CatalogPage(page);
 * await catalog.gotoHome();
 * await catalog.openLaptops();
 * const productName = await catalog.openProductByIndex(0);
 */
import { Page, Locator, expect } from '@playwright/test';

export class CatalogPage {
  readonly page: Page;
  readonly laptopsLink: Locator;
  readonly productCards: Locator;

  constructor(page: Page) {
    this.page = page;
    this.laptopsLink = page.getByRole('link', { name: 'Laptops' });
    this.productCards = page.locator('#tbodyid .card');
  }

  /**
   * Navigates to the Demoblaze home page and verifies the page title
   * 
   * @returns Promise that resolves when navigation is complete
   */
  async gotoHome() {
    await this.page.goto('/');
    await expect(this.page).toHaveTitle(/STORE/);
    
    // Wait for basic page load, but don't wait for networkidle (can be too slow)
    await this.page.waitForLoadState('domcontentloaded');
    
    // Wait a bit more for dynamic content
    await this.page.waitForTimeout(2000);
    
    // Check if laptops link is visible, if not wait a bit more
    try {
      await expect(this.laptopsLink).toBeVisible({ timeout: 5000 });
    } catch (error) {
      console.log('Laptops link not visible, waiting more...');
      await this.page.waitForTimeout(3000);
      await expect(this.laptopsLink).toBeVisible();
    }
  }

  /**
   * Opens the Laptops category and waits for products to be visible
   * 
   * @returns Promise that resolves when laptops are loaded
   */
  async openLaptops() {
    // Click on laptops link
    await this.laptopsLink.click();
    
    // Wait for the laptops page to load
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForTimeout(2000);
    
    // Wait for products to appear
    await expect(this.productCards.first()).toBeVisible({ timeout: 10000 });
  }

  /**
   * Opens a product by its index in the product grid
   * 
   * @param idx - Zero-based index of the product to open
   * @returns Promise that resolves to the product name
   * 
   * @example
   * const productName = await catalog.openProductByIndex(0); // Opens first product
   */
  async openProductByIndex(idx: number) {
    const link = this.productCards.nth(idx).locator('.card-title a');
    const name = await link.textContent();
    await link.click();
    return (name ?? '').trim();
  }

  /**
   * Opens a product by its exact name
   * 
   * @param name - The exact name of the product to open
   * @returns Promise that resolves when product is opened
   * 
   * @example
   * await catalog.openProductByName('Sony vaio i5');
   */
  async openProductByName(name: string) {
    const link = this.page.locator('#tbodyid .card-title a', { hasText: name });
    await link.click();
  }
}
