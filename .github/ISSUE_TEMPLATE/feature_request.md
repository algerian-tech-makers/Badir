---
name: Feature request
about: Suggest an idea for this project
title: "[TYPE] Short, clear title"
labels: ""
assignees: ""
---

<!-- Types: feat / fix / chore / refactor / docs / test -->
<!-- Example title: [feat] Add participation form to initiative detail page -->

**Is your feature request related to a problem? Please describe.**

A clear and concise description of what the problem is and why this is needed.

**Describe the solution you'd like**

A clear and concise description of what you want to happen.

**Acceptance criteria**

- [ ] ...
- [ ] ...
- [ ] ...

**Affected files and folders**

List the relevant paths from the project structure.

| Area             | Path                   |
| ---------------- | ---------------------- |
| Page             | `app/...`              |
| Component(s)     | `components/pages/...` |
| Server Action(s) | `actions/...`          |
| Service(s)       | `services/...`         |
| Schema(s)        | `schemas/...`          |
| API Route(s)     | `app/api/...`          |
| Types            | `types/...`            |

**Data access**

How should data be accessed? Follow the project data flow: Server Action / API Route -> Service Layer -> Prisma ORM -> PostgreSQL.

- [ ] Via Server Action (`actions/`)
- [ ] Via API Route (`app/api/`)
- [ ] Direct Prisma query inside a Service (`services/`)
- [ ] No DB access needed

> Do not call Prisma directly from components or pages. Always go through the Service layer.

**Reusable components to use**

Do not recreate what already exists. Check all that apply.

- [ ] `FormInput` - typed input with validation and error mapping
- [ ] `AppButton` - consistent button styles with loading states
- [ ] `FilterSelect` - dynamic filtering dropdowns
- [ ] `PostEditor` - TipTap rich text editor
- [ ] `InitiativeCard` - initiative display with status badges
- [ ] `SearchInput` - full-text search field
- [ ] `PaginationControls` - cursor-based pagination UI
- [ ] `Ratings` - star rating display and input
- [ ] `FormFieldCreator` - dynamic form builder
- [ ] Other: \_\_\_

**i18n / RTL**

- [ ] New UI strings must be added in both Arabic and English
- [ ] RTL layout must be verified (Tailwind RTL classes apply)
- [ ] Not applicable

**Branch**

Convention: `type/short-kebab-description` - examples: `feat/participation-form`, `fix/profile-image-upload`

|                 | Branch |
| --------------- | ------ |
| Assigned branch | `____` |
| Base branch     | `main` |

If no branch is assigned, create one from `main` following the convention above before starting work.

**Assignment**

| Field              | Value               |
| ------------------ | ------------------- |
| Assignee           | @\_\_\_             |
| Reviewer           | @\_\_\_             |
| Milestone / Sprint | \_\_\_              |
| Priority           | High / Medium / Low |

**Additional context**

Add any other context, screenshots, Figma links, related issues, or edge cases here.

---

> Before opening a PR: make sure your branch is up to date with `main`, all acceptance criteria are checked, and the code follows the existing folder structure and data flow conventions.
