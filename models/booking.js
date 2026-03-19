const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema(
  {
    customer:           { type: mongoose.Schema.Types.ObjectId, ref: "User",     required: true },
    provider:           { type: mongoose.Schema.Types.ObjectId, ref: "Provider", required: true },
    serviceCategory:    { type: String, required: true },
    problemDescription: { type: String, required: true },
    address:            { type: String, required: true },
    location: {
      type:        { type: String, default: "Point" },
      coordinates: { type: [Number] },
    },
    scheduledDate:     { type: Date,   required: true },
    scheduledTime:     { type: String, required: true },
    actualArrivalTime: { type: Date },
    completedAt:       { type: Date },
    otp:               { type: String },
    otpVerified:       { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["pending", "accepted", "on_the_way", "arrived", "in_progress", "completed", "cancelled"],
      default: "pending",
    },
    cancelledBy:        { type: String, enum: ["customer", "worker", "admin"] },
    cancellationReason: { type: String },
    cancellationTime:   { type: Date },
    basePrice:      { type: Number, required: true },
    platformFee:    { type: Number, default: 50 },
    gst:            { type: Number },
    totalAmount:    { type: Number },
    priceBreakdown: [{ label: String, amount: Number }],
    paymentMethod:  { type: String, enum: ["upi", "cash", "wallet", "pay_after"], default: "upi" },
    paymentStatus:  { type: String, enum: ["pending", "paid", "refunded", "failed"], default: "pending" },
    paymentId:      { type: String },
    workerLateMinutes: { type: Number, default: 0 },
    penaltyApplied:    { type: Number, default: 0 },
    sosTriggered:      { type: Boolean, default: false },
    sosTime:           { type: Date },
    reviewed:          { type: Boolean, default: false },
  },
  { timestamps: true }
);

BookingSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Booking", BookingSchema);
```

---

### GitHub pe karo:

**"Add file"** → **"Create new file"** → Name mein likho:
```
models/Booking.js
