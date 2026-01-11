# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

- Next.js 14 App Router project bootstrapped with `create-next-app`.
- TypeScript + Tailwind CSS, with source under `src/` and the App Router entry at `src/app`.
- The UI and copy are primarily Korean; most user-facing content is stored in JSON files under `src/data/`.

## Core Commands

All commands assume `npm`. If you prefer `yarn`, `pnpm`, or `bun`, substitute the package manager accordingly.

- **Install dependencies**
  - `npm install`
- **Run development server**
  - `npm run dev`
  - Serves the app at `http://localhost:3000`.
- **Production build**
  - `npm run build`
- **Run production server (after build)**
  - `npm run start`
- **Lint**
  - `npm run lint` (Next.js + ESLint using `.eslintrc.json`).

### Tests

- There is **no test script or test framework configured** in `package.json` (no Jest/Vitest config is present). If you add tests, prefer wiring them through `package.json` scripts and update this file accordingly.

## Architecture and Code Structure

### High-level layout

- `src/app/layout.tsx`
  - Defines the global HTML shell and wraps all pages with a persistent `Header` and `Footer` from `src/components/`.
  - Sets site-wide `Metadata` (title/description/OG) and language (`<html lang="ko">`).
  - Loads local Geist fonts from `src/app/fonts/` and wires them into CSS variables.
- `src/app/page.tsx`
  - Client component that serves as the main entry point.
  - Renders a natural-language search box that matches free-text queries to “situations” defined in `src/data/situations.json`.
  - Uses `keywordMap` (hard-coded map of query-related keywords keyed by `situation.slug`) plus fuzzy matching over titles/subtitles/problem text to compute `matchedSituations`.
  - Provides quick links to key sections: `/situations`, `/quiz`, `/compare`, `/glossary`.

### Data-driven content model

Most pages are thin presentational layers over structured JSON stored in `src/data/`. The JSON shapes are modeled in `src/types/index.ts` and reused across the app.

- **Type definitions** (`src/types/index.ts`)
  - Central place for domain types:
    - `Tool`, `Pricing`, `Guide`, `UseCase`, etc. for AI tools.
    - `GlossaryTerm` for glossary entries.
    - `CompareItem` for comparison rows.
    - Situation-related types: `SituationCategory`, `RecommendedTool`, `Step`, `Prompt`, `Situation`.
  - When changing the JSON schema for tools, situations, glossary, or trends, update these types first, then adjust JSON and components to match.

- **Tools catalog** (`src/data/tools.json`)
  - Single source of truth for all AI tools shown on the site.
  - Each tool entry includes slug, display name, tagline, long description, category, pricing plans, feature list, `bestFor` bullet points, external `url`, color gradient, emoji `icon`, and an optional `guide` with:
    - `gettingStarted` (step list),
    - `proTips`,
    - `useCases` (with example prompts),
    - `limitations`.
  - **Cross-references**: many other JSON files and pages refer to tools **by `slug`**, so slugs must remain stable or be updated consistently everywhere (see “Cross-linked data dependencies” below).

- **Situation guides** (`src/data/situations.json`)
  - Defines categorized situations such as `pdf-summary`, `email-writing`, `code-debug`, etc.
  - Each `Situation` contains:
    - Metadata (slug/title/subtitle/category/icon/problem).
    - `recommendedTools`: array of tool references (`slug`, `name`, `reason`, `isPrimary`). These must reference existing tool slugs in `tools.json`.
    - `steps`: linear how-to steps.
    - `prompts`: ready-to-copy prompt templates with optional `tip`.
    - Outcome fields: `expectedResult`, `timeToComplete`, `difficulty`.

- **Compare data** (`src/data/compare.json`)
  - Table data used to compare ChatGPT, Claude, and Gemini across features.
  - Consumed by `src/app/compare/page.tsx`.

- **Glossary** (`src/data/glossary.json`)
  - List of `GlossaryTerm` entries (term/slug/definition/example) plus `relatedTools` (tool slugs) used to render badges linking to tool detail pages.

- **Trends & news** (`src/data/trends.json`)
  - Contains:
    - `lastUpdated` date string (rendered in UI).
    - `trends`: high-level trend cards, each with keywords and `relatedTools` slugs.
    - `news`: list of recent AI news items, each with date, source, and category.
    - `quickStats`: summary metrics (label/value/trend, plus optional `source`).

### Page-level responsibilities

- `src/app/situations/page.tsx`
  - Client component that lists all situations with:
    - Category filter chips (`situationsData.categories`).
    - Text search across title/subtitle/problem.
  - Displays cards that link to `/situations/[slug]` and surfaces `recommendedTools` and difficulty.

