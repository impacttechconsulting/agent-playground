import { test as base } from '@playwright/test';
import { IndustryPage } from './pageObjects/IndustryPage';

/**
 * Test fixtures for E2E tests
 * Extends the base Playwright test with custom fixtures
 */

type TestFixtures = {
  industryPage: IndustryPage;
};

/**
 * Extended test with custom fixtures
 * Usage: import { test, expect } from './fixtures';
 */
export const test = base.extend<TestFixtures>({
  /**
   * Industry page fixture
   * Automatically initializes the IndustryPage object for each test
   */
  industryPage: async ({ page }, use) => {
    const industryPage = new IndustryPage(page);
    await use(industryPage);
  },
});

export { expect } from '@playwright/test';
