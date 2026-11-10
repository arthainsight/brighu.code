import { expect, test } from '@playwright/test';
import { calculateChart, selectWorkspace, visible } from './helpers';

// The wealth assessment (wealthAssessment.ts): the Moon from the Sun, the horā as a table of Leo against Cancer, the houses of money and the
// pattern of the dhana yogas, the confirmation from the Moon and the vargas.

test('ANALYSIS Wealth assessment shows the three steps and the confirmation', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await calculateChart(page);
  await selectWorkspace(page, 'ANALYSIS');
  await visible(page, page.getByRole('button', { name: 'Wealth assessment', exact: true })).click();
  const panel = visible(page, page.locator('[data-wealth="panel"]'));

  await expect(panel.locator('[data-wealth-sunmoon]')).toHaveAttribute('data-wealth-sunmoon', /^(kendra|panaphara|apoklima)$/);
  // The horā is Leo or Cancer: seven grahas, each in the Sun's or the Moon's.
  await expect(panel.locator('[data-wealth-hora] tbody tr')).toHaveCount(7);
  const owners = await panel.locator('[data-wealth-hora-row]').evaluateAll(rows => rows.map(row => row.getAttribute('data-wealth-hora-owner')));
  expect(owners.every(owner => owner === 'sun' || owner === 'moon')).toBe(true);
  // The houses 2, 11, 9 and 5, the four patterns of the yogas, and the same from the Moon.
  await expect(panel.locator('[data-wealth-houses="lagna"] tbody tr')).toHaveCount(4);
  await expect(panel.locator('[data-wealth-yogas="lagna"] tbody tr')).toHaveCount(4);
  await expect(panel.locator('[data-wealth-houses="moon"] tbody tr')).toHaveCount(2);
  expect(await panel.locator('[data-wealth-varga-row]').count()).toBeGreaterThanOrEqual(3);
  await expect(panel.locator('[data-wealth-tally]')).toContainText(/for|puolesta/);
  expect(errors).toEqual([]);
});
