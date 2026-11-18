import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('https://cdn.pokopiapi.com/**', route => route.abort());
  await page.goto('/');
});

test('selects, assigns, moves and unassigns without duplicates', async ({ page }) => {
  const catalog = page.getByRole('region', { name: 'Pokémon catalog', exact: true });
  const detail = page.getByRole('region', { name: 'Selected Pokémon', exact: true });
  await expect(detail).toContainText('Choose your next resident');
  await catalog.getByRole('button', { name: 'Select Bulbasaur', exact: true }).click();
  await expect(detail.getByRole('heading', { name: 'Bulbasaur', exact: true })).toBeVisible();
  await expect(detail).toContainText('Fertilize');
  await detail.getByRole('button', { name: 'Withered Wastelands', exact: true }).click();
  const wastelands = page.getByRole('region', { name: 'Withered Wastelands collection', exact: true });
  await expect(wastelands.getByRole('button', { name: 'Select Bulbasaur', exact: true })).toHaveCount(1);
  await expect(detail.getByRole('button', { name: 'Withered Wastelands', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await detail.getByRole('button', { name: 'Bleak Beach', exact: true }).click();
  await expect(wastelands).toContainText('No Pokémon assigned yet');
  const beach = page.getByRole('region', { name: 'Bleak Beach collection', exact: true });
  await expect(beach.getByRole('button', { name: 'Select Bulbasaur', exact: true })).toHaveCount(1);
  await page.reload();
  await expect(beach.getByRole('button', { name: 'Select Bulbasaur', exact: true })).toBeVisible();
  await beach.getByRole('button', { name: 'Select Bulbasaur', exact: true }).click();
  await detail.getByRole('button', { name: 'Unassign', exact: true }).click();
  await expect(detail.getByRole('button', { name: 'Unassign', exact: true })).toBeDisabled();
  await expect(beach).toContainText('No Pokémon assigned yet');
});

test('search preserves selection and all catalog entries after assignment', async ({ page }) => {
  const catalog = page.getByRole('region', { name: 'Pokémon catalog', exact: true });
  const detail = page.getByRole('region', { name: 'Selected Pokémon', exact: true });
  await catalog.getByRole('button', { name: 'Select Bulbasaur', exact: true }).click();
  await detail.getByRole('button', { name: 'Rocky Ridges', exact: true }).click();
  await expect(catalog.getByRole('button', { name: 'Select Bulbasaur', exact: true })).toBeVisible();
  await page.getByRole('searchbox', { name: 'Search Pokémon', exact: true }).fill('not-a-pokemon');
  await expect(catalog).toContainText('No Pokémon match');
  await expect(detail.getByRole('heading', { name: 'Bulbasaur' })).toBeVisible();
  await catalog.getByRole('button', { name: 'Clear search', exact: true }).click();
  await expect(catalog.getByRole('button', { name: 'Select Bulbasaur', exact: true })).toBeVisible();
});

test('reset updates selected details and saved assignments', async ({ page }) => {
  await page.getByRole('button', { name: 'Select Bulbasaur', exact: true }).click();
  await page.getByRole('button', { name: 'Bleak Beach', exact: true }).click();
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: 'Reset Saved Data', exact: true }).click();
  await page.getByRole('button', { name: 'Organize', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Bleak Beach collection', exact: true })).toContainText('No Pokémon assigned yet');
  await page.getByRole('button', { name: 'Select Bulbasaur', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Unassign', exact: true })).toBeDisabled();
  expect(await page.evaluate(() => localStorage.getItem('pokopiadex-pokemon'))).toBe('[]');
});

test('native drag moves between regions but catalog drops preserve assignments and search', async ({ page }) => {
  // Keep both source and destination visible; dragTo's pre-drag scrolling
  // otherwise moves the source coordinates when the region summaries grow.
  await page.setViewportSize({ width: 1440, height: 2400 });
  const catalog = page.getByRole('region', { name: 'Pokémon catalog', exact: true });
  const wastelands = page.getByRole('region', { name: 'Withered Wastelands collection', exact: true });
  const beach = page.getByRole('region', { name: 'Bleak Beach collection', exact: true });
  await catalog.getByLabel('Drag Bulbasaur').dragTo(wastelands);
  await expect(wastelands.getByRole('button', { name: 'Select Bulbasaur', exact: true })).toBeVisible();
  await wastelands.getByLabel('Drag Bulbasaur').dragTo(beach);
  await expect(beach.getByRole('button', { name: 'Select Bulbasaur', exact: true })).toBeVisible();
  await page.getByRole('searchbox', { name: 'Search Pokémon', exact: true }).fill('pikachu');
  await beach.getByLabel('Drag Bulbasaur').dragTo(catalog);
  await expect(page.getByRole('searchbox', { name: 'Search Pokémon', exact: true })).toHaveValue('pikachu');
  await expect(beach.getByRole('button', { name: 'Select Bulbasaur', exact: true })).toBeVisible();
  await page.getByRole('searchbox', { name: 'Search Pokémon', exact: true }).fill('');
  // Regression: an assigned catalog entry dropped back on the catalog is a no-op.
  await catalog.getByLabel('Drag Bulbasaur').dragTo(catalog, { targetPosition: { x: 10, y: 70 } });
  await expect(beach.getByRole('button', { name: 'Select Bulbasaur', exact: true })).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('pokopiadex-pokemon') ?? '[]')))
    .toEqual([{ id: 'bulbasaur', assignedRegion: 'Bleak Beach' }]);
  await expect(page.locator('.organizer-drop-active')).toHaveCount(0);
  await catalog.getByRole('button', { name: 'Select Bulbasaur', exact: true }).click();
  await page.getByRole('button', { name: 'Withered Wastelands', exact: true }).click();
  await page.screenshot({ path: 'test-results/organizer-desktop.png', fullPage: true });
});

test('rejects external payloads and cancels drags without assigning', async ({ page }) => {
  const target = page.getByRole('region', { name: 'Bleak Beach collection', exact: true });
  const payload = await page.evaluateHandle(() => {
    const data = new DataTransfer();
    data.setData('application/x-pokopiadex-pokemon', 'bulbasaur');
    return data;
  });
  await target.dispatchEvent('drop', { dataTransfer: payload });
  await expect(target).toContainText('No Pokémon assigned yet');
  const grip = page.getByRole('region', { name: 'Pokémon catalog', exact: true }).getByLabel('Drag Bulbasaur');
  await grip.dispatchEvent('dragstart', { dataTransfer: payload });
  await target.dispatchEvent('dragover', { dataTransfer: payload });
  await expect(target).toHaveClass(/organizer-drop-active/);
  await grip.dispatchEvent('dragend', { dataTransfer: payload });
  await expect(target).not.toHaveClass(/organizer-drop-active/);
  await expect(target).toContainText('No Pokémon assigned yet');
  await payload.dispose();
});

test('keyboard assignment and narrow layout work with broken images', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const select = page.getByRole('button', { name: 'Select Bulbasaur', exact: true });
  await select.focus();
  await page.keyboard.press('Enter');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Choose region for Bulbasaur', exact: true })).toBeFocused();
  await page.keyboard.press('Enter');
  const destination = page.getByRole('button', { name: 'Withered Wastelands', exact: true });
  await expect(destination).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(destination).toHaveAttribute('aria-pressed', 'true');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  const regions = page.locator('.organizer-region');
  const first = await regions.nth(0).boundingBox();
  const second = await regions.nth(1).boundingBox();
  expect(second!.y).toBeGreaterThan(first!.y + first!.height);
  await page.screenshot({ path: 'test-results/organizer-mobile.png', fullPage: true });
});

test('right-side region choices accept drops before selection and select the dragged Pokémon', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1200 });
  const detail = page.getByRole('region', { name: 'Selected Pokémon', exact: true });
  const catalog = page.getByRole('region', { name: 'Pokémon catalog', exact: true });
  const beachChoice = detail.getByRole('button', { name: 'Bleak Beach', exact: true });
  await expect(beachChoice).toBeVisible();
  await expect(beachChoice).toHaveAttribute('aria-disabled', 'true');
  await beachChoice.click({ force: true });
  expect(await page.evaluate(() => localStorage.getItem('pokopiadex-pokemon'))).toBe('[]');
  await catalog.getByLabel('Drag Bulbasaur').dragTo(beachChoice);
  await expect(detail.getByRole('heading', { name: 'Bulbasaur', exact: true })).toBeVisible();
  await expect(beachChoice).toHaveAttribute('aria-pressed', 'true');
  await expect(beachChoice).not.toHaveAttribute('aria-disabled', 'true');
  await catalog.getByRole('button', { name: 'Select Charmander', exact: true }).click();
  await catalog.getByLabel('Drag Bulbasaur').dragTo(detail.getByRole('button', { name: 'Rocky Ridges', exact: true }));
  await expect(detail.getByRole('heading', { name: 'Bulbasaur', exact: true })).toBeVisible();
  await expect(detail.getByRole('button', { name: 'Rocky Ridges', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('region', { name: 'Bleak Beach collection', exact: true })).toContainText('No Pokémon assigned yet');
  await expect(page.locator('.organizer-drop-active')).toHaveCount(0);
  // Clicking must not accidentally assign the previously selected Charmander.
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('pokopiadex-pokemon') ?? '[]'));
  expect(saved).toEqual([{ id: 'bulbasaur', assignedRegion: 'Rocky Ridges' }]);
});

