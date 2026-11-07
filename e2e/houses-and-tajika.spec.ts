import { expect, test, type Page } from '@playwright/test';
import { calculateChart, selectWorkspace, visible } from './helpers';

// The house systems, the KP view, the planetary data, the two Tājika strengths of the Varṣaphala and the chart search. The numbers are
// checked in the unit tests (the cusps against the angles of the Swiss Ephemeris, the KP lords at the borders of the subs, the Harṣa Bala
// against the worked example of a book, the search against hand-made charts); here the views are there, agree with each other and do not fail.

test('ANALYSIS Bhava Chalit has the cusp systems, and KP and Planetary data views', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await calculateChart(page);
  await selectWorkspace(page, 'ANALYSIS');

  // Placidus: the cusps begin the bhavas, so the 1st begins at the Lagna (Virgo 12°18′) and the 10th at the Midheaven.
  await visible(page, page.getByRole('button', { name: 'Bhava Chalit', exact: true })).click();
  await visible(page, page.getByLabel('bhava system')).selectOption('placidus');
  const table = visible(page, page.locator('table[data-chalit="table"]'));
  await expect(table.locator('tr[data-bhava]')).toHaveCount(12);
  await expect(table.locator('tr[data-bhava="1"] td').nth(2)).toContainText('Vi 12°18′');
  // Equal from the Lagna begins the 4th exactly 90° on from the Lagna.
  await visible(page, page.getByLabel('bhava system')).selectOption('equal-start');
  await expect(table.locator('tr[data-bhava="4"] td').nth(2)).toContainText('Sg 12°18′');

  // KP: twelve cusps with their lords, nine grahas, and a note that this chart (Lahiri) does not use the Krishnamurti ayanamsa.
  await visible(page, page.getByRole('button', { name: 'KP', exact: true })).click();
  await expect(visible(page, page.locator('table[data-kp="cusps"]')).locator('tbody tr')).toHaveCount(12);
  await expect(visible(page, page.locator('table[data-kp="cusps"]')).locator('tr[data-cusp="1"]')).toContainText('Vi 12°18′');
  await expect(visible(page, page.locator('table[data-kp="grahas"]')).locator('tbody tr')).toHaveCount(9);
  await expect(visible(page, page.locator('[data-kp="ayanamsa"]'))).toBeVisible();

  // Planetary data: a row for each body, the Sun with no elongation and the nodes with no distance.
  await visible(page, page.getByRole('button', { name: 'Planetary data', exact: true })).click();
  const data = visible(page, page.locator('table[data-planetary="table"]'));
  expect(await data.locator('tbody tr').count()).toBeGreaterThanOrEqual(9);
  const sun = data.locator('tr[data-graha="Sun"] td');
  await expect(sun.nth(2)).toContainText('+'); // the Sun's declination on 15 August is north
  await expect(sun.nth(7)).toHaveText('—');
  await expect(data.locator('tr[data-graha="Rahu"] td').nth(4)).toHaveText('—');
  expect(errors).toEqual([]);
});

test('TIMING Varṣaphala shows the Dvādaśavargīya Bala and the Harṣa Bala of the seven grahas', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await calculateChart(page);
  await selectWorkspace(page, 'TIMING');
  await visible(page, page.getByRole('button', { name: 'Varṣaphala', exact: true })).click();

  const dvadasha = visible(page, page.locator('[data-tajika="dvadashavargiya"]'));
  await expect(dvadasha.locator('tbody tr')).toHaveCount(7);
  // Good less evil is the total, for each graha.
  for (let row = 0; row < 7; row += 1) {
    const cells = await dvadasha.locator('tbody tr').nth(row).locator('td').allTextContents();
    const [good, evil, total] = cells.slice(-3).map(Number);
    expect(good - evil).toBe(total);
  }

  const harsha = visible(page, page.locator('[data-tajika="harsha"]'));
  await expect(harsha.locator('tbody tr')).toHaveCount(7);
  for (let row = 0; row < 7; row += 1) {
    const numbers = (await harsha.locator('tbody tr').nth(row).locator('td').allTextContents()).slice(1).map(Number);
    // Four joys of five points: each is 0 or 5 and the total is their sum, at most 20.
    expect(numbers.slice(0, 4).every(value => value === 0 || value === 5)).toBe(true);
    expect(numbers[4]).toBe(numbers.slice(0, 4).reduce((sum, value) => sum + value, 0));
    expect(numbers[4]).toBeLessThanOrEqual(20);
  }
  expect(errors).toEqual([]);
});

const savedChart = (id: string, name: string, birthDatetime: string, client = '') => ({
  id, name, client, createdAt: '2020-01-01T00:00:00.000Z', updatedAt: '2020-01-01T00:00:00.000Z',
  chartData: { birthDatetime, city: 'New Delhi', manualLat: '28.6139', manualLng: '77.209', ianaTimezone: 'Asia/Kolkata', tzOverride: '', targetDate: '2026-10-19', showCoords: true },
});

async function seedCharts(page: Page) {
  await page.addInitScript((charts) => {
    try { localStorage.setItem('bcp_saved_charts', JSON.stringify(charts)); } catch {}
  }, [savedChart('c1', 'Alpha', '15.08.1947 09.15.00', 'Family'), savedChart('c2', 'Beta', '03.03.1975 06.30.00', 'Friends')]);
}

test('LIBRARY Chart search finds the saved charts by the sign of the Lagna, and by name', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await seedCharts(page);
  await calculateChart(page);
  await selectWorkspace(page, 'LIBRARY');
  const panel = visible(page, page.getByRole('region', { name: 'research' }));
  await panel.getByRole('button', { name: 'Chart search', exact: true }).click();
  const search = visible(page, page.locator('[data-research-chart-search]'));

  // The Lagna of the first chart is Virgo (12°18′); the second chart's is not.
  const row = search.locator('[data-criterion="0"]');
  await row.getByLabel('graha').selectOption('Lagna');
  await row.getByLabel('value').selectOption({ label: 'Virgo' });
  await search.getByRole('button', { name: 'Search', exact: true }).click();
  const results = search.locator('[data-search="results"]');
  await expect(results).toContainText('1 / 2');
  await expect(results.locator('[data-hit="c1"]')).toContainText('Alpha');
  await expect(results.locator('[data-hit="c2"]')).toHaveCount(0);

  // Any of two conditions finds both when the second is met by the other chart; the name narrows the list.
  await search.getByRole('button', { name: '+ condition', exact: true }).click();
  const second = search.locator('[data-criterion="1"]');
  await second.getByLabel('graha').selectOption('Lagna');
  await second.getByLabel('value').selectOption({ label: 'Aquarius' });
  await search.getByLabel('charts that meet').selectOption('any');
  await search.getByRole('button', { name: 'Search', exact: true }).click();
  await expect(results).toContainText('2 / 2');
  await search.getByLabel('name or client').fill('friends');
  await search.getByRole('button', { name: 'Search', exact: true }).click();
  await expect(results).toContainText('1 / 2');
  await expect(results.locator('[data-hit="c2"]')).toContainText('Beta');

  // A result opens its chart: the chart workspace shows the birth moment of the second chart, the header names it, and SAVE would write to it.
  await results.locator('[data-open-chart="c2"]').click();
  await expect(visible(page, page.getByPlaceholder('15.08.1947 09.15.00'))).toHaveValue('03.03.1975 06.30.00');
  await expect(visible(page, page.locator('header').getByText('Beta', { exact: true }))).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('bcp_active_saved_chart_id'))).toBe('c2');
  expect(errors).toEqual([]);
});
