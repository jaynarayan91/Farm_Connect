import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { requestAPI } from '../apiConfig';
import SupplierNavbar from './SupplierNavbar';

// MUI Icons
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import FilterListOutlinedIcon from '@mui/icons-material/FilterListOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import HourglassEmptyOutlinedIcon from '@mui/icons-material/HourglassEmptyOutlined';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import ChevronLeftOutlinedIcon from '@mui/icons-material/ChevronLeftOutlined';
import ChevronRightOutlinedIcon from '@mui/icons-material/ChevronRightOutlined';
import LocalDiningOutlinedIcon from '@mui/icons-material/LocalDiningOutlined';
import MedicalServicesOutlinedIcon from '@mui/icons-material/MedicalServicesOutlined';
import CloseIcon from '@mui/icons-material/Close';
import CommentOutlinedIcon from '@mui/icons-material/CommentOutlined';

/* ── Helpers ── */
const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const StatusBadge = ({ status }) => {
  const map = {
    Pending:  { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',  icon: <HourglassEmptyOutlinedIcon style={{ fontSize: 13 }} /> },
    Approved: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: <CheckCircleOutlinedIcon   style={{ fontSize: 13 }} /> },
    Rejected: { bg: 'bg-red-50',     text: 'text-red-600',     border: 'border-red-200',     icon: <CancelOutlinedIcon        style={{ fontSize: 13 }} /> },
  };
  const s = map[status] || { bg: 'bg-gray-50', text: 'text-gray-500', border: 'border-gray-200', icon: null };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-semibold ${s.bg} ${s.text} ${s.border}`}>
      {s.icon}{status || 'N/A'}
    </span>
  );
};

const TypeBadge = ({ type }) => {
  const isFeed = type === 'Feed';
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-semibold
      ${isFeed ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-purple-50 text-purple-700 border-purple-200'}`}>
      {isFeed
        ? <LocalDiningOutlinedIcon style={{ fontSize: 13 }} />
        : <MedicalServicesOutlinedIcon style={{ fontSize: 13 }} />}
      {type || 'N/A'}
    </span>
  );
};

const SortIcon = ({ columnKey, sortConfig }) => {
  if (sortConfig.key !== columnKey) return <UnfoldMoreIcon fontSize="small" style={{ opacity: 0.4 }} />;
  return sortConfig.direction === 'asc'
    ? <ArrowUpwardIcon fontSize="small" style={{ color: '#4ade80' }} />
    : <ArrowDownwardIcon fontSize="small" style={{ color: '#4ade80' }} />;
};

