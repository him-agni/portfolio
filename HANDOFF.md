# Project Handoff

Last updated: 2026-07-13

Use this document as the current-state briefing for future work on the portfolio. Update it after any meaningful change: refresh the status and verification results, record important decisions or risks, and replace stale notes instead of building a long activity log.

## Current state

- Branch: `main`, tracking `origin/main`
- Starting baseline commit for the latest change set: `2c89e78` (`Add project demo videos`)
- Production site: <https://him-agni.github.io/portfolio/>
- Repository: <https://github.com/him-agni/portfolio>
- Latest change set: added this handoff document; fixed the hero “View Projects” button so it scrolls to the projects section without conflicting with `HashRouter`; updated the hero labels and roles; expanded the skill ribbon and converted it to an accessible, continuously moving marquee.
- Verification on 2026-07-13:
  - `npm run lint` passes
  - `npm run build` passes with Vite 8.0.8
- No automated test suite or `test` script is currently configured.

## What this project is

Himani Agrawal's single-page developer portfolio. It presents a landing page, project cards, and detailed solution-engineering case studies with demo videos and downloadable sales-cycle artifacts.

The application uses React 19, React Router 7, Vite 8, vanilla CSS, Lucide, and React Icons. It is a frontend-only static site deployed to GitHub Pages.

## Architecture and important files

- `src/main.jsx` mounts the app inside `HashRouter`. Keep hash routing unless the hosting strategy changes; it allows detail routes to work on GitHub Pages without server rewrites.
- `src/App.jsx` defines the landing route and `/projects/:slug` case-study route.
- `src/data/projectsData.js` is the source of truth for all project content, external links, media paths, case-study sections, and artifact metadata.
- `src/components/Projects.jsx` renders the project grid. Entries with a `slug` link to an internal case study; entries without one link directly to their demo/source.
- `src/components/ProjectDetail.jsx` renders the shared case-study template. Unknown slugs redirect home.
- `src/components/*.css`, `src/App.css`, and `src/index.css` contain all styling; there is no CSS framework.
- `src/assets/` contains images imported into the bundle.
- `public/` contains files that must preserve stable public names: the resume, PDFs, videos, icons, and two project thumbnails.
- `vite.config.js` sets `base: '/portfolio/'`, which must match the GitHub Pages repository path.

## Content model

There are six project cards. Four have full case-study routes:

1. SaaS Integration Hub — demo video and three PDFs available.
2. Release Intelligence Dashboard — demo video and three PDFs available.
3. Security Posture Scorecard — three PDFs available; demo video is not set.
4. Lead & Form Automation Hub — three PDFs available; demo video is not set.

GitHub Stats Tracker and Personal Finance Tracker use the simpler external-link card behavior.

To add a full case study, add a unique `slug` and the fields consumed by `ProjectDetail.jsx`: `category`, `verified`, `longDescription`, `demoVideo` if available, `problem`, `solutionIntro`, `solutionSteps`, `capabilities`, `businessOutcome`, and `artifacts`. Put public documents/media in `public/` and build their URLs with `import.meta.env.BASE_URL`.

## Local workflow

```bash
npm install
npm run dev
npm run lint
npm run build
npm run preview
```

Deploy with `npm run deploy`. The `predeploy` hook builds the app, and `gh-pages` publishes `dist/` with dotfiles so `public/.nojekyll` is retained.

## Known follow-ups and risks

- `README.md` says React 18, while `package.json` uses React 19.2.4. Update the README when documentation is next revised.
- Both Security Posture Scorecard and Lead & Form Automation Hub currently point at `client-lime-alpha.vercel.app`; confirm that the Lead project URL is intentional before the next release.
- Security Posture Scorecard uses a remote GitHub attachment as its card image. Move it into `src/assets/` if the portfolio should not depend on that external asset remaining available.
- Only the SaaS Integration Hub and Release Intelligence case studies have demo videos. The other two deliberately render “Demo coming soon.”
- The checked-in videos are large (about 10.5 MB and 25 MB). Consider compression or external video hosting if load time or repository size becomes a problem.
- There are no automated component or browser tests. For UI changes, verify the home page and all four case-study routes manually at desktop and mobile widths in addition to lint/build.

## Handoff checklist

Before ending a future work session:

1. Update the date, baseline commit, current state, and relevant follow-ups in this file.
2. Run `npm run lint` and `npm run build`; record failures if they cannot be resolved.
3. Check `git status --short` and distinguish task changes from pre-existing user changes.
4. If project data changed, open every affected external link and confirm every referenced local asset exists.
5. If routing or layout changed, manually exercise `/`, each affected `#/projects/:slug` route, and a narrow mobile viewport.
