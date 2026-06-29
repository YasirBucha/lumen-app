// Sample data — feels verified, not invented.
// Two scenarios: "light" (Yasir's family — focused) and "heavy" (power user).
// Prices in PKR primary, USD secondary. Exchange ~278.

const FX = 278; // PKR per USD (sample)

// Card art tokens (paint-style accents only — no logo IP reproduction)
const CARD_KINDS = {
  visa:   { label: 'Visa',        last4Style: 'V', tint: ['#1A1F71', '#2A337A'], chip: '#E7C97A' },
  mc:     { label: 'Mastercard',  last4Style: 'M', tint: ['#211E1F', '#3A2A2A'], chip: '#E7C97A' },
  amex:   { label: 'Amex',        last4Style: 'A', tint: ['#0B7A75', '#0F8E89'], chip: '#E7C97A' },
  unionp: { label: 'UnionPay',    last4Style: 'U', tint: ['#1B1F3A', '#2A2F5A'], chip: '#E7C97A' },
};

const CATEGORIES = [
  { id: 'streaming',   label: 'Streaming',    swatch: 'oklch(0.72 0.16 25)' },
  { id: 'productivity',label: 'Productivity', swatch: 'oklch(0.82 0.16 110)' },
  { id: 'cloud',       label: 'Cloud & Storage', swatch: 'oklch(0.70 0.12 220)' },
  { id: 'school',      label: 'School Fees',  swatch: 'oklch(0.62 0.18 295)' },
  { id: 'ecommerce',   label: 'E-commerce',   swatch: 'oklch(0.78 0.14 155)' },
  { id: 'bills',       label: 'Bills',        swatch: 'oklch(0.68 0.04 220)' },
];

// Gmail accounts
const ACCOUNTS = [
  { id: 'all',      label: 'All Mail',       email: '',                    color: 'all' },
  { id: 'personal', label: 'Personal',       email: 'yasir.bucha@gmail.com', color: '#E94F3B' },
  { id: 'work',     label: 'Buch Hospital',  email: 'yasir@buchhospital.com', color: '#3B7AE9' },
  { id: 'family',   label: 'Family',         email: 'bucha.family@gmail.com', color: '#7A3BE9' },
];

