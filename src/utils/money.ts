/**
 * Utility functions for handling money and price formatting in Demoblaze E2E tests
 * 
 * This module provides functions to parse and manipulate price strings
 * commonly found in e-commerce applications like Demoblaze.
 */

/**
 * Parses a price string and converts it to a number
 * 
 * @param text - The price string to parse (e.g., "$790", "790", "790.00")
 * @returns The parsed price as a number, rounded to nearest integer
 * 
 * @example
 * parsePrice("$790") // returns 790
 * parsePrice("790.50") // returns 791 (rounded)
 * parsePrice("$1,234.56") // returns 1235 (rounded)
 */
export function parsePrice(text: string): number {
    // Acepta "$790", "790", "790.00"
    const digits = text.replace(/[^\d.]/g, '');
    const n = Number.parseFloat(digits || '0');
    return Math.round(Number.isFinite(n) ? n : 0);
}
  