const mongoose = require("mongoose");

const ProviderSchema = new mongoose.Schema(
  {
    user:            { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name:            { type: String, required: true },
    phone:           { type: String, required: true },
    serviceCategory: {
      type: String,
      enum: ["Plumbing", "Electrical", "Carpentry", "AC Repair", "Cleaning", "Painting", "Appliance", "Security"],
      required: true,
    },
    skills:          [{ type: String }],
    experience:      { type: Number, required: true },
    bio:             { type: String },
    pricePerService: { type: Number, required: true },
    location: {
      type:        { type: String, default: "Point" },
      coordinates: { type: [Number], default: [0, 0] },
      address:     { type: String },
    },
    isVerified:         { type: Boolean, default: false },
    policeVerified:     { type: Boolean, default: false },
    skillTestPassed:    { type: Boolean, default: false },
    certificateUrl:     { type: String },
    demoVideoUrl:       { type: String },
    aadhaarVerified:    { type: Boolean, default: false },
    rating:             { type: Number, default: 0 },
    totalReviews:       { type: Number, default: 0 },
    punctualityScore:   { type: Number, default: 100 },
    completedJobs:      { type: Number, default: 0 },
    cancelledJobs:      { type: Number, default: 0 },
    cancellationPenalty:{ type: Number, default: 0 },
    rankScore:          { type: Number, default: 50 },
    isPriority:         { type: Boolean, default: false },
    isAvailable:        { type: Boolean, default: true },
    isOnline:           { type: Boolean, default: false },
    approvalStatus:     { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    rejectionReason:    { type: String },
    totalEarnings:      { type: Number, default: 0 },
    monthlyEarnings:    { type: Number, default: 0 },
    walletBalance:      { type: Number, default: 0 },
  },
  { timestamps: true }
);

ProviderSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Provider", ProviderSchema);
```

---

### GitHub pe karo:

**"Add file"** → **"Create new file"** → Name mein likho:
```
models/Provider.js