- `src/app/situations/[slug]/page.tsx`
  - Client component that renders the full detail view for a single situation.
  - Reads from both `situations.json` and `tools.json` to:
    - Show primary and alternative tools for the situation (with BEST badge and external links).
    - Render step-by-step instructions and copyable prompts (`navigator.clipboard.writeText`).
    - Show an “expected result” callout and a list of related situations from the same category.
  - Calls `notFound()` if the slug does not exist, yielding a 404.

- `src/app/tools/[slug]/page.tsx`
  - Uses `generateStaticParams()` to statically generate a page per tool based on `tools.json`.
  - Uses `generateMetadata()` to set per-tool `title` and `description` using the same JSON source.
  - Main responsibilities:
    - Render hero card (icon, category badge, free/paid indicator, tagline, primary CTA to `tool.url`).
    - Render sections driven entirely by the `Tool`/`Guide` structure: introduction, getting started, pro tips, use cases, limitations, recommended audiences (`bestFor`), pricing plans, and alternative tools.
  - **Important**: Adding or renaming a tool in `tools.json` automatically affects static params and metadata here; type mismatches will surface at build time.

- `src/app/compare/page.tsx`
  - Server component that joins `compare.json` and `tools.json`.
  - Renders:
    - A 3-column hero row of tool cards for ChatGPT/Claude/Gemini (using `tools.json` for icon/color/tagline).
    - A comparison table built from `comparison.items`.
    - Three “recommended for you” cards summarizing which user profile best fits each tool.

- `src/app/glossary/page.tsx`
  - Client component with local state for search filtering.
  - Filters `GlossaryTerm`s by term or definition and optionally renders related tool chips by resolving `relatedTools` slugs through `tools.json`.

- `src/app/quiz/page.tsx`
  - Client component that implements a multi-step quiz.
  - Core logic lives in `getRecommendations(answers)`:
    - Initializes a score map for all tools from `tools.json`.
    - Adjusts scores based on answers (`purpose`, `budget`, `experience`, `priority`, `environment`) using hard-coded weights keyed by tool slug.
    - Returns the top 3 tools by score.
  - The quiz UI presents one question at a time, tracks progress, and displays the ranked recommendations as links to `/tools/[slug]`.

- `src/app/trends/page.tsx`
  - Client component that uses `trends.json` for:
    - Trend cards with badges and related tool links.
    - News list.
    - Quick stats summary at the top.
  - Cross-links back to `/tools` detail pages and `/glossary`.

### Shared UI components

- `src/components/Header.tsx`
  - Sticky top navigation used in `RootLayout`.
  - Provides links to primary site sections (`/situations`, `/`, `/quiz`, `/compare`, `/glossary`) and a responsive mobile menu.
- `src/components/Footer.tsx`
  - Global footer with quick links to core pages and category-filtered root URLs (e.g. `/?category=chatbot`).
- `src/components/ToolCard.tsx`
  - Compact card view for a `Tool` (icon, category, pricing badge, starting price, key features) linking to `/tools/[slug]`.
  - Uses category label mapping and the `Tool.pricing` structure from `src/types`/`tools.json`.

### Styling and configuration

- **Tailwind CSS**
  - Config in `tailwind.config.ts` with `content` paths limited to `./src/**`. If you add new directories with JSX/TSX/MDX, update this list so Tailwind can tree-shake classes.
  - Colors `background` and `foreground` are mapped to CSS variables for theme consistency.
- **PostCSS**
  - `postcss.config.mjs` wires Tailwind as the sole PostCSS plugin.
- **TypeScript / path aliases**
  - `tsconfig.json` uses `"paths": { "@/*": ["./src/*"] }`.
  - Prefer importing internal modules via `@/components`, `@/data/...`, `@/types` instead of deep relative paths.

## Cross-linked Data Dependencies

Because this app is heavily data-driven, many parts of the site depend on consistent `slug` relationships across multiple JSON files and components. When adding or changing items, be careful to update all of the following where applicable:

- **Tool slugs** (from `src/data/tools.json`):
  - Referenced in:
    - `src/data/situations.json` (`recommendedTools[].slug`).
    - `src/data/glossary.json` (`relatedTools`).
    - `src/data/trends.json` (`trends[].relatedTools`).
    - `src/app/quiz/page.tsx` (`getRecommendations` scoring map keyed by slug).
    - `src/app/compare/page.tsx` (looks up `chatgpt`/`claude`/`gemini` in `tools.json`).
- **Situation slugs**:
  - Used for routing via `/situations/[slug]`.
  - Referenced by `keywordMap` in `src/app/page.tsx` to power smart search; new situations should generally get a corresponding entry in `keywordMap` for good matching.

Keep these relationships in sync to avoid broken links, empty sections, or mismatched UI content.