/* ── Main Component ── */
const ViewRequest = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm]     = useState('');
  const [currentPage, setCurrentPage]   = useState(1);
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter]     = useState('All');
  const [sortConfig, setSortConfig]     = useState({ key: 'requestDate', direction: 'desc' });
  const [commentModal, setCommentModal] = useState(null); // { requestId, action }
  const [comment, setComment]           = useState('');
  const [commentError, setCommentError] = useState('');
  const itemsPerPage = 5;

  const sortData = (data, key) => {
    if (!key) return data;
    const sorted = [...data].sort((a, b) => {
      let aVal = a[key];
      let bVal = b[key];
      if (key.includes('.')) {
        const keys = key.split('.');
        aVal = keys.reduce((obj, k) => obj?.[k], a);
        bVal = keys.reduce((obj, k) => obj?.[k], b);
      }
      if (key === 'requestDate' || key === 'createdAt') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }
      if (typeof aVal === 'number' && typeof bVal === 'number')
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      if (typeof aVal === 'string' && typeof bVal === 'string')
        return sortConfig.direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      return 0;
    });
    return sorted;
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const { data: requests, isLoading, isError, error } = useQuery({
    queryKey: ['allRequests'],
    queryFn: async () => {
      const response = await requestAPI.getAllRequestsBySupplier();
    console.log(response.data)
      return response.data;
    },
    retry: 1,
    retryDelay: 5000,
    refetchInterval: 5000,
    refetchOnWindowFocus: false,
    onSuccess: (data) => { console.log('Query successful, data:', data); },
    onError: (err) => { console.error('Query error:', err); toast.error('Failed to fetch requests'); },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ requestId, status, comment }) => {
      const response = await requestAPI.updateRequestStatus(requestId, status, comment);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['allRequests']);
      toast.success('Request status updated successfully');
      setCommentModal(null);
      setComment('');
      setCommentError('');
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || 'Failed to update status';
      toast.error(errorMessage);
    },
  });

  const requestsArray = Array.isArray(requests) ? requests : [];

  const filteredRequests = requestsArray.filter(request => {
    const itemName = request.itemName || '';
    const matchesSearch  = itemName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus  = statusFilter === 'All' || request.status === statusFilter;
    const matchesType    = typeFilter   === 'All' || request.itemType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const sortedRequests  = sortData(filteredRequests, sortConfig.key);
  const indexOfLastItem  = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems     = sortedRequests.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages       = Math.ceil(sortedRequests.length / itemsPerPage);

  const handleStatusChange = (requestId, newStatus) => {
    setCommentModal({ requestId, action: newStatus });
    setComment('');
    setCommentError('');
  };

  const handleConfirmAction = () => {
    if (!comment.trim()) { setCommentError('Please add a comment'); return; }
    updateStatusMutation.mutate({ requestId: commentModal.requestId, status: commentModal.action, comment: comment.trim() });
  };

  /* ── Stat summary ── */
  const pending  = requestsArray.filter(r => r.status === 'Pending').length;
  const approved = requestsArray.filter(r => r.status === 'Approved').length;
  const rejected = requestsArray.filter(r => r.status === 'Rejected').length;

  const SortableTh = ({ label, columnKey, children }) => (
    <th onClick={() => handleSort(columnKey)}
      className="px-4 py-4 text-left text-xs font-bold uppercase tracking-widest cursor-pointer select-none whitespace-nowrap"
      style={{ color: 'rgba(255,255,255,0.9)' }}>
      <div className="flex items-center gap-1">{label || children}<SortIcon columnKey={columnKey} sortConfig={sortConfig} /></div>
    </th>
  );

  return (
    <>
    <div className="min-h-screen" style={{ background: '#f0f4f0' }}>
      <SupplierNavbar />

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
              <HourglassEmptyOutlinedIcon style={{ color: '#fff', fontSize: 22 }} />
            </div>
            <h1 className="text-4xl font-bold text-white" style={{ fontFamily: "'Nunito', sans-serif" }}>
              Manage <span style={{ color: '#4ade80', fontStyle: 'italic' }}>Requests</span>
            </h1>
          </div>
          <p className="text-white/60 text-sm">Manage and respond to incoming feed & medicine requests.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Loading State (same as ViewLivestock) ── */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
            <span className="text-gray-400 text-sm">Loading requests...</span>
          </div>
        )}

        {/* ── Content (only rendered when not loading) ── */}
        {!isLoading && (
          <>
            {/* ── Summary Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {[
                { label: 'Pending',  count: pending,  bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',  icon: <HourglassEmptyOutlinedIcon style={{ fontSize: 28, color: '#b45309' }} /> },
                { label: 'Approved', count: approved, bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: <CheckCircleOutlinedIcon   style={{ fontSize: 28, color: '#059669' }} /> },
                { label: 'Rejected', count: rejected, bg: 'bg-red-50',     text: 'text-red-600',     border: 'border-red-200',     icon: <CancelOutlinedIcon        style={{ fontSize: 28, color: '#dc2626' }} /> },
              ].map(({ label, count, bg, text, border, icon }) => (
                <div key={label} className={`flex items-center gap-4 p-5 rounded-2xl border ${bg} ${border}`}>
                  <div className="flex-shrink-0">{icon}</div>
                  <div>
                    <p className={`text-2xl font-extrabold ${text}`}>{count}</p>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Filters ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500">
                  <SearchOutlinedIcon style={{ fontSize: 20 }} />
                </span>
                <input
                  type="text"
                  placeholder="Search by item name..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all placeholder-gray-400"
                />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500">
                  <FilterListOutlinedIcon style={{ fontSize: 18 }} />
                </span>
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                  className="pl-9 pr-8 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all appearance-none bg-white text-gray-700 cursor-pointer"
                >
                  <option value="All">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
                <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <KeyboardArrowDownIcon style={{ fontSize: 18 }} />
                </span>
              </div>

              {/* Type Filter */}
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500">
                  <FilterListOutlinedIcon style={{ fontSize: 18 }} />
                </span>
                <select
                  value={typeFilter}
                  onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
                  className="pl-9 pr-8 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all appearance-none bg-white text-gray-700 cursor-pointer"
                >
                  <option value="All">All Types</option>
                  <option value="Feed">Feed</option>
                  <option value="Medicine">Medicine</option>
                </select>
                <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <KeyboardArrowDownIcon style={{ fontSize: 18 }} />
                </span>
              </div>
            </div>

            {/* ── Table Card ── */}
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
              <div className="h-1.5 w-full" style={{ background: 'linear-gradient(90deg, #1a6b40, #4ade80, #1a6b40)' }} />
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead>
                    <tr style={{ background: 'linear-gradient(135deg, #1a6b40, #0d4a2e)' }}>
                      <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.9)' }}>#</th>
                      <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.9)' }}>Type</th>
                      <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.9)' }}>Item Name</th>
                      <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.9)' }}>User Name</th>
                      <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.9)' }}>Livestock</th>
                      <SortableTh label="Quantity" columnKey="quantity" />
                      <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.9)' }}>Status</th>
                      <SortableTh label="Request Date" columnKey="requestDate" />
                      <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.9)' }}>Action</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-50">
                    {isError ? (
                      <tr>
                        <td colSpan="9" className="py-16 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <ErrorOutlineOutlinedIcon style={{ fontSize: 40, color: '#ef4444' }} />
                            <p className="text-red-500 font-semibold text-sm">Error loading requests: {error?.message || 'Unknown error'}</p>
                            <button
                              onClick={() => queryClient.invalidateQueries(['allRequests'])}
                              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-100 transition-colors"
                            >
                              <RefreshOutlinedIcon style={{ fontSize: 16 }} /> Retry
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : currentItems.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="py-16 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <InboxOutlinedIcon style={{ fontSize: 44, color: '#d1d5db' }} />
                            <p className="text-gray-400 font-semibold text-sm">
                              {requestsArray.length === 0 ? 'No requests found.' : 'No requests match your filters.'}
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      currentItems.map((request, index) => (
                        <tr key={request._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-4 text-sm text-gray-400 font-medium">
                            {indexOfFirstItem + index + 1}
                          </td>
                          <td className="px-4 py-4">
                            <TypeBadge type={request.itemType} />
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-800 font-medium">
                            {request.itemName || 'N/A'}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-600">
                            {request.ownerId?.userName || 'N/A'}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-600">
                            {request.livestockName || 'N/A'}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-700 font-semibold">
                            {request.quantity || 'N/A'}
                          </td>
                          <td className="px-4 py-4">
                            <StatusBadge status={request.status} />
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-500">
                            {formatDate(request.requestDate || request.createdAt)}
                          </td>
                          <td className="px-4 py-4">
                            {request.status === 'Pending' ? (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleStatusChange(request._id, 'Approved')}
                                  disabled={updateStatusMutation.isLoading}
                                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <CheckCircleOutlinedIcon style={{ fontSize: 14 }} /> Approve
                                </button>
                                <button
                                  onClick={() => handleStatusChange(request._id, 'Rejected')}
                                  disabled={updateStatusMutation.isLoading}
                                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <CancelOutlinedIcon style={{ fontSize: 14 }} /> Reject
                                </button>
                              </div>
                            ) : (
                              <span className="text-gray-300 text-xs">—</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* ── Pagination ── */}
              {!isError && sortedRequests.length > 0 && totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                  <p className="text-xs text-gray-400">
                    Showing <span className="font-semibold text-gray-600">{indexOfFirstItem + 1}–{Math.min(indexOfLastItem, sortedRequests.length)}</span> of{' '}
                    <span className="font-semibold text-gray-600">{sortedRequests.length}</span> results
                  </p>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1}
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
                    <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200 bg-white text-gray-600 hover:border-green-400 hover:text-green-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
                      Next<ChevronRightOutlinedIcon style={{ fontSize: 18 }} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>

      {/* ── Comment Modal ── */}
      {commentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm px-4"
          onClick={() => { setCommentModal(null); setComment(''); setCommentError(''); }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}>
            <div className={`px-6 py-5 flex items-center gap-3 ${commentModal.action === 'Approved' ? 'bg-emerald-600' : 'bg-red-600'}`}>
              <CommentOutlinedIcon style={{ color: '#fff', fontSize: 22 }} />
              <h3 className="text-white text-lg font-extrabold">
                {commentModal.action === 'Approved' ? 'Approve Request' : 'Reject Request'}
              </h3>
              <button onClick={() => { setCommentModal(null); setComment(''); setCommentError(''); }}
                className="ml-auto w-8 h-8 rounded-full bg-white bg-opacity-20 flex items-center justify-center text-white hover:bg-opacity-30 transition-colors">
                <CloseIcon style={{ fontSize: 18 }} />
              </button>
            </div>
            <div className="px-6 py-6 space-y-4">
              <p className="text-sm text-gray-500">
                Add a comment for the owner explaining your {commentModal.action === 'Approved' ? 'approval' : 'rejection'}.
              </p>
              <div>
                <textarea
                  rows={4}
                  placeholder={commentModal.action === 'Approved' ? 'e.g. Order confirmed, will be dispatched within 2 days.' : 'e.g. Insufficient stock available at the moment.'}
                  value={comment}
                  onChange={(e) => { setComment(e.target.value); setCommentError(''); }}
                  className={`w-full px-4 py-3 text-sm border rounded-xl outline-none transition-all focus:ring-2 resize-none placeholder-gray-400
                    ${commentError ? 'border-red-400 bg-red-50 focus:ring-red-200' : 'border-gray-200 focus:border-emerald-400 focus:ring-emerald-100'}`}
                />
                {commentError && <p className="mt-1 text-xs text-red-500">{commentError}</p>}
              </div>
              <div className="flex gap-3">
                <button onClick={() => { setCommentModal(null); setComment(''); setCommentError(''); }}
                  className="flex-1 py-3 rounded-2xl border border-gray-200 text-gray-600 text-sm font-bold hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button onClick={handleConfirmAction} disabled={updateStatusMutation.isLoading}
                  className={`flex-1 py-3 rounded-2xl text-white text-sm font-bold transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2
                    ${commentModal.action === 'Approved' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-red-600 hover:bg-red-500'}`}>
                  {updateStatusMutation.isLoading
                    ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Processing...</>
                    : commentModal.action === 'Approved'
                      ? <><CheckCircleOutlinedIcon style={{ fontSize: 16 }} /> Confirm Approve</>
                      : <><CancelOutlinedIcon style={{ fontSize: 16 }} /> Confirm Reject</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ViewRequest;