export const securityPostureScorecardNotes = [
  {
    number: '01',
    title: 'The Problem',
    subtitle: 'Security scanners fail in one of two directions, and both destroy trust',
    paragraphs: [
      `Someone needs a fast read on a codebase's security posture — a security champion sizing up a vendor's repo, a team doing due diligence, an engineer auditing their own project before a review. The tools available to them tend to fail in one of two opposite ways. Some overclaim: a green checkmark that was really a heuristic guess, presented with the same confidence as a proven fact. Others drown the user in noise: a wall of findings with no way to tell which ones were actually verified and which are speculative pattern-matches.`,
      `In a security context, the first failure mode is the dangerous one. A tool that says “encryption at rest: pass” when it has no possible way to see the database configuration from source code isn't just unhelpful — it's issuing false assurance about the exact thing the user most needs to be right. A fake green check is worse than no check, because it stops someone from looking closer at a real risk.`,
      `The insight this project is built around is that the honest answer to many security questions from static source analysis is “I can't fully verify this from here.” Most tools bury that uncertainty. This one makes it a first-class part of every finding: each result reports whether the scan could verify it from source, only detect it heuristically, or whether it genuinely requires manual confirmation — and the tool never lets a manual-only item masquerade as a passing check.`,
    ],
  },
  {
    number: '02',
    title: 'Customer Context',
    subtitle: 'Who this is built for',
    paragraphs: [
      `The intended user is anyone who needs a trustworthy, fast posture read on a repository they don't own or haven't deeply audited. Three concrete shapes: a security champion or SE evaluating a prospect's or partner's codebase during a technical review, who needs findings they can defend in front of that team; a developer self-auditing before a security review or open-sourcing, who wants a scoped, actionable checklist rather than a noise dump; and a due-diligence reviewer sizing up an acquisition or dependency, who needs to know what was actually verified versus what still needs a human.`,
      `What unites them is that they can't afford a tool that lies by omission or overconfidence. The value isn't “more findings” — it's calibrated findings. This user profile also implies a hostile-input reality most portfolio projects ignore: the tool accepts an arbitrary, user-supplied public repository URL and downloads it, which means the codebase being scanned is untrusted input the tool has to defend against, not just analyze.`,
    ],
  },
  {
    number: '03',
    title: 'Architecture Overview',
    subtitle: 'How a request moves through the system',
    paragraphs: [
      `A React dashboard posts a repo URL to an Express API. The request passes two layered guards, gets its URL parsed and validated, is fetched safely into an isolated temp directory, scanned by a registry of self-contained check modules over one shared file tree, scored with confidence-aware weighting, and returned as a graded JSON report — with the temp directory always cleaned up.`,
    ],
    diagram: `React dashboard  ──  POST /api/scan { repoUrl }
        │
        ▼
Endpoint guards:  rateLimiter (volume/IP)  →  scanLimiter (concurrent work)
        │
        ▼
scanController  ── parse & validate repoUrl → typed error (400/404/429/413/504)
        │
        ▼
repoFetcher
   resolve default branch + size guard (Octokit)
   → download tarball (codeload)
   → stream to temp dir (byte cap)
   → extract (zip-slip path filter)
        │
        ▼
scanRunner
   buildContext (one shared file tree)
   → run every registered check (checks/index.js registry)
   → Frontend · Backend · Database   [verified / detected / manual]
        │
        ▼
scorer  ── severity weights → per-layer + overall score & grade
        │
        ▼
JSON scorecard → dashboard
        │
        └── temp dir deleted in try/finally on every path`,
    closingParagraphs: [
      `The two shapes that matter most: the check registry (adding a whole layer changes nothing in the runner, scorer, or dashboard) and the confidence tiering (the scorer treats verified, detected, and manual findings differently on purpose). Both are covered next.`,
    ],
  },
  {
    number: '04',
    title: 'Architecture Decisions',
    subtitle: 'What was chosen, and why',
    subsections: [
      {
        title: 'Why every check carries a confidence tier, and manual items are excluded from the score',
        paragraphs: [
          `Decision. Each finding is tagged verified (proven from source), detected (heuristic — regex/usage inference), or manual (cannot be determined from source at all). The scorer's STATUS_FACTOR only applies to checks that actually participate; manual items are explicitly excluded (participates = c.confidence !== 'manual'), so they inform the reader without ever moving the score.`,
          `Why. This is the core principle of the entire tool. Confidence drops as you go deeper — frontend checks like exposed secrets are genuinely verifiable, database properties like encryption-at-rest and backups are not visible from source at all. Scoring a manual-only item would mean either rewarding something the tool never confirmed or penalizing a repo for something it can't see. Both are dishonest. Excluding manual items from the score is what lets the tool surface “confirm these yourself: encryption at rest, backups, least-privilege, PITR” as an advisory checklist rather than a fake green check.`,
          `Alternatives considered. A single flat score with all checks weighted equally, ignoring confidence. Rejected — it's exactly the overclaiming failure mode the tool exists to avoid.`,
          `Trade-off. The report is more nuanced and harder to reduce to one number, because “score: 82, plus four manual items you still need to verify” is a more honest but less tidy answer than a single grade. That honesty is the product, so the trade is accepted deliberately.`,
        ],
      },
      {
        title: 'Why checks are self-contained modules loaded from a registry',
        paragraphs: [
          `Decision. Every check is a module of the same shape under checks/**, and checks/index.js is a flat registry that imports and lists them. The runner iterates the registry; the scorer and dashboard consume whatever it produces. Layers 2 (backend) and 3 (database) were added purely by dropping modules into the registry — the runner, scorer, and dashboard didn't change.`,
          `Why. The plugin pattern is what makes layers additive instead of invasive. A new check or a whole new layer is a new file plus a registry entry, with zero coordination cost elsewhere. This is also the architectural answer to “make the project distinct”: it's a fundamentally different shape from a linear request pipeline, and the sameness of every check's interface is the deliberate design goal, not an accident.`,
          `Trade-off. Every check must conform to one interface contract (same input context, same output shape including a confidence tier and status). That uniformity is the source of the pattern's power, but it means a check with a genuinely different shape of output has to be forced into the common contract or the contract has to grow.`,
        ],
      },
      {
        title: 'Why the repo fetcher owns its temp directory and cleans up in try/finally',
        paragraphs: [
          `Decision. fetchRepo creates the temp directory with mkdtemp, and from that point wraps everything in a try whose finally removes the directory — on success, on any failure, and on caller abort via an AbortSignal. A failure before mkdtemp has nothing to clean, so the cleanup boundary is drawn precisely where ownership begins.`,
          `Why. The tool downloads and extracts untrusted archives on every request. Without guaranteed cleanup, a failed or timed-out scan leaks disk, and enough of those take the service down. Tying cleanup to a finally that also fires on abort means a slow scan that hits the timeout doesn't leave its tarball behind.`,
          `Trade-off. The ownership boundary has to be reasoned about carefully — cleanup must not run for a failure that happened before the temp dir existed, and must always run after. Getting that boundary exactly right is fiddly, but it's the difference between a tool that survives repeated hostile input and one that fills its disk.`,
        ],
      },
      {
        title: 'Why extraction defends against zip-slip even though GitHub tarballs are trusted',
        paragraphs: [
          `Decision. isSafeEntryPath rejects any archive entry that is absolute or contains a .. traversal segment, applied during extraction. The code comment states plainly: GitHub tarballs never contain these, but the tool extracts untrusted archives, so it doesn't rely on that.`,
          `Why. Defense in depth. The threat model is “arbitrary user-supplied repo,” and assuming the archive is well-formed because it usually is would be exactly the kind of assumption an attacker targets. A malicious archive entry that writes outside the extraction root could overwrite files elsewhere on the host; the path filter makes that impossible regardless of source.`,
          `Trade-off. A small amount of extra work on every extraction for a threat that GitHub's own tarballs never present — accepted because the cost is trivial and the failure it prevents is severe.`,
        ],
      },
      {
        title: 'Why size is guarded before download, not after',
        paragraphs: [
          `Decision. The fetcher reads the repo's size from the GitHub metadata (repo.size, in KB) and rejects anything over maxRepoBytes with REPO_TOO_LARGE before downloading, plus enforces a byte cap while streaming the tarball as a second line of defense.`,
          `Why. Checking size after download defeats the purpose — the resource exhaustion already happened. Rejecting on metadata first means a 5 GB repo never gets streamed at all; the streaming byte cap then catches any case where the metadata under-reports.`,
          `Trade-off. repo.size from GitHub is approximate and can lag reality, which is exactly why the streaming cap exists as a backstop rather than trusting the metadata alone.`,
        ],
      },
    ],
  },
  {
    number: '05',
    title: 'Operational Flow',
    subtitle: 'One scan, start to finish',
    subsections: [
      {
        title: '1. The request hits two guards.',
        paragraphs: [`A repo URL is POSTed to /api/scan. A per-IP rateLimiter caps request volume; behind it, a scanLimiter caps concurrent scans, because each scan is expensive work, not just a cheap request. Exceeding either returns a typed 429.`],
      },
      {
        title: '2. The URL is parsed and validated.',
        paragraphs: [`scanController extracts owner/repo and rejects malformed input with a typed error (400) before any network call.`],
      },
      {
        title: '3. The repo is resolved and size-guarded.',
        paragraphs: [`repoFetcher calls the GitHub API (Octokit) to resolve the default branch and read the repo size. A 404 becomes REPO_NOT_FOUND, a 403 is disambiguated into RATE_LIMITED vs not-found, and an oversized repo becomes REPO_TOO_LARGE — all before a temp directory exists.`],
      },
      {
        title: '4. The tarball is downloaded and extracted safely.',
        paragraphs: [`A temp dir is created (ownership begins, cleanup now guaranteed), the tarball is streamed from codeload under a byte cap, and each entry is extracted only if it passes the zip-slip path filter.`],
      },
      {
        title: '5. One shared file tree is built.',
        paragraphs: [`scanRunner's buildContext reads the extracted source once into a shared file tree, so every check operates over the same in-memory view rather than each re-walking the disk.`],
      },
      {
        title: '6. Every registered check runs.',
        paragraphs: [`The runner iterates checks/index.js, running each frontend, backend, and database check against the shared context. Each returns a status (pass/warn/fail/manual/na) and a confidence tier. Layers with no applicable code (a frontend-only repo has no backend) are marked not-applicable, not failed.`],
      },
      {
        title: '7. The scorer weights by severity and confidence.',
        paragraphs: [`scoreChecks sums severityWeights for participating checks (pass keeps full weight, warn half, fail none), excludes manual and na, computes a per-layer and overall percentage, and grades it A–F. It also builds a prioritized fix list from failing/warning findings.`],
      },
      {
        title: '8. The report returns and the temp dir is deleted.',
        paragraphs: [`A graded JSON scorecard — per-layer scores, every finding with its confidence tier, a “why this score” breakdown, and the manual advisory checklist — is returned to the dashboard. The temp directory is removed in the finally, whether the scan succeeded, failed, or timed out.`],
      },
    ],
  },
  {
    number: '06',
    title: 'Security Considerations',
    subtitle: `What's actually implemented`,
    paragraphs: [
      `This project is unusual in that security isn't only what it checks for — it's what it has to defend against, because it ingests untrusted repositories.`,
    ],
    subsections: [
      {
        title: 'Safe handling of untrusted archives.',
        paragraphs: [`Size guarded on metadata before download; a streaming byte cap as a second limit; zip-slip path filtering on every extracted entry; extraction into an isolated per-scan temp directory; and guaranteed cleanup in a try/finally that also fires on abort. Together these bound the disk, path, and resource blast radius of a hostile repo.`],
      },
      {
        title: 'Layered request guards.',
        paragraphs: [`A per-IP rate limiter (volume) in front of a concurrency limiter (simultaneous expensive scans) protects the service from both spray and from a few heavy requests exhausting it. Failure modes are surfaced as typed responses (400/404/413/429/504), not generic 500s.`],
      },
      {
        title: 'Honest, calibrated findings by construction.',
        paragraphs: [`The confidence-tier design is itself a security-integrity feature: the tool structurally cannot report a manual-only property as a passing check, and it separates verified facts from detected heuristics so a consumer never mistakes a guess for proof.`],
      },
      {
        title: 'Dependency checks against real data.',
        paragraphs: [`The vulnerable-dependency check queries the real OSV database from the lockfile, so that finding reflects actual known-vulnerability data rather than a static list that rots.`],
      },
      {
        title: 'Honest gaps.',
        paragraphs: [`The tool authenticates to GitHub with an optional token to raise rate limits, but has no end-user authentication itself. It's static-only — it cannot observe runtime behavior — which is a scope boundary, not a defect, but means whole classes of issue are out of reach by design.`],
      },
    ],
  },
  {
    number: '07',
    title: 'Scalability Considerations',
    subtitle: 'Where this would need to change',
    subsections: [
      {
        title: `Scans are CPU- and disk-bound, and that's the real limit.`,
        paragraphs: [`Unlike a typical API, the expensive part isn't the request — it's downloading, extracting, and walking a repo. The concurrency limiter is the deliberate throttle. Scaling throughput means horizontal workers pulling from a scan queue, not just a bigger single process.`],
      },
      {
        title: 'One shared file tree per scan is efficient but memory-resident.',
        paragraphs: [`Building the context once is the right call for a single scan, but a very large (near-cap) repo holds a substantial tree in memory for the duration. At higher concurrency, memory becomes the binding resource before CPU does, which argues for per-worker isolation.`],
      },
      {
        title: 'GitHub API rate limits gate the fetch.',
        paragraphs: [`Without a token, unauthenticated GitHub API access is tightly limited; the tool supports a token to raise it. At scale this needs a pool or app-level auth rather than a single token shared across all scans.`],
      },
      {
        title: 'Check execution is sequential per scan.',
        paragraphs: [`Checks run over the shared tree one after another. For most repos this is fast, but a large repo with many checks could benefit from parallelizing independent checks — bounded, because they share the file tree and would contend on CPU.`],
      },
      {
        title: 'The OSV lookup is a live external dependency.',
        paragraphs: [`Vulnerable-dependency checking calls out to OSV; at volume this wants caching keyed by dependency+version, since the same popular packages recur across scans.`],
      },
    ],
  },
  {
    number: '08',
    title: 'Current Limitations',
    subtitle: `What this honestly doesn't do yet`,
    subsections: [
      {
        title: 'Static analysis only.',
        paragraphs: [`The tool reads source; it never runs the code. Anything that only manifests at runtime — actual auth enforcement, real network behavior, live configuration — is out of scope by design and surfaced as manual where relevant, never guessed.`],
      },
      {
        title: 'detected-tier checks are heuristic and phrasing-sensitive.',
        paragraphs: [`Backend checks like “input validation library used” or “rate limiting applied” infer from code patterns and manifests. A project doing the right thing in an unrecognized way can be under-credited, and one that imports a library without really using it can be over-credited. The confidence tier is the honest flag on exactly this uncertainty.`],
      },
      {
        title: 'Database layer is mostly advisory.',
        paragraphs: [`The properties that matter most for a database — encryption at rest, backups, least-privilege users, point-in-time recovery — can't be seen from source, so they're a manual checklist, not a scored result. The tool is explicit that it isn't grading them.`],
      },
      {
        title: 'JS/TS-ecosystem focused.',
        paragraphs: [`The checks and manifest parsing target the JavaScript/TypeScript world (package manifests, VITE_/REACT_APP_/NEXT_PUBLIC_ client-exposure patterns, etc.). Other ecosystems would need their own check modules — which the registry makes additive, but which don't exist yet.`],
      },
      {
        title: 'No historical or diff view.',
        paragraphs: [`Each scan is a point-in-time snapshot; there's no tracking of whether a repo's posture improved or regressed between scans.`],
      },
    ],
  },
  {
    number: '09',
    title: 'Production Evolution',
    subtitle: 'If this were going to production tomorrow',
    subsections: [
      {
        title: 'Emit SARIF and run as a GitHub Action.',
        paragraphs: [`The highest-value step: output findings in SARIF, the standard security-findings format, so results upload straight into GitHub Code Scanning, and package the scanner as an Action that runs on every PR. “It runs in CI and speaks the format real security platforms consume” is a concrete, credible production story.`],
      },
      {
        title: 'Move to a queue-and-worker model.',
        paragraphs: [`Given scans are disk/CPU-bound, a scan queue feeding isolated workers is the natural scaling shape — it turns the concurrency limiter from a hard ceiling into a per-worker property and isolates the memory cost of large repos.`],
      },
      {
        title: 'Cache the OSV layer.',
        paragraphs: [`Cache vulnerability lookups by dependency+version, since popular packages recur constantly across scans, cutting both latency and external-call volume.`],
      },
      {
        title: 'Cross-validate a detected check against an industry scanner.',
        paragraphs: [`Wiring one heuristic check to agree with Semgrep or Snyk would let those findings be promoted toward verified with an external second opinion, tightening the tool's most uncertain tier.`],
      },
      {
        title: 'Add posture history.',
        paragraphs: [`Persist scan results per repo so the tool can show trend — improved or regressed since last scan — which is what turns a one-shot audit into an ongoing signal.`],
      },
    ],
  },
  {
    number: '10',
    title: 'Lessons Learned',
    subtitle: 'What this actually taught',
    subsections: [
      {
        title: 'Honesty is an architecture, not a disclaimer.',
        paragraphs: [`The easy version of “be honest about confidence” is a footnote saying “some findings are heuristic.” The real version is structural: a confidence tier on every finding, a scorer that mechanically refuses to let a manual item affect the grade, and a not-applicable state so a frontend library isn't failed for missing backend controls. Building the honesty into the scoring math — rather than into caveats around it — is what makes the tool trustworthy, and it was more design work than adding another check would have been.`],
      },
      {
        title: `Accepting untrusted input changes what “a scanner” even is.`,
        paragraphs: [`The moment the tool takes an arbitrary repo URL, half the engineering stops being about analysis and starts being about defense: size guards before download, byte caps while streaming, zip-slip filtering on extraction, temp-dir ownership with guaranteed cleanup, layered rate and concurrency limits. The scanning logic is the visible product; the hostile-input handling is what makes it safe to expose. That was the part that took the most careful reasoning.`],
      },
      {
        title: 'The plugin registry paid off exactly when it was supposed to.',
        paragraphs: [`The test of “adding a layer changes nothing downstream” wasn't theoretical — layers 2 and 3 were added by dropping modules into checks/index.js with no change to the runner, scorer, or dashboard. The uniform check interface felt like over-engineering when there was only one layer; it paid for itself the moment there were three.`],
      },
      {
        title: 'What would be redesigned.',
        paragraphs: [`Cleanup ownership is currently reasoned about by hand — the try/finally boundary drawn precisely at mkdtemp. It's correct, but it's the kind of correctness that depends on a future contributor understanding why the boundary is where it is. If rebuilt, the temp-dir lifecycle would be wrapped in an explicit “with-temp-dir” helper that takes the scan as a callback, so the cleanup guarantee is enforced by structure rather than by remembering to keep the finally in the right place.`],
      },
    ],
  },
];
