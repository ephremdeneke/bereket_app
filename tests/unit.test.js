import { calculateDailySalesTotal, calculateReconciliation, calculateNetIncome, isLowStock } from '../src/utils/calculations.js';
import { formatCurrency, formatNumber, getTodayFormatted } from '../src/utils/formatters.js';
import assert from 'node:assert';
import { test, describe } from 'node:test';

describe('Calculations Utility Tests', () => {
  test('calculateDailySalesTotal computes correct totals and item breakdown', () => {
    const products = [
      { id: 'PROD-001', name: 'Macchiato', sellingPrice: 80 },
      { id: 'PROD-002', name: 'Milk', sellingPrice: 50 }
    ];

    const items = [
      { productId: 'PROD-001', quantity: 3 },
      { productId: 'PROD-002', quantity: 2 }
    ];

    const result = calculateDailySalesTotal(items, products);
    assert.strictEqual(result.totalCalculatedSales, 340); // (3*80) + (2*50) = 240 + 100 = 340
    assert.strictEqual(result.items.length, 2);
    assert.strictEqual(result.items[0].calculatedAmount, 240);
    assert.strictEqual(result.items[1].calculatedAmount, 100);
  });

  test('calculateDailySalesTotal handles missing or invalid quantities gracefully', () => {
    const products = [{ id: 'PROD-001', sellingPrice: 80 }];
    const items = [{ productId: 'PROD-001', quantity: -5 }];
    const result = calculateDailySalesTotal(items, products);
    assert.strictEqual(result.totalCalculatedSales, 0);
  });

  test('calculateReconciliation correctly evaluates Matched vs Mismatch', () => {
    const matched = calculateReconciliation(500, 300, 200);
    assert.strictEqual(matched.recordedTotal, 500);
    assert.strictEqual(matched.difference, 0);
    assert.strictEqual(matched.status, 'Matched');

    const mismatch = calculateReconciliation(500, 300, 150);
    assert.strictEqual(mismatch.recordedTotal, 450);
    assert.strictEqual(mismatch.difference, -50);
    assert.strictEqual(mismatch.status, 'Mismatch');
  });

  test('calculateNetIncome computes correct profit', () => {
    assert.strictEqual(calculateNetIncome(1000, 350), 650);
    assert.strictEqual(calculateNetIncome('1000', '350'), 650);
  });

  test('isLowStock correctly flags low inventory', () => {
    assert.strictEqual(isLowStock(5, 10), true);
    assert.strictEqual(isLowStock(10, 10), true);
    assert.strictEqual(isLowStock(15, 10), false);
  });
});

describe('Formatters Utility Tests', () => {
  test('formatCurrency formats ETB numbers', () => {
    const formatted = formatCurrency(1500);
    assert.ok(formatted.includes('1,500') || formatted.includes('1500'));
    assert.ok(formatted.includes('ETB'));
  });

  test('formatNumber formats digits with commas', () => {
    assert.strictEqual(formatNumber(1000000), '1,000,000');
  });

  test('getTodayFormatted returns YYYY-MM-DD string format', () => {
    const today = getTodayFormatted();
    assert.match(today, /^\d{4}-\d{2}-\d{2}$/);
  });
});
