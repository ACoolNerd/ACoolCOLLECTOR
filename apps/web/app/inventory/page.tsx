'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Package, TrendingUp, Database, RefreshCw, ChevronLeft, ChevronRight, X } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Item {
  id: string;
  categoryId: string;
  name: string;
  attributes: Record<string, unknown>;
}

interface StatsData {
  total_items: number;
  by_type: Record<string, number>;
  by_status: Record<string, number>;
}

interface ApiResponse {
  status: string;
  total: number;
  page: number;
  pages: number;
  items: Item[];
}

// ── Design tokens ────────────────────────────────────────────────────────────
const T = {
  bg: 'oklch(9% 0 0)',
  surface: 'oklch(14% 0 0)',
  surfaceHover: 'oklch(17% 0 0)',
  border: 'oklch(20% 0 0)',
  borderAccent: 'oklch(35% 0.18 28)',
  textPrimary: '#ffffff',
  textSecondary: 'oklch(55% 0 0)',
  textMuted: 'oklch(38% 0 0)',
  accent: 'oklch(60% 0.2 28)',
  accentDim: 'oklch(20% 0.12 28)',
  accentText: 'oklch(72% 0.18 28)',
  green: 'oklch(65% 0.2 145)',
  amber: 'oklch(70% 0.18 80)',
  red: 'oklch(65% 0.2 15)',
  blue: 'oklch(60% 0.2 250)',
} as const;

// ── Status helpers ────────────────────────────────────────────────────────────
function statusColor(s: string) {
  if (s === 'CONFIRMED') return T.green;
  if (s === 'PENDING') return T.amber;
  if (s === 'ACTIVE') return T.blue;
  return T.textSecondary;
}

// ── StatCard ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, accent }: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  accent: string;
}) {
  return (
    <div style={{
      background: T.surface,
      border: `1px solid ${T.border}`,
      borderRadius: 12,
      padding: 'clamp(0.875rem, 1.5vw, 1.25rem) clamp(1rem, 2vw, 1.5rem)',
      display: 'flex',
      alignItems: 'center',
      gap: 'clamp(0.75rem, 1.5vw, 1rem)',
    }}>
      <div style={{
        background: accent,
        borderRadius: 8,
        padding: 10,
        display: 'flex',
        flexShrink: 0,
      }}>
        <Icon size={18} color="#fff" aria-hidden />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{
          color: T.textMuted,
          fontSize: 'clamp(0.65rem, 1.2vw, 0.72rem)',
          textTransform: 'uppercase' as const,
          letterSpacing: '0.08em',
          fontWeight: 600,
          whiteSpace: 'nowrap' as const,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>{label}</div>
        <div style={{
          color: T.textPrimary,
          fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)',
          fontWeight: 700,
          lineHeight: 1.2,
        }}>{value}</div>
      </div>
    </div>
  );
}

// ── ItemCard ──────────────────────────────────────────────────────────────────
function ItemCard({ item }: { item: Item }) {
  const attrs = item.attributes || {};
  const status = String(attrs.status || 'CONFIRMED');
  const entity = String(attrs.entity || 'ACool');
  const type = String(attrs.type || item.categoryId || 'Asset');
  const updatedAt = attrs.updatedAt
    ? new Date(String(attrs.updatedAt)).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })
    : '—';

  return (
    <article style={{
      background: T.surface,
      border: `1px solid ${T.border}`,
      borderRadius: 10,
      padding: 'clamp(0.875rem, 2vw, 1.125rem)',
      display: 'flex',
      flexDirection: 'column' as const,
      gap: 8,
      transition: 'border-color 150ms ease, background 150ms ease',
      cursor: 'default',
    }}
    onMouseEnter={e => {
      (e.currentTarget as HTMLElement).style.borderColor = T.borderAccent;
      (e.currentTarget as HTMLElement).style.background = T.surfaceHover;
    }}
    onMouseLeave={e => {
      (e.currentTarget as HTMLElement).style.borderColor = T.border;
      (e.currentTarget as HTMLElement).style.background = T.surface;
    }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <span style={{
          color: T.textPrimary,
          fontWeight: 600,
          fontSize: 'clamp(0.8rem, 1.5vw, 0.9rem)',
          lineHeight: 1.3,
          flex: 1,
        }}>{item.name}</span>
        <span style={{
          background: statusColor(status),
          color: '#fff',
          fontSize: '0.6rem',
          fontWeight: 700,
          padding: '3px 7px',
          borderRadius: 4,
          whiteSpace: 'nowrap' as const,
          textTransform: 'uppercase' as const,
          letterSpacing: '0.05em',
          flexShrink: 0,
        }}>{status}</span>
      </div>

      <div style={{
        color: T.textMuted,
        fontSize: '0.68rem',
        fontFamily: 'ui-monospace, monospace',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap' as const,
      }}>{item.id}</div>

      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' as const, marginTop: 2 }}>
        <span style={{
          background: T.accentDim,
          color: T.accentText,
          fontSize: '0.65rem',
          padding: '2px 7px',
          borderRadius: 4,
          fontWeight: 600,
          maxWidth: '100%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap' as const,
        }}>{type}</span>
        <span style={{
          background: 'oklch(18% 0 0)',
          color: T.textSecondary,
          fontSize: '0.65rem',
          padding: '2px 7px',
          borderRadius: 4,
          maxWidth: '100%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap' as const,
        }}>{entity}</span>
      </div>

      <div style={{ color: T.textMuted, fontSize: '0.65rem', marginTop: 2 }}>
        Updated {updatedAt}
      </div>
    </article>
  );
}

