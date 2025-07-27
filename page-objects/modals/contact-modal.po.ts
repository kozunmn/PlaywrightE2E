import { Page } from '@playwright/test';
import { BaseModal } from './base-modal.po';

export class LoginModal extends BaseModal {
    constructor(page: Page) {
        super(page, '.career-form-popup__content');
    }

    // TODO page objects
}
