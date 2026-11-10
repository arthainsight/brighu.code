import { expect, test } from '@playwright/test';
import { calculateChart, selectWorkspace, visible } from './helpers';

// True signs (trueSigns.ts): the overall balance of signs and the balance of one graha, in per cent.

test('ANALYSIS True signs shows the balance of signs that sums to a hundred per cent', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await calculateChart(page);
  await selectWorkspace(page, 'ANALYSIS');
  await visible(page, page.getByRole('button', { name: 'True signs', exact: true })).click();
  const panel = visible(page, page.locator('[data-true-signs="panel"]'));
  const sum = async (marker: string) => (await panel.locator(`[data-true-signs-bars="${marker}"] [data-true-sign-percent]`).evaluateAll(rows => rows.map(row => Number(row.getAttribute('data-true-sign-percent'))))).reduce((a, b) => a + b, 0);
  expect(Math.abs((await sum('overall')) - 100)).toBeLessThan(1);
  // One graha: six divisions in the table, and its shares are thirteenths.
  await expect(panel.locator('[data-true-signs-table="Venus"] tbody tr')).toHaveCount(6);
  expect(Math.abs((await sum('Venus')) - 100)).toBeLessThan(1);
  expect(errors).toEqual([]);
});