// ── Skeleton loader ───────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{
      background: T.surface,
      border: `1px solid ${T.border}`,
      borderRadius: 10,
      padding: '1.125rem',
      display: 'flex',
      flexDirection: 'column' as const,
      gap: 10,
    }}>
      {[90, 60, 40].map((w, i) => (
        <div key={i} style={{
          height: i === 0 ? 16 : 12,
          width: `${w}%`,
          background: 'oklch(20% 0 0)',
          borderRadius: 4,
          animation: 'pulse 1.5s ease-in-out infinite',
        }} />
      ))}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function InventoryPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page: String(page), limit: '48' });
      if (search) params.set('search', search);
      const res = await fetch(`${API}/api/v1/items?${params}`);
      if (!res.ok) throw new Error(`API ${res.status}`);
      const data: ApiResponse = await res.json();
      setItems(data.items);
      setTotal(data.total);
      setTotalPages(data.pages);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Connection error');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/v1/items/stats`);
      if (res.ok) setStats(await res.json());
    } catch {}
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const clearSearch = () => {
    setSearch('');
    setSearchInput('');
    setPage(1);
    searchRef.current?.focus();
  };

  const topTypes = stats
    ? Object.entries(stats.by_type).sort((a, b) => b[1] - a[1]).slice(0, 3)
    : [];

  return (
    <>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        * { box-sizing: border-box; }
        body { margin: 0; }
        :focus-visible { outline: 2px solid oklch(60% 0.2 28); outline-offset: 2px; }
        .inv-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(min(100%, 260px), 1fr));
          gap: clamp(8px, 1.5vw, 14px);
        }
        @media (max-width: 480px) {
          .inv-grid { grid-template-columns: 1fr; }
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .search-row { flex-wrap: wrap; }
          .search-row button.refresh { display: none; }
        }
        @media (max-width: 360px) {
          .stats-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <main style={{ minHeight: '100vh', background: T.bg, color: T.textPrimary, fontFamily: 'system-ui, -apple-system, sans-serif' }}>

        {/* ── Header ── */}
        <header style={{
          borderBottom: `1px solid ${T.border}`,
          padding: 'clamp(0.875rem, 2vw, 1.25rem) clamp(1rem, 4vw, 2rem)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          position: 'sticky' as const,
          top: 0,
          background: 'oklch(9% 0 0 / 0.96)',
          backdropFilter: 'blur(8px)',
          zIndex: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 6, height: 28, background: T.accent, borderRadius: 3, flexShrink: 0 }} aria-hidden />
            <div>
              <div style={{
                fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
              }}>ACoolCOLLECTOR</div>
              <div style={{
                fontSize: 'clamp(0.6rem, 1.2vw, 0.7rem)',
                color: T.textSecondary,
                textTransform: 'uppercase' as const,
                letterSpacing: '0.07em',
              }}>Live Inventory</div>
            </div>
          </div>

          <nav aria-label="Site navigation">
            <a href="/" style={{
              color: T.textSecondary,
              fontSize: 'clamp(0.75rem, 1.5vw, 0.85rem)',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '6px 10px',
              borderRadius: 6,
              border: `1px solid ${T.border}`,
              minHeight: 36,
              transition: 'color 150ms',
            }}>← Dashboard</a>
          </nav>
        </header>

        <div style={{
          maxWidth: 1440,
          margin: '0 auto',
          padding: 'clamp(1rem, 3vw, 2rem) clamp(1rem, 4vw, 2rem)',
        }}>

          {/* ── Stats ── */}
          {stats && (
            <div
              className="stats-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 'clamp(8px, 1.5vw, 14px)',
                marginBottom: 'clamp(1rem, 2.5vw, 2rem)',
              }}
              role="region"
              aria-label="Inventory statistics"
            >
              <StatCard label="Total Assets" value={stats.total_items.toLocaleString()} icon={Database} accent="oklch(55% 0.2 28)" />
              <StatCard label="Results" value={total.toLocaleString()} icon={Package} accent={T.blue} />
              <StatCard label="Page" value={`${page} / ${totalPages}`} icon={TrendingUp} accent="oklch(55% 0.18 145)" />
              <StatCard label="Top Type" value={topTypes[0]?.[0] ?? '—'} icon={Package} accent="oklch(50% 0.2 300)" />
            </div>
          )}

          {/* ── Search bar ── */}
          <form
            onSubmit={handleSearch}
            role="search"
            aria-label="Search inventory"
            className="search-row"
            style={{ display: 'flex', gap: 8, marginBottom: 'clamp(1rem, 2vw, 1.5rem)', flexWrap: 'nowrap' as const }}
          >
            <label htmlFor="inv-search" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>
              Search by name or ID
            </label>
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              background: T.surface,
              border: `1px solid ${T.border}`,
              borderRadius: 8,
              padding: '0 0.875rem',
              gap: 8,
              minHeight: 44,
            }}>
              <Search size={15} color={T.textMuted} aria-hidden />
              <input
                id="inv-search"
                ref={searchRef}
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Search by name or ID…"
                autoComplete="off"
                style={{
                  flex: 1,
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  color: T.textPrimary,
                  fontSize: 'clamp(0.85rem, 1.5vw, 0.95rem)',
                  padding: '0',
                  minHeight: 44,
                }}
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={clearSearch}
                  aria-label="Clear search"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 4,
                    display: 'flex',
                    color: T.textMuted,
                    borderRadius: 4,
                    minWidth: 28,
                    minHeight: 28,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <X size={14} aria-hidden />
                </button>
              )}
            </div>

            <button
              type="submit"
              style={{
                background: T.accent,
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '0 clamp(0.875rem, 2.5vw, 1.5rem)',
                fontWeight: 700,
                fontSize: 'clamp(0.82rem, 1.5vw, 0.9rem)',
                cursor: 'pointer',
                minHeight: 44,
                whiteSpace: 'nowrap' as const,
                transition: 'opacity 150ms',
              }}
            >
              Search
            </button>

            <button
              type="button"
              onClick={fetchItems}
              aria-label="Refresh results"
              className="refresh"
              style={{
                background: T.surface,
                border: `1px solid ${T.border}`,
                borderRadius: 8,
                padding: '0 12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 44,
                minWidth: 44,
                color: T.textSecondary,
                transition: 'border-color 150ms',
              }}
            >
              <RefreshCw size={15} aria-hidden style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            </button>
          </form>

          {/* ── Active search indicator ── */}
          {search && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: '1rem',
              fontSize: '0.82rem',
              color: T.textSecondary,
            }}>
              <span>Showing results for <strong style={{ color: T.accentText }}>"{search}"</strong> — {total.toLocaleString()} found</span>
              <button
                type="button"
                onClick={clearSearch}
                style={{
                  background: 'none',
                  border: `1px solid ${T.border}`,
                  color: T.textSecondary,
                  borderRadius: 5,
                  padding: '2px 8px',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  minHeight: 28,
                }}
              >Clear</button>
            </div>
          )}

          {/* ── Error ── */}
          {error && (
            <div
              role="alert"
              style={{
                background: 'oklch(20% 0.15 15)',
                border: `1px solid oklch(40% 0.2 15)`,
                borderRadius: 8,
                padding: 'clamp(0.75rem, 2vw, 1rem)',
                marginBottom: '1rem',
                color: 'oklch(75% 0.15 15)',
                fontSize: '0.88rem',
              }}
            >
              <strong>Cannot reach AI Engine:</strong> {error} — ensure <code style={{ background: 'oklch(25% 0 0)', padding: '1px 5px', borderRadius: 3 }}>acool_ai_engine</code> is running on port 8000.
            </div>
          )}

          {/* ── Grid ── */}
          <section aria-label="Inventory items" aria-busy={loading}>
            {loading ? (
              <div className="inv-grid">
                {Array.from({ length: 12 }, (_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : items.length === 0 && !error ? (
              <div style={{
                textAlign: 'center' as const,
                padding: 'clamp(3rem, 8vw, 5rem) 1rem',
                color: T.textMuted,
              }}>
                <Package size={40} aria-hidden style={{ marginBottom: 16, opacity: 0.4 }} />
                <p style={{ margin: 0, fontSize: '0.95rem' }}>
                  {search ? `No assets found for "${search}"` : 'No assets in inventory'}
                </p>
              </div>
            ) : (
              <div className="inv-grid">
                {items.map(item => <ItemCard key={item.id} item={item} />)}
              </div>
            )}
          </section>

          {/* ── Pagination ── */}
          {totalPages > 1 && (
            <nav
              aria-label="Pagination"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                marginTop: 'clamp(1.5rem, 3vw, 2.5rem)',
                flexWrap: 'wrap' as const,
              }}
            >
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                aria-label="Previous page"
                style={{
                  background: T.surface,
                  border: `1px solid ${T.border}`,
                  borderRadius: 8,
                  padding: '0 clamp(0.75rem, 2vw, 1rem)',
                  cursor: page <= 1 ? 'not-allowed' : 'pointer',
                  opacity: page <= 1 ? 0.4 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  color: T.textPrimary,
                  fontSize: 'clamp(0.8rem, 1.5vw, 0.88rem)',
                  minHeight: 44,
                  transition: 'opacity 150ms',
                }}
              >
                <ChevronLeft size={15} aria-hidden /> Prev
              </button>

              <span style={{
                color: T.textSecondary,
                fontSize: 'clamp(0.78rem, 1.4vw, 0.88rem)',
                minWidth: 120,
                textAlign: 'center' as const,
              }}>
                Page <strong style={{ color: T.textPrimary }}>{page}</strong> of {totalPages}
                <span style={{ display: 'block', fontSize: '0.72rem', color: T.textMuted }}>
                  {total.toLocaleString()} total assets
                </span>
              </span>

              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                aria-label="Next page"
                style={{
                  background: T.surface,
                  border: `1px solid ${T.border}`,
                  borderRadius: 8,
                  padding: '0 clamp(0.75rem, 2vw, 1rem)',
                  cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                  opacity: page >= totalPages ? 0.4 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  color: T.textPrimary,
                  fontSize: 'clamp(0.8rem, 1.5vw, 0.88rem)',
                  minHeight: 44,
                  transition: 'opacity 150ms',
                }}
              >
                Next <ChevronRight size={15} aria-hidden />
              </button>
            </nav>
          )}
        </div>
      </main>
    </>
  );
}
