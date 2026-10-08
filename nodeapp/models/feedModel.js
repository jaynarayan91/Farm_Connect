const mongoose = require('mongoose');

const feedSchema = new mongoose.Schema({
  feedName: {
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
  unit: {
    type: String,
    required: true,
    trim: true
  },
  pricePerUnit: {
    type: Number,
    required: true,
    min: 0
  },
  availableUnits: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required:true
  }
}, { timestamps: true });

module.exports = mongoose.model('Feed', feedSchema);