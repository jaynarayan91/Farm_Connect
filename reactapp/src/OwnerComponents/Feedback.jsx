import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { feedbackAPI } from '../apiConfig';
import OwnerNavbar from './OwnerNavbar';

import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import StarOutlinedIcon from '@mui/icons-material/StarOutlined';
import StarBorderOutlinedIcon from '@mui/icons-material/StarBorderOutlined';
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import LocalDiningOutlinedIcon from '@mui/icons-material/LocalDiningOutlined';
import MedicalServicesOutlinedIcon from '@mui/icons-material/MedicalServicesOutlined';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import ChevronLeftOutlinedIcon from '@mui/icons-material/ChevronLeftOutlined';
import ChevronRightOutlinedIcon from '@mui/icons-material/ChevronRightOutlined';

const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });

const StarDisplay = ({ value }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map(star => (
      star <= value
        ? <StarOutlinedIcon key={star} style={{ fontSize: 16, color: '#f59e0b' }} />
        : <StarBorderOutlinedIcon key={star} style={{ fontSize: 16, color: '#d1d5db' }} />
    ))}
  </div>
);

const TypeBadge = ({ type }) => {
  const isFeed = type === 'Feed';
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-semibold
      ${isFeed ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-purple-50 text-purple-700 border-purple-200'}`}>
      {isFeed ? <LocalDiningOutlinedIcon style={{ fontSize: 13 }} /> : <MedicalServicesOutlinedIcon style={{ fontSize: 13 }} />}
      {type || 'N/A'}
    </span>
  );
};

