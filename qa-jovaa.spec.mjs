import { test, expect } from 'playwright/test';

for (const viewport of [
  { name: 'mobile-320', width: 320, height: 780 },
  { name: 'tablet-768', width: 768, height: 900 },
  { name: 'desktop-1440', width: 1440, height: 900 }
]) {
  test(`${viewport.name}: layout, English content, and scrolling work`, async ({ page }) => {
    const errors = [];
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('pageerror', error => errors.push(error.message));
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto('http://127.0.0.1:4173/qa-preview.html', { waitUntil: 'networkidle' });
    const initial = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      scrollHeight: document.documentElement.scrollHeight,
      clientHeight: document.documentElement.clientHeight,
      arabicText: /[\u0600-\u06FF]/.test(document.body.innerText),
      bodyOverflow: getComputedStyle(document.body).overflowY,
      htmlOverflow: getComputedStyle(document.documentElement).overflowY
    }));
    expect(initial.scrollWidth).toBeLessThanOrEqual(initial.clientWidth + 1);
    expect(initial.scrollHeight).toBeGreaterThan(initial.clientHeight * 2);
    expect(initial.arabicText).toBe(false);
    expect(errors).toEqual([]);
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(250);
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(500);
    await page.screenshot({ path: `qa-${viewport.name}.png`, fullPage: true });
  });
}
