import { expect, test, type Page } from '@playwright/test';
import { visible } from './helpers';

// The page opens with the chart of this moment at the visitor's own place, as the hosting platform has it from the address of the
// request (Porvoo where there is none: a local run has no such headers), North Indian, the name empty; the place and the moment are in
// the form to change, and Settings can make the page open at Porvoo or blank. (The other tests start blank: playwright.config.ts turns it off.)

/** Today in Porvoo as the page shows it: dd.mm.yyyy. */
const todayInPorvoo = () => new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Helsinki', day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date()).replace(/\//g, '.');

/** The birth data form: beside the chart on a wide screen, behind the edit button of the summary on a phone. */
async function birthDataForm(page: Page) {
  const moment = visible(page, page.getByPlaceholder('15.08.1947 09.15.00'));
  if (!(await moment.isVisible())) await visible(page, page.getByRole('button', { name: 'edit', exact: true })).click();
  return { moment, place: visible(page, page.getByPlaceholder('e.g. New Delhi')) };
}

/** The window the page opens with. */
const welcome = (page: Page) => page.locator('[data-welcome]').first();
/** Closes the window the way a visitor who wants to look at the page does: "Decide later" when there is a question, "Close" when there is none. */
async function closeWelcome(page: Page) {
  const dialog = welcome(page);
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: /^(Decide later|Close)$/ }).click();
  await expect(dialog).toHaveCount(0);
}
const CHART = 'svg[aria-label="North Indian Jyotish chart"]';
const TOKYO = { city: 'Tokyo', country: 'JP', latitude: 35.6895, longitude: 139.6917, timezone: 'Asia/Tokyo' };

