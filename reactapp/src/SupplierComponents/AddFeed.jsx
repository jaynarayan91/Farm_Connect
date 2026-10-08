import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { feedAPI } from '../apiConfig';
import SupplierNavbar from './SupplierNavbar';

// MUI Icons
import GrassIcon from '@mui/icons-material/Grass';
import CategoryIcon from '@mui/icons-material/Category';
import DescriptionIcon from '@mui/icons-material/Description';
import ScaleIcon from '@mui/icons-material/Scale';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import EditNoteIcon from '@mui/icons-material/EditNote';

const AddFeed = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const editFeed = location.state?.feed;

  const [formData, setFormData] = useState({
    feedName: '',
    type: '',
    species: [],
    description: '',
    unit: '',
    pricePerUnit: '',
    availableUnits: ''
  });
  const [errors, setErrors] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editFeed) {
      setFormData({
        feedName: editFeed.feedName,
        type: editFeed.type || '',
        species: Array.isArray(editFeed.species) ? editFeed.species : [],
        description: editFeed.description,
        unit: editFeed.unit,
        pricePerUnit: editFeed.pricePerUnit,
        availableUnits: editFeed.availableUnits || 0
      });
    } else {
      setFormData({ feedName: '', type: '', species: [], description: '', unit: '', pricePerUnit: '', availableUnits: '' });
    }
  }, [editFeed, location.key]);

   const validate = () => {
      const newErrors = {};
      if (!formData.feedName.trim()) newErrors.feedName = 'Feed name is required';
      if (!formData.type) newErrors.type = 'Category is required';
      if (!formData.species || formData.species.length === 0) newErrors.species = 'At least one target species is required';
      if (!formData.description.trim()) newErrors.description = 'Description is required';
     if (!formData.unit.trim()) newErrors.unit = 'Unit is required';
     if (!formData.pricePerUnit) newErrors.pricePerUnit = 'Price per unit is required';
     else if (isNaN(formData.pricePerUnit) || Number(formData.pricePerUnit) <= 0) newErrors.pricePerUnit = 'Price must be a valid positive number';
     if (!formData.availableUnits) newErrors.availableUnits = 'Available units is required';
     else if (isNaN(formData.availableUnits) || Number(formData.availableUnits) < 0) newErrors.availableUnits = 'Available units must be a valid number';
     setErrors(newErrors);
     return Object.keys(newErrors).length === 0;
   };

   const handleChange = (e) => {
     const { name, value, type, checked } = e.target;

     if (name === 'species') {
       const currentSpecies = formData.species || [];
       const newSpecies = checked
         ? [...currentSpecies, value]
         : currentSpecies.filter(s => s !== value);
       setFormData(prev => ({ ...prev, species: newSpecies }));
     } else {
       setFormData({ ...formData, [name]: value });
     }
     if (errors[name]) setErrors({ ...errors, [name]: '' });
   };

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!validate()) return;
      setIsSubmitting(true);
      try {
        const feedData = {
          feedName: formData.feedName.trim(),
          type: formData.type.trim(),
          species: formData.species,
          description: formData.description.trim(),
          unit: formData.unit.trim(),
          pricePerUnit: Number(formData.pricePerUnit),
          availableUnits: Number(formData.availableUnits)
        };
        let response;
        if (editFeed) {
          response = await feedAPI.updateFeed(editFeed._id, feedData);
        } else {
          response = await feedAPI.addFeed(feedData);
        }
        if (response.data) setShowSuccessModal(true);
      } catch (error) {
        toast.error(error.response?.data?.message || 'An error occurred. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    navigate('/supplier/view-feeds');
  };

  const isEditMode = Boolean(editFeed);

  return (
    <div className="min-h-screen" style={{ background: '#f0f4f0' }}>
      <SupplierNavbar />

      {/* ── Page Header ── */}
      <div
        className="w-full py-10 px-4 text-center relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0d4a2e 0%, #1a6b40 50%, #0a3d26 100%)' }}
      >
        {/* texture */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.03) 10px, rgba(255,255,255,0.03) 20px)',
          }}
        />
        <div className="relative">
          <h1
            className="text-4xl font-bold text-white mb-2"
            style={{ fontFamily: "'Nunito', sans-serif" }}
          >
            {isEditMode ? 'Edit ' : 'Add New '}
            <span style={{ color: '#4ade80', fontStyle: 'italic' }}>
              {isEditMode ? 'Feed' : 'Feed'}
            </span>
          </h1>
          <p className="text-white/60 text-sm">
            {isEditMode
              ? 'Update your feed details below'
              : 'Fill in the details to add a new feed to your inventory'}
          </p>
        </div>
      </div>

      {/* ── Form Card ── */}
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">

          {/* Card top accent bar */}
          <div className="h-1.5 w-full" style={{ background: 'linear-gradient(90deg, #1a6b40, #4ade80, #1a6b40)' }} />

          <div className="p-8">
            <form onSubmit={handleSubmit} noValidate>

              {/* Row 1: Feed Name + Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                <FormField
                  label="Feed Name"
                  icon={<GrassIcon fontSize="small" />}
                  error={errors.feedName}
                >
                  <input
                    type="text"
                    name="feedName"
                    value={formData.feedName}
                    onChange={handleChange}
                    placeholder="e.g. Wheat Bran"
                    disabled={isSubmitting}
                    className={inputClass(errors.feedName)}
                  />
                </FormField>

                 <FormField
                   label="Feed Category"
                   icon={<CategoryIcon fontSize="small" />}
                   error={errors.type}
                 >
                   <select
                     name="type"
                     value={formData.type}
                     onChange={handleChange}
                     disabled={isSubmitting}
                     className={inputClass(errors.type) + ' appearance-none cursor-pointer'}
                   >
                     <option value="">Select Category</option>
                     <option value="Concentrates">Concentrates</option>
                     <option value="Roughages">Roughages</option>
                     <option value="Minerals">Minerals</option>
                     <option value="Vitamins">Vitamins</option>
                     <option value="Supplements">Supplements</option>
                   </select>
                 </FormField>
               </div>

               {/* Row 3: Species (Multi-select) */}
               <div className="mb-5">
                 <FormField label="Target Species" required icon={<CategoryIcon fontSize="small" />} error={errors.species}>
                   <div className="flex flex-wrap gap-2">
                      {["Cattle", "Poultry", "Sheep", "Goats", "Swine", "Equines", "Camelids", "Rabbits"].map(species => (
                        <label
                          key={species}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer transition-all ${
                            formData.species?.includes(species)
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                              : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-emerald-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            name="species"
                            value={species}
                            checked={formData.species?.includes(species)}
                            onChange={handleChange}
                            className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                          />
                          <span className="text-sm font-medium">{species}</span>
                        </label>
                      ))}
                    </div>
                  </FormField>
                </div>

                {/* Row 4: Description */}
                <div className="mb-5">
                <FormField
                  label="Description"
                  icon={<DescriptionIcon fontSize="small" />}
                  error={errors.description}
                >
                  <textarea
                    name="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe the feed quality, composition, usage..."
                    disabled={isSubmitting}
                    className={inputClass(errors.description) + ' resize-none'}
                  />
                </FormField>
              </div>

              {/* Row 3: Unit + Price Per Unit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                <FormField
                  label="Trading Unit"
                  icon={<ScaleIcon fontSize="small" />}
                  error={errors.unit}
                >
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className={inputClass(errors.unit) + ' appearance-none cursor-pointer'}
                  >
                    <option value="">Select unit</option>
                    <option value="g">g (grams)</option>
                    <option value="kg">kg (kilograms)</option>
                    <option value="Tonne">Tonne</option>
                    <option value="Bag (10 kg)">Bag (10 kg)</option>
                    <option value="Bag (20 kg)">Bag (20 kg)</option>
                  </select>
                </FormField>

                <FormField
                  label="Price Per Unit (₹)"
                  icon={<CurrencyRupeeIcon fontSize="small" />}
                  error={errors.pricePerUnit}
                >
                  <input
                    type="number"
                    name="pricePerUnit"
                    value={formData.pricePerUnit}
                    onChange={handleChange}
                    placeholder="0.00"
                    min="0"
                    disabled={isSubmitting}
                    className={inputClass(errors.pricePerUnit)}
                  />
                </FormField>
              </div>

              {/* Row 4: Available Units */}
              <div className="mb-8">
                <FormField
                  label="Available Units"
                  icon={<Inventory2Icon fontSize="small" />}
                  error={errors.availableUnits}
                >
                  <input
                    type="number"
                    name="availableUnits"
                    value={formData.availableUnits}
                    onChange={handleChange}
                    placeholder="Enter stock quantity"
                    min="0"
                    disabled={isSubmitting}
                    className={inputClass(errors.availableUnits)}
                  />
                </FormField>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2 transition-all duration-200 hover:opacity-90 hover:shadow-lg active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed border-none cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #1a6b40, #0d4a2e)' }}
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Processing...
                  </>
                ) : isEditMode ? (
                  <>
                    <EditNoteIcon fontSize="small" />
                    Update Feed
                  </>
                ) : (
                  <>
                    <AddCircleIcon fontSize="small" />
                    Add Feed
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ── Success Modal ── */}
      {showSuccessModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          onClick={handleModalClose}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(26,107,64,0.1)' }}
            >
              <CheckCircleOutlineIcon style={{ color: '#1a6b40', fontSize: 36 }} />
            </div>
               <h3
                 className="text-xl font-bold mb-2"
                 style={{ color: '#0d4a2e', fontFamily: "'Nunito', sans-serif" }}
               >
                 {isEditMode ? 'Feed Updated!' : 'Feed Added!'}
               </h3>
               <p className="text-gray-500 text-sm mb-6">
                 {isEditMode
                   ? 'Your feed details have been updated.'
                   : 'New feed has been added to your inventory.'}
               </p>
            <button
              onClick={handleModalClose}
              className="w-full py-3 rounded-xl text-white font-semibold text-sm border-none cursor-pointer transition-all duration-200 hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #1a6b40, #0d4a2e)' }}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ── Reusable Field Wrapper ── */
const FormField = ({ label, icon, error, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest" style={{ color: '#1a6b40' }}>
      <span style={{ color: '#1a6b40', display: 'flex' }}>{icon}</span>
      {label}
    </label>
    {children}
    {error && (
      <span className="text-xs font-medium" style={{ color: '#ef4444' }}>
        ⚠ {error}
      </span>
    )}
  </div>
);

/* ── Input class helper ── */
const inputClass = (error) =>
  `w-full px-4 py-3 rounded-xl border text-sm text-gray-700 outline-none transition-all duration-150 bg-gray-50 placeholder-gray-400 focus:bg-white focus:ring-2 disabled:opacity-60 disabled:cursor-not-allowed ${
    error
      ? 'border-red-400 focus:ring-red-100'
      : 'border-gray-200 focus:border-green-500 focus:ring-green-100'
  }`;

export default AddFeed;