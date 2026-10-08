import React, { useState } from 'react';
import { useQuery } from 'react-query';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import OwnerNavbar from './OwnerNavbar';
import api from '../apiConfig';

// MUI Icons
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import PetsOutlinedIcon from '@mui/icons-material/PetsOutlined';
import CurrencyRupeeOutlinedIcon from '@mui/icons-material/CurrencyRupeeOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import HourglassEmptyOutlinedIcon from '@mui/icons-material/HourglassEmptyOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import FavoriteOutlinedIcon from '@mui/icons-material/FavoriteOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import LocalDiningOutlinedIcon from '@mui/icons-material/LocalDiningOutlined';
import MedicalServicesOutlinedIcon from '@mui/icons-material/MedicalServicesOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import MonitorHeartOutlinedIcon from '@mui/icons-material/MonitorHeartOutlined';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';

/* ── API call ── */
const fetchOwnerAnalytics = async () => {
  const res = await api.get('/analytics/owner');
  return res.data;
};

/* ── Color palette consistent with app theme ── */
const GREEN_GRADIENT = ['#1a6b40', '#2d9e5f', '#4ade80', '#86efac'];
const CHART_COLORS = ['#1a6b40', '#0891b2', '#7c3aed', '#f59e0b', '#ef4444', '#10b981'];
const PIE_COLORS = ['#1a6b40', '#f59e0b', '#ef4444', '#0891b2', '#7c3aed', '#10b981'];

