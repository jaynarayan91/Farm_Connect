const express = require('express');
const { authorizeRoles, validateToken } = require('../authUtils');
const { 
  addMedicine, 
  deleteMedicine, 
  getAllMedicine, 
  getMedicineById, 
  updateMedicine, 
  getMedicineByOwnerId 
} = require('../controllers/medicineController');
const upload = require('../middleware/upload');

const router = express.Router();

// Changed 'Owner' to 'Supplier' because this is for the Supplier's dashboard
router.get('/medicine/getAllMedicine', validateToken, authorizeRoles('Supplier', 'Owner'), getAllMedicine);
router.get('/medicine/getMedicineById/:id', validateToken, authorizeRoles('Supplier', 'Owner'), getMedicineById);

// This is the specific route called by ViewMedicine.jsx
router.get('/medicine/owner/all', validateToken, authorizeRoles('Supplier', 'Owner'), getMedicineByOwnerId);

router.post('/medicine/addMedicine', validateToken, authorizeRoles('Supplier'), upload.single('attachment'), addMedicine);
router.put('/medicine/updateMedicine/:id', validateToken, authorizeRoles('Supplier'), upload.single('attachment'), updateMedicine);
router.delete('/medicine/deleteMedicine/:id', validateToken, authorizeRoles('Supplier'), deleteMedicine);

module.exports = router;