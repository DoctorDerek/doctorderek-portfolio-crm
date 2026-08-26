# Portfolio CRM

[![Production](https://img.shields.io/website?url=https%3A%2F%2Fportfolio-crm.doctorderek.com%2F&up_message=live&down_message=offline&label=production&logo=vercel&logoColor=white)](https://portfolio-crm.doctorderek.com/)
[![Codecov](https://codecov.io/gh/DoctorDerek/doctorderek-portfolio-crm/graph/badge.svg)](https://app.codecov.io/gh/DoctorDerek/doctorderek-portfolio-crm)
[![Lint and test](https://github.com/DoctorDerek/doctorderek-portfolio-crm/actions/workflows/test-and-lint.yml/badge.svg)](https://github.com/DoctorDerek/doctorderek-portfolio-crm/actions/workflows/test-and-lint.yml)
[![Playwright](https://github.com/DoctorDerek/doctorderek-portfolio-crm/actions/workflows/playwright.yml/badge.svg)](https://github.com/DoctorDerek/doctorderek-portfolio-crm/actions/workflows/playwright.yml)

A local-first portfolio CRM with accessible CRUD workflows, age and favorites filtering, theme switching, and deterministic React state.

[Explore the live demo](https://portfolio-crm.doctorderek.com/) · [View open issues](https://github.com/DoctorDerek/doctorderek-portfolio-crm/issues)

## Product experience

- Create, update, delete, and reset contacts through focused modal workflows.
- Compose free-text search, age ranges, and favorites-only filtering with consistent last-name sorting.
- Mark favorite contacts and retain that preference across edits and reloads.
- Persist contact changes across reloads without an account or remote database.
- Switch between light and dark themes with a keyboard-operable control.
- Respect browser and operating-system reduced-motion settings for animations.
- Receive accessible toast feedback after successful mutations or browser-storage failures.
- Use the same responsive interface across phone, tablet, and desktop layouts.

## Architecture

| Concern     | Implementation                                            |
| ----------- | --------------------------------------------------------- |
| Application | Next.js 16 App Router and React 19                        |
| Language    | TypeScript 6 in strict mode                               |
| State       | XState 5 and `@xstate/react`                              |
| Interface   | Tailwind CSS 4, Headless UI 2, Motion 12, and Heroicons 2 |
| Forms       | React Hook Form 7 and Zod 4                               |
| Feedback    | React Toastify 11                                         |
| Quality     | ESLint 9, Prettier 3, Vitest 4, Playwright, and Codecov   |
| Delivery    | GitHub Actions and Vercel                                 |

The XState machine owns contact lifecycle transitions and browser persistence. React components remain focused on rendering and interaction, while static data, validation, filtering, and transformation logic stay in their domain modules.

## Mobile Web Lighthouse Measurements

Latest successful automated Lighthouse scores for the canonical production website, measured with Lighthouse’s standard mobile emulation against [portfolio-crm.doctorderek.com](https://portfolio-crm.doctorderek.com/). The badges and linked HTML report come from the audit with the median performance score among five production runs.

[![Mobile Web Lighthouse Performance](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fdoctorderek.github.io%2Fdoctorderek-portfolio-crm%2Flighthouse-results.json&query=%24.performance&label=performance&suffix=%2F100&logo=lighthouse&logoColor=white&color=informational)](https://doctorderek.github.io/doctorderek-portfolio-crm/) [![Mobile Web Lighthouse Accessibility](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fdoctorderek.github.io%2Fdoctorderek-portfolio-crm%2Flighthouse-results.json&query=%24.accessibility&label=accessibility&suffix=%2F100&logo=lighthouse&logoColor=white&color=informational)](https://doctorderek.github.io/doctorderek-portfolio-crm/) [![Mobile Web Lighthouse Best Practices](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fdoctorderek.github.io%2Fdoctorderek-portfolio-crm%2Flighthouse-results.json&query=%24.bestPractices&label=best%20practices&suffix=%2F100&logo=lighthouse&logoColor=white&color=informational)](https://doctorderek.github.io/doctorderek-portfolio-crm/) [![Mobile Web Lighthouse SEO](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fdoctorderek.github.io%2Fdoctorderek-portfolio-crm%2Flighthouse-results.json&query=%24.seo&label=SEO&suffix=%2F100&logo=lighthouse&logoColor=white&color=informational)](https://doctorderek.github.io/doctorderek-portfolio-crm/)

## Local-first data

Contact records are stored only in browser `localStorage`. The application does not require sign-in and does not send contact data to an application server. Clearing site data removes local edits; Reset restores the bundled demonstration contacts.

Bundled contact details are illustrative. Local image assets are sourced from Unsplash and retained under the applicable permissions described in [LICENSE.txt](LICENSE.txt).

## Local development

The repository uses Node 24 through [fnm](https://github.com/Schniz/fnm) and pnpm 11 through Corepack.

```bash
fnm use
corepack enable pnpm
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) after the development server starts.

## Quality gates

```bash
pnpm format
pnpm lint
pnpm test --run --coverage
pnpm test:e2e
pnpm build
pnpm audit --prod
```

Pull requests run ESLint, Vitest coverage, and Playwright E2E checks in GitHub Actions, publish coverage to Codecov, and receive a Vercel preview deployment.
