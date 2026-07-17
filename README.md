# Portfolio CRM

[![Lint and test](https://github.com/DoctorDerek/doctorderek-portfolio-crm/actions/workflows/test-and-lint.yml/badge.svg)](https://github.com/DoctorDerek/doctorderek-portfolio-crm/actions/workflows/test-and-lint.yml)
[![Codecov](https://codecov.io/gh/DoctorDerek/doctorderek-portfolio-crm/graph/badge.svg)](https://app.codecov.io/gh/DoctorDerek/doctorderek-portfolio-crm)

A local-first portfolio CRM with accessible CRUD workflows, age filtering, animated theming, and deterministic React state.

[Explore the live demo](https://doctorderek-portfolio-crm.vercel.app/) · [View open issues](https://github.com/DoctorDerek/doctorderek-portfolio-crm/issues)

## Product experience

- Create, update, delete, and reset contacts through focused modal workflows.
- Filter the contact list by age range with consistent last-name sorting.
- Persist contact changes across reloads without an account or remote database.
- Switch between animated light and dark themes from a native, keyboard-operable control.
- Receive accessible toast confirmation after every successful local mutation.
- Use the same responsive interface across phone, tablet, and desktop layouts.

## Architecture

| Concern     | Implementation                                               |
| ----------- | ------------------------------------------------------------ |
| Application | Next.js 16 App Router and React 19                           |
| Language    | TypeScript 6 in strict mode                                  |
| State       | XState 5 and `@xstate/react`                                 |
| Interface   | Tailwind CSS 4, Headless UI 2, and Heroicons 2               |
| Forms       | React Hook Form 7 and Zod 3                                  |
| Feedback    | React Toastify 11                                            |
| Quality     | ESLint 9, Prettier 3, Vitest 4, Testing Library, and Codecov |
| Delivery    | GitHub Actions and Vercel                                    |

The XState machine owns contact lifecycle transitions and browser persistence. React components remain focused on rendering and interaction, while static data, validation, filtering, and transformation logic stay in their domain modules.

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
pnpm test --run
pnpm build
pnpm audit --prod
```

Pull requests run ESLint and Vitest coverage in GitHub Actions, publish coverage to Codecov, and receive a Vercel preview deployment.
