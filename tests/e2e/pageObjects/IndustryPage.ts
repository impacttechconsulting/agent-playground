import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model for Critical River Industry Page
 * Handles interactions with www.criticalriver.com/industry/
 */
export class IndustryPage {
  readonly page: Page;
  readonly url: string;

  constructor(page: Page) {
    this.page = page;
    this.url = '/industry/';
  }

  /**
   * Navigate to the industry page
   */
  async goto(): Promise<void> {
    await this.page.goto(this.url);
    // Wait for the page to be fully loaded
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Get all links on the page
   * Returns an array of link elements
   */
  async getAllLinks(): Promise<Locator[]> {
    // Find all anchor tags with href attribute
    const links = await this.page.locator('a[href]').all();
    return links;
  }

  /**
   * Get all link URLs on the page
   * Returns an array of URLs as strings
   */
  async getAllLinkUrls(): Promise<string[]> {
    const links = await this.getAllLinks();
    const urls: string[] = [];
    
    for (const link of links) {
      const href = await link.getAttribute('href');
      if (href) {
        urls.push(href);
      }
    }
    
    return urls;
  }

  /**
   * Get link information (URL and text) for all links
   */
  async getLinkDetails(): Promise<Array<{ url: string; text: string; isExternal: boolean }>> {
    const links = await this.getAllLinks();
    const linkDetails: Array<{ url: string; text: string; isExternal: boolean }> = [];
    
    for (const link of links) {
      const href = await link.getAttribute('href');
      const text = await link.innerText().catch(() => '');
      
      if (href) {
        // Determine if link is external
        const isExternal = href.startsWith('http') && !href.includes('criticalriver.com');
        
        linkDetails.push({
          url: href,
          text: text.trim(),
          isExternal,
        });
      }
    }
    
    return linkDetails;
  }

  /**
   * Check if a specific link exists on the page
   */
  async hasLink(url: string): Promise<boolean> {
    const link = this.page.locator(`a[href="${url}"]`);
    return await link.count() > 0;
  }

  /**
   * Verify page title contains expected text
   */
  async verifyTitle(expectedText: string): Promise<void> {
    await expect(this.page).toHaveTitle(new RegExp(expectedText, 'i'));
  }

  /**
   * Get page title
   */
  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Check if page loaded successfully
   */
  async isLoaded(): Promise<boolean> {
    try {
      await this.page.waitForLoadState('domcontentloaded', { timeout: 10000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get all internal links (same domain)
   */
  async getInternalLinks(): Promise<Array<{ url: string; text: string }>> {
    const allLinks = await this.getLinkDetails();
    return allLinks
      .filter(link => !link.isExternal)
      .map(link => ({ url: link.url, text: link.text }));
  }

  /**
   * Get all external links (different domain)
   */
  async getExternalLinks(): Promise<Array<{ url: string; text: string }>> {
    const allLinks = await this.getLinkDetails();
    return allLinks
      .filter(link => link.isExternal)
      .map(link => ({ url: link.url, text: link.text }));
  }

  /**
   * Filter out non-navigable links (anchors, javascript, mailto, tel, etc.)
   */
  filterNavigableLinks(urls: string[]): string[] {
    return urls.filter(url => {
      // Remove anchor links, javascript, mailto, tel, etc.
      return url && 
             !url.startsWith('#') && 
             !url.startsWith('javascript:') && 
             !url.startsWith('mailto:') && 
             !url.startsWith('tel:') &&
             url !== '/' && // Skip root if already there
             url.trim() !== '';
    });
  }

  /**
   * Convert relative URLs to absolute URLs
   */
  async resolveUrl(url: string): Promise<string> {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    const baseUrl = this.page.url();
    const urlObj = new URL(url, baseUrl);
    return urlObj.href;
  }
}
