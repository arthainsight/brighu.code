import { expect, test } from '@playwright/test';
import { calculateChart, selectWorkspace, visible } from './helpers';

// Vela (vela.ts): the Sattva, Rajas or Tamas Vela of birth by both lengths of the half-yāma, with what is unconfirmed said on the page.

test('ANALYSIS Vela gives the Vela by both lengths and says what the text does not settle', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await calculateChart(page);   // 15 August 1947, 09:15 in New Delhi: a Friday, a little over three hours after sunrise
  await selectWorkspace(page, 'ANALYSIS');
  await visible(page, page.getByRole('button', { name: 'Vela', exact: true })).click();
  const panel = visible(page, page.locator('[data-vela="panel"]'));

  await expect(panel.locator('[data-vela="unconfirmed"]')).toContainText('Not confirmed by the classical text');
  await expect(panel.locator('[data-vela="unconfirmed"] li')).toHaveCount(4);
  await expect(panel.locator('[data-vela-weekday]')).toHaveAttribute('data-vela-weekday', '5');   // Friday
  const rows = panel.locator('[data-vela-method]');
  await expect(rows).toHaveCount(2);
  for (const guna of await rows.evaluateAll(items => items.map(item => item.getAttribute('data-vela-guna')))) expect(['Sattva', 'Rajas', 'Tamas']).toContain(guna);
  for (const segment of await rows.evaluateAll(items => items.map(item => Number(item.getAttribute('data-vela-segment'))))) {
    expect(segment).toBeGreaterThanOrEqual(1);
    expect(segment).toBeLessThanOrEqual(16);
  }
  // Friday begins with Rajas (Rajas, Tamas, Sattva, Rajas …): a birth in the 3rd half-yāma is Sattva, by either length.
  await expect(panel.locator('[data-vela-method="fixed"]')).toHaveAttribute('data-vela-guna', 'Sattva');
  await expect(panel.locator('[data-vela-agree]')).toHaveAttribute('data-vela-agree', 'true');
  await expect(panel.locator('[data-vela-reading="Sattva"]')).toContainText('9.123');
  await expect(panel).toContainText('Jātakapārijāta 9.123–125');
  // The sixteen half-yāmas of each method can be opened, the birth's marked.
  await panel.locator('[data-vela-parts="fixed"] summary').click();
  await expect(panel.locator('[data-vela-parts="fixed"] tr')).toHaveCount(16);
  expect(errors).toEqual([]);
});
