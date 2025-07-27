import { Page, Locator, expect } from '@playwright/test';


export async function navigateToByUrl<TPage extends object>(page: Page, urlPath: string = "/", createPage: (page: Page) => TPage
): Promise<TPage> {
    const expectedUrl = new RegExp(`${urlPath}.*`);
    await page.goto("/" + urlPath, { waitUntil: 'networkidle' });
    await expect(page).toHaveURL(expectedUrl);
    return createPage(page);
}

export async function changeTheSiteLanguage<TPage extends object>(
    page: Page, 
    createPage: (page: Page) => TPage
): Promise<TPage> {
    const navLang = page.locator('.nav__menu-wrapper .nav__lang span');
    await expect(navLang).toBeVisible();
    await expect(navLang).toBeEnabled();
    await navLang.click();
    await page.waitForSelector('li.lang-item:not(.current)', { state: 'visible' });
    await page.locator('li.lang-item:not(.current)').click();
    await page.waitForLoadState('load');
    return createPage(page);
}

export async function scrollToBottomAndCollectErrors() {
    const networkErrors: string[] = [];
    const consoleErrors: string[] = [];

    this.page.on('requestfailed', req => {
        networkErrors.push(`[${req.method()}] ${req.url()} — ${req.failure()?.errorText}`);
    });

    this.page.on('console', msg => {
        if (msg.type() === 'error') {
            consoleErrors.push(msg.text());
        }
    });

    let prevHeight = await this.page.evaluate(() => document.body.scrollHeight);
    while (true) {
        await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await this.page.waitForTimeout(1000);
        const currHeight = await this.page.evaluate(() => document.body.scrollHeight);
        if (currHeight === prevHeight) break;
        prevHeight = currHeight;
    }

    return { networkErrors, consoleErrors };
}