import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { feedAPI } from '../apiConfig';
import SupplierNavbar from './SupplierNavbar';

// MUI Icons
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import GrassIcon from '@mui/icons-material/Grass';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import InboxIcon from '@mui/icons-material/Inbox';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AddCircleIcon from '@mui/icons-material/AddCircle';

const ViewFeed = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteFeedId, setDeleteFeedId] = useState(null);
  const [typeFilter, setTypeFilter] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [selectedSpecies, setSelectedSpecies] = useState(null);
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
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return <UnfoldMoreIcon fontSize="small" style={{ opacity: 0.4 }} />;
    return sortConfig.direction === 'asc'
      ? <ArrowUpwardIcon fontSize="small" style={{ color: '#4ade80' }} />
      : <ArrowDownwardIcon fontSize="small" style={{ color: '#4ade80' }} />;
  };

  const { data: feeds, isLoading, isError } = useQuery({
    queryKey: ['supplierFeeds'],
    queryFn: async () => {
      const response = await feedAPI.getSupplierFeeds();
      return response.data;
    },
    retry: 1,
    retryDelay: 5000,
    refetchInterval: 5000,
    refetchOnWindowFocus: false
  });

  const deleteMutation = useMutation({
    mutationFn: async (feedId) => {
      const response = await feedAPI.deleteFeed(feedId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['supplierFeeds']);
      toast.success('Feed deleted successfully');
      setDeleteFeedId(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete feed');
    }
  });

  const feedsArray = Array.isArray(feeds) ? feeds : [];

  const uniqueTypes = React.useMemo(() => {
    const types = [...new Set(feedsArray.map(feed => feed.type).filter(Boolean))];
    return types.sort();
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

  const handleEdit = (feed) => navigate('/supplier/add-feed', { state: { feed } });
  const handleDelete = (feedId) => setDeleteFeedId(feedId);
  const confirmDelete = () => deleteMutation.mutate(deleteFeedId);

  // Sortable column header
  const SortableTh = ({ label, columnKey }) => (
    <th
      onClick={() => handleSort(columnKey)}
      className="px-4 py-4 text-left text-xs font-bold uppercase tracking-widest cursor-pointer select-none whitespace-nowrap"
      style={{ color: 'rgba(255,255,255,0.9)' }}
    >
      <div className="flex items-center gap-1">
        {label}
        <SortIcon columnKey={columnKey} />
      </div>
    </th>
  );

  return (
    <div className="min-h-screen" style={{ background: '#f0f4f0' }}>
      <SupplierNavbar />

      {/* ── Page Header ── */}
      <div
        className="w-full py-10 px-4 text-center relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0d4a2e 0%, #1a6b40 50%, #0a3d26 100%)' }}
      >
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.03) 10px, rgba(255,255,255,0.03) 20px)',
          }}
        />
        <div className="relative">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
              style={{ background: 'linear-gradient(135deg, #34d970, #1a9e4a)' }}
            >
              <GrassIcon style={{ color: '#fff', fontSize: 22 }} />
            </div>
            <h1
              className="text-4xl font-bold text-white"
              style={{ fontFamily: "'Nunito', sans-serif" }}
            >
              Feed <span style={{ color: '#4ade80', fontStyle: 'italic' }}>Inventory</span>
            </h1>
          </div>
          <p className="text-white/60 text-sm">Manage and monitor all your feed listings</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">

        <div className="flex flex-col sm:flex-row gap-3 mb-6 items-stretch sm:items-center justify-between">

          <div className="relative flex-1 max-w-md">
            <SearchIcon
              fontSize="small"
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: '#1a6b40' }}
            />
            <input
              type="text"
              placeholder="Search by Feed Name..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-all"
            />
          </div>

          <div className="flex gap-3 items-center">
            {/* Type Filter */}
            <div className="relative">
              <FilterListIcon
                fontSize="small"
                className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: '#1a6b40' }}
              />
              <select
                value={typeFilter}
                onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
                disabled={isLoading || uniqueTypes.length === 0}
                className="pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 outline-none focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-all appearance-none cursor-pointer disabled:opacity-50"
              >
                <option value="All">All Types</option>
                {uniqueTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => navigate('/supplier/add-feed')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-semibold text-sm border-none cursor-pointer transition-all hover:opacity-90 hover:shadow-lg active:scale-95 whitespace-nowrap"
              style={{ background: 'linear-gradient(135deg, #1a6b40, #0d4a2e)' }}
            >
              <AddCircleIcon fontSize="small" />
              Add Feed
            </button>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="h-1.5 w-full" style={{ background: 'linear-gradient(90deg, #1a6b40, #4ade80, #1a6b40)' }} />

          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]" role="table">
              <thead>
                 <tr style={{ background: 'linear-gradient(135deg, #1a6b40, #0d4a2e)' }}>
                   <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.9)' }}>
                     S.No
                   </th>
                   <SortableTh label="Feed Name" columnKey="feedName" />
                   <SortableTh label="Type" columnKey="type" />
                   <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.9)' }}>
                     Species
                   </th>
                   <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.9)' }}>
                     Description
                   </th>
                  <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.9)' }}>
                    Unit
                  </th>
                  <SortableTh label="Price / Unit" columnKey="pricePerUnit" />
                  <SortableTh label="Avail. Units" columnKey="availableUnits" />
                  <th className="px-4 py-4 text-center text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.9)' }}>
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                 {isLoading ? (
                   <tr>
                     <td colSpan="9" className="py-16 text-center">
                       <div className="flex flex-col items-center gap-3">
                         <div
                           className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"
                         />
                         <span className="text-gray-400 text-sm">Loading feeds...</span>
                       </div>
                     </td>
                   </tr>
                 ) : isError ? (
                   <tr>
                     <td colSpan="9" className="py-16 text-center">
                       <div className="flex flex-col items-center gap-2">
                         <WarningAmberIcon style={{ color: '#ef4444', fontSize: 36 }} />
                         <span className="text-red-500 text-sm font-medium">Failed to load feeds. Please try again.</span>
                       </div>
                     </td>
                   </tr>
                 ) : currentItems.length === 0 ? (
                   <tr>
                     <td colSpan="9" className="py-16 text-center">
                       <div className="flex flex-col items-center gap-2">
                         <InboxIcon style={{ color: '#9ca3af', fontSize: 40 }} />
                         <span className="text-gray-400 text-sm">No feeds found.</span>
                       </div>
                     </td>
                   </tr>
                ) : (
                  currentItems.map((feed, index) => (
                    <tr
                      key={feed._id}
                      className="hover:bg-green-50/50 transition-colors duration-150"
                    >
                      <td className="px-4 py-4 text-sm text-gray-400 font-medium">
                        {indexOfFirstItem + index + 1}
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-bold text-gray-800">{feed.feedName}</span>
                      </td>
                       <td className="px-4 py-4">
                         <span
                           className="px-2.5 py-1 rounded-full text-xs font-semibold"
                           style={{ background: 'rgba(26,107,64,0.1)', color: '#1a6b40' }}
                         >
                           {feed.type}
                         </span>
                       </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1 flex-wrap">
                            {Array.isArray(feed.species) && feed.species.length > 0 ? (
                              <>
                                {feed.species.slice(0, 2).map((s, i) => (
                                  <span key={i} className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
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
                              <span className="text-[10px] text-gray-400 italic">Not specified</span>
                            )}
                          </div>
                        </td>
                       <td className="px-4 py-4 text-sm text-gray-500 italic max-w-[180px] truncate" title={feed.description}>
                         "{feed.description}"
                       </td>
                      <td className="px-4 py-4 text-sm text-gray-600">{feed.unit}</td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-bold text-gray-800">₹{feed.pricePerUnit}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`text-sm font-semibold ${feed.availableUnits === 0 ? 'text-red-500' : 'text-gray-700'}`}
                        >
                          {feed.availableUnits}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(feed)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-white text-xs font-semibold border-none cursor-pointer transition-all hover:opacity-90 hover:shadow-md active:scale-95"
                            style={{ background: 'linear-gradient(135deg, #1a6b40, #0d4a2e)' }}
                          >
                            <EditIcon style={{ fontSize: 14 }} />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(feed._id)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-white text-xs font-semibold border-none cursor-pointer transition-all hover:opacity-90 hover:shadow-md active:scale-95"
                            style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}
                          >
                            <DeleteOutlineIcon style={{ fontSize: 14 }} />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!isLoading && !isError && totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
              <span className="text-xs text-gray-400">
                Showing <span className="font-semibold text-gray-600">{indexOfFirstItem + 1}–{Math.min(indexOfLastItem, sortedFeeds.length)}</span> of <span className="font-semibold text-gray-600">{sortedFeeds.length}</span> feeds
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200 bg-white text-gray-600 hover:border-green-400 hover:text-green-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronLeftIcon fontSize="small" />
                  Prev
                </button>

                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className="w-8 h-8 rounded-lg text-xs font-semibold border transition-all cursor-pointer"
                      style={
                        page === currentPage
                          ? { background: 'linear-gradient(135deg, #1a6b40, #0d4a2e)', color: '#fff', border: 'none' }
                          : { background: '#fff', color: '#6b7280', borderColor: '#e5e7eb' }
                      }
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200 bg-white text-gray-600 hover:border-green-400 hover:text-green-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  Next
                  <ChevronRightIcon fontSize="small" />
                </button>
              </div>
            </div>
          )}
        </div>

        {!isLoading && !isError && totalPages <= 1 && sortedFeeds.length > 0 && (
          <p className="text-center text-xs text-gray-400 mt-4">
            Showing all <span className="font-semibold text-gray-600">{sortedFeeds.length}</span> feed{sortedFeeds.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

{deleteFeedId && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          onClick={() => setDeleteFeedId(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(239,68,68,0.1)' }}
            >
              <DeleteOutlineIcon style={{ color: '#ef4444', fontSize: 30 }} />
            </div>
            <h3
              className="text-lg font-bold text-gray-800 mb-1"
              style={{ fontFamily: "'Nunito', sans-serif" }}
            >
              Delete Feed?
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              This action cannot be undone. The feed will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteFeedId(null)}
                className="flex-1 py-2.5 rounded-xl text-gray-600 font-semibold text-sm border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer bg-white"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteMutation.isLoading}
                className="flex-1 py-2.5 rounded-xl text-white font-semibold text-sm border-none cursor-pointer transition-all hover:opacity-90 active:scale-95 disabled:opacity-60 flex items-center justify-center gap-1"
                style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}
              >
                {deleteMutation.isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <DeleteOutlineIcon fontSize="small" />
                    Yes, Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Species Detail Modal */}
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
                <DeleteOutlineIcon style={{ fontSize: 18 }} />
              </button>
            </div>
            <div className="px-6 py-6">
              <p className="text-sm text-gray-500 mb-4">
                <strong>{selectedSpecies.feedName}</strong> is suitable for the following species:
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedSpecies.species.map((sp, idx) => (
                  <span key={idx} className="inline-block px-3 py-1.5 rounded-lg text-sm font-semibold bg-blue-50 text-blue-700 border border-blue-200">
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
    </div>
  );
};

export default ViewFeed;