/* ── Custom Tooltip ── */
const CustomTooltip = ({ active, payload, label, prefix = '₹', suffix = '' }) => {
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
  <div className="bg-white rounded-2xl p-5 border shadow-sm flex items-center gap-4 hover:shadow-md transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
    style={{ borderColor: border }} onClick={onClick}>
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

/* ── Chart Card wrapper ── */
const ChartCard = ({ children, className = '' }) => (
  <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-5 ${className}`}>
    {children}
  </div>
);

/* ── Empty state ── */
const EmptyChart = ({ message = 'No data available yet' }) => (
  <div className="flex flex-col items-center justify-center h-40 gap-2 text-gray-300">
    <BarChartOutlinedIcon style={{ fontSize: 36 }} />
    <p className="text-xs font-semibold">{message}</p>
  </div>
);

/* ══════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════ */
const OwnerDashboard = () => {
  const [spendingChartType, setSpendingChartType] = useState('bar');
  const [activeModal, setActiveModal] = useState(null); // 'spending' | 'orders' | 'livestock' | 'attention'

  const { data, isLoading, isError } = useQuery({
    queryKey: ['ownerAnalytics'],
    queryFn: fetchOwnerAnalytics,
    retry: 1,
    refetchInterval: 30000,
    refetchOnWindowFocus: false,
    onError: () => {},
  });

  const s = data?.summary || {};

  return (
    <>
    <div className="min-h-screen" style={{ background: '#f0f4f0' }}>
      <OwnerNavbar />

      {/* ── Hero Header ── */}
      <div
        className="w-full py-10 px-4 text-center relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0d4a2e 0%, #1a6b40 50%, #0a3d26 100%)' }}
      >
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.03) 10px, rgba(255,255,255,0.03) 20px)' }} />
        <div className="relative">
          <h1 className="text-4xl font-bold text-white mb-2" style={{ fontFamily: "'Nunito', sans-serif" }}>
            Analytics{' '}
            <span style={{ color: '#4ade80', fontStyle: 'italic' }}>Dashboard</span>
          </h1>
          <p className="text-white/60 text-sm">Insights to help you make better decisions for your farm</p>
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

        {/* ── Error ── */}
        {isError && !isLoading && (
          <div className="flex flex-col items-center justify-center py-32 gap-3">
            <WarningAmberOutlinedIcon style={{ fontSize: 44, color: '#ef4444' }} />
            <p className="text-red-500 font-semibold text-sm">Failed to load analytics. Please try again.</p>
          </div>
        )}

        {data && !isLoading && (
          <>
            {/* ════════════════════════════════
                KPI SUMMARY ROW
            ════════════════════════════════ */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <KpiCard
                label="Total Spending" value={s.totalSpending ?? 0} prefix="₹"
                icon={<CurrencyRupeeOutlinedIcon style={{ fontSize: 22 }} />}
                color="#1a6b40" bg="rgba(26,107,64,0.1)" border="rgba(26,107,64,0.2)"
                sub="Approved requests"
                onClick={() => setActiveModal('spending')}
              />
              <KpiCard
                label="Total Orders" value={s.totalOrders ?? 0}
                icon={<ShoppingCartOutlinedIcon style={{ fontSize: 22 }} />}
                color="#0891b2" bg="rgba(8,145,178,0.1)" border="rgba(8,145,178,0.2)"
                sub={`${s.pendingOrders ?? 0} pending`}
                onClick={() => setActiveModal('orders')}
              />
              <KpiCard
                label="My Livestock" value={s.totalLivestock ?? 0}
                icon={<PetsOutlinedIcon style={{ fontSize: 22 }} />}
                color="#7c3aed" bg="rgba(124,58,237,0.1)" border="rgba(124,58,237,0.2)"
                sub={`${s.healthyCount ?? 0} healthy`}
                onClick={() => setActiveModal('livestock')}
              />
              <KpiCard
                label="Need Attention" value={s.needsAttention ?? 0}
                icon={<WarningAmberOutlinedIcon style={{ fontSize: 22 }} />}
                color="#f59e0b" bg="rgba(245,158,11,0.1)" border="rgba(245,158,11,0.2)"
                sub="Livestock"
                onClick={() => setActiveModal('attention')}
              />
            </div>

            {/* ── Order Status Mini Cards ── */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { label: 'Approved', value: s.approvedOrders ?? 0, icon: <CheckCircleOutlinedIcon style={{ fontSize: 18 }} />, color: '#059669', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' },
                { label: 'Pending',  value: s.pendingOrders  ?? 0, icon: <HourglassEmptyOutlinedIcon style={{ fontSize: 18 }} />, color: '#b45309', bg: 'bg-amber-50',   border: 'border-amber-200',   text: 'text-amber-700'   },
                { label: 'Rejected', value: s.rejectedOrders ?? 0, icon: <CancelOutlinedIcon style={{ fontSize: 18 }} />,        color: '#dc2626', bg: 'bg-red-50',     border: 'border-red-200',     text: 'text-red-600'     },
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
                FR-1: MONTHLY SPENDING
            ════════════════════════════════ */}
            <div className="mb-8">
              <SectionHeader
                icon={<TrendingUpOutlinedIcon style={{ fontSize: 20 }} />}
                title="FR-1: Monthly Spending"
                subtitle="Total spending per month on approved feed & medicine orders"
              />
              <ChartCard>
                {/* Toggle */}
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <p className="text-xs text-gray-400">Last 6 months — ₹ spent on approved orders</p>
                  <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
                    {['bar', 'line'].map(type => (
                      <button key={type} onClick={() => setSpendingChartType(type)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border-none cursor-pointer
                          ${spendingChartType === type ? 'text-white shadow' : 'text-gray-500 bg-transparent hover:text-gray-700'}`}
                        style={spendingChartType === type ? { background: 'linear-gradient(135deg, #1a6b40, #0d4a2e)' } : {}}>
                        {type === 'bar' ? 'Bar' : 'Line'}
                      </button>
                    ))}
                  </div>
                </div>

                {!data.monthlySpending?.length ? <EmptyChart message="No spending data yet" /> : (
                  <ResponsiveContainer width="100%" height={260}>
                    {spendingChartType === 'bar' ? (
                      <BarChart data={data.monthlySpending} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                        <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={v => `₹${v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v}`} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="spending" name="Spending" radius={[6, 6, 0, 0]} maxBarSize={48}>
                          {data.monthlySpending.map((_, i) => (
                            <Cell key={i} fill={i === data.monthlySpending.length - 1 ? '#1a6b40' : '#4ade80'} />
                          ))}
                        </Bar>
                      </BarChart>
                    ) : (
                      <AreaChart data={data.monthlySpending} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                        <defs>
                          <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#1a6b40" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#1a6b40" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                        <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={v => `₹${v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v}`} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="spending" name="Spending" stroke="#1a6b40" strokeWidth={2.5} fill="url(#spendGrad)" dot={{ fill: '#1a6b40', r: 4 }} />
                      </AreaChart>
                    )}
                  </ResponsiveContainer>
                )}
              </ChartCard>
            </div>

            {/* ════════════════════════════════
                FR-2: ORDER INSIGHTS
            ════════════════════════════════ */}
            <div className="mb-8">
              <SectionHeader
                icon={<ShoppingCartOutlinedIcon style={{ fontSize: 20 }} />}
                title="FR-2: Order Insights"
                subtitle="Most purchased products, order frequency, and feed vs medicine split"
              />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                {/* Most Purchased Products */}
                <ChartCard className="lg:col-span-2">
                  <p className="text-sm font-bold text-gray-700 mb-4">Most Purchased Products</p>
                  {!data.mostPurchased?.length ? <EmptyChart message="No purchase data yet" /> : (
                    <div className="space-y-3">
                      {data.mostPurchased.map((item, i) => {
                        const max = data.mostPurchased[0]?.totalQuantity || 1;
                        const pct = Math.round((item.totalQuantity / max) * 100);
                        const isFeed = item.type === 'Feed';
                        return (
                          <div key={i}>
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[10px] font-bold border
                                  ${isFeed ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-purple-50 text-purple-700 border-purple-200'}`}>
                                  {isFeed ? <LocalDiningOutlinedIcon style={{ fontSize: 10 }} /> : <MedicalServicesOutlinedIcon style={{ fontSize: 10 }} />}
                                  {item.type}
                                </span>
                                <span className="text-sm font-semibold text-gray-700 truncate max-w-[160px]">{item.name}</span>
                              </div>
                              <span className="text-xs font-bold text-gray-500 flex-shrink-0">{item.totalQuantity} units</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                              <div className="h-2 rounded-full transition-all duration-500"
                                style={{ width: `${pct}%`, background: CHART_COLORS[i % CHART_COLORS.length] }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </ChartCard>

                {/* Feed vs Medicine Pie */}
                <ChartCard>
                  <p className="text-sm font-bold text-gray-700 mb-4">Order Split</p>
                  {s.feedOrders === 0 && s.medicineOrders === 0 ? (
                    <EmptyChart message="No orders yet" />
                  ) : (
                    <>
                      <ResponsiveContainer width="100%" height={180}>
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Feed', value: s.feedOrders ?? 0 },
                              { name: 'Medicine', value: s.medicineOrders ?? 0 },
                            ]}
                            cx="50%" cy="50%" innerRadius={50} outerRadius={75}
                            paddingAngle={4} dataKey="value"
                          >
                            <Cell fill="#1d4ed8" />
                            <Cell fill="#7c3aed" />
                          </Pie>
                          <Tooltip formatter={(v, n) => [`${v} orders`, n]} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="flex justify-center gap-4 mt-2">
                        {[{ label: 'Feed', count: s.feedOrders ?? 0, color: '#1d4ed8' }, { label: 'Medicine', count: s.medicineOrders ?? 0, color: '#7c3aed' }].map(({ label, count, color }) => (
                          <div key={label} className="flex items-center gap-1.5 text-xs font-semibold text-gray-600">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                            {label}: {count}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </ChartCard>

                {/* Order Frequency */}
                <ChartCard className="lg:col-span-3">
                  <p className="text-sm font-bold text-gray-700 mb-4">Order Frequency (Last 6 Months)</p>
                  {!data.orderFrequency?.length ? <EmptyChart message="No order history yet" /> : (
                    <ResponsiveContainer width="100%" height={220}>
                      <LineChart data={data.orderFrequency} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                        <Tooltip content={<CustomTooltip prefix="" suffix=" orders" />} />
                        <Line type="monotone" dataKey="count" name="Orders" stroke="#0891b2" strokeWidth={2.5}
                          dot={{ fill: '#0891b2', r: 4 }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </ChartCard>
              </div>
            </div>

            {/* ════════════════════════════════
                FR-3: ANIMAL HEALTH TRENDS
            ════════════════════════════════ */}
            <div className="mb-8">
              <SectionHeader
                icon={<MonitorHeartOutlinedIcon style={{ fontSize: 20 }} />}
                title="FR-3: Animal Health Trends"
                subtitle="Health condition distribution, medicine usage by species, and treatment alerts"
              />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                {/* Health Distribution Pie */}
                <ChartCard>
                  <p className="text-sm font-bold text-gray-700 mb-4">Health Condition Distribution</p>
                  {!data.healthDistribution?.length ? (
                    <EmptyChart message="No livestock added yet" />
                  ) : (
                    <>
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie data={data.healthDistribution} cx="50%" cy="50%"
                            outerRadius={75} dataKey="count" nameKey="condition" paddingAngle={3}
                            label={({ condition, percent }) => `${condition} ${(percent * 100).toFixed(0)}%`}
                            labelLine={false}
                          >
                            {data.healthDistribution.map((_, i) => (
                              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(v, n) => [`${v} animals`, n]} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-2">
                        {data.healthDistribution.map((item, i) => (
                          <div key={i} className="flex items-center gap-1 text-xs text-gray-500">
                            <span className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                            {item.condition}: {item.count}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </ChartCard>

                {/* Medicine Usage by Species */}
                <ChartCard className="lg:col-span-2">
                  <p className="text-sm font-bold text-gray-700 mb-4">Medicine Usage by Livestock Species</p>
                  {!data.medicineBySpecies?.length ? (
                    <EmptyChart message="No medicine orders approved yet" />
                  ) : (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={data.medicineBySpecies} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                        <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} allowDecimals={false} />
                        <YAxis type="category" dataKey="species" tick={{ fontSize: 11, fill: '#6b7280' }} width={80} />
                        <Tooltip content={<CustomTooltip prefix="" suffix=" units" />} />
                        <Bar dataKey="quantity" name="Medicine Used" radius={[0, 6, 6, 0]} maxBarSize={28}>
                          {data.medicineBySpecies.map((_, i) => (
                            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </ChartCard>

                {/* Frequent Treatment Alerts */}
                <ChartCard className="lg:col-span-3">
                  <div className="flex items-center gap-2 mb-4">
                    <NotificationsActiveOutlinedIcon style={{ fontSize: 18, color: '#f59e0b' }} />
                    <p className="text-sm font-bold text-gray-700">Alerts — Frequent Treatments</p>
                    <span className="ml-auto text-xs text-gray-400">Animals with 2+ medicine requests</span>
                  </div>
                  {!data.frequentTreatments?.length ? (
                    <div className="flex flex-col items-center justify-center py-8 gap-2 text-gray-300">
                      <FavoriteOutlinedIcon style={{ fontSize: 32, color: '#4ade80' }} />
                      <p className="text-xs font-semibold text-gray-400">All animals seem healthy — no frequent treatments detected!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {data.frequentTreatments.map((item, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-amber-100 bg-amber-50">
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-amber-100">
                            <WarningAmberOutlinedIcon style={{ fontSize: 18, color: '#b45309' }} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-800 truncate">{item.animal}</p>
                            <p className="text-xs text-amber-700 font-semibold">{item.count} medicine orders</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ChartCard>

              </div>
            </div>

            {/* ── Quick Stats Footer ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              {[
                { label: 'Feed Orders', value: s.feedOrders ?? 0, icon: <LocalDiningOutlinedIcon style={{ fontSize: 18 }} />, color: '#1d4ed8', bg: 'rgba(29,78,216,0.08)', border: 'rgba(29,78,216,0.2)' },
                { label: 'Medicine Orders', value: s.medicineOrders ?? 0, icon: <MedicalServicesOutlinedIcon style={{ fontSize: 18 }} />, color: '#7c3aed', bg: 'rgba(124,58,237,0.08)', border: 'rgba(124,58,237,0.2)' },
                { label: 'Healthy Animals', value: s.healthyCount ?? 0, icon: <FavoriteOutlinedIcon style={{ fontSize: 18 }} />, color: '#059669', bg: 'rgba(5,150,105,0.08)', border: 'rgba(5,150,105,0.2)' },
                { label: 'Needs Attention', value: s.needsAttention ?? 0, icon: <WarningAmberOutlinedIcon style={{ fontSize: 18 }} />, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)' },
              ].map(({ label, value, icon, color, bg, border }) => (
                <div key={label} className="bg-white rounded-2xl p-4 border shadow-sm flex items-center gap-3" style={{ borderColor: border }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg, color }}>{icon}</div>
                  <div>
                    <p className="text-lg font-extrabold" style={{ color }}>{value}</p>
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
                  {activeModal === 'spending'   && <CurrencyRupeeOutlinedIcon style={{ color: '#4ade80', fontSize: 24 }} />}
                  {activeModal === 'orders'     && <ShoppingCartOutlinedIcon  style={{ color: '#4ade80', fontSize: 24 }} />}
                  {activeModal === 'livestock'  && <PetsOutlinedIcon          style={{ color: '#4ade80', fontSize: 24 }} />}
                  {activeModal === 'attention'  && <WarningAmberOutlinedIcon  style={{ color: '#4ade80', fontSize: 24 }} />}
                </div>
                <div>
                  <p className="text-white/60 text-xs font-semibold uppercase tracking-wider">Details</p>
                  <h3 className="text-white font-bold text-lg leading-tight">
                    {activeModal === 'spending'  && 'Total Spending Breakdown'}
                    {activeModal === 'orders'    && 'Orders Overview'}
                    {activeModal === 'livestock' && 'My Livestock Overview'}
                    {activeModal === 'attention' && 'Livestock Needing Attention'}
                  </h3>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto p-6 space-y-4">

              {/* ── SPENDING MODAL ── */}
              {activeModal === 'spending' && (
                <>
                  <div className="rounded-2xl p-4" style={{ background: 'rgba(26,107,64,0.07)', border: '1px solid rgba(26,107,64,0.2)' }}>
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Total Spending</p>
                    <p className="text-3xl font-extrabold" style={{ color: '#1a6b40' }}>₹{(s.totalSpending ?? 0).toLocaleString('en-IN')}</p>
                    <p className="text-xs text-gray-400 mt-0.5">From all approved requests</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl p-4 bg-blue-50 border border-blue-200">
                      <div className="flex items-center gap-2 mb-1">
                        <LocalDiningOutlinedIcon style={{ fontSize: 16, color: '#1d4ed8' }} />
                        <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">Feed Spending</p>
                      </div>
                      <p className="text-2xl font-extrabold text-blue-700">₹{(s.feedSpending ?? 0).toLocaleString('en-IN')}</p>
                      <p className="text-xs text-blue-400 mt-0.5">
                        {s.totalSpending ? Math.round((s.feedSpending / s.totalSpending) * 100) : 0}% of total
                      </p>
                    </div>
                    <div className="rounded-2xl p-4 bg-purple-50 border border-purple-200">
                      <div className="flex items-center gap-2 mb-1">
                        <MedicalServicesOutlinedIcon style={{ fontSize: 16, color: '#7c3aed' }} />
                        <p className="text-xs font-bold text-purple-700 uppercase tracking-wider">Medicine Spending</p>
                      </div>
                      <p className="text-2xl font-extrabold text-purple-700">₹{(s.medicineSpending ?? 0).toLocaleString('en-IN')}</p>
                      <p className="text-xs text-purple-400 mt-0.5">
                        {s.totalSpending ? Math.round((s.medicineSpending / s.totalSpending) * 100) : 0}% of total
                      </p>
                    </div>
                  </div>
                  {data?.mostPurchased?.length > 0 && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Top Purchased Products</p>
                      <div className="space-y-2">
                        {data.mostPurchased.slice(0, 5).map((p, i) => (
                          <div key={i} className="flex items-center justify-between py-2 px-3 rounded-xl bg-gray-50">
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{['🥇','🥈','🥉','4️⃣','5️⃣'][i]}</span>
                              <span className="text-sm font-semibold text-gray-700 truncate max-w-[160px]">{p.name}</span>
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                                p.type === 'Feed' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-purple-50 text-purple-700 border-purple-200'
                              }`}>{p.type}</span>
                            </div>
                            <span className="text-sm font-extrabold" style={{ color: '#1a6b40' }}>{p.totalQuantity} units</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {data?.monthlySpending?.length > 0 && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Monthly Spending (Last 6 Months)</p>
                      <div className="space-y-2">
                        {[...data.monthlySpending].reverse().map((m, i) => {
                          const max = Math.max(...data.monthlySpending.map(x => x.spending), 1);
                          const pct = Math.round((m.spending / max) * 100);
                          return (
                            <div key={i} className="flex items-center gap-3">
                              <span className="text-xs text-gray-500 w-16 flex-shrink-0">{m.label}</span>
                              <div className="flex-1 bg-gray-100 rounded-full h-2">
                                <div className="h-2 rounded-full" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #1a6b40, #4ade80)' }} />
                              </div>
                              <span className="text-xs font-bold text-gray-700 w-20 text-right">₹{m.spending.toLocaleString('en-IN')}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* ── ORDERS MODAL ── */}
              {activeModal === 'orders' && (
                <>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Approved', value: s.approvedOrders ?? 0, color: '#059669', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', icon: <CheckCircleOutlinedIcon style={{ fontSize: 20 }} /> },
                      { label: 'Pending',  value: s.pendingOrders  ?? 0, color: '#b45309', bg: 'bg-amber-50',   border: 'border-amber-200',   text: 'text-amber-700',   icon: <HourglassEmptyOutlinedIcon style={{ fontSize: 20 }} /> },
                      { label: 'Rejected', value: s.rejectedOrders ?? 0, color: '#dc2626', bg: 'bg-red-50',     border: 'border-red-200',     text: 'text-red-600',     icon: <CancelOutlinedIcon style={{ fontSize: 20 }} /> },
                    ].map(({ label, value, color, bg, border, text, icon }) => (
                      <div key={label} className={`${bg} border ${border} rounded-2xl p-4 text-center`}>
                        <div className="flex justify-center mb-1" style={{ color }}>{icon}</div>
                        <p className={`text-2xl font-extrabold ${text}`}>{value}</p>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
                      </div>
                    ))}
                  </div>
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
                  <div className="rounded-2xl p-4 bg-gray-50 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Approval Rate</p>
                      <p className="text-lg font-extrabold" style={{ color: '#1a6b40' }}>
                        {s.totalOrders ? Math.round(((s.approvedOrders ?? 0) / s.totalOrders) * 100) : 0}%
                      </p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="h-2.5 rounded-full" style={{
                        width: `${s.totalOrders ? Math.round(((s.approvedOrders ?? 0) / s.totalOrders) * 100) : 0}%`,
                        background: 'linear-gradient(90deg, #1a6b40, #4ade80)'
                      }} />
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>{s.approvedOrders ?? 0} approved</span>
                      <span>{s.rejectedOrders ?? 0} rejected</span>
                    </div>
                  </div>
                  {data?.orderFrequency?.length > 0 && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Monthly Orders (Last 6 Months)</p>
                      <div className="space-y-2">
                        {[...data.orderFrequency].reverse().map((m, i) => {
                          const max = Math.max(...data.orderFrequency.map(x => x.count), 1);
                          const pct = Math.round((m.count / max) * 100);
                          return (
                            <div key={i} className="flex items-center gap-3">
                              <span className="text-xs text-gray-500 w-16 flex-shrink-0">{m.label}</span>
                              <div className="flex-1 bg-gray-100 rounded-full h-2">
                                <div className="h-2 rounded-full" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #0891b2, #38bdf8)' }} />
                              </div>
                              <span className="text-xs font-bold text-gray-700 w-12 text-right">{m.count} orders</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {data?.mostPurchased?.length > 0 && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Most Ordered Products</p>
                      <div className="space-y-2">
                        {data.mostPurchased.slice(0, 5).map((p, i) => (
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

              {/* ── LIVESTOCK MODAL ── */}
              {activeModal === 'livestock' && (
                <>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Total',    value: s.totalLivestock ?? 0, bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' },
                      { label: 'Healthy',  value: s.healthyCount   ?? 0, bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' },
                      { label: 'Attention',value: s.needsAttention ?? 0, bg: 'bg-amber-50',  border: 'border-amber-200',  text: 'text-amber-700'  },
                    ].map(({ label, value, bg, border, text }) => (
                      <div key={label} className={`${bg} border ${border} rounded-2xl p-4 text-center`}>
                        <p className={`text-2xl font-extrabold ${text}`}>{value}</p>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-0.5">{label}</p>
                      </div>
                    ))}
                  </div>
                  {/* Health rate */}
                  <div className="rounded-2xl p-4 bg-gray-50 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Health Rate</p>
                      <p className="text-lg font-extrabold" style={{ color: '#059669' }}>
                        {s.totalLivestock ? Math.round(((s.healthyCount ?? 0) / s.totalLivestock) * 100) : 0}%
                      </p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="h-2.5 rounded-full" style={{
                        width: `${s.totalLivestock ? Math.round(((s.healthyCount ?? 0) / s.totalLivestock) * 100) : 0}%`,
                        background: 'linear-gradient(90deg, #059669, #4ade80)'
                      }} />
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>{s.healthyCount ?? 0} healthy</span>
                      <span>{s.needsAttention ?? 0} need attention</span>
                    </div>
                  </div>
                  {/* Health distribution */}
                  {data?.healthDistribution?.length > 0 && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Health Condition Breakdown</p>
                      <div className="space-y-2">
                        {data.healthDistribution.map((item, i) => {
                          const max = Math.max(...data.healthDistribution.map(x => x.count), 1);
                          const pct = Math.round((item.count / max) * 100);
                          return (
                            <div key={i} className="flex items-center gap-3">
                              <span className="text-xs text-gray-600 w-28 flex-shrink-0 truncate">{item.condition}</span>
                              <div className="flex-1 bg-gray-100 rounded-full h-2">
                                <div className="h-2 rounded-full" style={{ width: `${pct}%`, background: PIE_COLORS[i % PIE_COLORS.length] }} />
                              </div>
                              <span className="text-xs font-bold text-gray-700 w-12 text-right">{item.count} animals</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {/* Medicine usage by species */}
                  {data?.medicineBySpecies?.length > 0 && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Medicine Usage by Species</p>
                      <div className="space-y-2">
                        {data.medicineBySpecies.slice(0, 5).map((item, i) => {
                          const max = Math.max(...data.medicineBySpecies.map(x => x.quantity), 1);
                          const pct = Math.round((item.quantity / max) * 100);
                          return (
                            <div key={i} className="flex items-center gap-3">
                              <span className="text-xs text-gray-600 w-24 flex-shrink-0 truncate">{item.species}</span>
                              <div className="flex-1 bg-gray-100 rounded-full h-2">
                                <div className="h-2 rounded-full" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #7c3aed, #a78bfa)' }} />
                              </div>
                              <span className="text-xs font-bold text-gray-700 w-16 text-right">{item.quantity} units</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* ── ATTENTION MODAL ── */}
              {activeModal === 'attention' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl p-4 bg-amber-50 border border-amber-200">
                      <div className="flex items-center gap-2 mb-1">
                        <WarningAmberOutlinedIcon style={{ fontSize: 16, color: '#b45309' }} />
                        <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">Need Attention</p>
                      </div>
                      <p className="text-3xl font-extrabold text-amber-700">{s.needsAttention ?? 0}</p>
                      <p className="text-xs text-amber-500 mt-0.5">out of {s.totalLivestock ?? 0} total</p>
                    </div>
                    <div className="rounded-2xl p-4 bg-emerald-50 border border-emerald-200">
                      <div className="flex items-center gap-2 mb-1">
                        <FavoriteOutlinedIcon style={{ fontSize: 16, color: '#059669' }} />
                        <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Healthy</p>
                      </div>
                      <p className="text-3xl font-extrabold text-emerald-700">{s.healthyCount ?? 0}</p>
                      <p className="text-xs text-emerald-500 mt-0.5">in good condition</p>
                    </div>
                  </div>
                  {/* Frequent treatments */}
                  {data?.frequentTreatments?.length > 0 ? (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Frequently Treated Animals</p>
                      <div className="space-y-2">
                        {data.frequentTreatments.map((item, i) => (
                          <div key={i} className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-amber-50 border border-amber-100">
                            <div className="flex items-center gap-2">
                              <WarningAmberOutlinedIcon style={{ fontSize: 16, color: '#b45309' }} />
                              <span className="text-sm font-semibold text-gray-700">{item.animal}</span>
                            </div>
                            <span className="text-xs font-extrabold text-amber-700 bg-amber-100 px-2 py-1 rounded-lg">{item.count} treatments</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 gap-2">
                      <FavoriteOutlinedIcon style={{ fontSize: 40, color: '#4ade80' }} />
                      <p className="text-sm font-semibold text-gray-500">All animals are healthy!</p>
                      <p className="text-xs text-gray-400">No frequent treatments detected.</p>
                    </div>
                  )}
                  {/* Health distribution */}
                  {data?.healthDistribution?.length > 0 && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Health Condition Breakdown</p>
                      <div className="space-y-2">
                        {data.healthDistribution.map((item, i) => {
                          const max = Math.max(...data.healthDistribution.map(x => x.count), 1);
                          const pct = Math.round((item.count / max) * 100);
                          return (
                            <div key={i} className="flex items-center gap-3">
                              <span className="text-xs text-gray-600 w-28 flex-shrink-0 truncate">{item.condition}</span>
                              <div className="flex-1 bg-gray-100 rounded-full h-2">
                                <div className="h-2 rounded-full" style={{ width: `${pct}%`, background: PIE_COLORS[i % PIE_COLORS.length] }} />
                              </div>
                              <span className="text-xs font-bold text-gray-700 w-12 text-right">{item.count} animals</span>
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

export default OwnerDashboard;