test('region specialties combine providers and update after moves, unassignment and reload', async ({ page }) => {
  const catalog = page.getByRole('region', { name: 'Pokémon catalog', exact: true });
  const detail = page.getByRole('region', { name: 'Selected Pokémon', exact: true });
  const summary = page.getByRole('group', { name: 'Withered Wastelands specialties', exact: true });
  const beachSummary = page.getByRole('group', { name: 'Bleak Beach specialties', exact: true });
  await expect(summary).toContainText('Assign Pokémon to see available specialties.');
  for (const name of ['Bulbasaur', 'Ivysaur', 'Charmander']) {
    await catalog.getByRole('button', { name: `Select ${name}`, exact: true }).click();
    await detail.getByRole('button', { name: 'Withered Wastelands', exact: true }).click();
  }
  await expect(summary.getByText('Fertilize', { exact: true })).toHaveCount(1);
  await expect(summary.getByLabel('2 Pokémon provide Fertilize', { exact: true })).toBeVisible();
  await expect(summary.getByText('Burn', { exact: true })).toBeVisible();
  await expect(summary.locator('img')).toHaveCount(2);
  await expect(summary.locator('img[src$="/fertilize.png"]')).toHaveCount(1);
  await expect(summary.locator('img[src$="/burn.png"]')).toHaveCount(1);
  await expect(detail.locator('img[src$="/burn.png"]')).toHaveCount(1);
  await page.reload();
  await expect(summary.getByLabel('2 Pokémon provide Fertilize', { exact: true })).toBeVisible();
  await catalog.getByRole('button', { name: 'Select Bulbasaur', exact: true }).click();
  await detail.getByRole('button', { name: 'Bleak Beach', exact: true }).click();
  await expect(summary.getByLabel('1 Pokémon provides Fertilize', { exact: true })).toBeVisible();
  await expect(beachSummary.getByText('Fertilize', { exact: true })).toBeVisible();
  await detail.getByRole('button', { name: 'Unassign', exact: true }).click();
  await expect(beachSummary).toContainText('Assign Pokémon to see available specialties.');
  await expect(beachSummary.getByText('Fertilize', { exact: true })).toHaveCount(0);
  await page.getByRole('searchbox', { name: 'Search Pokémon', exact: true }).fill('Magikarp');
  await catalog.getByRole('button', { name: 'Select Magikarp', exact: true }).click();
  await detail.getByRole('button', { name: 'Bleak Beach', exact: true }).click();
  await expect(beachSummary).toContainText('No specialties recorded for these Pokémon.');
});

test('other tabs remain available and real artwork can load', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.unroute('https://cdn.pokopiapi.com/**');
  await page.reload();
  await page.getByRole('button', { name: 'Select Bulbasaur', exact: true }).click();
  const artwork = page.locator('.organizer-detail .organizer-art');
  await expect(artwork).toBeVisible();
  // Allow real artwork to settle; failures still render a stable fallback.
  await artwork.evaluate(async element => {
    const img = element.querySelector('img');
    if (img) await Promise.race([img.decode().catch(() => {}), new Promise(resolve => setTimeout(resolve, 4000))]);
  });
  await page.locator('.organizer-workspace').screenshot({ path: 'test-results/organizer-workspace.png' });
  await page.getByRole('button', { name: 'Pokedex', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Pokémon details', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Items', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Items', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Organize', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Pokémon catalog', exact: true })).toBeVisible();
});
