import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { requestAPI, feedbackAPI } from '../apiConfig';
import OwnerNavbar from './OwnerNavbar';

// MUI Icons
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import FilterListOutlinedIcon from '@mui/icons-material/FilterListOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import HourglassEmptyOutlinedIcon from '@mui/icons-material/HourglassEmptyOutlined';
import LocalDiningOutlinedIcon from '@mui/icons-material/LocalDiningOutlined';
import MedicalServicesOutlinedIcon from '@mui/icons-material/MedicalServicesOutlined';
import ChevronLeftOutlinedIcon from '@mui/icons-material/ChevronLeftOutlined';
import ChevronRightOutlinedIcon from '@mui/icons-material/ChevronRightOutlined';
import CloseIcon from '@mui/icons-material/Close';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import StarOutlinedIcon from '@mui/icons-material/StarOutlined';
import StarBorderOutlinedIcon from '@mui/icons-material/StarBorderOutlined';
import TitleOutlinedIcon from '@mui/icons-material/TitleOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';

/* ── Helpers ── */
const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });

const StatusBadge = ({ status }) => {
  const map = {
    Pending:  { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   icon: <HourglassEmptyOutlinedIcon style={{ fontSize: 13 }} /> },
    Approved: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200',  icon: <CheckCircleOutlinedIcon   style={{ fontSize: 13 }} /> },
    Rejected: { bg: 'bg-red-50',     text: 'text-red-600',     border: 'border-red-200',      icon: <CancelOutlinedIcon        style={{ fontSize: 13 }} /> },
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
      {isFeed ? <LocalDiningOutlinedIcon style={{ fontSize: 13 }} /> : <MedicalServicesOutlinedIcon style={{ fontSize: 13 }} />}
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

/* ── Star Rating selector ── */
const StarRating = ({ value, onChange }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map(star => (
      <button key={star} type="button" onClick={() => onChange(String(star))}
        className="text-amber-400 hover:scale-110 transition-transform">
        {star <= Number(value)
          ? <StarOutlinedIcon style={{ fontSize: 28 }} />
          : <StarBorderOutlinedIcon style={{ fontSize: 28, color: '#d1d5db' }} />}
      </button>
    ))}
    {value && (
      <span className="ml-2 text-xs font-semibold text-gray-500">
        {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][Number(value)]}
      </span>
    )}
  </div>
);

