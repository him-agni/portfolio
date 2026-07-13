import saasIntegrationHubImage from '../assets/saas integration hub.png';
import releaseIntelligenceImage from '../assets/release-intelligence.png';
import leadFormAutomationImage from '../assets/lead & form automation.png';
import { saasIntegrationHubNotes } from './saasIntegrationHubNotes';
import { releaseIntelligenceDashboardNotes } from './releaseIntelligenceDashboardNotes';
import { securityPostureScorecardNotes } from './securityPostureScorecardNotes';
import { leadFormAutomationHubNotes } from './leadFormAutomationHubNotes';

const artifactsFor = (fileBaseName) => [
  {
    title: 'Mock RFP Response',
    description: 'Technical Q&A on scoring, reliability, and integration.',
    file: `${import.meta.env.BASE_URL}${fileBaseName}_RFP_Response.pdf`
  },
  {
    title: 'Solution Brief',
    description: 'One-page problem → solution → outcome summary.',
    file: `${import.meta.env.BASE_URL}${fileBaseName}_Solution_Brief.pdf`
  },
  {
    title: 'MEDDIC Breakdown',
    description: 'Deal-framing exercise: buyer, pain, metrics, process.',
    file: `${import.meta.env.BASE_URL}${fileBaseName}_MEDDIC.pdf`
  }
];