test.describe('the page opens with a chart', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('of now at Porvoo until the visitor says yes to the place, North Indian, with the name empty', async ({ page }, info) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('/');

    // The chart is there without a button pressed, and it is the North Indian one.
    await expect(visible(page, page.locator('svg[aria-label="North Indian Jyotish chart"]'))).toBeVisible({ timeout: 30_000 });
    await expect(visible(page, page.getByText(/Asc \d+°\d+'|ASC \d+°\d+'/))).toBeVisible();
    // Name empty (an unnamed chart is "Untitled"), the place Porvoo, the date today in Porvoo and a time of day.
    // (A phone does not show the name of the chart in its header.)
    if (info.project.name === 'desktop') await expect(page.getByText('Untitled').first()).toBeVisible();
    await closeWelcome(page);
    const { moment, place } = await birthDataForm(page);
    await expect(place).toHaveValue('Porvoo');
    await expect(moment).toHaveValue(new RegExp('^' + todayInPorvoo().replace(/\./g, '\\.') + ' \\d{2}\\.\\d{2}\\.\\d{2}$'));
    expect(errors).toEqual([]);
  });

  test('and the place and the moment can be changed in the form', async ({ page }) => {
    await page.route('**/api/geocode**', (route) => route.fulfill({ json: { results: [{ name: 'New Delhi', country: 'India', latitude: 28.6139, longitude: 77.209, timezone: 'Asia/Kolkata' }] } }));
    await page.goto('/');
    await expect(visible(page, page.locator('svg[aria-label="North Indian Jyotish chart"]'))).toBeVisible({ timeout: 30_000 });
    await closeWelcome(page);

    const { moment, place } = await birthDataForm(page);
    await moment.fill('15.08.1947 09.15.00');
    await place.fill('New Delhi');
    await visible(page, page.getByRole('button', { name: 'lookup' })).click();
    await visible(page, page.getByRole('button', { name: 'Calculate Chart' })).click();
    await expect(visible(page, page.getByText(/Asc 12°18'|ASC 12°18'/))).toBeVisible({ timeout: 30_000 });
  });

  test('at the place the platform gives for the visitor, by the clock of that place, after a yes', async ({ page }) => {
    await page.route('**/api/locale', (route) => route.fulfill({ json: TOKYO }));
    await page.goto('/');
    await expect(visible(page, page.locator('svg[aria-label="North Indian Jyotish chart"]'))).toBeVisible({ timeout: 30_000 });
    await welcome(page).getByRole('button', { name: 'Yes, use my place' }).click();
    // The chart moves to Tokyo when the place has been found; the form is read after that (on a phone it folds away with the new chart).
    await expect(visible(page, page.getByText(/\+9h UTC/))).toBeVisible();
    const { moment, place } = await birthDataForm(page);
    await expect(place).toHaveValue('Tokyo');
    await expect(place).toHaveValue('Tokyo');
    const today = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Tokyo', day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date()).replace(/\//g, '.');
    await expect(moment).toHaveValue(new RegExp('^' + today.replace(/\./g, '\\.') + ' \\d{2}\\.\\d{2}\\.\\d{2}$'));
    // Tokyo is nine hours from Greenwich all the year.
    await expect(visible(page, page.getByText(/\+9h UTC/))).toBeVisible();
  });

  test('at Porvoo when the place is not found', async ({ page }) => {
    await page.route('**/api/locale', (route) => route.fulfill({ status: 500, body: 'no' }));
    await page.goto('/');
    await expect(visible(page, page.locator('svg[aria-label="North Indian Jyotish chart"]'))).toBeVisible({ timeout: 30_000 });
    await welcome(page).getByRole('button', { name: 'Yes, use my place' }).click();
    await expect((await birthDataForm(page)).place).toHaveValue('Porvoo');
  });

  test('Porvoo whatever the platform says, when Settings choose it', async ({ page }) => {
    await page.route('**/api/locale', (route) => route.fulfill({ json: { city: 'Tokyo', country: 'JP', latitude: 35.6895, longitude: 139.6917, timezone: 'Asia/Tokyo' } }));
    await page.addInitScript(() => { try { if (!localStorage.getItem('openWithNowChart')) localStorage.setItem('openWithNowChart', 'porvoo'); } catch {} });
    await page.goto('/');
    await expect(visible(page, page.locator('svg[aria-label="North Indian Jyotish chart"]'))).toBeVisible({ timeout: 30_000 });
    // The choice is made: the window has the updates and no question.
    await expect(welcome(page).locator('[data-welcome="place"]')).toHaveCount(0);
    await expect(welcome(page).locator('[data-welcome="updates"]')).toBeVisible();
    await closeWelcome(page);
    await expect((await birthDataForm(page)).place).toHaveValue('Porvoo');
  });

  test('an old "off" of Settings is still blank, and Settings can make the page open blank', async ({ page }) => {
    await page.addInitScript(() => { try { localStorage.setItem('openWithNowChart', 'false'); } catch {} });
    await page.goto('/');
    await expect(visible(page, page.getByRole('button', { name: 'Calculate Chart' }))).toBeVisible();
    await expect(page.locator('svg[aria-label="North Indian Jyotish chart"]')).toHaveCount(0);
  });

  test('unless Settings say to open blank', async ({ page }) => {
    await page.goto('/');
    await expect(visible(page, page.locator('svg[aria-label="North Indian Jyotish chart"]'))).toBeVisible({ timeout: 30_000 });
    await closeWelcome(page);
    await visible(page, page.getByRole('button', { name: '⚙' })).click();
    const choice = visible(page, page.getByLabel('the page opens with'));
    await expect(choice).toHaveValue('place');
    await choice.selectOption('blank');
    await page.reload();
    await expect(visible(page, page.getByRole('button', { name: 'Calculate Chart' }))).toBeVisible();
    await expect(page.locator('svg[aria-label="North Indian Jyotish chart"]')).toHaveCount(0);
  });
  test('asks before it looks up the place, and does not look anything up before a yes', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    let lookups = 0;
    await page.route('**/api/locale', (route) => { lookups += 1; return route.fulfill({ json: TOKYO }); });
    await page.goto('/');
    await expect(visible(page, page.locator(CHART))).toBeVisible({ timeout: 30_000 });

    // The window asks, names the version and lists the updates; the chart behind it is the one at Porvoo and nothing has been looked up.
    const dialog = welcome(page);
    await expect(dialog.getByRole('dialog')).toBeVisible();
    await expect(dialog.locator('[data-welcome="place"]')).toContainText('Open the chart where you are?');
    await expect(dialog.locator('[data-welcome="updates"] li').first()).toBeVisible();
    await expect(dialog.locator('[data-welcome="updates"]')).toContainText('v4.');
    expect(lookups).toBe(0);

    // A yes looks the place up once, moves the chart to it, and the question does not come again.
    await dialog.getByRole('button', { name: 'Yes, use my place' }).click();
    await expect(dialog).toHaveCount(0);
    await expect((await birthDataForm(page)).place).toHaveValue('Tokyo');
    expect(lookups).toBe(1);
    expect(await page.evaluate(() => localStorage.getItem('openWithNowChart'))).toBe('place');
    await page.reload();
    await expect(visible(page, page.locator(CHART))).toBeVisible({ timeout: 30_000 });
    await expect(welcome(page)).toHaveCount(0);
    await expect((await birthDataForm(page)).place).toHaveValue('Tokyo');
    expect(errors).toEqual([]);
  });

  test('a no keeps the chart at Porvoo, looks nothing up and is not asked again', async ({ page }) => {
    let lookups = 0;
    await page.route('**/api/locale', (route) => { lookups += 1; return route.fulfill({ json: TOKYO }); });
    await page.goto('/');
    await expect(visible(page, page.locator(CHART))).toBeVisible({ timeout: 30_000 });
    await welcome(page).getByRole('button', { name: 'No, use Porvoo' }).click();
    await expect(welcome(page)).toHaveCount(0);
    expect(await page.evaluate(() => localStorage.getItem('openWithNowChart'))).toBe('porvoo');
    await page.reload();
    await expect(visible(page, page.locator(CHART))).toBeVisible({ timeout: 30_000 });
    await expect(welcome(page)).toHaveCount(0);
    await expect((await birthDataForm(page)).place).toHaveValue('Porvoo');
    expect(lookups).toBe(0);
  });

  test('"Decide later" asks again next time, but the updates are shown once', async ({ page }) => {
    let lookups = 0;
    await page.route('**/api/locale', (route) => { lookups += 1; return route.fulfill({ json: TOKYO }); });
    await page.goto('/');
    await expect(visible(page, page.locator(CHART))).toBeVisible({ timeout: 30_000 });
    await welcome(page).getByRole('button', { name: 'Decide later' }).click();
    await expect(welcome(page)).toHaveCount(0);
    expect(await page.evaluate(() => localStorage.getItem('openWithNowChart'))).toBeNull();
    await page.reload();
    await expect(visible(page, page.locator(CHART))).toBeVisible({ timeout: 30_000 });
    await expect(welcome(page).locator('[data-welcome="place"]')).toBeVisible();
    await expect(welcome(page).locator('[data-welcome="updates"]')).toHaveCount(0);
    await closeWelcome(page);
    await expect((await birthDataForm(page)).place).toHaveValue('Porvoo');
    expect(lookups).toBe(0);
  });

  test('Escape closes the window like "Decide later"', async ({ page }) => {
    await page.goto('/');
    // The window has the focus once its key handler is on (both are set in one step).
    await expect(welcome(page).getByRole('button', { name: 'Yes, use my place' })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(welcome(page)).toHaveCount(0);
  });
});
