import { expect, test } from '@playwright/test';
import { calculateChart, selectWorkspace, visible, withChartLayers } from './helpers';

// Surya Hora Lagna (horaLagna.ts): the Hora Lagna from the Sun and from the Lagna, and the avatāra of the birth hour.

test('ANALYSIS Surya Hora Lagna shows both points and the protector of the birth hour', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await calculateChart(page);
  await selectWorkspace(page, 'ANALYSIS');
  await visible(page, page.getByRole('button', { name: 'Surya Hora Lagna', exact: true })).click();
  const panel = visible(page, page.locator('[data-hora-lagna="panel"]'));
  for (const key of ['surya', 'lagna', 'standard']) {
    const sign = Number(await panel.locator(`[data-hora-lagna-row="${key}"]`).getAttribute('data-hora-lagna-sign'));
    expect(sign).toBeGreaterThanOrEqual(1);
    expect(sign).toBeLessThanOrEqual(12);
  }
  // 15.08.1947 09:15 in New Delhi: a little over three hours after sunrise, in the hour of Taurus (08–10).
  const hours = Number(await panel.locator('[data-hora-lagna-hours]').getAttribute('data-hora-lagna-hours'));
  expect(hours).toBeGreaterThan(2.5);
  expect(hours).toBeLessThan(4);
  await expect(panel.locator('[data-hora-lagna-avatara="Narada"], [data-hora-lagna-avatara="Nara-Narayana"]')).toHaveCount(1);
  // Counting the day from the sunrise changes the choice without breaking the page.
  await panel.getByRole('button', { name: /^The sunrise|^Auringonnousu/ }).click();
  await expect(panel.locator('[data-hora-lagna-avatara]')).toHaveCount(1);
  expect(errors).toEqual([]);
});

test('the chart marks SHL and LHL among the special lagnas, with degrees when the chart shows them', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await withChartLayers(page, { showSpecialLagnas: true, degreePrecision: 'minute' });
  await calculateChart(page);
  const chart = visible(page, page.locator('svg[aria-label="North Indian Jyotish chart"]'));
  await expect(chart).toContainText(/SHL \d+°\d+'/);
  await expect(chart).toContainText(/LHL \d+°\d+'/);
  await expect(chart).toContainText(/HL \d+°\d+'/);
  expect(errors).toEqual([]);
});
