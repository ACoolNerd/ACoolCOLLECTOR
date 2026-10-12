'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Award, Box, DollarSign, Calculator, Eye, BookOpen, 
  Search, ShieldAlert, Plus, Trash2, Copy, Check, ExternalLink, ShieldCheck, HelpCircle
} from 'lucide-react';

// Structured static market data (English Comps)
const SERIAL_CARDS = [
  {
    id: 'OP07-109',
    name: 'Monkey.D.Luffy Serial (/1000)',
    set: 'OP-07 CS Event Pack',
    rarity: 'CS Promo',
    score: 9.2,
    raw: 2380.39,
    psa9: 15500.00,
    psa10: 18000.00,
    bgs10: 23400.00,
    blackLabel: 117000.00,
    activeAsk: 27999.00,
    seller: 'eBay (cs_cards_us)',
    link: 'https://www.ebay.com/sch/i.html?_nkw=OP07-109+Luffy+Serial',
    buyTarget: 15500.00,
    action: 'BUY TARGET (PSA 9/10 Comp)',
    status: 'Top Tier'
  },
  {
    id: 'OP07-119',
    name: 'Portgas.D.Ace Serial (/1000)',
    set: 'OP-07 Championship',
    rarity: 'Championship Prize',
    score: 9.0,
    raw: 2919.73,
    psa9: 7500.00,
    psa10: 8900.00,
    bgs10: 11570.00,
    blackLabel: 57850.00,
    activeAsk: 9950.00,
    seller: 'Double Infinity / TCGplayer',
    link: 'https://www.tcgplayer.com/product/550212/one-piece-card-game-championship-promos-portgasdace-serial-number-card',
    buyTarget: 2920.00,
    action: 'PRIMARY TARGET (Best Liquidity)',
    status: 'Primary Target'
  },
  {
    id: 'ST01-001',
    name: 'Monkey.D.Luffy Serial (/700)',
    set: 'ST-01 Starter Deck CS',
    rarity: 'CS Winner Promo',
    score: 8.9,
    raw: 30900.00,
    psa9: 25000.00,
    psa10: 29993.75,
    bgs10: 38992.00,
    blackLabel: 194960.00,
    activeAsk: 100000.00,
    seller: 'TCGplayer / SNKRDUNK',
    link: 'https://www.tcgplayer.com/product/506929/one-piece-card-game-championship-promos-monkeydluffy-serial-number-card',
    buyTarget: 25000.00,
    action: 'GRAIL HOLD (Strict proof required)',
    status: 'Grail'
  },
  {
    id: 'EB04-061',
    name: 'Monkey.D.Luffy Serial',
    set: 'EB-04 Regional 26-27',
    rarity: 'Top 8 Regional Prize',
    score: 8.6,
    raw: 15227.00,
    psa9: 45000.00,
    psa10: 75000.00,
    bgs10: 55000.00,
    blackLabel: 250000.00,
    activeAsk: 75000.00,
    seller: 'eBay (Cleaning.Out.My.Closet)',
    link: 'https://www.ebay.com/itm/377134185689',
    buyTarget: 14000.00,
    action: 'SPECULATIVE BUY (Negotiate offer)',
    status: 'Speculative'
  },
  {
    id: 'OP12-020',
    name: 'Roronoa Zoro Serial (/1000)',
    set: 'OP-12 Championship',
    rarity: 'Championship Prize',
    score: 7.8,
    raw: 6400.00,
    psa9: 8000.00,
    psa10: 9700.00,
    bgs10: 12000.00,
    blackLabel: 60000.00,
    activeAsk: 9700.00,
    seller: 'Double Infinity / eBay',
    link: 'https://www.ebay.com/sch/i.html?_nkw=OP12-020+Zoro+Serial',
    buyTarget: 6000.00,
    action: 'HOLD (Verify English language)',
    status: 'Hold'
  },
  {
    id: 'EB02-006',
    name: 'Yamato Serial Numbered',
    set: 'EB-02 Grand Battle',
    rarity: 'Finalist Prize',
    score: 7.3,
    raw: 3200.00,
    psa9: 4000.00,
    psa10: 4799.97,
    bgs10: 6000.00,
    blackLabel: 30000.00,
    activeAsk: 4799.97,
    seller: 'TCGplayer / SNKRDUNK',
    link: 'https://www.tcgplayer.com/product/551239/one-piece-card-game-championship-promos-yamato-serial-number-card',
    buyTarget: 3000.00,
    action: 'PASS FOR NOW (Thin liquidity)',
    status: 'Pass'
  },
  {
    id: 'OP01-120',
    name: 'Shanks Championship Serial (/1000)',
    set: 'OP-01 Championship 2023',
    rarity: 'Championship Prize',
    score: 7.1,
    raw: 2538.70,
    psa9: 7800.00,
    psa10: 9490.69,
    bgs10: 13437.70,
    blackLabel: 67189.00,
    activeAsk: 100000.00,
    seller: 'TCGplayer (Inflated Ask)',
    link: 'https://www.tcgplayer.com/product/506923/one-piece-card-game-championship-promos-shanks-serial-number-card',
    buyTarget: 2500.00,
    action: 'DO NOT CHASE AT $100K ASK',
    status: 'Avoid'
  }
];

const SEALED_BOXES = [
  { set: 'OP-01', name: 'Romance Dawn (Blue Bottom - Wave 1)', tier: 'Grail', buyTarget: 5000, currentPrice: 5500, roi12m: 45, status: 'Low Risk / Grail' },
  { set: 'OP-01', name: 'Romance Dawn (White Bottom - Reprint)', tier: 'Core', buyTarget: 1100, currentPrice: 1300, roi12m: 30, status: 'Medium Risk' },
  { set: 'OP-02', name: 'Paramount War Box', tier: 'Core', buyTarget: 300, currentPrice: 350, roi12m: 25, status: 'Low Risk' },
  { set: 'OP-03', name: 'Pillars of Strength Box', tier: 'Core', buyTarget: 220, currentPrice: 260, roi12m: 20, status: 'Low Risk' },
  { set: 'OP-04', name: 'Kingdoms of Intrigue Box', tier: 'Entry', buyTarget: 160, currentPrice: 190, roi12m: 15, status: 'Medium Risk' },
  { set: 'OP-05', name: 'Awakening of the New Era Box', tier: 'Core', buyTarget: 320, currentPrice: 380, roi12m: 35, status: 'Low Risk' },
  { set: 'OP-06', name: 'Wings of the Captain Box', tier: 'Entry', buyTarget: 200, currentPrice: 240, roi12m: 18, status: 'Medium Risk' },
  { set: 'OP-07', name: '500 Years in the Future Box', tier: 'Core', buyTarget: 220, currentPrice: 260, roi12m: 22, status: 'Low Risk' },
  { set: 'OP-08', name: 'Two Legends Box', tier: 'Entry', buyTarget: 180, currentPrice: 210, roi12m: 15, status: 'Medium Risk' },
  { set: 'OP-09', name: 'New Genesis Box', tier: 'Core', buyTarget: 170, currentPrice: 195, roi12m: 20, status: 'Medium Risk' }
];

