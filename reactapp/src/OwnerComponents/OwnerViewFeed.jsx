import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { feedAPI, livestockAPI, requestAPI } from '../apiConfig';

import OwnerNavbar from './OwnerNavbar';

// MUI Icons
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import FilterListOutlinedIcon from '@mui/icons-material/FilterListOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import CloseIcon from '@mui/icons-material/Close';
import ChevronLeftOutlinedIcon from '@mui/icons-material/ChevronLeftOutlined';
import ChevronRightOutlinedIcon from '@mui/icons-material/ChevronRightOutlined';
import LocalDiningOutlinedIcon from '@mui/icons-material/LocalDiningOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined';
import PetsOutlinedIcon from '@mui/icons-material/PetsOutlined';
import CurrencyRupeeOutlinedIcon from '@mui/icons-material/CurrencyRupeeOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import GrassIcon from '@mui/icons-material/Grass';

const SortIcon = ({ columnKey, sortConfig }) => {
  if (sortConfig.key !== columnKey) return <UnfoldMoreIcon fontSize="small" style={{ opacity: 0.4 }} />;
  return sortConfig.direction === 'asc'
    ? <ArrowUpwardIcon fontSize="small" style={{ color: '#4ade80' }} />
    : <ArrowDownwardIcon fontSize="small" style={{ color: '#4ade80' }} />;
};

