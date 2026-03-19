const express = require("express");
const router = express.Router();
const Review = require("../models/Review");
const Provider = require("../models/Provider");
const Booking = require("../models/Booking");
const { protect, authorize } = require("../middleware/auth");

router.post("/", protect, authorize("customer"), async (req, res) => {
  try {
    const { bookingId, customerRating, customerComment } = req.body;
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found." });
    if (booking.status !== "completed") return res.status(400).json({ success: false, message: "Can only review completed bookings." });
    if (booking.reviewed) return res.status(400).json({ success: false, message: "Already reviewed." });

    const suspiciousWords = ["fake", "spam", "worst", "scam"];
    const isFlagged = suspiciousWords.some(w => customerComment?.toLowerCase().includes(w));

    const review = await Review.create({
      booking: bookingId,
      customer: req.user._id,
      provider: booking.provider,
      customerRating, customerComment,
      isModerated: true, isFlagged,
    });

    const allReviews = await Review.find({ provider: booking.provider });
    const avgRating = allReviews.reduce((sum, r) => sum + r.customerRating, 0) / allReviews.length;
    await Provider.findByIdAndUpdate(booking.provider, {
      rating: Math.round(avgRating * 10) / 10,
      totalReviews: allReviews.length,
    });

    booking.reviewed = true;
    await booking.save();

    res.status(201).json({ success: true, message: "Review submitted!", review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put("/:id/worker", protect, authorize("worker"), async (req, res) => {
  try {
    const { workerRating, workerComment } = req.body;
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { workerRating, workerComment },
      { new: true }
    );
    res.json({ success: true, message: "Worker review submitted!", review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/provider/:id", async (req, res) => {
  try {
    const reviews = await Review.find({ provider: req.params.id, isFlagged: false })
      .populate("customer", "name avatar")
      .sort({ createdAt: -1 });
    res.json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
```

---

### GitHub pe karo:

**"Add file"** → **"Create new file"** → Name mein likho:
```
routes/reviews.js
