import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { medicineAPI, livestockAPI, requestAPI } from '../apiConfig';
import OwnerNavbar from './OwnerNavbar';

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
import AddShoppingCartOutlinedIcon from '@mui/icons-material/AddShoppingCartOutlined';
import CloseIcon from '@mui/icons-material/Close';
import PetsOutlinedIcon from '@mui/icons-material/PetsOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined';
import ViewListOutlinedIcon from '@mui/icons-material/ViewListOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import GrassIcon from '@mui/icons-material/Grass';
import ScaleIcon from '@mui/icons-material/Scale';
import BoxIcon from '@mui/icons-material/ViewModuleOutlined';
import BottleIcon from '@mui/icons-material/LocalDrinkOutlined';
import DescriptionIcon from '@mui/icons-material/Description';

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

/* ── Medicine Card (Grid View) ── */
  const MedicineCard = ({ medicine, onRequest, onSpeciesClick }) => {
    const outOfStock = medicine.quantityInStock === 0;
    const expired = isExpired(medicine.expiryDate);
    const disabled = outOfStock || expired;

    const getPresentationIcon = (unit) => {
      const iconMap = {
        'Box': BoxIcon, 'Vial': BottleIcon, 'Bottle': BottleIcon,
        'Strip': BoxIcon, 'Sachet': BoxIcon, 'Bag': BoxIcon
      };
      return iconMap[unit] || BoxIcon;
    };

    const PIcon = getPresentationIcon(medicine.presentationUnit);
    const totalInventory = medicine.quantityInStock && medicine.contentSize && medicine.contentUnit && medicine.presentationUnit
? `${medicine.quantityInStock * medicine.contentSize} ${medicine.contentUnit} (${medicine.quantityInStock} ${medicine.presentationUnit}${medicine.quantityInStock > 1 ? 's' : ''} x ${medicine.contentSize} ${medicine.contentUnit} per ${medicine.presentationUnit?.toLowerCase() || 'unit'})`
      : null;

    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
        <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #1a6b40, #4ade80)' }} />
        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(26,107,64,0.1)' }}>
                <MedicalServicesOutlinedIcon style={{ color: '#1a6b40', fontSize: 20 }} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 leading-tight">{medicine.medicineName}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{medicine.manufacturer || 'N/A'}</p>
              </div>
            </div>
            <TypeBadge type={medicine.type} />
          </div>

          {/* Info Grid - Updated with packaging fields */}
          <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
            <div className="bg-gray-50 rounded-xl p-2.5">
              <p className="text-gray-400 uppercase tracking-wider text-[10px] font-semibold mb-0.5">Dosage</p>
              <p className="text-gray-700 font-semibold">{medicine.dosage || 'N/A'}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-2.5">
              <p className="text-gray-400 uppercase tracking-wider text-[10px] font-semibold mb-0.5">Packaging</p>
              <div className="flex items-center gap-1">
                <PIcon style={{ fontSize: 14, color: '#1a6b40' }} />
                <p className="text-gray-700 font-semibold">{medicine.quantityInStock} {medicine.presentationUnit}{medicine.quantityInStock !== 1 ? 's' : ''}</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-2.5">
              <p className="text-gray-400 uppercase tracking-wider text-[10px] font-semibold mb-0.5">Content Size</p>
<p className="text-gray-700 font-semibold">{medicine.contentSize} {medicine.contentUnit} / {medicine.presentationUnit?.toLowerCase() || 'N/A'}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-2.5">
              <p className="text-gray-400 uppercase tracking-wider text-[10px] font-semibold mb-0.5">Price/Unit</p>
              <p className="font-bold" style={{ color: '#1a6b40' }}>₹{medicine.pricePerUnit}</p>
            </div>
            {medicine.strength && (
              <div className="bg-gray-50 rounded-xl p-2.5">
                <p className="text-gray-400 uppercase tracking-wider text-[10px] font-semibold mb-0.5">Strength</p>
                <p className="text-gray-700 font-semibold">{medicine.strength}</p>
              </div>
            )}
            <div className="bg-gray-50 rounded-xl p-2.5">
              <p className="text-gray-400 uppercase tracking-wider text-[10px] font-semibold mb-0.5">Expiry</p>
              <p className={`font-semibold text-[11px] ${
                isExpired(medicine.expiryDate) ? 'text-red-500' : 
                isExpiringSoon(medicine.expiryDate) ? 'text-amber-600' : 'text-gray-600'
              }`}>
                {formatDate(medicine.expiryDate)}
              </p>
            </div>
            {totalInventory && (
              <div className="bg-emerald-50/50 rounded-xl p-2.5 col-span-2">
                <p className="text-emerald-700 uppercase tracking-wider text-[9px] font-semibold mb-0.5 flex items-center gap-1">
                  <ScaleIcon style={{ fontSize: 11 }} /> Total Inventory
                </p>
                <p className="text-emerald-800 text-[11px] font-bold leading-tight">{totalInventory}</p>
              </div>
            )}
            <div className="bg-gray-50 rounded-xl p-2.5 col-span-2">
              <p className="text-gray-400 uppercase tracking-wider text-[10px] font-semibold mb-1">Target Species</p>
              <div className="flex flex-wrap gap-1">
                {Array.isArray(medicine.species) && medicine.species.length > 0 ? (
                  <>
                    {medicine.species.slice(0, 3).map((s, i) => (
                      <span key={i} className="inline-block px-2 py-0.5 rounded text-[9px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                        {s}
                      </span>
                    ))}
                    {medicine.species.length > 3 && (
                      <button
                        onClick={() => onSpeciesClick({ medicineName: medicine.medicineName, species: medicine.species })}
                        className="inline-block px-2 py-0.5 rounded text-[9px] font-medium text-emerald-600 hover:text-emerald-700 hover:underline"
                      >
                        +{medicine.species.length - 3} more
                      </button>
                    )}
                  </>
                ) : (
                  <span className="text-[9px] text-gray-400 italic">Not specified</span>
                )}
              </div>
            </div>
          </div>

          {/* Request Button */}
          <button
            onClick={() => !disabled && onRequest(medicine)}
            disabled={disabled}
            className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold border-none cursor-pointer transition-all"
            style={disabled
              ? { background: '#f3f4f6', color: '#9ca3af', cursor: 'not-allowed' }
              : { background: 'linear-gradient(135deg, #1a6b40, #0d4a2e)', color: '#fff' }}
            onMouseEnter={e => { if (!disabled) e.currentTarget.style.opacity = '0.9'; }}
            onMouseLeave={e => { if (!disabled) e.currentTarget.style.opacity = '1'; }}
          >
            <AddShoppingCartOutlinedIcon style={{ fontSize: 15 }} />
            {outOfStock ? 'Out of Stock' : expired ? 'Expired' : 'Request Medicine'}
          </button>
        </div>
      </div>
    );
  };

