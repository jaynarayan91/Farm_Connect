import React, { useState } from 'react';
import { useQuery } from 'react-query';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
  AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from 'recharts';
import SupplierNavbar from './SupplierNavbar';
import api from '../apiConfig';

// MUI Icons
import CurrencyRupeeOutlinedIcon from '@mui/icons-material/CurrencyRupeeOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import HourglassEmptyOutlinedIcon from '@mui/icons-material/HourglassEmptyOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import LocalDiningOutlinedIcon from '@mui/icons-material/LocalDiningOutlined';
import MedicalServicesOutlinedIcon from '@mui/icons-material/MedicalServicesOutlined';
import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import WhatshotOutlinedIcon from '@mui/icons-material/WhatshotOutlined';
import AutoGraphOutlinedIcon from '@mui/icons-material/AutoGraphOutlined';
import PetsOutlinedIcon from '@mui/icons-material/PetsOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';

/* ── API ── */
const fetchSupplierAnalytics = async () => {
  const res = await api.get('/analytics/supplier');
  return res.data;
};

/* ── Colors ── */
const CHART_COLORS  = ['#1a6b40', '#0891b2', '#7c3aed', '#f59e0b', '#ef4444', '#10b981', '#f97316', '#8b5cf6'];
const PIE_COLORS    = ['#1a6b40', '#0891b2', '#7c3aed', '#f59e0b', '#ef4444', '#10b981'];

/* ── Custom Tooltip ── */
const CustomTooltip = ({ active, payload, label, prefix = '', suffix = '' }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-xl p-3 text-xs">
      <p className="font-bold text-gray-700 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">
          {p.name}: {prefix}{typeof p.value === 'number' ? p.value.toLocaleString('en-IN') : p.value}{suffix}
        </p>
      ))}
    </div>
  );
};

/* ── KPI Card ── */
const KpiCard = ({ label, value, icon, color, bg, border, sub, prefix = '', onClick }) => (
  <div
    className="bg-white rounded-2xl p-5 border shadow-sm flex items-center gap-4 hover:shadow-md transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
    style={{ borderColor: border }}
    onClick={onClick}
  >
    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
      <span style={{ color }}>{icon}</span>
    </div>
    <div className="min-w-0">
      <p className="text-2xl font-extrabold truncate" style={{ color }}>
        {prefix}{typeof value === 'number' ? value.toLocaleString('en-IN') : value}
      </p>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider leading-tight">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
    <div className="ml-auto flex-shrink-0 opacity-30">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
    </div>
  </div>
);

/* ── Section Header ── */
const SectionHeader = ({ icon, title, subtitle }) => (
  <div className="flex items-center gap-3 mb-5">
    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ background: 'rgba(26,107,64,0.1)' }}>
      <span style={{ color: '#1a6b40' }}>{icon}</span>
    </div>
    <div>
      <h2 className="text-base font-extrabold text-gray-800">{title}</h2>
      {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
    </div>
  </div>
);

