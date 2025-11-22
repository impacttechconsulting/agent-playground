import { test, expect } from '../fixtures';
import { IndustryPage } from '../pageObjects/IndustryPage';

/**
 * E2E Test Suite: Critical River Industry Page - Link Validation
 * 
 * This test suite validates that all links on the www.criticalriver.com/industry/
 * page are working correctly by checking their HTTP response status.
 */

test.describe('Industry Page - Link Validation', () => {
  
  test.beforeEach(async ({ page }) => {
    // Log test start
    console.log('Starting Industry page link validation test');
  });

  test('should load the industry page successfully', async ({ industryPage }) => {
    // Navigate to the industry page
    await industryPage.goto();
    
    // Verify the page loaded
    const isLoaded = await industryPage.isLoaded();
    expect(isLoaded).toBeTruthy();
    
    // Verify page title contains "Industry" or "Critical River"
    const title = await industryPage.getTitle();
    console.log(`Page title: ${title}`);
    expect(title.length).toBeGreaterThan(0);
  });

  test('should find and list all links on the industry page', async ({ industryPage }) => {
    // Navigate to the industry page
    await industryPage.goto();
    
    // Get all links
    const links = await industryPage.getAllLinks();
    console.log(`Total links found: ${links.length}`);
    
    // Verify we have links on the page
    expect(links.length).toBeGreaterThan(0);
    
    // Get link details
    const linkDetails = await industryPage.getLinkDetails();
    
    // Log link information
    console.log('\n--- Link Details ---');
    linkDetails.forEach((link, index) => {
      console.log(`${index + 1}. ${link.text || '(no text)'} -> ${link.url} ${link.isExternal ? '(external)' : ''}`);
    });
    
    // Get internal and external link counts
    const internalLinks = await industryPage.getInternalLinks();
    const externalLinks = await industryPage.getExternalLinks();
    
    console.log(`\nInternal links: ${internalLinks.length}`);
    console.log(`External links: ${externalLinks.length}`);
  });

  test('should validate all navigable links return successful HTTP status', async ({ industryPage, page }) => {
    // Navigate to the industry page
    await industryPage.goto();
    
    // Get all link URLs
    const allUrls = await industryPage.getAllLinkUrls();
    console.log(`Total links found: ${allUrls.length}`);
    
    // Filter to get only navigable links
    const navigableUrls = industryPage.filterNavigableLinks(allUrls);
    console.log(`Navigable links to check: ${navigableUrls.length}`);
    
    // Resolve relative URLs to absolute
    const resolvedUrls: string[] = [];
    for (const url of navigableUrls) {
      const resolved = await industryPage.resolveUrl(url);
      if (!resolvedUrls.includes(resolved)) {
        resolvedUrls.push(resolved);
      }
    }
    
    console.log(`Unique URLs to validate: ${resolvedUrls.length}\n`);
    
    // Track broken links
    const brokenLinks: Array<{ url: string; error: string }> = [];
    const successfulLinks: string[] = [];
    
    // Check each link
    for (let i = 0; i < resolvedUrls.length; i++) {
      const url = resolvedUrls[i];
      console.log(`[${i + 1}/${resolvedUrls.length}] Checking: ${url}`);
      
      try {
        // Use Playwright's request context to check the link
        const response = await page.request.get(url, {
          timeout: 15000,
          maxRedirects: 5,
          failOnStatusCode: false, // Don't throw on 4xx/5xx
        });
        
        const status = response.status();
        
        if (status >= 200 && status < 400) {
          console.log(`  ✓ Success (${status})`);
          successfulLinks.push(url);
        } else {
          console.log(`  ✗ Failed (${status})`);
          brokenLinks.push({
            url,
            error: `HTTP ${status}`,
          });
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.log(`  ✗ Error: ${errorMessage}`);
        brokenLinks.push({
          url,
          error: errorMessage,
        });
      }
      
      // Small delay to avoid overwhelming the server
      await page.waitForTimeout(100);
    }
    
    // Log summary
    console.log('\n=== Link Validation Summary ===');
    console.log(`Total links checked: ${resolvedUrls.length}`);
    console.log(`Successful: ${successfulLinks.length}`);
    console.log(`Broken: ${brokenLinks.length}`);
    
    if (brokenLinks.length > 0) {
      console.log('\n--- Broken Links ---');
      brokenLinks.forEach((link, index) => {
        console.log(`${index + 1}. ${link.url}`);
        console.log(`   Error: ${link.error}`);
      });
    }
    
    // Assert that all links are working
    expect(brokenLinks.length, 
      `Found ${brokenLinks.length} broken link(s): ${brokenLinks.map(l => l.url).join(', ')}`
    ).toBe(0);
  });

  test('should validate internal links separately', async ({ industryPage, page }) => {
    // Navigate to the industry page
    await industryPage.goto();
    
    // Get only internal links
    const internalLinks = await industryPage.getInternalLinks();
    console.log(`Internal links to validate: ${internalLinks.length}`);
    
    const brokenLinks: Array<{ url: string; text: string; error: string }> = [];
    
    for (let i = 0; i < internalLinks.length; i++) {
      const link = internalLinks[i];
      const resolvedUrl = await industryPage.resolveUrl(link.url);
      
      // Skip duplicates and non-navigable (including potentially dangerous schemes)
      const lowerUrl = resolvedUrl.toLowerCase();
      if (lowerUrl.includes('#') || lowerUrl.startsWith('javascript:') || 
          lowerUrl.startsWith('data:') || lowerUrl.startsWith('vbscript:')) {
        continue;
      }
      
      console.log(`[${i + 1}/${internalLinks.length}] ${link.text || '(no text)'} -> ${resolvedUrl}`);
      
      try {
        const response = await page.request.get(resolvedUrl, {
          timeout: 15000,
          failOnStatusCode: false,
        });
        
        const status = response.status();
        
        if (status < 200 || status >= 400) {
          console.log(`  ✗ Failed (${status})`);
          brokenLinks.push({
            url: resolvedUrl,
            text: link.text,
            error: `HTTP ${status}`,
          });
        } else {
          console.log(`  ✓ Success (${status})`);
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.log(`  ✗ Error: ${errorMessage}`);
        brokenLinks.push({
          url: resolvedUrl,
          text: link.text,
          error: errorMessage,
        });
      }
      
      await page.waitForTimeout(100);
    }
    
    console.log(`\nInternal links validated: ${internalLinks.length}`);
    console.log(`Broken internal links: ${brokenLinks.length}`);
    
    if (brokenLinks.length > 0) {
      console.log('\n--- Broken Internal Links ---');
      brokenLinks.forEach((link, index) => {
        console.log(`${index + 1}. "${link.text}" -> ${link.url}`);
        console.log(`   Error: ${link.error}`);
      });
    }
    
    // For internal links, we might want to be more strict
    expect(brokenLinks.length, 
      `Found ${brokenLinks.length} broken internal link(s)`
    ).toBe(0);
  });
});