const OwnerViewFeed = () => {
  const queryClient = useQueryClient();
  const[searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showRequestModal, setShowRequestModal] = useState(null);
  const [selectedSpecies, setSelectedSpecies] = useState(null); // { feedName, species: [] }
  const[selectedLivestock, setSelectedLivestock] = useState('');
  const [quantity, setQuantity] = useState('');
  const[requestErrors, setRequestErrors] = useState({});
  const [typeFilter, setTypeFilter] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const itemsPerPage = 3;

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

  const { data: feeds, isLoading: feedsLoading } = useQuery({
    queryKey: ['feeds'],
    queryFn: async () => { const response = await feedAPI.getAllFeeds(); return response.data; },
    retry: 1, retryDelay: 5000, refetchInterval: 5000, refetchOnWindowFocus: false,
  });

  const { data: livestock } = useQuery({
    queryKey: ['livestock'],
    queryFn: async () => { const response = await livestockAPI.getAllLivestock(); return response.data; },
    retry: 1, retryDelay: 5000, refetchInterval: 5000, refetchOnWindowFocus: false,
  });

  const requestMutation = useMutation({
    mutationFn: async (requestData) => { const response = await requestAPI.addRequest(requestData); return response.data; },
    onSuccess: () => {
      queryClient.invalidateQueries(['requests']);
      toast.success('Request sent successfully');
      setShowRequestModal(null);
      setSelectedLivestock('');
      setQuantity('');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to send request');
    },
  });

  const feedsArray = Array.isArray(feeds) ? feeds : [];
  const livestockArray = Array.isArray(livestock) ? livestock :[];

  const uniqueTypes = React.useMemo(() => {
    return[...new Set(feedsArray.map(f => f.type).filter(Boolean))].sort();
  }, [feedsArray]);

  const filteredFeeds = feedsArray.filter(feed => {
    const matchesSearch = feed.feedName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'All' || feed.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const sortedFeeds = sortData(filteredFeeds, sortConfig.key);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedFeeds.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedFeeds.length / itemsPerPage);

  const handleRequestClick = (feed) => {
    setShowRequestModal(feed);
    setRequestErrors({});
    setSelectedLivestock('');
    setQuantity('');
  };

  const validateRequest = () => {
    const errors = {};
    if (!selectedLivestock) errors.livestock = 'Livestock is required';
    if (!quantity) errors.quantity = 'Quantity is required';
    else if (Number(quantity) <= 0) errors.quantity = 'Quantity must be greater than 0';
    else if (Number(quantity) > showRequestModal.availableUnits)
      errors.quantity = `Only ${showRequestModal.availableUnits} units available`;
    setRequestErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleConfirmRequest = () => {
    if (!validateRequest()) return;
    requestMutation.mutate({
      itemType: 'Feed',
      itemId: showRequestModal._id,
      itemName: showRequestModal.feedName,
      livestockName: selectedLivestock,
      quantity: Number(quantity),
    });
  };

  const SortableTh = ({ label, columnKey }) => (
    <th onClick={() => handleSort(columnKey)}
      className="px-4 py-4 text-left text-xs font-bold uppercase tracking-widest cursor-pointer select-none whitespace-nowrap"
      style={{ color: 'rgba(255,255,255,0.9)' }}>
      <div className="flex items-center gap-1">{label}<SortIcon columnKey={columnKey} sortConfig={sortConfig} /></div>
    </th>
  );

  const totalFeeds = feedsArray.length;
  const inStockFeeds = feedsArray.filter(f => f.availableUnits > 0).length;
  const outOfStockCount = feedsArray.filter(f => f.availableUnits === 0).length;

  return (
    <div className="min-h-screen" style={{ background: '#f0f4f0' }}>
      <OwnerNavbar />

      {/* ── Page Header ── */}
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
              <GrassIcon style={{ color: '#fff', fontSize: 22 }} />
            </div>
            <h1 className="text-4xl font-bold text-white" style={{ fontFamily: "'Nunito', sans-serif" }}>
              Available <span style={{ color: '#4ade80', fontStyle: 'italic' }}>Feeds</span>
            </h1>
          </div>
          <p className="text-white/60 text-sm">Browse and request quality feeds for your livestock.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500"><SearchOutlinedIcon style={{ fontSize: 20 }} /></span>
            <input type="text" placeholder="Search by feed name..." value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all placeholder-gray-400" />
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500"><FilterListOutlinedIcon style={{ fontSize: 18 }} /></span>
            <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
              disabled={feedsLoading || uniqueTypes.length === 0}
              className="pl-9 pr-8 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all appearance-none bg-white text-gray-700 cursor-pointer disabled:opacity-50">
              <option value="All">All Types</option>
              {uniqueTypes.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
            <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"><KeyboardArrowDownIcon style={{ fontSize: 18 }} /></span>
          </div>
        </div>

        {/* ── Loading Spinner exactly like ViewLivestock ── */}
        {feedsLoading && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
            <span className="text-gray-400 text-sm">Loading feeds...</span>
          </div>
        )}

        {/* ── Main Table Container (Hidden while loading) ── */}
        {!feedsLoading && (
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="h-1.5 w-full" style={{ background: 'linear-gradient(90deg, #1a6b40, #4ade80, #1a6b40)' }} />
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr style={{ background: 'linear-gradient(135deg, #1a6b40, #0d4a2e)' }}>
                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.9)' }}>#</th>
                    <SortableTh label="Feed Name" columnKey="feedName" />
                    <SortableTh label="Type" columnKey="type" />
                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.9)' }}>Species</th>
                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.9)' }}>Description</th>
                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.9)' }}>Unit</th>
                    <SortableTh label="Price / Unit" columnKey="pricePerUnit" />
                    <SortableTh label="Available Units" columnKey="availableUnits" />
                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.9)' }}>Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
{currentItems.length === 0 ? (
                    <tr><td colSpan="9" className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <InboxOutlinedIcon style={{ fontSize: 44, color: '#d1d5db' }} />
                        <p className="text-gray-400 font-semibold text-sm">
                          {feedsArray.length === 0 ? 'No feeds available.' : 'No feeds match your filters.'}
                        </p>
                      </div>
                    </td></tr>
                  ) : currentItems.map((feed, index) => {
                    const oos = feed.availableUnits === 0;
                    return (
                      <tr key={feed._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4 text-sm text-gray-400 font-medium">{indexOfFirstItem + index + 1}</td>
<td className="px-4 py-4"><span className="text-sm font-semibold text-gray-800">{feed.feedName}</span></td>
                        <td className="px-4 py-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-semibold bg-blue-50 text-blue-700 border-blue-200">
                            <LocalDiningOutlinedIcon style={{ fontSize: 12 }} />{feed.type || 'N/A'}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1 flex-wrap">
                            {Array.isArray(feed.species) && feed.species.length > 0 ? (
                              <>
                                {feed.species.slice(0, 2).map((s, i) => (
                                  <span key={i} className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    {s}
                                  </span>
                                ))}
                                {feed.species.length > 2 && (
                                  <button
                                    onClick={() => setSelectedSpecies({ feedName: feed.feedName, species: feed.species })}
                                    className="text-[10px] font-medium text-emerald-600 hover:text-emerald-700 hover:underline"
                                  >
                                    +{feed.species.length - 2} more
                                  </button>
                                )}
                              </>
                            ) : (
                              <span className="text-xs text-gray-400 italic">—</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500 max-w-xs truncate" title={feed.description}>{feed.description || '—'}</td>
                        <td className="px-4 py-4 text-sm text-gray-600">{feed.unit || '—'}</td>
                        <td className="px-4 py-4">
                          <span className="inline-flex items-center gap-0.5 text-sm font-semibold text-gray-800">
                            <CurrencyRupeeOutlinedIcon style={{ fontSize: 14 }} />{feed.pricePerUnit}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-semibold
                            ${oos ? 'bg-red-50 text-red-600 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                            <InventoryOutlinedIcon style={{ fontSize: 12 }} />{feed.availableUnits}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <button onClick={() => handleRequestClick(feed)} disabled={oos}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200
                              ${oos
                                ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                                : 'bg-gradient-to-r from-emerald-700 to-emerald-500 text-white shadow hover:shadow-md hover:from-emerald-600 hover:to-emerald-400 active:scale-95'}`}>
                            {oos ? <><InventoryOutlinedIcon style={{ fontSize: 14 }} /> Out of Stock</> : <><SendOutlinedIcon style={{ fontSize: 14 }} /> Request</>}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                <span className="text-xs text-gray-400">
                  Showing <span className="font-semibold text-gray-600">{indexOfFirstItem + 1}–{Math.min(indexOfLastItem, sortedFeeds.length)}</span> of <span className="font-semibold text-gray-600">{sortedFeeds.length}</span> results
                </span>
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
        )}
       </div>

      {/* ── Species Detail Modal ── */}
      {selectedSpecies && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          onClick={() => setSelectedSpecies(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-6 py-5 flex items-center gap-3 bg-emerald-600">
              <GrassIcon style={{ color: '#fff', fontSize: 22 }} />
              <h3 className="text-white text-lg font-extrabold">Target Species</h3>
              <button
                onClick={() => setSelectedSpecies(null)}
className="ml-auto w-8 h-8 rounded-full bg-white bg-opacity-20 flex items-center justify-center text-white hover:bg-opacity-30 transition-colors cursor-pointer border-none"
              >
                <CloseIcon style={{ fontSize: 18 }} />
              </button>
            </div>
            <div className="px-6 py-6">
              <p className="text-sm text-gray-500 mb-4">
                <strong>{selectedSpecies.feedName}</strong> is suitable for the following species:
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedSpecies.species.map((sp, idx) => (
                  <span key={idx} className="inline-block px-3 py-1.5 rounded-lg text-sm font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {sp}
                  </span>
                ))}
              </div>
              <button onClick={() => setSelectedSpecies(null)}
                className="w-full mt-6 py-3 rounded-2xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm px-4"
          onClick={() => setShowRequestModal(null)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}>

            <div className="px-6 pt-6 pb-5 relative" style={{ background: 'linear-gradient(145deg, #064e3b 0%, #065f46 100%)' }}>
              <button onClick={() => setShowRequestModal(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white bg-opacity-10 flex items-center justify-center text-white hover:bg-opacity-20 transition-colors">
                <CloseIcon style={{ fontSize: 18 }} />
              </button>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-9 h-9 rounded-xl bg-emerald-400 bg-opacity-30 flex items-center justify-center">
                  <LocalDiningOutlinedIcon style={{ fontSize: 20, color: '#fff' }} />
                </div>
                <div>
                  <p className="text-emerald-300 text-xs font-semibold uppercase tracking-widest">Request Feed</p>
                  <h3 className="text-white text-lg font-extrabold leading-tight">{showRequestModal.feedName}</h3>
                </div>
              </div>
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white bg-opacity-10 border border-white border-opacity-20">
                <InventoryOutlinedIcon style={{ fontSize: 14, color: '#6ee7b7' }} />
                <span className="text-emerald-200 text-xs font-semibold">{showRequestModal.availableUnits} units available</span>
              </div>
            </div>

            <div className="px-6 py-6 space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Select Livestock <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600"><PetsOutlinedIcon style={{ fontSize: 18 }} /></span>
                  <select value={selectedLivestock}
                    onChange={(e) => { setSelectedLivestock(e.target.value); setRequestErrors({ ...requestErrors, livestock: '' }); }}
                    className={`w-full pl-10 pr-8 py-3 text-sm border rounded-xl outline-none appearance-none transition-all focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 bg-white cursor-pointer
                      ${requestErrors.livestock ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-emerald-300'}
                      ${selectedLivestock ? 'text-gray-800' : 'text-gray-400'}`}>
                    <option value="">-- Select Livestock --</option>
                    {livestockArray.map(item => (
                      <option key={item._id} value={item.name}>{item.name} ({item.species})</option>
                    ))}
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"><KeyboardArrowDownIcon style={{ fontSize: 18 }} /></span>
                </div>
                {requestErrors.livestock && <p className="mt-1 text-xs text-red-500 pl-1">{requestErrors.livestock}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Quantity <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600"><InventoryOutlinedIcon style={{ fontSize: 18 }} /></span>
                  <input type="number" value={quantity}
                    onChange={(e) => { setQuantity(e.target.value); setRequestErrors({ ...requestErrors, quantity: '' }); }}
                    min="1" max={showRequestModal.availableUnits} placeholder={`Max: ${showRequestModal.availableUnits}`}
                    className={`w-full pl-10 pr-4 py-3 text-sm border rounded-xl outline-none transition-all focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 placeholder-gray-400
                      ${requestErrors.quantity ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-emerald-300'}`} />
                </div>
                {requestErrors.quantity && <p className="mt-1 text-xs text-red-500 pl-1">{requestErrors.quantity}</p>}
              </div>

              <div className="flex gap-3 pt-1">
                <button onClick={() => setShowRequestModal(null)} disabled={requestMutation.isLoading}
                  className="flex-1 py-3 rounded-2xl border border-gray-200 text-gray-600 text-sm font-bold hover:bg-gray-50 transition-colors disabled:opacity-50">
                  Cancel
                </button>
                <button onClick={handleConfirmRequest} disabled={requestMutation.isLoading}
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-emerald-700 to-emerald-500 text-white text-sm font-bold shadow hover:from-emerald-600 hover:to-emerald-400 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {requestMutation.isLoading ? (
                    <><svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>Sending...</>
                  ) : <><SendOutlinedIcon style={{ fontSize: 16 }} /> Confirm Request</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerViewFeed;