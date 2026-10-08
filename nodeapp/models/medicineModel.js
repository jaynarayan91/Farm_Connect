const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  medicineName: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    trim: true
  },
  species: {
    type: [String],
    required: true,
    default: []
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  dosage: {
    type: String,
    required: true,
    trim: true
  },
  pricePerUnit: {
    type: Number,
    required: true,
    min: 0
  },
  presentationUnit: {
    type: String,
    required: true,
    trim: true
  },
  quantityInStock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  contentSize: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  contentUnit: {
    type: String,
    required: true,
    trim: true
  },
  strength: {
    type: String,
    trim: true
  },
  manufacturer: {
    type: String,
    required: true,
    trim: true
  },
  expiryDate: {
    type: Date,
    required: true
  },
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Medicine', medicineSchema);