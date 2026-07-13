# Himani Agrawal — Entry-Level Solutions Engineer Portfolio

![Portfolio preview](https://github.com/user-attachments/assets/789c3b75-9a46-4acd-b66b-38db771bee5d)

An entry-level Solutions Engineer portfolio featuring hands-on integrations, technical demos, architecture decisions, and clearly labeled simulated sales-cycle artifacts. I built these projects through self-directed learning to demonstrate how I approach realistic customer problems, API design, webhooks, security, observability, failure handling, and implementation trade-offs.

My experience comes from hands-on portfolio projects and self-directed learning. This portfolio presents evidence of my technical foundation, communication style, and readiness to learn in an entry-level role without implying customer or revenue outcomes.

[View the live portfolio](https://him-agni.github.io/portfolio/)

## Featured projects

### SaaS Integration Hub

A verified, idempotent commerce-event pipeline that normalizes Stripe and Shopify webhooks, persists them in MongoDB, and independently fans out actions to Slack, email, and HubSpot.

### Release Intelligence Dashboard

A deploy-time decision system that combines GitHub Actions, Sentry, PostHog, and GCP Logging signals into a deterministic health score, recommendation, and durable release snapshot.

### Security Posture Scorecard

A static repository scanner with confidence-aware findings, transparent scoring, OSV dependency checks, and defensive handling of untrusted repository archives.

### Lead & Form Automation Hub

An acknowledge-then-deliver lead pipeline that accepts signed Tally webhooks, persists submissions immediately, and delivers independently to Airtable, Discord, and Google Sheets with retry and partial-failure tracking.

Each detailed project includes:

- A live application and source repository
- Structured engineering notes and architecture diagrams
- Explicit design decisions, alternatives, and trade-offs
- Security, scalability, limitations, and production-evolution sections
- Clearly labeled Solutions Engineering practice artifacts: a mock RFP response, solution brief, and MEDDIC breakdown
- A narrated demo and written transcript where available

## Technology

- React 19 and React Router 7
- Vite 8
- Vanilla CSS
- Lucide and React Icons
- GitHub Pages deployment

The portfolio projects cover additional technologies including Node.js, Express, MongoDB, REST APIs, webhooks, HMAC verification, third-party SaaS integrations, observability platforms, AWS, Docker, and GitHub Actions.

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:5173/portfolio/`.

## Verification

```bash
npm run lint
npm run build
```

## Deployment

```bash
npm run deploy
```

The `predeploy` hook creates the production build, and `gh-pages` publishes `dist/` to the repository's `gh-pages` branch.

## Contact

- Email: [himani.agrawal.us@gmail.com](mailto:himani.agrawal.us@gmail.com)
- LinkedIn: [linkedin.com/in/himani--agrawal](https://www.linkedin.com/in/himani--agrawal/)
- GitHub: [github.com/him-agni](https://github.com/him-agni)