const Feedback = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const itemsPerPage = 5;

  const handleSort = (key) => {
    setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));
    setCurrentPage(1);
  };

  const sortData = (data) => {
    if (!sortConfig.key) return data;
    return [...data].sort((a, b) => {
      let aVal = a[sortConfig.key], bVal = b[sortConfig.key];
      if (sortConfig.key === 'createdAt') { aVal = new Date(aVal).getTime(); bVal = new Date(bVal).getTime(); }
      if (typeof aVal === 'number' && typeof bVal === 'number')
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      if (typeof aVal === 'string' && typeof bVal === 'string')
        return sortConfig.direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      return 0;
    });
  };

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return <UnfoldMoreIcon fontSize="small" style={{ opacity: 0.4 }} />;
    return sortConfig.direction === 'asc'
      ? <ArrowUpwardIcon fontSize="small" style={{ color: '#4ade80' }} />
      : <ArrowDownwardIcon fontSize="small" style={{ color: '#4ade80' }} />;
  };

  const SortableTh = ({ label, columnKey }) => (
    <th onClick={() => handleSort(columnKey)}
      className="px-4 py-4 text-left text-xs font-bold uppercase tracking-widest cursor-pointer select-none whitespace-nowrap"
      style={{ color: 'rgba(255,255,255,0.9)' }}>
      <div className="flex items-center gap-1">{label}<SortIcon columnKey={columnKey} /></div>
    </th>
  );

  const { data: feedbacks, isLoading } = useQuery({
    queryKey: ['myFeedbacks'],
    queryFn: async () => { const r = await feedbackAPI.getMyFeedbacks(); return r.data; },
    retry: 1, refetchOnWindowFocus: false,
  });

  const feedbacksArray = Array.isArray(feedbacks) ? feedbacks : [];

  const filtered = feedbacksArray.filter(fb =>
    (fb.itemName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sorted       = sortData(filtered);
  const totalPages   = Math.ceil(sorted.length / itemsPerPage);
  const indexOfFirst = (currentPage - 1) * itemsPerPage;
  const currentItems = sorted.slice(indexOfFirst, indexOfFirst + itemsPerPage);

  return (
    <div className="min-h-screen" style={{ background: '#f0f4f0' }}>
      <OwnerNavbar />

      {/* Page Header */}
      <div
        className="w-full py-10 px-4 text-center relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0d4a2e 0%, #1a6b40 50%, #0a3d26 100%)' }}
      >
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.03) 10px, rgba(255,255,255,0.03) 20px)' }}
        />
        <div className="relative">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
              style={{ background: 'linear-gradient(135deg, #34d970, #1a9e4a)' }}>
              <RateReviewOutlinedIcon style={{ color: '#fff', fontSize: 22 }} />
            </div>
            <h1 className="text-4xl font-bold text-white" style={{ fontFamily: "'Nunito', sans-serif" }}>
              My <span style={{ color: '#4ade80', fontStyle: 'italic' }}>Feedbacks</span>
            </h1>
          </div>
          <p className="text-white/60 text-sm">All feedbacks you have submitted for approved requests.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Search */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
          <div className="relative max-w-sm">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500">
              <SearchOutlinedIcon style={{ fontSize: 20 }} />
            </span>
            <input type="text" placeholder="Search by item name..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all placeholder-gray-400" />
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
            <span className="text-gray-400 text-sm">Loading your feedbacks...</span>
          </div>
        )}

        {/* Table */}
        {!isLoading && (
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="h-1.5 w-full" style={{ background: 'linear-gradient(90deg, #1a6b40, #4ade80, #1a6b40)' }} />
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr style={{ background: 'linear-gradient(135deg, #1a6b40, #0d4a2e)' }}>
                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.9)' }}>#</th>
                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.9)' }}>Type</th>
                    <SortableTh label="Item Name" columnKey="itemName" />
                    <SortableTh label="Title" columnKey="title" />
                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.9)' }}>Description</th>
                    <SortableTh label="Rating" columnKey="rating" />
                    <SortableTh label="Date" columnKey="createdAt" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {currentItems.length === 0 ? (
                    <tr><td colSpan="7" className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <InboxOutlinedIcon style={{ fontSize: 44, color: '#d1d5db' }} />
                        <p className="text-gray-400 font-semibold text-sm">
                          {feedbacksArray.length === 0 ? 'No feedbacks submitted yet.' : 'No feedbacks match your search.'}
                        </p>
                      </div>
                    </td></tr>
                  ) : currentItems.map((fb, index) => (
                    <tr key={fb._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4 text-sm text-gray-400 font-medium">{indexOfFirst + index + 1}</td>
                      <td className="px-4 py-4"><TypeBadge type={fb.itemType} /></td>
                      <td className="px-4 py-4 text-sm font-semibold text-gray-800">{fb.itemName || 'N/A'}</td>
                      <td className="px-4 py-4 text-sm text-gray-700">{fb.title}</td>
                      <td className="px-4 py-4 text-sm text-gray-500 max-w-xs truncate">{fb.description}</td>
                      <td className="px-4 py-4"><StarDisplay value={fb.rating} /></td>
                      <td className="px-4 py-4 text-sm text-gray-500">{formatDate(fb.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                <p className="text-xs text-gray-400">
                  Showing <span className="font-semibold text-gray-600">{indexOfFirst + 1}–{Math.min(indexOfFirst + itemsPerPage, sorted.length)}</span> of{' '}
                  <span className="font-semibold text-gray-600">{sorted.length}</span> results
                </p>
                <div className="flex items-center gap-2">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200 bg-white text-gray-600 hover:border-green-400 hover:text-green-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
                    <ChevronLeftOutlinedIcon style={{ fontSize: 18 }} />Prev
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button key={page} onClick={() => setCurrentPage(page)}
                      className="w-8 h-8 rounded-lg text-xs font-semibold border transition-all cursor-pointer"
                      style={page === currentPage
                        ? { background: 'linear-gradient(135deg, #1a6b40, #0d4a2e)', color: '#fff', border: 'none' }
                        : { background: '#fff', color: '#6b7280', borderColor: '#e5e7eb' }}>
                      {page}
                    </button>
                  ))}
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200 bg-white text-gray-600 hover:border-green-400 hover:text-green-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
                    Next<ChevronRightOutlinedIcon style={{ fontSize: 18 }} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Feedback;
