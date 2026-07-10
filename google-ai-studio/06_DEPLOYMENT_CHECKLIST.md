# ACoolCOLLECTOR Deployment Checklist

## Google AI Studio and Gemini

- [ ] System Instructions loaded from `00_SYSTEM_INSTRUCTIONS.md`
- [ ] Master prompt loaded from `01_MASTER_BUILD_PROMPT.md`
- [ ] Context files attached from `02_CONTEXT_MANIFEST.json`
- [ ] Function declarations validated
- [ ] Structured output schemas validated
- [ ] Prompt and model versions recorded
- [ ] Evaluation suite executed
- [ ] No API key embedded in exported client code
- [ ] Production requests routed through controlled server
- [ ] Model quotas, timeouts, retries, and kill switch configured
- [ ] Private-media disclosure and processing review complete

## Google Cloud Project

- [ ] Separate development and production projects
- [ ] Billing account and budgets configured
- [ ] Budget alerts and quota alerts configured
- [ ] Required APIs individually enabled
- [ ] Unused APIs disabled
- [ ] Service accounts use least privilege
- [ ] Workload identity preferred over static keys where supported
- [ ] Secret Manager configured
- [ ] Cloud KMS key rotation configured
- [ ] Audit logs retained
- [ ] Monitoring, uptime, error, latency, and cost alerts configured
- [ ] Incident and rollback owners assigned

## Maps Platform

- [ ] Browser key restricted by HTTPS referrer
- [ ] Server credential restricted by service/IP and API
- [ ] Maps JavaScript or native SDK enabled only where needed
- [ ] Places API enabled and field masks minimized
- [ ] Geocoding API enabled only if needed
- [ ] Address Validation enabled only if needed
- [ ] Routes API enabled only if needed
- [ ] Time Zone API enabled only if needed
- [ ] Place IDs and attribution displayed correctly
- [ ] Data caching and retention reviewed against applicable terms
- [ ] User location collected only with disclosure and permission
- [ ] Venue and vendor coordinates carry source and verification time

## People and Calendar

- [ ] Separate production OAuth client configured
- [ ] Redirect URIs exact and HTTPS
- [ ] OAuth consent screen reviewed
- [ ] Minimum scopes requested incrementally
- [ ] Contacts feature opt-in
- [ ] Calendar feature opt-in
- [ ] Connect, conflict, disconnect, and revoke flows tested
- [ ] User deletion and retention behavior tested
- [ ] Private contacts never used for vendor surveillance

## Cloud Media and Workflows

- [ ] Private and public Cloud Storage buckets separated
- [ ] Public access prevention enabled on private bucket
- [ ] Signed upload and download expiration tested
- [ ] MIME, size, malware, and malformed-media controls tested
- [ ] Metadata stripping tested
- [ ] SHA-256 and provenance recorded
- [ ] Cloud Tasks queues configured with retry limits
- [ ] Pub/Sub dead-letter policy configured
- [ ] Cloud Scheduler jobs idempotent
- [ ] Sensitive payloads excluded from logs

## Supabase and Database

- [ ] Migrations apply in isolated development
- [ ] Rollback or corrective migration tested
- [ ] RLS tests pass
- [ ] Organization-boundary tests pass
- [ ] Service-role key remains server-only
- [ ] Backup and restore tested
- [ ] Private records default private
- [ ] Audit events append-only
- [ ] External IDs and idempotency keys unique

## QuickBooks Online

- [ ] Intuit developer app created
- [ ] Development and production credentials separated
- [ ] Accounting scope approved
- [ ] Redirect URI configured
- [ ] CSRF state verification tested
- [ ] Sandbox OAuth flow tested
- [ ] Token encryption/reference implemented
- [ ] Token refresh and reconnect tested
- [ ] Customer and vendor sync idempotent
- [ ] Invoice and sales-receipt mapping approved
- [ ] Payment and refund reconciliation tested
- [ ] Merchant fee mapping approved
- [ ] Affiliate income and payable mapping approved
- [ ] Consignor payable treatment approved
- [ ] Webhook verification and replay tests pass
- [ ] Amount and currency mismatch queue tested
- [ ] No cardholder data stored
- [ ] Accountant signs off

