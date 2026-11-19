import { expect, test } from '@playwright/test';
import { calculateChart, selectWorkspace, visible } from './helpers';

// Sarvatobhadra: the lattā (the kick of each graha) and the good and difficult periods (sarvatobhadraPeriods.ts).

test('ANALYSIS Sarvatobhadra marks the lattā and lists the good and difficult periods', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await calculateChart(page);
  await selectWorkspace(page, 'ANALYSIS');
  await visible(page, page.getByRole('button', { name: 'Sarvatobhadra', exact: true })).click();

  // Each line of vedha tells the pada it reaches (the pada number of the graha) and the house of that pada.
  const vedha = visible(page, page.locator('[data-sbc="vedha"]'));
  const reach = vedha.locator('[data-sbc-vedha-pada]').first();
  expect(['1', '2', '3', '4', 'none']).toContain(await reach.getAttribute('data-sbc-vedha-pada'));
  expect(Number(await reach.getAttribute('data-sbc-vedha-house'))).toBeGreaterThanOrEqual(1);
  await expect(vedha.locator('[data-sbc-vedha-from]').first()).toContainText(/pada [1-4]|no pada/);

  // The special nakshatras from the Moon's: eleven, the king's three counted in 28.
  const specials = visible(page, page.locator('[data-sbc="specials"]'));
  await expect(specials.locator('[data-sbc-special]')).toHaveCount(11);
  await expect(specials.locator('[data-sbc-special="Janma"] td').last()).toHaveText('1');
  await expect(specials.locator('[data-sbc-special="Abhiṣeka"] td').last()).toHaveText(/28/);

  // The lattā: eight grahas kick (Ketu has none), and pressing Latta marks the squares on the chakra.
  const latta = visible(page, page.locator('[data-sbc="latta"]'));
  await expect(latta.locator('[data-sbc-latta-from]')).toHaveCount(8);
  await visible(page, page.locator('[data-sbc="latta-ketu"]')).click();
  await expect(latta.locator('[data-sbc-latta-from]')).toHaveCount(9);
  await visible(page, page.locator('[data-sbc="latta-ketu"]')).click();
  await expect(visible(page, page.locator('[data-sbc="chart"]')).locator('[data-sbc-latta-square]')).toHaveCount(0);
  await visible(page, page.locator('[data-sbc="latta-toggle"]')).click();
  expect(await visible(page, page.locator('[data-sbc="chart"]')).locator('[data-sbc-latta-square]').count()).toBeGreaterThanOrEqual(1);

  // The lattā can bite the whole nakshatra or only the pada of the kicker, whose number is then shown.
  await expect(latta.locator('[data-sbc-latta-from]').first()).not.toContainText('pada');
  await visible(page, page.locator('[data-sbc="kick-pada"]')).click();
  await expect(latta.locator('[data-sbc-latta-from]').first()).toContainText(/pada [1-4]/);
  await visible(page, page.locator('[data-sbc="kick-nakshatra"]')).click();
  await expect(latta.locator('[data-sbc-latta-from]').first()).not.toContainText('pada');

  // The transits over the natal planets: one row for each of the nine, each with a verdict.
  const natal = visible(page, page.locator('[data-sbc="natal-transits"]'));
  await expect(natal.locator('[data-sbc-natal]')).toHaveCount(9);
  for (const verdict of await natal.locator('[data-sbc-natal]').evaluateAll(rows => rows.map(row => row.getAttribute('data-sbc-natal-verdict')))) {
    expect(['clear', 'supported', 'afflicted', 'mixed']).toContain(verdict);
  }

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
