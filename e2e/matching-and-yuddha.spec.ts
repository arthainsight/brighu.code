import { expect, test, type Page } from '@playwright/test';
import { calculateChart, selectWorkspace, visible } from './helpers';

// The Ashtakoota of two saved charts (LIBRARY → Compatibility) and the choice of a rule for the planetary war in the Ṣaḍbala. The numbers are checked in the
// unit tests (by hand, and against PyJHora on every pair of Moon stars); here the views are there, agree with themselves and do not fail.

const savedChart = (id: string, name: string, birthDatetime: string) => ({
  id, name, client: '', createdAt: '2020-01-01T00:00:00.000Z', updatedAt: '2020-01-01T00:00:00.000Z',
  chartData: { birthDatetime, city: 'New Delhi', manualLat: '28.6139', manualLng: '77.209', ianaTimezone: 'Asia/Kolkata', tzOverride: '', targetDate: '2026-10-19', showCoords: true },
});

async function seedCharts(page: Page) {
  await page.addInitScript((charts) => {
    try { localStorage.setItem('bcp_saved_charts', JSON.stringify(charts)); } catch {}
  }, [savedChart('c1', 'Alpha', '15.08.1947 09.15.00'), savedChart('c2', 'Beta', '03.03.1975 06.30.00')]);
}

test('LIBRARY Compatibility matches two saved charts by the Ashtakoota', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await seedCharts(page);
  await calculateChart(page);
  await selectWorkspace(page, 'LIBRARY');
  await visible(page, page.getByRole('group', { name: 'Library sections' }).getByRole('button', { name: 'Compatibility', exact: true })).click();
  const panel = visible(page, page.locator('[data-compat="panel"]'));
  await panel.getByLabel('boy (groom)').selectOption({ label: 'Alpha' });
  await panel.getByLabel('girl (bride)').selectOption({ label: 'Beta' });
  await panel.getByRole('button', { name: 'Match', exact: true }).click();

  // Eight kutas, each within its maximum, adding up to the total shown, which is within 36.
  const kutas = panel.locator('[data-compat="kutas"] tbody tr');
  await expect(kutas).toHaveCount(8);
  const max = [1, 2, 3, 4, 5, 6, 7, 8];
  let sum = 0;
  for (let row = 0; row < 8; row += 1) {
    const points = (await kutas.nth(row).locator('td').nth(2).innerText()).split('/').map((part) => Number(part.trim()));
    expect(points[1]).toBe(max[row]);
    expect(points[0]).toBeGreaterThanOrEqual(0);
    expect(points[0]).toBeLessThanOrEqual(max[row]);
    sum += points[0];
  }
  const total = Number((await panel.locator('[data-compat="total"]').innerText()).split('/')[0].trim());
  expect(total).toBe(sum);
  expect(total).toBeLessThanOrEqual(36);
  await expect(panel.locator('[data-compat="extras"] tbody tr')).toHaveCount(4);
  await expect(panel.locator('[data-compat="kuja"]')).toBeVisible();

  // The same chart against itself: the same Moon, so the same Nadi (0 of 8) and the Nadi dosha, the same sign (7 of 7) and the same lord (5 of 5).
  await panel.getByLabel('girl (bride)').selectOption({ label: 'Alpha' });
  await panel.getByRole('button', { name: 'Match', exact: true }).click();
  await expect(panel.locator('[data-kuta="nadi"]')).toContainText('0 / 8');
  await expect(panel.locator('[data-kuta="bhakoot"]')).toContainText('7 / 7');
  await expect(panel.locator('[data-kuta="maitri"]')).toContainText('5 / 5');
  await expect(panel.locator('[data-compat="doshas"]')).toContainText('Nadi dosha');
  // The same star in the same quarter: nothing cancels the Nāḍī dosha (Muhūrta Cintāmaṇi 6.37), and the same Rajju division fails with what it does (Kālaprakāśikā).
  await expect(panel.locator('[data-dosha="nadi"]')).not.toContainText('Cancelled');
  await expect(panel.locator('[data-extra="rajju"]')).toContainText('not passed');
  await expect(panel.locator('[data-extra="rajju"]')).toContainText(/travel in foreign countries|loss of property|loss of offspring|death of the woman|death of the man/);
  await expect(panel.locator('[data-extra="mahendra"]')).toContainText('1.');

  // The Lagnas can be matched instead of the Moons.
  await panel.getByLabel('matched by the').selectOption('Lagna');
  await panel.getByRole('button', { name: 'Match', exact: true }).click();
  await expect(panel.locator('[data-kuta="bhakoot"]')).toContainText('7 / 7');
  expect(errors).toEqual([]);
});

test('LIBRARY Compatibility asks for saved charts when there are none', async ({ page }) => {
  await calculateChart(page);
  await selectWorkspace(page, 'LIBRARY');
  await visible(page, page.getByRole('group', { name: 'Library sections' }).getByRole('button', { name: 'Compatibility', exact: true })).click();
  await expect(visible(page, page.locator('[data-compat="empty"]'))).toBeVisible();
});

test('ANALYSIS Bala: the planetary war can be given a rule, and the page says so', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await calculateChart(page);
  await selectWorkspace(page, 'ANALYSIS');
  await visible(page, page.getByRole('button', { name: 'Bala', exact: true })).click();
  await expect(visible(page, page.getByText(/Yuddha Bala is not included/))).toBeVisible();
  await visible(page, page.getByText('Calculation choices')).click();
  const choice = visible(page, page.getByLabel('Yuddha Bala: the planetary war', { exact: true }));
  await expect(choice).toHaveValue('off');
  await choice.selectOption('verse');
  await expect(visible(page, page.getByText(/Yuddha Bala is in Kāla Bala by the rule chosen/))).toBeVisible();
  await visible(page, page.getByRole('button', { name: 'Back to the Sanskrit reading', exact: true })).click();
  await expect(visible(page, page.getByText(/Yuddha Bala is not included/))).toBeVisible();
  expect(errors).toEqual([]);
});
