import { expect, test } from '@playwright/test';
import { calculateChart, selectWorkspace, visible } from './helpers';

// Sarvatobhadra: the lattā (the kick of each graha) and the good and difficult periods (sarvatobhadraPeriods.ts).

test('ANALYSIS Sarvatobhadra marks the lattā and lists the good and difficult periods', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await calculateChart(page);
  await selectWorkspace(page, 'ANALYSIS');
  await visible(page, page.getByRole('button', { name: 'Sarvatobhadra', exact: true })).click();

  // The special nakshatras from the Moon's: seven, and the Janma is its own.
  const specials = visible(page, page.locator('[data-sbc="specials"]'));
  await expect(specials.locator('[data-sbc-special]')).toHaveCount(7);
  await expect(specials.locator('[data-sbc-special="Janma"] td').last()).toHaveText('1');
  await expect(specials.locator('[data-sbc-special="Abhiṣeka"] td').last()).toHaveText('15');

  // The lattā: eight grahas kick (Ketu has none), and pressing Latta marks the squares on the chakra.
  const latta = visible(page, page.locator('[data-sbc="latta"]'));
  await expect(latta.locator('[data-sbc-latta-from]')).toHaveCount(8);
  await visible(page, page.locator('[data-sbc="latta-ketu"]')).click();
  await expect(latta.locator('[data-sbc-latta-from]')).toHaveCount(9);
  await visible(page, page.locator('[data-sbc="latta-ketu"]')).click();
  await expect(visible(page, page.locator('[data-sbc="chart"]')).locator('[data-sbc-latta-square]')).toHaveCount(0);
  await visible(page, page.locator('[data-sbc="latta-toggle"]')).click();
  expect(await visible(page, page.locator('[data-sbc="chart"]')).locator('[data-sbc-latta-square]').count()).toBeGreaterThanOrEqual(1);

  // The periods from the target date on, loaded from the sign-change series.
  const periods = visible(page, page.locator('[data-sbc="periods"]'));
  await expect(periods.locator('[data-sbc-periods="windows"]')).toBeVisible({ timeout: 30_000 });
  await periods.getByRole('button', { name: '3 yr', exact: true }).click();
  await expect(periods.locator('[data-sbc-stretch]').first()).toBeVisible({ timeout: 30_000 });
  const all = await periods.locator('[data-sbc-stretch]').count();
  await periods.locator('[data-sbc-periods-filter="difficult"]').click();
  const difficult = await periods.locator('[data-sbc-stretch="difficult"]').count();
  expect(difficult).toBeLessThanOrEqual(all);
  await expect(periods.locator('[data-sbc-stretch="good"]')).toHaveCount(0);
  expect(errors).toEqual([]);
});
