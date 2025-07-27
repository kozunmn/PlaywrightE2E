import { expect } from '@playwright/test';
import { BasePage } from './base-page.po';

export class ContactUsPage extends BasePage {
    private readonly expectedSiteHeader = 'Contact us';

    // TODO Page Objects


    async validateH1HeaderText(): Promise<void> {
        const sitHeader = this.page.locator('h1');
        await expect(sitHeader).toBeEnabled();
        await expect(sitHeader).toBeVisible();
        await expect(sitHeader).toHaveText(this.expectedSiteHeader)
    }
}