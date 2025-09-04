/**
 * Page Object Model for the Demoblaze Shopping Cart page
 * 
 * This class handles all interactions with the shopping cart including
 * viewing items, calculating totals, and removing products.
 * 
 * @example
 * const cart = new CartPage(page);
 * await cart.open();
 * const itemCount = await cart.countItems();
 * const total = await cart.getTotal();
 */
import { Page, Locator, expect } from '@playwright/test';
import { parsePrice } from '../utils/money';

export class CartPage {
  readonly page: Page;
  readonly cartLink: Locator;
  readonly rows: Locator;
  readonly total: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cartLink = page.locator('#cartur'); // link "Cart"
    this.rows = page.locator('#tbodyid > tr');
    this.total = page.locator('#totalp');
  }

  /**
   * Opens the shopping cart page and waits for items to be visible
   * 
   * @returns Promise that resolves when cart is loaded
   */
  async open() {
    await this.cartLink.click();
    
    // Wait for basic page load instead of networkidle
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForTimeout(2000);
    
    // Only wait for items if there are any
    const itemCount = await this.rows.count();
    if (itemCount > 0) {
      await expect(this.rows.first()).toBeVisible();
    }
  }

  /**
   * Clears all items from the cart
   * 
   * @returns Promise that resolves when cart is empty
   */
  async clearCart() {
    await this.open();
    const itemCount = await this.countItems();
    
    // If cart is already empty, nothing to do
    if (itemCount === 0) {
      return;
    }
    
    // Delete all items one by one (from last to first to avoid index issues)
    for (let i = itemCount - 1; i >= 0; i--) {
      await this.deleteByIndex(i);
    }
    
    // Verify cart is empty
    await expect(await this.countItems()).toBe(0);
  }

  /**
   * Counts the number of items in the cart
   * 
   * @returns Promise that resolves to the number of items
   * 
   * @example
   * const count = await cart.countItems();
   * console.log(`Cart has ${count} items`);
   */
  async countItems(): Promise<number> {
    return await this.rows.count();
  }

  /**
   * Gets the name of an item at a specific index
   * 
   * @param i - Zero-based index of the item
   * @returns Promise that resolves to the item name
   * 
   * @example
   * const firstName = await cart.getRowName(0);
   */
  async getRowName(i: number): Promise<string> {
    return (await this.rows.nth(i).locator('td').nth(1).textContent() ?? '').trim();
  }

  /**
   * Gets the price of an item at a specific index
   * 
   * @param i - Zero-based index of the item
   * @returns Promise that resolves to the item price as a number
   * 
   * @example
   * const price = await cart.getRowPrice(0);
   * console.log(`First item costs $${price}`);
   */
  async getRowPrice(i: number): Promise<number> {
    const txt = await this.rows.nth(i).locator('td').nth(2).textContent() ?? '0';
    return parsePrice(txt);
  }

  /**
   * Gets the total price of all items in the cart
   * 
   * @returns Promise that resolves to the total price as a number
   * 
   * @example
   * const total = await cart.getTotal();
   * console.log(`Cart total: $${total}`);
   */
  async getTotal(): Promise<number> {
    const txt = await this.total.textContent() ?? '0';
    return parsePrice(txt);
  }

  /**
   * Deletes an item from the cart by its index
   * 
   * @param i - Zero-based index of the item to delete
   * @returns Promise that resolves when item is deleted
   * 
   * @example
   * await cart.deleteByIndex(0); // Deletes first item
   */
  async deleteByIndex(i: number) {
    await this.rows.nth(i).getByRole('link', { name: 'Delete' }).click();
    await this.rows.nth(i).waitFor({ state: 'detached' });
  }

  /**
   * Deletes an item from the cart by its name
   * 
   * @param name - The exact name of the item to delete
   * @returns Promise that resolves when item is deleted
   * @throws Error if item with the specified name is not found
   * 
   * @example
   * await cart.deleteByName('Sony vaio i5');
   */
  async deleteByName(name: string) {
    const n = await this.countItems();
    for (let i = 0; i < n; i++) {
      if ((await this.getRowName(i)) === name) {
        await this.deleteByIndex(i);
        return;
      }
    }
    throw new Error(`No se encontró el ítem "${name}" para eliminar.`);
  }
}
