import { Page, test, expect } from '@playwright/test';
import * as actionsHelper from '../helpers/actions.helper'
import { MainPage } from '../page-objects/pages/main-page.po';

let mainPage: MainPage;

// .gotoMainPage() powtarza się dla kazdego testu, więc wynosimy do before
test.beforeEach(async ({ page }) => {
  mainPage = await new MainPage(page)
    .gotoMainPage(); // zgodnie ze wzorcem PO zapisujemy obiekt zwrócony przez gotoMainPage() jako mainPage. Teraz możemy na tym kontekście pracować
});

test.describe('When the home page loads', () => {
  test('language change should work properly', async ({ page }) => {
    mainPage = await actionsHelper.changeTheSiteLanguage(page, page => new MainPage(page)); // tak jak w przypadku każdych testów staramy się oddzielić logikę biznesową od funkcji testowej: czytelność, bo przegladając test chcemy się skupić na scenariuszu, łatwe utrzymanie/refactoring
    expect(page.url()).toContain('/pl/');
    const actualLangAttr = getLangAttr(page);
    expect(actualLangAttr).toBe('pl');
    await expect(page.locator('.menu-item-object-page')).toHaveText(/^Kontakt$/);
  });

  test('I should be able to go to the contact page', async () => {
    const contactUsPage = await mainPage.gotoContactUsPage();
    await contactUsPage.validateH1HeaderText();
  });

  test('I should be able to go to the facebook profile page', async ({ context }) => {
    await mainPage.validateFacebookLink(context); // przekazujemy context, bo otwiera się strona w nowej zakładce w ramach tego samego browserContext 
  });

  test('no errors should appear on the page', async () => {
    const { networkErrors, consoleErrors } = await actionsHelper.scrollToBottomAndCollectErrors();
    expect.soft(networkErrors, 'Network errors').toHaveLength(0);
    expect.soft(consoleErrors, 'Console errors').toHaveLength(0); // soft asercje, bo chcemy zebrać wszystko za jednym uruchomieniem
  });
});

async function getLangAttr(page: Page) {
  return await page.getAttribute('html', 'lang');
}
