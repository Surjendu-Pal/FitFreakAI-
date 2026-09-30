// models/CycleEntry.js
const mongoose = require('mongoose');

const cycleEntrySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
    },
  },
  { timestamps: true }
);

cycleEntrySchema.index({ user: 1, startDate: -1 });

module.exports = mongoose.model('CycleEntry', cycleEntrySchema);
