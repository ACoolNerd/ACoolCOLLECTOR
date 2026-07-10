# Official Release, Checklist, and Event Source Synchronization Backlog

## Priority 1 — ONE PIECE CARD GAME

- Crawl or ingest the official product index without copying protected product imagery.
- Preserve product code, display name, region, product type, release precision, MSRP, official URL and last checked time.
- Import official card lists only where terms permit.
- Import official recommended deck lists with source and effective date.
- Add tournament-result deck sources separately from publisher-recommended decks.
- Flag restrictions, errata and rotation or legality changes with timestamps.

## Priority 2 — Disney Lorcana

- Resolve the official product and set source through Ravensburger / Disney Lorcana.
- Do not publish future release dates from third-party summaries as verified facts.
- Store set number, set name, hobby release, mass-retail release, region, rotation date and official URL.
- Import official card checklists and rules references only where terms permit.

## Priority 3 — Major TCGs

- Pokémon TCG
- Magic: The Gathering
- Yu-Gi-Oh!
- Dragon Ball Super Card Game
- Digimon Card Game
- Star Wars: Unlimited
- Flesh and Blood
- Riftbound
- Additional licensed games approved by Product and Legal

Each connector requires official source, usage review, rate limits, source timestamp, region, language and deletion/update protocol.

## Priority 4 — Sports Cards

- Topps
- Panini
- Upper Deck
- Leaf
- Fanatics Collect
- League and athlete-specific release calendars

Store manufacturer, product line, year, sport, league, release type, hobby/retail distinction, checklist source and known parallels.

## Priority 5 — Other Collectibles

- Funko Pop!
- LEGO sets
- Comics
- Video games
- Action figures and toys
- Sealed product

The platform category registry is broader than any one pricing provider. Provider category support must be confirmed from the subscribed API or CSV before mapping.

## Event Sources

- Collect-A-Con official tour
- The National Sports Collectors Convention
- regional card-show organizers
- official TCG championship and convention calendars
- card-shop event calendars
- grading-company drop-off shows

## Job Requirements

- idempotent upserts;
- source fingerprint;
- last checked and last changed timestamps;
- date precision;
- stale-data warning;
- source terms and license field;
- retry with backoff;
- no browser secret;
- audit events;
- manual review queue for conflicts;
- provider-specific deletion and correction handling.