## Affiliate and Partner Programs

- [ ] Provider registry complete
- [ ] Program status verified
- [ ] Agreement reference stored
- [ ] Trademark and badge permission recorded
- [ ] Disclosure approved
- [ ] Destination host allowlisted
- [ ] HTTPS required
- [ ] Consent and retention reviewed
- [ ] Conversion source and verification defined
- [ ] Reversal and clawback behavior tested
- [ ] Commission statement tested
- [ ] QuickBooks mapping approved
- [ ] Expiration and suspension tested
- [ ] No pending relationship represented as approved

## SEO and Social

- [ ] Production domain HTTPS
- [ ] Canonical URLs unique and stable
- [ ] Titles and descriptions unique
- [ ] Open Graph required fields present
- [ ] Social image and alt text present
- [ ] Twitter-compatible card metadata present
- [ ] Organization, WebSite, and SoftwareApplication graph valid
- [ ] Product Offer emitted only for approved published inventory
- [ ] Event data matches visible page and official source
- [ ] Vendor rating omitted when evidence is insufficient
- [ ] Verified sameAs links only
- [ ] Breadcrumb structured data valid
- [ ] Sitemap index generated
- [ ] robots.txt deployed
- [ ] Private routes protected independently of robots.txt
- [ ] Search Console verified
- [ ] Sitemaps submitted
- [ ] Structured-data validation in CI
- [ ] Open Graph preview tests completed

## Meta and Social APIs

- [ ] Open Graph metadata deployed
- [ ] Official social accounts verified before sameAs
- [ ] Meta application created only if a feature requires it
- [ ] Approved Meta permissions documented
- [ ] Private accounts and messages excluded
- [ ] Contact-list upload prohibited without approved basis and consent
- [ ] Data deletion and disconnect behavior implemented
- [ ] No Meta partner or verification claim without evidence

## Security

- [ ] Exposed SportsCardsPro credentials revoked
- [ ] Git history and Actions artifacts scanned
- [ ] Main branch protected
- [ ] Required CI checks enabled
- [ ] Secret scanning and push protection enabled
- [ ] Dependency and license scans pass
- [ ] CORS allowlist configured
- [ ] CSP and secure headers reviewed
- [ ] SSRF and redirect allowlist tests pass
- [ ] Rate limiting and abuse controls tested
- [ ] reCAPTCHA Enterprise configured where appropriate
- [ ] Webhook signatures verified
- [ ] Incident response tested
- [ ] Penetration test or equivalent security review complete

## Privacy and Compliance

- [ ] Privacy policy matches actual processing
- [ ] Cookie and analytics consent reviewed
- [ ] User export and deletion tested
- [ ] Vendor correction and appeal tested
- [ ] Contact and calendar consent tested
- [ ] AI media-processing disclosure approved
- [ ] Affiliate disclosures proximate
- [ ] Promotion rules and eligibility approved before entry opens
- [ ] Ticket provider role accurately described
- [ ] Grading estimates labeled as scenarios
- [ ] No investment-return claim
- [ ] Legal, tax, accounting, insurance, and payments review complete

## Accessibility and UX

- [ ] WCAG 2.2 AA review complete
- [ ] Keyboard navigation passes
- [ ] Focus indicators visible
- [ ] Labels and error messages pass
- [ ] Contrast passes
- [ ] Screen-reader status announcements pass
- [ ] Reduced motion passes
- [ ] Mobile touch targets pass
- [ ] Offline and poor-network states pass
- [ ] Empty, loading, error, denied, stale, and review states implemented

## Final Release

- [ ] All Critical evaluations pass
- [ ] CI green
- [ ] No critical risk open
- [ ] Source freshness visible
- [ ] QuickBooks sandbox acceptance complete
- [ ] Google API configuration evidence complete
- [ ] Affiliation status evidence complete
- [ ] Structured-data validation complete
- [ ] Ruth Review approved
- [ ] Executive owner signs written go/no-go
- [ ] Rollback plan ready