// Verified-looking subscriptions
function makeSubs() {
  const now = new Date('2026-06-29');
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const fmtISO = (d) => d.toISOString().slice(0, 10);

  const base = [
    // Streaming
    { id: 'netflix', merchant: 'Netflix',         glyph: 'N', glyphBg: '#E50914',
      category: 'streaming', cycle: 'monthly', amountUSD: 15.49, amountPKR: 1800,
      account: 'personal', card: 'visa', last4: '4421',
      nextCharge: addDays(now, 11), since: '2021-03',
      usage: { sessionsLast30: 22, lastUsed: 'Yesterday' },
      verdict: 'review',
      priceIncrease: { fromPKR: 1499, toPKR: 1800, fromUSD: 12.99, toUSD: 15.49, date: '2026-06-12', emailDate: '2026-06-12' },
      sharedWith: {
        plan: 'Premium · 4 profiles',
        members: [
          { initial: 'Y', label: 'Yasir',  color: '#C8413A', you: true },
          { initial: 'A', label: 'Aliya',  color: '#3B7AE9' },
          { initial: 'H', label: 'Hassan', color: '#0E5E2A' },
          { initial: 'F', label: 'Family', color: '#7A3BE9' },
        ],
        note: 'Cost per seat — Rs 450/mo. Lowest in the ledger.',
      },
      evidence: ['Price up 20% — Rs 1,499 → 1,800 effective Jul', 'Used 22 of last 30 days', 'Shared with 4 profiles'] },

    { id: 'spotify', merchant: 'Spotify Family',  glyph: 'S', glyphBg: '#1DB954',
      category: 'streaming', cycle: 'monthly', amountUSD: 7.99, amountPKR: 1199,
      account: 'family', card: 'mc', last4: '8830',
      nextCharge: addDays(now, 3), since: '2019-08',
      usage: { sessionsLast30: 28, lastUsed: 'Today' },
      verdict: 'keep',
      sharedWith: {
        plan: 'Family · 6 seats',
        members: [
          { initial: 'Y', label: 'Yasir',  color: '#C8413A', you: true },
          { initial: 'A', label: 'Aliya',  color: '#3B7AE9' },
          { initial: 'H', label: 'Hassan', color: '#0E5E2A' },
          { initial: 'Z', label: 'Zara',   color: '#7A3BE9' },
          { initial: 'M', label: 'Mom',    color: '#A57F2B' },
          { initial: '+', label: 'Empty seat', color: 'transparent', empty: true },
        ],
        note: 'Cost per active seat — Rs 240/mo. One seat unused.',
      },
      evidence: ['Used daily', 'Family plan, 5 of 6 seats active'] },

    { id: 'ytprem', merchant: 'YouTube Premium',  glyph: 'Y', glyphBg: '#FF0000',
      category: 'streaming', cycle: 'monthly', amountUSD: 13.99, amountPKR: 1099,
      account: 'personal', card: 'visa', last4: '4421',
      nextCharge: addDays(now, 18), since: '2023-01',
      usage: { sessionsLast30: 6, lastUsed: '6d ago' },
      verdict: 'review',
      evidence: ['Used 6 of last 30 days', 'Overlaps with Spotify (music)', 'Renewed monthly for 17 months'] },

    { id: 'disney', merchant: 'Disney+',          glyph: 'D', glyphBg: '#0E2A5E',
      category: 'streaming', cycle: 'yearly', amountUSD: 109.99, amountPKR: 30600,
      account: 'family', card: 'mc', last4: '8830',
      nextCharge: addDays(now, 92), since: '2022-11',
      usage: { sessionsLast30: 2, lastUsed: '14d ago' },
      verdict: 'cancel',
      sharedWith: {
        plan: 'Standard · 2 profiles',
        members: [
          { initial: 'Y', label: 'Yasir', color: '#C8413A', you: true },
          { initial: 'Z', label: 'Zara',  color: '#7A3BE9' },
        ],
        note: 'Only Zara watched in the last 6 weeks. Cost per active viewer — Rs 1,275/mo.',
      },
      evidence: ['Used 2 of last 30 days', 'No new content viewed in 6 weeks', 'Yearly renewal due Sep 29'] },

    // Productivity
    { id: 'notion', merchant: 'Notion Plus',      glyph: 'N', glyphBg: '#0B0F0E',
      category: 'productivity', cycle: 'monthly', amountUSD: 10.00, amountPKR: 2780,
      account: 'work', card: 'amex', last4: '1005',
      nextCharge: addDays(now, 7), since: '2022-06',
      usage: { sessionsLast30: 24, lastUsed: 'Today' },
      verdict: 'keep',
      priceIncrease: { fromPKR: 2225, toPKR: 2780, fromUSD: 8.00, toUSD: 10.00, date: '2026-04-15', emailDate: '2026-04-15' },
      evidence: ['Price up 25% — Rs 2,225 → 2,780 since Apr', 'Used 24 of last 30 days', '3 workspaces active'] },

    { id: 'chatgpt', merchant: 'ChatGPT Plus',    glyph: 'G', glyphBg: '#10A37F',
      category: 'productivity', cycle: 'monthly', amountUSD: 20.00, amountPKR: 5560,
      account: 'personal', card: 'visa', last4: '4421',
      nextCharge: addDays(now, 2), since: '2023-02',
      usage: { sessionsLast30: 19, lastUsed: 'Today' },
      verdict: 'keep',
      priceIncrease: { fromPKR: 4450, toPKR: 5560, fromUSD: 16.00, toUSD: 20.00, date: '2026-05-28', emailDate: '2026-05-28' },
      evidence: ['Price up 25% — Rs 4,450 → 5,560 effective Jun', 'Used 19 of last 30 days', 'API not in use — Plus only'] },

    { id: 'claude', merchant: 'Claude Pro',       glyph: 'C', glyphBg: '#D97757',
      category: 'productivity', cycle: 'monthly', amountUSD: 20.00, amountPKR: 5560,
      account: 'work', card: 'amex', last4: '1005',
      nextCharge: addDays(now, 14), since: '2024-09',
      usage: { sessionsLast30: 21, lastUsed: 'Today' },
      verdict: 'keep',
      evidence: ['Used 21 of last 30 days', 'Heavy use last 7 days'] },

    { id: 'figma', merchant: 'Figma Pro',         glyph: 'F', glyphBg: '#F24E1E',
      category: 'productivity', cycle: 'yearly', amountUSD: 144.00, amountPKR: 40080,
      account: 'work', card: 'amex', last4: '1005',
      nextCharge: addDays(now, 156), since: '2021-04',
      usage: { sessionsLast30: 8, lastUsed: '3d ago' },
      verdict: 'keep',
      evidence: ['Used 8 of last 30 days', '4 files edited this month'] },

    { id: 'adobe', merchant: 'Adobe Creative Cloud', glyph: 'A', glyphBg: '#FA0F00',
      category: 'productivity', cycle: 'yearly', amountUSD: 599.88, amountPKR: 166880,
      account: 'work', card: 'amex', last4: '1005',
      nextCharge: addDays(now, 47), since: '2020-02',
      usage: { sessionsLast30: 3, lastUsed: '11d ago' },
      verdict: 'review',
      evidence: ['Used 3 of last 30 days', 'Only Photoshop opened — single-app plan PKR 89k/yr available'] },

    // Cloud
    { id: 'icloud', merchant: 'iCloud+ 2 TB',     glyph: 'i', glyphBg: '#0B0F0E',
      category: 'cloud', cycle: 'monthly', amountUSD: 9.99, amountPKR: 2780,
      account: 'personal', card: 'visa', last4: '4421',
      nextCharge: addDays(now, 9), since: '2020-01',
      usage: { sessionsLast30: 30, lastUsed: 'Today' },
      verdict: 'keep',
      evidence: ['1.4 TB of 2 TB used', 'Synced across 4 devices'] },

    { id: 'gone', merchant: 'Google One 200 GB',  glyph: 'G', glyphBg: '#4285F4',
      category: 'cloud', cycle: 'yearly', amountUSD: 29.99, amountPKR: 8340,
      account: 'family', card: 'mc', last4: '8830',
      nextCharge: addDays(now, 201), since: '2022-04',
      usage: { sessionsLast30: 30, lastUsed: 'Today' },
      verdict: 'keep',
      evidence: ['142 GB of 200 GB used', 'Shared with family'] },

    { id: 'dropbox', merchant: 'Dropbox Plus',    glyph: 'D', glyphBg: '#0061FF',
      category: 'cloud', cycle: 'yearly', amountUSD: 119.88, amountPKR: 33360,
      account: 'work', card: 'amex', last4: '1005',
      nextCharge: addDays(now, 78), since: '2019-11',
      usage: { sessionsLast30: 1, lastUsed: '22d ago' },
      verdict: 'cancel',
      evidence: ['Used 1 of last 30 days', 'Overlaps with iCloud and Google One', 'No new files in 3 weeks'] },

    // School
    { id: 'lgs', merchant: 'LGS Defence — Tuition', glyph: 'L', glyphBg: '#0E5E2A',
      category: 'school', cycle: 'monthly', amountUSD: 215.83, amountPKR: 60000,
      account: 'family', card: 'unionp', last4: '6677',
      nextCharge: addDays(now, 6), since: '2023-09',
      usage: { sessionsLast30: 30, lastUsed: 'Today' },
      verdict: 'keep',
      evidence: ['Recurring invoice received monthly', 'Verified from school billing email'] },

    { id: 'beacon', merchant: 'Beaconhouse — Tuition', glyph: 'B', glyphBg: '#1F3A8A',
      category: 'school', cycle: 'monthly', amountUSD: 161.87, amountPKR: 45000,
      account: 'family', card: 'unionp', last4: '6677',
      nextCharge: addDays(now, 6), since: '2024-09',
      usage: { sessionsLast30: 30, lastUsed: 'Today' },
      verdict: 'keep',
      evidence: ['Recurring invoice received monthly', 'Verified from school billing email'] },

    // E-commerce
    { id: 'prime', merchant: 'Amazon Prime',      glyph: 'a', glyphBg: '#FF9900',
      category: 'ecommerce', cycle: 'yearly', amountUSD: 139.00, amountPKR: 38680,
      account: 'personal', card: 'visa', last4: '4421',
      nextCharge: addDays(now, 132), since: '2020-07',
      usage: { sessionsLast30: 11, lastUsed: '2d ago' },
      verdict: 'keep',
      evidence: ['11 orders in last 90 days', 'Saved ~PKR 9,400 on shipping'] },

    { id: 'daraz', merchant: 'Daraz Plus',        glyph: 'd', glyphBg: '#F57224',
      category: 'ecommerce', cycle: 'yearly', amountUSD: 17.99, amountPKR: 5000,
      account: 'personal', card: 'visa', last4: '4421',
      nextCharge: addDays(now, -22), since: '2023-05',
      usage: { sessionsLast30: 0, lastUsed: '64d ago' },
      verdict: 'cancel',
      status: 'past',
      evidence: ['Auto-cancelled — card declined', '0 orders in last 60 days'] },
  ];

  // Build a 12-month charge history for each (simple back-dated cycle).
  // For subs with a priceIncrease, history before the bump uses the old price.
  return base.map(s => {
    const history = [];
    const monthsBack = s.cycle === 'yearly' ? 3 : 12; // years: last 3 renewals; monthly: 12
    const stride = s.cycle === 'yearly' ? 12 : 1;
    const bumpDate = s.priceIncrease ? new Date(s.priceIncrease.date) : null;
    for (let i = 1; i <= monthsBack; i++) {
      const d = new Date(now);
      d.setMonth(d.getMonth() - i * stride);
      let pkr = s.amountPKR;
      let usd = s.amountUSD;
      if (bumpDate && d < bumpDate) {
        pkr = s.priceIncrease.fromPKR;
        usd = s.priceIncrease.fromUSD;
      }
      history.push({ date: fmtISO(d), pkr, usd, status: 'paid' });
    }
    return { ...s, history, nextCharge: fmtISO(s.nextCharge), status: s.status || 'active' };
  });
}

