# Contributing to Badir

Thank you for your interest in contributing to **Badir - Community Initiative Platform**!  
Your contributions help improve a platform that empowers volunteers, organizations, and communities to collaborate for social good.

---

## Overview

Badir is a Next.js 15 + TypeScript application backed by Prisma ORM and Supabase.

It follows a modular architecture - each folder in `badir/` serves a clear purpose (see README).

We welcome all types of contributions:

- Bug reports & fixes
- Feature suggestions & improvements
- Refactoring / performance improvements
- Translations or accessibility enhancements
- Tests and documentation

---

## Local setup

1. **Fork & clone**

```bash
git clone https://github.com/<your-username>/Badir.git
cd Badir
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Set up environment**

```bash
cp .env.example .env.local
```

Configure:

- DATABASE_URL (PostgreSQL)
- SUPABASE_URL, SUPABASE_ANON_KEY
- BETTER_AUTH_SECRET
- RESEND_API_KEY, RESEND_FROM_EMAIL

4. **Database**

```bash
npx prisma migrate dev
npx prisma db seed
```

5. **Run**

```bash
pnpm run dev
```

Visit http://localhost:3000

## Branching & workflow

| Type             | Branch prefix | Example                    |
| ---------------- | ------------- | -------------------------- |
| Feature          | `feat/`       | `feat/multi-lang-switcher` |
| Bug fix          | `fix/`        | `fix/profile-validation`   |
| Docs             | `docs/`       | `docs/setup-guide`         |
| Chore / Refactor | `chore/`      | `chore/update-deps`        |

```bash
git checkout -b feat/initiative-rating
```

### Commit messages (Conventional)

```makefile
feat(auth): support PKCE for secure login
fix(api): correct initiative pagination
docs: add contribution guide
```

## Testing & quality checks

Before pushing:

```bash
pnpm run lint
pnpm run build
pnpm run test    # when test suite available
```

### Linting

Badir uses ESLint + Prettier:

```bash
pnpm run lint --fix
```

## Submitting a Pull Request

1. Ensure your branch is up to date with main.
2. Push your branch and open a Pull Request.
3. Fill out the PR template.
4. Include screenshots or videos if UI changes are made (optional).
5. Tag related issues, e.g. Closes #42.
6. Wait for review and address any feedback.

## Development notes

- All UI components live under components/ — follow existing patterns (AppButton, FormInput, etc.)
- Use React Hook Form + Zod for any new form.
- Use Supabase client from lib/supabase.ts for storage operations.
- Use Prisma via the services/ layer — don’t query DB directly from routes.
- Respect RLS (Row Level Security) when testing with Supabase.

## Security & responsible disclosure

If you find a security issue (e.g. auth bypass, data exposure):

- **Do not open a public issue**
- Email: atm.website.test@gmail.com
- Provide steps to reproduce + environment info

We’ll acknowledge within 48 hours and coordinate a fix.

## Localization & accessibility

- Arabic (العربية) is the primary supported languages, and English is the secondary lamguage.
- Add new translations in `/data/i18n/` or `/language` (if you opt in `lingo.dev`. Check TODO.md).
- Follow RTL/LTR best practices when editing layout components.

## Code of Conduct

- Be respectful, collaborative, and inclusive.
- We build Badir for communities — let's embody that spirit when working together.
- Check `CODE_OF_CONDUCT.md`.

## Thank you

Every contribution - big or small - makes a difference.
