import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { medicineAPI } from '../apiConfig';
import SupplierNavbar from './SupplierNavbar';

// MUI Icons
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import MedicalServicesOutlinedIcon from '@mui/icons-material/MedicalServicesOutlined';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import FilterListOutlinedIcon from '@mui/icons-material/FilterListOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ChevronLeftOutlinedIcon from '@mui/icons-material/ChevronLeftOutlined';
import ChevronRightOutlinedIcon from '@mui/icons-material/ChevronRightOutlined';
import LocalPharmacyOutlinedIcon from '@mui/icons-material/LocalPharmacyOutlined';
import VaccinesOutlinedIcon from '@mui/icons-material/VaccinesOutlined';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'; 
import CloseIcon from '@mui/icons-material/Close';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined';
import ViewListOutlinedIcon from '@mui/icons-material/ViewListOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import GrassIcon from '@mui/icons-material/Grass';
import ScaleIcon from '@mui/icons-material/Scale';
import BoxIcon from '@mui/icons-material/ViewModuleOutlined';
import BottleIcon from '@mui/icons-material/LocalDrinkOutlined';
import AddCircleOutlinedIcon from '@mui/icons-material/AddCircleOutlined'; 

/* ── Helpers ── */
const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const isExpired = (date) => date && new Date(date) < new Date();
const isExpiringSoon = (date) => {
  if (!date) return false;
  const diff = new Date(date) - new Date();
  return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000;
};

const typeIconMap = {
  Antibiotic: <LocalPharmacyOutlinedIcon style={{ fontSize: 15 }} />,
  Vaccine: <VaccinesOutlinedIcon style={{ fontSize: 15 }} />,
  Supplement: <ScienceOutlinedIcon style={{ fontSize: 15 }} />,
};

