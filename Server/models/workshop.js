const mongoose = require("mongoose");

const workshopSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
    },
    description: {
      type: String,
    },
    services: [
      {
        title: { type: String, required: true },
        price: { type: Number, required: true },
        duration: { type: Number, required: true }, // in minutes
      },
    ],

    // Weekly recurring availability (default)
    weeklyAvailability: [
      {
        day: { type: String, required: true }, // e.g., "Monday"
        start: { type: String, required: true }, // "08:00"
        end: { type: String, required: true },
        slotDuration: { type: Number, default: 30 }, // slot duration in minutes
      },
    ],

    // Custom availability overrides (for specific dates)
    customAvailability: [
      {
        date: { type: String, required: true }, // format "YYYY-MM-DD"
        start: { type: String }, // optional if closed
        end: { type: String },   // optional if closed
        isAvailable: { type: Boolean, required: true }, // true = available, false = closed
      },
    ],

    images: [
      {
        type: String, // URL or local path
      },
    ],

    averageRating: {
      type: Number,
      default: 0,
    },
    reviews: [{ name: String, rating: Number, comment: String ,    date: { type: Date, default: Date.now }
    }]

  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Workshop || mongoose.model("Workshop", workshopSchema);