const GRADING_COSTS = [
  { service: 'PSA', tier: 'Value Bulk', cost: 25, time: '140-160 Days', minQty: '10 Cards (Collectors Club)' },
  { service: 'PSA', tier: 'Regular', cost: 75, time: '40-50 Days', minQty: '1 Card' },
  { service: 'PSA', tier: 'Express', cost: 150, time: '20-30 Days', minQty: '1 Card' },
  { service: 'BGS', tier: 'Base (No Sub)', cost: 22, time: '75+ Days', minQty: '1 Card' },
  { service: 'BGS', tier: 'Standard (With Sub)', cost: 40, time: '45 Days', minQty: '1 Card' },
  { service: 'BGS', tier: 'Express', cost: 80, time: '15 Days', minQty: '1 Card' },
  { service: 'BGS', tier: 'Premium', cost: 250, time: '5 Days', minQty: '1 Card' },
  { service: 'CGC', tier: 'Bulk', cost: 15, time: '60-120 Days', minQty: '25 Cards' },
  { service: 'CGC', tier: 'Standard', cost: 35, time: '30 Days', minQty: '1 Card' },
  { service: 'CGC', tier: 'Express', cost: 75, time: '15 Days', minQty: '1 Card' },
  { service: 'TAG', tier: 'Basic', cost: 22, time: '45 Days', minQty: '1 Card' },
  { service: 'TAG', tier: 'Standard', cost: 39, time: '30 Days', minQty: '1 Card' },
  { service: 'TAG', tier: 'Express', cost: 59, time: '15 Days', minQty: '1 Card' }
];

const SELLERS = [
  { name: 'Cleaning.Out.My.Closet (eBay)', feedback: '100% Positive', sales: '1,773', specialize: 'Championship Serials', risk: 'Low', speed: '2-4 Days' },
  { name: 'Double Infinity Gaming', feedback: 'Trusted Storefront', sales: '10,000+', specialize: 'Top Prize Singles / Pre-orders', risk: 'Low', speed: '1-3 Days' },
  { name: 'SNKRDUNK Global', feedback: 'Certified Authentication', sales: '50,000+', specialize: 'Japanese & English Sealed Comps', risk: 'Low-Medium', speed: '5-8 Days (verification lag)' },
  { name: 'TCGPlayer Direct Venders', feedback: '99.8% Combined', sales: '100,000+', specialize: 'Raw Singles / Near Mint Cards', risk: 'Medium-Low', speed: '3-5 Days' }
];

