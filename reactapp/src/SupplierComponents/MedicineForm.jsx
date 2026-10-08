import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { medicineAPI } from '../apiConfig';
import SupplierNavbar from './SupplierNavbar';

// MUI Icons
import MedicationIcon from '@mui/icons-material/Medication';
import CategoryIcon from '@mui/icons-material/Category';
import DescriptionIcon from '@mui/icons-material/Description';
import InventoryIcon from '@mui/icons-material/Inventory';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import BusinessIcon from '@mui/icons-material/Business';
import EventIcon from '@mui/icons-material/Event';
import ScaleIcon from '@mui/icons-material/Scale';
import ScienceIcon from '@mui/icons-material/Science';
import SaveIcon from '@mui/icons-material/Save';
import EditNoteIcon from '@mui/icons-material/EditNote';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import CloseIcon from '@mui/icons-material/Close';

/* ── Reusable FormField wrapper (matches LivestockForm style exactly) ── */
const FormField = ({ label, required, icon, error, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest" style={{ color: '#1a6b40' }}>
      <span style={{ color: '#1a6b40', display: 'flex' }}>{icon}</span>
      {label}
      {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {error && <span className="text-xs font-medium" style={{ color: '#ef4444' }}>⚠ {error}</span>}
  </div>
);

const inputClass = (error) =>
  `w-full px-4 py-3 rounded-xl border text-sm text-gray-700 outline-none transition-all duration-150 bg-gray-50 placeholder-gray-400 focus:bg-white focus:ring-2 disabled:opacity-60 disabled:cursor-not-allowed ${
    error ? 'border-red-400 focus:ring-red-100' : 'border-gray-200 focus:border-green-500 focus:ring-green-100'
  }`;

const MedicineForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const isEditMode = Boolean(id) || Boolean(location.state?.medicine);

  const [formData, setFormData] = useState({
    medicineName: '',
    medicineType: '',
    species: [],
    description: '',
    dosage: '',
    pricePerUnit: '',
    presentationUnit: '',
    quantityInStock: '',
    contentSize: '',
    contentUnit: '',
    strength: '',
    manufacturer: '',
    expiryDate: ''
  });
  const [errors, setErrors] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [totalInventory, setTotalInventory] = useState('');

  const getContentUnits = (medicineType) => {
    const unitMap = {
      'Vaccine': ['Doses', 'ml', 'Vials'],
      'Nutritional Supplement': ['g', 'kg', 'L', 'ml'],
      'Antibiotic': ['mg', 'ml', 'Tablets', 'Capsules']
    };
    return unitMap[medicineType] || ['ml', 'mg', 'g', 'kg', 'Tablets', 'Capsules', 'Doses', 'L'];
  };

  const presentationUnits = ['Box', 'Vial', 'Bottle', 'Strip', 'Sachet', 'Bag'];

  useEffect(() => {
    const med = location.state?.medicine;
    if (med) {
      setFormData({
        medicineName: med.medicineName,
        medicineType: med.type || '',
        species: Array.isArray(med.species) ? med.species : [],
        description: med.description,
        dosage: med.dosage,
        pricePerUnit: med.pricePerUnit,
        presentationUnit: med.presentationUnit || '',
        quantityInStock: med.quantityInStock,
        contentSize: med.contentSize,
        contentUnit: med.contentUnit || '',
        strength: med.strength || '',
        manufacturer: med.manufacturer,
        expiryDate: med.expiryDate ? new Date(med.expiryDate).toISOString().split('T')[0] : ''
      });
    }
  }, [location.state]);

  useEffect(() => {
    const qty = Number(formData.quantityInStock) || 0;
    const size = Number(formData.contentSize) || 0;
    const unit = formData.contentUnit;
    const presentation = formData.presentationUnit;
    
    if (qty > 0 && size > 0 && unit && presentation) {
      const total = qty * size;
      setTotalInventory(`${total} ${unit} (${qty} ${presentation}${qty > 1 ? 's' : ''} x ${size} ${unit} per ${presentation.toLowerCase()})`);
    } else {
      setTotalInventory('');
    }
  }, [formData.quantityInStock, formData.contentSize, formData.contentUnit, formData.presentationUnit]);

  const validate = () => {
    const newErrors = {};
    if (!formData.medicineName.trim()) newErrors.medicineName = 'Medicine name is required';
    if (!formData.medicineType) newErrors.medicineType = 'Medicine type is required';
    if (!formData.species || formData.species.length === 0) newErrors.species = 'At least one species is required';
    if (!formData.manufacturer.trim()) newErrors.manufacturer = 'Manufacturer is required';
    if (!formData.dosage.trim()) newErrors.dosage = 'Dosage is required';
    if (!formData.presentationUnit) newErrors.presentationUnit = 'Packaging type is required';
    if (!formData.quantityInStock) newErrors.quantityInStock = 'Stock quantity is required';
    else if (Number(formData.quantityInStock) <= 0) newErrors.quantityInStock = 'Quantity must be positive';
    if (!formData.contentSize) newErrors.contentSize = 'Content size is required';
    else if (Number(formData.contentSize) <= 0) newErrors.contentSize = 'Size must be positive';
    if (!formData.contentUnit) newErrors.contentUnit = 'Content unit is required';
    if (!formData.pricePerUnit) newErrors.pricePerUnit = 'Price is required';
    else if (Number(formData.pricePerUnit) < 0) newErrors.pricePerUnit = 'Price must be positive';
    if (!formData.expiryDate) newErrors.expiryDate = 'Expiry date is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const mutation = useMutation({
    mutationFn: async (data) => {
      const editId = id || location.state?.medicine?._id;
      if (isEditMode && editId) return await medicineAPI.updateMedicine(editId, data);
      return await medicineAPI.addMedicine(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['medicines']);
      setShowSuccessModal(true);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Something went wrong');
    }
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === 'species') {
      const currentSpecies = formData.species || [];
      const newSpecies = checked
        ? [...currentSpecies, value]
        : currentSpecies.filter(s => s !== value);
      setFormData(prev => ({ ...prev, species: newSpecies }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      if (name === 'medicineType') {
        setFormData(prev => ({ ...prev, unit: '', contentUnit: '' }));
      }
    }
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const medicineData = {
      medicineName: formData.medicineName.trim(),
      type: formData.medicineType,
      species: formData.species,
      description: formData.description.trim(),
      dosage: formData.dosage.trim(),
      pricePerUnit: Number(formData.pricePerUnit),
      presentationUnit: formData.presentationUnit,
      quantityInStock: Number(formData.quantityInStock),
      contentSize: Number(formData.contentSize),
      contentUnit: formData.contentUnit,
      strength: formData.strength.trim(),
      manufacturer: formData.manufacturer.trim(),
      expiryDate: formData.expiryDate
    };
    mutation.mutate(medicineData);
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    navigate('/supplier/view-medicines');
  };

  return (
    <div className="min-h-screen" style={{ background: '#f0f4f0' }}>
      <SupplierNavbar />

      {/* ── Hero Header (identical to LivestockForm) ── */}
      <div
        className="w-full py-10 px-4 text-center relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0d4a2e 0%, #1a6b40 50%, #0a3d26 100%)' }}
      >
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.03) 10px, rgba(255,255,255,0.03) 20px)' }}
        />
        <div className="relative">
          <h1 className="text-4xl font-bold text-white mb-2" style={{ fontFamily: "'Nunito', sans-serif" }}>
            {isEditMode ? 'Edit ' : 'Add New '}
            <span style={{ color: '#4ade80', fontStyle: 'italic' }}>Medicine</span>
          </h1>
          <p className="text-white/60 text-sm">
            {isEditMode ? 'Update medicine details below' : 'Fill in the details to add to your medical inventory'}
          </p>
        </div>
      </div>

      {/* ── Form Card (identical structure to LivestockForm) ── */}
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="h-1.5 w-full" style={{ background: 'linear-gradient(90deg, #1a6b40, #4ade80, #1a6b40)' }} />

          <div className="p-8">
            <form onSubmit={handleSubmit} noValidate>

              {/* Row 1: Medicine Name (full width) */}
              <div className="mb-5">
                <FormField label="Medicine Name" required icon={<MedicationIcon fontSize="small" />} error={errors.medicineName}>
                  <input
                    type="text"
                    name="medicineName"
                    value={formData.medicineName}
                    onChange={handleChange}
                    placeholder="e.g. Penicillin G"
                    disabled={mutation.isLoading}
                    className={inputClass(errors.medicineName)}
                  />
                </FormField>
              </div>

              {/* Row 2: Medicine Type + Manufacturer */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                <FormField label="Medicine Type" required icon={<CategoryIcon fontSize="small" />} error={errors.medicineType}>
                  <select
                    name="medicineType"
                    value={formData.medicineType}
                    onChange={handleChange}
                    disabled={mutation.isLoading}
                    className={inputClass(errors.medicineType) + ' appearance-none cursor-pointer'}
                  >
                    <option value="">Select Type</option>
                    <option value="Antibiotic">Antibiotic</option>
                    <option value="Vaccine">Vaccine</option>
                    <option value="Antiparasitic">Antiparasitic</option>
                    <option value="Anti-inflammatory">Anti-inflammatory</option>
                    <option value="Hormone">Hormone</option>
                    <option value="Nutritional Supplement">Nutritional Supplement</option>
                    <option value="Tranquilizer">Tranquilizer</option>
                    <option value="Anesthetic">Anesthetic</option>
                    <option value="Antiseptic">Antiseptic</option>
                    <option value="Probiotic">Probiotic</option>
                  </select>
                </FormField>

                <FormField label="Manufacturer" required icon={<BusinessIcon fontSize="small" />} error={errors.manufacturer}>
                  <input
                    type="text"
                    name="manufacturer"
                    value={formData.manufacturer}
                    onChange={handleChange}
                    placeholder="e.g. Pfizer Animal Health"
                    disabled={mutation.isLoading}
                    className={inputClass(errors.manufacturer)}
                  />
                </FormField>
              </div>

              {/* Row 3: Species (Multi-select) */}
              <div className="mb-5">
                <FormField label="Species (Target Livestock)" required icon={<CategoryIcon fontSize="small" />} error={errors.species}>
                  <div className="flex flex-wrap gap-2">
                    {[ 'Cattle', 'Poultry', 'Sheep', 'Goats', 'Swine', 'Equines', 'Camelids', 'Rabbits' ].map(species => (
                      <label
                        key={species}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer transition-all ${
                          formData.species.includes(species)
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                            : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-emerald-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          name="species"
                          value={species}
                          checked={formData.species.includes(species)}
                          onChange={handleChange}
                          className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-sm font-medium">{species}</span>
                      </label>
                    ))}
                  </div>
                </FormField>
              </div>

              {/* Row 4: Dosage + Expiry Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                <FormField label="Dosage Instructions" required icon={<ScienceIcon fontSize="small" />} error={errors.dosage}>
                  <input
                    type="text"
                    name="dosage"
                    value={formData.dosage}
                    onChange={handleChange}
                    placeholder="e.g. 5ml per 100kg, 1 tablet daily"
                    disabled={mutation.isLoading}
                    className={inputClass(errors.dosage)}
                  />
                </FormField>

                <FormField label="Expiry Date" required icon={<EventIcon fontSize="small" />} error={errors.expiryDate}>
                  <input
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleChange}
                    disabled={mutation.isLoading}
                    className={inputClass(errors.expiryDate)}
                  />
                </FormField>
              </div>

              {/* Row 5: Inventory & Packaging */}
              <div className="mb-5 p-4 rounded-2xl border-2" style={{ borderColor: '#e5e7eb' }}>
                <h3 className="text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: '#1a6b40' }}>
                  <InventoryIcon fontSize="small" />
                  Inventory & Packaging
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <FormField label="Packaging Type" required icon={<CategoryIcon fontSize="small" />} error={errors.presentationUnit}>
                    <select
                      name="presentationUnit"
                      value={formData.presentationUnit}
                      onChange={handleChange}
                      disabled={mutation.isLoading}
                      className={inputClass(errors.presentationUnit) + ' appearance-none cursor-pointer'}
                    >
                      <option value="">Select packaging</option>
                      {presentationUnits.map(unit => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </select>
                  </FormField>

                  <FormField label={`Quantity in Stock${formData.presentationUnit ? ` (${formData.presentationUnit}s)` : ''}`} 
                             required icon={<InventoryIcon fontSize="small" />} 
                             error={errors.quantityInStock}>
                    <input
                      type="number"
                      name="quantityInStock"
                      value={formData.quantityInStock}
                      onChange={handleChange}
                      placeholder="0"
                      min="1"
                      disabled={mutation.isLoading}
                      className={inputClass(errors.quantityInStock)}
                    />
                  </FormField>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                  <FormField label="Content Size" 
                             required icon={<ScaleIcon fontSize="small" />} 
                             error={errors.contentSize}>
                    <input
                      type="number"
                      name="contentSize"
                      value={formData.contentSize}
                      onChange={handleChange}
                      placeholder="e.g., 50"
                      min="1"
                      disabled={mutation.isLoading}
                      className={inputClass(errors.contentSize)}
                    />
                  </FormField>

                  <FormField label="Content Unit" required icon={<ScaleIcon fontSize="small" />} error={errors.contentUnit}>
                    <select
                      name="contentUnit"
                      value={formData.contentUnit}
                      onChange={handleChange}
                      disabled={mutation.isLoading}
                      className={inputClass(errors.contentUnit) + ' appearance-none cursor-pointer'}
                    >
                      <option value="">Select unit</option>
                      {getContentUnits(formData.medicineType).map(unit => (
                        <option key={unit} value={unit}>
                          {unit === 'ml' ? 'ml (millilitres)' : 
                           unit === 'L' ? 'L (litres)' :
                           unit === 'mg' ? 'mg (milligrams)' :
                           unit === 'g' ? 'g (grams)' :
                           unit === 'kg' ? 'kg (kilograms)' : unit}
                        </option>
                      ))}
                    </select>
                  </FormField>

                  <FormField label="Strength (Optional)" icon={<ScienceIcon fontSize="small" />}>
                    <input
                      type="text"
                      name="strength"
                      value={formData.strength}
                      onChange={handleChange}
                      placeholder="e.g., 10mg/ml"
                      disabled={mutation.isLoading}
                      className={inputClass()}
                    />
                  </FormField>
                </div>

                {totalInventory && (
                  <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                    <p className="text-sm font-semibold flex items-center gap-1.5" style={{ color: '#1a6b40' }}>
                      <InventoryIcon fontSize="small" />
                      Total Inventory: {totalInventory}
                    </p>
                  </div>
                )}
              </div>

              {/* Row 6: Price Per Unit */}
              <div className="mb-5">
                <FormField label="Price Per Unit (₹)" required icon={<AttachMoneyIcon fontSize="small" />} error={errors.pricePerUnit}>
                  <input
                    type="number"
                    name="pricePerUnit"
                    value={formData.pricePerUnit}
                    onChange={handleChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    disabled={mutation.isLoading}
                    className={inputClass(errors.pricePerUnit)}
                  />
                </FormField>
              </div>

              {/* Row 7: Description */}
              <div className="mb-8">
                <FormField label="Description" required icon={<DescriptionIcon fontSize="small" />} error={errors.description}>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Briefly describe the medicine usage, dosage instructions, and target conditions..."
                    rows={3}
                    disabled={mutation.isLoading}
                    className={inputClass(errors.description)}
                    style={{ resize: 'none' }}
                  />
                </FormField>
              </div>

              {/* Action Buttons (identical to LivestockForm) */}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={mutation.isLoading}
                  className="flex-1 py-3.5 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2 transition-all duration-200 hover:opacity-90 hover:shadow-lg active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed border-none cursor-pointer"
                  style={{ background: 'linear-gradient(135deg, #1a6b40, #0d4a2e)' }}
                >
                  {mutation.isLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : isEditMode ? (
                    <><EditNoteIcon fontSize="small" /> Update Medicine</>
                  ) : (
                    <><AddCircleIcon fontSize="small" /> Confirm & Add Medicine</>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/supplier/view-medicines')}
                  disabled={mutation.isLoading}
                  className="px-6 py-3.5 rounded-2xl font-bold text-base text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors border-none cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>

      {/* ── Success Modal (identical to LivestockForm) ── */}
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
            <h3 className="text-xl font-bold mb-2" style={{ color: '#0d4a2e', fontFamily: "'Nunito', sans-serif" }}>
              {isEditMode ? 'Updated Successfully!' : 'Successfully Added!'}
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              {isEditMode
                ? 'Medicine details have been updated.'
                : 'New medicine has been added to your inventory.'}
            </p>
            <button
              onClick={handleModalClose}
              className="w-full py-3 rounded-xl text-white font-semibold text-sm border-none cursor-pointer transition-all hover:opacity-90"
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

export default MedicineForm;