/* ── Main Component ── */
const OwnerViewMedicine = () => {
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [viewMode, setViewMode] = useState('list');
  const [showRequestModal, setShowRequestModal] = useState(null);
const [selectedSpecies, setSelectedSpecies] = useState(null); // { medicineName, species: [] }
  const [selectedMedicineDetail, setSelectedMedicineDetail] = useState(null);
  const [selectedLivestock, setSelectedLivestock] = useState('');
  const [quantity, setQuantity] = useState('');
  const [requestErrors, setRequestErrors] = useState({});

  const itemsPerPage = viewMode === 'grid' ? 6 : 5;

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

  const { data: medicines, isLoading: medicinesLoading } = useQuery({
    queryKey: ['allMedicines'],
    queryFn: async () => {
      const response = await medicineAPI.getAllMedicine();
      return response.data;
    },
    retry: 1,
    retryDelay: 5000,
    refetchInterval: 5000,
    refetchOnWindowFocus: false,
    onError: () => toast.error('Failed to fetch medicines'),
  });

  const { data: livestock } = useQuery({
    queryKey: ['livestock'],
    queryFn: async () => {
      const response = await livestockAPI.getLivestockByOwnerId();
      return response.data;
    },
    retry: 1,
    retryDelay: 5000,
    refetchOnWindowFocus: false,
  });

  const requestMutation = useMutation({
    mutationFn: async (requestData) => {
      const response = await requestAPI.addRequest(requestData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['requests']);
      toast.success('Request sent successfully!');
      setShowRequestModal(null);
      setSelectedLivestock('');
      setQuantity('');
      setRequestErrors({});
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to send request');
    },
  });

  const medicinesArray = Array.isArray(medicines) ? medicines : [];
  const livestockArray = Array.isArray(livestock) ? livestock : [];

const uniqueTypes = React.useMemo(() => (
    [...new Set(medicinesArray.map(m => m.type || '').filter(Boolean))].sort()
  ), [medicinesArray]);

const filtered = medicinesArray.filter(m => {
    const matchSearch = (m.medicineName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = typeFilter === 'All' || m.type === typeFilter;
    return matchSearch && matchType;
  });

  const sorted = sortData(filtered, sortConfig.key);
  const totalPages = Math.ceil(sorted.length / itemsPerPage);
  const indexOfFirst = (currentPage - 1) * itemsPerPage;
  const currentItems = sorted.slice(indexOfFirst, indexOfFirst + itemsPerPage);

  const handleRequestClick = (medicine) => {
    setShowRequestModal(medicine);
    setRequestErrors({});
    setSelectedLivestock('');
    setQuantity('');
  };

  const validateRequest = () => {
    const errors = {};
    if (!selectedLivestock) errors.livestock = 'Please select a livestock';
    if (!quantity) errors.quantity = 'Quantity is required';
    else if (Number(quantity) <= 0) errors.quantity = 'Quantity must be greater than 0';
else if (Number(quantity) > showRequestModal.quantityInStock)
        errors.quantity = `Only ${showRequestModal.quantityInStock} units available`;
    setRequestErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleConfirmRequest = () => {
    if (!validateRequest()) return;
    requestMutation.mutate({
      itemType: 'Medicine',
      itemId: showRequestModal._id,
      itemName: showRequestModal.medicineName,
      livestockName: selectedLivestock,
      quantity: Number(quantity),
    });
  };

  const SortableTh = ({ label, columnKey }) => (
    <th
      onClick={() => handleSort(columnKey)}
      className="px-4 py-4 text-left text-xs font-bold uppercase tracking-widest cursor-pointer select-none whitespace-nowrap"
      style={{ color: 'rgba(255,255,255,0.9)' }}
    >
      <div className="flex items-center gap-1">{label}<SortIcon columnKey={columnKey} sortConfig={sortConfig} /></div>
    </th>
  );

  return (
    <div className="min-h-screen" style={{ background: '#f0f4f0' }}>
      <OwnerNavbar />

      {/* ── Hero Header ── */}
      <div
        className="w-full py-10 px-4 text-center relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0d4a2e 0%, #1a6b40 50%, #0a3d26 100%)' }}
      >
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.03) 10px, rgba(255,255,255,0.03) 20px)' }}
        />
        <div className="relative">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
              style={{ background: 'linear-gradient(135deg, #34d970, #1a9e4a)' }}>
              <MedicalServicesOutlinedIcon style={{ color: '#fff', fontSize: 22 }} />
            </div>
            <h1 className="text-4xl font-bold text-white" style={{ fontFamily: "'Nunito', sans-serif" }}>
              Available <span style={{ color: '#4ade80', fontStyle: 'italic' }}>Medicines</span>
            </h1>
          </div>
          <p className="text-white/60 text-sm">Browse and request medicines for your livestock</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Medicines', value: medicinesArray.length, icon: <MedicalServicesOutlinedIcon style={{ fontSize: 20 }} />, color: '#1a6b40', bg: 'rgba(26,107,64,0.08)', border: 'rgba(26,107,64,0.2)' },
            { label: 'Types Available', value: uniqueTypes.length, icon: <ScienceOutlinedIcon style={{ fontSize: 20 }} />, color: '#7c3aed', bg: 'rgba(124,58,237,0.08)', border: 'rgba(124,58,237,0.2)' },
            { label: 'In Stock', value: medicinesArray.filter(m => m.availableUnits > 0 && !isExpired(m.expiryDate)).length, icon: <Inventory2OutlinedIcon style={{ fontSize: 20 }} />, color: '#0891b2', bg: 'rgba(8,145,178,0.08)', border: 'rgba(8,145,178,0.2)' },
            { label: 'Out of Stock', value: medicinesArray.filter(m => m.availableUnits === 0).length, icon: <WarningAmberOutlinedIcon style={{ fontSize: 20 }} />, color: '#dc2626', bg: 'rgba(220,38,38,0.08)', border: 'rgba(220,38,38,0.2)' },
          ].map(({ label, value, icon, color, bg, border }) => (
            <div key={label} className="bg-white rounded-2xl p-4 border shadow-sm flex items-center gap-3" style={{ borderColor: border }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg, color }}>
                {icon}
              </div>
              <div>
                <p className="text-2xl font-extrabold" style={{ color }}>{medicinesLoading ? '—' : value}</p>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider leading-tight">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Toolbar ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#1a6b40' }}>
              <SearchOutlinedIcon style={{ fontSize: 20 }} />
            </span>
            <input
              type="text"
              placeholder="Search by medicine name..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none placeholder-gray-400 transition-all"
              onFocus={e => { e.target.style.borderColor = '#1a6b40'; e.target.style.boxShadow = '0 0 0 3px rgba(26,107,64,0.1)'; }}
              onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
            />
          </div>

          {/* Type Filter */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#1a6b40' }}>
              <FilterListOutlinedIcon style={{ fontSize: 18 }} />
            </span>
            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
              className="pl-9 pr-8 py-2.5 text-sm border border-gray-200 rounded-xl outline-none appearance-none bg-white text-gray-700 cursor-pointer"
              onFocus={e => { e.target.style.borderColor = '#1a6b40'; e.target.style.boxShadow = '0 0 0 3px rgba(26,107,64,0.1)'; }}
              onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
            >
              <option value="All">All Types</option>
              {uniqueTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <KeyboardArrowDownIcon style={{ fontSize: 18 }} />
            </span>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl">
            <button
              onClick={() => { setViewMode('list'); setCurrentPage(1); }}
              className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow text-emerald-700' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <ViewListOutlinedIcon style={{ fontSize: 20 }} />
            </button>
            <button
              onClick={() => { setViewMode('grid'); setCurrentPage(1); }}
              className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow text-emerald-700' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <GridViewOutlinedIcon style={{ fontSize: 20 }} />
            </button>
          </div>
        </div>

        {/* ── Loading ── */}
        {medicinesLoading && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-10 h-10 border-4 rounded-full animate-spin"
              style={{ borderColor: 'rgba(26,107,64,0.2)', borderTopColor: '#1a6b40' }} />
            <span className="text-gray-400 text-sm">Loading medicines...</span>
          </div>
        )}

        {/* ── Content ── */}
        {!medicinesLoading && (
          <>
            {/* Grid View */}
            {viewMode === 'grid' && (
              currentItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 gap-3">
                  <InboxOutlinedIcon style={{ fontSize: 48, color: '#d1d5db' }} />
                  <p className="text-gray-400 font-semibold text-sm">
                    {medicinesArray.length === 0 ? 'No medicines available.' : 'No medicines match your filters.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {currentItems.map(medicine => (
<MedicineCard key={medicine._id} medicine={medicine} onRequest={handleRequestClick} onSpeciesClick={setSelectedSpecies} />
                  ))}
                </div>
              )
            )}

            {/* List View */}
            {viewMode === 'list' && (
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
                         <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.9)' }}>Action</th>
                       </tr>
                     </thead>
                    <tbody className="divide-y divide-gray-50">
                      {currentItems.length === 0 ? (
                        <tr>
                           <td colSpan="10" className="py-16 text-center">
                            <div className="flex flex-col items-center gap-3">
                              <InboxOutlinedIcon style={{ fontSize: 48, color: '#d1d5db' }} />
                              <p className="text-gray-400 font-semibold text-sm">
                                {medicinesArray.length === 0 ? 'No medicines available.' : 'No medicines match your filters.'}
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        currentItems.map((medicine, index) => {
                          const outOfStock = medicine.quantityInStock === 0;
                          const expired = isExpired(medicine.expiryDate);
                          const disabled = outOfStock || expired;
                          return (
<tr key={medicine._id} className="hover:bg-gray-50/80 transition-colors cursor-pointer" onClick={() => setSelectedMedicineDetail(medicine)}>
                              <td className="px-4 py-4 text-sm text-gray-400 font-medium">{indexOfFirst + index + 1}</td>
                              <td className="px-4 py-4">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(26,107,64,0.1)' }}>
                                    <MedicalServicesOutlinedIcon style={{ color: '#1a6b40', fontSize: 16 }} />
                                  </div>
                                  <p className="text-sm font-semibold text-gray-900">{medicine.medicineName}</p>
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
                                        <span key={i} className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                          {s}
                                        </span>
                                      ))}
                                      {medicine.species.length > 2 && (
                                        <button onClick={(e) => { e.stopPropagation(); setSelectedSpecies({ medicineName: medicine.medicineName, species: medicine.species }); }} className="text-[10px] font-medium text-emerald-600 hover:text-emerald-700 hover:underline">
                                          +{medicine.species.length - 2}
                                        </button>
                                      )}
                                    </>
                                  ) : (
                                    <span className="text-[10px] text-gray-400 italic">N/A</span>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className={`text-sm ${expired ? 'text-red-500 font-semibold' : isExpiringSoon(medicine.expiryDate) ? 'text-amber-600 font-semibold' : 'text-gray-600'}`}>
                                    {formatDate(medicine.expiryDate)}
                                  </span>
                                  <ExpiryBadge date={medicine.expiryDate} />
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <button onClick={(e) => { e.stopPropagation(); !disabled && handleRequestClick(medicine); }} disabled={disabled} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border-none cursor-pointer transition-all" style={disabled ? { background: '#f3f4f6', color: '#9ca3af', cursor: 'not-allowed' } : { background: 'linear-gradient(135deg, #1a6b40, #0d4a2e)', color: '#fff' }}>
                                  <AddShoppingCartOutlinedIcon style={{ fontSize: 14 }} />
                                  {outOfStock ? 'Out of Stock' : expired ? 'Expired' : 'Request'}
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {sorted.length > 0 && totalPages > 1 && (
                  <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                    <p className="text-xs text-gray-400">
                      Showing <span className="font-semibold text-gray-600">{indexOfFirst + 1}–{Math.min(indexOfFirst + itemsPerPage, sorted.length)}</span> of{' '}
                      <span className="font-semibold text-gray-600">{sorted.length}</span> medicines
                    </p>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-emerald-400 hover:text-emerald-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                        <ChevronLeftOutlinedIcon style={{ fontSize: 18 }} />
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button key={page} onClick={() => setCurrentPage(page)}
                          className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold border transition-all
                            ${currentPage === page ? 'text-white shadow border-transparent' : 'border-gray-200 text-gray-500 hover:border-emerald-400 hover:text-emerald-600'}`}
                          style={currentPage === page ? { background: 'linear-gradient(135deg, #1a6b40, #0d4a2e)' } : {}}>
                          {page}
                        </button>
                      ))}
                      <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-emerald-400 hover:text-emerald-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                        <ChevronRightOutlinedIcon style={{ fontSize: 18 }} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Grid Pagination */}
            {viewMode === 'grid' && sorted.length > 0 && totalPages > 1 && (
              <div className="flex items-center justify-between px-2 py-4 mt-2">
                <p className="text-xs text-gray-400">
                  Showing <span className="font-semibold text-gray-600">{indexOfFirst + 1}–{Math.min(indexOfFirst + itemsPerPage, sorted.length)}</span> of{' '}
                  <span className="font-semibold text-gray-600">{sorted.length}</span> medicines
                </p>
                <div className="flex items-center gap-2">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:border-emerald-400 hover:text-emerald-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                    <ChevronLeftOutlinedIcon style={{ fontSize: 18 }} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button key={page} onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold border transition-all
                        ${currentPage === page ? 'text-white shadow border-transparent' : 'border-gray-200 bg-white text-gray-500 hover:border-emerald-400 hover:text-emerald-600'}`}
                      style={currentPage === page ? { background: 'linear-gradient(135deg, #1a6b40, #0d4a2e)' } : {}}>
                      {page}
                    </button>
                  ))}
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:border-emerald-400 hover:text-emerald-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                    <ChevronRightOutlinedIcon style={{ fontSize: 18 }} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Request Modal ── */}
      {showRequestModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          onClick={() => !requestMutation.isLoading && setShowRequestModal(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="relative p-6 pb-4" style={{ background: 'linear-gradient(135deg, #0d4a2e, #1a6b40)' }}>
              <div
                className="absolute inset-0 opacity-10"
                style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.03) 10px, rgba(255,255,255,0.03) 20px)' }}
              />
              <button
                onClick={() => !requestMutation.isLoading && setShowRequestModal(null)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors border-none cursor-pointer"
              >
                <CloseIcon style={{ fontSize: 18 }} />
              </button>
              <div className="relative flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/15">
                  <MedicalServicesOutlinedIcon style={{ color: '#4ade80', fontSize: 24 }} />
                </div>
                <div>
                  <p className="text-white/60 text-xs font-semibold uppercase tracking-wider">Request Medicine</p>
                  <h3 className="text-white font-bold text-lg leading-tight" style={{ fontFamily: "'Nunito', sans-serif" }}>
                    {showRequestModal.medicineName}
                  </h3>
                </div>
              </div>

              {/* Info pills */}
              <div className="relative flex gap-2 mt-4 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-semibold">
                  <Inventory2OutlinedIcon style={{ fontSize: 13 }} />
                  {showRequestModal.quantityInStock} {showRequestModal.presentationUnit}{showRequestModal.quantityInStock !== 1 ? 's' : ''} in stock
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-semibold">
                  <ScaleIcon style={{ fontSize: 13 }} />
{showRequestModal.contentSize} {showRequestModal.contentUnit} / {showRequestModal.presentationUnit?.toLowerCase() || 'N/A'}
                </span>
                {showRequestModal.strength && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-semibold">
                    {showRequestModal.strength}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-semibold">
₹{showRequestModal.pricePerUnit} / {showRequestModal.presentationUnit?.toLowerCase() || 'N/A'}
                </span>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Livestock Select */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: '#1a6b40' }}>
                  <PetsOutlinedIcon style={{ fontSize: 15, color: '#1a6b40' }} />
                  Select Livestock <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedLivestock}
                    onChange={(e) => {
                      setSelectedLivestock(e.target.value);
                      setRequestErrors(prev => ({ ...prev, livestock: '' }));
                    }}
                    className={`w-full px-4 py-3 rounded-xl border text-sm text-gray-700 outline-none transition-all bg-gray-50 appearance-none cursor-pointer
                      ${requestErrors.livestock ? 'border-red-400' : 'border-gray-200'}`}
                    onFocus={e => { e.target.style.borderColor = '#1a6b40'; e.target.style.boxShadow = '0 0 0 3px rgba(26,107,64,0.1)'; e.target.style.background = '#fff'; }}
                    onBlur={e => { e.target.style.borderColor = requestErrors.livestock ? '#f87171' : '#e5e7eb'; e.target.style.boxShadow = 'none'; e.target.style.background = '#f9fafb'; }}
                  >
                    <option value="">— Select your livestock —</option>
                    {livestockArray.map(item => (
                      <option key={item._id} value={item.name}>{item.name} ({item.species})</option>
                    ))}
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <KeyboardArrowDownIcon style={{ fontSize: 18 }} />
                  </span>
                </div>
                {requestErrors.livestock && (
                  <span className="text-xs font-medium mt-1 block text-red-500">⚠ {requestErrors.livestock}</span>
                )}
              </div>

              {/* Quantity Input */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: '#1a6b40' }}>
                  <Inventory2OutlinedIcon style={{ fontSize: 15, color: '#1a6b40' }} />
                  Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => {
                    setQuantity(e.target.value);
                    setRequestErrors(prev => ({ ...prev, quantity: '' }));
                  }}
                  min="1"
                  max={showRequestModal.quantityInStock}
                  placeholder={`Enter quantity (max ${showRequestModal.availableUnits})`}
                  className={`w-full px-4 py-3 rounded-xl border text-sm text-gray-700 outline-none transition-all bg-gray-50
                    ${requestErrors.quantity ? 'border-red-400' : 'border-gray-200'}`}
                  onFocus={e => { e.target.style.borderColor = '#1a6b40'; e.target.style.boxShadow = '0 0 0 3px rgba(26,107,64,0.1)'; e.target.style.background = '#fff'; }}
                  onBlur={e => { e.target.style.borderColor = requestErrors.quantity ? '#f87171' : '#e5e7eb'; e.target.style.boxShadow = 'none'; e.target.style.background = '#f9fafb'; }}
                />
                {requestErrors.quantity && (
                  <span className="text-xs font-medium mt-1 block text-red-500">⚠ {requestErrors.quantity}</span>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowRequestModal(null)}
                  disabled={requestMutation.isLoading}
                  className="flex-1 py-3 rounded-xl font-semibold text-sm text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors border-none cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmRequest}
                  disabled={requestMutation.isLoading}
                  className="flex-1 py-3 rounded-xl font-bold text-sm text-white border-none cursor-pointer transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #1a6b40, #0d4a2e)' }}
                >
                  {requestMutation.isLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <CheckCircleOutlinedIcon style={{ fontSize: 16 }} />
                      Confirm Request
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                <strong>{selectedSpecies.medicineName}</strong> is suitable for the following species:
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

      {/* ── Medicine Detail Modal ── */}
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
            {/* Header */}
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

            {/* Body */}
            <div className="p-6">
              {/* Type & Stock Status */}
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
{selectedMedicineDetail.contentSize} {selectedMedicineDetail.contentUnit} / {selectedMedicineDetail.presentationUnit?.toLowerCase() || 'N/A'}
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

              {/* Total Inventory */}
              <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100">
                <p className="text-[10px] uppercase tracking-wider text-emerald-600 font-semibold mb-1 flex items-center gap-1">
                  <ScaleIcon style={{ fontSize: 11 }} /> Total Inventory
                </p>
                <p className="text-emerald-700 font-bold">
                  {selectedMedicineDetail.quantityInStock * selectedMedicineDetail.contentSize} {selectedMedicineDetail.contentUnit} 
({selectedMedicineDetail.quantityInStock} {selectedMedicineDetail.presentationUnit}{selectedMedicineDetail.quantityInStock !== 1 ? 's' : ''} × {selectedMedicineDetail.contentSize} {selectedMedicineDetail.contentUnit} per {selectedMedicineDetail.presentationUnit?.toLowerCase() || 'N/A'})
                </p>
              </div>

              {/* Description */}
              <div className="mb-4">
                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1.5">Description</p>
                <p className="text-sm text-gray-600 leading-relaxed">"{selectedMedicineDetail.description}"</p>
              </div>

              {/* Expiry Date */}
              <div className="mb-4 p-3 rounded-xl bg-gray-50">
                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">Expiry Date</p>
                <p className={`text-sm font-semibold ${isExpired(selectedMedicineDetail.expiryDate) ? 'text-red-500' : isExpiringSoon(selectedMedicineDetail.expiryDate) ? 'text-amber-600' : 'text-gray-700'}`}>
                  {formatDate(selectedMedicineDetail.expiryDate)}
                </p>
              </div>

              {/* Target Species */}
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

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2 border-t border-gray-100">
                <button
                  onClick={() => { setShowRequestModal(selectedMedicineDetail); setSelectedMedicineDetail(null); }}
                  disabled={selectedMedicineDetail.quantityInStock === 0 || isExpired(selectedMedicineDetail.expiryDate)}
                  className="flex-1 py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: 'linear-gradient(135deg, #1a6b40, #0d4a2e)' }}
                >
                  <AddShoppingCartOutlinedIcon style={{ fontSize: 16 }} />
                  Request Medicine
                </button>
                <button
                  onClick={() => setSelectedMedicineDetail(null)}
                  className="px-6 py-3 rounded-xl font-semibold text-sm text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default OwnerViewMedicine;