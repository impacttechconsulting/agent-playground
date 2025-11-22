import { test, expect } from '@playwright/test';

/**
 * Example Test Suite
 * This is a simple example test to demonstrate the test infrastructure is working
 */

test.describe('Example - Test Infrastructure Validation', () => {
  
  test('should demonstrate link counting and extraction', async ({ page }) => {
    // Create a test page with various link types
    const html = `
      <html>
        <body>
          <h1>Test Links</h1>
          <a href="http://example.com">External Link</a>
          <a href="/internal">Internal Link</a>
          <a href="#anchor">Anchor Link</a>
          <a href="javascript:void(0)">JavaScript Link</a>
          <a href="mailto:test@example.com">Email Link</a>
        </body>
      </html>
    `;
    
    await page.goto(`data:text/html,${encodeURIComponent(html)}`);
    
    // Count all links
    const allLinks = await page.locator('a').all();
    expect(allLinks.length).toBe(5);
    
    // Get link details
    for (const link of allLinks) {
      const href = await link.getAttribute('href');
      const text = await link.innerText();
      console.log(`  Link: "${text}" -> ${href}`);
    }
    
    console.log('✓ Link counting and extraction working correctly');
  });
});
