/**
 * E2E Test Suite for Demoblaze Shopping Cart functionality
 * 
 * This test suite covers the complete shopping cart workflow including:
 * - Adding products to cart
 * - Validating cart totals
 * - Removing products from cart
 * - Recalculating totals after deletions
 * 
 * Test Cases:
 * - TC-01: Add single product and validate total
 * - TC-02: Add multiple products and validate total
 * - TC-03: Remove product and validate recalculated total
 * 
 * @example
 * npx playwright test cart.spec.ts
 */
import { test, expect } from '@playwright/test';
import { CatalogPage } from '../src/pages/CatalogPage';
import { ProductDetailPage } from '../src/pages/ProductDetailPage';
import { CartPage } from '../src/pages/CartPage';

test.describe('Carrito Demoblaze', () => {
  /**
   * TC-01: Add a single product to cart and validate the total
   * 
   * Steps:
   * 1. Navigate to home page
   * 2. Open laptops category
   * 3. Select first product
   * 4. Add to cart
   * 5. Open cart
   * 6. Validate item count and total
   * 7. Verify product name matches
   */
  test('TC-01 | Agregar un producto y validar total', async ({ page }) => {
    const catalog = new CatalogPage(page);
    const product = new ProductDetailPage(page);
    const cart = new CartPage(page);

    // 1. Navigate to home page
    await catalog.gotoHome();
    
    // 2. Click on Laptops
    await catalog.openLaptops();
    
    // 3. Find and click on "Sony vaio i5"
    await catalog.openProductByName('Sony vaio i5');

    // 4. Add to cart and handle alert
    await product.addToCartExpectAlert();
    
    // 5. Open cart and validate
    await cart.open();

    // 6. Validate cart has at least 1 item
    await expect(await cart.countItems()).toBeGreaterThanOrEqual(1);
    
    // 7. Validate total calculation
    const price = await cart.getRowPrice(0);
    const total = await cart.getTotal();
    expect(total).toBe(price);

    // 8. Validate product name
    const nameInCart = await cart.getRowName(0);
    expect(nameInCart).toContain('Sony vaio i5');
  });

  /**
   * TC-02: Add multiple products to cart and validate the total
   * 
   * Steps:
   * 1. Navigate to home page
   * 2. Add first product to cart
   * 3. Navigate back and add second product
   * 4. Open cart
   * 5. Validate item count (at least 2)
   * 6. Calculate expected total (sum of both prices)
   * 7. Verify actual total matches expected
   * 8. Verify both product names are present
   */
  test('TC-02 | Agregar dos productos y validar total', async ({ page }) => {
    const catalog = new CatalogPage(page);
    const product = new ProductDetailPage(page);
    const cart = new CartPage(page);

    // 1. Navigate to home page
    await catalog.gotoHome();
    
    // 2. Click on Laptops
    await catalog.openLaptops();
    
    // 3. Add first product (Sony vaio i5)
    await catalog.openProductByName('Sony vaio i5');
    await product.addToCartExpectAlert();
    
    // 4. Go back to laptops page
    await catalog.gotoHome();
    await catalog.openLaptops();
    
    // 5. Add second product (Sony vaio i7)
    await catalog.openProductByName('Sony vaio i7');
    await product.addToCartExpectAlert();

    // 6. Open cart and validate
    await cart.open();
    await expect(await cart.countItems()).toBeGreaterThanOrEqual(2);

    // 7. Validate total calculation
    const p0 = await cart.getRowPrice(0);
    const p1 = await cart.getRowPrice(1);
    const total = await cart.getTotal();
    expect(total).toBe(p0 + p1);

    // 8. Validate both product names are present
    const n0 = await cart.getRowName(0);
    const n1 = await cart.getRowName(1);
    expect([n0, n1].join(' ')).toContain('Sony vaio i5');
    expect([n0, n1].join(' ')).toContain('Sony vaio i7');
  });

  /**
   * TC-03: Remove a product from cart and validate recalculated total
   * 
   * Steps:
   * 1. Add two products to cart
   * 2. Open cart and verify initial state
   * 3. Record initial total and item count
   * 4. Delete first item
   * 5. Verify item count decreased by 1
   * 6. Verify new total equals remaining item price
   * 7. Validate total calculation is correct
   */
  test('TC-03 | Eliminar producto y validar total recalculado', async ({ page }) => {
    const catalog = new CatalogPage(page);
    const product = new ProductDetailPage(page);
    const cart = new CartPage(page);

    // 1. Navigate to home page
    await catalog.gotoHome();
    
    // 2. Click on Laptops
    await catalog.openLaptops();
    
    // 3. Add first product (Sony vaio i5)
    await catalog.openProductByName('Sony vaio i5');
    await product.addToCartExpectAlert();
    
    // 4. Go back to laptops page
    await catalog.gotoHome();
    await catalog.openLaptops();
    
    // 5. Add second product (Sony vaio i7)
    await catalog.openProductByName('Sony vaio i7');
    await product.addToCartExpectAlert();

    // 6. Open cart and verify initial state
    await cart.open();
    const beforeCount = await cart.countItems();
    expect(beforeCount).toBeGreaterThanOrEqual(2);

    // 7. Record initial total and prices
    const p0 = await cart.getRowPrice(0);
    const p1 = await cart.getRowPrice(1);
    const totalBefore = await cart.getTotal();
    expect(totalBefore).toBe(p0 + p1);

    // 8. Delete first item
    await cart.deleteByIndex(0);
    
    // 9. Wait a bit for the deletion to complete
    await page.waitForTimeout(2000);
    
    // 10. Verify item count decreased by 1
    const afterCount = await cart.countItems();
    console.log(`Before deletion: ${beforeCount} items, After deletion: ${afterCount} items`);
    await expect(afterCount).toBe(beforeCount - 1);

    // 11. Verify new total equals remaining item price
    const newTotal = await cart.getTotal();
    const remainingPrice = await cart.getRowPrice(0);
    console.log(`New total: ${newTotal}, Remaining price: ${remainingPrice}`);
    expect(newTotal).toBe(remainingPrice);
  });
});