/* ── Chart Card ── */
const ChartCard = ({ children, className = '' }) => (
  <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-5 ${className}`}>
    {children}
  </div>
);

/* ── Empty State ── */
const EmptyChart = ({ message = 'No data available yet' }) => (
  <div className="flex flex-col items-center justify-center h-40 gap-2 text-gray-300">
    <BarChartOutlinedIcon style={{ fontSize: 36 }} />
    <p className="text-xs font-semibold">{message}</p>
  </div>
);

/* ── Conversion Rate Ring ── */
const ConversionRing = ({ rate }) => {
  const r = 38, circ = 2 * Math.PI * r;
  const dash = (rate / 100) * circ;
  return (
    <div className="flex flex-col items-center justify-center gap-1">
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#f0f4f0" strokeWidth="10" />
        <circle cx="50" cy="50" r={r} fill="none" stroke="#1a6b40" strokeWidth="10"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          transform="rotate(-90 50 50)" style={{ transition: 'stroke-dasharray 1s ease' }} />
        <text x="50" y="55" textAnchor="middle" fontSize="18" fontWeight="800" fill="#1a6b40">{rate}%</text>
      </svg>
      <p className="text-xs font-semibold text-gray-500">Conversion Rate</p>
    </div>
  );
};

/* ══════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════ */
const SupplierDashboard = () => {
  const [revenueView, setRevenueView] = useState('bar');
  const [activeModal, setActiveModal] = useState(null); // 'revenue' | 'orders' | 'feed' | 'medicine'

  const { data, isLoading, isError } = useQuery({
    queryKey: ['supplierAnalytics'],
    queryFn: fetchSupplierAnalytics,
    retry: 1,
    refetchInterval: 30000,
    refetchOnWindowFocus: false,
  });

  const s = data?.summary || {};

  return (
    <>
    <div className="min-h-screen" style={{ background: '#f0f4f0' }}>
      <SupplierNavbar />

      {/* ── Hero Header ── */}
      <div
        className="w-full py-10 px-4 text-center relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0d4a2e 0%, #1a6b40 50%, #0a3d26 100%)' }}
      >
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.03) 10px, rgba(255,255,255,0.03) 20px)' }} />
        <div className="relative">
          <h1 className="text-4xl font-bold text-white mb-2" style={{ fontFamily: "'Nunito', sans-serif" }}>
            Supplier{' '}
            <span style={{ color: '#4ade80', fontStyle: 'italic' }}>Dashboard</span>
          </h1>
          <p className="text-white/60 text-sm">Sales analytics, top products & demand insights for your business</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Loading ── */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-32 gap-3">
            <div className="w-10 h-10 border-4 rounded-full animate-spin"
              style={{ borderColor: 'rgba(26,107,64,0.2)', borderTopColor: '#1a6b40' }} />
            <span className="text-gray-400 text-sm">Loading your analytics...</span>
          </div>
        )}

        {isError && !isLoading && (
          <div className="flex flex-col items-center justify-center py-32 gap-3">
            <WarningAmberOutlinedIcon style={{ fontSize: 44, color: '#ef4444' }} />
            <p className="text-red-500 font-semibold text-sm">Failed to load analytics. Please try again.</p>
          </div>
        )}

        {data && !isLoading && (
          <>
            {/* ════════════════════════════════
                TOP KPI ROW
            ════════════════════════════════ */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <KpiCard label="Total Revenue" value={s.totalRevenue ?? 0} prefix="₹"
                icon={<CurrencyRupeeOutlinedIcon style={{ fontSize: 22 }} />}
                color="#1a6b40" bg="rgba(26,107,64,0.1)" border="rgba(26,107,64,0.2)"
                sub="From approved orders"
                onClick={() => setActiveModal('revenue')} />
              <KpiCard label="Total Orders" value={s.totalOrders ?? 0}
                icon={<ShoppingCartOutlinedIcon style={{ fontSize: 22 }} />}
                color="#0891b2" bg="rgba(8,145,178,0.1)" border="rgba(8,145,178,0.2)"
                sub={`${s.pendingCount ?? 0} pending`}
                onClick={() => setActiveModal('orders')} />
              <KpiCard label="Feed Items" value={s.totalFeedItems ?? 0}
                icon={<LocalDiningOutlinedIcon style={{ fontSize: 22 }} />}
                color="#1d4ed8" bg="rgba(29,78,216,0.1)" border="rgba(29,78,216,0.2)"
                sub={`${s.outOfStockFeeds ?? 0} out of stock`}
                onClick={() => setActiveModal('feed')} />
              <KpiCard label="Medicine Items" value={s.totalMedItems ?? 0}
                icon={<MedicalServicesOutlinedIcon style={{ fontSize: 22 }} />}
                color="#7c3aed" bg="rgba(124,58,237,0.1)" border="rgba(124,58,237,0.2)"
                sub={`${s.expiringMeds ?? 0} expiring soon`}
                onClick={() => setActiveModal('medicine')} />
            </div>

            {/* ── Order Status Mini Row ── */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { label: 'Approved', value: s.approvedCount ?? 0, icon: <CheckCircleOutlinedIcon style={{ fontSize: 18 }} />, color: '#059669', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' },
                { label: 'Pending',  value: s.pendingCount  ?? 0, icon: <HourglassEmptyOutlinedIcon style={{ fontSize: 18 }} />, color: '#b45309', bg: 'bg-amber-50',   border: 'border-amber-200',   text: 'text-amber-700'   },
                { label: 'Rejected', value: s.rejectedCount ?? 0, icon: <CancelOutlinedIcon style={{ fontSize: 18 }} />,        color: '#dc2626', bg: 'bg-red-50',     border: 'border-red-200',     text: 'text-red-600'     },
              ].map(({ label, value, icon, color, bg, border, text }) => (
                <div key={label} className={`${bg} border ${border} rounded-2xl p-4 flex items-center gap-3`}>
                  <span style={{ color }}>{icon}</span>
                  <div>
                    <p className={`text-xl font-extrabold ${text}`}>{value}</p>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* ════════════════════════════════
                FR-4: SALES ANALYTICS
            ════════════════════════════════ */}
            <div className="mb-8">
              <SectionHeader
                icon={<AutoGraphOutlinedIcon style={{ fontSize: 20 }} />}
                title="FR-4: Sales Analytics"
                subtitle="Total revenue, orders per month, weekly trends & conversion rate"
              />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                {/* Monthly Revenue + Orders — full width top */}
                <ChartCard className="lg:col-span-2">
                  <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                    <p className="text-sm font-bold text-gray-700">Monthly Revenue & Orders (Last 6 Months)</p>
                    <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
                      {['bar', 'line'].map(type => (
                        <button key={type} onClick={() => setRevenueView(type)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border-none cursor-pointer
                            ${revenueView === type ? 'text-white shadow' : 'text-gray-500 bg-transparent'}`}
                          style={revenueView === type ? { background: 'linear-gradient(135deg, #1a6b40, #0d4a2e)' } : {}}>
                          {type === 'bar' ? 'Bar' : 'Line'}
                        </button>
                      ))}
                    </div>
                  </div>
                  {!data.monthlyOrders?.length ? <EmptyChart message="No order history yet" /> : (
                    <ResponsiveContainer width="100%" height={240}>
                      {revenueView === 'bar' ? (
                       <BarChart data={data.monthlyOrders} margin={{ top: 5, right: 10, left: 0, bottom: 5 }} barCategoryGap="40%">
                       <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                       <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                       <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#9ca3af' }}
                         tickFormatter={v => `₹${v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v}`} />
                       <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#9ca3af' }} allowDecimals={false} />
                       <Tooltip content={<CustomTooltip />} />
                       <Bar yAxisId="left" dataKey="revenue" name="Revenue (₹)" fill="#1a6b40"
                         radius={[5, 5, 0, 0]} maxBarSize={28} />
                       <Bar yAxisId="right" dataKey="total" name="Orders" fill="#86efac"
                         radius={[5, 5, 0, 0]} maxBarSize={28} />
                     </BarChart>
                      ) : (
                        <AreaChart data={data.monthlyOrders} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                          <defs>
                            <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#1a6b40" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#1a6b40" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                          <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={v => `₹${v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v}`} />
                          <Tooltip content={<CustomTooltip prefix="₹" />} />
                          <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#1a6b40" strokeWidth={2.5} fill="url(#revGrad)" dot={{ fill: '#1a6b40', r: 4 }} />
                        </AreaChart>
                      )}
                    </ResponsiveContainer>
                  )}
                </ChartCard>

                {/* Conversion Rate + Revenue Split */}
                <div className="flex flex-col gap-5">
                  <ChartCard>
                    <p className="text-sm font-bold text-gray-700 mb-3">Conversion Rate</p>
                    <div className="flex flex-col items-center">
                      <ConversionRing rate={s.conversionRate ?? 0} />
                      <div className="flex gap-4 mt-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />{s.approvedCount ?? 0} approved</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-200 inline-block" />{s.rejectedCount ?? 0} rejected</span>
                      </div>
                    </div>
                  </ChartCard>

                  <ChartCard>
                    <p className="text-sm font-bold text-gray-700 mb-3">Revenue Split</p>
                    {s.feedRevenue === 0 && s.medicineRevenue === 0 ? (
                      <EmptyChart message="No revenue yet" />
                    ) : (
                      <>
                        <ResponsiveContainer width="100%" height={130}>
                          <PieChart>
                            <Pie data={[
                              { name: 'Feed', value: s.feedRevenue ?? 0 },
                              { name: 'Medicine', value: s.medicineRevenue ?? 0 },
                            ]} cx="50%" cy="50%" innerRadius={38} outerRadius={58} paddingAngle={4} dataKey="value">
                              <Cell fill="#1d4ed8" />
                              <Cell fill="#7c3aed" />
                            </Pie>
                            <Tooltip formatter={(v) => [`₹${v.toLocaleString('en-IN')}`, '']} />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="flex justify-center gap-4 mt-1">
                          {[{ label: 'Feed', color: '#1d4ed8', val: s.feedRevenue }, { label: 'Med', color: '#7c3aed', val: s.medicineRevenue }].map(({ label, color, val }) => (
                            <div key={label} className="flex items-center gap-1 text-xs font-semibold text-gray-600">
                              <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                              {label}: ₹{(val ?? 0).toLocaleString('en-IN')}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </ChartCard>
                </div>

                {/* Weekly order trend */}
                <ChartCard className="lg:col-span-3">
                  <p className="text-sm font-bold text-gray-700 mb-4">Weekly Order Trend (Last 4 Weeks)</p>
                  {!data.weeklyOrders?.length ? <EmptyChart message="No recent orders" /> : (
                    <ResponsiveContainer width="100%" height={180}>
                      <LineChart data={data.weeklyOrders} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#9ca3af' }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                        <Tooltip content={<CustomTooltip prefix="" suffix=" orders" />} />
                        <Line type="monotone" dataKey="count" name="Orders" stroke="#1a6b40" strokeWidth={2.5}
                          dot={{ fill: '#1a6b40', r: 5, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 7 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </ChartCard>
              </div>
            </div>

            {/* ════════════════════════════════
                FR-5: TOP PRODUCTS
            ════════════════════════════════ */}
            <div className="mb-8">
              <SectionHeader
                icon={<EmojiEventsOutlinedIcon style={{ fontSize: 20 }} />}
                title="FR-5: Top Products"
                subtitle="Best-selling products by quantity sold from approved orders"
              />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                {/* Bar chart */}
                <ChartCard>
                  <p className="text-sm font-bold text-gray-700 mb-4">Top Products by Quantity Sold</p>
                  {!data.topProducts?.length ? <EmptyChart message="No sales data yet" /> : (
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart data={data.topProducts} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                        <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} allowDecimals={false} />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#6b7280' }} width={90} />
                        <Tooltip content={<CustomTooltip prefix="" suffix=" units" />} />
                        <Bar dataKey="totalQuantity" name="Qty Sold" radius={[0, 6, 6, 0]} maxBarSize={24}>
                          {data.topProducts.map((_, i) => (
                            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </ChartCard>

                {/* Leaderboard table */}
                <ChartCard>
                  <p className="text-sm font-bold text-gray-700 mb-4">Product Leaderboard</p>
                  {!data.topProducts?.length ? <EmptyChart message="No sales data yet" /> : (
                    <div className="space-y-3">
                      {data.topProducts.map((product, i) => {
                        const max = data.topProducts[0]?.totalQuantity || 1;
                        const pct = Math.round((product.totalQuantity / max) * 100);
                        const isFeed = product.type === 'Feed';
                        const medal = ['🥇', '🥈', '🥉'][i] || `#${i + 1}`;
                        return (
                          <div key={i}>
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm">{medal}</span>
                                <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold border
                                  ${isFeed ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-purple-50 text-purple-700 border-purple-200'}`}>
                                  {isFeed ? <LocalDiningOutlinedIcon style={{ fontSize: 10 }} /> : <MedicalServicesOutlinedIcon style={{ fontSize: 10 }} />}
                                  {product.type}
                                </span>
                                <span className="text-xs font-semibold text-gray-700 truncate max-w-[120px]">{product.name}</span>
                              </div>
                              <div className="text-right flex-shrink-0 ml-2">
                                <p className="text-xs font-bold text-gray-700">{product.totalQuantity} units</p>
                                <p className="text-[10px] text-gray-400">₹{product.totalRevenue.toLocaleString('en-IN')}</p>
                              </div>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-1.5">
                              <div className="h-1.5 rounded-full transition-all duration-700"
                                style={{ width: `${pct}%`, background: CHART_COLORS[i % CHART_COLORS.length] }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </ChartCard>
              </div>
            </div>

            {/* ════════════════════════════════
                FR-6: DEMAND HEATMAP
            ════════════════════════════════ */}
            <div className="mb-8">
              <SectionHeader
                icon={<WhatshotOutlinedIcon style={{ fontSize: 20 }} />}
                title="FR-6: Demand Heatmap"
                subtitle="Demand by product category and livestock type — shows where demand is highest"
              />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                {/* Demand by Category — Bar chart */}
                <ChartCard>
                  <p className="text-sm font-bold text-gray-700 mb-1">Demand by Product Category</p>
                  <p className="text-xs text-gray-400 mb-4">Total quantity requested per category</p>
                  {!data.demandByCategory?.length ? <EmptyChart message="No demand data yet" /> : (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={data.demandByCategory} margin={{ top: 5, right: 10, left: 0, bottom: 30 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="category" tick={{ fontSize: 10, fill: '#6b7280' }} angle={-20} textAnchor="end" />
                        <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} allowDecimals={false} />
                        <Tooltip content={<CustomTooltip prefix="" suffix=" units" />} />
                        <Bar dataKey="totalQuantity" name="Demand" radius={[5, 5, 0, 0]} maxBarSize={40}>
                          {data.demandByCategory.map((_, i) => (
                            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </ChartCard>

                {/* Demand by Livestock — horizontal bars / heatmap table */}
                <ChartCard>
                  <p className="text-sm font-bold text-gray-700 mb-1">Demand by Livestock Type</p>
                  <p className="text-xs text-gray-400 mb-4">Which livestock types request the most supplies</p>
                  {!data.demandByLivestock?.length ? <EmptyChart message="No livestock demand data yet" /> : (
                    <div className="space-y-2.5 mt-1">
                      {data.demandByLivestock.map((item, i) => {
                        const max = data.demandByLivestock[0]?.totalQuantity || 1;
                        const pct = Math.round((item.totalQuantity / max) * 100);
                        // Heat color based on intensity
                        const intensity = pct;
                        const heatBg = intensity >= 80 ? 'rgba(239,68,68,0.12)' :
                                       intensity >= 60 ? 'rgba(245,158,11,0.12)' :
                                       intensity >= 40 ? 'rgba(26,107,64,0.12)' : 'rgba(8,145,178,0.08)';
                        const heatColor = intensity >= 80 ? '#dc2626' :
                                          intensity >= 60 ? '#b45309' :
                                          intensity >= 40 ? '#1a6b40' : '#0891b2';
                        return (
                          <div key={i} className="rounded-xl p-2.5" style={{ background: heatBg }}>
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-2">
                                <PetsOutlinedIcon style={{ fontSize: 14, color: heatColor }} />
                                <span className="text-xs font-semibold text-gray-700 truncate max-w-[140px]">{item.livestock}</span>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <span className="text-xs font-bold" style={{ color: heatColor }}>{item.totalQuantity} units</span>
                                <span className="text-[10px] text-gray-400">{item.totalRequests} req</span>
                              </div>
                            </div>
                            <div className="w-full bg-white/50 rounded-full h-1.5">
                              <div className="h-1.5 rounded-full transition-all duration-700"
                                style={{ width: `${pct}%`, background: heatColor }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </ChartCard>

                {/* Category demand table (full width) */}
                <ChartCard className="lg:col-span-2">
                  <div className="flex items-center gap-2 mb-4">
                    <CategoryOutlinedIcon style={{ fontSize: 18, color: '#1a6b40' }} />
                    <p className="text-sm font-bold text-gray-700">Category Demand Summary Table</p>
                  </div>
                  {!data.demandByCategory?.length ? (
                    <EmptyChart message="No demand data yet" />
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[500px]">
                        <thead>
                          <tr style={{ background: 'linear-gradient(135deg, #0d4a2e, #1a6b40)' }}>
                            {['Category', 'Total Requests', 'Total Qty Demanded', 'Approved', 'Approval Rate'].map(h => (
                              <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider"
                                style={{ color: 'rgba(255,255,255,0.85)' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {data.demandByCategory.map((row, i) => {
                            const approvalRate = row.totalRequests > 0
                              ? Math.round((row.approved / row.totalRequests) * 100)
                              : 0;
                            return (
                              <tr key={i} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3">
                                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-800">
                                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                                    {row.category}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-sm font-semibold text-gray-700">{row.totalRequests}</td>
                                <td className="px-4 py-3 text-sm font-semibold text-gray-700">{row.totalQuantity}</td>
                                <td className="px-4 py-3 text-sm text-emerald-700 font-semibold">{row.approved}</td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-gray-100 rounded-full h-1.5 max-w-[80px]">
                                      <div className="h-1.5 rounded-full" style={{ width: `${approvalRate}%`, background: '#1a6b40' }} />
                                    </div>
                                    <span className="text-xs font-bold text-gray-600">{approvalRate}%</span>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </ChartCard>
              </div>
            </div>

            {/* ════════════════════════════════
                INVENTORY ALERTS FOOTER
            ════════════════════════════════ */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
              {[
                { label: 'Low Stock Feeds',    value: s.lowStockFeeds    ?? 0, color: '#b45309', bg: 'rgba(180,83,9,0.08)',    border: 'rgba(180,83,9,0.2)',    icon: <WarningAmberOutlinedIcon style={{ fontSize: 16 }} /> },
                { label: 'OOS Feeds',          value: s.outOfStockFeeds  ?? 0, color: '#dc2626', bg: 'rgba(220,38,38,0.08)',   border: 'rgba(220,38,38,0.2)',   icon: <LocalDiningOutlinedIcon style={{ fontSize: 16 }} /> },
                { label: 'Low Stock Meds',     value: s.lowStockMeds     ?? 0, color: '#b45309', bg: 'rgba(180,83,9,0.08)',    border: 'rgba(180,83,9,0.2)',    icon: <WarningAmberOutlinedIcon style={{ fontSize: 16 }} /> },
                { label: 'OOS Meds',           value: s.outOfStockMeds   ?? 0, color: '#dc2626', bg: 'rgba(220,38,38,0.08)',   border: 'rgba(220,38,38,0.2)',   icon: <MedicalServicesOutlinedIcon style={{ fontSize: 16 }} /> },
                { label: 'Expiring Soon',      value: s.expiringMeds     ?? 0, color: '#7c3aed', bg: 'rgba(124,58,237,0.08)',  border: 'rgba(124,58,237,0.2)',  icon: <InventoryOutlinedIcon style={{ fontSize: 16 }} /> },
                { label: 'Conversion Rate',    value: `${s.conversionRate ?? 0}%`, color: '#1a6b40', bg: 'rgba(26,107,64,0.08)', border: 'rgba(26,107,64,0.2)', icon: <TrendingUpOutlinedIcon style={{ fontSize: 16 }} /> },
              ].map(({ label, value, color, bg, border, icon }) => (
                <div key={label} className="bg-white rounded-2xl p-3 border shadow-sm flex items-center gap-2" style={{ borderColor: border }}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: bg, color }}>{icon}</div>
                  <div>
                    <p className="text-base font-extrabold" style={{ color }}>{value}</p>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider leading-tight">{label}</p>
                  </div>
                </div>
              ))}
            </div>

          </>
        )}
      </div>
    </div>

      {/* ════════ KPI MODALS ════════ */}
      {activeModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          onClick={() => setActiveModal(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="relative p-6 pb-4 flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #0d4a2e, #1a6b40)' }}>
              <div className="absolute inset-0 opacity-10"
                style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.03) 10px, rgba(255,255,255,0.03) 20px)' }} />
              <button onClick={() => setActiveModal(null)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white border-none cursor-pointer transition-colors">
                <span style={{ fontSize: 18, lineHeight: 1 }}>✕</span>
              </button>
              <div className="relative flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-white/15">
                  {activeModal === 'revenue'  && <CurrencyRupeeOutlinedIcon style={{ color: '#4ade80', fontSize: 24 }} />}
                  {activeModal === 'orders'   && <ShoppingCartOutlinedIcon  style={{ color: '#4ade80', fontSize: 24 }} />}
                  {activeModal === 'feed'     && <LocalDiningOutlinedIcon   style={{ color: '#4ade80', fontSize: 24 }} />}
                  {activeModal === 'medicine' && <MedicalServicesOutlinedIcon style={{ color: '#4ade80', fontSize: 24 }} />}
                </div>
                <div>
                  <p className="text-white/60 text-xs font-semibold uppercase tracking-wider">Details</p>
                  <h3 className="text-white font-bold text-lg leading-tight">
                    {activeModal === 'revenue'  && 'Total Revenue Breakdown'}
                    {activeModal === 'orders'   && 'Orders Overview'}
                    {activeModal === 'feed'     && 'Feed Inventory Status'}
                    {activeModal === 'medicine' && 'Medicine Inventory Status'}
                  </h3>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto p-6 space-y-4">

              {/* ── REVENUE MODAL ── */}
              {activeModal === 'revenue' && (
                <>
                  {/* Total */}
                  <div className="rounded-2xl p-4" style={{ background: 'rgba(26,107,64,0.07)', border: '1px solid rgba(26,107,64,0.2)' }}>
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Total Revenue</p>
                    <p className="text-3xl font-extrabold" style={{ color: '#1a6b40' }}>₹{(s.totalRevenue ?? 0).toLocaleString('en-IN')}</p>
                    <p className="text-xs text-gray-400 mt-0.5">From all approved orders</p>
                  </div>
                  {/* Feed vs Medicine split */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl p-4 bg-blue-50 border border-blue-200">
                      <div className="flex items-center gap-2 mb-1">
                        <LocalDiningOutlinedIcon style={{ fontSize: 16, color: '#1d4ed8' }} />
                        <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">Feed Revenue</p>
                      </div>
                      <p className="text-2xl font-extrabold text-blue-700">₹{(s.feedRevenue ?? 0).toLocaleString('en-IN')}</p>
                      <p className="text-xs text-blue-400 mt-0.5">
                        {s.totalRevenue ? Math.round((s.feedRevenue / s.totalRevenue) * 100) : 0}% of total
                      </p>
                    </div>
                    <div className="rounded-2xl p-4 bg-purple-50 border border-purple-200">
                      <div className="flex items-center gap-2 mb-1">
                        <MedicalServicesOutlinedIcon style={{ fontSize: 16, color: '#7c3aed' }} />
                        <p className="text-xs font-bold text-purple-700 uppercase tracking-wider">Medicine Revenue</p>
                      </div>
                      <p className="text-2xl font-extrabold text-purple-700">₹{(s.medicineRevenue ?? 0).toLocaleString('en-IN')}</p>
                      <p className="text-xs text-purple-400 mt-0.5">
                        {s.totalRevenue ? Math.round((s.medicineRevenue / s.totalRevenue) * 100) : 0}% of total
                      </p>
                    </div>
                  </div>
                  {/* Top earning products */}
                  {data?.topProducts?.length > 0 && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Top Earning Products</p>
                      <div className="space-y-2">
                        {data.topProducts.slice(0, 5).map((p, i) => (
                          <div key={i} className="flex items-center justify-between py-2 px-3 rounded-xl bg-gray-50">
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{['🥇','🥈','🥉','4️⃣','5️⃣'][i]}</span>
                              <span className="text-sm font-semibold text-gray-700 truncate max-w-[160px]">{p.name}</span>
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                                p.type === 'Feed' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-purple-50 text-purple-700 border-purple-200'
                              }`}>{p.type}</span>
                            </div>
                            <span className="text-sm font-extrabold" style={{ color: '#1a6b40' }}>₹{p.totalRevenue.toLocaleString('en-IN')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Monthly revenue last 6 months */}
                  {data?.monthlyOrders?.length > 0 && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Monthly Revenue (Last 6 Months)</p>
                      <div className="space-y-2">
                        {[...data.monthlyOrders].reverse().map((m, i) => {
                          const max = Math.max(...data.monthlyOrders.map(x => x.revenue), 1);
                          const pct = Math.round((m.revenue / max) * 100);
                          return (
                            <div key={i} className="flex items-center gap-3">
                              <span className="text-xs text-gray-500 w-16 flex-shrink-0">{m.label}</span>
                              <div className="flex-1 bg-gray-100 rounded-full h-2">
                                <div className="h-2 rounded-full" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #1a6b40, #4ade80)' }} />
                              </div>
                              <span className="text-xs font-bold text-gray-700 w-20 text-right">₹{m.revenue.toLocaleString('en-IN')}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {/* Conversion rate */}
                  <div className="rounded-2xl p-4 bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Conversion Rate</p>
                      <p className="text-xs text-emerald-500 mt-0.5">{s.approvedCount ?? 0} approved / {s.totalOrders ?? 0} total orders</p>
                    </div>
                    <p className="text-3xl font-extrabold text-emerald-700">{s.conversionRate ?? 0}%</p>
                  </div>
                </>
              )}

              {/* ── ORDERS MODAL ── */}
              {activeModal === 'orders' && (
                <>
                  {/* Status breakdown */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Approved', value: s.approvedCount ?? 0, color: '#059669', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', icon: <CheckCircleOutlinedIcon style={{ fontSize: 20 }} /> },
                      { label: 'Pending',  value: s.pendingCount  ?? 0, color: '#b45309', bg: 'bg-amber-50',   border: 'border-amber-200',   text: 'text-amber-700',   icon: <HourglassEmptyOutlinedIcon style={{ fontSize: 20 }} /> },
                      { label: 'Rejected', value: s.rejectedCount ?? 0, color: '#dc2626', bg: 'bg-red-50',     border: 'border-red-200',     text: 'text-red-600',     icon: <CancelOutlinedIcon style={{ fontSize: 20 }} /> },
                    ].map(({ label, value, color, bg, border, text, icon }) => (
                      <div key={label} className={`${bg} border ${border} rounded-2xl p-4 text-center`}>
                        <div className="flex justify-center mb-1" style={{ color }}>{icon}</div>
                        <p className={`text-2xl font-extrabold ${text}`}>{value}</p>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
                      </div>
                    ))}
                  </div>
                  {/* Feed vs Medicine orders */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl p-4 bg-blue-50 border border-blue-200">
                      <div className="flex items-center gap-2 mb-1">
                        <LocalDiningOutlinedIcon style={{ fontSize: 16, color: '#1d4ed8' }} />
                        <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">Feed Orders</p>
                      </div>
                      <p className="text-2xl font-extrabold text-blue-700">{s.feedOrders ?? 0}</p>
                    </div>
                    <div className="rounded-2xl p-4 bg-purple-50 border border-purple-200">
                      <div className="flex items-center gap-2 mb-1">
                        <MedicalServicesOutlinedIcon style={{ fontSize: 16, color: '#7c3aed' }} />
                        <p className="text-xs font-bold text-purple-700 uppercase tracking-wider">Medicine Orders</p>
                      </div>
                      <p className="text-2xl font-extrabold text-purple-700">{s.medicineOrders ?? 0}</p>
                    </div>
                  </div>
                  {/* Conversion rate */}
                  <div className="rounded-2xl p-4 bg-gray-50 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Approval Rate</p>
                      <p className="text-lg font-extrabold" style={{ color: '#1a6b40' }}>{s.conversionRate ?? 0}%</p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="h-2.5 rounded-full" style={{ width: `${s.conversionRate ?? 0}%`, background: 'linear-gradient(90deg, #1a6b40, #4ade80)' }} />
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>{s.approvedCount ?? 0} approved</span>
                      <span>{s.rejectedCount ?? 0} rejected</span>
                    </div>
                  </div>
                  {/* Monthly orders */}
                  {data?.monthlyOrders?.length > 0 && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Monthly Orders (Last 6 Months)</p>
                      <div className="space-y-2">
                        {[...data.monthlyOrders].reverse().map((m, i) => {
                          const max = Math.max(...data.monthlyOrders.map(x => x.total), 1);
                          const pct = Math.round((m.total / max) * 100);
                          return (
                            <div key={i} className="flex items-center gap-3">
                              <span className="text-xs text-gray-500 w-16 flex-shrink-0">{m.label}</span>
                              <div className="flex-1 bg-gray-100 rounded-full h-2">
                                <div className="h-2 rounded-full" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #0891b2, #38bdf8)' }} />
                              </div>
                              <span className="text-xs font-bold text-gray-700 w-12 text-right">{m.total} orders</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {/* Top requested products */}
                  {data?.topProducts?.length > 0 && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Most Requested Products</p>
                      <div className="space-y-2">
                        {data.topProducts.slice(0, 5).map((p, i) => (
                          <div key={i} className="flex items-center justify-between py-2 px-3 rounded-xl bg-gray-50">
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{['🥇','🥈','🥉','4️⃣','5️⃣'][i]}</span>
                              <span className="text-sm font-semibold text-gray-700 truncate max-w-[180px]">{p.name}</span>
                            </div>
                            <span className="text-sm font-extrabold text-cyan-700">{p.totalQuantity} units</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* ── FEED MODAL ── */}
              {activeModal === 'feed' && (
                <>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Total Feeds',  value: s.totalFeedItems  ?? 0, bg: 'bg-blue-50',   border: 'border-blue-200',   text: 'text-blue-700'   },
                      { label: 'Low Stock',    value: s.lowStockFeeds   ?? 0, bg: 'bg-amber-50',  border: 'border-amber-200',  text: 'text-amber-700'  },
                      { label: 'Out of Stock', value: s.outOfStockFeeds ?? 0, bg: 'bg-red-50',    border: 'border-red-200',    text: 'text-red-600'    },
                    ].map(({ label, value, bg, border, text }) => (
                      <div key={label} className={`${bg} border ${border} rounded-2xl p-4 text-center`}>
                        <p className={`text-2xl font-extrabold ${text}`}>{value}</p>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-0.5">{label}</p>
                      </div>
                    ))}
                  </div>
                  {/* Feed revenue */}
                  <div className="rounded-2xl p-4 bg-blue-50 border border-blue-200 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">Feed Revenue</p>
                      <p className="text-xs text-blue-400 mt-0.5">{s.feedOrders ?? 0} feed orders placed</p>
                    </div>
                    <p className="text-2xl font-extrabold text-blue-700">₹{(s.feedRevenue ?? 0).toLocaleString('en-IN')}</p>
                  </div>
                  {/* Demand by category — feed */}
                  {data?.demandByCategory?.filter(d => d.category?.toLowerCase().includes('feed') || !d.category?.toLowerCase().includes('medicine')).length > 0 && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Feed Demand by Category</p>
                      <div className="space-y-2">
                        {data.demandByCategory.filter(d => !d.category?.toLowerCase().includes('medicine')).map((d, i) => {
                          const max = Math.max(...data.demandByCategory.map(x => x.totalQuantity), 1);
                          const pct = Math.round((d.totalQuantity / max) * 100);
                          return (
                            <div key={i} className="flex items-center gap-3">
                              <span className="text-xs text-gray-600 w-24 flex-shrink-0 truncate">{d.category}</span>
                              <div className="flex-1 bg-gray-100 rounded-full h-2">
                                <div className="h-2 rounded-full" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #1d4ed8, #60a5fa)' }} />
                              </div>
                              <span className="text-xs font-bold text-gray-700 w-16 text-right">{d.totalQuantity} units</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {/* Top feed products */}
                  {data?.topProducts?.filter(p => p.type === 'Feed').length > 0 && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Top Selling Feeds</p>
                      <div className="space-y-2">
                        {data.topProducts.filter(p => p.type === 'Feed').slice(0, 5).map((p, i) => (
                          <div key={i} className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-blue-50 border border-blue-100">
                            <div className="flex items-center gap-2">
                              <LocalDiningOutlinedIcon style={{ fontSize: 14, color: '#1d4ed8' }} />
                              <span className="text-sm font-semibold text-gray-700 truncate max-w-[160px]">{p.name}</span>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-extrabold text-blue-700">{p.totalQuantity} units</p>
                              <p className="text-[10px] text-gray-400">₹{p.totalRevenue.toLocaleString('en-IN')}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* ── MEDICINE MODAL ── */}
              {activeModal === 'medicine' && (
                <>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Total Meds',   value: s.totalMedItems  ?? 0, bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' },
                      { label: 'Low Stock',    value: s.lowStockMeds   ?? 0, bg: 'bg-amber-50',  border: 'border-amber-200',  text: 'text-amber-700'  },
                      { label: 'Expiring Soon',value: s.expiringMeds   ?? 0, bg: 'bg-red-50',    border: 'border-red-200',    text: 'text-red-600'    },
                    ].map(({ label, value, bg, border, text }) => (
                      <div key={label} className={`${bg} border ${border} rounded-2xl p-4 text-center`}>
                        <p className={`text-2xl font-extrabold ${text}`}>{value}</p>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-0.5">{label}</p>
                      </div>
                    ))}
                  </div>
                  {/* Out of stock meds */}
                  <div className="rounded-2xl p-4 bg-red-50 border border-red-200 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-red-600 uppercase tracking-wider">Out of Stock</p>
                      <p className="text-xs text-red-400 mt-0.5">Medicines with 0 units remaining</p>
                    </div>
                    <p className="text-2xl font-extrabold text-red-600">{s.outOfStockMeds ?? 0}</p>
                  </div>
                  {/* Medicine revenue */}
                  <div className="rounded-2xl p-4 bg-purple-50 border border-purple-200 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-purple-700 uppercase tracking-wider">Medicine Revenue</p>
                      <p className="text-xs text-purple-400 mt-0.5">{s.medicineOrders ?? 0} medicine orders placed</p>
                    </div>
                    <p className="text-2xl font-extrabold text-purple-700">₹{(s.medicineRevenue ?? 0).toLocaleString('en-IN')}</p>
                  </div>
                  {/* Top medicine products */}
                  {data?.topProducts?.filter(p => p.type === 'Medicine').length > 0 && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Top Selling Medicines</p>
                      <div className="space-y-2">
                        {data.topProducts.filter(p => p.type === 'Medicine').slice(0, 5).map((p, i) => (
                          <div key={i} className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-purple-50 border border-purple-100">
                            <div className="flex items-center gap-2">
                              <MedicalServicesOutlinedIcon style={{ fontSize: 14, color: '#7c3aed' }} />
                              <span className="text-sm font-semibold text-gray-700 truncate max-w-[160px]">{p.name}</span>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-extrabold text-purple-700">{p.totalQuantity} units</p>
                              <p className="text-[10px] text-gray-400">₹{p.totalRevenue.toLocaleString('en-IN')}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Demand by livestock for medicines */}
                  {data?.demandByLivestock?.length > 0 && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Medicine Demand by Livestock</p>
                      <div className="space-y-2">
                        {data.demandByLivestock.slice(0, 5).map((item, i) => {
                          const max = data.demandByLivestock[0]?.totalQuantity || 1;
                          const pct = Math.round((item.totalQuantity / max) * 100);
                          return (
                            <div key={i} className="flex items-center gap-3">
                              <span className="text-xs text-gray-600 w-24 flex-shrink-0 truncate">{item.livestock}</span>
                              <div className="flex-1 bg-gray-100 rounded-full h-2">
                                <div className="h-2 rounded-full" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #7c3aed, #a78bfa)' }} />
                              </div>
                              <span className="text-xs font-bold text-gray-700 w-16 text-right">{item.totalQuantity} units</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0">
              <button onClick={() => setActiveModal(null)}
                className="w-full py-3 rounded-2xl text-white font-bold text-sm border-none cursor-pointer hover:opacity-90 transition-all"
                style={{ background: 'linear-gradient(135deg, #1a6b40, #0d4a2e)' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SupplierDashboard;