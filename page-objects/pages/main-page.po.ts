import { Page, Locator, BrowserContext, expect } from '@playwright/test';
import { BasePage } from './base-page.po';
import { ContactUsPage } from './contact-us-page.po';

export class MainPage extends BasePage {

    // TODO Page Objects


    async gotoMainPage(): Promise<MainPage> { // Promise jawnie wskazany, aby kod był czytelniejszy
        await this.page.goto('/', { waitUntil: 'networkidle' }); // domyślny waitUntil: 'load' może być flaky przy aplikacjach typu SPA(React, Angular...)
        await expect(this.page).toHaveTitle("Ntropy");
        await expect(this.page.locator('.homepage__hero-title')).toBeVisible(); // dodatkowe upewnienie się, że strona została poprawnie załadowana i jesteśmy we właściwym miejscu
        return this; // zgodnie ze wzorcem PO w wyniku akcji .goto() zmienia się kontekst, zatem zwracamy nowy po
    }

    /*
    Akcje na elemencie mają w sobie auto-waity, ale w aplikacjach typu SPA(React, Angular...) bywają zawodne/nieprzewidywalne, gdy np. występuje lazy-loading, animacje fade-in itp.
    Po auto-wait'ach element może być dla Palywright'a technicznie obecny w DOM, mimo że użytkownik na stronie nadal go nie widzi (jest np. przezroczysty). Playwright nie jest świadomy, że np. element nie ma jeszcze event listenera. Może go kliknąć… i nic się nie stanie
    Podsumowując:
    Lepsza diagnostyka błędów - jeśli element nie pojawi się na czas — expect(...).toBeVisible() zwróci jasny komunikat typu: „Element niewidoczny”. Samo click() w przypadku problemów może rzucić ogólny timeout bez jasnego kontekstu
    Wymuszenie kolejności zdarzeń - ręczne/jawne oczekiwanie pozwala dokładniej zsynchronizować interakcje z rzeczywistym stanem UI i odczuciami użytkownika. Użytkownik może postrzegać "gotowość" elementu inaczej niż Playwright technicznie to ocenia
    */
    async gotoContactUsPage(): Promise<ContactUsPage> {
        const contactPageLink = this.page.locator('#menu-item-40');
        await expect(contactPageLink).toBeEnabled(); // świadome ręczne/jawne oczekiwanie
        await expect(contactPageLink).toBeVisible(); // świadome ręczne/jawne oczekiwanie
        await contactPageLink.click(); // gdy już ręcznie obsłużyliśmy dostępność elementu możemy wykonać akcję
        await this.page.waitForResponse((resp) => resp.url().includes('/contact-forms/244')
            && resp.status() === 200); // samo "newPage.waitForResponse('**/contact-forms')" również zadziała, ale Playwright nie ma auto-weryfikacji statusów, a chcemy mieć pewność, że request się wykonał poprawnie 
        await expect(this.page).toHaveURL(/contact-us/); // Upewniamy się, że routing się zakończył i aplikacja przeszła do konkretnego widoku
        return new ContactUsPage(this.page); // nastąpiła akcja zmieniajaca kontekst - tu przejscie do nowej karty, a więc nowa sesja przegladarki. Chcąc zachować kontrolę nad kontekstem powinnyśmy zwrócić nowy obiekt Page
    }

    async validateFacebookLink(context: BrowserContext): Promise<void> {
        const facebookLink = this.page.locator('.nav__menu-wrapper a:has(img[alt="Facebook"])');
        await expect(facebookLink).toBeEnabled();
        await expect(facebookLink).toBeVisible();
        // Promise.all, bo zapewnia minimalne opóźnienie + wygodne przy wielu równoległych oczekiwaniach. Niekiedy chcemy łączyć więcej niż jedną akcję i jeden listener, a taki zapis – równoległy, od początku stosowany - wprowadzi jednolitość/spójność w kodzie 
        const [newPage] = await Promise.all([
            context.waitForEvent('page'),
            facebookLink.click(),
        ]);
        await expect(newPage).toHaveURL('https://www.facebook.com/ntropypl');
    }
}