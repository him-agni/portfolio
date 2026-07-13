export const leadFormAutomationHubNotes = [
  {
    number: '01',
    title: 'The Problem',
    subtitle: `A lead that doesn't reach the CRM is a lead that never existed`,
    paragraphs: [
      `A team runs inbound lead capture through a form (Tally here) and needs every submission to land in several places at once: a structured record in Airtable, a row in a shared Google Sheet, and a real-time alert in the Discord channel the sales team actually watches. The naive way to wire this — a webhook handler that calls each destination in sequence and returns when they're all done — looks fine in a demo and fails quietly in production.`,
      `It fails because the destinations are third-party APIs that go down, rate-limit, and time out independently. When Airtable has a slow minute, a synchronous handler either hangs long enough that the form provider's webhook delivery times out and gives up, or it throws after the first destination fails and the other two never run. Either way a real lead — someone who filled out a form because they wanted to talk to sales — silently doesn't make it. There's no record it was lost, because the thing that was supposed to record it is what failed.`,
      `The subtler failure is partial success. A submission reaches Discord but not Airtable, so the sales team sees the alert, assumes it's captured, and it never enters the CRM. The team doesn't discover the gap until someone asks “whatever happened to that lead from Tuesday?” This project targets both: acknowledge the submission instantly so the form provider never times out, then deliver to every destination independently with retry and backoff, track each destination's outcome separately, and make a lost delivery a visible, recoverable state rather than a silent hole.`,
    ],
  },
  {
    number: '02',
    title: 'Customer Context',
    subtitle: 'Who this is built for',
    paragraphs: [
      `The intended user is a small sales or growth team that captures leads through a hosted form and depends on those leads reaching the tools they already live in — a CRM/database (Airtable), a shared spreadsheet, and a chat channel for real-time follow-up. This is the team that has outgrown “the form emails us” but hasn't built or bought a full marketing-automation platform, and for whom every lead has direct revenue value, so a dropped one is a real cost, not a rounding error.`,
      `What makes the reliability bar high for this profile is that the people relying on the pipeline aren't watching it. Sales sees the Discord alert and moves on; nobody is auditing whether Airtable also got the record. So the system has to be trustworthy without supervision — it can't depend on a human noticing a failure, because the whole point is that a human doesn't have to. The business driver is almost always a specific lost lead: “we followed up late on a warm prospect because it never hit the CRM,” which is exactly the failure mode a synchronous, no-retry webhook handler produces under real-world API flakiness.`,
    ],
  },
  {
    number: '03',
    title: 'Architecture Overview',
    subtitle: 'How a request moves through the system',
    paragraphs: [
      `A Tally webhook hits an Express backend that verifies it, persists the submission immediately, and returns 202 Accepted in milliseconds — before any destination is contacted. Delivery happens in the background: the fan-out service pushes to Airtable, Discord, and Google Sheets in parallel, each wrapped in retry-with-backoff and a hard timeout, and writes each destination's outcome back onto the submission. A React dashboard shows every submission with its per-destination status and a manual retry control.`,
    ],
    diagram: `Tally form submission
        │  webhook (HMAC-signed, raw body)
        ▼
Express backend
  tallyWebhookLimiter → verifyTallySignature (timing-safe) → dedupe by submission ID
        │
        ▼
  persist Submission (overallStatus: processing)  ──►  MongoDB
        │
        ▼
  respond 202 Accepted  ◄── returns here, in ms, before any destination is called
        │
        ▼  (background, non-blocking)
  fanoutService  ── Promise.allSettled over destinations
        ├─ withRetry(withTimeout( airtable )) ─► Airtable
        ├─ withRetry(withTimeout( discord  )) ─► Discord
        └─ withRetry(withTimeout( sheets   )) ─► Google Sheets
        │        each: 3 attempts · exp. backoff 500ms→8s · 15s timeout
        ▼
  persist per-destination result → recompute overallStatus
        │
        ▼
React dashboard  ── GET /events (per-destination status) · POST /events/:id/retry
        │
        └── startup: recoverProcessingSubmissions() re-runs anything stuck`,
    closingParagraphs: [
      `The shape that matters most is the acknowledge-then-deliver split: the webhook response is decoupled from delivery, so the form provider gets a fast 202 regardless of how slow or flaky the destinations are. That decision drives everything about reliability downstream.`,
    ],
  },
  {
    number: '04',
    title: 'Architecture Decisions',
    subtitle: 'What was chosen, and why',
    subsections: [
      {
        title: 'Why the webhook returns 202 before delivery, not 200 after it',
        paragraphs: [
          `Decision. handleTallyWebhook persists the submission, responds 202 Accepted immediately, and then kicks off fanout non-blocking (fanout(...).catch(...) — deliberately not awaited).`,
          `Why. Webhook senders have delivery timeouts and their own retry behavior. If the handler waits for three third-party APIs before responding, a slow destination can push the response past Tally's timeout — at which point Tally considers delivery failed and retries, creating duplicate work for a submission that actually succeeded. Acknowledging first, on the strength of a durable database write, means the sender's contract is satisfied the instant the lead is safely stored, independent of how long delivery takes.`,
          `Alternatives considered. Synchronous fan-out with a 200 after all destinations complete. Rejected — it couples the sender's timeout to the slowest downstream API, which is the exact fragility the project exists to remove.`,
          `Trade-off. The client (and the form provider) gets success before delivery is confirmed, so “accepted” and “delivered” are genuinely different states. This is why the submission carries a processing status and per-destination results — the system has to make the gap between accepted and delivered visible rather than pretend it doesn't exist.`,
        ],
      },
      {
        title: 'Why each destination gets retry with exponential backoff and a hard timeout',
        paragraphs: [
          `Decision. runDestination wraps every destination call in withRetry (3 attempts, delay 500ms → 1s → 2s … capped at 8s) and withTimeout (15s per attempt via Promise.race). The retry util computes min(baseDelay * 2^(attempt-1), maxDelay) and rethrows the last error annotated with the attempt count.`,
          `Why. Third-party API failures are usually transient — a rate-limit window, a brief blip. A single attempt turns a two-second hiccup into a permanently lost lead. Exponential backoff gives a struggling API room to recover instead of hammering it; the timeout ensures a hung connection can't block a destination forever, since withRetry alone would wait indefinitely on a request that never returns.`,
          `Trade-off. Retries mean a destination that isn't idempotent could receive duplicate writes if a request actually succeeded but the response was lost before the timeout fired. That risk is bounded by keying records on the submission ID where the destination allows it, but it's a real tension: retry buys reliability against loss at the cost of a small duplication risk, and the project chose loss-avoidance as the priority for lead data.`,
        ],
      },
      {
        title: 'Why destinations run in parallel and fail independently',
        paragraphs: [
          `Decision. fanout fires all destinations with Promise.allSettled, and runDestination never throws — it captures every failure into a result object. Each destination's outcome (success/failed, attempt count, sanitized error, external record ID) is written to the submission separately, and computeOverallStatus derives success / partial_failure / failed from the set.`,
          `Why. The destinations are independent, so one failing must not prevent or roll back the others. partial_failure as a first-class status is the direct fix for the silent-partial-success problem from Section 1 — the dashboard shows exactly which destinations got the lead and which didn't, so “it's in Discord but not Airtable” is visible instead of assumed.`,
          `Trade-off. A first-class partial state means the UI and the retry logic both have to reason about mixed outcomes rather than a single pass/fail — more surface than a binary status, accepted because the binary was the thing hiding lost leads.`,
        ],
      },
      {
        title: 'Why retry re-runs only the failed destinations, and dedupe/skip protects the successful ones',
        paragraphs: [
          `Decision. Both the automatic fanout (which filters to destinations not already success) and the manual retryFailed (triggered by the dashboard button) operate only on destinations that haven't succeeded. Inbound webhooks are also deduplicated by tallySubmissionId before any work.`,
          `Why. Once Airtable has the record, retrying Discord must not re-send to Airtable and create a duplicate. Scoping retries to failed destinations makes the whole pipeline safely re-runnable — you can hit retry as many times as you like and only the genuinely-missing deliveries are attempted. The submission-ID dedupe handles the sender's own retries at the front door.`,
          `Trade-off. Correctness depends on each destination's success state being recorded accurately; a destination that succeeded but whose result-write failed could be re-attempted. Accepted as low-probability relative to the value of idempotent, repeatable retries.`,
        ],
      },
      {
        title: 'Why signature verification is timing-safe and re-parses the raw body',
        paragraphs: [
          `Decision. verifyTallySignature runs on the raw body (via express.raw()), computes HMAC-SHA256 with the signing secret, compares with crypto.timingSafeEqual after a length check, and only then re-parses the buffer to JSON for downstream handlers.`,
          `Why. The pipeline performs real external writes (CRM records, sales alerts) on the strength of a webhook, so an unverified or forged submission would inject fake leads and spam the sales channel. Timing-safe comparison avoids leaking signature bytes through response timing. Verifying against the raw bytes is mandatory because any re-serialization would change what's hashed.`,
          `Trade-off. In local/dev with no secret set, verification is skipped with a loud warning — a convenience seam that is explicitly blocked in production (a missing secret in production returns 500 rather than silently accepting unsigned traffic).`,
        ],
      },
    ],
  },
  {
    number: '05',
    title: 'Operational Flow',
    subtitle: 'One submission, start to finish',
    subsections: [
      {
        title: '1. The webhook arrives and is rate-limited.',
        paragraphs: [`Tally POSTs to /webhooks/tally. tallyWebhookLimiter caps webhook volume per window before any work happens.`],
      },
      {
        title: '2. The signature is verified.',
        paragraphs: [`verifyTallySignature HMACs the raw body and timing-safe-compares it to the Tally-Signature header. A missing or invalid signature is 401; a valid one is re-parsed to JSON for the handler.`],
      },
      {
        title: '3. The payload is parsed and deduplicated.',
        paragraphs: [`parseTallyPayload flattens Tally's nested field structure into a key→value map. The handler looks up tallySubmissionId; if it already exists (Tally re-delivered), it returns 200 Already processed and stops — no duplicate pipeline run.`],
      },
      {
        title: '4. The submission is persisted as processing.',
        paragraphs: [`A Submission document is created immediately with overallStatus: processing and all three destinations seeded as pending. The lead is now durably stored before any destination is contacted.`],
      },
      {
        title: '5. The webhook is acknowledged.',
        paragraphs: [`The handler responds 202 Accepted with the submission ID. From Tally's perspective the delivery is done — in milliseconds, independent of destination health.`],
      },
      {
        title: '6. Fan-out runs in the background.',
        paragraphs: [`fanout fires Airtable, Discord, and Sheets in parallel. Each runs through runDestination → withRetry (3 attempts, exponential backoff) → withTimeout (15s). Successes capture an external record ID; failures capture a sanitized error message (Discord webhook URLs and Airtable tokens are redacted before storage) and the attempt count. Nothing throws — every outcome becomes a result object.`],
      },
      {
        title: '7. Per-destination outcomes are persisted.',
        paragraphs: [`Each result is written back onto the submission's destinations array, and computeOverallStatus recomputes success / partial_failure / failed. The dashboard, polling GET /events, reflects the final state with per-destination detail.`],
      },
      {
        title: '8. Recovery closes the loop.',
        paragraphs: [`On startup, recoverProcessingSubmissions finds any submission still stuck in processing — e.g. because the server restarted mid-fan-out — and re-runs its delivery. A dashboard Retry button calls retryFailed to re-attempt only the failed destinations on demand.`],
      },
    ],
  },
  {
    number: '06',
    title: 'Security Considerations',
    subtitle: `What's actually implemented`,
    subsections: [
      {
        title: 'Timing-safe webhook signature verification.',
        paragraphs: [`Tally submissions are HMAC-SHA256 verified against the raw body with a constant-time comparison before any record is written or any alert is sent — the trust boundary that stops forged leads and channel spam. A missing secret hard-fails in production rather than accepting unsigned traffic.`],
      },
      {
        title: 'Authenticated dashboard API, also timing-safe.',
        paragraphs: [`requireDashboardAuth gates the dashboard/read/retry endpoints behind a bearer token or API-key header, compared with crypto.timingSafeEqual. As with the webhook secret, a missing key fails closed in production.`],
      },
      {
        title: 'Layered rate limiting by route class.',
        paragraphs: [`Separate limiters for webhook ingest, dashboard reads, and dashboard writes (the write/retry path is the tightest, at 10/min), so the expensive, side-effect-producing retry action is throttled harder than cheap reads.`],
      },
      {
        title: 'Secret redaction before persistence.',
        paragraphs: [`sanitizeErrorMessage strips Discord webhook URLs and Airtable-style tokens out of error strings and truncates them before they're stored on the submission — so a third-party error that echoes a credential back never gets written into the database or shown on the dashboard.`],
      },
      {
        title: 'Input bounds on the simulator.',
        paragraphs: [`The demo/simulate path validates email format and caps field length, so the synthetic-submission surface can't be used to inject oversized or malformed data.`],
      },
      {
        title: 'Honest gaps.',
        paragraphs: [`Dashboard auth is a single shared API key, not per-user identity — fine for a single-team tool, not multi-tenant. Secrets live in environment variables with no secrets manager in front of them. Both are acceptable for this scope and flagged as production work.`],
      },
    ],
  },
  {
    number: '07',
    title: 'Scalability Considerations',
    subtitle: 'Where this would need to change',
    subsections: [
      {
        title: 'Background fan-out runs in-process, not in a durable queue.',
        paragraphs: [`The 202-then-deliver pattern is the right shape, but the background work currently lives in the same process that accepted the webhook. Under a burst of submissions this competes for the same resources, and an in-flight delivery is only as durable as the process. The natural evolution is a real job queue (the recoverProcessingSubmissions sweep is a lightweight stand-in for exactly what a queue's visibility-timeout would provide).`],
      },
      {
        title: 'Recovery is a startup sweep, not continuous.',
        paragraphs: [`Stuck-processing submissions are recovered when the server boots. A submission that gets stuck while the process keeps running isn't re-driven until the next restart. A queue with per-job timeouts, or a periodic sweep, would close that window.`],
      },
      {
        title: 'Retry timing is synchronous within the process.',
        paragraphs: [`Exponential backoff is implemented with in-process sleep, so a destination in its backoff window holds the async task (and its timers) for up to 8s. At low volume this is invisible; at high concurrency, many simultaneous backoffs tie up resources, which a queue with scheduled re-delivery would offload.`],
      },
      {
        title: 'Dashboard reads are polling.',
        paragraphs: [`The dashboard polls GET /events; many concurrent viewers multiply that load. SSE/WebSocket push is the upgrade if real-time, multi-viewer usage becomes real.`],
      },
      {
        title: 'Serverless cold starts on the webhook path.',
        paragraphs: [`As a Vercel deployment, the first webhook after idle pays a cold start, and function timeouts bound background work — another argument for moving delivery to a dedicated worker/queue tier rather than trailing the request.`],
      },
    ],
  },
  {
    number: '08',
    title: 'Current Limitations',
    subtitle: `What this honestly doesn't do yet`,
    subsections: [
      {
        title: 'Delivery durability is process-bound.',
        paragraphs: [`If the process dies mid-fan-out, in-flight deliveries rely on the startup recovery sweep to be re-driven — there's no durable queue guaranteeing exactly-once-ish delivery independent of process lifetime.`],
      },
      {
        title: `Retry isn't perfectly idempotent against non-idempotent destinations.`,
        paragraphs: [`A destination that succeeded but whose response was lost before the 15s timeout could be retried and receive a duplicate. This is mitigated by carrying the submission ID and scoping retries to non-successful destinations, but it isn't eliminated for destinations that don't dedupe on their side.`],
      },
      {
        title: 'Fixed destination set.',
        paragraphs: [`Airtable, Discord, and Sheets are wired in directly. Adding a destination is a code change (a service module plus a fan-out map entry), not configuration — additive, but not dynamic.`],
      },
      {
        title: 'Single-key dashboard auth.',
        paragraphs: [`Access is one shared API key with no per-user identity, roles, or audit of who retried what.`],
      },
      {
        title: 'Field mapping is generic.',
        paragraphs: [`The pipeline forwards flattened form fields to each destination fairly directly; it doesn't yet do per-destination field mapping or transformation beyond attaching the submission ID.`],
      },
    ],
  },
  {
    number: '09',
    title: 'Production Evolution',
    subtitle: 'If this were going to production tomorrow',
    subsections: [
      {
        title: 'Move delivery behind a durable queue.',
        paragraphs: [`The single highest-value change: persist each delivery as a queued job with a visibility timeout and scheduled backoff, so delivery survives process death, retries are offloaded from the request process, and the startup sweep becomes an automatic queue property rather than a manual safety net. The current architecture is already shaped for this — the 202-then-deliver split and the per-destination result model map directly onto a queue.`],
      },
      {
        title: 'Make destinations idempotent by contract.',
        paragraphs: [`Where a destination supports it, upsert on the submission ID so a retried-but-already-succeeded delivery is a no-op, closing the duplicate-write window entirely.`],
      },
      {
        title: 'Configurable, mapped destinations.',
        paragraphs: [`Turn the destination set into configuration with per-destination field mapping, so adding or reshaping a destination doesn't require a code change.`],
      },
      {
        title: 'Per-user auth and an audit trail.',
        paragraphs: [`Replace the shared dashboard key with real user identity and log who retried which submission and when — meaningful the moment more than one person operates the pipeline.`],
      },
      {
        title: 'Observability on delivery health.',
        paragraphs: [`Structured logs keyed by submission ID plus metrics on per-destination success rate and retry counts, so a degrading destination (Airtable failing 20% of the time) is a visible trend, not something inferred from scattered partial_failure states.`],
      },
      {
        title: 'Secrets manager and dead-letter handling.',
        paragraphs: [`Move credentials behind a secrets manager, and route deliveries that exhaust all retries to a dead-letter store with alerting, so a permanently failing lead is escalated rather than left as a failed row someone has to notice.`],
      },
    ],
  },
  {
    number: '10',
    title: 'Lessons Learned',
    subtitle: 'What this actually taught',
    subsections: [
      {
        title: `“Accepted” and “delivered” are different states, and pretending otherwise is how leads get lost.`,
        paragraphs: [`The instinct is to return success when the work is done. But coupling the webhook response to delivery is exactly what makes a slow third-party API cascade into a timed-out sender, a retry, and duplicate work. Separating acknowledgement (durable write → 202) from delivery (background, retried) was the decision that made the pipeline reliable — and it forced an honest data model where processing, partial_failure, and success are genuinely distinct.`],
      },
      {
        title: `Retry without a timeout isn't resilience — it's a new way to hang.`,
        paragraphs: [`Adding withRetry felt like the reliability win, but a retry loop around a request that never returns just waits forever, three times. Pairing every attempt with a Promise.race timeout was what made retry actually safe: a hung destination fails its attempt and either backs off or gives up, instead of silently freezing the whole delivery.`],
      },
      {
        title: 'Idempotency is what makes “just hit retry” safe.',
        paragraphs: [`The retry button is only usable because retries are scoped to non-successful destinations and inbound submissions are deduplicated by ID. Without that, a second retry would re-send to destinations that already succeeded. The lesson that generalized: any operation you expose as “run it again” has to be designed to be safe to run again, or you've built a duplicate-generator with a friendly label.`],
      },
      {
        title: 'Error messages are an exfiltration surface.',
        paragraphs: [`Storing raw third-party error strings on the submission seemed harmless until it became clear those strings can echo back the very webhook URLs and tokens that were sent. Sanitizing and truncating errors before persistence — redacting Discord webhooks and token-shaped strings — turned a convenient debugging field into one that's safe to store and display.`],
      },
      {
        title: 'What would be redesigned.',
        paragraphs: [`The startup recovery sweep is a genuinely good safety net, but it's a stand-in for a durable queue, and building it revealed exactly why: everything it does — find stuck work, re-drive it, scope to what hasn't succeeded — is what a queue's visibility timeout gives for free, continuously rather than only at boot. If rebuilt, delivery would start as queued jobs from day one, and the sweep would be unnecessary rather than load-bearing.`],
      },
    ],
  },
];