const SUBS_HEAVY = makeSubs();
// "Light user" — filter to ~7 essentials
const LIGHT_IDS = new Set(['netflix', 'spotify', 'chatgpt', 'icloud', 'lgs', 'beacon', 'prime']);
const SUBS_LIGHT = SUBS_HEAVY.filter(s => LIGHT_IDS.has(s.id));

// Monthly spend trend (last 12 months, PKR) — derived but with seasonal variance for the chart
function buildTrend(subs) {
  const months = ['Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar','Apr','May','Jun'];
  // base monthly cost (annual / 12 + monthly)
  let base = 0;
  subs.forEach(s => {
    if (s.status !== 'active') return;
    base += s.cycle === 'yearly' ? s.amountPKR / 12 : s.amountPKR;
  });
  // tiny variance + a couple of yearly renewal "spikes"
  return months.map((m, i) => {
    const noise = (Math.sin(i * 1.7) * 0.04 + (i === 2 ? 0.18 : 0) + (i === 8 ? 0.12 : 0));
    return { month: m, pkr: Math.round(base * (1 + noise)) };
  });
}

window.LumenData = {
  FX, CARD_KINDS, CATEGORIES, ACCOUNTS,
  SUBS_HEAVY, SUBS_LIGHT,
  buildTrend,
  fmtMoney(amount, currency) {
    if (currency === 'USD') {
      return '$' + amount.toLocaleString('en-US', { maximumFractionDigits: amount < 100 ? 2 : 0 });
    }
    return 'Rs ' + Math.round(amount).toLocaleString('en-US');
  },
  toCurrency(sub, currency) {
    return currency === 'USD' ? sub.amountUSD : sub.amountPKR;
  },
};
