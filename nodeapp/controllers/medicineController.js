const Medicine = require('../models/medicineModel');

async function getAllMedicine(req, res) {
  try {
    let query = Medicine.find({});
    
    if (typeof query.populate === 'function') {
      query = query.populate('supplierId', 'userName email');
    }
    
    const medicines = await query;
    return res.status(200).json(medicines);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

async function getMedicineById(req, res) {
  try {
    const { id } = req.params;
    let query = Medicine.findById(id);
    
    if (typeof query.populate === 'function') {
      query = query.populate('supplierId', 'userName email');
    }
    
    const medicine = await query;
    
    if (!medicine) {
      return res.status(404).json({ message: `Cannot find any medicine with ID ${id}` });
    }
    
    return res.status(200).json(medicine);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

async function addMedicine(req, res) {
  try {
    const medicineData = { ...req.body };
    
    if (req.user?.userId) {
      medicineData.supplierId = req.user.userId;
    }
    
    if (req.file) {
      medicineData.attachment = `/uploads/medicine/${req.file.filename}`;
    }

    const medicine = await Medicine.create(medicineData);

    return res.status(200).json({ 
      message: 'Medicine Added Successfully', 
      medicine 
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}


  // 4. Update Medicine
  async function updateMedicine(req, res) {
    try {
      const { id } = req.params;
      
      // Extracting fields from req.body based on your specific Medicine Model
      const { 
        medicineName, 
        type, 
        species,
        description, 
        dosage, 
        pricePerUnit, 
        presentationUnit,
        quantityInStock,
        contentSize,
        contentUnit,
        strength,
        manufacturer, 
        expiryDate 
      } = req.body;
      
      const updateData = {
        medicineName,
        type,
        species,
        description,
        dosage,
        pricePerUnit,
        presentationUnit,
        quantityInStock,
        contentSize,
        contentUnit,
        strength,
        manufacturer,
        expiryDate
      };
      
      // Handle file upload if present
      if (req.file) {
        updateData.attachment = `/uploads/medicine/${req.file.filename}`;
      }

      const medicine = await Medicine.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true
      });

      if (!medicine) {
        return res.status(404).json({ message: `Cannot find any medicine with ID ${id}` });
      }

      return res.status(200).json({ message: 'Medicine Updated Successfully', medicine });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

// 5. Delete Medicine
async function deleteMedicine(req, res) {
  try {
    const { id } = req.params;
    const medicine = await Medicine.findByIdAndDelete(id);

    if (!medicine) {
      return res.status(404).json({ message: `Cannot find any medicine with ID ${id}` });
    }

    return res.status(200).json({ message: 'Medicine Deleted Successfully' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

// 6. Get Medicine By Owner (Supplier) ID
async function getMedicineByOwnerId(req, res) {
  try {
    // Uses the ID of the logged-in user from the token
    const ownerId = req.user.userId;
    
    // In your model, the reference field is 'supplierId'
    let query = Medicine.find({ supplierId: ownerId });
    
    if (typeof query.populate === 'function') {
      query = query.populate('supplierId', 'userName email');
    }
    
    const medicines = await query;
    return res.status(200).json(medicines);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

// Updated Exports
module.exports = {
  getAllMedicine,
  getMedicineById,
  addMedicine,
  updateMedicine,
  deleteMedicine,
  getMedicineByOwnerId
};