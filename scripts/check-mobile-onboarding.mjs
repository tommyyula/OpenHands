// Production-build layout regression. No model calls or credentials required.
import { chromium, devices, expect } from "@playwright/test";
const browser = await chromium.launch({ headless: true, channel: "chrome" });
try {
  for (const viewport of [
    { width: 393, height: 740 },
    { width: 360, height: 320 },
  ]) {
    const context = await browser.newContext({
      ...devices["Pixel 7"],
      viewport,
      locale: "zh-CN",
    });
    const page = await context.newPage();
    await page.goto(
      process.env.CHECK_URL || "http://127.0.0.1:4180/OpenHands/",
    );
    const modal = page.getByTestId("onboarding-modal");
    await modal.waitFor();
    const box = await modal.boundingBox();
    console.log(JSON.stringify({ viewport, box }));
    expect(box.x).toBeGreaterThanOrEqual(8);
    expect(box.y).toBeGreaterThanOrEqual(8);
    expect(box.x + box.width).toBeLessThanOrEqual(viewport.width - 8);
    expect(box.y + box.height).toBeLessThanOrEqual(viewport.height - 8);
    const next = page.getByTestId("onboarding-backend-next");
    await next.scrollIntoViewIfNeeded();
    await expect(next).toBeInViewport();
    await next.click({ trial: true });
    if (process.env.SCREENSHOT_DIR)
      await page.screenshot({
        path: `${process.env.SCREENSHOT_DIR}/onboarding-${viewport.width}-${viewport.height}.png`,
      });
    await context.close();
  }
} finally {
  await browser.close();
}