/* ── Main Component ── */
const MyRequest = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm]           = useState('');
  const [currentPage, setCurrentPage]         = useState(1);
  const [deleteRequestId, setDeleteRequestId] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(null);
  const[statusFilter, setStatusFilter]       = useState('All');
  const [typeFilter, setTypeFilter]           = useState('All');
  const [sortConfig, setSortConfig]           = useState({ key: 'requestDate', direction: 'desc' });
  const [feedbackForm, setFeedbackForm]       = useState({ title: '', description: '', rating: '' });
  const [feedbackErrors, setFeedbackErrors]   = useState({});
  const [selectedComment, setSelectedComment] = useState(null); // {comment, itemName, status}
  const itemsPerPage = 4;

  /* ── Sort ── */
  const sortData = (data, key) => {
    if (!key) return data;
    const sorted = [...data].sort((a, b) => {
      let aVal = a[key], bVal = b[key];
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
    setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));
  };

  /* ── Queries ── */
  const navigate = useNavigate();

   const { data: myFeedbacks } = useQuery({
     queryKey: ['myFeedbacks'],
     queryFn: async () => { const r = await feedbackAPI.getMyFeedbacks(); return r.data; },
     retry: 1, retryDelay: 5000, refetchInterval: 5000, refetchOnWindowFocus: false,
   });

   const { data: requests, isLoading } = useQuery({
     queryKey: ['myRequests'],
     queryFn: async () => { const r = await requestAPI.getRequestsByOwnerId(); return r.data; },
     retry: 1, retryDelay: 5000, refetchInterval: 5000, refetchOnWindowFocus: false,
   });

   // Debug: log fetched requests to verify comment field
   useEffect(() => {
     if (requests && requests.length > 0) {
       console.log('Fetched requests data:', requests);
       console.log('Request items with comments:',
         requests.map(r => ({
           id: r._id,
           itemName: r.itemName,
           hasComment: !!r.comment,
           commentText: r.comment,
           status: r.status
         }))
       );
     }
   }, [requests]);

  const hasFeedback = (request) => {
    const arr = Array.isArray(myFeedbacks) ? myFeedbacks : [];
    return arr.some(fb => String(fb?.requestId) === String(request?._id));
  };

  /* ── Mutations ── */
  const deleteMutation = useMutation({
    mutationFn: async (id) => { const r = await requestAPI.deleteRequest(id); return r.data; },
    onSuccess: () => {
      queryClient.invalidateQueries(['myRequests']);
      toast.success('Request deleted successfully');
      setDeleteRequestId(null);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete request'),
  });

  const feedbackMutation = useMutation({
    mutationFn: async (data) => { const r = await feedbackAPI.addFeedback(data); return r.data; },
    onSuccess: () => {
      queryClient.invalidateQueries(['myRequests']);
      queryClient.invalidateQueries(['myFeedbacks']);
      toast.success('Feedback submitted successfully');
      setShowFeedbackModal(null);
      setFeedbackForm({ title: '', description: '', rating: '' });
      setFeedbackErrors({});
      navigate('/owner/feedback');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to submit feedback'),
  });

  const validateFeedback = () => {
    const errors = {};
    if (!feedbackForm.title.trim())       errors.title       = 'Title is required';
    if (!feedbackForm.description.trim()) errors.description = 'Description is required';
    if (!feedbackForm.rating)             errors.rating      = 'Rating is required';
    setFeedbackErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFeedbackSubmit = () => {
    if (!validateFeedback()) return;
    feedbackMutation.mutate({
      requestId:   showFeedbackModal._id,
      itemName:    showFeedbackModal.itemName,
      itemType:    showFeedbackModal.itemType,
      livestock:   showFeedbackModal.livestockName || '',
      title:       feedbackForm.title.trim(),
      description: feedbackForm.description.trim(),
      rating:      Number(feedbackForm.rating),
    });
  };

  const closeFeedbackModal = () => {
    setShowFeedbackModal(null);
    setFeedbackForm({ title: '', description: '', rating: '' });
    setFeedbackErrors({});
  };

  /* ── Derived data ── */
  const requestsArray = Array.isArray(requests) ? requests :[];

  const filteredRequests = requestsArray.filter(req => {
    const itemName = req.itemName || '';
    return (
      itemName.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (statusFilter === 'All' || req.status === statusFilter) &&
      (typeFilter   === 'All' || req.itemType === typeFilter)
    );
  });

  const sortedRequests   = sortData(filteredRequests, sortConfig.key);
  const indexOfLastItem  = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems     = sortedRequests.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages       = Math.ceil(sortedRequests.length / itemsPerPage);

const openCommentModal = (request) => {
  console.log('Opening comment modal for request:', {
    _id: request._id,
    itemName: request.itemName,
    status: request.status,
    rawComment: request.comment,
    commentType: typeof request.comment,
    allFields: Object.keys(request)
  });
  setSelectedComment({
    comment: request.comment || 'No comment provided by supplier.',
    itemName: request.itemName,
    status: request.status,
    livestockName: request.livestockName
  });
};

const closeCommentModal = () => {
  setSelectedComment(null);
};

const handleDelete = (id, status) => {
    if (status !== 'Pending') { toast.warning('Only pending requests can be deleted'); return; }
    setDeleteRequestId(id);
  };

  /* ── Sortable TH ── */
  const SortableTh = ({ label, columnKey }) => (
    <th onClick={() => handleSort(columnKey)}
      className="px-4 py-4 text-left text-xs font-bold uppercase tracking-widest cursor-pointer select-none whitespace-nowrap"
      style={{ color: 'rgba(255,255,255,0.9)' }}>
      <div className="flex items-center gap-1">{label}<SortIcon columnKey={columnKey} sortConfig={sortConfig} /></div>
    </th>
  );

  /* ── Stats ── */
  const pending  = requestsArray.filter(r => r.status === 'Pending').length;
  const approved = requestsArray.filter(r => r.status === 'Approved').length;
  const rejected = requestsArray.filter(r => r.status === 'Rejected').length;

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
              <HourglassEmptyOutlinedIcon style={{ color: '#fff', fontSize: 22 }} />
            </div>
            <h1 className="text-4xl font-bold text-white" style={{ fontFamily: "'Nunito', sans-serif" }}>
              My <span style={{ color: '#4ade80', fontStyle: 'italic' }}>Requests</span>
            </h1>
          </div>
          <p className="text-white/60 text-sm">Track and manage all your feed & medicine requests.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Pending',  count: pending,  bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   icon: <HourglassEmptyOutlinedIcon style={{ fontSize: 28, color: '#b45309' }} /> },
            { label: 'Approved', count: approved, bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200',  icon: <CheckCircleOutlinedIcon   style={{ fontSize: 28, color: '#059669' }} /> },
            { label: 'Rejected', count: rejected, bg: 'bg-red-50',     text: 'text-red-600',     border: 'border-red-200',      icon: <CancelOutlinedIcon        style={{ fontSize: 28, color: '#dc2626' }} /> },
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

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500"><SearchOutlinedIcon style={{ fontSize: 20 }} /></span>
            <input type="text" placeholder="Search by item name..." value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all placeholder-gray-400" />
          </div>
          {[
            { value: statusFilter, onChange: setStatusFilter, options: [['All','All Status'],['Pending','Pending'],['Approved','Approved'],['Rejected','Rejected']] },
            { value: typeFilter,   onChange: setTypeFilter,   options: [['All','All Types'],['Feed','Feed'],['Medicine','Medicine']] },
          ].map((sel, i) => (
            <div key={i} className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500"><FilterListOutlinedIcon style={{ fontSize: 18 }} /></span>
              <select value={sel.value} onChange={(e) => { sel.onChange(e.target.value); setCurrentPage(1); }}
                className="pl-9 pr-8 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 appearance-none bg-white text-gray-700 cursor-pointer">
                {sel.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
              <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"><KeyboardArrowDownIcon style={{ fontSize: 18 }} /></span>
            </div>
          ))}
        </div>

        {/* ── Loading Spinner exactly like OwnerViewFeed ── */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
            <span className="text-gray-400 text-sm">Loading your requests...</span>
          </div>
        )}

        {/* ── Main Table Container (Hidden while loading) ── */}
        {!isLoading && (
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="h-1.5 w-full" style={{ background: 'linear-gradient(90deg, #1a6b40, #4ade80, #1a6b40)' }} />
            <div className="overflow-x-auto">
              <table className="w-full min-w-[780px]">
                <thead>
                  <tr style={{ background: 'linear-gradient(135deg, #1a6b40, #0d4a2e)' }}>
                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.9)' }}>#</th>
                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.9)' }}>Type</th>
                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.9)' }}>Item Name</th>
                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.9)' }}>Livestock</th>
                    <SortableTh label="Quantity" columnKey="quantity" />
                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.9)' }}>Status</th>
                    <SortableTh label="Request Date" columnKey="requestDate" />
                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.9)' }}>Comment</th>
                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.9)' }}>Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {currentItems.length === 0 ? (
                    <tr><td colSpan="9" className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <InboxOutlinedIcon style={{ fontSize: 44, color: '#d1d5db' }} />
                        <p className="text-gray-400 font-semibold text-sm">
                          {requestsArray.length === 0 ? 'No requests found.' : 'No requests match your filters.'}
                        </p>
                      </div>
                    </td></tr>
                  ) : currentItems.map((request, index) => (
                    <tr key={request._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4 text-sm text-gray-400 font-medium">{indexOfFirstItem + index + 1}</td>
                      <td className="px-4 py-4"><TypeBadge type={request.itemType} /></td>
                      <td className="px-4 py-4 text-sm font-semibold text-gray-800">{request.itemName || 'N/A'}</td>
                      <td className="px-4 py-4 text-sm text-gray-600">{request.livestockName || 'N/A'}</td>
                      <td className="px-4 py-4 text-sm font-semibold text-gray-700">{request.quantity}</td>
                      <td className="px-4 py-4"><StatusBadge status={request.status} /></td>
                      <td className="px-4 py-4 text-sm text-gray-500">{formatDate(request.requestDate || request.createdAt)}</td>
                      <td className="px-4 py-4 text-sm">
                        <button
                          onClick={() => openCommentModal(request)}
                          title="View supplier comment"
                          className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-500 hover:text-blue-600 transition-all"
                        >
                          <VisibilityOutlinedIcon style={{ fontSize: 18 }} />
                        </button>
                      </td>
                      <td className="px-4 py-4">
                        {request.status === 'Pending' ? (
                          <button onClick={() => handleDelete(request._id, request.status)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-100 transition-colors">
                            <DeleteOutlineOutlinedIcon style={{ fontSize: 14 }} /> Delete
                          </button>
                        ) : request.status === 'Approved' && request.itemId !== null ? (
                          <button onClick={() => setShowFeedbackModal(request)} disabled={hasFeedback(request)}
                            title={hasFeedback(request) ? 'Feedback already submitted' : 'Add Feedback'}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors
                              ${hasFeedback(request)
                                ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'}`}>
                            <RateReviewOutlinedIcon style={{ fontSize: 14 }} />
                            {hasFeedback(request) ? 'Submitted' : 'Feedback'}
                          </button>
                        ) : <span className="text-gray-300 text-xs">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                <p className="text-xs text-gray-400">
                  Showing <span className="font-semibold text-gray-600">{indexOfFirstItem + 1}–{Math.min(indexOfLastItem, sortedRequests.length)}</span> of{' '}
                  <span className="font-semibold text-gray-600">{sortedRequests.length}</span> results
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

      {/* ══ Delete Confirmation Modal ══ */}
      {deleteRequestId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm px-4"
          onClick={() => setDeleteRequestId(null)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center relative"
            onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setDeleteRequestId(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 transition-colors">
              <CloseIcon style={{ fontSize: 18 }} />
            </button>
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <WarningAmberOutlinedIcon style={{ fontSize: 36, color: '#dc2626' }} />
            </div>
            <h3 className="text-xl font-extrabold text-gray-900 mb-2">Delete Request?</h3>
            <p className="text-gray-500 text-sm mb-7">This action cannot be undone. Are you sure you want to delete this request?</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteRequestId(null)} disabled={deleteMutation.isLoading}
                className="flex-1 py-3 rounded-2xl border border-gray-200 text-gray-600 text-sm font-bold hover:bg-gray-50 transition-colors disabled:opacity-50">
                Cancel
              </button>
              <button onClick={() => deleteMutation.mutate(deleteRequestId)} disabled={deleteMutation.isLoading}
                className="flex-1 py-3 rounded-2xl bg-red-600 text-white text-sm font-bold hover:bg-red-500 transition-colors active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2">
                {deleteMutation.isLoading ? (
                  <><svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>Deleting...</>
                ) : <><DeleteOutlineOutlinedIcon style={{ fontSize: 16 }} /> Yes, Delete</>}
              </button>
            </div>
          </div>
        </div>
      )}

       {/* ══ Supplier Comment View Modal ══ */}
       {selectedComment && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm px-4"
           onClick={closeCommentModal}>
           <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative overflow-hidden"
             onClick={(e) => e.stopPropagation()}>
             <div className="px-6 py-5 flex items-center gap-3 bg-emerald-600">
               <VisibilityOutlinedIcon style={{ color: '#fff', fontSize: 22 }} />
               <h3 className="text-white text-lg font-extrabold">Supplier Comment</h3>
               <button onClick={closeCommentModal}
                 className="ml-auto w-8 h-8 rounded-full bg-white bg-opacity-20 flex items-center justify-center text-white hover:bg-opacity-30 transition-colors">
                 <CloseIcon style={{ fontSize: 18 }} />
               </button>
             </div>
             <div className="px-6 py-6 space-y-4">
               <div className="flex items-center gap-2 mb-2">
                 <StatusBadge status={selectedComment.status} />
                 <span className="text-sm font-semibold text-gray-700">{selectedComment.itemName}</span>
                 {selectedComment.livestockName && (
                   <span className="text-sm text-gray-500">({selectedComment.livestockName})</span>
                 )}
               </div>
               <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200 min-h-[120px] flex items-center justify-center">
                 {!selectedComment.comment || selectedComment.comment.trim() === '' ? (
                   <p className="text-gray-400 text-sm text-center">No comment provided by supplier.</p>
                 ) : (
                   <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800 w-full">
                     {selectedComment.comment}
                   </div>
                 )}
               </div>
               <button onClick={closeCommentModal}
                 className="w-full py-3 rounded-2xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition-colors">
                 Close
               </button>
             </div>
           </div>
         </div>
       )}

      {/* ══ Feedback Modal ══ */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm px-4"
          onClick={closeFeedbackModal}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg relative overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}>

            {/* Modal header */}
            <div className="px-6 pt-6 pb-5 flex-shrink-0" style={{ background: 'linear-gradient(145deg, #064e3b 0%, #065f46 100%)' }}>
              <button onClick={closeFeedbackModal}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white bg-opacity-10 flex items-center justify-center text-white hover:bg-opacity-20 transition-colors">
                <CloseIcon style={{ fontSize: 18 }} />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-400 bg-opacity-30 flex items-center justify-center">
                  <RateReviewOutlinedIcon style={{ fontSize: 20, color: '#fff' }} />
                </div>
                <div>
                  <p className="text-emerald-300 text-xs font-semibold uppercase tracking-widest">Add Feedback</p>
                  <h3 className="text-white text-lg font-extrabold">{showFeedbackModal.itemName}</h3>
                </div>
              </div>

              {/* Info pills */}
              <div className="flex flex-wrap gap-2 mt-4">
                {[
                  { label: showFeedbackModal.itemType },
                  { label: showFeedbackModal.livestockName || 'N/A' },
                ].map(({ label }) => (
                  <span key={label} className="px-3 py-1 rounded-xl bg-white bg-opacity-10 border border-white border-opacity-20 text-emerald-200 text-xs font-semibold">
                    {label}
                  </span>
                ))}
              </div>
            </div>

            {/* Modal body */}
            <div className="px-6 py-6 space-y-5 overflow-y-auto">

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Title <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600"><TitleOutlinedIcon style={{ fontSize: 18 }} /></span>
                  <input type="text" placeholder="Enter feedback title" value={feedbackForm.title}
                    onChange={(e) => { setFeedbackForm({ ...feedbackForm, title: e.target.value }); if (feedbackErrors.title) setFeedbackErrors({ ...feedbackErrors, title: '' }); }}
                    className={`w-full pl-10 pr-4 py-3 text-sm border rounded-xl outline-none transition-all focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 placeholder-gray-400
                      ${feedbackErrors.title ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-emerald-300'}`} />
                </div>
                {feedbackErrors.title && <p className="mt-1 text-xs text-red-500 pl-1">{feedbackErrors.title}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Description <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3.5 text-emerald-600"><DescriptionOutlinedIcon style={{ fontSize: 18 }} /></span>
                  <textarea rows={4} placeholder="Enter feedback description" value={feedbackForm.description}
                    onChange={(e) => { setFeedbackForm({ ...feedbackForm, description: e.target.value }); if (feedbackErrors.description) setFeedbackErrors({ ...feedbackErrors, description: '' }); }}
                    className={`w-full pl-10 pr-4 py-3 text-sm border rounded-xl outline-none transition-all focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 placeholder-gray-400 resize-none
                      ${feedbackErrors.description ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-emerald-300'}`} />
                </div>
                {feedbackErrors.description && <p className="mt-1 text-xs text-red-500 pl-1">{feedbackErrors.description}</p>}
              </div>

              {/* Star Rating */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Rating <span className="text-red-500">*</span>
                </label>
                <StarRating value={feedbackForm.rating}
                  onChange={(val) => { setFeedbackForm({ ...feedbackForm, rating: val }); if (feedbackErrors.rating) setFeedbackErrors({ ...feedbackErrors, rating: '' }); }} />
                {/* Hidden select to keep original logic */}
                <select value={feedbackForm.rating} onChange={() => {}} className="hidden">
                  <option value="">Select rating</option>
                  {[1,2,3,4,5].map(n => <option key={n} value={String(n)}>{n}</option>)}
                </select>
                {feedbackErrors.rating && <p className="mt-1 text-xs text-red-500 pl-1">{feedbackErrors.rating}</p>}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button onClick={closeFeedbackModal} disabled={feedbackMutation.isLoading}
                  className="flex-1 py-3 rounded-2xl border border-gray-200 text-gray-600 text-sm font-bold hover:bg-gray-50 transition-colors disabled:opacity-50">
                  Cancel
                </button>
                <button onClick={handleFeedbackSubmit} disabled={feedbackMutation.isLoading}
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-emerald-700 to-emerald-500 text-white text-sm font-bold shadow hover:from-emerald-600 hover:to-emerald-400 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {feedbackMutation.isLoading ? (
                    <><svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>Submitting...</>
                  ) : <><RateReviewOutlinedIcon style={{ fontSize: 16 }} /> Submit Feedback</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyRequest;