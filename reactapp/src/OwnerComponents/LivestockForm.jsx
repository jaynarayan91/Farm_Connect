import React, { useState, useEffect, useRef } from 'react';
import { useNavigate,useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getImageUrl, livestockAPI } from '../apiConfig';
import OwnerNavbar from './OwnerNavbar';

import PetsIcon from '@mui/icons-material/Pets';
import CategoryIcon from '@mui/icons-material/Category';
import CakeIcon from '@mui/icons-material/Cake';
import GradeIcon from '@mui/icons-material/Grade';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import VaccinesIcon from '@mui/icons-material/Vaccines';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import EditNoteIcon from '@mui/icons-material/EditNote';
import CloseIcon from '@mui/icons-material/Close';


const LIVESTOCK_SPECIES = ['Cattle','Poultry','Sheep','Goats','Swine','Equines','Camelids','Rabbits'];

const LivestockForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const editLivestock = location.state?.livestock;
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const [formData, setFormData] = useState({
    name: '', species: '', age: '', breed: '',
    healthCondition: '', location: '', vaccinationStatus: '', attachment: null
  });
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editLivestock) {
      setFormData({
        name: editLivestock.name, species: editLivestock.species,
        age: editLivestock.age, breed: editLivestock.breed,
        healthCondition: editLivestock.healthCondition,
        location: editLivestock.location,
        vaccinationStatus: editLivestock.vaccinationStatus, attachment: null
      });
      if (editLivestock.attachment) setImagePreview(getImageUrl(editLivestock.attachment));
    } else {
      setFormData({ name: '', species: '', age: '', breed: '', healthCondition: '', location: '', vaccinationStatus: '', attachment: null });
      setImagePreview(null);
    }
  }, [editLivestock, location.key]);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.species.trim()) newErrors.species = 'Species is required';
    if (!formData.age) newErrors.age = 'Age is required';
    else if (isNaN(formData.age) || Number(formData.age) < 0) newErrors.age = 'Age must be a valid number';
    if (!formData.breed.trim()) newErrors.breed = 'Breed is required';
    if (!formData.healthCondition.trim()) newErrors.healthCondition = 'Health condition is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.vaccinationStatus.trim()) newErrors.vaccinationStatus = 'Vaccination status is required';
    if (!editLivestock && !formData.attachment) newErrors.attachment = 'Photo is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const processFile = (file) => {
    if (!file) return;
    if (file.size > 200 * 1024) {
      setErrors({ ...errors, attachment: 'File size must be less than 50KB' });
      return;
    }
    setFormData({ ...formData, attachment: file });
    setImagePreview(URL.createObjectURL(file));
    if (errors.attachment) setErrors({ ...errors, attachment: '' });
  };

  const handleFileChange = (e) => processFile(e.target.files[0]);

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    processFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('species', formData.species.trim());
      formDataToSend.append('age', formData.age);
      formDataToSend.append('breed', formData.breed.trim());
      formDataToSend.append('healthCondition', formData.healthCondition.trim());
      formDataToSend.append('location', formData.location.trim());
      formDataToSend.append('vaccinationStatus', formData.vaccinationStatus.trim());
      if (formData.attachment instanceof File) formDataToSend.append('attachment', formData.attachment);

      let response;
      if (editLivestock) response = await livestockAPI.updateLivestock(editLivestock._id, formDataToSend);
      else response = await livestockAPI.addLivestock(formDataToSend);
      if (response.data) setShowSuccessModal(true);
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    navigate('/owner/view-livestock');
  };

  const isEditMode = Boolean(editLivestock);

  return (
    <div className="min-h-screen" style={{ background: '#f0f4f0' }}>
      <OwnerNavbar />

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
            <span style={{ color: '#4ade80', fontStyle: 'italic' }}>Livestock</span>
          </h1>
          <p className="text-white/60 text-sm">
            {isEditMode ? 'Update your livestock details below' : 'Update your digital inventory with high-quality data'}
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="h-1.5 w-full" style={{ background: 'linear-gradient(90deg, #1a6b40, #4ade80, #1a6b40)' }} />

          <div className="p-8">
            <form onSubmit={handleSubmit} noValidate>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                <FormField label="Livestock Name" required icon={<PetsIcon fontSize="small" />} error={errors.name}>
                  <input
                    type="text" name="name" value={formData.name} onChange={handleChange}
                    placeholder="e.g. Bessie the Cow" disabled={isSubmitting}
                    className={inputClass(errors.name)}
                  />
                </FormField>

                <FormField label="Species" required icon={<CategoryIcon fontSize="small" />} error={errors.species}>
                  <select
                    name="species" value={formData.species} onChange={handleChange} disabled={isSubmitting}
                    className={inputClass(errors.species)}
                  >
                    <option value="">Select species</option>
                    {LIVESTOCK_SPECIES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </FormField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                <FormField label="Breed" required icon={<GradeIcon fontSize="small" />} error={errors.breed}>
                  <input
                    type="text" name="breed" value={formData.breed} onChange={handleChange}
                    placeholder="e.g. Holstein" disabled={isSubmitting}
                    className={inputClass(errors.breed)}
                  />
                </FormField>

                <FormField label="Age (Years)" required icon={<CakeIcon fontSize="small" />} error={errors.age}>
                  <input
                    type="number" name="age" value={formData.age} onChange={handleChange}
                    placeholder="0" min="0" disabled={isSubmitting}
                    className={inputClass(errors.age)}
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                <FormField label="Health Condition" required icon={<FavoriteIcon fontSize="small" />} error={errors.healthCondition}>
                  <input
                    type="text" name="healthCondition" value={formData.healthCondition} onChange={handleChange}
                    placeholder="e.g. Excellent / Healthy" disabled={isSubmitting}
                    className={inputClass(errors.healthCondition)}
                  />
                </FormField>

                <FormField label="Location" required icon={<LocationOnIcon fontSize="small" />} error={errors.location}>
                  <input
                    type="text" name="location" value={formData.location} onChange={handleChange}
                    placeholder="e.g. Farm Sector A" disabled={isSubmitting}
                    className={inputClass(errors.location)}
                  />
                </FormField>
              </div>

              <div className="mb-5">
                <FormField label="Vaccination Status" required icon={<VaccinesIcon fontSize="small" />} error={errors.vaccinationStatus}>
                  <input
                    type="text" name="vaccinationStatus" value={formData.vaccinationStatus} onChange={handleChange}
                    placeholder="e.g. Fully Vaccinated (FMD, Anthrax)" disabled={isSubmitting}
                    className={inputClass(errors.vaccinationStatus)}
                  />
                </FormField>
              </div>

              <div className="mb-8">
                <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: '#1a6b40' }}>
                  <CloudUploadIcon fontSize="small" style={{ color: '#1a6b40' }} />
                  Attachment / Photo
                  <span className="text-red-500 ml-0.5">*</span>
                </label>

                <div
                  onClick={() => !isSubmitting && fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`relative w-full rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer overflow-hidden
                    ${isDragging ? 'border-green-400 bg-green-50' : errors.attachment ? 'border-red-300 bg-red-50/30' : 'border-gray-200 bg-gray-50 hover:border-green-400 hover:bg-green-50/30'}`}
                  style={{ minHeight: 160 }}
                >
                  {imagePreview ? (
                    <div className="relative w-full h-48">
                      <img
                        src={imagePreview} alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <span className="text-white text-xs font-semibold bg-black/50 px-3 py-1.5 rounded-full">
                          Click to change photo
                        </span>
                      </div>
                      {!isSubmitting && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setImagePreview(null);
                            setFormData(f => ({ ...f, attachment: null }));
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          className="absolute top-2 right-2 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center border-none cursor-pointer shadow-lg transition-colors"
                        >
                          <CloseIcon style={{ fontSize: 14 }} />
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 shadow-sm"
                        style={{ background: isDragging ? 'rgba(26,107,64,0.15)' : 'rgba(26,107,64,0.08)' }}
                      >
                        <CloudUploadIcon style={{ color: '#1a6b40', fontSize: 28 }} />
                      </div>
                      <p className="text-gray-700 font-semibold text-sm mb-1">
                        {isDragging ? 'Drop your image here' : 'Click to upload or drag & drop'}
                      </p>
                      <p className="text-gray-400 text-xs">PNG, JPG or JPEG · Max size 50KB</p>
                    </div>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={isSubmitting}
                  className="hidden"
                />

                {errors.attachment && (
                  <span className="text-xs font-medium mt-1 block" style={{ color: '#ef4444' }}>⚠ {errors.attachment}</span>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3.5 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2 transition-all duration-200 hover:opacity-90 hover:shadow-lg active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed border-none cursor-pointer"
                  style={{ background: 'linear-gradient(135deg, #1a6b40, #0d4a2e)' }}
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : isEditMode ? (
                    <><EditNoteIcon fontSize="small" /> Update Livestock</>
                  ) : (
                    <><AddCircleIcon fontSize="small" /> Confirm & Add Livestock</>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/owner/view-livestock')}
                  disabled={isSubmitting}
                  className="px-6 py-3.5 rounded-2xl font-bold text-base text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors border-none cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>

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
                ? 'Your livestock details have been updated.'
                : 'New livestock has been added to your inventory.'}
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

export default LivestockForm;