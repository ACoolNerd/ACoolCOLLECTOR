'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Package, TrendingUp, Database, RefreshCw, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

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

function StatCard({ label, value, icon: Icon, accent }: { label: string; value: string | number; icon: React.ElementType; accent: string }) {
  return (
    <div style={{ background: 'oklch(14% 0 0)', border: '1px solid oklch(22% 0 0)', borderRadius: 12, padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <div style={{ background: accent, borderRadius: 8, padding: 10, display: 'flex' }}>
        <Icon size={20} color="#fff" />
      </div>
      <div>
        <div style={{ color: 'oklch(50% 0 0)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>{label}</div>
        <div style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 700, lineHeight: 1.2 }}>{value}</div>
      </div>
    </div>
  );
}

function ItemCard({ item }: { item: Item }) {
  const attrs = item.attributes || {};
  const status = String(attrs.status || 'CONFIRMED');
  const entity = String(attrs.entity || 'ACool Ecosystem');
  const type = String(attrs.type || item.categoryId || 'CollectorAsset');
  const updatedAt = attrs.updatedAt ? new Date(String(attrs.updatedAt)).toLocaleDateString() : '—';

  const statusColor = status === 'CONFIRMED' ? 'oklch(65% 0.2 145)' : status === 'PENDING' ? 'oklch(70% 0.18 80)' : 'oklch(60% 0.0 0)';

  return (
    <div style={{
      background: 'oklch(14% 0 0)',
      border: '1px solid oklch(20% 0 0)',
      borderRadius: 10,
      padding: '1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      transition: 'border-color 150ms ease',
      cursor: 'default',
    }}
    onMouseEnter={e => (e.currentTarget.style.borderColor = 'oklch(35% 0.18 28)')}
    onMouseLeave={e => (e.currentTarget.style.borderColor = 'oklch(20% 0 0)')}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <span style={{ color: '#fff', fontWeight: 600, fontSize: '0.88rem', lineHeight: 1.3, flex: 1 }}>{item.name}</span>
        <span style={{ background: statusColor, color: '#fff', fontSize: '0.65rem', fontWeight: 700, padding: '2px 7px', borderRadius: 4, whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{status}</span>
      </div>
      <div style={{ color: 'oklch(48% 0 0)', fontSize: '0.72rem', fontFamily: 'monospace' }}>{item.id}</div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 2 }}>
        <span style={{ background: 'oklch(20% 0.12 28)', color: 'oklch(72% 0.18 28)', fontSize: '0.68rem', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>{type}</span>
        <span style={{ background: 'oklch(18% 0 0)', color: 'oklch(55% 0 0)', fontSize: '0.68rem', padding: '2px 8px', borderRadius: 4 }}>{entity}</span>
      </div>
      <div style={{ color: 'oklch(38% 0 0)', fontSize: '0.68rem', marginTop: 2 }}>Updated {updatedAt}</div>
    </div>
  );
}

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

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page: String(page), limit: '48' });
      if (search) params.set('search', search);
      const res = await fetch(`${API}/api/v1/items?${params}`);
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data: ApiResponse = await res.json();
      setItems(data.items);
      setTotal(data.total);
      setTotalPages(data.pages);
    } catch (e) {
      setError(String(e));
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

  const accentOrange = 'oklch(60% 0.2 28)';

  return (
    <main style={{ minHeight: '100vh', background: 'oklch(9% 0 0)', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <header style={{ borderBottom: '1px solid oklch(18% 0 0)', padding: '1.25rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 8, height: 32, background: accentOrange, borderRadius: 4 }} />
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, letterSpacing: '-0.02em' }}>ACoolCOLLECTOR</div>
            <div style={{ fontSize: '0.72rem', color: 'oklch(48% 0 0)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Live Inventory · ACool Ecosystem</div>
          </div>
        </div>
        <a href="/" style={{ color: 'oklch(48% 0 0)', fontSize: '0.82rem', textDecoration: 'none' }}>← Dashboard</a>
      </header>

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '2rem' }}>
        {/* Stats */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: '2rem' }}>
            <StatCard label="Total Assets" value={stats.total_items.toLocaleString()} icon={Database} accent="oklch(55% 0.2 28)" />
            <StatCard label="This Page" value={items.length} icon={Package} accent="oklch(50% 0.2 250)" />
            <StatCard label="Search Results" value={total.toLocaleString()} icon={Filter} accent="oklch(55% 0.18 145)" />
            <StatCard label="Pages" value={totalPages} icon={TrendingUp} accent="oklch(50% 0.2 300)" />
          </div>
        )}

        {/* Search Bar */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 12, marginBottom: '1.5rem' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: 'oklch(14% 0 0)', border: '1px solid oklch(22% 0 0)', borderRadius: 8, padding: '0 1rem', gap: 10 }}>
            <Search size={16} color="oklch(40% 0 0)" />
            <input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Search by name or ID..."
              style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#fff', fontSize: '0.9rem', padding: '0.75rem 0' }}
            />
          </div>
          <button type="submit" style={{ background: accentOrange, color: '#fff', border: 'none', borderRadius: 8, padding: '0 1.5rem', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer' }}>
            Search
          </button>
          {search && (
            <button type="button" onClick={() => { setSearch(''); setSearchInput(''); setPage(1); }}
              style={{ background: 'oklch(20% 0 0)', color: 'oklch(60% 0 0)', border: '1px solid oklch(25% 0 0)', borderRadius: 8, padding: '0 1rem', cursor: 'pointer', fontSize: '0.82rem' }}>
              Clear
            </button>
          )}
          <button type="button" onClick={fetchItems} style={{ background: 'oklch(18% 0 0)', border: '1px solid oklch(25% 0 0)', borderRadius: 8, padding: '0 0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <RefreshCw size={16} color="oklch(55% 0 0)" />
          </button>
        </form>

        {/* Error */}
        {error && (
          <div style={{ background: 'oklch(20% 0.15 15)', border: '1px solid oklch(40% 0.2 15)', borderRadius: 8, padding: '1rem', marginBottom: '1rem', color: 'oklch(75% 0.15 15)', fontSize: '0.88rem' }}>
            Could not reach AI Engine: {error} — make sure <code>acool_ai_engine</code> is running on port 8000.
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'oklch(40% 0 0)' }}>Loading {total > 0 ? total.toLocaleString() : ''} assets...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12, marginBottom: '2rem' }}>
            {items.map(item => <ItemCard key={item.id} item={item} />)}
            {items.length === 0 && !error && (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', color: 'oklch(40% 0 0)' }}>
                No assets found{search ? ` for "${search}"` : ''}.
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
              style={{ background: 'oklch(16% 0 0)', border: '1px solid oklch(24% 0 0)', borderRadius: 8, padding: '0.5rem 1rem', cursor: page <= 1 ? 'not-allowed' : 'pointer', opacity: page <= 1 ? 0.4 : 1, display: 'flex', alignItems: 'center', gap: 4, color: '#fff' }}>
              <ChevronLeft size={16} /> Prev
            </button>
            <span style={{ color: 'oklch(55% 0 0)', fontSize: '0.88rem' }}>Page {page} of {totalPages} · {total.toLocaleString()} assets</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
              style={{ background: 'oklch(16% 0 0)', border: '1px solid oklch(24% 0 0)', borderRadius: 8, padding: '0.5rem 1rem', cursor: page >= totalPages ? 'not-allowed' : 'pointer', opacity: page >= totalPages ? 0.4 : 1, display: 'flex', alignItems: 'center', gap: 4, color: '#fff' }}>
              Next <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
