import { expect, test } from '@playwright/test';
import { calculateChart, selectWorkspace, visible } from './helpers';

// Varga dignity (vargaDignity.ts): the seven grahas of the Navāṁśa in the order of dominance, with the average dignity.

test('ANALYSIS Varga dignity lists the seven grahas of the Navāṁśa with their dignity', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await calculateChart(page);
  await selectWorkspace(page, 'ANALYSIS');
  await visible(page, page.getByRole('button', { name: 'Varga dignity', exact: true })).click();
  const panel = visible(page, page.locator('[data-varga-dignity="panel"]'));
  await expect(panel.locator('[data-varga-dignity-row]')).toHaveCount(7);
  const average = Number(await panel.locator('[data-varga-dignity-average]').getAttribute('data-varga-dignity-average'));
  expect(average).toBeGreaterThanOrEqual(0);
  expect(average).toBeLessThanOrEqual(7);
  // Another division changes the table without breaking it.
  await panel.getByRole('button', { name: /^D12/ }).click();
  await expect(panel.locator('[data-varga-dignity-row]')).toHaveCount(7);
  expect(errors).toEqual([]);
});
