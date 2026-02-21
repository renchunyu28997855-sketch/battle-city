import { test, expect } from '@playwright/test';

test('game loads and renders canvas', async ({ page }) => {
  await page.goto('/');

  const canvas = page.locator('#gameCanvas');
  await expect(canvas).toBeVisible();
  
  const width = await canvas.evaluate(el => el.width);
  const height = await canvas.evaluate(el => el.height);
  
  expect(width).toBe(416);
  expect(height).toBe(416);
  
  await expect(page).toHaveTitle(/Battle City/);
});