const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  requestId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Request', required: true },
  itemName:    { type: String, required: true },
  itemType:    { type: String },
  livestock:   { type: String },
  title:       { type: String, required: true },
  description: { type: String },
  rating:      { type: Number, min: 1, max: 5, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
