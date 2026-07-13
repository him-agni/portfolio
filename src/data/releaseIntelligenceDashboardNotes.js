export const releaseIntelligenceDashboardNotes = [
  {
    number: '01',
    title: 'The Problem',
    subtitle: 'The rollback decision is made with four tabs and a gut feeling',
    paragraphs: [
      `The moment a deployment completes, someone has to answer one question: is this release healthy, or should we roll it back? Today that answer is assembled by hand. The release owner opens GitHub Actions to see if the workflow passed, Sentry to see if new errors appeared, a product-analytics tool to see if users are still succeeding, and cloud logs to check for anything critical — then eyeballs four signals and makes a judgment call.`,
      `The pain isn't any single tool; it's that the correlation is manual, slow, and inconsistent. The decision comes out differently depending on who's on call, how much time they have, and which tab they trust most. A senior engineer who knows the error-rate baseline makes a confident call in two minutes; someone newer either rolls back healthy releases out of caution or ships bad ones because the Sentry spike didn't look alarming out of context. That variance directly drives mean-time-to-rollback, which is the metric that actually matters during a bad deploy.`,
      `The harder version of the problem: even when the call is made well, it produces nothing durable. There's no artifact that says “release X scored 72, here's why, here's the recommendation” that can be dropped into an incident retro or compared against last week's deploy. This system targets that gap — converting a deployment webhook into one scored, explained, persisted release-health decision, automatically, at deploy time.`,
    ],
  },
  {
    number: '02',
    title: 'Customer Context',
    subtitle: 'Who this is built for',
    paragraphs: [
      `The intended user is a team shipping continuously through GitHub Actions that has already adopted observability and product analytics but hasn't unified them at the moment of deploy. Concretely: an engineering team where deploys happen often enough that manual post-deploy triage is a recurring tax, where Sentry (or equivalent) and a product-analytics tool (PostHog here) are already in place, and where someone — a release owner, an on-call engineer, an EM — owns the rollback decision.`,
      `What makes the problem acute for this team is the operational profile: frequent deploys, signals spread across three or four vendors, and a real cost asymmetry between the two wrong answers (shipping a broken release versus rolling back a healthy one). The business driver is usually a specific bad incident — “we shipped a regression on Friday and didn't catch it until Monday because nobody correlated the Sentry spike with the deploy” — rather than an abstract desire for a dashboard. The team wants the correlation done for them, consistently, so the rollback decision stops depending on who happens to be watching.`,
    ],
  },
  {
    number: '03',
    title: 'Architecture Overview',
    subtitle: 'How a request moves through the system',
    paragraphs: [
      `A GitHub Actions workflow_run webhook is the trigger. An Express backend verifies it, fans out to four signal services in parallel, feeds the results into a deterministic health-scoring function, persists a deployment snapshot, and serves it to a React dashboard. A service registry swaps every signal source between mock and live implementations based on DATA_MODE, so the entire pipeline runs with or without third-party credentials.`,
    ],
    diagram: `GitHub Actions deployment completes
        │  workflow_run webhook (signed)
        ▼
Express backend  ── verifyGithubSignature (HMAC, timing-safe)
        │
        ▼
  normalizeWorkflowPayload → deployment context
        │
        ▼
  getServices()  ── DATA_MODE selects mock/* or live/*
        │
        ├─ Promise.allSettled ─┬─► GitHub Actions API  (run/jobs)
        │                      ├─► Sentry API          (new issues, error rate)
        │                      ├─► PostHog API         (activity delta)
        │                      └─► GCP Logging API     (error/critical counts)
        │
        ▼
  calculateHealthScore → getHealthStatus → getRecommendation → buildReleaseSummary
        │
        ▼
  MongoDB snapshot  (or in-memory demo store if DB unavailable)
        │
        ▼
React dashboard  ── GET /api/deployments (timeline + per-deploy detail)`,
    closingParagraphs: [
      `The shape that matters most is the split between collection (four independent, failure-isolated signal fetches) and decision (one pure, deterministic scoring function over whatever signals came back). That split is the subject of the next section.`,
    ],
  },
  {
    number: '04',
    title: 'Architecture Decisions',
    subtitle: 'What was chosen, and why',
    subsections: [
      {
        title: 'Why signals are fetched with Promise.allSettled, not Promise.all',
        paragraphs: [
          `Decision. The webhook controller wraps all four signal fetches so that any individual source can fail without failing the release evaluation. A settleSignal helper converts each fulfilled/rejected result into { value, status }, substituting a documented default (zero issues, unknown conclusion) for a failed source and recording that the source was degraded.`,
          `Why. At deploy time you need an answer now. If Sentry's API is slow or PostHog rate-limits, the correct behavior is a health score computed from the three signals that returned, flagged as degraded — not a 500 that leaves the release owner back in the four-tab world. Promise.all would let one slow vendor veto the entire decision.`,
          `Trade-off. The score must remain meaningful with a missing input, which means the scoring function can't assume every signal is present. Every signal access is null-guarded (sentry?.newIssues, gcpLogs?.criticalCount), and a degraded fetch is visible in the response rather than silently treated as “healthy.”`,
        ],
      },
      {
        title: 'Why the health score is deterministic code, not an LLM judgment',
        paragraphs: [
          `Decision. calculateHealthScore is a pure function: start at 100, subtract fixed penalties for specific conditions (workflow failure −35, a crashed Sentry release −40, a critical GCP log −25, and so on), clamp to 0–100. getHealthStatus and getRecommendation are equally deterministic thresholds.`,
          `Why. A release-health score has to be reproducible and explainable. “Why did this deploy score 65?” must have an exact answer — these penalties, from these signals — not a probabilistic one that could shift between runs. A release owner won't act on a number they can't interrogate, and an incident retro needs the same inputs to produce the same score.`,
          `Alternatives considered. Feeding the raw signals to an LLM and asking for a health verdict. Rejected: non-reproducible, unexplainable line-by-line, and impossible to defend in a retro.`,
          `Trade-off. The penalty weights are hand-tuned constants, not learned or per-team-configurable yet. They encode one opinion of what “healthy” means. That opinion is transparent and easy to change, but it's still an opinion baked into thresholds — flagged in limitations.`,
        ],
      },
      {
        title: 'Why every signal source has a mock and a live implementation behind one registry',
        paragraphs: [
          `Decision. serviceRegistry.getServices() returns either the mock/* or live/* module set based on DATA_MODE. The live services make real authenticated calls (Sentry issues API, GitHub Actions jobs API, PostHog, GCP Logging); the mocks return scenario-shaped data keyed by healthy/watch/incident. The controller code is identical for both.`,
          `Why. This is what let the whole pipeline — scoring, persistence, dashboard, recommendation — get built and demoed before any third-party account existed, and what makes a demo deterministic on demand (pick the incident scenario, get a predictable red release). It also means going live is a config flip plus credentials, not a rewrite, because the live modules already implement the same interface.`,
          `Trade-off. Two implementations of every signal must be kept shape-compatible. The live Sentry adapter has to return the same { newIssues, errorRate, releaseHealth } shape the mock does, or the scoring function silently mis-scores. This is a real maintenance cost and the most likely place for a live/mock drift bug.`,
        ],
      },
      {
        title: 'Why persistence degrades to an in-memory store instead of hard-failing',
        paragraphs: [
          `Decision. Controllers check Deployment.db.readyState; if MongoDB isn't connected, reads and writes fall back to an in-memory demo store rather than erroring.`,
          `Why. A portfolio demo that shows a blank screen because a database env var wasn't set is worse than one that runs on seeded in-memory data. The fallback keeps the product demonstrable in the widest range of environments.`,
          `Trade-off. Two persistence paths mean two code paths that must return the same deployment shape — the same class of live/mock drift risk as the signal services, in a different place.`,
        ],
      },
      {
        title: 'Why GitHub webhook signatures are verified with a timing-safe comparison',
        paragraphs: [
          `Decision. verifyGithubSignature computes the HMAC-SHA256 of the raw body with the shared secret and compares against the x-hub-signature-256 header using crypto.timingSafeEqual, after a length check. Verification is skipped only in explicit mock mode.`,
          `Why. A release decision — including a rollback recommendation — triggered by a spoofed deploy event would be actively harmful. Timing-safe comparison prevents leaking signature bytes through response-time analysis, which a plain === would.`,
          `Trade-off. Requires the raw body to be preserved for hashing, which (as in any webhook system) adds body-handling plumbing; skipping verification in mock mode is a convenience seam that must never be the production default.`,
        ],
      },
    ],
  },
  {
    number: '05',
    title: 'Operational Flow',
    subtitle: 'One deployment, start to finish',
    subsections: [
      {
        title: '1. The workflow completes and GitHub POSTs the webhook.',
        paragraphs: [`The workflow_run payload hits the webhook route. If the run status isn't completed, the controller returns 202 and waits — only completed runs get scored, so in-progress events don't produce premature snapshots.`],
      },
      {
        title: '2. The signature is verified.',
        paragraphs: [`In live mode, verifyGithubSignature HMACs the raw body and timing-safe-compares it to the header; a mismatch is 401 and nothing downstream runs.`],
      },
      {
        title: '3. The payload is normalized.',
        paragraphs: [`normalizeWorkflowPayload extracts a stable deployment context — deployment ID, repository, branch, commit, actor, deploy timestamp, and computed workflow duration — from GitHub's verbose payload, with sensible fallbacks for a manually-triggered simulation.`],
      },
      {
        title: '4. Signals are fetched in parallel.',
        paragraphs: [`getServices() resolves the mock or live module set. All four signal fetches run concurrently under settle-semantics: GitHub Actions (real run conclusion and failed-job count via the jobs API), Sentry (new unresolved issues in the post-deploy time window), PostHog (activity delta), GCP Logging (error/critical counts). Any source that fails contributes its documented default and is marked degraded.`],
      },
      {
        title: '5. The decision is computed.',
        paragraphs: [`calculateHealthScore applies fixed penalties over the collected signals and clamps to 0–100. getHealthStatus maps that to green/amber/red, getRecommendation maps signals+score to ship confidently / monitor / investigate / rollback candidate, and buildReleaseSummary renders a human sentence naming the specific reasons (“Release is red due to 14 new Sentry issues, 2 critical log events”).`],
      },
      {
        title: '6. The snapshot is persisted and served.',
        paragraphs: [`The full deployment snapshot is written to MongoDB (or the in-memory store if the DB is down). The React dashboard reads GET /api/deployments for the timeline and opens any deployment to see its score, status, recommendation, summary, and the underlying signals — including which sources were degraded during collection.`],
      },
    ],
  },
  {
    number: '06',
    title: 'Security Considerations',
    subtitle: `What's actually implemented`,
    subsections: [
      {
        title: 'Webhook signature verification.',
        paragraphs: [`GitHub workflow_run webhooks are HMAC-SHA256 verified against the raw body with a timing-safe comparison before any evaluation runs. This is the trust boundary that stops a forged deploy event from producing a rollback recommendation.`],
      },
      {
        title: 'Credentials via environment, per-service.',
        paragraphs: [`Each live signal service reads its own scoped credentials from environment variables (GITHUB_TOKEN, SENTRY_AUTH_TOKEN + org/project slugs, PostHog and GCP credentials) and throws a clear error if they're missing rather than failing silently — so a misconfigured source degrades loudly, not into fake-healthy data.`],
      },
      {
        title: 'Production guardrail on destructive actions.',
        paragraphs: [`The deployment-reset endpoint refuses to run in production unless an explicit ALLOW_DEPLOYMENT_RESET=true flag is set — the demo-convenience “reset” can't be triggered against a real deployment history by accident.`],
      },
      {
        title: 'Read-only outbound scope.',
        paragraphs: [`The live services only read from GitHub, Sentry, PostHog, and GCP. The system never writes back to those platforms, which bounds the blast radius of a leaked token to read access on already-observable data.`],
      },
      {
        title: 'Honest gaps.',
        paragraphs: [`There is no end-user authentication on the dashboard or the deployments API — snapshots are readable by anyone who reaches the endpoint. There's no secrets manager in front of the environment variables. Both are acceptable for a portfolio demo and real gaps for a multi-team production deployment.`],
      },
    ],
  },
  {
    number: '07',
    title: 'Scalability Considerations',
    subtitle: 'Where this would need to change',
    subsections: [
      {
        title: 'Signal fetches are bounded by the slowest vendor.',
        paragraphs: [`Parallelism helps, but the request still waits for the slowest of four external APIs. Under many rapid deploys, per-source timeouts and a short circuit-breaker would keep one degraded vendor from stretching every evaluation — the settle-semantics already tolerate failure, but not yet slowness with an explicit deadline.`],
      },
      {
        title: 'The evaluation runs inline on the webhook request.',
        paragraphs: [`For a team deploying dozens of times a day this is fine; for an org-wide rollout it should move behind a queue so GitHub's webhook delivery gets a fast 202 and the scoring happens asynchronously.`],
      },
      {
        title: 'Serverless cold starts on the webhook path.',
        paragraphs: [`Running as Vercel functions means the first webhook after idle pays a cold start, and each function has a timeout ceiling that bounds how long the four-way fetch can take. A warm, queue-backed worker removes both constraints.`],
      },
      {
        title: 'Live/mock parity is a manual contract.',
        paragraphs: [`Every new signal or field has to be implemented twice and kept shape-identical. At more sources this wants a shared schema (or type contract) that both implementations are validated against, rather than parity maintained by discipline.`],
      },
      {
        title: 'Snapshot growth.',
        paragraphs: [`Deployments accumulate forever; a busy repo needs indexing on deployedAt (already the sort key) plus retention/archival before the collection is large.`],
      },
    ],
  },
  {
    number: '08',
    title: 'Current Limitations',
    subtitle: `What this honestly doesn't do yet`,
    subsections: [
      {
        title: 'Live mode is credential-gated and less battle-tested than mock mode.',
        paragraphs: [`The live service layer is fully implemented — real Sentry, PostHog, GitHub Actions, and GCP adapters exist — but the default demo runs on mock scenarios, so the live path has had far less real-world exercise than the mock path. The most likely bug class is a live adapter returning a slightly different shape than its mock twin.`],
      },
      {
        title: 'Scoring weights are fixed and opinionated.',
        paragraphs: [`The penalty constants encode one definition of “healthy.” There's no per-team configuration or tuning UI yet, so a team whose baseline error rate differs from the built-in thresholds would need to edit the code.`],
      },
      {
        title: 'The time window is a fixed one-hour look-back.',
        paragraphs: [`Signal queries use a fixed window around the deploy timestamp. A slow-burn regression that only shows up hours later wouldn't be captured by the deploy-time snapshot.`],
      },
      {
        title: 'No authentication.',
        paragraphs: [`As in the security section, the dashboard and API are open to anyone who reaches them. Single-operator by design; not multi-tenant.`],
      },
      {
        title: 'GCP Logging is the heaviest integration to stand up.',
        paragraphs: [`Of the four live sources, GCP requires the most credential setup, so a “real” deployment often runs the other three live and GCP mocked — a pragmatic partial-live state rather than all-four-live.`],
      },
    ],
  },
  {
    number: '09',
    title: 'Production Evolution',
    subtitle: 'If this were going to production tomorrow',
    subsections: [
      {
        title: 'Harden the live path to parity with mock.',
        paragraphs: [`Add contract tests that assert each live adapter returns exactly the shape its mock twin does, so live/mock drift is caught in CI rather than in a mis-scored real release. This is the single most valuable pre-production step given the code already has both paths.`],
      },
      {
        title: 'Queue the evaluation.',
        paragraphs: [`Acknowledge the webhook fast, run the four-way fetch and scoring in a worker with per-source timeouts and a circuit breaker, so a slow vendor never stretches a deploy-time decision.`],
      },
      {
        title: 'Make the scoring model configurable.',
        paragraphs: [`Move the penalty weights and thresholds into per-team config so “healthy” reflects each team's actual baselines, and expose the “why this score” breakdown the scoring function already computes.`],
      },
      {
        title: 'Add auth and multi-tenancy.',
        paragraphs: [`A users/teams model with route-level authorization before any deployment snapshot is returned, replacing the current open-endpoint assumption.`],
      },
      {
        title: 'Observability on the observer.',
        paragraphs: [`Structured logs keyed by deployment ID, plus a metric for per-source fetch success rate, so the team can see which signal sources are actually degrading over time — the system currently reports degradation per-request but doesn't trend it.`],
      },
      {
        title: 'Widen and make the time window adaptive.',
        paragraphs: [`Support a longer or re-evaluated window so slow-burn regressions that surface after the initial snapshot still get caught.`],
      },
    ],
  },
  {
    number: '10',
    title: 'Lessons Learned',
    subtitle: 'What this actually taught',
    subsections: [
      {
        title: 'Graceful degradation has to be designed into the scorer, not just the fetcher.',
        paragraphs: [`Wrapping fetches in allSettled is the easy half. The half that actually makes degradation work is that every downstream consumer — the scoring function, the summary builder — null-guards every signal and treats “absent” as a real, expected state. Fault tolerance at the fetch boundary is worthless if the code that reads the results assumes they're all present.`],
      },
      {
        title: 'A mock/live seam is a gift and a liability at the same time.',
        paragraphs: [`Building mock-first let the entire product exist before any account did, and gives a deterministic demo on demand — a real asset in an interview. But it also created a standing obligation: two implementations of every signal that must stay shape-identical, and the most likely place for a subtle bug is exactly where the two diverge. The seam that made development fast is the seam that needs contract tests before production.`],
      },
      {
        title: 'Determinism is a feature you have to protect, not just declare.',
        paragraphs: [`Choosing a pure scoring function over an LLM verdict was the easy decision. Keeping it deterministic in practice means resisting every future temptation to “just ask the model to summarize the signals” in a way that feeds back into the score — the human-readable summary is generated, but it reads the already-computed decision and never influences it. Keeping generation strictly downstream of the deterministic core is the discipline that makes the score defensible.`],
      },
      {
        title: 'What would be redesigned.',
        paragraphs: [`The dual persistence paths (MongoDB and in-memory) and the dual signal paths (live and mock) are the same pattern — one interface, two implementations kept in sync by hand — and both are quiet drift risks. If rebuilt, both would sit behind an explicit shared schema validated at the boundary, so a shape mismatch fails loudly at the seam instead of surfacing as a wrong score three steps downstream.`],
      },
    ],
  },
];
