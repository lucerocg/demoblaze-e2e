/**
 * Page Object Model for the Demoblaze Product Detail page
 * 
 * This class handles all interactions with individual product pages
 * where users can view product details and add items to their cart.
 * 
 * @example
 * const product = new ProductDetailPage(page);
 * const productName = await product.getName();
 * await product.addToCartExpectAlert();
 */
import { Page, Locator, expect } from '@playwright/test';

export class ProductDetailPage {
  readonly page: Page;
  readonly addToCartLink: Locator;
  readonly productName: Locator;
  readonly priceContainer: Locator;

  constructor(page: Page) {
    this.page = page;
    this.addToCartLink = page.getByRole('link', { name: 'Add to cart' });
    this.productName = page.locator('.name'); 
    this.priceContainer = page.locator('.price-container');
  }

  /**
   * Gets the name of the current product
   * 
   * @returns Promise that resolves to the product name as a string
   * 
   * @example
   * const name = await product.getName();
   * console.log(`Current product: ${name}`);
   */
  async getName(): Promise<string> {
    return (await this.productName.textContent())?.trim() ?? '';
  }

  /**
   * Adds the current product to the cart and handles the confirmation alert
   * 
   * @param message - Expected alert message (default: 'Product added')
   * @returns Promise that resolves when the product is added and alert is handled
   * 
   * @example
   * await product.addToCartExpectAlert(); // Uses default message
   * await product.addToCartExpectAlert('Product added successfully!'); // Custom message
   */
  async addToCartExpectAlert(message = 'Product added') {
    const [dialog] = await Promise.all([
      this.page.waitForEvent('dialog'),
      this.addToCartLink.click(),
    ]);
    expect(dialog.message()).toContain(message);
    await dialog.accept();
  }
}
