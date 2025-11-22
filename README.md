# Agent Playground - E2E Testing

This repository contains end-to-end (E2E) tests using Playwright to validate the Critical River Industry page links.

## 🎯 Overview

The E2E test suite validates that all links on the www.criticalriver.com/industry/ page are working correctly. The tests:

- Navigate to the industry page
- Discover all links on the page
- Validate each link's HTTP response status
- Report any broken or inaccessible links
- Support both local and CI execution
- Integrate with Playwright MCP (Managed Cloud Platform) for cloud-based testing

## 📋 Prerequisites

- Node.js 18 or higher
- npm (comes with Node.js)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

Or if you have a `package-lock.json`:

```bash
npm ci
```

### 2. Install Playwright Browsers

```bash
npx playwright install chromium
```

### 3. Run Tests Locally

```bash
npm run test:e2e
```

**Note**: Tests require internet access to www.criticalriver.com. The tests will validate that all links on the industry page are working correctly. In sandboxed or restricted environments without internet access, tests will fail with `ERR_NAME_NOT_RESOLVED`.

## 📝 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run test:e2e` | Run tests in headless mode |
| `npm run test:e2e:headed` | Run tests with browser UI visible |
| `npm run test:e2e:debug` | Run tests in debug mode with Playwright Inspector |
| `npm run test:e2e:ci` | Run tests in CI mode with HTML and JUnit reports |
| `npm run test:e2e:report` | Open the HTML test report |

## 🔧 Configuration

### Environment Variables

The tests support the following environment variables:

| Variable | Description | Required |
|----------|-------------|----------|
| `BASE_URL` | Base URL for the application (default: https://www.criticalriver.com) | No |
| `PLAYWRIGHT_MCP_API_KEY` | API key for Playwright MCP | No (Yes for MCP) |
| `PLAYWRIGHT_MCP_PROJECT` | MCP project identifier | No (Yes for MCP) |
| `PLAYWRIGHT_MCP_REGION` | MCP region (default: us-west-1) | No |
| `CI` | Set to `true` in CI environments | No |

### Playwright Configuration

The Playwright configuration is defined in `playwright.config.ts`. Key settings:

- **Test Directory**: `tests/e2e`
- **Timeout**: 60 seconds per test
- **Retries**: 2 retries in CI, 0 locally
- **Workers**: 1 worker in CI, parallel locally
- **Browsers**: Chromium (additional browsers can be enabled)
- **Reports**: HTML and JUnit in CI mode

## 🧪 Test Structure

```
tests/e2e/
├── fixtures.ts              # Test fixtures and setup
├── helpers/
│   └── mcp.ts              # MCP integration helpers
├── pageObjects/
│   └── IndustryPage.ts     # Page Object Model for industry page
├── specs/
│   └── industry-links.spec.ts  # Link validation tests
└── test-data/              # Test data files (if needed)
```

### Page Object Pattern

Tests use the Page Object Model (POM) pattern to separate page structure from test logic:

```typescript
// Example usage
import { test, expect } from '../fixtures';

test('validate links', async ({ industryPage }) => {
  await industryPage.goto();
  const links = await industryPage.getAllLinks();
  expect(links.length).toBeGreaterThan(0);
});
```

## ☁️ Running with Playwright MCP

Playwright MCP allows running tests on cloud infrastructure for better reliability and scalability.

### Local Testing with MCP

1. Set up environment variables:

```bash
export PLAYWRIGHT_MCP_API_KEY=your_api_key
export PLAYWRIGHT_MCP_PROJECT=your_project_id
export PLAYWRIGHT_MCP_REGION=us-west-1  # optional
```

2. Run tests:

```bash
npm run test:e2e:ci
```

### CI Testing with MCP

GitHub Actions is configured to run tests with MCP automatically. Required secrets:

1. Go to your repository Settings → Secrets and variables → Actions
2. Add the following secrets:
   - `PLAYWRIGHT_MCP_API_KEY`: Your MCP API key
   - `PLAYWRIGHT_MCP_PROJECT`: Your MCP project identifier
   - `PLAYWRIGHT_MCP_REGION` (optional): MCP region

The workflow will automatically use these secrets when running tests.

## 🔄 CI/CD Integration

### GitHub Actions Workflow

The `.github/workflows/playwright-mcp.yml` workflow:

- Runs on push and pull requests to `main` and `develop` branches
- Installs dependencies and Playwright browsers
- Executes E2E tests with MCP integration
- Generates HTML and JUnit reports
- Uploads test artifacts (reports, screenshots, videos)
- Comments on PRs with test results

### Viewing Test Results

After a workflow run:

1. Go to the Actions tab in your repository
2. Click on the workflow run
3. Scroll to "Artifacts" section
4. Download:
   - `playwright-report`: HTML report with detailed test results
   - `test-results`: JUnit XML results
   - `test-artifacts-failure`: Screenshots and videos (on failure)

## 📊 Test Reports

### HTML Report

View the interactive HTML report:

```bash
npm run test:e2e:report
```

The report includes:
- Test execution timeline
- Pass/fail status for each test
- Screenshots on failure
- Videos of test execution
- Error stack traces

### JUnit Report

JUnit XML reports are generated in `test-results/junit.xml` for CI integration.

## 🐛 Troubleshooting

### Common Issues

#### 1. Browser Not Installed

**Error**: `Executable doesn't exist at /path/to/browser`

**Solution**:
```bash
npx playwright install chromium
```

#### 2. Timeout Errors

**Error**: `Test timeout of 60000ms exceeded`

**Possible causes and solutions**:
- Slow network connection: Increase timeout in `playwright.config.ts`
- Page takes long to load: Check if the site is accessible
- Too many redirects: Verify the URL is correct

#### 3. Link Validation Failures

**Error**: `Found N broken link(s)`

**Investigation steps**:
1. Check the test output for specific broken links
2. Manually verify if the links work in a browser
3. Check if the site structure has changed
4. Review if links require authentication

#### 4. Authentication Issues

If links require authentication:
1. Update the test fixtures to handle login
2. Use API-based authentication for faster tests
3. Store credentials in environment variables

#### 5. Rate Limiting

**Error**: `Too many requests` or `429` status codes

**Solution**:
- Increase delay between requests in test
- Use fewer workers (set `workers: 1` in config)
- Contact site administrator for testing allowance

#### 6. Cross-Origin Issues

**Error**: `Cross-origin request blocked`

**Solution**:
- Verify the page allows cross-origin requests
- Check if additional permissions are needed
- Use the same domain for all navigation

#### 7. Flaky Tests

Tests fail intermittently:

**Solutions**:
- Increase retry count in `playwright.config.ts`
- Add explicit waits: `await page.waitForLoadState('networkidle')`
- Use stable selectors (data-testid attributes)
- Reduce parallelization

### Debugging Tips

1. **Run tests in headed mode** to see what's happening:
   ```bash
   npm run test:e2e:headed
   ```

2. **Use Playwright Inspector** for step-by-step debugging:
   ```bash
   npm run test:e2e:debug
   ```

3. **Check screenshots and videos** in `test-results/` after failed tests

4. **Enable verbose logging**:
   ```bash
   DEBUG=pw:api npm run test:e2e
   ```

5. **Run a single test**:
   ```bash
   npx playwright test industry-links.spec.ts
   ```

## 🔒 Security Notes

- Never commit credentials or API keys to the repository
- Always use environment variables or GitHub Secrets for sensitive data
- Rotate API keys regularly
- Use read-only test accounts when possible

## 📚 Additional Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Test API](https://playwright.dev/docs/api/class-test)
- [Page Object Model Pattern](https://playwright.dev/docs/pom)
- [CI/CD Integration](https://playwright.dev/docs/ci)

## 🤝 Contributing

When adding new tests:

1. Follow the Page Object Model pattern
2. Use descriptive test names
3. Add appropriate assertions
4. Handle edge cases and errors
5. Update this README if needed

## 📄 License

MIT