export const projectsData = [
  {
    slug: 'saas-integration-hub',
    title: 'SaaS Integration Hub',
    category: 'Project',
    verified: true,
    description: 'A multi-API integration hub designed to connect SaaS workflows, centralize external services, and make operational data easier to manage.',
    longDescription: 'One operational hub that turns scattered commerce events into a single, verified, observable stream — and fans them out to the tools a team already works in.',
    image: saasIntegrationHubImage,
    tags: ['React 18', 'Node.js / Express', 'MongoDB', 'Stripe', 'Shopify', 'Slack', 'HubSpot'],
    demoVideo: `${import.meta.env.BASE_URL}saas-integration-hub.mp4`,
    liveLink: 'https://multi-api-integration-hub-frontend.vercel.app/dashboard',
    repoLink: 'https://github.com/him-agni/MutliAPI_integration_hub',
    engineeringNotes: saasIntegrationHubNotes,
    problem: 'Commerce teams have payment, inventory, and delivery events scattered across Stripe, Shopify, and internal tools, with no single reliable pipeline turning those events into the right downstream action — alerting ops, notifying customers, or updating a CRM record.',
    solutionIntro: 'One verified, idempotent event pipeline that normalizes events from multiple sources and reliably fans them out to Slack, email, and CRM, backed by a live dashboard for visibility and a simulator for safe testing.',
    solutionSteps: [
      'Stripe / Shopify / Simulator',
      'signature verification',
      'event normalization',
      'MongoDB event store',
      'parallel fanout: Slack · Email · HubSpot',
      'React dashboard (polls every 5s)'
    ],
    capabilities: [
      'HMAC-SHA256 signature verification on every inbound webhook',
      'Idempotent processing — duplicate deliveries are ignored, not reprocessed',
      "Independent per-channel fanout, so one vendor outage doesn't block the others",
      'Built-in event simulator for demos and testing without live systems',
      'Searchable, filterable live event log',
      'Full docs and an importable Postman collection for self-serve integration'
    ],
    businessOutcome: 'Fewer missed or duplicate customer notifications, faster onboarding for engineering teams, and one operational view instead of checking multiple vendor dashboards.',
    artifacts: artifactsFor('SaaS_Integration_Hub')
  },
  {
    slug: 'release-intelligence-dashboard',
    title: 'Release Intelligence Dashboard',
    category: 'Project',
    verified: true,
    description: 'A dashboard for tracking release activity, surfacing engineering signals, and turning changelog noise into useful product intelligence.',
    longDescription: 'Turns a deployment event into one release-health decision — pulling GitHub Actions, Sentry, PostHog, and cloud logs into a single verdict instead of five open tabs.',
    image: releaseIntelligenceImage,
    tags: ['React', 'Node.js / Express', 'MongoDB', 'GitHub Actions', 'Sentry', 'PostHog', 'GCP Logging'],
    demoVideo: `${import.meta.env.BASE_URL}release%20intelligence%20.mp4`,
    liveLink: 'https://release-intelligence-dashboard.vercel.app/',
    repoLink: 'https://github.com/him-agni/release-intelligence-dashboard',
    engineeringNotes: releaseIntelligenceDashboardNotes,
    problem: 'After every deployment, engineering teams check GitHub Actions, Sentry, product analytics, and cloud logs in separate tabs to figure out whether the release is actually safe — a slow, manual, and easy-to-skip process.',
    solutionIntro: 'A dashboard that pulls all four signals in parallel right after a deploy and condenses them into one health score and recommendation, so the team gets a single, decision-ready answer instead of four browser tabs.',
    solutionSteps: [
      'GitHub Actions deployment completes',
      'signed webhook',
      'Express API verifies signature',
      'parallel fetch: GitHub Actions · Sentry · PostHog · GCP Logging',
      'health score + recommendation computed',
      'MongoDB snapshot',
      'React dashboard'
    ],
    capabilities: [
      'Parallel aggregation across four monitoring and analytics tools',
      'Graceful degradation — one vendor outage never blocks the full snapshot',
      'Configurable health scoring model with a clear recommendation',
      'Deduplication by CI/CD workflow run ID for reliable, repeatable snapshots',
      'Mock data mode for full evaluation with zero external credentials',
      'Explicit zero-vs-error distinction so a quiet signal is never mistaken for a broken integration'
    ],
    businessOutcome: 'Faster, more confident rollback decisions, less tab-switching for engineers after every release, and one accountable score instead of a subjective gut check on release health.',
    artifacts: artifactsFor('Release_Intelligence_Dashboard')
  },
  {
    slug: 'security-posture-scorecard',
    title: 'Security Posture Scorecard',
    category: 'Project',
    verified: true,
    description: 'A full-stack security scanner that grades public GitHub repositories across frontend, backend, and database layers with transparent confidence levels for every finding.',
    longDescription: "A static repo analyzer that grades a GitHub project's security posture — with a confidence tier on every finding, so the score is trustworthy and doesn't hide a false green.",
    image: 'https://github.com/user-attachments/assets/aaba5cba-d839-45a3-aa1b-efc37e7c5d20',
    tags: ['React', 'Node.js / Express', 'Octokit', 'OSV Database', 'Plugin architecture', 'Vitest', 'Playwright'],
    liveLink: 'https://client-lime-alpha.vercel.app/',
    repoLink: 'https://github.com/him-agni/security-posture-scorecard',
    engineeringNotes: securityPostureScorecardNotes,
    problem: 'Static security scanners generate too much noise, and teams stop trusting the results. Worse, some scanners report false-green passes on unverifiable controls like encryption-at-rest — hiding real risk under a clean-looking scorecard. Developers dismiss findings, and important repos go unpatched because the report looked fine.',
    solutionIntro: 'A confidence-tiered scorecard that labels every finding as "verified," "detected," or "manual" — so teams know exactly what was proven from source, what was heuristically inferred, and what still needs a human to confirm. The result is a scorecard developers actually trust and act on.',
    solutionSteps: [
      'Repo URL → Octokit fetches tarball',
      'single in-memory file tree',
      'registered checks (frontend · backend · database)',
      'severity-weighted scorer (critical 40 · high 25 · medium 15 · low 10)',
      'per-layer + overall grade',
      'temp dir cleaned up (try / finally)'
    ],
    capabilities: [
      'Three-tier confidence labels (verified / detected / manual) on every finding — no false greens',
      'Plugin architecture — each check is a self-contained module, so new checks are additive',
      'Transparent scoring with a "why this score" breakdown, not a black-box grade',
      'OSV database lookup for known-vulnerable dependencies from the lockfile',
      "Not-applicable detection, so a frontend library isn't penalized for missing backend controls",
      'Manual checklist for unverifiable-from-source items (encryption at rest, backups)'
    ],
    businessOutcome: 'Security scores developers trust and act on, no false greens hiding real gaps, and faster remediation prioritization — because the confidence tier tells teams which findings need immediate action vs. human review.',
    artifacts: artifactsFor('Security_Posture_Scorecard')
  },
  {
    slug: 'lead-form-automation-hub',
    title: 'Lead & Form Automation Hub',
    category: 'Project',
    verified: true,
    description: 'An automation-focused lead capture hub built to streamline form submissions, routing, and follow-up workflows for business teams.',
    longDescription: 'A webhook-driven lead pipeline that takes a form submission and reliably fans it out to a CRM, team chat, and spreadsheet log — with per-destination retry so one vendor outage never loses a lead.',
    image: leadFormAutomationImage,
    tags: ['React', 'Node.js / Express', 'MongoDB', 'Tally', 'Airtable', 'Discord', 'Google Sheets'],
    liveLink: 'https://client-lime-alpha.vercel.app',
    repoLink: 'https://github.com/him-agni/lead-form-automation-hub',
    engineeringNotes: leadFormAutomationHubNotes,
    problem: 'Marketing and RevOps teams capture leads through forms but rely on brittle chains — often Zapier or manual copy-paste — to move each lead into their CRM, team chat, and spreadsheet log. When one link in the chain silently fails, hot leads get lost and no one notices until a customer complains.',
    solutionIntro: 'A signed-webhook lead pipeline that verifies Tally submissions, then fans them out in parallel to Airtable, Discord, and Google Sheets — with per-destination retry so one vendor outage never takes the whole flow down, and a live dashboard so every submission is traceable.',
    solutionSteps: [
      'Tally form submission',
      'HMAC-verified webhook',
      'parallel fanout: Airtable · Discord · Google Sheets',
      'per-destination retry with exponential backoff',
      'live React dashboard'
    ],
    capabilities: [
      'Constant-time HMAC-SHA256 signature verification on every Tally webhook',
      "Per-destination retry with exponential backoff, so one channel outage doesn't block the others",
      'Deduplication by Tally submission ID, so webhook retries don\'t create duplicate CRM records',
      'Built-in "Fire Test Submission" flow for demos and testing without a live form or tunnel',
      'Live dashboard with per-destination status and searchable submission history',
      'Full setup and API docs, plus an importable Postman collection for self-serve integration'
    ],
    businessOutcome: 'No lost leads, faster team response to inbound because Discord alerts and CRM records land in real time, and one operational view instead of chasing "did this lead actually come through" across three tools.',
    artifacts: artifactsFor('Lead_Form_Automation_Hub')
  },
  {
    title: 'GitHub Stats Tracker',
    description: 'A dynamic developer dashboard that visualizes GitHub profile statistics. Built with modern UI patterns and seamless API integrations.',
    image: `${import.meta.env.BASE_URL}github-stats.png`,
    tags: ['React', 'JavaScript', 'CSS', 'GitHub API'],
    liveLink: 'https://github-stats-tracker-three.vercel.app/',
    repoLink: 'https://github.com/him-agni/github-stats-tracker'
  },
  {
    title: 'Personal Finance Tracker',
    description: 'A full-stack application to track expenses and manage personal finances. Features a sleek dark-mode glassmorphic UI and intuitive data visualization.',
    image: `${import.meta.env.BASE_URL}finance-tracker.png`,
    tags: ['MERN', 'React', 'MongoDB', 'Express', 'Vite'],
    liveLink: 'https://personal-finance-tracker-tkfm.vercel.app/login',
    repoLink: 'https://github.com/him-agni/personal-finance-tracker'
  }
];