const TypeBadge = ({ type }) => {
  const colors = {
    Antibiotic: 'bg-blue-50 text-blue-700 border-blue-200',
    Vaccine: 'bg-purple-50 text-purple-700 border-purple-200',
    Supplement: 'bg-teal-50 text-teal-700 border-teal-200',
  };
  const cls = colors[type] || 'bg-gray-50 text-gray-600 border-gray-200';
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-semibold ${cls}`}>
      {typeIconMap[type] || <MedicalServicesOutlinedIcon style={{ fontSize: 15 }} />}
      {type || 'N/A'}
    </span>
  );
};

const ExpiryBadge = ({ date }) => {
  if (isExpired(date))
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-50 border border-red-200 text-red-600 text-[10px] font-semibold"><WarningAmberOutlinedIcon style={{ fontSize: 11 }} />Expired</span>;
  if (isExpiringSoon(date))
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-semibold"><WarningAmberOutlinedIcon style={{ fontSize: 11 }} />Soon</span>;
  return null;
};

const StockBadge = ({ units }) => {
  if (units === 0)
    return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border bg-red-50 border-red-200 text-red-600 text-xs font-semibold">Out of Stock</span>;
  if (units <= 10)
    return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border bg-amber-50 border-amber-200 text-amber-700 text-xs font-semibold">{units} left</span>;
  return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border bg-emerald-50 border-emerald-200 text-emerald-700 text-xs font-semibold">{units} units</span>;
};

const SortIcon = ({ columnKey, sortConfig }) => {
  if (sortConfig.key !== columnKey) return <UnfoldMoreIcon fontSize="small" style={{ opacity: 0.4 }} />;
  return sortConfig.direction === 'asc'
    ? <ArrowUpwardIcon fontSize="small" style={{ color: '#4ade80' }} />
    : <ArrowDownwardIcon fontSize="small" style={{ color: '#4ade80' }} />;
};

/* ── Main Component ── */
const ViewMedicine = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: 'medicineName', direction: 'asc' });
  const [viewMode, setViewMode] = useState('grid');
  const [deleteMedicineId, setDeleteMedicineId] = useState(null);
  const [selectedSpecies, setSelectedSpecies] = useState(null);
  const [selectedMedicineDetail, setSelectedMedicineDetail] = useState(null);

  const itemsPerPage = viewMode === 'grid' ? 8 : 5;

  const { data: medicines, isLoading: medicinesLoading } = useQuery({
    queryKey: ['myMedicines'],
    queryFn: async () => {
      const response = await medicineAPI.getMedicineByOwnerId();
      return response.data;
    },
    retry: 1,
    refetchInterval: 5000,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const response = await medicineAPI.deleteMedicine(id);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['myMedicines']);
      toast.success('Medicine deleted successfully');
      setDeleteMedicineId(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete medicine');
    }
  });

  const handleSort = (key) => {
    setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));
    setCurrentPage(1);
  };

  const sortData = (data, key) => {
    if (!key) return data;
    return [...data].sort((a, b) => {
      let aVal = a[key], bVal = b[key];
      if (key === 'expiryDate') { aVal = new Date(aVal).getTime(); bVal = new Date(bVal).getTime(); }
      if (typeof aVal === 'number' && typeof bVal === 'number')
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      if (typeof aVal === 'string' && typeof bVal === 'string')
        return sortConfig.direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      return 0;
    });
  };

  const medicinesArray = Array.isArray(medicines) ? medicines : [];
  const uniqueTypes = React.useMemo(() => (
    [...new Set(medicinesArray.map(m => m.type || '').filter(Boolean))].sort()
  ), [medicinesArray]);

  const filtered = medicinesArray.filter(m => {
    const matchSearch = (m.medicineName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                        (m.manufacturer || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = typeFilter === 'All' || m.type === typeFilter;
    return matchSearch && matchType;
  });

  const sorted = sortData(filtered, sortConfig.key);
  const totalPages = Math.ceil(sorted.length / itemsPerPage);
  const indexOfFirst = (currentPage - 1) * itemsPerPage;
  const currentItems = sorted.slice(indexOfFirst, indexOfFirst + itemsPerPage);

  const SortableTh = ({ label, columnKey }) => (
    <th
      onClick={() => handleSort(columnKey)}
      className="px-4 py-4 text-left text-xs font-bold uppercase tracking-widest cursor-pointer select-none whitespace-nowrap"
      style={{ color: 'rgba(255,255,255,0.9)' }}
    >
      <div className="flex items-center gap-1">{label}<SortIcon columnKey={columnKey} sortConfig={sortConfig} /></div>
    </th>
  );

  const getPresentationIcon = (unit) => {
    const iconMap = { 'Box': BoxIcon, 'Vial': BottleIcon, 'Bottle': BottleIcon, 'Strip': BoxIcon, 'Sachet': BoxIcon, 'Bag': BoxIcon };
    return iconMap[unit] || BoxIcon;
  };

  return (
    <div className="min-h-screen" style={{ background: '#f0f4f0' }}>
      <SupplierNavbar />

      {/* Hero Header */}
      <div className="w-full py-10 px-4 text-center relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0d4a2e 0%, #1a6b40 50%, #0a3d26 100%)' }}>
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.03) 10px, rgba(255,255,255,0.03) 20px)' }} />
        <div className="relative">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
              style={{ background: 'linear-gradient(135deg, #34d970, #1a9e4a)' }}>
              <MedicalServicesOutlinedIcon style={{ color: '#fff', fontSize: 22 }} />
            </div>
            <h1 className="text-4xl font-bold text-white" style={{ fontFamily: "'Nunito', sans-serif" }}>
              Medicine <span style={{ color: '#4ade80', fontStyle: 'italic' }}>Inventory</span>
            </h1>
          </div>
          <p className="text-white/60 text-sm">Manage and monitor medical supplies for your clients</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Items', value: medicinesArray.length, icon: <MedicalServicesOutlinedIcon />, color: '#1a6b40', bg: 'rgba(26,107,64,0.08)' },
            { label: 'Low Stock', value: medicinesArray.filter(m => m.quantityInStock <= 10 && m.quantityInStock > 0).length, icon: <WarningAmberOutlinedIcon />, color: '#b45309', bg: 'rgba(180,83,9,0.08)' },
            { label: 'Expired', value: medicinesArray.filter(m => isExpired(m.expiryDate)).length, icon: <WarningAmberOutlinedIcon />, color: '#dc2626', bg: 'rgba(220,38,38,0.08)' },
            { label: 'Types', value: uniqueTypes.length, icon: <ScienceOutlinedIcon />, color: '#7c3aed', bg: 'rgba(124,58,237,0.08)' },
          ].map(({ label, value, icon, color, bg }) => (
            <div key={label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg, color }}>
                {React.cloneElement(icon, { style: { fontSize: 20 } })}
              </div>
              <div>
                <p className="text-2xl font-extrabold" style={{ color }}>{medicinesLoading ? '—' : value}</p>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider leading-tight">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#1a6b40' }}>
              <SearchOutlinedIcon style={{ fontSize: 20 }} />
            </span>
            <input
              type="text"
              placeholder="Search by name or manufacturer..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none transition-all"
            />
          </div>

          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
              className="pl-4 pr-10 py-2.5 text-sm border border-gray-200 rounded-xl outline-none appearance-none bg-white text-gray-700 cursor-pointer"
            >
              <option value="All">All Types</option>
              {uniqueTypes.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <KeyboardArrowDownIcon style={{ fontSize: 18 }} />
            </span>
          </div>

          <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl">
            <button onClick={() => setViewMode('list')} className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow text-emerald-700' : 'text-gray-400 hover:text-gray-600'}`}>
              <ViewListOutlinedIcon style={{ fontSize: 20 }} />
            </button>
            <button onClick={() => setViewMode('grid')} className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow text-emerald-700' : 'text-gray-400 hover:text-gray-600'}`}>
              <GridViewOutlinedIcon style={{ fontSize: 20 }} />
            </button>
          </div>

          <button
            onClick={() => navigate('/supplier/add-medicine')}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-white font-bold text-sm border-none cursor-pointer shadow-md transition-all hover:opacity-90 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #1a6b40, #0d4a2e)' }}
          >
            <AddCircleOutlinedIcon style={{ fontSize: 18 }} />
            Add New
          </button>
        </div>

        {/* Content Section */}
        {medicinesLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-10 h-10 border-4 rounded-full animate-spin" style={{ borderColor: 'rgba(26,107,64,0.2)', borderTopColor: '#1a6b40' }} />
            <span className="text-gray-400 text-sm">Loading inventory...</span>
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {currentItems.length === 0 ? (
                  <div className="col-span-full py-24 flex flex-col items-center gap-3">
                    <InboxOutlinedIcon style={{ fontSize: 48, color: '#d1d5db' }} />
                    <p className="text-gray-400 font-semibold text-sm">No medicines found.</p>
                  </div>
                ) : (
                  currentItems.map(medicine => {
                    const PIcon = getPresentationIcon(medicine.presentationUnit);
                    return (
                      <div key={medicine._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col cursor-pointer" onClick={() => setSelectedMedicineDetail(medicine)}>
                        <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #1a6b40, #4ade80)' }} />
                        <div className="p-4 flex-1 flex flex-col">
                          <div className="flex justify-between items-start mb-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(26,107,64,0.1)' }}>
                              <MedicalServicesOutlinedIcon style={{ color: '#1a6b40', fontSize: 20 }} />
                            </div>
                            <TypeBadge type={medicine.type} />
                          </div>
                          <h3 className="text-sm font-bold text-gray-900 mb-1">{medicine.medicineName}</h3>
                          <p className="text-xs text-gray-400 mb-3">{medicine.manufacturer || 'N/A'}</p>
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-400 flex items-center gap-1"><PIcon style={{ fontSize: 14 }} /> Stock</span>
                              <StockBadge units={medicine.quantityInStock} />
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-400 flex items-center gap-1"><ScaleIcon style={{ fontSize: 14 }} /> Content</span>
                              <span className="font-semibold text-gray-700">{medicine.contentSize} {medicine.contentUnit}</span>
                            </div>
                          </div>
                          <div className="mt-auto pt-3 border-t border-gray-50 flex items-center gap-2">
                            <button onClick={(e) => { e.stopPropagation(); navigate(`/supplier/edit-medicine/${medicine._id}`, { state: { medicine } }); }}
                              className="flex-1 py-2 rounded-lg bg-gray-100 text-gray-600 text-xs font-bold hover:bg-gray-200 transition-colors border-none cursor-pointer">
                              Edit
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); setDeleteMedicineId(medicine._id); }}
                              className="w-9 h-9 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all border-none cursor-pointer">
                              <DeleteOutlinedIcon style={{ fontSize: 18 }} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            ) : (
              <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                <div className="h-1.5 w-full" style={{ background: 'linear-gradient(90deg, #1a6b40, #4ade80, #1a6b40)' }} />
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px]">
                    <thead>
                       <tr style={{ background: 'linear-gradient(135deg, #1a6b40, #0d4a2e)' }}>
                         <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.9)' }}>#</th>
                         <SortableTh label="Medicine Name" columnKey="medicineName" />
                         <SortableTh label="Type" columnKey="type" />
                         <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.9)' }}>Stock</th>
                         <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.9)' }}>Content</th>
                         <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.9)' }}>Species</th>
                         <SortableTh label="Expiry" columnKey="expiryDate" />
                         <th className="px-4 py-4 text-center text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.9)' }}>Actions</th>
                       </tr>
                     </thead>
                    <tbody className="divide-y divide-gray-50">
                      {currentItems.length === 0 ? (
                        <tr><td colSpan="8" className="py-16 text-center text-gray-400">No data found.</td></tr>
                      ) : (
                        currentItems.map((medicine, index) => (
                          <tr key={medicine._id} className="hover:bg-gray-50/80 transition-colors cursor-pointer" onClick={() => setSelectedMedicineDetail(medicine)}>
                            <td className="px-4 py-4 text-sm text-gray-400 font-medium">{indexOfFirst + index + 1}</td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(26,107,64,0.1)' }}>
                                  <MedicalServicesOutlinedIcon style={{ color: '#1a6b40', fontSize: 16 }} />
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-gray-900">{medicine.medicineName}</p>
                                  <p className="text-[10px] text-gray-400 uppercase font-bold">{medicine.manufacturer}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4"><TypeBadge type={medicine.type} /></td>
                            <td className="px-4 py-4"><StockBadge units={medicine.quantityInStock} /></td>
                            <td className="px-4 py-4 text-sm text-gray-600">{medicine.contentSize} {medicine.contentUnit}</td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-1 flex-wrap max-w-[120px]">
                                {Array.isArray(medicine.species) && medicine.species.length > 0 ? (
                                  <>
                                    {medicine.species.slice(0, 2).map((s, i) => (
                                      <span key={i} className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200">{s}</span>
                                    ))}
                                    {medicine.species.length > 2 && (
                                      <button onClick={(e) => { e.stopPropagation(); setSelectedSpecies({ medicineName: medicine.medicineName, species: medicine.species }); }} className="text-[10px] font-medium text-emerald-600 hover:underline">+{medicine.species.length - 2}</button>
                                    )}
                                  </>
                                ) : <span className="text-[10px] text-gray-400 italic">N/A</span>}
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-1.5">
                                <span className={`text-sm ${isExpired(medicine.expiryDate) ? 'text-red-500 font-semibold' : 'text-gray-600'}`}>{formatDate(medicine.expiryDate)}</span>
                                <ExpiryBadge date={medicine.expiryDate} />
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center justify-center gap-2">
                                <button onClick={(e) => { e.stopPropagation(); navigate(`/supplier/edit-medicine/${medicine._id}`, { state: { medicine } }); }}
                                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all border-none cursor-pointer">
                                  <EditOutlinedIcon style={{ fontSize: 16 }} />
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); setDeleteMedicineId(medicine._id); }}
                                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all border-none cursor-pointer">
                                  <DeleteOutlinedIcon style={{ fontSize: 16 }} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-2 py-6">
                <p className="text-xs text-gray-400">
                  Showing <span className="font-semibold text-gray-600">{indexOfFirst + 1}–{Math.min(indexOfFirst + itemsPerPage, sorted.length)}</span> of <span className="font-semibold text-gray-600">{sorted.length}</span> items
                </p>
                <div className="flex items-center gap-2">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:border-emerald-400 disabled:opacity-40 cursor-pointer">
                    <ChevronLeftOutlinedIcon style={{ fontSize: 18 }} />
                  </button>
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:border-emerald-400 disabled:opacity-40 cursor-pointer">
                    <ChevronRightOutlinedIcon style={{ fontSize: 18 }} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Medicine Detail Modal (Identical to Owner side) ── */}
      {selectedMedicineDetail && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          onClick={() => setSelectedMedicineDetail(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="relative p-6 pb-4" style={{ background: 'linear-gradient(135deg, #0d4a2e, #1a6b40)' }}>
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.03) 10px, rgba(255,255,255,0.03) 20px)' }} />
              <button
                onClick={() => setSelectedMedicineDetail(null)}
                type="button"
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer border-none"
              >
                <CloseIcon style={{ fontSize: 18 }} />
              </button>
              <div className="relative flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/15">
                  <MedicalServicesOutlinedIcon style={{ color: '#4ade80', fontSize: 24 }} />
                </div>
                <div className="flex-1">
                  <p className="text-white/60 text-xs font-semibold uppercase tracking-wider">Medicine Details</p>
                  <h3 className="text-white font-bold text-xl leading-tight">{selectedMedicineDetail.medicineName}</h3>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Type & Stock Status Pills */}
              <div className="flex flex-wrap gap-2 mb-4">
                <TypeBadge type={selectedMedicineDetail.type} />
                <StockBadge units={selectedMedicineDetail.quantityInStock} />
                {isExpired(selectedMedicineDetail.expiryDate) && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-red-200 bg-red-50 text-red-600 text-xs font-semibold">
                    <WarningAmberOutlinedIcon style={{ fontSize: 12 }} /> Expired
                  </span>
                )}
              </div>

              {/* Key Details Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">Dosage</p>
                  <p className="text-sm font-bold text-gray-800">{selectedMedicineDetail.dosage || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">Packaging</p>
                  <p className="text-sm font-bold text-gray-800">{selectedMedicineDetail.quantityInStock} {selectedMedicineDetail.presentationUnit}{selectedMedicineDetail.quantityInStock !== 1 ? 's' : ''}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">Content Size</p>
                  <p className="text-sm font-bold text-gray-800">{selectedMedicineDetail.contentSize} {selectedMedicineDetail.contentUnit} / {selectedMedicineDetail.presentationUnit?.toLowerCase() || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">Manufacturer</p>
                  <p className="text-sm font-bold text-gray-800">{selectedMedicineDetail.manufacturer || 'N/A'}</p>
                </div>
              </div>

              {selectedMedicineDetail.strength && (
                <div className="mb-4">
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1.5">Strength</p>
                  <p className="text-sm font-bold text-gray-800">{selectedMedicineDetail.strength}</p>
                </div>
              )}

              {/* Total Inventory Emerald Banner */}
              <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100">
                <p className="text-[10px] uppercase tracking-wider text-emerald-600 font-semibold mb-1 flex items-center gap-1">
                  <ScaleIcon style={{ fontSize: 11 }} /> Total Inventory
                </p>
                <p className="text-emerald-700 font-bold">
                  {selectedMedicineDetail.quantityInStock * (selectedMedicineDetail.contentSize || 0)} {selectedMedicineDetail.contentUnit} 
                  ({selectedMedicineDetail.quantityInStock} {selectedMedicineDetail.presentationUnit}{selectedMedicineDetail.quantityInStock !== 1 ? 's' : ''} × {selectedMedicineDetail.contentSize} {selectedMedicineDetail.contentUnit} per {selectedMedicineDetail.presentationUnit?.toLowerCase() || 'N/A'})
                </p>
              </div>

              {/* Description Section */}
              <div className="mb-4">
                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1.5">Description</p>
                <p className="text-sm text-gray-600 leading-relaxed">"{selectedMedicineDetail.description}"</p>
              </div>

              {/* Expiry Date Section */}
              <div className="mb-4 p-3 rounded-xl bg-gray-50">
                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">Expiry Date</p>
                <p className={`text-sm font-semibold ${isExpired(selectedMedicineDetail.expiryDate) ? 'text-red-500' : isExpiringSoon(selectedMedicineDetail.expiryDate) ? 'text-amber-600' : 'text-gray-700'}`}>
                  {formatDate(selectedMedicineDetail.expiryDate)}
                </p>
              </div>

              {/* Target Species Section */}
              <div className="mb-4">
                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1.5">Suitable For</p>
                <div className="flex flex-wrap gap-1.5">
                  {Array.isArray(selectedMedicineDetail.species) && selectedMedicineDetail.species.length > 0 ? (
                    selectedMedicineDetail.species.map((sp, idx) => (
                      <span key={idx} className="inline-block px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        {sp}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-400 italic">Not specified</span>
                  )}
                </div>
              </div>

              {/* Action Buttons (Styled identically to Owner, with Supplier logic) */}
              <div className="flex gap-3 pt-6 border-t border-gray-100">
                <button
                  onClick={() => { navigate(`/supplier/edit-medicine/${selectedMedicineDetail._id}`, { state: { medicine: selectedMedicineDetail } }); setSelectedMedicineDetail(null); }}
                  className="flex-1 py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 border-none cursor-pointer"
                  style={{ background: 'linear-gradient(135deg, #1a6b40, #0d4a2e)' }}
                >
                  <EditOutlinedIcon style={{ fontSize: 16 }} />
                  Edit Medicine
                </button>
                <button
                  onClick={() => { setDeleteMedicineId(selectedMedicineDetail._id); setSelectedMedicineDetail(null); }}
                  className="px-6 py-3 rounded-xl font-semibold text-sm text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors border-none cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Species Modal */}
      {selectedSpecies && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={() => setSelectedSpecies(null)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-5 flex items-center gap-3 bg-emerald-600 text-white">
              <GrassIcon />
              <h3 className="font-extrabold">Target Species</h3>
              <button onClick={() => setSelectedSpecies(null)} className="ml-auto bg-transparent border-none text-white cursor-pointer"><CloseIcon /></button>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-500 mb-4">Suitable for <strong>{selectedSpecies.medicineName}</strong>:</p>
              <div className="flex flex-wrap gap-2">
                {selectedSpecies.species.map((sp, idx) => (
                  <span key={idx} className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-blue-50 text-blue-700 border border-blue-200">{sp}</span>
                ))}
              </div>
              <button onClick={() => setSelectedSpecies(null)} className="w-full mt-6 py-3 rounded-2xl bg-emerald-600 text-white font-bold border-none cursor-pointer">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteMedicineId && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white rounded-3xl p-8 w-full max-w-sm text-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 bg-red-50 text-red-500"><DeleteOutlinedIcon style={{ fontSize: 30 }} /></div>
            <h3 className="text-lg font-bold mb-2">Delete Medicine?</h3>
            <p className="text-gray-500 text-sm mb-6">This action cannot be undone. This medicine will be permanently removed.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteMedicineId(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 bg-white font-bold cursor-pointer">Cancel</button>
              <button onClick={() => deleteMutation.mutate(deleteMedicineId)} className="flex-1 py-2.5 rounded-xl text-white bg-red-500 border-none font-bold cursor-pointer">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewMedicine;