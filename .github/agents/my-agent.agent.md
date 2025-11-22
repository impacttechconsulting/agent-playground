---
# Fill in the fields below to create a basic custom agent for your repository.
# The Copilot CLI can be used for local testing: https://gh.io/customagents/cli
# To make this agent available, merge this file into the default repository branch.
# For format details, see: https://gh.io/customagents/config

name: playwright-automation-tester-agent
description: This agent is created to replace Senthil Raj
---

# playwright-automation-tester-agent

Problem Title:
Add Playwright MCP end-to-end test suite and CI

Repository:
impacttechconsulting/agent-playground

Base branch:
main  # replace if another base branch should be used

Problem Statement:
Implement a complete Playwright end-to-end (E2E) testing solution that integrates with Playwright MCP (Managed Cloud Platform) and runs in CI. The agent should add all necessary configuration, example tests, helpers, and a GitHub Actions workflow so that E2E tests can run locally and in CI using Playwright MCP.

Scope and goals:
- Add Playwright as a dev dependency and configure TypeScript-based tests.
- Create a playwright.config.ts configured to run tests on Playwright MCP (include MCP-specific configuration hooks, environment variables, and reporters).
- Provide a minimal but representative set of E2E tests (in TypeScript) that cover critical user flows (e.g., login, create item / add to cart, and a basic happy-path checkout) using Page Object pattern and fixtures.
- Add test utilities (test fixtures, page objects, environment config loader) and example test data.
- Add a GitHub Actions workflow that runs E2E tests on Playwright MCP, reports results (HTML and JUnit), uploads artifacts on failure, and respects secrets/credentials.
- Provide clear README/test docs explaining how to run tests locally against MCP and locally without MCP (if possible), and how to configure secrets in GitHub.
- Ensure tests are reliable (retries, timeouts, stable selectors) and include flake-handling strategy (retries, idempotent cleanup).
- Create a new branch and open a pull request with all changes.

Assumptions / environment:
- The repository is a Node.js app using GitHub (use Node 18+).
- The project uses TypeScript or is comfortable with TypeScript for Playwright tests.
- Playwright MCP requires API key and project identifiers; these will be provided via GitHub Secrets (names: PLAYWRIGHT_MCP_API_KEY, PLAYWRIGHT_MCP_PROJECT, PLAYWRIGHT_MCP_REGION). If different names are required, add guidance in README.
- If the repo's UI uses auth, the agent should add a test user fixture and document how to create/configure the account. Do not hardcode real secrets.

Deliverables (files/directories to add or update):
- playwright.config.ts
- tests/e2e/fixtures.ts
- tests/e2e/pageObjects/*.ts (e.g., LoginPage.ts, ProductPage.ts, CheckoutPage.ts)
- tests/e2e/specs/login.spec.ts
- tests/e2e/specs/cart-and-checkout.spec.ts
- package.json (devDependencies + scripts: test:e2e, test:e2e:ci)
- .github/workflows/playwright-mcp.yml (CI workflow configured to use MCP)
- tests/e2e/test-data/*.json (example test data)
- tests/e2e/helpers/mcp.ts (MCP helper to initialize MCP session if required)
- README.md additions: "E2E Testing with Playwright MCP" section with instructions to run locally and in CI, list of required secrets, troubleshooting tips
- Optional: .github/actions or scripts to collect artifacts, if needed

Acceptance criteria (measurable):
1. The repository builds and installs dependencies with npm ci (or yarn) and the test:e2e script runs Playwright tests locally (document differences when running against MCP).
2. The Playwright config uses TypeScript, sets sensible global timeout, per-test timeout, and retry policy (e.g., retries: 2 in CI).
3. The sample tests run successfully against a deployed test instance (or local dev server if possible) — at least login & checkout happy path are implemented and pass using stable selectors.
4. The GitHub Actions workflow triggers on PR and push to the branch and runs tests in Playwright MCP using the provided secrets; workflow uploads the HTML report and JUnit results as artifacts and fails when tests fail.
5. The tests are organized with page objects and fixtures; code is linted (if project has linting) and TypeScript types are valid.
6. Provide a short PR description explaining changes and how to run and configure tests.

Implementation tasks (step-by-step):
1. Add Playwright dependency (playwright/test) and TypeScript types to package.json devDependencies, add scripts:
   - "test:e2e": "npx playwright test"
   - "test:e2e:ci": "npx playwright test --reporter=html,junit --workers=1" (example)
2. Add playwright.config.ts with:
   - Use testDir: 'tests/e2e'
   - Timeout settings
   - Retry policy set to 0 locally, configurable via env for CI
   - Projects for chromium/firefox/webkit or rely on MCP project config
   - Reporter: html and junit
   - MCP integration hooks / use environment to enable MCP: read process.env.PLAYWRIGHT_MCP_API_KEY and other MCP envs, and configure the MCP provider or service (include example config and fallback to local)
3. Create a fixtures.ts to provide baseURL, test accounts, login helpers, and an authenticated fixture using API if possible (faster than UI login), with clear comments on replacing with actual app endpoints.
4. Implement Page Objects for common pages: LoginPage, ProductPage, CartPage, CheckoutPage. Use data-testids or robust selectors; include guidance how to update selectors.
5. Write specs:
   - login.spec.ts: verify login success and some basic assertion
   - cart-and-checkout.spec.ts: add product to cart, proceed to checkout, submit (mock or test endpoint), assert success page or order id
   - Keep tests deterministic; mock external network calls where appropriate or use test environment.
6. Add .github/workflows/playwright-mcp.yml:
   - Node setup, checkout
   - Install dependencies
   - If the app needs to run, start app service (or use existing staging URL via env)
   - Configure secrets for MCP and inject as env
   - Run test:e2e:ci
   - Persist artifacts on failure (HTML report, screenshots, traces)
   - Set retry on workflow or job as needed
7. Add README section with:
   - How to run locally: npm ci, env vars, npm run test:e2e
   - How to run with MCP: set PLAYWRIGHT_MCP_API_KEY, etc., examples
   - How to configure GitHub Secrets names and values
   - How to inspect artifacts (HTML report, screenshots)
8. Ensure the agent creates a new branch name like chore/e2e-playwright-mcp and opens a PR with title from Problem Title, and clear PR description listing checklist and how to test changes. Add reviewers if repo defines CODEOWNERS (optional).

Notes and constraints for the coding agent:
- Ask for clarification if "Playwright MCP" requires any specific npm package or private SDK; otherwise use Playwright's standard configuration and add a helper mcp.ts to adapt to MCP (the agent should document any assumptions).
- Do not commit real credentials. Use env variables and GitHub Secrets only.
- If the repository already has Playwright config or E2E tests, the agent should update/integrate with existing setup (do not duplicate).
- If the app under test requires backend fixtures or test data setup endpoints, add scripts or documented manual steps to prepare test data and include them in CI or explain how to run them.

PR metadata:
- Title: Add Playwright MCP E2E tests and CI
- Description: Summarize what was added (config, tests, CI), how to run locally and in CI, required secrets, and acceptance checklist.

Extra deliverable (optional):
- A small troubleshooting guide in README for common failures (timeouts, authentication, cross-origin, flaky selectors).

Please proceed to create a branch named chore/e2e-playwright-mcp, implement the above, run tests where possible, and open a pull request implementing the changes. If any required repository-specific details are missing (test URLs, test account credentials, MCP SDK requirements), ask me for them before making irreversible changes.
