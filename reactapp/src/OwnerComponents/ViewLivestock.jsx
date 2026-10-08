import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { livestockAPI, getImageUrl } from '../apiConfig';
import OwnerNavbar from './OwnerNavbar';

// MUI Icons
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PetsIcon from '@mui/icons-material/Pets';
import FavoriteIcon from '@mui/icons-material/Favorite';
import VaccinesIcon from '@mui/icons-material/Vaccines';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import InboxIcon from '@mui/icons-material/Inbox';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import CloseIcon from '@mui/icons-material/Close';
import GradeIcon from '@mui/icons-material/Grade';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';

const ViewLivestock = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteLivestockId, setDeleteLivestockId] = useState(null);
  const [showAttachmentModal, setShowAttachmentModal] = useState(null);
  const [speciesFilter, setSpeciesFilter] = useState('All');
  const [healthFilter, setHealthFilter] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const itemsPerPage = viewMode === 'grid' ? 8 : 5;

  const { data: livestock, isLoading, isError } = useQuery({
    queryKey: ['myLivestock'],
    queryFn: async () => {
      const response = await livestockAPI.getLivestockByOwnerId();
      return response.data;
    },
    retry: 1,
    retryDelay: 5000,
    refetchInterval: 5000,
    refetchOnWindowFocus: false
  });

  const deleteMutation = useMutation({
    mutationFn: async (livestockId) => {
      const response = await livestockAPI.deleteLivestock(livestockId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['myLivestock']);
      toast.success('Livestock deleted successfully');
      setDeleteLivestockId(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete livestock');
    }
  });

  const livestockArray = Array.isArray(livestock) ? livestock : [];
  const uniqueSpecies = [...new Set(livestockArray.map(item => item.species).filter(Boolean))].sort();
  const uniqueHealthConditions = [...new Set(livestockArray.map(item => item.healthCondition).filter(Boolean))].sort();

  const sortData = (data, key) => {
    if (!key) return data;
    return [...data].sort((a, b) => {
      let aVal = a[key], bVal = b[key];
      if (key === 'age') return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      if (typeof aVal === 'string' && typeof bVal === 'string')
        return sortConfig.direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      return 0;
    });
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));
  };

  const filteredLivestock = livestockArray.filter(item => {
    const s = searchTerm.toLowerCase();
    return (
      (item.name.toLowerCase().includes(s) || item.species.toLowerCase().includes(s) || item.breed.toLowerCase().includes(s)) &&
      (speciesFilter === 'All' || item.species === speciesFilter) &&
      (healthFilter === 'All' || item.healthCondition === healthFilter)
    );
  });

  const sortedLivestock = sortData(filteredLivestock, sortConfig.key);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedLivestock.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedLivestock.length / itemsPerPage);

  const handleEdit = (item) => navigate(`/owner/edit-livestock/${item._id}`, { state: { livestock: item } });
  const handleDelete = (id) => setDeleteLivestockId(id);
  const confirmDelete = () => deleteMutation.mutate(deleteLivestockId);

  // Health badge style
  const healthBadge = (condition) => {
    const lc = condition?.toLowerCase() || '';
    if (lc.includes('healthy') || lc.includes('excellent'))
      return { bg: 'rgba(26,107,64,0.12)', color: '#1a6b40', label: condition };
    if (lc.includes('attention') || lc.includes('sick') || lc.includes('poor'))
      return { bg: 'rgba(234,179,8,0.15)', color: '#a16207', label: condition };
    return { bg: 'rgba(107,114,128,0.12)', color: '#4b5563', label: condition };
  };

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return <UnfoldMoreIcon fontSize="small" style={{ opacity: 0.4 }} />;
    return sortConfig.direction === 'asc'
      ? <ArrowUpwardIcon fontSize="small" style={{ color: '#4ade80' }} />
      : <ArrowDownwardIcon fontSize="small" style={{ color: '#4ade80' }} />;
  };

  const SortableTh = ({ label, columnKey }) => (
    <th
      onClick={() => handleSort(columnKey)}
      className="px-4 py-4 text-left text-xs font-bold uppercase tracking-widest cursor-pointer select-none whitespace-nowrap"
      style={{ color: 'rgba(255,255,255,0.9)' }}
    >
      <div className="flex items-center gap-1">{label}<SortIcon columnKey={columnKey} /></div>
    </th>
  );

  const fallbackImg = 'https://via.placeholder.com/400x300?text=No+Image';

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
              <PetsIcon style={{ color: '#fff', fontSize: 22 }} />
            </div>
            <h1 className="text-4xl font-bold text-white" style={{ fontFamily: "'Nunito', sans-serif" }}>
              Livestock <span style={{ color: '#4ade80', fontStyle: 'italic' }}>Inventory</span>
            </h1>
          </div>
          <p className="text-white/60 text-sm">Manage and track your farm assets in real-time</p>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* ── Toolbar ── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 items-stretch sm:items-center justify-between flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <SearchIcon fontSize="small" className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#1a6b40' }} />
            <input
              type="text"
              placeholder="Search by Name, Species, Breed..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-all"
            />
          </div>

          <div className="flex gap-2 flex-wrap items-center">
            <div className="relative">
              <FilterListIcon fontSize="small" className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#1a6b40' }} />
              <select value={speciesFilter}
                onChange={(e) => { setSpeciesFilter(e.target.value); setCurrentPage(1); }}
                className="pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 outline-none focus:ring-2 focus:ring-green-200 focus:border-green-500 appearance-none cursor-pointer"
              >
                <option value="All">All Species</option>
                {uniqueSpecies.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="relative">
              <MonitorHeartIcon fontSize="small" className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#1a6b40' }} />
              <select value={healthFilter}
                onChange={(e) => { setHealthFilter(e.target.value); setCurrentPage(1); }}
                className="pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 outline-none focus:ring-2 focus:ring-green-200 focus:border-green-500 appearance-none cursor-pointer"
              >
                <option value="All">All Health</option>
                {uniqueHealthConditions.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>

            <div className="flex rounded-xl border border-gray-200 overflow-hidden bg-white">
              <button
                onClick={() => { setViewMode('grid'); setCurrentPage(1); }}
                className={`p-2.5 transition-colors border-none cursor-pointer ${viewMode === 'grid' ? 'text-white' : 'text-gray-400 bg-white hover:bg-gray-50'}`}
                style={viewMode === 'grid' ? { background: 'linear-gradient(135deg, #1a6b40, #0d4a2e)' } : {}}
                title="Grid view"
              >
                <GridViewIcon fontSize="small" />
              </button>
              <button
                onClick={() => { setViewMode('list'); setCurrentPage(1); }}
                className={`p-2.5 transition-colors border-none cursor-pointer ${viewMode === 'list' ? 'text-white' : 'text-gray-400 bg-white hover:bg-gray-50'}`}
                style={viewMode === 'list' ? { background: 'linear-gradient(135deg, #1a6b40, #0d4a2e)' } : {}}
                title="List view"
              >
                <ViewListIcon fontSize="small" />
              </button>
            </div>

            {/* Add Button */}
            <button
              onClick={() => navigate('/owner/add-livestock')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-semibold text-sm border-none cursor-pointer transition-all hover:opacity-90 hover:shadow-lg active:scale-95 whitespace-nowrap"
              style={{ background: 'linear-gradient(135deg, #1a6b40, #0d4a2e)' }}
            >
              <AddCircleIcon fontSize="small" />
              Add Livestock
            </button>
          </div>
        </div>

        {/* ── Loading / Error ── */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
            <span className="text-gray-400 text-sm">Loading livestock...</span>
          </div>
        )}

        {isError && !isLoading && (
          <div className="flex flex-col items-center justify-center py-24 gap-2">
            <WarningAmberIcon style={{ color: '#ef4444', fontSize: 40 }} />
            <span className="text-red-500 text-sm font-medium">Failed to load livestock. Please try again later.</span>
          </div>
        )}

        {!isLoading && !isError && currentItems.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-2">
            <InboxIcon style={{ color: '#9ca3af', fontSize: 44 }} />
            <span className="text-gray-400 text-sm">
              {livestockArray.length === 0 ? 'No livestock found.' : 'No livestock match your filters.'}
            </span>
          </div>
        )}

        {/* ══ GRID VIEW ══ */}
        {!isLoading && !isError && currentItems.length > 0 && viewMode === 'grid' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {currentItems.map((item, index) => {
              const badge = healthBadge(item.healthCondition);
              return (
                <div key={item._id}
                  className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col hover:shadow-xl transition-shadow duration-200"
                >
                  {/* Image */}
                  <div className="relative h-44 overflow-hidden bg-gray-100">
                    {item.attachment ? (
                      <img src={getImageUrl(item.attachment)} alt={item.name}
                        onError={(e) => { e.target.src = fallbackImg; }}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <PetsIcon style={{ color: '#d1d5db', fontSize: 48 }} />
                      </div>
                    )}
                    {/* Health badge top-right */}
                    <span
                      className="absolute top-2.5 right-2.5 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide shadow"
                      style={{ background: badge.bg, color: badge.color, backdropFilter: 'blur(4px)' }}
                    >
                      {badge.label}
                    </span>
                    {/* Index badge top-left */}
                    <span className="absolute top-2.5 left-2.5 w-6 h-6 rounded-full bg-black/40 text-white text-[10px] font-bold flex items-center justify-center">
                      #{indexOfFirstItem + index + 1}
                    </span>
                  </div>

                  {/* Body */}
                  <div className="p-4 flex flex-col flex-1">
                    <div className="flex items-start justify-between mb-0.5">
                      <h3 className="text-base font-bold text-gray-800">{item.name}</h3>
                    </div>
                    <span className="text-sm font-semibold mb-3" style={{ color: '#1a6b40' }}>{item.species}</span>

                    <div className="flex flex-col gap-1.5 text-xs text-gray-500 mb-4">
                      <span className="flex items-center gap-1.5">
                        <GradeIcon style={{ fontSize: 14, color: '#9ca3af' }} />
                        {item.breed}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <LocationOnIcon style={{ fontSize: 14, color: '#9ca3af' }} />
                        {item.location}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MonitorHeartIcon style={{ fontSize: 14, color: '#9ca3af' }} />
                        {item.healthCondition}
                      </span>
                      <span className="flex items-center gap-1.5 text-gray-400">
                        <PetsIcon style={{ fontSize: 13, color: '#9ca3af' }} />
                        Age: {item.age} {item.age === 1 ? 'Year' : 'Years'}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-auto pt-3 border-t border-gray-100">
                      <button onClick={() => handleEdit(item)}
                        className="flex items-center gap-1 flex-1 justify-center py-2 rounded-xl text-xs font-semibold border-none cursor-pointer transition-all hover:opacity-90 active:scale-95 text-white"
                        style={{ background: 'linear-gradient(135deg, #1a6b40, #0d4a2e)' }}>
                        <EditIcon style={{ fontSize: 14 }} /> Edit
                      </button>
                      <button onClick={() => handleDelete(item._id)}
                        className="flex items-center gap-1 justify-center w-9 h-9 rounded-xl border border-red-100 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-colors cursor-pointer">
                        <DeleteOutlineIcon style={{ fontSize: 16 }} />
                      </button>
                      {item.attachment && (
                        <button onClick={() => setShowAttachmentModal(item)}
                          className="flex items-center gap-1 justify-center w-9 h-9 rounded-xl border border-gray-200 bg-gray-50 text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition-colors cursor-pointer">
                          <VisibilityIcon style={{ fontSize: 16 }} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ══ LIST VIEW ══ */}
        {!isLoading && !isError && currentItems.length > 0 && viewMode === 'list' && (
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="h-1.5 w-full" style={{ background: 'linear-gradient(90deg, #1a6b40, #4ade80, #1a6b40)' }} />
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]" role="table">
                <thead>
                  <tr style={{ background: 'linear-gradient(135deg, #1a6b40, #0d4a2e)' }}>
                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.9)' }}>S.No</th>
                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.9)' }}>Livestock</th>
                    <SortableTh label="Name" columnKey="name" />
                    <SortableTh label="Species" columnKey="species" />
                    <SortableTh label="Age" columnKey="age" />
                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.9)' }}>Breed & Location</th>
                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.9)' }}>Health Status</th>
                    <th className="px-4 py-4 text-center text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.9)' }}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {currentItems.map((item, index) => {
                    const badge = healthBadge(item.healthCondition);
                    return (
                      <tr key={item._id} className="hover:bg-green-50/40 transition-colors duration-150">
                        <td className="px-4 py-4 text-sm text-gray-400 font-medium">{indexOfFirstItem + index + 1}</td>
                        <td className="px-4 py-4">
                          <div className="w-11 h-11 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
                            {item.attachment
                              ? <img src={getImageUrl(item.attachment)} alt={item.name} onError={(e) => { e.target.src = fallbackImg; }} className="w-full h-full object-cover" />
                              : <PetsIcon style={{ color: '#d1d5db', fontSize: 22 }} />}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm font-bold text-gray-800">{item.name}</p>
                          <p className="text-xs text-gray-400">Age: {item.age} yr</p>
                        </td>
                        <td className="px-4 py-4">
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: 'rgba(26,107,64,0.1)', color: '#1a6b40' }}>
                            {item.species}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600">{item.age} yr</td>
                        <td className="px-4 py-4">
                          <p className="text-xs font-semibold text-gray-700">{item.breed}</p>
                          <p className="text-xs text-gray-400 flex items-center gap-0.5 mt-0.5">
                            <LocationOnIcon style={{ fontSize: 11 }} />{item.location}
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: badge.bg, color: badge.color }}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => handleEdit(item)}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-white text-xs font-semibold border-none cursor-pointer transition-all hover:opacity-90 active:scale-95"
                              style={{ background: 'linear-gradient(135deg, #1a6b40, #0d4a2e)' }}>
                              <EditIcon style={{ fontSize: 13 }} /> Edit
                            </button>
                            <button onClick={() => handleDelete(item._id)}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-white text-xs font-semibold border-none cursor-pointer transition-all hover:opacity-90 active:scale-95"
                              style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
                              <DeleteOutlineIcon style={{ fontSize: 13 }} /> Delete
                            </button>
                            {item.attachment && (
                              <button onClick={() => setShowAttachmentModal(item)}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer">
                                <VisibilityIcon style={{ fontSize: 13 }} /> Photo
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination inside list card */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                <span className="text-xs text-gray-400">
                  Showing <span className="font-semibold text-gray-600">{indexOfFirstItem + 1}–{Math.min(indexOfLastItem, sortedLivestock.length)}</span> of <span className="font-semibold text-gray-600">{sortedLivestock.length}</span>
                </span>
                <PaginationControls currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} />
              </div>
            )}
          </div>
        )}

        {/* Pagination for grid view */}
        {!isLoading && !isError && viewMode === 'grid' && totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <span className="text-xs text-gray-400">
              Showing <span className="font-semibold text-gray-600">{indexOfFirstItem + 1}–{Math.min(indexOfLastItem, sortedLivestock.length)}</span> of <span className="font-semibold text-gray-600">{sortedLivestock.length}</span>
            </span>
            <PaginationControls currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} />
          </div>
        )}

        {/* Summary when no pagination */}
        {!isLoading && !isError && totalPages <= 1 && sortedLivestock.length > 0 && (
          <p className="text-center text-xs text-gray-400 mt-6">
            Showing all <span className="font-semibold text-gray-600">{sortedLivestock.length}</span> livestock
          </p>
        )}
      </div>

      {/* ── Delete Modal ── */}
      {deleteLivestockId && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          onClick={() => setDeleteLivestockId(null)}>
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm text-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(239,68,68,0.1)' }}>
              <DeleteOutlineIcon style={{ color: '#ef4444', fontSize: 30 }} />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-1" style={{ fontFamily: "'Nunito', sans-serif" }}>Delete Livestock?</h3>
            <p className="text-gray-500 text-sm mb-6">This action cannot be undone. The record will be permanently removed.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteLivestockId(null)}
                className="flex-1 py-2.5 rounded-xl text-gray-600 font-semibold text-sm border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer bg-white">
                Cancel
              </button>
              <button onClick={confirmDelete} disabled={deleteMutation.isLoading}
                className="flex-1 py-2.5 rounded-xl text-white font-semibold text-sm border-none cursor-pointer hover:opacity-90 active:scale-95 disabled:opacity-60 flex items-center justify-center gap-1"
                style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
                {deleteMutation.isLoading
                  ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Deleting...</>
                  : <><DeleteOutlineIcon fontSize="small" />Yes, Delete</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Attachment Modal ── */}
      {showAttachmentModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
          onClick={() => setShowAttachmentModal(null)}>
          <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="h-1.5 w-full" style={{ background: 'linear-gradient(90deg, #1a6b40, #4ade80, #1a6b40)' }} />
            <button onClick={() => setShowAttachmentModal(null)}
              className="absolute top-4 right-4 w-8 h-8 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full flex items-center justify-center border-none cursor-pointer z-10 transition-colors">
              <CloseIcon style={{ fontSize: 18 }} />
            </button>
            <div className="p-5">
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#1a6b40' }}>
                {showAttachmentModal.name} — Photo
              </p>
              <img src={getImageUrl(showAttachmentModal.attachment)} alt={showAttachmentModal.name}
                onError={(e) => { e.target.src = fallbackImg; }}
                className="w-full rounded-2xl object-cover max-h-80"
              />
              <button onClick={() => setShowAttachmentModal(null)}
                className="w-full mt-4 py-3 rounded-xl text-white font-semibold text-sm border-none cursor-pointer hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #1a6b40, #0d4a2e)' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ── Pagination Controls ── */
const PaginationControls = ({ currentPage, totalPages, setCurrentPage }) => (
  <div className="flex items-center gap-2">
    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200 bg-white text-gray-600 hover:border-green-400 hover:text-green-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
      <ChevronLeftIcon fontSize="small" />Prev
    </button>
    <div className="flex gap-1">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
        <button key={page} onClick={() => setCurrentPage(page)}
          className="w-8 h-8 rounded-lg text-xs font-semibold border transition-all cursor-pointer"
          style={page === currentPage
            ? { background: 'linear-gradient(135deg, #1a6b40, #0d4a2e)', color: '#fff', border: 'none' }
            : { background: '#fff', color: '#6b7280', borderColor: '#e5e7eb' }}>
          {page}
        </button>
      ))}
    </div>
    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200 bg-white text-gray-600 hover:border-green-400 hover:text-green-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
      Next<ChevronRightIcon fontSize="small" />
    </button>
  </div>
);

export default ViewLivestock;