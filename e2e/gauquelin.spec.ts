import { expect, test } from '@playwright/test';
import { selectWorkspace, visible } from './helpers';

// LIBRARY → Open Gauquelin (ogdb.ts): the user's own copy of the CSV is read in the browser; the occupations are the groups.

const CSV = [
  'OGID;OCCU;GQID;MUID;FNAME;GNAME;DATE;TZO;DATE-UT;PLACE;C1;C2;C3;CY;LG;LAT;GEOID',
  'andrex-1907-01-23;actor;A5-20;;ANDREX;;1907-01-23 21:00;+00:09:21;1907-01-23 20:50:40;Marseille;;13;;FR;5.38107;43.29695;2995469',
  'aaron-harold-1921-06-21;military-personnel;D10-1;;Aaron;Harold;1921-06-21 07:00;-06:00;1921-06-21 13:00;Kokomo;;IN;;US;-86.13333;40.48333;',
  'abadie-alain-1946-08-10;rugby-union-player;;;Abadie;Alain;1946-08-10 02:00;;1946-08-10 01:00;TOULOUSE;;31;;FR;-1.44;43.6;',
  'bad-row;painter;;;Bad;Row;;;;Nowhere;;;;FR;;;',
].join('\n');

test('LIBRARY Open Gauquelin reads the CSV, groups the people by occupation and opens a chart', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await selectWorkspace(page, 'LIBRARY');
  await visible(page, page.locator('[data-library-section="gauquelin"]')).click();
  const panel = visible(page, page.locator('[data-gauquelin="panel"]'));
  await expect(panel.locator('[data-gauquelin="empty"]')).toBeVisible();

  await panel.locator('[data-gauquelin="file"]').setInputFiles({ name: 'ogdb-time.csv', mimeType: 'text/csv', buffer: Buffer.from(CSV, 'utf-8') });
  await expect(panel.locator('[data-gauquelin="stats"]')).toContainText('3');
  await expect(panel.locator('[data-gauquelin-group]')).toHaveCount(3);
  await expect(panel.locator('[data-gauquelin-person]')).toHaveCount(3);

  // A group narrows the list; its people can be saved to the saved charts.
  await panel.locator('[data-gauquelin-group="actor"]').click();
  await expect(panel.locator('[data-gauquelin-person]')).toHaveCount(1);
  await expect(panel.locator('[data-gauquelin-person="andrex-1907-01-23"]')).toContainText('Andrex');
  await panel.locator('[data-gauquelin="save-group"]').click();
  await expect(panel.locator('[data-gauquelin="message"]')).toContainText('1');

  // What was loaded is kept: after a reload the people are there without the file.
  await page.reload();
  await selectWorkspace(page, 'LIBRARY');
  await visible(page, page.locator('[data-library-section="gauquelin"]')).click();
  await expect(visible(page, page.locator('[data-gauquelin-group]')).first()).toBeVisible();

  // The chart of a person opens in the CHART workspace.
  const again = visible(page, page.locator('[data-gauquelin="panel"]'));
  await again.locator('[data-gauquelin-person="aaron-harold-1921-06-21"]').getByRole('button', { name: 'Open', exact: true }).click();
  await expect(visible(page, page.locator('svg[aria-label="North Indian Jyotish chart"]'))).toBeVisible({ timeout: 30_000 });
  expect(errors).toEqual([]);
});
