export const saasIntegrationHubNotes = [
  {
    number: '01',
    title: 'The Problem',
    subtitle: 'Commerce events arrive from everywhere, and the glue code is the liability',
    paragraphs: [
      `A growing commerce operation runs payments through Stripe, storefront and inventory through Shopify, and post-purchase updates through a carrier. Each of these fires webhooks, and the default way teams handle them is one bespoke integration at a time: a Stripe handler here, a Shopify handler there, each with its own verification logic, its own retry assumptions, and its own copy-pasted path to Slack, email, and the CRM.`,
      `The operational pain isn't that any single integration is hard — it's that the seams between them are where reliability quietly breaks. Two failure modes cost real money and never show up in a demo. A spoofed webhook — anyone who discovers the endpoint URL — can trigger a real customer email or a real CRM write if the payload isn't verified against the sender's signature. And a duplicated webhook — Stripe retries aggressively by design — double-sends a payment confirmation, double-creates a CRM contact, and double-alerts the ops channel, because the naive handler treats every delivery as a first delivery.`,
      `The harder version of the problem: even when each integration works, there's no single normalized record of “what happened to this order.” The event history lives scattered across four vendor dashboards, so answering “did this customer get charged, emailed, and shipped?” means opening four tabs and correlating by hand. This project targets that gap — one hub that verifies, de-duplicates, normalizes, and records every commerce event, then fans out downstream actions with per-action status attached.`,
    ],
  },
  {
    number: '02',
    title: 'Customer Context',
    subtitle: 'Who this is built for',
    paragraphs: [
      `The intended profile is a small-to-mid commerce or SaaS operations team — the kind of team that has outgrown a single Stripe dashboard but hasn't built an internal event platform. Concretely: a business processing real payment volume, running a Shopify (or similar) storefront, with a support/ops function that needs to know about payment, inventory, and delivery events as they happen, and a CRM (HubSpot in this build) that should stay in sync without manual data entry.`,
      `What makes this team's problem acute is the operational shape: a lean team responsible for an event flow that spans three or four external vendors, each with its own webhook contract and retry behavior; a genuine cost attached to getting it wrong (a double-charged-looking confirmation email is a support ticket and a trust hit); and at least one existing tooling investment — the CRM, the Slack workspace — that any solution has to feed rather than replace. The business driver is rarely “we want an event bus”; it's “we keep missing low-stock alerts” or “support is finding out about failed payments from angry customers instead of from a system.”`,
    ],
  },
  {
    number: '03',
    title: 'Architecture Overview',
    subtitle: 'How a request moves through the system',
    paragraphs: [
      `A single Express backend sits behind a React dashboard. Inbound events enter through one of two doors — verified webhook routes (Stripe, Shopify) or a simulator/API surface — converge on a shared event processor, get persisted to MongoDB, and fan out to Slack, email, and the CRM. The dashboard polls the event API on an interval and renders the normalized history with each downstream action's status.`,
    ],
    diagram: `Browser (React + Vite + TanStack Query)
  live event table · simulator · filter/search
        │  polls GET /events every 5s
        ▼
Express backend
  /webhooks (raw body)  ·  /events  ·  /inventory  ·  /delivery  ·  /notify
        │
        ▼
  Signature verification (Stripe HMAC, Shopify HMAC)  →  raw-body middleware
        │
        ▼
  eventProcessor  ──►  MongoDB (Event store, normalized shape)
        │
        ├──► Slack (Block Kit alert)
        ├──► Resend (email)
        └──► HubSpot (contact create/update)   [each records its own status]`,
    closingParagraphs: [
      `The shape that matters most is the funnel: many sources, each with different payloads and different verification, all normalized into one Event document before the processor runs. The processor never knows or cares which vendor an event came from — that decoupling is the subject of the next section.`,
    ],
  },
  {
    number: '04',
    title: 'Architecture Decisions',
    subtitle: 'What was chosen, and why',
    subsections: [
      {
        title: 'Why webhook routes are mounted with a raw body parser before express.json()',
        paragraphs: [
          `Decision. The /webhooks routes use express.raw({ type: 'application/json' }) and are mounted in app.js before the global express.json() middleware. Signature verification runs against the raw Buffer, not a parsed-and-re-serialized object.`,
          `Why. Stripe and Shopify sign the exact bytes of the request body. If the body is parsed to JSON and re-serialized before verification, key ordering and whitespace can differ from what the sender signed, and every signature check fails — or worse, passes against a body that isn't what arrived. Verifying the raw buffer is the only way the HMAC comparison actually means anything.`,
          `Trade-off. Route mount order becomes load-bearing and non-obvious. A future contributor who moves express.json() above the webhook mount, or adds a body-logging middleware in front of it, silently breaks verification. This is mitigated with an explicit code comment at the mount point, but it's a real footgun that a raw-body seam always introduces.`,
        ],
      },
      {
        title: 'Why idempotency lives on a unique database index, not an application check',
        paragraphs: [
          `Decision. The Event schema puts unique: true, sparse: true on stripeEventId. Duplicate Stripe deliveries collide at insert time rather than being filtered by an in-app “have I seen this ID?” lookup.`,
          `Why. An application-level check has a race window: two concurrent retries can both read “not seen,” both pass, and both process. A unique index makes MongoDB the single arbiter — the second insert fails deterministically regardless of concurrency. sparse is deliberate so that non-Stripe events (Shopify, delivery, simulator), which legitimately have no stripeEventId, aren't all collapsed into a single null-keyed conflict.`,
          `Alternatives considered. An in-memory Set of seen IDs (lost on restart, useless across multiple instances) and a “check-then-write” query (the race above). Both rejected.`,
          `Trade-off. The duplicate path surfaces as a caught database error that has to be treated as success, which reads oddly until you internalize that “already processed” is the correct outcome, not a failure.`,
        ],
      },
      {
        title: 'Why the event model is source-agnostic',
        paragraphs: [
          `Decision. Every source — Stripe, Shopify, delivery, simulator — is flattened into one Event shape (type, source, plus optional payment/inventory/delivery fields and a rawPayload catch-all) before it reaches processEvent. The processor branches only on source to pick an email template, never on payload structure.`,
          `Why. This is the seam that makes the system additive. A new source is a new controller that maps its payload into the normalized shape and calls the same processor — the store, the dashboard, the fanout, and the filtering all work unchanged. It's also the honest answer to “isn't this just three webhook handlers?”: the value isn't the fan-out, it's the normalization contract that keeps fan-out from multiplying.`,
          `Trade-off. A single wide schema with many optional fields (amount for payments, inventoryQuantity for Shopify, trackingNumber for delivery) is less strictly typed than per-source collections. Chosen for query and dashboard simplicity — one collection, one timeline — at the cost of a schema where not every field applies to every document.`,
        ],
      },
      {
        title: 'Why fanout records per-action status instead of failing atomically',
        paragraphs: [
          `Decision. processEvent wraps each downstream action (email, HubSpot, Slack) in its own try/catch, collects errors into an array, and writes booleans (emailSent, hubspotContactCreated, slackAlerted) plus a joined errorMessage onto the event. Final status is processed if Slack succeeded, else failed.`,
          `Why. Downstream providers fail independently. If Resend is down but Slack is up, the ops team should still get alerted, and the event record should show exactly what happened rather than a blanket failure. Per-action status is what makes the dashboard's status column truthful.`,
          `Trade-off. The success definition is currently pinned to Slack specifically (status = slackAlerted ? 'processed' : 'failed'), which is a simplification — an event where email succeeded but Slack failed is marked failed even though a customer was notified. A more correct model would score partial success explicitly; this is called out in limitations.`,
        ],
      },
      {
        title: 'Why the dashboard polls instead of using WebSockets',
        paragraphs: [
          `Decision. The React dashboard polls GET /events every 5 seconds via TanStack Query rather than holding a socket open.`,
          `Why. Polling is simpler to deploy on serverless (Vercel), reliable for a live demo, and trivial to explain in an interview. For an ops dashboard where 5-second latency is imperceptible, it's the right complexity trade.`,
          `Trade-off. It doesn't scale to true real-time or to many concurrent dashboards without hammering the API. SSE or WebSockets is the documented production upgrade — deferred deliberately, not overlooked.`,
        ],
      },
    ],
  },
  {
    number: '05',
    title: 'Operational Flow',
    subtitle: 'One event, start to finish',
    paragraphs: [
      `Walking a Stripe payment through the system end to end.`,
    ],
    subsections: [
      {
        title: '1. The webhook arrives.',
        paragraphs: [`Stripe POSTs to /webhooks/stripe. Because this route was mounted with express.raw() before JSON parsing, req.body is the untouched Buffer the signature was computed over.`],
      },
      {
        title: '2. The signature is verified.',
        paragraphs: [`validateStripeSignature middleware reads the stripe-signature header and calls Stripe's constructEvent against the raw buffer. A missing header or a mismatch returns 400 immediately and the attempt is logged — nothing downstream runs. On success, the parsed event is attached to req.stripeEvent.`],
      },
      {
        title: '3. The event is normalized and persisted.',
        paragraphs: [`The controller maps Stripe's payload into the normalized Event shape and calls processEvent, which first does Event.create({ ...input, status: 'pending' }). The record exists — with a pending status — before any external call is attempted, so nothing is lost if a downstream provider hangs.`],
      },
      {
        title: '4. Fanout runs, each action independently.',
        paragraphs: [`The processor sends the appropriate email via Resend (payment / inventory / delivery template chosen by source), creates or updates the HubSpot contact if the event has a customer email and came from Stripe or the simulator, and posts a Slack Block Kit alert. Each is wrapped in its own try/catch; failures are collected, not thrown.`],
      },
      {
        title: '5. Final status is written.',
        paragraphs: [`The processor updates the event with the per-action booleans, a joined errorMessage if anything failed, and a final status. The duplicate-delivery case never reaches step 4 — the unique stripeEventId index rejects it at step 3.`],
      },
      {
        title: '6. The dashboard reflects it.',
        paragraphs: [`Within 5 seconds the polling dashboard picks up the new event and renders it with source, type, and each downstream action's status. The simulator can inject synthetic payment/inventory/delivery events at step 3 to make this flow repeatable on demand for a demo.`],
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
        paragraphs: [`Both Stripe and Shopify inbound webhooks are HMAC-verified against the raw request body before any processing. Spoofed or tampered payloads are rejected with a 400 and logged. This is the primary trust boundary of the system.`],
      },
      {
        title: 'Idempotency as an integrity control.',
        paragraphs: [`The unique index on stripeEventId isn't only a reliability feature — it prevents replay of a captured legitimate webhook from producing duplicate customer-facing side effects.`],
      },
      {
        title: 'API-key middleware on non-webhook mutation routes.',
        paragraphs: [`A requireApiKey middleware exists to gate direct API access (the simulator/notify surface) so those endpoints aren't open to the internet by default.`],
      },
      {
        title: 'Explicit CORS allow-listing.',
        paragraphs: [`app.js normalizes and allow-lists origins from CLIENT_ORIGIN, plus a specific regex for the project's Vercel frontend domains, rather than reflecting any origin. A wildcard is only used if explicitly configured — the default is a closed list.`],
      },
      {
        title: 'Secrets in environment variables.',
        paragraphs: [`Stripe, Shopify, Resend, Slack, and HubSpot credentials are read from environment variables, not committed. .env.example documents the shape without values.`],
      },
      {
        title: 'Honest gaps.',
        paragraphs: [`There is no secrets manager (e.g. AWS Secrets Manager / Vault) in front of the environment variables — acceptable for a portfolio deployment, a real gap for production. There is no per-tenant authentication; the event store is single-tenant by design. Input validation on the simulator/API routes is present (allow-lists for event types, sources, currencies; email-format checks) but is application-level, not schema-enforced at the edge.`],
      },
    ],
  },
  {
    number: '07',
    title: 'Scalability Considerations',
    subtitle: 'Where this would need to change',
    paragraphs: [
      `The current design comfortably handles a single business's real webhook volume with a live dashboard — its actual purpose. Specific pressure points, with the reasoning for each:`,
    ],
    subsections: [
      {
        title: 'Fanout is synchronous and inline.',
        paragraphs: [`processEvent awaits email, then CRM, then Slack within the request lifecycle. Under a burst of webhooks (a flash sale firing hundreds of Stripe events), slow downstream providers would back up request handling. The production shape is a queue: persist the event, return 200 to the sender fast, and let workers drain the fanout — which also gives real retry semantics per action.`],
      },
      {
        title: `Polling doesn't scale to many dashboards.`,
        paragraphs: [`Every open dashboard hits GET /events every 5 seconds. One ops user is nothing; fifty is a self-inflicted load pattern. SSE/WebSockets pushes updates instead, and is the documented upgrade.`],
      },
      {
        title: 'The event collection grows unbounded.',
        paragraphs: [`With rawPayload stored on every event, the collection is write-heavy and never pruned. At volume this needs TTL/archival on old events and an index review — reads currently sort by createdAt with source/type/status filters, which should be backed by compound indexes before the collection is large.`],
      },
      {
        title: 'Single-region serverless.',
        paragraphs: [`Running as Vercel functions means cold starts on the webhook path, which matters because webhook senders have delivery timeouts. A warm, queue-backed ingestion tier removes that risk.`],
      },
    ],
  },
  {
    number: '08',
    title: 'Current Limitations',
    subtitle: `What this honestly doesn't do yet`,
    subsections: [
      {
        title: 'Delivery tracking is simulated.',
        paragraphs: [`The delivery source produces realistic status transitions but isn't wired to a real carrier API — it's a mock surface for demoing post-purchase flow. Swapping in a real carrier (EasyPost/Shippo) is a known next step.`],
      },
      {
        title: 'HubSpot sync is optional/mockable.',
        paragraphs: [`CRM sync can run against a real HubSpot private app, but is designed to also run in a mock mode so demos don't depend on account setup. In the demo default it may not be a live write.`],
      },
      {
        title: 'Partial-success status is coarse.',
        paragraphs: [`As noted in Section 4, final status keys off Slack success specifically, so an event where email succeeded but Slack failed is labeled failed. The per-action booleans carry the true detail, but the top-level status oversimplifies.`],
      },
      {
        title: 'No authentication or multi-tenancy.',
        paragraphs: [`The event store belongs to one business. Exposing it to multiple teams would require an auth layer and per-tenant data isolation that doesn't exist today.`],
      },
      {
        title: 'Fanout has no automatic retry.',
        paragraphs: [`A failed downstream action is recorded but not retried — there's no dead-letter or backoff. A queue-based redesign (Section 7) is the prerequisite for real retries.`],
      },
    ],
  },
  {
    number: '09',
    title: 'Production Evolution',
    subtitle: 'If this were going to production tomorrow',
    subsections: [
      {
        title: 'Queue the fanout.',
        paragraphs: [`The single highest-value change: accept and persist the webhook, acknowledge the sender immediately, and move Slack/email/CRM into queued workers with per-action retry and backoff. This fixes the synchronous-fanout bottleneck, the missing-retry gap, and the webhook-timeout risk in one move.`],
      },
      {
        title: 'Real delivery + live CRM.',
        paragraphs: [`Replace the mock carrier with EasyPost/Shippo webhooks and pin HubSpot to a real private-app token, so every advertised integration is genuinely live.`],
      },
      {
        title: 'Secrets and least privilege.',
        paragraphs: [`Move credentials behind a secrets manager, and scope the MongoDB user to the specific database rather than broad access.`],
      },
      {
        title: 'Observability.',
        paragraphs: [`Emit structured logs keyed by event ID, and a metric for fanout success rate per provider, so “Slack delivery is failing” is a dashboard line, not something discovered from a quiet channel. This turns the event log into an SLO story.`],
      },
      {
        title: 'Compound indexes and archival.',
        paragraphs: [`Add indexes backing the dashboard's filter/sort, and a TTL/archival policy for aged events before the collection gets large.`],
      },
    ],
  },
  {
    number: '10',
    title: 'Lessons Learned',
    subtitle: 'What this actually taught',
    subsections: [
      {
        title: 'Raw-body verification makes middleware order a correctness property, not a style choice.',
        paragraphs: [`Getting Stripe verification to pass meant the webhook routes had to be mounted before express.json(), and that ordering isn't visible from the route file — it lives in app.js. The lesson: when a security control depends on middleware sequencing, the sequence itself needs a guarding comment (and ideally a test that posts a signed payload), because it's exactly the kind of thing a future refactor breaks silently.`],
      },
      {
        title: 'Idempotency belongs at the layer that can actually enforce it.',
        paragraphs: [`The instinct was to check for duplicates in application code; the correct place was a database constraint, because only the database sees all concurrent writes. Treating a duplicate-key error as a success path felt wrong at first and turned out to be the whole point.`],
      },
      {
        title: `“Partial success” is a real state that a boolean can't hold.`,
        paragraphs: [`Modeling fanout as processed-or-failed lost information the moment two providers disagreed. The per-action booleans were the right instinct, but pinning the top-level status to one provider (Slack) re-collapsed the nuance. If rebuilt, status would be derived from the set of action outcomes, not from a single chosen action.`],
      },
      {
        title: 'A normalized event model is what keeps a “fan-out” project from becoming three projects.',
        paragraphs: [`The temptation with multi-source webhooks is a handler per source, end to end. Forcing every source through one normalized shape before the processor is what made adding Shopify and delivery additive instead of multiplicative — and it's the design decision most worth being able to articulate out loud.`],
      },
    ],
  },
];
