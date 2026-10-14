# ACoolCOLLECTOR — Backup & Recovery SOP

**Date:** 2026-10-13  
**Database:** PostgreSQL 15 (acoolcollector)  
**Backup Location:** `~/ACool/backups/acoolcollector/`  
**Format:** pg_dump custom format (-F c)

---

## Creating a Backup

```bash
# Get DB credentials from container (no credential printing)
DB_USER=$(docker exec acool_db env | grep POSTGRES_USER | cut -d= -f2)
DB_NAME=$(docker exec acool_db env | grep POSTGRES_DB | cut -d= -f2)
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$HOME/ACool/backups/acoolcollector/acoolcollector_${TIMESTAMP}.dump"

mkdir -p "$HOME/ACool/backups/acoolcollector"
docker exec acool_db pg_dump -U "$DB_USER" -d "$DB_NAME" -F c -f /tmp/backup.dump
docker cp acool_db:/tmp/backup.dump "$BACKUP_FILE"
docker exec acool_db rm /tmp/backup.dump

echo "Backup: $BACKUP_FILE"
ls -lh "$BACKUP_FILE"
```

## Validating a Backup (Non-Destructive)

```bash
# List backup contents without restoring
docker cp "$BACKUP_FILE" acool_db:/tmp/validate.dump
docker exec acool_db pg_restore --list /tmp/validate.dump | grep -E "TABLE|DATA"
docker exec acool_db rm /tmp/validate.dump
```

Expected output includes:
- `TABLE public Item`
- `TABLE public MarketData`  
- `TABLE DATA public Item`
- `TABLE DATA public MarketData`

## Restoring from Backup

> **Requires explicit authorization before execution.**

```bash
# 1. Stop the web and ai-engine containers first
docker compose stop web ai-engine

# 2. Copy backup into container
docker cp "$BACKUP_FILE" acool_db:/tmp/restore.dump

# 3. Drop and recreate the target database
#    (requires DBA authorization — DROP DATABASE is a destructive operation)

# 4. Restore
docker exec acool_db pg_restore -U "$DB_USER" -d "$DB_NAME" \
  --no-owner --no-privileges /tmp/restore.dump

# 5. Verify row count
docker exec acool_db psql -U "$DB_USER" -d "$DB_NAME" \
  -c 'SELECT COUNT(*) FROM "Item";'

# 6. Clean up and restart
docker exec acool_db rm /tmp/restore.dump
docker compose start web ai-engine
```

## Backup Schedule Recommendation

| Cadence | Trigger | Retention |
|---------|---------|-----------|
| Before any major dependency upgrade | Manual (before sprint) | 90 days |
| Weekly | Manual or cron | 30 days |
| Before bulk data imports | Manual | 7 days |

## Existing Backups

| File | Size | Created |
|------|------|---------|
| `acoolcollector_20261013_031744.dump` | 144K | 2026-10-13 03:17 |

## Validation Evidence (2026-10-13)

Backup validated non-destructively via `pg_restore --list`. Contents confirmed:
- `TABLE public Item` ✓
- `TABLE public MarketData` ✓
- `TABLE DATA public Item` ✓  
- `TABLE DATA public MarketData` ✓
- 22 catalog entries total ✓
