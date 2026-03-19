const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema(
  {
    booking:  { type: mongoose.Schema.Types.ObjectId, ref: "Booking",  required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User",     required: true },
    provider: { type: mongoose.Schema.Types.ObjectId, ref: "Provider", required: true },
    customerRating:  { type: Number, min: 1, max: 5, required: true },
    workerRating:    { type: Number, min: 1, max: 5 },
    customerComment: { type: String },
    workerComment:   { type: String },
    isModerated:     { type: Boolean, default: false },
    isFlagged:       { type: Boolean, default: false },
    flagReason:      { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Review", ReviewSchema);
```

---

### GitHub pe karo:

**"Add file"** → **"Create new file"** → Name mein likho:
```
models/Review.js