const METADECK_LINKS = [
  { name: 'Limitless TCG One Piece', url: 'https://onepiece.limitlesstcg.com', desc: 'Real-time tournament decklists, meta percentage shares, and top leaders (Purple Enel, Blue/Yellow Nami, Red/Blue Ace).' },
  { name: 'GumGum.gg', url: 'https://gumgum.gg', desc: 'Format separation (Eastern vs. Western formats) showing winning lists from Japan and global regionals.' },
  { name: 'OnePieceTopDecks', url: 'https://onepiecetopdecks.com', desc: 'Ban list alerts, format trackers, and catalog of winning regionals tournament sheets.' },
  { name: 'OnePiece.gg', url: 'https://onepiece.gg', desc: 'Integrated deck builder, tier lists, card search catalog, and live price charting.' },
  { name: 'TheEgman (YouTube)', url: 'https://www.youtube.com/@TheEgman', desc: 'Event breakdowns, top-cut data distributions, match statistics, and meta analytics commentary.' }
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Dynamic Portfolio State
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [newAsset, setNewAsset] = useState({ name: 'OP07-119 Ace Serial', type: 'Serial Card', buyPrice: '', marketPrice: '', qty: '1', grade: 'Raw' });

  // ROI Calculator State
  const [roiInput, setRoiInput] = useState({ rawPrice: 2920, targetValue: 8900, service: 'PSA', tier: 'Regular' });
  const [roiResult, setRoiResult] = useState<any>(null);

  // Startup Checklist State
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Load portfolio from localStorage
    const savedPortfolio = localStorage.getItem('acool_portfolio');
    if (savedPortfolio) {
      setPortfolio(JSON.parse(savedPortfolio));
    } else {
      const defaultPortfolio = [
        { id: '1', name: 'Portgas.D.Ace (OP07-119) Serial', type: 'Serial Card', buyPrice: 2920, marketPrice: 8900, qty: 1, grade: 'PSA 10' },
        { id: '2', name: 'Romance Dawn (OP-01) Blue Bottom Box', type: 'Sealed Box', buyPrice: 5000, marketPrice: 5500, qty: 1, grade: 'Sealed' }
      ];
      setPortfolio(defaultPortfolio);
      localStorage.setItem('acool_portfolio', JSON.stringify(defaultPortfolio));
    }

    // Load checklist state
    const savedChecklist = localStorage.getItem('acool_checklist');
    if (savedChecklist) {
      setChecklist(JSON.parse(savedChecklist));
    } else {
      const defaultChecklist = {
        'setup-1': true,
        'setup-2': true,
        'setup-3': false,
        'research-1': false,
        'research-2': false,
        'purchase-1': false,
        'purchase-2': false,
        'scale-1': false,
      };
      setChecklist(defaultChecklist);
      localStorage.setItem('acool_checklist', JSON.stringify(defaultChecklist));
    }
  }, []);

  // Update localStorage helper
  const savePortfolioToStorage = (newPortfolio: any[]) => {
    setPortfolio(newPortfolio);
    localStorage.setItem('acool_portfolio', JSON.stringify(newPortfolio));
  };

  // Portfolio actions
  const handleAddAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAsset.buyPrice || !newAsset.marketPrice) return;
    const added = {
      id: Date.now().toString(),
      name: newAsset.name,
      type: newAsset.type,
      buyPrice: parseFloat(newAsset.buyPrice),
      marketPrice: parseFloat(newAsset.marketPrice),
      qty: parseInt(newAsset.qty) || 1,
      grade: newAsset.grade
    };
    const updated = [...portfolio, added];
    savePortfolioToStorage(updated);
    setNewAsset({ name: 'OP07-119 Ace Serial', type: 'Serial Card', buyPrice: '', marketPrice: '', qty: '1', grade: 'Raw' });
  };

  const handleDeleteAsset = (id: string) => {
    const updated = portfolio.filter(item => item.id !== id);
    savePortfolioToStorage(updated);
  };

  // Toggle checklist
  const handleToggleChecklist = (key: string) => {
    const updated = { ...checklist, [key]: !checklist[key] };
    setChecklist(updated);
    localStorage.setItem('acool_checklist', JSON.stringify(updated));
  };

  // Copy template helper
  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Direct calculation fallback
  const handleCalculateROI = (e: React.FormEvent) => {
    e.preventDefault();
    const serviceFees: Record<string, Record<string, number>> = {
      PSA: { 'Value Bulk': 25, Regular: 75, Express: 150 },
      BGS: { 'Base (No Sub)': 22, 'Standard (With Sub)': 40, Express: 80, Premium: 250 },
      CGC: { Bulk: 15, Standard: 35, Express: 75 },
      TAG: { Basic: 22, Standard: 39, Express: 59 }
    };

    const fee = serviceFees[roiInput.service]?.[roiInput.tier] || 75;
    const rawCost = Number(roiInput.rawPrice) || 0;
    const targetVal = Number(roiInput.targetValue) || 0;

    const totalInvestment = rawCost + fee;
    const netProfit = targetVal - totalInvestment;
    const roiPercentage = totalInvestment > 0 ? (netProfit / totalInvestment) * 100 : 0;

    setRoiResult({
      fee,
      totalInvestment,
      netProfit,
      roiPercentage: roiPercentage.toFixed(2),
      recommendation: roiPercentage > 20 ? '👑 BUY & GRADE (ROI > 20%)' : '⚠️ HOLD / PASS (Low margin)'
    });
  };

  // Calculate dynamic stats
  const totalCost = portfolio.reduce((acc, item) => acc + (item.buyPrice * item.qty), 0);
  const currentVal = portfolio.reduce((acc, item) => acc + (item.marketPrice * item.qty), 0);
  const totalGain = currentVal - totalCost;
  const totalROI = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;

  // Checklist confidence score
  const totalChecklistItems = Object.keys(checklist).length;
  const completedChecklistItems = Object.values(checklist).filter(Boolean).length;
  const confidenceScore = totalChecklistItems > 0 ? 7.0 + (completedChecklistItems / totalChecklistItems) * 2.9 : 7.0;

  // Filter cards
  const filteredCards = SERIAL_CARDS.filter(card => 
    card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.set.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dashboard-wrapper">
      {/* Header Panel */}
      <header className="dashboard-header">
        <div className="header-title-group">
          <h1>ACool COLLECTOR</h1>
          <p>One Piece English Serial & Sealed Box Investment Ecosystem</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div className="header-badge">
            ⚡ Queen Energy: ACTIVE
          </div>
          <div className="header-badge" style={{ borderColor: 'hsl(var(--green-neon))', color: 'hsl(var(--green-neon))', boxShadow: '0 0 15px var(--green-glow)' }}>
            👑 Confidence Score: {confidenceScore.toFixed(1)}/10
          </div>
        </div>
      </header>

      {/* Tabs Menu */}
      <nav className="tabs-header">
        <button className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
          📊 Overview & Tracker
        </button>
        <button className={`tab-btn ${activeTab === 'serialized' ? 'active' : ''}`} onClick={() => setActiveTab('serialized')}>
          🏆 Serialized Prize Cards
        </button>
        <button className={`tab-btn ${activeTab === 'boxes' ? 'active' : ''}`} onClick={() => setActiveTab('boxes')}>
          📦 Sealed Booster Boxes
        </button>
        <button className={`tab-btn ${activeTab === 'grading' ? 'active' : ''}`} onClick={() => setActiveTab('grading')}>
          🎴 Grading Simulator
        </button>
        <button className={`tab-btn ${activeTab === 'watchlist' ? 'active' : ''}`} onClick={() => setActiveTab('watchlist')}>
          👥 Seller Outreach
        </button>
        <button className={`tab-btn ${activeTab === 'strategy' ? 'active' : ''}`} onClick={() => setActiveTab('strategy')}>
          💡 Investment Strategy
        </button>
        <button className={`tab-btn ${activeTab === 'checklist' ? 'active' : ''}`} onClick={() => setActiveTab('checklist')}>
          📋 30-Day Startup Plan
        </button>
      </nav>

      {/* SEARCH BAR FOR GLOBAL UTILITY */}
      {activeTab !== 'dashboard' && activeTab !== 'strategy' && activeTab !== 'checklist' && (
        <div className="glass-card" style={{ marginBottom: '2rem', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Search size={20} color="hsl(var(--text-muted))" />
          <input 
            type="text" 
            placeholder="Search cards, sets, or serial tags..." 
            className="glass-input" 
            style={{ border: 'none', background: 'transparent', padding: '0.5rem 0' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      )}

      {/* TAB CONTENT */}

      {/* 1. OVERVIEW & PORTFOLIO TRACKER */}
      {activeTab === 'dashboard' && (
        <section>
          {/* KPI Dashboard */}
          <div className="grid-kpis">
            <div className="glass-card kpi-card gold">
              <div className="kpi-info">
                <h3>Total Portfolio Cost</h3>
                <div className="kpi-value gold">${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <div className="kpi-change" style={{ color: 'hsl(var(--text-muted))' }}>Acquisition cost basis</div>
              </div>
              <div className="kpi-icon"><DollarSign size={24} /></div>
            </div>

            <div className="glass-card kpi-card green">
              <div className="kpi-info">
                <h3>Current Market Value</h3>
                <div className="kpi-value green">${currentVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <div className="kpi-change" style={{ color: 'hsl(var(--green-neon))' }}>
                  Profit/Loss: +${totalGain.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
              <div className="kpi-icon"><TrendingUp size={24} /></div>
            </div>

            <div className="glass-card kpi-card blue">
              <div className="kpi-info">
                <h3>Total Yield (ROI)</h3>
                <div className="kpi-value blue">{totalROI.toFixed(2)}%</div>
                <div className="kpi-change" style={{ color: 'hsl(var(--blue-neon))' }}>Portfolio growth multiplier</div>
              </div>
              <div className="kpi-icon"><Award size={24} /></div>
            </div>

            <div className="glass-card kpi-card red">
              <div className="kpi-info">
                <h3>Primary Investment Target</h3>
                <div className="kpi-value red">OP07-119 Ace</div>
                <div className="kpi-change" style={{ color: 'hsl(var(--red-neon))' }}>Buy target: $2.9K raw</div>
              </div>
              <div className="kpi-icon"><Eye size={24} /></div>
            </div>
          </div>

          <div className="grid-two-col">
            {/* Portfolio Holdings */}
            <div className="glass-card">
              <div className="section-title-group" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2>Holdings Vault</h2>
                  <p>Your current physical assets, graded slabs, and sealed positions</p>
                </div>
                <div className="badge gold">PERSISTENT STATE</div>
              </div>

              {portfolio.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 0', color: 'hsl(var(--text-muted))' }}>
                  <Box size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                  <p>Your vault is empty. Use the registration panel to manifest your holdings.</p>
                </div>
              ) : (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Asset Name</th>
                        <th>Type</th>
                        <th>Grade</th>
                        <th>Cost Basis</th>
                        <th>Market Value</th>
                        <th>Unrealized ROI</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {portfolio.map(item => {
                        const cost = item.buyPrice * item.qty;
                        const value = item.marketPrice * item.qty;
                        const gain = value - cost;
                        const itemRoi = cost > 0 ? (gain / cost) * 100 : 0;
                        return (
                          <tr key={item.id}>
                            <td>
                              <div className="card-title-cell">
                                <Box size={16} color="hsl(var(--gold-primary))" />
                                <div>
                                  {item.name}
                                  <span className="card-subtitle-cell">Qty: {item.qty}</span>
                                </div>
                              </div>
                            </td>
                            <td>{item.type}</td>
                            <td>
                              <span className={`badge ${item.grade.includes('10') ? 'green' : item.grade.includes('9') ? 'blue' : 'gold'}`}>
                                {item.grade}
                              </span>
                            </td>
                            <td>${cost.toLocaleString()}</td>
                            <td>${value.toLocaleString()}</td>
                            <td>
                              <span style={{ color: gain >= 0 ? 'hsl(var(--green-neon))' : 'hsl(var(--red-neon))', fontWeight: 'bold' }}>
                                {gain >= 0 ? '+' : ''}{itemRoi.toFixed(1)}%
                              </span>
                            </td>
                            <td>
                              <button className="btn btn-danger btn-sm" onClick={() => handleDeleteAsset(item.id)} title="Delete Asset" aria-label="Delete Asset">
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Asset Manifestation Form */}
            <div className="glass-card">
              <div className="section-title-group">
                <h2>Manifest Asset</h2>
                <p>Register a new purchase into your tracker</p>
              </div>

              <form onSubmit={handleAddAsset}>
                <div className="form-group">
                  <label htmlFor="asset-name-select" className="form-label">Asset Name</label>
                  <select 
                    id="asset-name-select"
                    title="Asset Name"
                    className="glass-input"
                    value={newAsset.name}
                    onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                  >
                    <option value="Portgas.D.Ace (OP07-119) Serial">Portgas.D.Ace (OP07-119) Serial</option>
                    <option value="Monkey.D.Luffy (OP07-109) Serial">Monkey.D.Luffy (OP07-109) Serial</option>
                    <option value="Monkey.D.Luffy (ST01-001) Serial">Monkey.D.Luffy (ST01-001) Serial</option>
                    <option value="Monkey.D.Luffy (EB04-061) Serial">Monkey.D.Luffy (EB04-061) Serial</option>
                    <option value="Roronoa Zoro (OP12-020) Serial">Roronoa Zoro (OP12-020) Serial</option>
                    <option value="Yamato (EB02-006) Serial">Yamato (EB02-006) Serial</option>
                    <option value="Shanks (OP01-120) Serial">Shanks (OP01-120) Serial</option>
                    <option value="Romance Dawn (OP-01) Blue Bottom Box">Romance Dawn (OP-01) Blue Bottom Box</option>
                    <option value="Romance Dawn (OP-01) White Bottom Box">Romance Dawn (OP-01) White Bottom Box</option>
                    <option value="Paramount War (OP-02) Box">Paramount War (OP-02) Box</option>
                    <option value="Pillars of Strength (OP-03) Box">Pillars of Strength (OP-03) Box</option>
                    <option value="Awakening of the New Era (OP-05) Box">Awakening of the New Era (OP-05) Box</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="asset-type-select" className="form-label">Asset Type</label>
                  <select 
                    id="asset-type-select"
                    title="Asset Type"
                    className="glass-input"
                    value={newAsset.type}
                    onChange={(e) => setNewAsset({ ...newAsset, type: e.target.value })}
                  >
                    <option value="Serial Card">Serialized TCG Card</option>
                    <option value="Sealed Box">Sealed Booster Box</option>
                    <option value="Other TCG">Other Collection Asset</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="asset-grade-select" className="form-label">Condition / Grade</label>
                  <select 
                    id="asset-grade-select"
                    title="Condition or Grade"
                    className="glass-input"
                    value={newAsset.grade}
                    onChange={(e) => setNewAsset({ ...newAsset, grade: e.target.value })}
                  >
                    <option value="Raw">Raw / Near Mint</option>
                    <option value="PSA 10">PSA 10 Gem Mint</option>
                    <option value="PSA 9">PSA 9 Mint</option>
                    <option value="BGS 10">BGS 10 Pristine</option>
                    <option value="BGS 9.5">BGS 9.5 Gem Mint</option>
                    <option value="Black Label">BGS Black Label 10</option>
                    <option value="Sealed">Sealed Box</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Your Cost ($)</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 2920" 
                      className="glass-input"
                      value={newAsset.buyPrice}
                      onChange={(e) => setNewAsset({ ...newAsset, buyPrice: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Market Comps ($)</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 8900" 
                      className="glass-input"
                      value={newAsset.marketPrice}
                      onChange={(e) => setNewAsset({ ...newAsset, marketPrice: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Quantity</label>
                  <input 
                    type="number" 
                    placeholder="1" 
                    className="glass-input"
                    value={newAsset.qty}
                    onChange={(e) => setNewAsset({ ...newAsset, qty: e.target.value })}
                  />
                </div>

                <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '0.5rem' }}>
                  <Plus size={18} /> ADD TO HOLDINGS
                </button>
              </form>
            </div>
          </div>
        </section>
      )}

      {/* 2. SERIALIZED PRIZE CARDS TABLE */}
      {activeTab === 'serialized' && (
        <section className="glass-card">
          <div className="section-title-group" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2>Championship Serial Number Comps (English Only)</h2>
              <p>Governed TCG database tracking verified English listings. Proxies and Asian comps are strictly excluded.</p>
            </div>
            <div className="badge green">9.0+ Buy Trigger ACTIVE</div>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Rank & ID</th>
                  <th>Card Name / Set</th>
                  <th>Raw Guide</th>
                  <th>PSA 9</th>
                  <th>PSA 10</th>
                  <th>BGS 10 / BL</th>
                  <th>Active Ask</th>
                  <th>Seller</th>
                  <th>Score</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredCards.map((card, idx) => (
                  <tr key={card.id}>
                    <td>
                      <div className="card-title-cell">
                        <span style={{ color: idx < 3 ? 'hsl(var(--gold-primary))' : 'hsl(var(--text-muted))', fontWeight: 'bold', width: '20px' }}>
                          #{idx + 1}
                        </span>
                        <span className="badge gold">{card.id}</span>
                      </div>
                    </td>
                    <td>
                      <span className="card-title-cell">{card.name}</span>
                      <span className="card-subtitle-cell">{card.set} • {card.rarity}</span>
                    </td>
                    <td>${card.raw.toLocaleString()}</td>
                    <td>${card.psa9.toLocaleString()}</td>
                    <td>${card.psa10.toLocaleString()}</td>
                    <td>
                      <span style={{ display: 'block' }}>BGS 10: ${card.bgs10.toLocaleString()}</span>
                      <span style={{ fontSize: '0.75rem', color: 'hsl(var(--red-neon))', fontWeight: 'bold' }}>BL: ${card.blackLabel.toLocaleString()}</span>
                    </td>
                    <td>${card.activeAsk.toLocaleString()}</td>
                    <td>{card.seller}</td>
                    <td>
                      <span className={`badge ${card.score >= 9.0 ? 'green' : card.score >= 8.0 ? 'blue' : 'gold'}`}>
                        {card.score} / 10
                      </span>
                    </td>
                    <td>
                      <a href={card.link} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm" style={{ gap: '0.25rem' }}>
                        Buy <ExternalLink size={12} />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '1.5rem', padding: '1rem', border: '1px solid rgba(255,0,85,0.2)', backgroundColor: 'rgba(255,0,85,0.02)', borderRadius: '8px' }}>
            <h4 style={{ color: 'hsl(var(--red-neon))', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <ShieldAlert size={18} /> High-Value Authentication Rule
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))' }}>
              Do not purchase raw serialized cards online without verified closeups of the printed serial number (e.g. ST01-001 /700 stamp) and escrow/buyer protection. Verify certification numbers directly on PSA/BGS databases before clearing funds.
            </p>
          </div>
        </section>
      )}

      {/* 3. SEALED BOOSTER BOXES TABLE */}
      {activeTab === 'boxes' && (
        <section className="glass-card">
          <div className="section-title-group">
            <h2>Sealed Booster Box Valuations</h2>
            <p>Booster boxes hold index liquidity and serve as the foundation of secure TCG investing.</p>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Set Code</th>
                  <th>Box Name</th>
                  <th>Tier Group</th>
                  <th>Buy Target</th>
                  <th>Current Market</th>
                  <th>Expected 12m ROI</th>
                  <th>Risk Assessment</th>
                  <th>Invest Check</th>
                </tr>
              </thead>
              <tbody>
                {SEALED_BOXES.map((box) => (
                  <tr key={box.name}>
                    <td><span className="badge blue">{box.set}</span></td>
                    <td style={{ color: '#fff', fontWeight: 600 }}>{box.name}</td>
                    <td>
                      <span className={`badge ${box.tier === 'Grail' ? 'red' : box.tier === 'Core' ? 'gold' : 'blue'}`}>
                        {box.tier}
                      </span>
                    </td>
                    <td>${box.buyTarget.toLocaleString()}</td>
                    <td>${box.currentPrice.toLocaleString()}</td>
                    <td style={{ color: 'hsl(var(--green-neon))', fontWeight: 'bold' }}>+{box.roi12m}%</td>
                    <td>{box.status}</td>
                    <td>
                      <span className={`badge ${box.currentPrice <= box.buyTarget * 1.1 ? 'green' : 'gold'}`}>
                        {box.currentPrice <= box.buyTarget * 1.1 ? 'Snipe Target' : 'Hold Range'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* 4. GRADING SIMULATOR & ROI MATRIX */}
      {activeTab === 'grading' && (
        <section className="grid-two-col">
          {/* ROI Simulator Form */}
          <div className="glass-card">
            <div className="section-title-group">
              <h2>Grading Value Simulator</h2>
              <p>Simulate net margins by incorporating standard grading fees and shipping overheads</p>
            </div>

            <form onSubmit={handleCalculateROI}>
              <div className="form-group">
                <label htmlFor="raw-price-input" className="form-label">Raw Card Purchase Price ($)</label>
                <input 
                  id="raw-price-input"
                  title="Raw Card Purchase Price ($)"
                  placeholder="e.g. 2920"
                  type="number" 
                  value={roiInput.rawPrice}
                  onChange={(e) => setRoiInput({ ...roiInput, rawPrice: parseFloat(e.target.value) || 0 })}
                  className="glass-input"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="target-value-input" className="form-label">Expected Graded Price ($)</label>
                <input 
                  id="target-value-input"
                  title="Expected Graded Price ($)"
                  placeholder="e.g. 8900"
                  type="number" 
                  value={roiInput.targetValue}
                  onChange={(e) => setRoiInput({ ...roiInput, targetValue: parseFloat(e.target.value) || 0 })}
                  className="glass-input"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label htmlFor="grading-service-select" className="form-label">Grading Service</label>
                  <select 
                    id="grading-service-select"
                    title="Grading Service"
                    value={roiInput.service}
                    onChange={(e) => setRoiInput({ ...roiInput, service: e.target.value, tier: e.target.value === 'PSA' ? 'Regular' : e.target.value === 'BGS' ? 'Standard (With Sub)' : 'Standard' })}
                    className="glass-input"
                  >
                    <option value="PSA">PSA</option>
                    <option value="BGS">BGS</option>
                    <option value="CGC">CGC</option>
                    <option value="TAG">TAG</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="service-tier-select" className="form-label">Service Tier</label>
                  <select 
                    id="service-tier-select"
                    title="Service Tier"
                    value={roiInput.tier}
                    onChange={(e) => setRoiInput({ ...roiInput, tier: e.target.value })}
                    className="glass-input"
                  >
                    {roiInput.service === 'PSA' && (
                      <>
                        <option value="Value Bulk">Value Bulk ($25)</option>
                        <option value="Regular">Regular ($75)</option>
                        <option value="Express">Express ($150)</option>
                      </>
                    )}
                    {roiInput.service === 'BGS' && (
                      <>
                        <option value="Base (No Sub)">Base No Sub ($22)</option>
                        <option value="Standard (With Sub)">Standard ($40)</option>
                        <option value="Express">Express ($80)</option>
                        <option value="Premium">Premium ($250)</option>
                      </>
                    )}
                    {roiInput.service === 'CGC' && (
                      <>
                        <option value="Bulk">Bulk ($15)</option>
                        <option value="Standard">Standard ($35)</option>
                        <option value="Express">Express ($75)</option>
                      </>
                    )}
                    {roiInput.service === 'TAG' && (
                      <>
                        <option value="Basic">Basic ($22)</option>
                        <option value="Standard">Standard ($39)</option>
                        <option value="Express">Express ($59)</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '1rem' }}>
                <Calculator size={18} /> SIMULATE EQUITY BREAKDOWN
              </button>
            </form>

            {roiResult && (
              <div className="glass-card" style={{ marginTop: '2rem', backgroundColor: '#090910', border: '1px solid rgba(212,168,75,0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ color: 'hsl(var(--text-muted))' }}>Grading Service Fee:</span>
                  <span>${roiResult.fee}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ color: 'hsl(var(--text-muted))' }}>Total Cost Basis:</span>
                  <span>${roiResult.totalInvestment}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ color: 'hsl(var(--text-muted))' }}>Net Profit Margins:</span>
                  <span style={{ color: roiResult.netProfit >= 0 ? 'hsl(var(--green-neon))' : 'hsl(var(--red-neon))', fontWeight: 'bold' }}>
                    ${roiResult.netProfit.toLocaleString()}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <span style={{ color: 'hsl(var(--text-muted))' }}>Simulated ROI:</span>
                  <span style={{ color: roiResult.roiPercentage >= 20 ? 'hsl(var(--green-neon))' : 'hsl(var(--red-neon))', fontWeight: 'bold' }}>
                    {roiResult.roiPercentage}%
                  </span>
                </div>
                <div style={{ textAlign: 'center', padding: '0.5rem', borderRadius: '4px', fontWeight: 'bold', backgroundColor: roiResult.roiPercentage >= 20 ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 0, 85, 0.1)', color: roiResult.roiPercentage >= 20 ? 'hsl(var(--green-neon))' : 'hsl(var(--red-neon))' }}>
                  {roiResult.recommendation}
                </div>
              </div>
            )}
          </div>

          {/* Service Comparison Matrix */}
          <div className="glass-card">
            <div className="section-title-group">
              <h2>Service Cost Comparison</h2>
              <p>Reference values for the four major card grading companies</p>
            </div>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Service</th>
                    <th>Tier Name</th>
                    <th>Fee</th>
                    <th>Est. Time</th>
                  </tr>
                </thead>
                <tbody>
                  {GRADING_COSTS.map((item, index) => (
                    <tr key={index}>
                      <td style={{ fontWeight: 'bold', color: '#fff' }}>{item.service}</td>
                      <td>{item.tier}</td>
                      <td style={{ color: 'hsl(var(--gold-primary))', fontWeight: 'bold' }}>${item.cost}</td>
                      <td>{item.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* 5. WATCHLIST & OUTREACH */}
      {activeTab === 'watchlist' && (
        <section>
          {/* Seller profiles */}
          <div className="glass-card" style={{ marginBottom: '2.5rem' }}>
            <div className="section-title-group">
              <h2>Verified High-End Seller Watchlist</h2>
              <p>Reputable sellers and markets with proven transaction histories in English serialized cards</p>
            </div>

            <div className="card-grid-custom">
              {SELLERS.map((seller) => (
                <div key={seller.name} className="card-item">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <h3 style={{ color: '#fff', fontSize: '1.15rem' }}>{seller.name}</h3>
                    <span className={`badge ${seller.risk === 'Low' ? 'green' : 'gold'}`}>{seller.risk} Risk</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', marginBottom: '0.5rem' }}>
                    <strong>Specialize:</strong> {seller.specialize}
                  </p>
                  <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))' }}>
                    Feedback: {seller.feedback} • Sales: {seller.sales}
                  </p>
                  <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))' }}>
                    Shipping speed: {seller.speed}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Outreach Templates */}
          <div className="glass-card">
            <div className="section-title-group">
              <h2>Seller Outreach Templates</h2>
              <p>Standard templates to send sellers on eBay, TCGPlayer, or social hubs to verify slab provenance</p>
            </div>

            <div className="grid-three-col" style={{ margin: 0 }}>
              {/* Template 1 */}
              <div>
                <h4 style={{ color: '#fff', marginBottom: '0.5rem' }}>1. Serial & Verification Inquiry</h4>
                <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>Used to verify authenticity of serial number before purchase.</p>
                <div className="template-box">
                  <button className="template-copy-btn" onClick={() => handleCopyText(`Hi, I'm highly interested in your serialized One Piece card. Before completing, could you confirm:\n1. Is the serial stamp clearly visible?\n2. What is the PSA/BGS cert number for lookup?\n3. Do you have high-res pictures of the corners/surface?\nThanks!`, 't1')}>
                    {copiedId === 't1' ? 'Copied! ✓' : 'Copy'}
                  </button>
{`Hi, I'm highly interested in your serialized One Piece card. Before completing, could you confirm:
1. Is the serial stamp clearly visible?
2. What is the PSA/BGS cert number for lookup?
3. Do you have high-res pictures of the corners/surface?
Thanks!`}
                </div>
              </div>

              {/* Template 2 */}
              <div>
                <h4 style={{ color: '#fff', marginBottom: '0.5rem' }}>2. Price Negotiation / Anchor Offer</h4>
                <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>Used to negotiate listed prices closer to verified sold comps.</p>
                <div className="template-box">
                  <button className="template-copy-btn" onClick={() => handleCopyText(`Hi there. I noticed you have this card listed at [ASK]. Based on recent PriceCharting and eBay sold history, average comps for this grade are around [COMP]. Would you consider [OFFER] for a fast checkout with escrow? Let me know, thanks!`, 't2')}>
                    {copiedId === 't2' ? 'Copied! ✓' : 'Copy'}
                  </button>
{`Hi there. I noticed you have this card listed at [ASK]. Based on recent PriceCharting and eBay sold history, average comps for this grade are around [COMP]. Would you consider [OFFER] for a fast checkout with escrow? Let me know, thanks!`}
                </div>
              </div>

              {/* Template 3 */}
              <div>
                <h4 style={{ color: '#fff', marginBottom: '0.5rem' }}>3. Sealed Box Bulk Purchase</h4>
                <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>Used for negotiating bulk purchases on Romance Dawn or other boxes.</p>
                <div className="template-box">
                  <button className="template-copy-btn" onClick={() => handleCopyText(`Hello. I am looking to acquire multiple sealed One Piece booster boxes to add to my physical holdings. Do you offer bulk discounts if I buy [QTY] boxes of [SET/WAVE]? I would require insured shipping. Thanks for your time!`, 't3')}>
                    {copiedId === 't3' ? 'Copied! ✓' : 'Copy'}
                  </button>
{`Hello. I am looking to acquire multiple sealed One Piece booster boxes to add to my physical holdings. Do you offer bulk discounts if I buy [QTY] boxes of [SET/WAVE]? I would require insured shipping. Thanks for your time!`}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 6. INVESTMENT STRATEGY */}
      {activeTab === 'strategy' && (
        <section>
          {/* Diversification & Models */}
          <div className="grid-two-col">
            <div className="glass-card">
              <div className="section-title-group">
                <h2>ACool 3-Tier Acquisition Model</h2>
                <p>Diversification system designed to maximize safe returns in TCG collectibles</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ borderLeft: '3px solid hsl(var(--red-neon))', paddingLeft: '1rem' }}>
                  <h4 style={{ color: '#fff', marginBottom: '0.25rem' }}>Tier 1: The Grails (20-30% of Capital)</h4>
                  <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))' }}>
                    High-end, highly scarce assets with long hold times. E.g. **ST01-001 Luffy Serial (/700)** or **Romance Dawn Wave 1 Blue Bottom Box**. Liquid to high-net-worth collectors only.
                  </p>
                </div>

                <div style={{ borderLeft: '3px solid hsl(var(--gold-primary))', paddingLeft: '1rem' }}>
                  <h4 style={{ color: '#fff', marginBottom: '0.25rem' }}>Tier 2: Liquid Assets (50-60% of Capital)</h4>
                  <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))' }}>
                    Excellent balance of transaction volume and rarity. E.g. **OP07-119 Ace Serial**, **OP07-109 Luffy Serial**, or **OP-05 sealed booster boxes**. High demand in active player groups.
                  </p>
                </div>

                <div style={{ borderLeft: '3px solid hsl(var(--blue-neon))', paddingLeft: '1rem' }}>
                  <h4 style={{ color: '#fff', marginBottom: '0.25rem' }}>Tier 3: Quick Turnarounds (10-20% of Capital)</h4>
                  <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))' }}>
                    Sniping raw near-mint copies at 15% below market, grading them immediately at regular speeds, and flipping within 30 days to secure quick capital.
                  </p>
                </div>
              </div>
            </div>

            <div className="glass-card">
              <div className="section-title-group">
                <h2>Scenario Projections (12-Month Hold)</h2>
                <p>Estimated growth breakdowns based on initial capitalization budgets</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ padding: '1rem', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.01)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontWeight: 600 }}>
                    <span style={{ color: '#fff' }}>A. Entry ($500 Budget)</span>
                    <span style={{ color: 'hsl(var(--green-neon))' }}>~10-15% ROI</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>
                    Acquire 2x OP-07 Booster Boxes at $220/each. Hold 12 months. Target exit: $275/each. Net margin: +$110.
                  </p>
                </div>

                <div style={{ padding: '1rem', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.01)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontWeight: 600 }}>
                    <span style={{ color: '#fff' }}>B. Balanced ($3,000 Budget)</span>
                    <span style={{ color: 'hsl(var(--green-neon))' }}>~85-100% ROI</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>
                    Acquire 1x OP07-119 Portgas.D.Ace Serial Raw at $2,920. Grade with PSA Regular ($75). Exit at PSA 9 target ($7,500). Net profit: +$4,505.
                  </p>
                </div>

                <div style={{ padding: '1rem', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.01)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontWeight: 600 }}>
                    <span style={{ color: '#fff' }}>C. Grail Investor ($50,000 Budget)</span>
                    <span style={{ color: 'hsl(var(--green-neon))' }}>~20-30% ROI</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>
                    Acquire 1x EB04-061 Luffy Serial PSA 10 at $45,000. Hold 12-18 months. Target exit: $58,000+. Net profit: +$13,000.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Risk Management Rules */}
          <div className="glass-card">
            <div className="section-title-group" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem' }}>
              <h2>Risk Management Golden Rules</h2>
              <p>Maintain these operational guardrails to prevent data/capital loss</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1.25rem' }}>
              <div>
                <h4 style={{ color: 'hsl(var(--green-neon))', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <ShieldCheck size={18} /> DO:
                </h4>
                <ul style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingLeft: '1.2rem' }}>
                  <li>Diversify holdings between serialized championship singles and sealed booster boxes.</li>
                  <li>Perform independent certification number checks on BGS and PSA web portals.</li>
                  <li>Utilize third-party escrow services (eBay authenticity guarantee, SNKRDUNK verifications).</li>
                  <li>Maintain an exit target of 12-18 months. Collectibles are highly cyclical.</li>
                </ul>
              </div>

              <div>
                <h4 style={{ color: 'hsl(var(--red-neon))', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <ShieldAlert size={18} /> DONT:
                </h4>
                <ul style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingLeft: '1.2rem' }}>
                  <li>Do not chase astronomical placeholder asks (e.g. Shanks Serial at $100,000 on TCGplayer).</li>
                  <li>Do not buy serialized cards without visible serial stamp numbering (/1000 or /700).</li>
                  <li>Do not submit cards that have visual edge silvering, print lines, or poor centering to bulk grading.</li>
                  <li>Do not invest capital required for immediate living expenses.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 7. 30-DAY STARTUP CHECKLIST */}
      {activeTab === 'checklist' && (
        <section className="grid-two-col">
          {/* Action Roadmap */}
          <div className="glass-card">
            <div className="section-title-group">
              <h2>30-Day Step-by-Step Roadmap</h2>
              <p>A structured timeline to safely enter the high-end TCG market</p>
            </div>

            <div className="roadmap-container">
              {/* Phase 1 */}
              <div className="roadmap-step active">
                <div className="roadmap-number">1</div>
                <div className="roadmap-content">
                  <h3>Phase 1: Environment Setup (Days 1-5)</h3>
                  <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))' }}>Set up operational tools, registry accounts, and funding channels.</p>
                  <div className="checklist-items">
                    <label className="checklist-item">
                      <input type="checkbox" checked={!!checklist['setup-1']} onChange={() => handleToggleChecklist('setup-1')} />
                      Create verified buyer accounts on eBay, TCGPlayer, SNKRDUNK, and PriceCharting
                    </label>
                    <label className="checklist-item">
                      <input type="checkbox" checked={!!checklist['setup-2']} onChange={() => handleToggleChecklist('setup-2')} />
                      Secure funding account ($500 - $5,000 startup capital allocation)
                    </label>
                    <label className="checklist-item">
                      <input type="checkbox" checked={!!checklist['setup-3']} onChange={() => handleToggleChecklist('setup-3')} />
                      Join 2-3 high-end collector Discord servers or Facebook groups for private comps
                    </label>
                  </div>
                </div>
              </div>

              {/* Phase 2 */}
              <div className={`roadmap-step ${checklist['setup-1'] && checklist['setup-2'] ? 'active' : ''}`}>
                <div className="roadmap-number">2</div>
                <div className="roadmap-content">
                  <h3>Phase 2: Target Spotting & Research (Days 6-12)</h3>
                  <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))' }}>Study historical sales curves and locate active English listings.</p>
                  <div className="checklist-items">
                    <label className="checklist-item">
                      <input type="checkbox" checked={!!checklist['research-1']} onChange={() => handleToggleChecklist('research-1')} />
                      Locate active eBay/TCGplayer listings for OP07-119 Ace or OP07-109 Luffy Serial
                    </label>
                    <label className="checklist-item">
                      <input type="checkbox" checked={!!checklist['research-2']} onChange={() => handleToggleChecklist('research-2')} />
                      Verify listing descriptions explicitly state "English Version" and display the serial number stamp
                    </label>
                  </div>
                </div>
              </div>

              {/* Phase 3 */}
              <div className={`roadmap-step ${checklist['research-1'] && checklist['research-2'] ? 'active' : ''}`}>
                <div className="roadmap-number">3</div>
                <div className="roadmap-content">
                  <h3>Phase 3: Deal Manifestation & Negotiation (Days 13-20)</h3>
                  <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))' }}>Reach out to target sellers with offer anchors and secure purchases.</p>
                  <div className="checklist-items">
                    <label className="checklist-item">
                      <input type="checkbox" checked={!!checklist['purchase-1']} onChange={() => handleToggleChecklist('purchase-1')} />
                      Copy the "Price Negotiation" template and message 3-4 sellers to offer 10% below comps
                    </label>
                    <label className="checklist-item">
                      <input type="checkbox" checked={!!checklist['purchase-2']} onChange={() => handleToggleChecklist('purchase-2')} />
                      Purchase target asset using platform-protected payments (eBay Authenticity Guarantee)
                    </label>
                  </div>
                </div>
              </div>

              {/* Phase 4 */}
              <div className={`roadmap-step ${checklist['purchase-1'] && checklist['purchase-2'] ? 'active' : ''}`}>
                <div className="roadmap-number">4</div>
                <div className="roadmap-content">
                  <h3>Phase 4: Cashing In & Scaling (Days 21-30)</h3>
                  <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))' }}>Perform grading evaluation or list position on secondary markets.</p>
                  <div className="checklist-items">
                    <label className="checklist-item">
                      <input type="checkbox" checked={!!checklist['scale-1']} onChange={() => handleToggleChecklist('scale-1')} />
                      Grade raw sniped cards at BGS/PSA, or list graded slabs on active hubs for exit
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Learning Resources */}
          <div className="glass-card">
            <div className="section-title-group">
              <h2>Meta Deck & Market Knowledge Platforms</h2>
              <p>Top platforms to build knowledge of the One Piece TCG meta decks and event structures</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {METADECK_LINKS.map(link => (
                <div key={link.name} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '0.75rem' }}>
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="site-link" style={{ fontSize: '1.05rem', marginBottom: '0.25rem' }}>
                    {link.name} <ExternalLink size={14} />
                  </a>
                  <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))' }}>{link.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer style={{ marginTop: '5rem', padding: '1.5rem 0', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', fontSize: '0.85rem', color: 'hsl(var(--text-muted))' }}>
        <p>ACoolCOLLECTOR Portfolio System • Developed for Queen Collectibles • Version 1.1.0 • January 2025</p>
        <p style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}>
          Disclaimer: This is for educational and tracking purposes. High-end card investing is volatile and subject to market swings. Always verify cert numbers.
        </p>
      </footer>
    </div>
  );
}
